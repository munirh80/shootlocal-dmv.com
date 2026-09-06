# Architecture

## High-level structure
- Frontend app under the frontend folder.
- API server under the backend folder.
- Shared product and requirement context in memory/PRD.md and the repo README.

## Frontend responsibilities
- Route-based browsing for home, details, favorites, profile, admin, and submission flows.
- User auth state management and theme state.
- Filtering, search, map rendering, and range cards.
- Form-based submissions and profile actions.

## Backend responsibilities
- Public range search and lookup endpoints.
- Authentication handlers for user and admin actions.
- Favorites and profile management.
- Review submission and summary aggregation.
- Upload handling and bulk-import support.
- SEO endpoints for sitemap and robots.txt.

## Data model patterns
- Range documents store location, amenities, hours, pricing, and metadata.
- User documents maintain account, favorites, and auth information.
- Review documents are separated from the range record for easier aggregation.
- Admin submissions live in a dedicated collection before approval.

## Integration boundaries
- The frontend calls the FastAPI endpoints through HTTP.
- MongoDB is the primary persistence layer.
- Email and external auth calls are intentionally isolated behind service-layer functions.

## Notes for future work
- Prefer API-contract and validation cleanup before adding large new features.
- Keep state and routing simple unless new product requirements demand more complexity.
- Continue validating the app from the user-facing journeys rather than broad speculative refactors.
