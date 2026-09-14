# Implemented API contract

The canonical [OpenAPI 3 contract](../../services/api/src/main/resources/static/openapi.yaml) is served by Spring Boot at `/openapi.yaml` and can be imported into Swagger Editor or an API client. Interactive Swagger UI will accompany the authenticated command API in the next slice.

Only catalogue GETs and health are public. No account, quote, payment, order or dispatch command is exposed in increment 1. See the full API plan in `../PROJECT_PLAN.md` for future routes and event contracts.
