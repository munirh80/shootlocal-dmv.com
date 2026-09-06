# Design Document

## Product vision
DMV Gun Range is a local directory and discovery app for shooting ranges across Washington, DC, Maryland, and Virginia. It helps users find ranges by location, filter by offerings, view detailed amenities and pricing, and submit or review range listings.

## Goals
- Make it easy to discover nearby ranges by city, ZIP code, or map proximity.
- Provide rich range detail pages with hours, access, amenities, and contact information.
- Support owner and admin workflows for submissions and approvals.
- Give users account features for favorites, profile management, and password recovery.
- Maintain strong SEO and shareability for public discovery.

## Target users
- Casual gun owners searching for local ranges.
- New shooters looking for beginner-friendly or instructional facilities.
- Competitive shooters searching for specific disciplines.
- Travelers looking for a short list of nearby facilities.
- Range owners who want to list/maintain their profile.

## Core user journeys
1. Search for nearby ranges from the homepage.
2. Filter by indoor/outdoor, range types, and local preferences.
3. Open a range detail page to inspect amenities, contact details, and photos.
4. Save a range to favorites after authentication.
5. Submit a new range listing for review.
6. Use admin dashboard to approve or reject submissions.

## Functional requirements
- Search and browse ranges by state, city, ZIP, and radius.
- Filter results by access type, training, range disciplines, and amenities.
- Display list and map views.
- Support authenticated user favorites and profile flows.
- Support admin moderation and bulk data import.
- Provide review and rating capability.
- Support SEO endpoints for sitemap and robots.txt.
- Include dark/light theme and responsive layout.

## Non-goals
- Full social network features outside the range directory context.
- Multi-region enterprise admin tooling beyond the current app.
- A separate CMS system for a large editorial workflow.

## Key design decisions
- Use a single FastAPI backend to keep the data model and API straightforward.
- Keep MongoDB as the canonical source of range, user, submission, and review data.
- Use React front-end with lightweight state management for theme and auth.
- Prefer public search + user-specific features over a heavy backend event system.
- Keep the app optimized for local search and map-driven browsing instead of complex analytics.

## Risks and mitigations
- Data quality risk: imported range data will vary; mitigate with verification workflows and admin review.
- Search complexity risk: advanced filters could become confusing; mitigate by keeping filters limited and explicit.
- Auth complexity risk: secure user flows require careful JWT and password-reset handling; mitigate with tested endpoints and clear validation.
- Performance risk: maps and large result sets may slow down; mitigate with query limits, debouncing, and lazy rendering.
