"""
User Authentication & Favorites API Tests
Tests for user registration, login, logout, and favorites functionality
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from environment
TEST_USER_EMAIL = os.environ.get('TEST_USER_EMAIL', 'testuser@example.com')
TEST_USER_PASSWORD = os.environ.get('TEST_USER_PASSWORD', 'testpass123')


class TestUserRegistration:
    """Tests for /api/auth/register endpoint"""
    
    def test_register_new_user_success(self):
        """Test successful user registration"""
        unique_email = f"test_register_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test Registration User",
            "email": unique_email,
            "password": "testpass123"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data["success"] == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email.lower()
        assert data["user"]["name"] == "Test Registration User"
        assert "id" in data["user"]
        assert len(data["token"]) > 0
    
    def test_register_duplicate_email_fails(self):
        """Test registration fails with existing email"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Duplicate User",
            "email": TEST_USER_EMAIL,  # Already exists
            "password": "testpass123"
        })
        
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower()
    
    def test_register_short_password_fails(self):
        """Test registration fails with password < 6 characters"""
        unique_email = f"test_short_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Short Password User",
            "email": unique_email,
            "password": "12345"  # Too short
        })
        
        assert response.status_code == 400
        data = response.json()
        assert "6 characters" in data["detail"].lower()
    
    def test_register_invalid_email_fails(self):
        """Test registration fails with invalid email format"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Invalid Email User",
            "email": "not-an-email",
            "password": "testpass123"
        })
        
        assert response.status_code == 422  # Validation error


class TestUserLogin:
    """Tests for /api/auth/login endpoint"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data["success"] == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        assert "id" in data["user"]
        assert "name" in data["user"]
    
    def test_login_wrong_password_fails(self):
        """Test login fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data["detail"].lower()
    
    def test_login_nonexistent_user_fails(self):
        """Test login fails with non-existent email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "testpass123"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data["detail"].lower()
    
    def test_login_case_insensitive_email(self):
        """Test login works with different email case"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL.upper(),
            "password": TEST_USER_PASSWORD
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestAuthMe:
    """Tests for /api/auth/me endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_get_current_user_success(self, auth_token):
        """Test getting current user info with valid token"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert "email" in data
        assert "name" in data
        assert data["email"] == TEST_USER_EMAIL
    
    def test_get_current_user_no_token_fails(self):
        """Test getting current user fails without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code in [401, 403]
    
    def test_get_current_user_invalid_token_fails(self):
        """Test getting current user fails with invalid token"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": "Bearer invalid_token_12345"
        })
        
        assert response.status_code in [401, 403]


class TestFavorites:
    """Tests for favorites endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture
    def sample_range_id(self):
        """Get a valid range ID for testing"""
        response = requests.get(f"{BASE_URL}/api/ranges?limit=1")
        assert response.status_code == 200
        ranges = response.json()
        assert len(ranges) > 0
        return ranges[0]["id"]
    
    def test_add_favorite_success(self, auth_token, sample_range_id):
        """Test adding a range to favorites"""
        response = requests.post(
            f"{BASE_URL}/api/favorites/{sample_range_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "added" in data["message"].lower()
    
    def test_add_favorite_no_auth_fails(self, sample_range_id):
        """Test adding favorite fails without authentication"""
        response = requests.post(f"{BASE_URL}/api/favorites/{sample_range_id}")
        
        assert response.status_code in [401, 403]
    
    def test_add_favorite_nonexistent_range_fails(self, auth_token):
        """Test adding non-existent range to favorites fails"""
        response = requests.post(
            f"{BASE_URL}/api/favorites/nonexistent-range-id",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 404
    
    def test_get_favorites_success(self, auth_token, sample_range_id):
        """Test getting user's favorites"""
        # First add a favorite
        requests.post(
            f"{BASE_URL}/api/favorites/{sample_range_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Get favorites
        response = requests.get(
            f"{BASE_URL}/api/favorites",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify the range is in favorites
        favorite_ids = [r["id"] for r in data]
        assert sample_range_id in favorite_ids
    
    def test_get_favorites_no_auth_fails(self):
        """Test getting favorites fails without authentication"""
        response = requests.get(f"{BASE_URL}/api/favorites")
        
        assert response.status_code in [401, 403]
    
    def test_remove_favorite_success(self, auth_token, sample_range_id):
        """Test removing a range from favorites"""
        # First add the favorite
        requests.post(
            f"{BASE_URL}/api/favorites/{sample_range_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Remove the favorite
        response = requests.delete(
            f"{BASE_URL}/api/favorites/{sample_range_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "removed" in data["message"].lower()
        
        # Verify it's removed
        get_response = requests.get(
            f"{BASE_URL}/api/favorites",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        favorites = get_response.json()
        favorite_ids = [r["id"] for r in favorites]
        assert sample_range_id not in favorite_ids
    
    def test_remove_favorite_no_auth_fails(self, sample_range_id):
        """Test removing favorite fails without authentication"""
        response = requests.delete(f"{BASE_URL}/api/favorites/{sample_range_id}")
        
        assert response.status_code in [401, 403]
    
    def test_check_favorite_status(self, auth_token, sample_range_id):
        """Test checking if a range is favorited"""
        # Add to favorites first
        requests.post(
            f"{BASE_URL}/api/favorites/{sample_range_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Check status
        response = requests.get(
            f"{BASE_URL}/api/favorites/check/{sample_range_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_favorite"] == True
        
        # Remove and check again
        requests.delete(
            f"{BASE_URL}/api/favorites/{sample_range_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        response2 = requests.get(
            f"{BASE_URL}/api/favorites/check/{sample_range_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["is_favorite"] == False


class TestGoogleOAuthCallback:
    """Tests for Google OAuth callback endpoint"""
    
    def test_google_callback_invalid_session_fails(self):
        """Test Google callback fails with invalid session ID"""
        response = requests.post(f"{BASE_URL}/api/auth/google/callback", json={
            "session_id": "invalid_session_id_12345"
        })
        
        # Should fail with 401 or 500 (depending on how Emergent Auth responds)
        assert response.status_code in [401, 500]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
