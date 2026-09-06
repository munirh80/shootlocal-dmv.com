"""
DMV Gun Ranges API Tests
Tests for shooting range directory API endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndStats:
    """Health check and statistics endpoint tests"""
    
    def test_stats_endpoint_returns_correct_counts(self):
        """Test /api/stats returns correct range counts"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        
        data = response.json()
        # Verify expected fields exist
        assert "total_ranges" in data
        assert "virginia_ranges" in data
        assert "maryland_ranges" in data
        assert "dc_ranges" in data
        assert "indoor_ranges" in data
        assert "outdoor_ranges" in data
        
        # Verify counts match expected (78 total: 42 VA, 33 MD, 3 DC)
        assert data["total_ranges"] == 78, f"Expected 78 total ranges, got {data['total_ranges']}"
        assert data["virginia_ranges"] == 42, f"Expected 42 VA ranges, got {data['virginia_ranges']}"
        assert data["maryland_ranges"] == 33, f"Expected 33 MD ranges, got {data['maryland_ranges']}"
        assert data["dc_ranges"] == 3, f"Expected 3 DC ranges, got {data['dc_ranges']}"


class TestRangesEndpoint:
    """Tests for /api/ranges endpoint"""
    
    def test_get_ranges_returns_list(self):
        """Test /api/ranges returns a list of ranges"""
        response = requests.get(f"{BASE_URL}/api/ranges?limit=50")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 50  # Default limit
    
    def test_range_has_required_fields(self):
        """Test each range has required fields"""
        response = requests.get(f"{BASE_URL}/api/ranges?limit=1")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        
        range_item = data[0]
        # Required fields
        assert "id" in range_item
        assert "name" in range_item
        assert "location" in range_item
        assert "amenities" in range_item
        
        # Location fields
        location = range_item["location"]
        assert "address" in location
        assert "city" in location
        assert "state" in location
        assert "zip_code" in location
    
    def test_filter_by_indoor(self):
        """Test filtering ranges by indoor=true"""
        response = requests.get(f"{BASE_URL}/api/ranges?indoor=true&limit=100")
        assert response.status_code == 200
        
        data = response.json()
        # All returned ranges should be indoor
        for range_item in data:
            assert range_item["amenities"]["indoor"] == True
    
    def test_filter_by_outdoor(self):
        """Test filtering ranges by outdoor=true"""
        response = requests.get(f"{BASE_URL}/api/ranges?outdoor=true&limit=100")
        assert response.status_code == 200
        
        data = response.json()
        # All returned ranges should be outdoor
        for range_item in data:
            assert range_item["amenities"]["outdoor"] == True
    
    def test_filter_by_handgun(self):
        """Test filtering ranges by handgun=true"""
        response = requests.get(f"{BASE_URL}/api/ranges?handgun=true&limit=100")
        assert response.status_code == 200
        
        data = response.json()
        for range_item in data:
            assert range_item["amenities"]["handgun"] == True
    
    def test_filter_by_rifle(self):
        """Test filtering ranges by rifle=true"""
        response = requests.get(f"{BASE_URL}/api/ranges?rifle=true&limit=100")
        assert response.status_code == 200
        
        data = response.json()
        for range_item in data:
            assert range_item["amenities"]["rifle"] == True
    
    def test_filter_by_instruction(self):
        """Test filtering ranges by instruction=true"""
        response = requests.get(f"{BASE_URL}/api/ranges?instruction=true&limit=100")
        assert response.status_code == 200
        
        data = response.json()
        for range_item in data:
            assert range_item["amenities"]["instruction"] == True
    
    def test_search_by_city(self):
        """Test searching ranges by city name"""
        response = requests.get(f"{BASE_URL}/api/ranges?city=Frederick&limit=50")
        assert response.status_code == 200
        
        data = response.json()
        # Should return ranges in Frederick
        for range_item in data:
            assert "Frederick" in range_item["location"]["city"]
    
    def test_search_by_zip_code(self):
        """Test searching ranges by ZIP code"""
        response = requests.get(f"{BASE_URL}/api/ranges?zip_code=21704&limit=50")
        assert response.status_code == 200
        
        data = response.json()
        # Should return ranges with matching ZIP
        for range_item in data:
            assert range_item["location"]["zip_code"] == "21704"


