# Test Credentials

## User Accounts

### Test User
- **Email**: testuser@example.com
- **Password**: testpass123
- **Notes**: Standard test user for auth testing

## Admin Access

### Admin Dashboard
- **URL**: /admin
- **Password**: dmvgunrange2024
- **Notes**: Single password authentication for admin access

## Environment Variables for Testing
Test files use environment variables with fallbacks:
- `TEST_USER_EMAIL` - defaults to testuser@example.com
- `TEST_USER_PASSWORD` - defaults to testpass123
- `REACT_APP_BACKEND_URL` - Required for API calls

## MongoDB
- Uses local connection: mongodb://localhost:27017
- No authentication required for local development
