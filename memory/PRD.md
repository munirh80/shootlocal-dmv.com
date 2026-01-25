# DMV Gun Range - Product Requirements Document

## Original Problem Statement
Build a shooting range directory for all gun ranges in the DMV area (DC, Maryland & Virginia), similar to wheretoshoot.org. The application should allow users to search, filter, and view detailed information about shooting ranges.

## Target Users
- Gun owners looking for nearby shooting ranges
- First-time shooters seeking beginner-friendly facilities
- Competitive shooters seeking specific range types
- Travelers looking for ranges in the DMV area
- Range owners who want to list their facility

## Core Requirements
1. ✅ Display a directory of shooting ranges in VA, MD, and DC
2. ✅ Search functionality by city or ZIP code
3. ✅ Advanced filtering (indoor/outdoor, firearms types, services, competitions)
4. ✅ Detailed range pages with hours, contact info, amenities
5. ✅ Full-width video header (YouTube embed)
6. ✅ Dark/Light mode theme toggle
7. ✅ Real data imported from user's spreadsheet
8. ✅ Interactive map view with all ranges
9. ✅ Range submission form for owners
10. ✅ Admin dashboard for reviewing submissions
11. ✅ User reviews and ratings system
12. ✅ Bulk data import (CSV/Excel)
13. ✅ SEO optimization (meta tags, sitemap)
14. ✅ Social sharing buttons
15. ✅ User accounts and favorites (email/password + Google OAuth)
16. ✅ Email notifications for new submissions
17. ✅ Password reset / forgot password
18. ✅ User profile management (change password, delete account)

## What's Been Implemented (January 2026)

### Frontend
- Homepage with search bar, radius selector, and filter panel
- **List/Map view toggle** - Switch between list and interactive map
- **Interactive map** using Leaflet with red markers for each range
- Range cards displaying key info (name, address, phone, website, amenities)
- Range detail page with comprehensive information
- **Submit Range page** - Full form for range owners to add their ranges
- **Admin Dashboard** - Review and approve/reject submitted ranges, bulk import
- YouTube video header (full-width, responsive)
- Dark/Light mode toggle with localStorage persistence
- Responsive design for mobile and desktop
- **User Authentication** - Login/Register modal with email/password and Google OAuth
- **User Menu** - Dropdown showing user name, Profile, My Favorites, logout
- **Favorites Page** - View and manage saved ranges
- **Save to Favorites button** - On range detail pages
- **Forgot Password** - Modal to request password reset email
- **Reset Password Page** - Enter new password with reset token
- **Profile Page** - View account type, edit name, change password, delete account

### Backend
- FastAPI server with RESTful API
- MongoDB database integration
- Range submission endpoint with email notification
- Admin endpoints for submission management
- User authentication (JWT-based email/password + Google OAuth)
- Favorites management endpoints
- SEO endpoints (sitemap.xml, robots.txt)
- Photo upload and management
- Reviews and ratings system
- Bulk import from CSV/Excel

### Data
- **78 real shooting ranges** imported from user's spreadsheet
  - 42 Virginia ranges
  - 33 Maryland ranges
  - 3 DC ranges
- **All ranges geocoded** with latitude/longitude coordinates

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn/UI, react-leaflet, Leaflet, react-helmet-async
- **Backend**: FastAPI, Motor (async MongoDB driver), python-jose (JWT), passlib (password hashing), httpx
- **Database**: MongoDB
- **State Management**: React Context (for theme and auth)
- **Maps**: OpenStreetMap tiles via Leaflet
- **Email**: Resend
- **Auth**: JWT + Emergent Google OAuth

## API Endpoints

### Public Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ranges` | GET | List ranges with optional filters |
| `/api/ranges/{id}` | GET | Get single range details |
| `/api/ranges/submit` | POST | Submit a new range for review |
| `/api/stats` | GET | Get range statistics |
| `/api/states` | GET | Get list of states (VA, MD, DC) |
| `/api/reviews` | POST | Submit a review |
| `/api/reviews/{range_id}` | GET | Get reviews for a range |
| `/api/sitemap.xml` | GET | XML sitemap for SEO |
| `/api/robots.txt` | GET | Robots.txt for SEO |

