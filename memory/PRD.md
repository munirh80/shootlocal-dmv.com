# DMV Gun Ranges - Product Requirements Document

## Original Problem Statement
Build a shooting range directory for all gun ranges in the DMV area (DC, Maryland & Virginia), similar to wheretoshoot.org. The application should allow users to search, filter, and view detailed information about shooting ranges.

## Target Users
- Gun owners looking for nearby shooting ranges
- First-time shooters seeking beginner-friendly facilities
- Competitive shooters seeking specific range types
- Travelers looking for ranges in the DMV area

## Core Requirements
1. ✅ Display a directory of shooting ranges in VA, MD, and DC
2. ✅ Search functionality by city or ZIP code
3. ✅ Advanced filtering (indoor/outdoor, firearms types, services, competitions)
4. ✅ Detailed range pages with hours, contact info, amenities
5. ✅ Full-width video header (YouTube embed)
6. ✅ Dark/Light mode theme toggle
7. ✅ Real data imported from user's spreadsheet

## What's Been Implemented (January 2026)

### Frontend
- Homepage with search bar, radius selector, and filter panel
- Range cards displaying key info (name, address, phone, website, amenities)
- Range detail page with comprehensive information
- YouTube video header (full-width, responsive)
- Dark/Light mode toggle with localStorage persistence
- Responsive design for mobile and desktop

### Backend
- FastAPI server with RESTful API
- MongoDB database integration
- Endpoints: `/api/ranges`, `/api/ranges/{id}`, `/api/stats`, `/api/states`
- Filtering by amenities, range type, and location

### Data
- **78 real shooting ranges** imported from user's spreadsheet
  - 42 Virginia ranges
  - 33 Maryland ranges
  - 3 DC ranges

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Motor (async MongoDB driver)
- **Database**: MongoDB
- **State Management**: React Context (for theme)

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ranges` | GET | List ranges with optional filters |
| `/api/ranges/{id}` | GET | Get single range details |
| `/api/stats` | GET | Get range statistics |
| `/api/states` | GET | Get list of states |

## Database Schema
```javascript
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
  hours: {
    monday: string,
    tuesday: string,
    // ... etc
  },
  amenities: {
    indoor: boolean,
    outdoor: boolean,
    handgun: boolean,
    rifle: boolean,
    // ... 30+ amenity flags
  },
  pricing: object,
  photos: array,
  nssf_member: boolean,
  verified: boolean
}
```

## Prioritized Backlog

### P0 - Completed
- [x] Core directory functionality
- [x] Search and filtering
- [x] Real data import (78 ranges)
- [x] Dark/Light mode
- [x] Video header

### P1 - Next Up
- [ ] Add geocoding to populate lat/lng for map features
- [ ] Implement map view with range markers
- [ ] Add range submission form for owners

### P2 - Future
- [ ] Bulk import system (CSV/Excel upload)
- [ ] User reviews and ratings
- [ ] Email verification for range submissions
- [ ] SEO optimization
- [ ] Analytics dashboard

## Test Coverage
- Backend: 100% (15/15 tests passed)
- Frontend: All features manually verified
- Test files: `/app/backend/tests/test_dmv_ranges.py`
