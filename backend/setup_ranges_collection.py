#!/usr/bin/env python3
"""
Geocode gun range addresses using Nominatim API and store coordinates in MongoDB.
Enriches ranges with latitude, longitude, and GeoJSON Point for location-based queries.
"""

import os
import asyncio
import httpx
import ssl
import certifi
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'shootlocal_dmv')

# Configure SSL context with certifi
ssl_context = ssl.create_default_context(cafile=certifi.where())
client = AsyncIOMotorClient(MONGO_URL, tls=True, tlsCAFile=certifi.where())
db = client[DB_NAME]


async def geocode_address(address: str, city: str, state: str, zip_code: str) -> dict | None:
    """
    Geocode an address using Nominatim API.
    Returns {'latitude': float, 'longitude': float, 'geo': GeoJSON Point} or None
    """
    async with httpx.AsyncClient() as client_http:
        # Try full address first
        query = f"{address}, {city}, {state} {zip_code}"
        
        try:
            resp = await client_http.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": query, "format": "json"},
                timeout=10.0,
                headers={"User-Agent": "ShootLocalDMV/1.0"}
            )
            resp.raise_for_status()
            results = resp.json()
            
            if results:
                lat = float(results[0]["lat"])
                lon = float(results[0]["lon"])
                return {
                    "latitude": lat,
                    "longitude": lon,
                    "geo": {"type": "Point", "coordinates": [lon, lat]}  # GeoJSON: [lon, lat]
                }
        except Exception as e:
            print(f"  Full address failed: {e}")
        
        # Fallback to city/state
        try:
            fallback_query = f"{city}, {state}"
            resp = await client_http.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": fallback_query, "format": "json"},
                timeout=10.0,
                headers={"User-Agent": "ShootLocalDMV/1.0"}
            )
            resp.raise_for_status()
            results = resp.json()
            
            if results:
                lat = float(results[0]["lat"])
                lon = float(results[0]["lon"])
                return {
                    "latitude": lat,
                    "longitude": lon,
                    "geo": {"type": "Point", "coordinates": [lon, lat]}
                }
        except Exception as e:
            print(f"  Fallback query failed: {e}")
        
        return None


async def geocode_ranges():
    """Fetch ranges missing coordinates and geocode them."""
    ranges_collection = db.ranges
    
    # Find ranges without coordinates
    cursor = ranges_collection.find({
        "$or": [
            {"location.latitude": {"$exists": False}},
            {"location.longitude": {"$exists": False}},
            {"location.geo": {"$exists": False}}
        ]
    })
    
    ranges_to_update = await cursor.to_list(length=None)
    
    if not ranges_to_update:
        print("✓ All ranges already have coordinates. No updates needed.")
        return
    
    print(f"Found {len(ranges_to_update)} ranges missing coordinates. Geocoding...")
    
    success_count = 0
    failed_ranges = []
    
    for i, range_doc in enumerate(ranges_to_update, 1):
        range_id = range_doc.get("id")
        location = range_doc.get("location", {})
        
        address = location.get("address", "")
        city = location.get("city", "")
        state = location.get("state", "")
        zip_code = location.get("zip_code", "")
        
        print(f"[{i}/{len(ranges_to_update)}] Geocoding {range_id}: {address}, {city}, {state} {zip_code}")
        
        coords = await geocode_address(address, city, state, zip_code)
        
        if coords:
            await ranges_collection.update_one(
                {"id": range_id},
                {"$set": {"location.latitude": coords["latitude"], 
                          "location.longitude": coords["longitude"],
                          "location.geo": coords["geo"]}}
            )
            print(f"  ✓ Geocoded: ({coords['latitude']}, {coords['longitude']})")
            success_count += 1
        else:
            print(f"  ✗ Failed to geocode")
            failed_ranges.append(range_id)
        
        # Rate limit: Nominatim requires 1 req/sec
        await asyncio.sleep(1.1)
    
    print(f"\n=== Summary ===")
    print(f"✓ Successfully geocoded: {success_count}/{len(ranges_to_update)}")
    if failed_ranges:
        print(f"✗ Failed: {len(failed_ranges)}")
        for range_id in failed_ranges:
            print(f"  - {range_id}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(geocode_ranges())
