#!/usr/bin/env python3
"""
Seed script to populate the database with sample shooting range data for VA and MD
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Sample shooting range data for Virginia and Maryland
sample_ranges = [
    {
        "id": "range-001",
        "name": "Blue Ridge Arsenal",
        "description": "Virginia's premier indoor shooting facility featuring state-of-the-art lanes, professional instruction, and a full-service pro shop.",
        "phone": "(540) 555-0101",
        "website": "https://blueridgearsenal.com",
        "email": "info@blueridgearsenal.com",
        "location": {
            "address": "123 Gun Range Rd",
            "city": "Chantilly",
            "state": "VA",
            "zip_code": "20151",
            "latitude": 38.8874,
            "longitude": -77.4246
        },
        "hours": {
            "monday": "10:00 AM - 8:00 PM",
            "tuesday": "10:00 AM - 8:00 PM",
            "wednesday": "10:00 AM - 8:00 PM",
            "thursday": "10:00 AM - 8:00 PM",
            "friday": "10:00 AM - 9:00 PM",
            "saturday": "9:00 AM - 9:00 PM",
            "sunday": "10:00 AM - 6:00 PM"
        },
        "amenities": {
            "indoor": True,
            "outdoor": False,
            "pistol_50ft": True,
            "pistol_75ft": True,
            "pistol_25yd": True,
            "rifle_smallbore": True,
            "handgun": True,
            "rifle": True,
            "equipment_rentals": True,
            "instruction": True,
            "retail_store": True,
            "youth_programs": True,
            "womens_programs": True,
            "concealed_carry_classes": True,
            "basic_firearm_training": True,
            "advanced_training": True,
            "uspsa": True,
            "idpa": True,
            "precision_pistol": True,
            "climate_controlled": True,
            "bulletproof_barriers": True,
            "ada_accessible": True,
            "public_access": True
        },
        "pricing": {
            "day_pass": 25.0,
            "hourly_rate": 20.0,
            "monthly_membership": 99.0,
            "annual_membership": 990.0,
            "notes": "Military and law enforcement discounts available"
        },
        "photos": [
            "https://images.unsplash.com/photo-1761144530756-47ecd564f8ef"
        ],
        "google_rating": 4.5,
        "google_reviews": 127,
        "google_maps_url": "https://maps.google.com",
        "nssf_member": True,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "range-002",
        "name": "Quantico Shooting Club",
        "description": "Historic outdoor shooting facility with multiple rifle and pistol ranges, serving the Northern Virginia area since 1956.",
        "phone": "(703) 555-0202",
        "website": "https://quanticoshootingclub.org",
        "location": {
            "address": "9643 Dumfries Rd",
            "city": "Quantico",
            "state": "VA",
            "zip_code": "22134",
            "latitude": 38.5207,
            "longitude": -77.2975
        },
        "hours": {
            "wednesday": "6:00 PM - 9:00 PM",
            "saturday": "9:00 AM - 5:00 PM",
            "sunday": "9:00 AM - 5:00 PM"
        },
        "amenities": {
            "indoor": False,
            "outdoor": True,
            "pistol_25yd": True,
            "pistol_50yd": True,
            "rifle_smallbore": True,
            "rifle_centerfire": True,
            "rifle_100yd": True,
            "rifle_200yd": True,
            "rifle_300yd": True,
            "handgun": True,
            "rifle": True,
            "instruction": True,
            "hunter_education": True,
            "precision_pistol": True,
            "smallbore_competition": True,
            "centerfire_competition": True,
            "members_only": True,
            "public_access": False,
            "clubhouse": True
        },
        "pricing": {
            "annual_membership": 250.0,
            "notes": "Membership required. NRA membership also required."
        },
        "google_rating": 4.3,
        "google_reviews": 43,
        "nssf_member": True,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "range-003",
        "name": "Elite Shooting Sports",
        "description": "Maryland's largest indoor shooting facility with 20 lanes, full gunsmith services, and comprehensive training programs.",
        "phone": "(301) 555-0303",
        "website": "https://eliteshootingsports.com",
        "email": "contact@eliteshootingsports.com",
        "location": {
            "address": "9801 Washingtonian Blvd",
            "city": "Gaithersburg",
            "state": "MD",
            "zip_code": "20878",
            "latitude": 39.1412,
            "longitude": -77.2011
        },
        "hours": {
            "monday": "10:00 AM - 9:00 PM",
            "tuesday": "10:00 AM - 9:00 PM",
            "wednesday": "10:00 AM - 9:00 PM",
            "thursday": "10:00 AM - 9:00 PM",
            "friday": "10:00 AM - 10:00 PM",
            "saturday": "9:00 AM - 10:00 PM",
            "sunday": "10:00 AM - 8:00 PM"
        },
        "amenities": {
            "indoor": True,
            "outdoor": False,
            "pistol_50ft": True,
            "pistol_75ft": True,
            "pistol_25yd": True,
            "rifle_smallbore": True,
            "rifle_100yd": True,
            "handgun": True,
            "rifle": True,
            "shotgun": False,
            "equipment_rentals": True,
            "instruction": True,
            "retail_store": True,
            "youth_programs": True,
            "womens_programs": True,
            "concealed_carry_classes": True,
            "basic_firearm_training": True,
            "advanced_training": True,
            "uspsa": True,
            "idpa": True,
            "three_gun": False,
            "climate_controlled": True,
            "bulletproof_barriers": True,
            "ada_accessible": True,
            "public_access": True,
            "food_service": True
        },
        "pricing": {
            "day_pass": 28.0,
            "hourly_rate": 22.0,
            "monthly_membership": 120.0,
            "annual_membership": 1200.0,
            "notes": "First-time shooters get free basic safety orientation"
        },
        "google_rating": 4.7,
        "google_reviews": 234,
        "nssf_member": True,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "range-004",
        "name": "Sharpshooters Small Arms Range",
        "description": "Family-owned indoor range in Virginia Beach, specializing in pistol and rifle training with a focus on marksmanship excellence.",
        "phone": "(757) 555-0404",
        "website": "https://sharpshootersrange.com",
        "location": {
            "address": "1456 General Booth Blvd",
            "city": "Virginia Beach",
            "state": "VA",
            "zip_code": "23454",
            "latitude": 36.7793,
            "longitude": -76.0951
        },
        "hours": {
            "monday": "Closed",
            "tuesday": "10:00 AM - 8:00 PM",
            "wednesday": "10:00 AM - 8:00 PM",
            "thursday": "10:00 AM - 8:00 PM",
            "friday": "10:00 AM - 8:00 PM",
            "saturday": "9:00 AM - 8:00 PM",
            "sunday": "11:00 AM - 6:00 PM"
        },
        "amenities": {
            "indoor": True,
            "outdoor": False,
            "pistol_50ft": True,
            "pistol_25yd": True,
            "rifle_smallbore": True,
            "handgun": True,
            "rifle": True,
            "equipment_rentals": True,
            "instruction": True,
            "retail_store": True,
            "concealed_carry_classes": True,
            "basic_firearm_training": True,
            "precision_pistol": True,
            "climate_controlled": True,
            "bulletproof_barriers": True,
            "public_access": True
        },
        "pricing": {
            "day_pass": 20.0,
            "hourly_rate": 15.0,
            "notes": "Senior citizen and military discounts available"
        },
        "google_rating": 4.2,
        "google_reviews": 89,
        "nssf_member": False,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "range-005",
        "name": "Associated Gun Clubs of Baltimore",
        "description": "Premier outdoor shooting facility featuring trap, skeet, sporting clays, and multiple rifle ranges on 200 acres.",
        "phone": "(410) 555-0505",
        "website": "https://agcofbaltimore.com",
        "location": {
            "address": "8335 Honeygo Blvd",
            "city": "Baltimore",
            "state": "MD",
            "zip_code": "21236",
            "latitude": 39.4129,
            "longitude": -76.4951
        },
        "hours": {
            "tuesday": "10:00 AM - 8:00 PM",
            "wednesday": "10:00 AM - 8:00 PM",
            "thursday": "10:00 AM - 8:00 PM",
            "friday": "10:00 AM - 8:00 PM",
            "saturday": "9:00 AM - 6:00 PM",
            "sunday": "9:00 AM - 6:00 PM"
        },
        "amenities": {
            "indoor": False,
            "outdoor": True,
            "pistol_25yd": True,
            "pistol_50yd": True,
            "rifle_smallbore": True,
            "rifle_centerfire": True,
            "rifle_100yd": True,
            "rifle_200yd": True,
            "rifle_300yd": True,
            "rifle_500yd": True,
            "handgun": True,
            "rifle": True,
            "shotgun": True,
            "trap": True,
            "skeet": True,
            "sporting_clays": True,
            "five_stand": True,
            "archery": True,
            "instruction": True,
            "hunter_education": True,
            "youth_programs": True,
            "precision_pistol": True,
            "smallbore_competition": True,
            "centerfire_competition": True,
            "trap": True,
            "skeet": True,
            "sporting_clays": True,
            "clubhouse": True,
            "picnic_area": True,
            "public_access": True
        },
        "pricing": {
            "day_pass": 15.0,
            "annual_membership": 300.0,
            "notes": "Trap and skeet additional fees apply"
        },
        "google_rating": 4.4,
        "google_reviews": 156,
        "nssf_member": True,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "range-006",
        "name": "Richmond Indoor Range",
        "description": "Downtown Richmond's only indoor shooting facility, offering convenient access to quality firearms training and practice.",
        "phone": "(804) 555-0606",
        "website": "https://richmondindoorrange.com",
        "location": {
            "address": "2001 W Broad St",
            "city": "Richmond",
            "state": "VA",
            "zip_code": "23220",
            "latitude": 37.5630,
            "longitude": -77.4813
        },
        "hours": {
            "monday": "10:00 AM - 8:00 PM",
            "tuesday": "10:00 AM - 8:00 PM",
            "wednesday": "10:00 AM - 8:00 PM",
            "thursday": "10:00 AM - 8:00 PM",
            "friday": "10:00 AM - 9:00 PM",
            "saturday": "9:00 AM - 9:00 PM",
            "sunday": "12:00 PM - 6:00 PM"
        },
        "amenities": {
            "indoor": True,
            "outdoor": False,
            "pistol_50ft": True,
            "pistol_25yd": True,
            "rifle_smallbore": True,
            "handgun": True,
            "rifle": True,
            "equipment_rentals": True,
            "instruction": True,
            "retail_store": True,
            "concealed_carry_classes": True,
            "basic_firearm_training": True,
            "climate_controlled": True,
            "bulletproof_barriers": True,
            "public_access": True
        },
        "pricing": {
            "day_pass": 22.0,
            "hourly_rate": 18.0,
            "monthly_membership": 85.0,
            "notes": "Student discounts available with valid ID"
        },
        "google_rating": 4.1,
        "google_reviews": 67,
        "nssf_member": False,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "range-007",
        "name": "Silverado Gun Club",
        "description": "Maryland's premier private shooting club featuring multiple outdoor ranges, trap and skeet fields, and archery facilities.",
        "phone": "(301) 555-0707",
        "website": "https://silveradogunclub.org",
        "location": {
            "address": "13501 Query Mill Rd",
            "city": "North Potomac",
            "state": "MD",
            "zip_code": "20878",
            "latitude": 39.1098,
            "longitude": -77.2553
        },
        "hours": {
            "wednesday": "4:00 PM - 8:00 PM",
            "thursday": "4:00 PM - 8:00 PM",
            "saturday": "9:00 AM - 6:00 PM",
            "sunday": "9:00 AM - 6:00 PM"
        },
        "amenities": {
            "indoor": False,
            "outdoor": True,
            "pistol_25yd": True,
            "pistol_50yd": True,
            "rifle_smallbore": True,
            "rifle_centerfire": True,
            "rifle_100yd": True,
            "rifle_200yd": True,
            "rifle_300yd": True,
            "handgun": True,
            "rifle": True,
            "shotgun": True,
            "archery": True,
            "trap": True,
            "skeet": True,
            "sporting_clays": True,
            "instruction": True,
            "hunter_education": True,
            "youth_programs": True,
            "precision_pistol": True,
            "smallbore_competition": True,
            "centerfire_competition": True,
            "clubhouse": True,
            "picnic_area": True,
            "members_only": True,
            "public_access": False
        },
        "pricing": {
            "annual_membership": 450.0,
            "notes": "Membership required. Additional fees for trap and skeet."
        },
        "google_rating": 4.6,
        "google_reviews": 78,
        "nssf_member": True,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "range-008",
        "name": "Norfolk Tactical Training Center",
        "description": "Advanced tactical training facility specializing in law enforcement and military training, also open to civilians.",
        "phone": "(757) 555-0808",
        "website": "https://norfolktactical.com",
        "location": {
            "address": "3401 Cromwell Dr",
            "city": "Norfolk",
            "state": "VA",
            "zip_code": "23513",
            "latitude": 36.9037,
            "longitude": -76.2099
        },
        "hours": {
            "monday": "8:00 AM - 8:00 PM",
            "tuesday": "8:00 AM - 8:00 PM",
            "wednesday": "8:00 AM - 8:00 PM",
            "thursday": "8:00 AM - 8:00 PM",
            "friday": "8:00 AM - 8:00 PM",
            "saturday": "9:00 AM - 6:00 PM",
            "sunday": "10:00 AM - 5:00 PM"
        },
        "amenities": {
            "indoor": True,
            "outdoor": True,
            "pistol_50ft": True,
            "pistol_25yd": True,
            "pistol_50yd": True,
            "rifle_smallbore": True,
            "rifle_centerfire": True,
            "rifle_100yd": True,
            "handgun": True,
            "rifle": True,
            "equipment_rentals": True,
            "instruction": True,
            "retail_store": True,
            "concealed_carry_classes": True,
            "basic_firearm_training": True,
            "advanced_training": True,
            "uspsa": True,
            "idpa": True,
            "practical_pistol": True,
            "three_gun": True,
            "climate_controlled": True,
            "bulletproof_barriers": True,
            "ada_accessible": True,
            "public_access": True
        },
        "pricing": {
            "day_pass": 30.0,
            "hourly_rate": 25.0,
            "monthly_membership": 150.0,
            "notes": "Law enforcement and military discounts available"
        },
        "google_rating": 4.8,
        "google_reviews": 192,
        "nssf_member": True,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

async def seed_database():
    """Populate the database with sample shooting range data"""
    try:
        # Clear existing ranges
        await db.ranges.delete_many({})
        print("Cleared existing range data")
        
        # Insert sample data
        result = await db.ranges.insert_many(sample_ranges)
        print(f"Inserted {len(result.inserted_ids)} ranges into the database")
        
        # Create indexes for better performance
        await db.ranges.create_index("location.state")
        await db.ranges.create_index("location.city")
        await db.ranges.create_index("location.zip_code")
        await db.ranges.create_index([("location.latitude", 1), ("location.longitude", 1)])
        await db.ranges.create_index("amenities.indoor")
        await db.ranges.create_index("amenities.outdoor")
        await db.ranges.create_index("nssf_member")
        print("Created database indexes")
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())