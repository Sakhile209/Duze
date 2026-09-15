# Duze

Local favourites. Delivered. An original delivery marketplace for eXobho (Ixopo), KwaZulu-Natal.

## Design first, build incrementally

The [14-part product and architecture blueprint](docs/PROJECT_PLAN.md) covers assumptions/questions, PRD, four user journeys, MVP/future scope, architecture, ERD, order state machine, dispatch sequence, API/events, repository layout, UI system/wireframes, security/compliance, acceptance criteria and eight sprints.

**Increment 1: catalogue and order-domain foundation.** This is a working development preview, not a live delivery service.

Implemented:

- Responsive Next.js + TypeScript customer home, searchable/filterable kitchen catalogue, menu dialog, sold-out/closed states and session-only single-kitchen basket with quantity controls and explicit replacement consent.
- Original forest-green, warm-cream and orange design inspired by the supplied reference. Existing local concept artwork is reused and optimized through Next Image; merchant photographs are illustrative, not verified business images.
- Java 21-targeted Spring Boot API reading approved merchants and ordinary menus from PostgreSQL; public reads only, other routes denied.
- Flyway V1/V2 migrations, five fictional pilot merchants and sample menu data, static [OpenAPI contract](services/api/src/main/resources/static/openapi.yaml).
- Full requested order-state vocabulary, graph/actor checks, reason requirements and audit-event value generation. This pure domain component does **not yet persist order transitions** or check transactional business prerequisites.
- JUnit domain tests, PostgreSQL API integration tests, desktop/mobile Playwright tests, Dockerfiles, local Compose and GitHub Actions verification.

Not implemented yet: account login/RBAC workflows, authoritative quotes/checkout/payments, live orders/dispatch/tracking, merchant/admin dashboards, Expo customer/rider apps, push, maps, S3 and staging/production deployment. Their contracts and delivery sequence are in the blueprint. The basket cannot place orders, take payments or quote delivery fees. Restricted products are excluded from the public API.

## Preview

[Desktop screenshot](docs/screenshots/desktop.png) · [Mobile screenshot](docs/screenshots/mobile.png)

## Run locally with Docker

Requirements: Docker Engine/Compose with access to the internet for initial image/dependency downloads. The full image build could not be completed in this environment because Docker could not resolve Maven Central; the native API/web builds and PostgreSQL/browser tests passed. See [verification details](docs/INCREMENT_1.md).

```bash
docker compose -f infra/compose/docker-compose.yml up --build -d
```

Wait until the API is healthy:

```bash
curl --fail http://localhost:8080/actuator/health
```

Then seed once, after Flyway has migrated the empty database:

```bash
docker compose -f infra/compose/docker-compose.yml --profile seed run --rm seed
```

Open **http://localhost:3000**. API: **http://localhost:8080/api/v1/merchants**. OpenAPI: **http://localhost:8080/openapi.yaml** (import into Swagger Editor; interactive Swagger UI is not bundled yet).

The seed is development-only and intentionally fails atomically if run twice. It does not create usable login credentials. Sample zone and financial values are not approved pilot rates. Redis is optional under the `workers` profile and is not needed for catalogue reads.

Stop without deleting your database:

```bash
docker compose -f infra/compose/docker-compose.yml down
```

### Existing database from the original repository

The old Compose setup loaded SQL directly without Flyway history. This version uses PostgreSQL 17 with a separate named Compose volume (`duze_duze_postgres`); do not mount an old PostgreSQL 16 volume into PostgreSQL 17. Retain/back up old data. To migrate a legacy database deliberately, validate its schema against V1, baseline Flyway at version 1, then apply V2 using the matching PostgreSQL version. Automatic baselining is disabled to avoid silently adopting an unknown schema. Do not delete a volume containing data you need.

## Run apps outside Docker

Requirements: JDK 21+, Maven 3.9+, Node 24 LTS, npm and PostgreSQL 17. Source compiles to Java 21 even when the local JDK is newer.

```bash
docker compose -f infra/compose/docker-compose.yml up -d postgres
mvn -pl services/api spring-boot:run
```

In another terminal, after the health check succeeds:

```bash
docker compose -f infra/compose/docker-compose.yml --profile seed run --rm seed
cd apps/web
npm ci
npm run dev
```

Default API database is `jdbc:postgresql://localhost:5432/duze`, user `duze`, local password `duze_dev_password`. Override `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` and `PORT` as needed. Web's server-only `DUZE_API_URL` defaults to `http://localhost:8080`; see [example environment](apps/web/.env.example). The web displays an error with retry if the API is down; there is no silent mock fallback.

## Tests

Domain unit tests (no database required; integration tests are explicitly skipped):

```bash
mvn test
```

PostgreSQL integration suite (use a dedicated development/test database; fixtures roll back but Flyway performs schema migrations):

```bash
DUZE_INTEGRATION_TESTS=true DATABASE_URL=jdbc:postgresql://localhost:5432/duze mvn verify
```

Browser tests require the running API and the seeded catalogue. Playwright starts the production web server automatically:

```bash
cd apps/web
npm ci
npm run build
npx playwright install chromium
npm test
```

Tests cover both desktop and mobile Chromium viewports, real API browsing/search, sold-out/closed controls, single-merchant basket replacement, quantity changes, empty states and recovery from a simulated API outage. These are responsive web tests, not native Android/iOS device tests.

CI runs Java 21 integration tests, fresh migrations, seed, production web build and browser tests against PostgreSQL. The staging/production promotion and operational gates are planned in sprint 8; this workflow does not deploy.

## Next increment

Identity, ownership/RBAC, merchant onboarding and catalogue management. Then server quotes/idempotent ordering and event persistence, followed by payment/dispatch and the Expo apps. See the blueprint for concrete acceptance criteria and outstanding pilot decisions.