### Auth Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user (email/password) |
| `/api/auth/login` | POST | Login user (email/password) |
| `/api/auth/me` | GET | Get current user info (protected) |
| `/api/auth/google/callback` | POST | Process Google OAuth callback |

### Favorites Endpoints (Protected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/favorites` | GET | Get user's favorite ranges |
| `/api/favorites/{range_id}` | POST | Add range to favorites |
| `/api/favorites/{range_id}` | DELETE | Remove range from favorites |
| `/api/favorites/check/{range_id}` | GET | Check if range is favorited |

### Admin Endpoints (Protected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/login` | POST | Authenticate admin |
| `/api/admin/logout` | POST | Logout admin |
| `/api/admin/submissions` | GET | List pending submissions |
| `/api/admin/submissions/{id}/approve` | POST | Approve submission |
| `/api/admin/submissions/{id}/reject` | POST | Reject submission |
| `/api/admin/change-password` | POST | Change admin password |
| `/api/admin/bulk-import` | POST | Import ranges from CSV/Excel |

## Database Schema

### ranges collection
```javascript
{
  id: string,
  name: string,
  description: string,
  phone: string,
  website: string,
  email: string,
  location: {
    address: string,
    city: string,
    state: string,  // "VA", "MD", or "DC"
    zip_code: string,
    latitude: number,
    longitude: number
  },
  hours: { monday: string, ... },
  amenities: { indoor: boolean, outdoor: boolean, ... },
  pricing: { day_pass: number, ... },
  photos: [string],
  google_rating: number,
  google_reviews: number,
  user_rating: number,
  user_reviews_count: number,
  verified: boolean,
  nssf_member: boolean,
  created_at: string,
  updated_at: string
}
```

### users collection
```javascript
{
  id: string,
  email: string,
  password_hash: string,  // null for Google OAuth users
  name: string,
  picture: string,  // from Google OAuth
  auth_provider: string,  // "google" or null
  favorites: [string],  // array of range IDs
  created_at: string,
  updated_at: string
}
```

### reviews collection
```javascript
{
  id: string,
  range_id: string,
  reviewer_name: string,
  rating: number,  // 1-5
  comment: string,
  helpful_count: number,
  created_at: string
}
```

## Pages & Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Main directory with list/map views |
| `/range/:id` | RangeDetailPage | Individual range details |
| `/submit` | SubmitRangePage | Form to submit a new range |
| `/admin` | AdminLogin | Admin login page |
| `/admin/dashboard` | AdminDashboard | Admin panel |
| `/auth/callback` | AuthCallback | Google OAuth callback handler |
| `/favorites` | FavoritesPage | User's saved ranges |

## Credentials
- **Admin Password**: `dmvgunrange2024` (stored in backend/.env)
- **Test User**: `testuser@example.com` / `testpass123`

## Prioritized Backlog

### P0 - Completed ✅
- [x] Core directory functionality
- [x] Search and filtering
- [x] Real data import (78 ranges)
- [x] Dark/Light mode
- [x] Video header
- [x] Interactive map view with geocoded ranges
- [x] Range submission form
- [x] Admin dashboard for reviewing submissions
- [x] Admin authentication (password protected)
- [x] Map marker clustering for better performance
- [x] Photo uploads for range submissions
- [x] Photo gallery on range detail pages (with lightbox)
- [x] Change admin password feature
- [x] User reviews and ratings system
- [x] Bulk data import (CSV/Excel)
- [x] SEO optimization (meta tags, sitemap)
- [x] Social sharing buttons
- [x] User accounts and favorites (email/password + Google OAuth)
- [x] Email notifications for range submissions

### P1 - Next Up
- [ ] Print-friendly range details
- [ ] Password reset / forgot password
- [ ] User profile management (edit name, delete account)

### P2 - Future
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Range comparison feature
- [ ] Booking integration
- [ ] Push notifications for favorite range updates

## Test Coverage
- Backend: 100% - All auth and favorites tests passing
- Frontend: All features verified
- Test files: 
  - `/app/backend/tests/test_user_auth.py`
  - `/app/test_reports/iteration_5.json`

## Configuration Files
- `/app/backend/.env` - Backend environment variables
- `/app/frontend/.env` - Frontend environment variables
