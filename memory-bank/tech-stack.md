# Tech Stack

## Frontend
- React 19
- Create React App via CRACO for local config customization
- React Router for page routing
- Tailwind CSS for styling
- Shadcn/ui components for a consistent UI pattern
- Leaflet + react-leaflet for interactive map rendering
- react-helmet-async for SEO metadata

## Backend
- Python 3.x
- FastAPI
- Motor for async MongoDB connection
- Pydantic for request/response validation
- passlib + python-jose for password hash and JWT handling
- httpx for outbound HTTP calls
- aiofiles for upload handling

## Data and infrastructure
- MongoDB for ranges, users, submissions, reviews, and resets
- Local file uploads for range photos
- Optional email sending with Resend
- Environment configuration via .env files

## Quality and ops
- pytest for backend validation
- ESLint and build tooling for frontend verification
- Standardized API responses and explicit validation on critical endpoints

## Decision summary
This stack is intentionally lightweight and fast to ship: a Python API, MongoDB document store, and React UI with a map-first UX. It matches the repo’s current product scope without introducing an unnecessary framework layer.
