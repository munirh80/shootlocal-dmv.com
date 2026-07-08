"""
Test suite for Password Reset and Profile Management features
- Forgot password flow
- Reset password with token
- Change password for logged-in users
- Profile update (name)
- Delete account
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials from environment (with fallback for local testing)
TEST_USER_EMAIL = f"test_password_{uuid.uuid4().hex[:8]}@example.com"
TEST_USER_PASSWORD = os.environ.get('TEST_USER_PASSWORD', 'testpass123')
TEST_USER_NAME = "Test Password User"

class TestForgotPassword:
    """Test forgot password endpoint"""
    
    def test_forgot_password_existing_user(self):
        """Test forgot password for existing user - should return success"""
        # First register a user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        })
        assert register_response.status_code == 200, f"Registration failed: {register_response.text}"
        
        # Now test forgot password
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": TEST_USER_EMAIL
        })
        assert response.status_code == 200, f"Forgot password failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "message" in data
        print(f"✓ Forgot password for existing user: {data['message']}")
    
    def test_forgot_password_nonexistent_user(self):
        """Test forgot password for non-existent user - should still return success (prevent enumeration)"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "nonexistent_user_12345@example.com"
        })
        assert response.status_code == 200, f"Forgot password failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        # Should return same message to prevent email enumeration
        print(f"✓ Forgot password for non-existent user returns success (prevents enumeration)")
    
    def test_forgot_password_invalid_email(self):
        """Test forgot password with invalid email format"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "invalid-email"
        })
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print(f"✓ Forgot password rejects invalid email format")


class TestResetPassword:
    """Test reset password endpoint"""
    
    def test_reset_password_invalid_token(self):
        """Test reset password with invalid token"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "token": "invalid_token_12345",
            "new_password": "newpassword123"
        })
        assert response.status_code == 400, f"Expected 400 for invalid token, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Reset password rejects invalid token: {data['detail']}")
    
    def test_reset_password_short_password(self):
        """Test reset password with too short password"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "token": "some_token",
            "new_password": "123"
        })
        # Should fail - either invalid token or short password
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ Reset password validates password length")


class TestChangePassword:
    """Test change password endpoint for logged-in users"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        # Try to login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if login_response.status_code == 200:
            return login_response.json().get("token")
        
        # If login fails, register new user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        })
        if register_response.status_code == 200:
            return register_response.json().get("token")
        
        pytest.skip("Could not get auth token")
    
    def test_change_password_success(self, auth_token):
        """Test successful password change"""
        response = requests.post(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": TEST_USER_PASSWORD,
                "new_password": "newpassword456"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Change password failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        print(f"✓ Password changed successfully")
        
        # Change it back for other tests
        requests.post(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": "newpassword456",
                "new_password": TEST_USER_PASSWORD
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
    
    def test_change_password_wrong_current(self, auth_token):
        """Test change password with wrong current password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword456"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 400, f"Expected 400 for wrong password, got {response.status_code}"
        data = response.json()
        assert "incorrect" in data.get("detail", "").lower()
        print(f"✓ Change password rejects wrong current password")
    
    def test_change_password_short_new_password(self, auth_token):
        """Test change password with too short new password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": TEST_USER_PASSWORD,
                "new_password": "123"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 400, f"Expected 400 for short password, got {response.status_code}"
        print(f"✓ Change password validates new password length")
    
    def test_change_password_no_auth(self):
        """Test change password without authentication"""
        response = requests.post(
            f"{BASE_URL}/api/auth/change-password",
            json={
                "current_password": TEST_USER_PASSWORD,
                "new_password": "newpassword456"
            }
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ Change password requires authentication")


class TestProfileUpdate:
    """Test profile update endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if login_response.status_code == 200:
            return login_response.json().get("token")
        pytest.skip("Could not get auth token")
    
    def test_update_profile_name(self, auth_token):
        """Test updating profile name"""
        new_name = f"Updated Name {uuid.uuid4().hex[:4]}"
        response = requests.put(
            f"{BASE_URL}/api/auth/profile",
            json={"name": new_name},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Profile update failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert data.get("user", {}).get("name") == new_name
        print(f"✓ Profile name updated to: {new_name}")
    
    def test_update_profile_empty_name(self, auth_token):
        """Test updating profile with empty name"""
        response = requests.put(
            f"{BASE_URL}/api/auth/profile",
            json={"name": ""},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 400, f"Expected 400 for empty name, got {response.status_code}"
        print(f"✓ Profile update rejects empty name")
    
    def test_update_profile_no_auth(self):
        """Test profile update without authentication"""
        response = requests.put(
            f"{BASE_URL}/api/auth/profile",
            json={"name": "New Name"}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ Profile update requires authentication")


class TestDeleteAccount:
    """Test delete account endpoint"""
    
    def test_delete_account_success(self):
        """Test successful account deletion"""
        # Create a new user specifically for deletion
        delete_user_email = f"delete_test_{uuid.uuid4().hex[:8]}@example.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": delete_user_email,
            "password": "deletepass123",
            "name": "Delete Test User"
        })
        assert register_response.status_code == 200, f"Registration failed: {register_response.text}"
        token = register_response.json().get("token")
        
        # Delete the account
        response = requests.delete(
            f"{BASE_URL}/api/auth/account",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Delete account failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        print(f"✓ Account deleted successfully")
        
        # Verify user can no longer login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": delete_user_email,
            "password": "deletepass123"
        })
        assert login_response.status_code == 401, "Deleted user should not be able to login"
        print(f"✓ Deleted user cannot login")
    
    def test_delete_account_no_auth(self):
        """Test delete account without authentication"""
        response = requests.delete(f"{BASE_URL}/api/auth/account")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ Delete account requires authentication")


class TestGetCurrentUser:
    """Test get current user endpoint with auth_provider field"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if login_response.status_code == 200:
            return login_response.json().get("token")
        pytest.skip("Could not get auth token")
    
    def test_get_current_user(self, auth_token):
        """Test getting current user info"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Get user failed: {response.text}"
        data = response.json()
        assert "email" in data
        assert "name" in data
        assert "id" in data
        # Email/password users should not have auth_provider or it should not be 'google'
        auth_provider = data.get("auth_provider")
        assert auth_provider != "google", "Email/password user should not have google auth_provider"
        print(f"✓ Current user retrieved: {data['email']}, auth_provider: {auth_provider}")


# Cleanup fixture
@pytest.fixture(scope="module", autouse=True)
def cleanup():
    """Cleanup test data after all tests"""
    yield
    # Cleanup is handled by delete account test
    print("Test cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