class TestSingleRangeEndpoint:
    """Tests for /api/ranges/{id} endpoint"""
    
    def test_get_single_range_by_id(self):
        """Test retrieving a single range by ID"""
        # First get a valid range ID
        list_response = requests.get(f"{BASE_URL}/api/ranges?limit=1")
        assert list_response.status_code == 200
        ranges = list_response.json()
        assert len(ranges) > 0
        
        range_id = ranges[0]["id"]
        
        # Get single range
        response = requests.get(f"{BASE_URL}/api/ranges/{range_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == range_id
        assert "name" in data
        assert "location" in data
        assert "amenities" in data
        assert "hours" in data
    
    def test_get_nonexistent_range_returns_404(self):
        """Test that requesting a non-existent range returns 404"""
        response = requests.get(f"{BASE_URL}/api/ranges/nonexistent-id-12345")
        assert response.status_code == 404
        
        data = response.json()
        assert "detail" in data


class TestStatesEndpoint:
    """Tests for /api/states endpoint"""
    
    def test_get_states_returns_list(self):
        """Test /api/states returns available states"""
        response = requests.get(f"{BASE_URL}/api/states")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # Should have VA and MD
        state_codes = [s["code"] for s in data]
        assert "VA" in state_codes
        assert "MD" in state_codes


class TestDataIntegrity:
    """Tests for data integrity and completeness"""
    
    def test_all_ranges_have_valid_state(self):
        """Test all ranges have valid DMV state codes"""
        response = requests.get(f"{BASE_URL}/api/ranges?limit=100")
        assert response.status_code == 200
        
        data = response.json()
        valid_states = ["VA", "MD", "DC"]
        for range_item in data:
            assert range_item["location"]["state"] in valid_states, \
                f"Invalid state: {range_item['location']['state']} for {range_item['name']}"
    
    def test_ranges_have_contact_info(self):
        """Test ranges have phone or website"""
        response = requests.get(f"{BASE_URL}/api/ranges?limit=100")
        assert response.status_code == 200
        
        data = response.json()
        ranges_with_contact = 0
        for range_item in data:
            if range_item.get("phone") or range_item.get("website"):
                ranges_with_contact += 1
        
        # Most ranges should have contact info
        assert ranges_with_contact > len(data) * 0.8, \
            f"Only {ranges_with_contact}/{len(data)} ranges have contact info"


class TestRangeSubmission:
    """Tests for /api/ranges/submit endpoint - New feature for range owners to submit ranges"""
    
    def test_submit_range_success(self):
        """Test successful range submission"""
        submission_data = {
            "name": "TEST_Backend_Submission_Range",
            "phone": "+1 555-111-2222",
            "website": "https://test-backend-range.com",
            "email": "backend@test.com",
            "address": "789 Backend Test Ave",
            "city": "Reston",
            "state": "VA",
            "zip_code": "20190",
            "description": "Test range submission from backend tests",
            "hours": {"monday": "10AM-6PM", "tuesday": "10AM-6PM"},
            "amenities": {"indoor": True, "handgun": True, "rifle": False}
        }
        
        response = requests.post(f"{BASE_URL}/api/ranges/submit", json=submission_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "id" in data
        assert "submitted successfully" in data["message"].lower()
        assert len(data["id"]) > 0  # UUID should be generated
    
    def test_submit_range_minimal_data(self):
        """Test range submission with only required fields"""
        submission_data = {
            "name": "TEST_Minimal_Range",
            "address": "123 Minimal St",
            "city": "Arlington",
            "state": "VA",
            "zip_code": "22201"
        }
        
        response = requests.post(f"{BASE_URL}/api/ranges/submit", json=submission_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
    
    def test_submit_range_missing_required_field(self):
        """Test range submission fails without required name field"""
        submission_data = {
            "address": "123 No Name St",
            "city": "Arlington",
            "state": "VA",
            "zip_code": "22201"
        }
        
        response = requests.post(f"{BASE_URL}/api/ranges/submit", json=submission_data)
        # Should fail validation - missing name
        assert response.status_code == 422  # Validation error
    
    def test_submit_range_all_states(self):
        """Test range submission works for all DMV states"""
        for state in ["VA", "MD", "DC"]:
            submission_data = {
                "name": f"TEST_Range_{state}",
                "address": f"123 {state} Street",
                "city": "Test City",
                "state": state,
                "zip_code": "12345"
            }
            
            response = requests.post(f"{BASE_URL}/api/ranges/submit", json=submission_data)
            assert response.status_code == 200, f"Failed for state {state}"


class TestMapCoordinates:
    """Tests for range coordinates used in map view"""
    
    def test_ranges_have_coordinates(self):
        """Test that ranges have latitude and longitude for map display"""
        response = requests.get(f"{BASE_URL}/api/ranges?limit=100")
        assert response.status_code == 200
        
        data = response.json()
        ranges_with_coords = 0
        for range_item in data:
            lat = range_item.get("location", {}).get("latitude")
            lng = range_item.get("location", {}).get("longitude")
            if lat is not None and lng is not None:
                ranges_with_coords += 1
                # Verify coordinates are in broader Mid-Atlantic/East Coast area
                assert 35.0 < lat < 42.0, f"Latitude {lat} out of range for {range_item['name']}"
                assert -82.0 < lng < -73.0, f"Longitude {lng} out of range for {range_item['name']}"
        
        # Most ranges should have coordinates for map
        assert ranges_with_coords > len(data) * 0.9, \
            f"Only {ranges_with_coords}/{len(data)} ranges have coordinates"


class TestAdminDashboard:
    """Tests for Admin Dashboard endpoints - /api/admin/submissions, approve, reject"""
    
    @pytest.fixture(autouse=True)
    def setup_test_submission(self):
        """Create a test submission before each test and cleanup after"""
        # Create a test submission
        submission_data = {
            "name": "TEST_Admin_Review_Range",
            "phone": "+1 555-999-8888",
            "website": "https://test-admin-range.com",
            "email": "admin@test.com",
            "address": "999 Admin Test Blvd",
            "city": "Fairfax",
            "state": "VA",
            "zip_code": "22030",
            "description": "Test range for admin dashboard testing",
            "hours": {"monday": "9AM-5PM", "tuesday": "9AM-5PM"},
            "amenities": {"indoor": True, "handgun": True, "rifle": True}
        }
        
        response = requests.post(f"{BASE_URL}/api/ranges/submit", json=submission_data)
        assert response.status_code == 200
        self.test_submission_id = response.json()["id"]
        
        yield
        
        # Cleanup: Try to reject the submission if it still exists
        requests.post(f"{BASE_URL}/api/admin/submissions/{self.test_submission_id}/reject")
    
    def test_get_pending_submissions(self):
        """Test GET /api/admin/submissions returns pending submissions"""
        response = requests.get(f"{BASE_URL}/api/admin/submissions")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # Find our test submission
        test_submission = next((s for s in data if s["id"] == self.test_submission_id), None)
        assert test_submission is not None, "Test submission not found in pending list"
        assert test_submission["name"] == "TEST_Admin_Review_Range"
        assert test_submission["pending_review"] == True
    
    def test_submission_has_required_fields(self):
        """Test pending submission has all required fields for review"""
        response = requests.get(f"{BASE_URL}/api/admin/submissions")
        assert response.status_code == 200
        
        data = response.json()
        test_submission = next((s for s in data if s["id"] == self.test_submission_id), None)
        assert test_submission is not None
        
        # Verify required fields for admin review
        assert "id" in test_submission
        assert "name" in test_submission
        assert "location" in test_submission
        assert "phone" in test_submission
        assert "website" in test_submission
        assert "email" in test_submission
        assert "amenities" in test_submission
        assert "pending_review" in test_submission
        
        # Verify location details
        location = test_submission["location"]
        assert location["city"] == "Fairfax"
        assert location["state"] == "VA"
        assert location["zip_code"] == "22030"
    
    def test_reject_submission(self):
        """Test POST /api/admin/submissions/{id}/reject removes submission"""
        # First verify submission exists
        response = requests.get(f"{BASE_URL}/api/admin/submissions")
        data = response.json()
        test_submission = next((s for s in data if s["id"] == self.test_submission_id), None)
        assert test_submission is not None, "Test submission should exist before rejection"
        
        # Reject the submission
        reject_response = requests.post(f"{BASE_URL}/api/admin/submissions/{self.test_submission_id}/reject")
        assert reject_response.status_code == 200
        
        reject_data = reject_response.json()
        assert "message" in reject_data
        assert "rejected" in reject_data["message"].lower()
        
        # Verify submission is removed from pending list
        verify_response = requests.get(f"{BASE_URL}/api/admin/submissions")
        verify_data = verify_response.json()
        test_submission = next((s for s in verify_data if s["id"] == self.test_submission_id), None)
        assert test_submission is None, "Rejected submission should not be in pending list"
    
    def test_reject_nonexistent_submission_returns_404(self):
        """Test rejecting non-existent submission returns 404"""
        response = requests.post(f"{BASE_URL}/api/admin/submissions/nonexistent-id-12345/reject")
        assert response.status_code == 404


class TestAdminApproveFlow:
    """Tests for Admin Approve flow - separate class to avoid fixture conflicts"""
    
    def test_approve_submission_adds_to_directory(self):
        """Test POST /api/admin/submissions/{id}/approve adds range to directory"""
        # Create a unique test submission for approval
        submission_data = {
            "name": "TEST_Approve_Flow_Range",
            "phone": "+1 555-777-6666",
            "website": "https://test-approve-range.com",
            "email": "approve@test.com",
            "address": "777 Approve Test Lane",
            "city": "Alexandria",
            "state": "VA",
            "zip_code": "22301",
            "description": "Test range for approval flow testing",
            "amenities": {"indoor": True, "handgun": True}
        }
        
        submit_response = requests.post(f"{BASE_URL}/api/ranges/submit", json=submission_data)
        assert submit_response.status_code == 200
        submission_id = submit_response.json()["id"]
        
        # Get initial range count
        initial_stats = requests.get(f"{BASE_URL}/api/stats").json()
        initial_count = initial_stats["total_ranges"]
        
        # Approve the submission
        approve_response = requests.post(f"{BASE_URL}/api/admin/submissions/{submission_id}/approve")
        assert approve_response.status_code == 200
        
        approve_data = approve_response.json()
        assert "message" in approve_data
        assert "approved" in approve_data["message"].lower()
        
        # Verify submission is removed from pending list
        pending_response = requests.get(f"{BASE_URL}/api/admin/submissions")
        pending_data = pending_response.json()
        test_submission = next((s for s in pending_data if s["id"] == submission_id), None)
        assert test_submission is None, "Approved submission should not be in pending list"
        
        # Verify range is added to main directory
        new_stats = requests.get(f"{BASE_URL}/api/stats").json()
        assert new_stats["total_ranges"] == initial_count + 1, "Total ranges should increase by 1"
        
        # Verify the range can be retrieved from main directory
        range_response = requests.get(f"{BASE_URL}/api/ranges/{submission_id}")
        assert range_response.status_code == 200
        
        range_data = range_response.json()
        assert range_data["name"] == "TEST_Approve_Flow_Range"
        assert range_data["verified"] == True, "Approved range should be marked as verified"
        
        # Cleanup: Delete the approved range from main collection
        # Note: No delete endpoint exists, so we leave it for manual cleanup
    
    def test_approve_nonexistent_submission_returns_404(self):
        """Test approving non-existent submission returns 404"""
        response = requests.post(f"{BASE_URL}/api/admin/submissions/nonexistent-id-12345/approve")
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
