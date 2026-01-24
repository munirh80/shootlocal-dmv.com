#!/usr/bin/env python3
"""
Import script to populate the database with real shooting range data from the user's spreadsheet.
Filters for VA, MD, and DC ranges only.
"""

import os
import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Raw data extracted from the Excel spreadsheet
raw_data = [
    {"name": "Maryland Small Arms Range, Inc.", "site": "http://www.msar.com/", "phone": "+1 301-599-0000", "full_address": "9801 Fallard Ct, Upper Marlboro, MD 20772", "street": "9801 Fallard Ct", "city": "Upper Marlboro", "postal_code": "20772", "state": "Maryland", "working_hours": {"Monday": "12-9PM", "Tuesday": "10AM-4PM", "Wednesday": "10AM-4PM", "Thursday": "10AM-4PM", "Friday": "10AM-9PM", "Saturday": "10AM-9PM", "Sunday": "10AM-6PM"}},
    {"name": "GUNTRY Maryland", "site": "https://guntry.com/", "phone": "+1 443-973-4867", "full_address": "10705 Red Run Blvd, Owings Mills, MD 21117", "street": "10705 Red Run Blvd", "city": "Owings Mills", "postal_code": "21117", "state": "Maryland", "working_hours": {"Monday": "11AM-8PM", "Tuesday": "11AM-8PM", "Wednesday": "11AM-8PM", "Thursday": "11AM-8PM", "Friday": "11AM-9PM", "Saturday": "10AM-9PM", "Sunday": "10AM-8PM"}},
    {"name": "FreeState Gun Range", "site": "http://www.freestategunrange.com/", "phone": "+1 410-335-5100", "full_address": "11500 Crossroads Cir Suite J, Middle River, MD 21220", "street": "11500 Crossroads Cir Suite J", "city": "Middle River", "postal_code": "21220", "state": "Maryland", "working_hours": {"Monday": "11AM-8PM", "Tuesday": "11AM-8PM", "Wednesday": "11AM-8PM", "Thursday": "11AM-8PM", "Friday": "11AM-9PM", "Saturday": "10AM-10PM", "Sunday": "11AM-7PM"}},
    {"name": "Bel Air Gun Range", "site": "http://belairgunrange.com/", "phone": "+1 410-399-9518", "full_address": "2137 N Fountain Green Rd, Bel Air, MD 21015", "street": "2137 N Fountain Green Rd", "city": "Bel Air", "postal_code": "21015", "state": "Maryland", "working_hours": {"Monday": "11AM-8PM", "Tuesday": "11AM-8PM", "Wednesday": "11AM-8PM", "Thursday": "11AM-8PM", "Friday": "11AM-8PM", "Saturday": "11AM-8PM", "Sunday": "11AM-7PM"}},
    {"name": "Associated Gun Clubs of Baltimore, Inc.", "site": "https://www.agcrange.org/", "phone": "+1 410-461-8532", "full_address": "11518 Marriottsville Rd, Marriottsville, MD 21104", "street": "11518 Marriottsville Rd", "city": "Marriottsville", "postal_code": "21104", "state": "Maryland", "working_hours": {"Monday": "8AM-8PM", "Tuesday": "8AM-8PM", "Wednesday": "8AM-8PM", "Thursday": "8AM-8PM", "Friday": "8AM-8PM", "Saturday": "9AM-8PM", "Sunday": "9AM-8PM"}},
    {"name": "Delmarva Sporting Clays", "site": "http://www.dscfff.com/", "phone": "+1 410-742-2023", "full_address": "23501 Marsh Rd, Mardela Springs, MD 21837", "street": "23501 Marsh Rd", "city": "Mardela Springs", "postal_code": "21837", "state": "Maryland", "working_hours": {"Monday": "9AM-6PM", "Tuesday": "9AM-6PM", "Wednesday": "9AM-6PM", "Thursday": "9AM-6PM", "Friday": "9AM-6PM", "Saturday": "9AM-6PM", "Sunday": "9AM-6PM"}},
    {"name": "Cindy's Hot Shots", "site": "https://www.cindyshotshots.com/", "phone": "+1 410-787-7468", "full_address": "115 Holsum Way, Glen Burnie, MD 21060", "street": "115 Holsum Way", "city": "Glen Burnie", "postal_code": "21060", "state": "Maryland", "working_hours": {"Monday": "Closed", "Tuesday": "10AM-8PM", "Wednesday": "10AM-8PM", "Thursday": "10AM-8PM", "Friday": "10AM-8PM", "Saturday": "10AM-8PM", "Sunday": "10AM-6PM"}},
    {"name": "Meade Rifle and Pistol Club (MRPC)", "site": "http://mrpc-online.org/", "phone": "+1 410-533-1524", "full_address": "Range Rd, Fort Meade, MD 20755", "street": "Range Rd", "city": "Fort Meade", "postal_code": "20755", "state": "Maryland", "working_hours": None},
    {"name": "Precision Point Frederick", "site": "https://www.precisionpointfrederick.com/", "phone": "+1 240-616-6686", "full_address": "4537 Metropolitan Ct, Frederick, MD 21704", "street": "4537 Metropolitan Ct", "city": "Frederick", "postal_code": "21704", "state": "Maryland", "working_hours": {"Monday": "9AM-9PM", "Tuesday": "9AM-9PM", "Wednesday": "9AM-9PM", "Thursday": "9AM-9PM", "Friday": "9AM-9PM", "Saturday": "9AM-9PM", "Sunday": "9AM-9PM"}},
    {"name": "Flat Broke Shooters LLC", "site": "http://flatbrokeshootersllc.com/", "phone": "+1 301-863-4524", "full_address": "48845 St James Church Rd, Lexington Park, MD 20653", "street": "48845 St James Church Rd", "city": "Lexington Park", "postal_code": "20653", "state": "Maryland", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "10AM-6PM", "Thursday": "10AM-6PM", "Friday": "10AM-6PM", "Saturday": "10AM-6PM", "Sunday": "10AM-6PM"}},
    {"name": "Cresap Rifle Club", "site": "https://www.cresaprifleclub.com/", "phone": "+1 301-662-6669", "full_address": "6420 Plant Rd, Frederick, MD 21701", "street": "6420 Plant Rd", "city": "Frederick", "postal_code": "21701", "state": "Maryland", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "Closed", "Thursday": "Closed", "Friday": "Closed", "Saturday": "Closed", "Sunday": "10AM-3PM"}},
    {"name": "Prince George's County Trap and Skeet Center", "site": "https://www.pgparks.com/", "phone": "+1 301-577-7178", "full_address": "10400 Good Luck Rd, Glenn Dale, MD 20769", "street": "10400 Good Luck Rd", "city": "Glenn Dale", "postal_code": "20769", "state": "Maryland", "working_hours": {"Monday": "10AM-2PM", "Tuesday": "10AM-8:30PM", "Wednesday": "10AM-8:30PM", "Thursday": "10AM-8:30PM", "Friday": "10AM-5PM", "Saturday": "10AM-5PM", "Sunday": "10AM-5PM"}},
    {"name": "Continental Arms", "site": "http://www.continentalarms.com/", "phone": "+1 410-560-3609", "full_address": "9603 Deereco Rd #500, Timonium, MD 21093", "street": "9603 Deereco Rd #500", "city": "Timonium", "postal_code": "21093", "state": "Maryland", "working_hours": {"Monday": "10AM-6PM", "Tuesday": "10AM-6PM", "Wednesday": "10AM-6PM", "Thursday": "10AM-6PM", "Friday": "10AM-6PM", "Saturday": "10AM-6PM", "Sunday": "10AM-6PM"}},
    {"name": "The Machine Gun Nest", "site": "http://www.themachinegunnest.com/", "phone": "+1 301-304-6001", "full_address": "7910 Reichs Ford Rd, Frederick, MD 21704", "street": "7910 Reichs Ford Rd", "city": "Frederick", "postal_code": "21704", "state": "Maryland", "working_hours": {"Monday": "11AM-7PM", "Tuesday": "11AM-7PM", "Wednesday": "11AM-7PM", "Thursday": "11AM-7PM", "Friday": "11AM-8PM", "Saturday": "9AM-8PM", "Sunday": "9AM-7PM"}},
    {"name": "Worth-A-Shot", "site": "http://worth-a-shot.com/", "phone": "+1 443-688-6521", "full_address": "8424 Veterans Hwy, Millersville, MD 21108", "street": "8424 Veterans Hwy", "city": "Millersville", "postal_code": "21108", "state": "Maryland", "working_hours": {"Monday": "12-7PM", "Tuesday": "10AM-7PM", "Wednesday": "10AM-7PM", "Thursday": "10AM-7PM", "Friday": "10AM-7PM", "Saturday": "10AM-6PM", "Sunday": "Closed"}},
    {"name": "Schrader's Outdoors", "site": "https://linktr.ee/schradersoutdoors", "phone": "+1 410-758-1824", "full_address": "16090 Oakland Rd, Henderson, MD 21640", "street": "16090 Oakland Rd", "city": "Henderson", "postal_code": "21640", "state": "Maryland", "working_hours": None},
    {"name": "The Point at Pintail", "site": "http://www.pointatpintail.com/", "phone": "+1 410-827-7065", "full_address": "511 Pintail Point Farm Ln, Queenstown, MD 21658", "street": "511 Pintail Point Farm Ln", "city": "Queenstown", "postal_code": "21658", "state": "Maryland", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "10AM-4PM", "Thursday": "10AM-4PM", "Friday": "10AM-4PM", "Saturday": "9AM-5PM", "Sunday": "10AM-4PM"}},
    {"name": "Israeli Tactical School - Maryland", "site": "http://www.israelitactical.com/", "phone": "+1 202-674-7255", "full_address": "14690 Rothgeb Dr #26, Rockville, MD 20850", "street": "14690 Rothgeb Dr #26", "city": "Rockville", "postal_code": "20850", "state": "Maryland", "working_hours": {"Monday": "9AM-6PM", "Tuesday": "9AM-6PM", "Wednesday": "9AM-6PM", "Thursday": "9AM-6PM", "Friday": "9AM-6PM", "Saturday": "9AM-6PM", "Sunday": "9AM-6PM"}},
    {"name": "Pretty Shooters Firearms Training, LLC", "site": "http://www.prettyshootersfirearms.com/", "phone": "+1 202-681-4754", "full_address": "8002 Marlboro Pike, District Heights, MD 20747", "street": "8002 Marlboro Pike", "city": "District Heights", "postal_code": "20747", "state": "Maryland", "working_hours": {"Monday": "Closed", "Tuesday": "12-6PM", "Wednesday": "8AM-6PM", "Thursday": "8AM-6PM", "Friday": "8AM-7PM", "Saturday": "8AM-7PM", "Sunday": "Closed"}},
    {"name": "Owtlaw Firearms Performance Center", "site": "http://www.owtlawfpc.com/", "phone": "+1 240-483-1830", "full_address": "10015 Old Columbia Rd Suite B 215, Columbia, MD 21046", "street": "10015 Old Columbia Rd Suite B 215", "city": "Columbia", "postal_code": "21046", "state": "Maryland", "working_hours": {"Monday": "9AM-8PM", "Tuesday": "9AM-8PM", "Wednesday": "9AM-8PM", "Thursday": "9AM-8PM", "Friday": "9AM-8PM", "Saturday": "10AM-5PM", "Sunday": "10AM-5PM"}},
    {"name": "Maryland Firearms Academy LLC", "site": "http://www.marylandfa.com/", "phone": "+1 443-622-7252", "full_address": "6615 Reisterstown Rd Suite LL1, Baltimore, MD 21215", "street": "6615 Reisterstown Rd Suite LL1", "city": "Baltimore", "postal_code": "21215", "state": "Maryland", "working_hours": None},
    {"name": "Top Shot Maryland, LLC", "site": "https://www.topshotmaryland.com/", "phone": "+1 410-493-0625", "full_address": "48 Thornhill Rd, Lutherville, MD 21093", "street": "48 Thornhill Rd", "city": "Lutherville", "postal_code": "21093", "state": "Maryland", "working_hours": {"Monday": "9AM-6PM", "Tuesday": "9AM-6PM", "Wednesday": "9AM-6PM", "Thursday": "9AM-6PM", "Friday": "9AM-6PM", "Saturday": "9AM-6PM", "Sunday": "9AM-6PM"}},
    {"name": "Berwyn Rod & Gun Club Inc", "site": "https://www.berwyn.org/", "phone": "+1 301-464-9830", "full_address": "8311 Laurel - Bowie Rd, Bowie, MD 20715", "street": "8311 Laurel - Bowie Rd", "city": "Bowie", "postal_code": "20715", "state": "Maryland", "working_hours": {"Monday": "8AM-5PM", "Tuesday": "8AM-5PM", "Wednesday": "8AM-5PM", "Thursday": "8AM-5PM", "Friday": "8AM-5PM", "Saturday": "8AM-5PM", "Sunday": "10AM-5PM"}},
    {"name": "Silver Eagle Group Shooting Range", "site": "https://www.silvereaglegroup.com/", "phone": "+1 703-723-5173", "full_address": "21550 Beaumeade Cir, Ashburn, VA 20147", "street": "21550 Beaumeade Cir", "city": "Ashburn", "postal_code": "20147", "state": "Virginia", "working_hours": {"Monday": "9AM-8PM", "Tuesday": "9AM-8PM", "Wednesday": "9AM-8PM", "Thursday": "9AM-8PM", "Friday": "9AM-8PM", "Saturday": "9AM-7PM", "Sunday": "9AM-6PM"}},
    {"name": "XCAL Shooting Sports and Fitness", "site": "http://xcal.com/", "phone": "+1 703-740-4625", "full_address": "44950 Russell Branch Pkwy, Ashburn, VA 20147", "street": "44950 Russell Branch Pkwy", "city": "Ashburn", "postal_code": "20147", "state": "Virginia", "working_hours": {"Monday": "9AM-10PM", "Tuesday": "9AM-10PM", "Wednesday": "9AM-10PM", "Thursday": "9AM-10PM", "Friday": "9AM-11PM", "Saturday": "8AM-11PM", "Sunday": "8AM-8PM"}},
    {"name": "Sharpshooters Indoor Range and Pro Shop", "site": "https://www.sharpshootersindoorrange.net/", "phone": "+1 703-550-8005", "full_address": "8194-M Terminal Rd, Lorton, VA 22079", "street": "8194-M Terminal Rd", "city": "Lorton", "postal_code": "22079", "state": "Virginia", "working_hours": {"Monday": "10AM-9PM", "Tuesday": "10AM-9PM", "Wednesday": "10AM-9PM", "Thursday": "10AM-9PM", "Friday": "10AM-9PM", "Saturday": "10AM-9PM", "Sunday": "10AM-7PM"}},
    {"name": "The Marksman", "site": "http://onlinestore.the-marksman.com/", "phone": "+1 757-872-4130", "full_address": "520 Industrial Park Dr, Newport News, VA 23608", "street": "520 Industrial Park Dr", "city": "Newport News", "postal_code": "23608", "state": "Virginia", "working_hours": {"Monday": "10AM-6PM", "Tuesday": "10AM-6PM", "Wednesday": "10AM-6PM", "Thursday": "10AM-6PM", "Friday": "10AM-6PM", "Saturday": "10AM-6PM", "Sunday": "Closed"}},
    {"name": "Green Top Shooting Range", "site": "https://www.greentopshootingrange.com/", "phone": "+1 804-368-8540", "full_address": "11547 Lakeridge Pkwy, Ashland, VA 23005", "street": "11547 Lakeridge Pkwy", "city": "Ashland", "postal_code": "23005", "state": "Virginia", "working_hours": {"Monday": "10AM-7PM", "Tuesday": "Closed", "Wednesday": "10AM-7PM", "Thursday": "10AM-7PM", "Friday": "10AM-7PM", "Saturday": "10AM-6PM", "Sunday": "10AM-6PM"}},
    {"name": "Bull Run Shooting Center", "site": "https://www.novaparks.com/parks/bull-run-shooting-center", "phone": "+1 703-830-2344", "full_address": "7700 Bull Run Dr, Centreville, VA 20121", "street": "7700 Bull Run Dr", "city": "Centreville", "postal_code": "20121", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "12-7PM", "Thursday": "12-7PM", "Friday": "12-7PM", "Saturday": "9AM-5PM", "Sunday": "9AM-5PM"}},
    {"name": "Freedom Outdoors", "site": "https://freedomoutdoors.us/", "phone": "+1 757-227-9130", "full_address": "5070 Virginia Beach Blvd, Virginia Beach, VA 23462", "street": "5070 Virginia Beach Blvd", "city": "Virginia Beach", "postal_code": "23462", "state": "Virginia", "working_hours": {"Monday": "9AM-9PM", "Tuesday": "9AM-9PM", "Wednesday": "9AM-9PM", "Thursday": "9AM-9PM", "Friday": "9AM-9PM", "Saturday": "9AM-9PM", "Sunday": "9AM-6PM"}},
    {"name": "Dominion Shooting Range Inc", "site": "http://www.dominionshootingrange.com/", "phone": "+1 804-276-2851", "full_address": "106 Turner Rd, Richmond, VA 23225", "street": "106 Turner Rd", "city": "Richmond", "postal_code": "23225", "state": "Virginia", "working_hours": {"Monday": "10AM-7PM", "Tuesday": "10AM-7PM", "Wednesday": "Closed", "Thursday": "10AM-7PM", "Friday": "10AM-8PM", "Saturday": "9AM-8PM", "Sunday": "12-6PM"}},
    {"name": "NRA Range", "site": "http://nrahqrange.nra.org/", "phone": "+1 703-267-1402", "full_address": "11250 Waples Mill Rd, Fairfax, VA 22030", "street": "11250 Waples Mill Rd", "city": "Fairfax", "postal_code": "22030", "state": "Virginia", "working_hours": {"Monday": "9AM-4PM", "Tuesday": "Closed", "Wednesday": "12-8PM", "Thursday": "12-8PM", "Friday": "12-8PM", "Saturday": "9AM-5PM", "Sunday": "9AM-5PM"}},
    {"name": "Safeside Tactical", "site": "http://www.safesidetactical.com/", "phone": "+1 540-682-8881", "full_address": "1201 Shenandoah Ave NW, Roanoke, VA 24017", "street": "1201 Shenandoah Ave NW", "city": "Roanoke", "postal_code": "24017", "state": "Virginia", "working_hours": {"Monday": "10AM-8PM", "Tuesday": "10AM-8PM", "Wednesday": "10AM-8PM", "Thursday": "10AM-8PM", "Friday": "10AM-8PM", "Saturday": "10AM-8PM", "Sunday": "1-6PM"}},
    {"name": "BangSteel Long Range Rifle School", "site": "http://www.bangsteel.com/", "phone": "+1 276-613-6868", "full_address": "interstates 77 & interstates 81, Wytheville, VA 24382", "street": "interstates 77 & interstates 81", "city": "Wytheville", "postal_code": "24382", "state": "VA", "working_hours": None},
    {"name": "Flying Rabbit Sporting Clays", "site": "http://www.flyingrabbitsportingclays.com/", "phone": "+1 540-574-2529", "full_address": "5537 S Valley Pike, Mt Crawford, VA 22841", "street": "5537 S Valley Pike", "city": "Mt Crawford", "postal_code": "22841", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "Closed", "Thursday": "10AM-6PM", "Friday": "10AM-6PM", "Saturday": "10AM-6PM", "Sunday": "12-6PM"}},
    {"name": "Clark Brothers Gun Shop", "site": "http://clarkbrosguns.com/", "phone": "+1 540-439-8988", "full_address": "10016 James Madison Hwy, Warrenton, VA 20186", "street": "10016 James Madison Hwy", "city": "Warrenton", "postal_code": "20186", "state": "Virginia", "working_hours": {"Monday": "9AM-5:30PM", "Tuesday": "9AM-5:30PM", "Wednesday": "9AM-5:30PM", "Thursday": "9AM-5:30PM", "Friday": "9AM-5:30PM", "Saturday": "9AM-5:30PM", "Sunday": "9AM-5:30PM"}},
    {"name": "Quantico Shooting Club", "site": "http://www.quanticoshootingclub.com/", "phone": "+1 703-463-8214", "full_address": "MCB 4, Triangle, VA 22172", "street": "MCB 4", "city": "Triangle", "postal_code": "22172", "state": "VA", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "Closed", "Thursday": "Closed", "Friday": "Closed", "Saturday": "7AM-3PM", "Sunday": "7AM-3PM"}},
    {"name": "Lynchburg Arms and Indoor Shooting Range", "site": "https://lynchburgshootingrange.com/", "phone": "+1 434-525-2604", "full_address": "2309 Mayflower Dr, Lynchburg, VA 24501", "street": "2309 Mayflower Dr", "city": "Lynchburg", "postal_code": "24501", "state": "Virginia", "working_hours": {"Monday": "11AM-7PM", "Tuesday": "11AM-7PM", "Wednesday": "11AM-7PM", "Thursday": "11AM-7PM", "Friday": "10AM-7PM", "Saturday": "10AM-6PM", "Sunday": "1-6PM"}},
    {"name": "Strong Arms Gun Club", "site": "https://www.strongarmsgunclub.com/", "phone": "+1 757-803-1440", "full_address": "463 B S Lynnhaven Rd, Virginia Beach, VA 23452", "street": "463 B S Lynnhaven Rd", "city": "Virginia Beach", "postal_code": "23452", "state": "Virginia", "working_hours": None},
    {"name": "Protect & Defend Firearms Academy and Outfitters", "site": "http://www.protect-defend.com/", "phone": "+1 703-228-9949", "full_address": "6468 Sutcliffe Dr, Alexandria, VA 22315", "street": "6468 Sutcliffe Dr", "city": "Alexandria", "postal_code": "22315", "state": "Virginia", "working_hours": None},
    {"name": "Old Forge Sporting Clays", "site": "http://oldforgesportingclays.com/", "phone": "+1 804-966-2955", "full_address": "7945 Long Reach Rd, Providence Forge, VA 23140", "street": "7945 Long Reach Rd", "city": "Providence Forge", "postal_code": "23140", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "9AM-5PM", "Thursday": "9AM-5PM", "Friday": "9AM-5PM", "Saturday": "9AM-5PM", "Sunday": "9AM-5PM"}},
    {"name": "Lynnhaven Superior Pawn & Gun", "site": "https://www.superiorpawn.com/", "phone": "+1 757-427-2627", "full_address": "2664 Lishelle Pl, Virginia Beach, VA 23452", "street": "2664 Lishelle Pl", "city": "Virginia Beach", "postal_code": "23452", "state": "Virginia", "working_hours": {"Monday": "9AM-8PM", "Tuesday": "Closed", "Wednesday": "9AM-8PM", "Thursday": "9AM-8PM", "Friday": "9AM-8PM", "Saturday": "9AM-6PM", "Sunday": "11AM-5PM"}},
    {"name": "The Range Stafford", "site": "http://www.indoorrange.com/", "phone": "+1 540-720-5922", "full_address": "62 Potomac Creek Dr, Fredericksburg, VA 22405", "street": "62 Potomac Creek Dr", "city": "Fredericksburg", "postal_code": "22405", "state": "Virginia", "working_hours": {"Monday": "11AM-7PM", "Tuesday": "11AM-7PM", "Wednesday": "Closed", "Thursday": "11AM-7PM", "Friday": "11AM-7PM", "Saturday": "11AM-7PM", "Sunday": "11AM-7PM"}},
    {"name": "Blackcreek Gun Club", "site": "http://www.bcgcva.com/", "phone": "+1 804-781-1945", "full_address": "4292 Range Rd, Mechanicsville, VA 23111", "street": "4292 Range Rd", "city": "Mechanicsville", "postal_code": "23111", "state": "Virginia", "working_hours": {"Monday": "9AM-5:30PM", "Tuesday": "9AM-5:30PM", "Wednesday": "9AM-5:30PM", "Thursday": "9AM-5:30PM", "Friday": "9AM-5:30PM", "Saturday": "9AM-5PM", "Sunday": "1-5PM"}},
    {"name": "Central Virginia Sporting Clays", "site": "http://www.centralvasportingclays.com/", "phone": "+1 434-591-0215", "full_address": "442 Middle Fork Rd, Palmyra, VA 22963", "street": "442 Middle Fork Rd", "city": "Palmyra", "postal_code": "22963", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "Closed", "Thursday": "9AM-5PM", "Friday": "9AM-5PM", "Saturday": "9AM-5PM", "Sunday": "12-5PM"}},
    {"name": "Fairfax Rod & Gun Club", "site": "http://www.fxrgc.org/", "phone": "+1 703-368-6333", "full_address": "7039 Signal Hill Rd, Manassas, VA 20111", "street": "7039 Signal Hill Rd", "city": "Manassas", "postal_code": "20111", "state": "Virginia", "working_hours": None},
    {"name": "Cobalt Firearm Instruction, LLC.", "site": "https://cobaltfirearminstruction.com/", "phone": "+1 571-445-0547", "full_address": "10016 James Madison Hwy, Warrenton, VA 20186", "street": "10016 James Madison Hwy", "city": "Warrenton", "postal_code": "20186", "state": "Virginia", "working_hours": {"Monday": "8AM-6PM", "Tuesday": "8AM-6PM", "Wednesday": "8AM-6PM", "Thursday": "8AM-6PM", "Friday": "8AM-6PM", "Saturday": "8AM-6PM", "Sunday": "8AM-6PM"}},
    {"name": "Gun Club at Kairos", "site": "https://www.kairosresort.com/shooting-sports", "phone": "+1 540-240-8683", "full_address": "Shumate Falls Rd, Glen Lyn, VA 24093", "street": "Shumate Falls Rd", "city": "Glen Lyn", "postal_code": "24093", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "9AM-5PM", "Thursday": "9AM-5PM", "Friday": "9AM-5PM", "Saturday": "9AM-5PM", "Sunday": "9AM-5PM"}},
    {"name": "Quail Ridge Sporting Club & Boarding Kennels", "site": "https://quailridgesportingclub.org/", "phone": "+1 540-429-4716", "full_address": "336 Murat Rd, Lexington, VA 24450", "street": "336 Murat Rd", "city": "Lexington", "postal_code": "24450", "state": "Virginia", "working_hours": {"Monday": "9AM-6PM", "Tuesday": "9AM-6PM", "Wednesday": "9AM-6PM", "Thursday": "9AM-6PM", "Friday": "9AM-6PM", "Saturday": "9AM-6PM", "Sunday": "12-6PM"}},
    {"name": "NOVA Armory", "site": "http://www.novaarmory.com/", "phone": "+1 703-566-2814", "full_address": "2607 Wilson Blvd, Arlington, VA 22201", "street": "2607 Wilson Blvd", "city": "Arlington", "postal_code": "22201", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "12-7PM", "Wednesday": "12-7PM", "Thursday": "12-7PM", "Friday": "12-7PM", "Saturday": "12-7PM", "Sunday": "12-5PM"}},
    {"name": "White Oaks Preserve", "site": "http://www.whiteoakspreserve.com/", "phone": "+1 919-619-2260", "full_address": "18014 VA-49, Skipwith, VA 23968", "street": "18014 VA-49", "city": "Skipwith", "postal_code": "23968", "state": "Virginia", "working_hours": None},
    {"name": "Trigger Happy Firearms", "site": "http://www.triggerhappyva.com/", "phone": "+1 434-298-4142", "full_address": "2359 Rocky Hill Rd, Blackstone, VA 23824", "street": "2359 Rocky Hill Rd", "city": "Blackstone", "postal_code": "23824", "state": "Virginia", "working_hours": None},
    {"name": "The Homestead School of Shooting", "site": "http://www.thehomestead.com/", "phone": "+1 540-839-7787", "full_address": "322 Cherokee Rd, Hot Springs, VA 24445", "street": "322 Cherokee Rd", "city": "Hot Springs", "postal_code": "24445", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "8:30AM-5PM", "Wednesday": "8:30AM-5PM", "Thursday": "8:30AM-5PM", "Friday": "8:30AM-5PM", "Saturday": "8:30AM-5PM", "Sunday": "8:30AM-5PM"}},
    {"name": "Summit Springs Inc", "site": "http://summitspringsshooting.com/", "phone": "+1 540-365-3119", "full_address": "12991 Franklin St, Ferrum, VA 24088", "street": "12991 Franklin St", "city": "Ferrum", "postal_code": "24088", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "Closed", "Thursday": "11AM-5PM", "Friday": "11AM-5PM", "Saturday": "9AM-5PM", "Sunday": "11AM-5PM"}},
    {"name": "Roanoke Range and Training", "site": "https://www.roanokerange.com/", "phone": "+1 540-563-8194", "full_address": "2203 Shenandoah Valley Ave NE, Roanoke, VA 24012", "street": "2203 Shenandoah Valley Ave NE", "city": "Roanoke", "postal_code": "24012", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "10AM-6PM", "Wednesday": "10AM-6PM", "Thursday": "10AM-6PM", "Friday": "10AM-6PM", "Saturday": "10AM-6PM", "Sunday": "12-5PM"}},
    {"name": "Conservation Park of Virginia", "site": "http://conservationparkva.org/", "phone": "+1 804-966-7313", "full_address": "5100 Charles City Rd, Charles City, VA 23030", "street": "5100 Charles City Rd", "city": "Charles City", "postal_code": "23030", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "Closed", "Wednesday": "9AM-5PM", "Thursday": "9AM-5PM", "Friday": "9AM-5PM", "Saturday": "9AM-5PM", "Sunday": "9AM-5PM"}},
    {"name": "Virginia Citizens Armory", "site": "https://virginiacitizensarmory.com/", "phone": "+1 850-559-3125", "full_address": "37904 Armor Ct, Purcellville, VA 20132", "street": "37904 Armor Ct", "city": "Purcellville", "postal_code": "20132", "state": "Virginia", "working_hours": {"Monday": "Closed", "Tuesday": "10:30AM-5PM", "Wednesday": "10:30AM-5PM", "Thursday": "10:30AM-5PM", "Friday": "10:30AM-5PM", "Saturday": "Closed", "Sunday": "Closed"}},
    {"name": "Superior Pawn & Gun", "site": "http://www.superiorpawnva.com/", "phone": "+1 757-723-6033", "full_address": "100 and, 104 W Mercury Blvd, Hampton, VA 23669", "street": "100 and, 104 W Mercury Blvd", "city": "Hampton", "postal_code": "23669", "state": "Virginia", "working_hours": {"Monday": "10AM-6PM", "Tuesday": "10AM-6PM", "Wednesday": "10AM-6PM", "Thursday": "10AM-6PM", "Friday": "10AM-6PM", "Saturday": "10AM-6PM", "Sunday": "Closed"}},
    {"name": "Down Range Gunworks", "site": "https://www.downrangegunworksva.com/", "phone": "+1 757-814-7493", "full_address": "39241 Warrique Rd, Ivor, VA 23866", "street": "39241 Warrique Rd", "city": "Ivor", "postal_code": "23866", "state": "Virginia", "working_hours": {"Monday": "11AM-6PM", "Tuesday": "11AM-6PM", "Wednesday": "11AM-6PM", "Thursday": "11AM-6PM", "Friday": "11AM-6PM", "Saturday": "11AM-6PM", "Sunday": "11AM-6PM"}},
    {"name": "d.c. security associates", "site": "https://www.dcsallc.com/", "phone": "+1 202-964-2010", "full_address": "1413 K St NW, Washington, DC 20005", "street": "1413 K St NW", "city": "Washington", "postal_code": "20005", "state": "District of Columbia", "working_hours": {"Monday": "Closed", "Tuesday": "10:30AM-6PM", "Wednesday": "10:30AM-6PM", "Thursday": "10:30AM-6PM", "Friday": "10:30AM-6PM", "Saturday": "10:30AM-6PM", "Sunday": "Closed"}},
    {"name": "Barnes 1st Step Firearms Training LLC", "site": "http://www.barnes1ststepft.com/", "phone": "+1 202-657-2671", "full_address": "97 56th St SE #4218, Washington, DC 20019", "street": "97 56th St SE #4218", "city": "Washington", "postal_code": "20019", "state": "District of Columbia", "working_hours": {"Monday": "10AM-6PM", "Tuesday": "10AM-6PM", "Wednesday": "10AM-6PM", "Thursday": "10AM-6PM", "Friday": "10AM-6PM", "Saturday": "10AM-6PM", "Sunday": "Closed"}},
    {"name": "Boom Boom Firearms & Training", "site": "http://www.boomboom1.com/", "phone": "+1 301-747-3500", "full_address": "6710 Oxon Hill Rd Ste 210, Oxon Hill, MD 20745", "street": "6710 Oxon Hill Rd Ste 210", "city": "Oxon Hill", "postal_code": "20745", "state": "Maryland", "working_hours": {"Monday": "8:30AM-5PM", "Tuesday": "8:30AM-5PM", "Wednesday": "8:30AM-5PM", "Thursday": "8:30AM-5PM", "Friday": "8:30AM-5PM", "Saturday": "Closed", "Sunday": "Closed"}},
    {"name": "G&D FFL", "site": "https://www.ganddffl.com/", "phone": "+1 202-288-6290", "full_address": "1317 F St NW Suite 700, Washington, DC 20004", "street": "1317 F St NW Suite 700", "city": "Washington", "postal_code": "20004", "state": "District of Columbia", "working_hours": {"Monday": "Closed", "Tuesday": "9AM-6PM", "Wednesday": "9AM-6PM", "Thursday": "9AM-6PM", "Friday": "9AM-6PM", "Saturday": "10AM-5PM", "Sunday": "Closed"}},
    {"name": "Trouble Defense LLC", "site": "https://troubledefense.com/", "phone": "+1 703-835-0692", "full_address": "11166 Fairfax Blvd Suite 500, Fairfax, VA 22030", "street": "11166 Fairfax Blvd Suite 500", "city": "Fairfax", "postal_code": "22030", "state": "Virginia", "working_hours": {"Monday": "9AM-6PM", "Tuesday": "9AM-6PM", "Wednesday": "9AM-6PM", "Thursday": "9AM-6PM", "Friday": "9AM-6PM", "Saturday": "9AM-6PM", "Sunday": "9AM-6PM"}},
    {"name": "Herndon Arms 07 FFL/ 02 SOT", "site": "http://www.herndonarms.net/", "phone": "+1 703-435-4222", "full_address": "795 Center St Suite 4A, Herndon, VA 20170", "street": "795 Center St Suite 4A", "city": "Herndon", "postal_code": "20170", "state": "Virginia", "working_hours": {"Monday": "11AM-7PM", "Tuesday": "11AM-7PM", "Wednesday": "11AM-6PM", "Thursday": "11AM-7PM", "Friday": "11AM-7PM", "Saturday": "10AM-6PM", "Sunday": "Closed"}},
    {"name": "Archangel Firearms Safety Training", "site": "https://www.archangeldc.com/", "phone": "+1 202-359-0601", "full_address": "5758 Silver Hill Rd, District Heights, MD 20747", "street": "5758 Silver Hill Rd", "city": "District Heights", "postal_code": "20747", "state": "Maryland", "working_hours": {"Monday": "9AM-5PM", "Tuesday": "9AM-5PM", "Wednesday": "9AM-5PM", "Thursday": "9AM-5PM", "Friday": "9AM-5PM", "Saturday": "Closed", "Sunday": "Closed"}},
    {"name": "Cindy's Hot Shots - Severn", "site": "http://www.cindyshotshots.com/", "phone": "+1 410-551-7777", "full_address": "2618 Annapolis Rd, Severn, MD 21144", "street": "2618 Annapolis Rd", "city": "Severn", "postal_code": "21144", "state": "Maryland", "working_hours": {"Monday": "Closed", "Tuesday": "10AM-8PM", "Wednesday": "10AM-8PM", "Thursday": "10AM-8PM", "Friday": "10AM-8PM", "Saturday": "10AM-8PM", "Sunday": "10AM-6PM"}},
    {"name": "2nd Amd Firearms Training", "site": "https://www.2ndamdfire.com/", "phone": "+1 301-818-2264", "full_address": "150 Jendan Way Apartment 110, Prince Frederick, MD 20678", "street": "150 Jendan Way Apartment 110", "city": "Prince Frederick", "postal_code": "20678", "state": "Maryland", "working_hours": {"Monday": "9AM-7PM", "Tuesday": "9AM-7PM", "Wednesday": "9AM-7PM", "Thursday": "9AM-7PM", "Friday": "9AM-5PM", "Saturday": "9AM-6PM", "Sunday": "9AM-6PM"}},
    {"name": "MD Arsenal", "site": "https://mdarsenal.com/our-mission/", "phone": "+1 240-707-6380", "full_address": "19828 National Pike, Hagerstown, MD 21740", "street": "19828 National Pike", "city": "Hagerstown", "postal_code": "21740", "state": "Maryland", "working_hours": {"Monday": "Closed", "Tuesday": "12-7PM", "Wednesday": "11AM-7PM", "Thursday": "11AM-7PM", "Friday": "11AM-7PM", "Saturday": "10AM-7PM", "Sunday": "10AM-6PM"}},
    {"name": "Realco Guns", "site": "http://www.realcoguns.com/", "phone": "+1 301-736-9800", "full_address": "6108 Marlboro Pike, District Heights, MD 20747", "street": "6108 Marlboro Pike", "city": "District Heights", "postal_code": "20747", "state": "Maryland", "working_hours": {"Monday": "10AM-7PM", "Tuesday": "10AM-7PM", "Wednesday": "10AM-7PM", "Thursday": "10AM-7PM", "Friday": "10AM-7PM", "Saturday": "10AM-6PM", "Sunday": "Closed"}},
    {"name": "Fred's Outdoors", "site": "https://fredsoutdoors.com/", "phone": "+1 301-843-3040", "full_address": "2895 Crain Hwy, Waldorf, MD 20601", "street": "2895 Crain Hwy", "city": "Waldorf", "postal_code": "20601", "state": "Maryland", "working_hours": {"Monday": "9AM-5PM", "Tuesday": "Closed", "Wednesday": "9AM-5PM", "Thursday": "Closed", "Friday": "9AM-5PM", "Saturday": "9AM-5PM", "Sunday": "9AM-3PM"}},
    {"name": "Caroline County Shooting Preserve", "site": "https://www.carolineshootingpreserve.com/", "phone": "+1 410-479-3004", "full_address": "8665 New Bridge Rd, Denton, MD 21629", "street": "8665 New Bridge Rd", "city": "Denton", "postal_code": "21629", "state": "Maryland", "working_hours": {"Monday": "9AM-5PM", "Tuesday": "9AM-5PM", "Wednesday": "9AM-5PM", "Thursday": "9AM-5PM", "Friday": "9AM-5PM", "Saturday": "9AM-5PM", "Sunday": "9AM-5PM"}},
    {"name": "SAFE Firearms Training, LLC", "site": "https://safefirearmstraining.com/", "phone": "+1 443-291-2233", "full_address": "Baker School House Rd, Freeland, MD 21053", "street": "Baker School House Rd", "city": "Freeland", "postal_code": "21053", "state": "Maryland", "working_hours": {"Monday": "9AM-5PM", "Tuesday": "9AM-5PM", "Wednesday": "9AM-5PM", "Thursday": "9AM-5PM", "Friday": "9AM-5PM", "Saturday": "9AM-5PM", "Sunday": "9AM-5PM"}},
    {"name": "Izaak Walton League Rockville Chapter", "site": "https://www.iwlar.org/", "phone": "+1 301-972-1645", "full_address": "18301 Waring Station Rd, Germantown, MD 20874", "street": "18301 Waring Station Rd", "city": "Germantown", "postal_code": "20874", "state": "Maryland", "working_hours": {"Monday": "Open 24 hours", "Tuesday": "Open 24 hours", "Wednesday": "Open 24 hours", "Thursday": "Open 24 hours", "Friday": "Open 24 hours", "Saturday": "Closed", "Sunday": "Closed"}},
    {"name": "SIRIUS TRIGGERNOMETRY ACADEMY", "site": "https://siriusintel.com/", "phone": "+1 571-830-9200", "full_address": "2300 N Pershing Dr #201, Arlington, VA 22201", "street": "2300 N Pershing Dr #201", "city": "Arlington", "postal_code": "22201", "state": "Virginia", "working_hours": {"Monday": "6AM-10PM", "Tuesday": "6AM-10PM", "Wednesday": "6AM-10PM", "Thursday": "6AM-10PM", "Friday": "9AM-10PM", "Saturday": "4AM-8PM", "Sunday": "8AM-6PM"}},
    {"name": "Swift Precision, LLC", "site": "https://www.swiftprecisionshooting.com/", "phone": "+1 703-420-3572", "full_address": "7118 Shreve Rd, Falls Church, VA 22043", "street": "7118 Shreve Rd", "city": "Falls Church", "postal_code": "22043", "state": "Virginia", "working_hours": {"Monday": "9AM-8PM", "Tuesday": "9AM-8PM", "Wednesday": "9AM-8PM", "Thursday": "9AM-8PM", "Friday": "9AM-8PM", "Saturday": "9AM-8PM", "Sunday": "9AM-8PM"}},
    {"name": "Scorpion Defense Training Group, LLC", "site": "http://www.sdtrainingllc.com/", "phone": "+1 571-358-2902", "full_address": "6560 Backlick Rd Suite 223, Springfield, VA 22150", "street": "6560 Backlick Rd Suite 223", "city": "Springfield", "postal_code": "22150", "state": "Virginia", "working_hours": {"Monday": "9AM-7PM", "Tuesday": "9AM-7PM", "Wednesday": "9AM-7PM", "Thursday": "9AM-7PM", "Friday": "Closed", "Saturday": "6AM-4PM", "Sunday": "12-4PM"}},
    {"name": "Firearms Training with Paul", "site": "https://www.firearmstrainingwithpaul.com/", "phone": "+1 703-470-3560", "full_address": "201 Davis Dr, Sterling, VA 20164", "street": "201 Davis Dr", "city": "Sterling", "postal_code": "20164", "state": "Virginia", "working_hours": {"Monday": "5-9PM", "Tuesday": "5-9PM", "Wednesday": "5-9PM", "Thursday": "5-9PM", "Friday": "5-9PM", "Saturday": "10AM-8PM", "Sunday": "10AM-8PM"}},
]

