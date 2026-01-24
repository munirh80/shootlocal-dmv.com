#!/usr/bin/env python3
"""
Geocoding script to add latitude/longitude coordinates to all ranges.
Uses a free geocoding service (Nominatim/OpenStreetMap).
"""

import os
import asyncio
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Nominatim geocoding endpoint (free, no API key required)
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

async def geocode_address(address: str, city: str, state: str, zip_code: str) -> tuple:
    """Geocode an address using Nominatim."""
    full_address = f"{address}, {city}, {state} {zip_code}, USA"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                NOMINATIM_URL,
                params={
                    "q": full_address,
                    "format": "json",
                    "limit": 1,
                    "countrycodes": "us"
                },
                headers={
                    "User-Agent": "DMVGunRange/1.0 (contact@dmvgunrange.com)"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    lat = float(data[0]["lat"])
                    lon = float(data[0]["lon"])
                    return (lat, lon)
            
            # Try with just city and state if full address fails
            response = await client.get(
                NOMINATIM_URL,
                params={
                    "q": f"{city}, {state}, USA",
                    "format": "json",
                    "limit": 1,
                    "countrycodes": "us"
                },
                headers={
                    "User-Agent": "DMVGunRange/1.0 (contact@dmvgunrange.com)"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    lat = float(data[0]["lat"])
                    lon = float(data[0]["lon"])
                    return (lat, lon)
                    
        except Exception as e:
            print(f"Error geocoding {full_address}: {e}")
    
    return (None, None)

async def geocode_all_ranges():
    """Geocode all ranges that don't have coordinates."""
    # Find ranges without coordinates
    ranges = await db.ranges.find({
        "$or": [
            {"location.latitude": None},
            {"location.longitude": None},
            {"location.latitude": {"$exists": False}},
            {"location.longitude": {"$exists": False}}
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
        
        if lat and lon:
            await db.ranges.update_one(
                {"_id": range_doc["_id"]},
                {"$set": {
                    "location.latitude": lat,
                    "location.longitude": lon
                }}
            )
            print(f"  ✓ Found: {lat}, {lon}")
            geocoded_count += 1
        else:
            print(f"  ✗ Could not geocode")
            failed_count += 1
        
        # Rate limiting - Nominatim requires 1 request per second
        await asyncio.sleep(1.1)
    
    print(f"\n=== Geocoding Summary ===")
    print(f"Successfully geocoded: {geocoded_count}")
    print(f"Failed: {failed_count}")
    print(f"=========================")

if __name__ == "__main__":
    asyncio.run(geocode_all_ranges())
