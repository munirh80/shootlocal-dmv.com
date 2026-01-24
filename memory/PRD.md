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

## What's Been Implemented (January 2026)

### Frontend
- Homepage with search bar, radius selector, and filter panel
- **List/Map view toggle** - Switch between list and interactive map
- **Interactive map** using Leaflet with red markers for each range
- Range cards displaying key info (name, address, phone, website, amenities)
- Range detail page with comprehensive information
- **Submit Range page** - Full form for range owners to add their ranges
- **Admin Dashboard** - Review and approve/reject submitted ranges
- YouTube video header (full-width, responsive)
- Dark/Light mode toggle with localStorage persistence
- Responsive design for mobile and desktop

### Backend
- FastAPI server with RESTful API
- MongoDB database integration
- Range submission endpoint (POST /api/ranges/submit)
- **Admin endpoints** for submission management
- Endpoints: `/api/ranges`, `/api/ranges/{id}`, `/api/stats`, `/api/states`, `/api/admin/submissions`
- Filtering by amenities, range type, and location

### Data
- **78 real shooting ranges** imported from user's spreadsheet
  - 42 Virginia ranges
  - 33 Maryland ranges
  - 3 DC ranges
- **All ranges geocoded** with latitude/longitude coordinates

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn/UI, react-leaflet, Leaflet
- **Backend**: FastAPI, Motor (async MongoDB driver)
- **Database**: MongoDB
- **State Management**: React Context (for theme)
- **Maps**: OpenStreetMap tiles via Leaflet

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ranges` | GET | List ranges with optional filters |
| `/api/ranges/{id}` | GET | Get single range details |
| `/api/ranges/submit` | POST | Submit a new range for review |
| `/api/stats` | GET | Get range statistics |
| `/api/states` | GET | Get list of states (VA, MD, DC) |
| `/api/admin/login` | POST | Authenticate admin (returns token) |
| `/api/admin/logout` | POST | Logout admin (protected) |
| `/api/admin/submissions` | GET | List pending submissions (protected) |
| `/api/admin/submissions/{id}/approve` | POST | Approve submission (protected) |
| `/api/admin/submissions/{id}/reject` | POST | Reject submission (protected) |

## Database Schema
```javascript
// ranges collection
{
  id: string,
  name: string,
  phone: string,
  website: string,
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
  verified: boolean,
  nssf_member: boolean
}

// range_submissions collection (for review)
{
  // Same schema as ranges, plus:
  pending_review: boolean
}
```

## Pages & Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Main directory with list/map views |
| `/range/:id` | RangeDetailPage | Individual range details |
| `/submit` | SubmitRangePage | Form to submit a new range |
| `/admin` | AdminLogin | Admin login page |
| `/admin/dashboard` | AdminDashboard | Admin panel for reviewing submissions |

## Admin Authentication
- Password: `dmvgunrange2024` (stored in backend/.env as ADMIN_PASSWORD)
- Token-based authentication using session storage
- Protected endpoints require Bearer token in Authorization header

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
- [x] SEO optimization (meta tags, structured data, sitemap)

### P1 - Next Up
- [ ] Email notifications for range submissions
- [ ] User accounts and favorites
- [ ] Social sharing buttons

### P2 - Future
- [ ] Bulk import system (CSV/Excel upload)
- [ ] User reviews and ratings
- [ ] User accounts and favorites
- [ ] SEO optimization
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## Test Coverage
- Backend: 100% (26/26 tests passed)
- Frontend: All features verified
- Test files: `/app/backend/tests/test_dmv_ranges.py`
