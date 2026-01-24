#!/usr/bin/env python3
"""
Backend API Testing for RangeFinder VA/MD
Tests all API endpoints and functionality
"""

import requests
import sys
from datetime import datetime
import json

class RangeFinderAPITester:
    def __init__(self, base_url="https://dmv-shoot-finder.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                    return True, response_data
                except:
                    return True, {}
            else:
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200] if response.text else 'No response'
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_stats(self):
        """Test stats endpoint"""
        success, response = self.run_test("Get Stats", "GET", "stats", 200)
        if success and response:
            expected_keys = ['total_ranges', 'virginia_ranges', 'maryland_ranges', 'indoor_ranges', 'outdoor_ranges', 'nssf_members']
            missing_keys = [key for key in expected_keys if key not in response]
            if missing_keys:
                print(f"   ⚠️  Missing keys in stats: {missing_keys}")
            else:
                print(f"   📊 Stats: Total={response.get('total_ranges')}, VA={response.get('virginia_ranges')}, MD={response.get('maryland_ranges')}")
        return success, response

    def test_get_all_ranges(self):
        """Test getting all ranges"""
        success, response = self.run_test("Get All Ranges", "GET", "ranges", 200)
        if success and response:
            print(f"   📍 Found {len(response)} ranges")
            if len(response) > 0:
                first_range = response[0]
                required_fields = ['id', 'name', 'location', 'amenities']
                missing_fields = [field for field in required_fields if field not in first_range]
                if missing_fields:
                    print(f"   ⚠️  Missing required fields: {missing_fields}")
                else:
                    print(f"   ✅ Range structure looks good")
        return success, response

    def test_search_by_state(self):
        """Test searching ranges by state"""
        # Test Virginia ranges
        success_va, response_va = self.run_test("Search VA Ranges", "GET", "ranges", 200, params={'state': 'VA'})
        if success_va:
            print(f"   🏛️  Virginia ranges: {len(response_va)}")
        
        # Test Maryland ranges  
        success_md, response_md = self.run_test("Search MD Ranges", "GET", "ranges", 200, params={'state': 'MD'})
        if success_md:
            print(f"   🏛️  Maryland ranges: {len(response_md)}")
            
        return success_va and success_md, {'va_count': len(response_va) if success_va else 0, 'md_count': len(response_md) if success_md else 0}

    def test_search_by_city(self):
        """Test searching ranges by city"""
        return self.run_test("Search by City (Chantilly)", "GET", "ranges", 200, params={'city': 'Chantilly'})

    def test_search_by_zip(self):
        """Test searching ranges by ZIP code"""
        return self.run_test("Search by ZIP (20151)", "GET", "ranges", 200, params={'zip_code': '20151'})

    def test_filter_indoor_ranges(self):
        """Test filtering for indoor ranges"""
        return self.run_test("Filter Indoor Ranges", "GET", "ranges", 200, params={'indoor': 'true'})

    def test_filter_outdoor_ranges(self):
        """Test filtering for outdoor ranges"""
        return self.run_test("Filter Outdoor Ranges", "GET", "ranges", 200, params={'outdoor': 'true'})

    def test_filter_by_amenities(self):
        """Test filtering by various amenities"""
        # Test handgun ranges
        success1, _ = self.run_test("Filter Handgun Ranges", "GET", "ranges", 200, params={'handgun': 'true'})
        
        # Test rifle ranges
        success2, _ = self.run_test("Filter Rifle Ranges", "GET", "ranges", 200, params={'rifle': 'true'})
        
        # Test instruction available
        success3, _ = self.run_test("Filter Instruction Available", "GET", "ranges", 200, params={'instruction': 'true'})
        
        # Test USPSA competitions
        success4, _ = self.run_test("Filter USPSA Competitions", "GET", "ranges", 200, params={'uspsa': 'true'})
        
        return success1 and success2 and success3 and success4, {}

    def test_get_range_by_id(self):
        """Test getting a specific range by ID"""
        # First get all ranges to get a valid ID
        success, ranges = self.test_get_all_ranges()
        if success and ranges and len(ranges) > 0:
            range_id = ranges[0]['id']
            return self.run_test(f"Get Range by ID ({range_id})", "GET", f"ranges/{range_id}", 200)
        else:
            print("❌ Cannot test range by ID - no ranges available")
            return False, {}

    def test_get_nonexistent_range(self):
        """Test getting a non-existent range"""
        return self.run_test("Get Non-existent Range", "GET", "ranges/nonexistent-id", 404)

    def test_location_based_search(self):
        """Test location-based search with coordinates"""
        # Test search near Chantilly, VA (coordinates from seed data)
        params = {
            'latitude': 38.8874,
            'longitude': -77.4246,
            'radius': 20
        }
        return self.run_test("Location-based Search", "GET", "ranges", 200, params=params)

    def test_get_states(self):
        """Test getting available states"""
        return self.run_test("Get Available States", "GET", "states", 200)

def main():
    """Run all API tests"""
    print("🎯 RangeFinder VA/MD API Testing")
    print("=" * 50)
    
    tester = RangeFinderAPITester()
    
    # Run all tests
    test_results = []
    
    # Basic API tests
    test_results.append(tester.test_api_root())
    test_results.append(tester.test_get_stats())
    test_results.append(tester.test_get_all_ranges())
    test_results.append(tester.test_get_states())
    
    # Search and filter tests
    test_results.append(tester.test_search_by_state())
    test_results.append(tester.test_search_by_city())
    test_results.append(tester.test_search_by_zip())
    test_results.append(tester.test_filter_indoor_ranges())
    test_results.append(tester.test_filter_outdoor_ranges())
    test_results.append(tester.test_filter_by_amenities())
    test_results.append(tester.test_location_based_search())
    
    # Individual range tests
    test_results.append(tester.test_get_range_by_id())
    test_results.append(tester.test_get_nonexistent_range())
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())