def normalize_state(state):
    """Normalize state names to abbreviations."""
    state_map = {
        "Virginia": "VA",
        "Maryland": "MD",
        "District of Columbia": "DC",
        "VA": "VA",
        "MD": "MD",
        "DC": "DC"
    }
    return state_map.get(state, state)

def transform_hours(working_hours):
    """Transform working hours to the expected format."""
    if not working_hours:
        return None
    
    return {
        "monday": working_hours.get("Monday", "Closed"),
        "tuesday": working_hours.get("Tuesday", "Closed"),
        "wednesday": working_hours.get("Wednesday", "Closed"),
        "thursday": working_hours.get("Thursday", "Closed"),
        "friday": working_hours.get("Friday", "Closed"),
        "saturday": working_hours.get("Saturday", "Closed"),
        "sunday": working_hours.get("Sunday", "Closed"),
    }

def transform_range(raw):
    """Transform raw data to the database schema format."""
    state = normalize_state(raw.get("state", ""))
    
    # Skip non-DMV ranges
    if state not in ["VA", "MD", "DC"]:
        return None
    
    range_doc = {
        "id": str(uuid.uuid4()),
        "name": raw.get("name", ""),
        "description": None,
        "phone": raw.get("phone"),
        "website": raw.get("site"),
        "email": None,
        "location": {
            "address": raw.get("street", ""),
            "city": raw.get("city", ""),
            "state": state,
            "zip_code": raw.get("postal_code", ""),
            "latitude": None,
            "longitude": None
        },
        "hours": transform_hours(raw.get("working_hours")),
        "amenities": {
            "indoor": True,  # Default assumption for most ranges
            "outdoor": False,
            "pistol_50ft": False,
            "pistol_75ft": False,
            "pistol_25yd": False,
            "pistol_50yd": False,
            "rifle_smallbore": False,
            "rifle_centerfire": False,
            "rifle_100yd": False,
            "rifle_200yd": False,
            "rifle_300yd": False,
            "rifle_500yd": False,
            "handgun": True,
            "rifle": True,
            "shotgun": False,
            "archery": False,
            "airgun": False,
            "muzzle_loader": False,
            "equipment_rentals": True,
            "instruction": True,
            "retail_store": True,
            "hunter_education": False,
            "youth_programs": False,
            "womens_programs": False,
            "food_service": False,
            "clubhouse": False,
            "picnic_area": False,
            "rv_sites": False,
            "lodging": False,
            "precision_pistol": False,
            "practical_pistol": False,
            "smallbore_competition": False,
            "centerfire_competition": False,
            "airgun_competition": False,
            "rimfire_challenge": False,
            "three_gun": False,
            "cowboy_action": False,
            "uspsa": False,
            "idpa": False,
            "trap": False,
            "skeet": False,
            "sporting_clays": False,
            "five_stand": False,
            "ada_accessible": False,
            "climate_controlled": True,
            "bulletproof_barriers": True,
            "public_access": True,
            "members_only": False,
            "concealed_carry_classes": True,
            "basic_firearm_training": True,
            "advanced_training": False
        },
        "pricing": None,
        "photos": [],
        "google_rating": None,
        "google_reviews": None,
        "google_maps_url": None,
        "nssf_member": False,
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Detect outdoor ranges based on name
    name_lower = raw.get("name", "").lower()
    if any(word in name_lower for word in ["outdoor", "sporting clays", "trap", "skeet", "club"]):
        range_doc["amenities"]["outdoor"] = True
        range_doc["amenities"]["indoor"] = False
        range_doc["amenities"]["shotgun"] = True
        range_doc["amenities"]["climate_controlled"] = False
    
    # Detect training-focused facilities
    if any(word in name_lower for word in ["training", "academy", "tactical", "school"]):
        range_doc["amenities"]["instruction"] = True
        range_doc["amenities"]["concealed_carry_classes"] = True
        range_doc["amenities"]["basic_firearm_training"] = True
        range_doc["amenities"]["advanced_training"] = True
    
    return range_doc

async def import_data():
    """Import the real range data into the database."""
    try:
        # Clear existing ranges
        result = await db.ranges.delete_many({})
        print(f"Cleared {result.deleted_count} existing range records")
        
        # Transform and filter the data
        ranges_to_insert = []
        for raw in raw_data:
            transformed = transform_range(raw)
            if transformed:
                ranges_to_insert.append(transformed)
        
        print(f"Prepared {len(ranges_to_insert)} ranges for import (filtered for VA, MD, DC only)")
        
        # Insert the data
        if ranges_to_insert:
            result = await db.ranges.insert_many(ranges_to_insert)
            print(f"Successfully inserted {len(result.inserted_ids)} ranges")
        
        # Create indexes for better performance
        await db.ranges.create_index("location.state")
        await db.ranges.create_index("location.city")
        await db.ranges.create_index("location.zip_code")
        await db.ranges.create_index([("location.latitude", 1), ("location.longitude", 1)])
        await db.ranges.create_index("amenities.indoor")
        await db.ranges.create_index("amenities.outdoor")
        await db.ranges.create_index("nssf_member")
        print("Created database indexes")
        
        # Print summary
        va_count = await db.ranges.count_documents({"location.state": "VA"})
        md_count = await db.ranges.count_documents({"location.state": "MD"})
        dc_count = await db.ranges.count_documents({"location.state": "DC"})
        total = await db.ranges.count_documents({})
        
        print(f"\n=== Import Summary ===")
        print(f"Total ranges: {total}")
        print(f"Virginia: {va_count}")
        print(f"Maryland: {md_count}")
        print(f"DC: {dc_count}")
        print("======================")
        
    except Exception as e:
        print(f"Error importing data: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(import_data())
