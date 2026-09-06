#!/usr/bin/env python3
"""
Geocoding script to add latitude/longitude coordinates to all ranges.
Uses a free geocoding service (Nominatim/OpenStreetMap).

Writes both:
  - location.latitude / location.longitude (plain floats, human-readable)
  - location.geo (GeoJSON Point, required for $near / $geoNear queries)
"""

import os
import asyncio
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Nominatim geocoding endpoint (free, no API key required)
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


async def _query_nominatim(http_client: httpx.AsyncClient, query: str) -> tuple:
    """Single Nominatim lookup. Returns (lat, lon) or (None, None)."""
    try:
        response = await http_client.get(
            NOMINATIM_URL,
            params={
                "q": query,
                "format": "json",
                "limit": 1,
                "countrycodes": "us"
            },
            headers={
                "User-Agent": "DMVGunRange/1.0 (munirgh@gmail.com)"
            },
            timeout=10.0
        )
        if response.status_code == 200:
            data = response.json()
            if data:
                return (float(data[0]["lat"]), float(data[0]["lon"]))
        elif response.status_code == 429:
            print("  Rate limited by Nominatim — backing off 5s")
            await asyncio.sleep(5)
    except Exception as e:
        print(f"  Error geocoding '{query}': {e}")
    return (None, None)


async def geocode_address(address: str, city: str, state: str, zip_code: str) -> tuple:
    """Geocode an address using Nominatim, falling back to city/state if the full address fails."""
    async with httpx.AsyncClient() as http_client:
        full_address = f"{address}, {city}, {state} {zip_code}, USA"
        lat, lon = await _query_nominatim(http_client, full_address)
        if lat is not None and lon is not None:
            return (lat, lon)

        # Fall back to city/state only
        await asyncio.sleep(1.1)  # still one request per second even across the fallback call
        return await _query_nominatim(http_client, f"{city}, {state}, USA")


async def geocode_all_ranges():
    """Geocode all ranges that don't have coordinates."""
    ranges = await db.ranges.find({
        "$or": [
            {"location.latitude": None},
            {"location.longitude": None},
            {"location.latitude": {"$exists": False}},
            {"location.longitude": {"$exists": False}},
            {"location.geo": {"$exists": False}}
        ]
    }).to_list(length=None)

    print(f"Found {len(ranges)} ranges to geocode")

    geocoded_count = 0
    failed_count = 0

    for i, range_doc in enumerate(ranges):
        location = range_doc.get("location", {})
        address = location.get("address", "")
        city = location.get("city", "")
        state = location.get("state", "")
        zip_code = location.get("zip_code", "")

        print(f"[{i+1}/{len(ranges)}] Geocoding: {range_doc.get('name', 'Unknown')}")

        lat, lon = await geocode_address(address, city, state, zip_code)

        if lat is not None and lon is not None:
            await db.ranges.update_one(
                {"_id": range_doc["_id"]},
                {"$set": {
                    "location.latitude": lat,
                    "location.longitude": lon,
                    # GeoJSON order is [longitude, latitude] — reversed from the plain fields above
                    "location.geo": {"type": "Point", "coordinates": [lon, lat]}
                }}
            )
            print(f"  \u2713 Found: {lat}, {lon}")
            geocoded_count += 1
        else:
            print(f"  \u2717 Could not geocode")
            failed_count += 1

        # Rate limiting - Nominatim requires 1 request per second
        await asyncio.sleep(1.1)

    print(f"\n=== Geocoding Summary ===")
    print(f"Successfully geocoded: {geocoded_count}")
    print(f"Failed: {failed_count}")
    print(f"=========================")

    client.close()


if __name__ == "__main__":
    asyncio.run(geocode_all_ranges())
