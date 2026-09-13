# Duze
Duze is a web and mobile local delivery platform connecting customers with restaurants, shisanyamas and participating stores, while enabling motorcycle riders to receive and deliver orders in real time.

## Planning

- [Project plan](docs/PROJECT_PLAN.md): assumptions, PRD, journeys, MVP scope, architecture, ERD, API plan, UI wireframes, security checklist, sprint plan and acceptance criteria.
- [Static website](site/index.html): a responsive Duze information site using the project brief content.

## Current Build Slice

The repository now contains the first backend foundation slice:

- Monorepo structure for web, mobile, backend services, packages, infra and seed data.
- Java order-state domain model with valid transitions, cancellation rules and audit-event output.
- PostgreSQL initial schema covering the MVP core entities.
- eXobho pilot seed data with one zone, admin, merchant, rider, customer and sample menu.
- Docker Compose for local PostgreSQL and Redis.

The HTTP API layer is not wired yet. The next implementation slice should add Spring Boot, REST controllers, persistence repositories, validation and OpenAPI once dependencies are available.

## Run And Test

Compile the backend module:

```bash
mvn test-compile
```

Run the current order state-machine test harness:

```bash
java -cp services/api/target/classes:services/api/target/test-classes za.co.duze.orders.OrderStateMachineTest
```

Start local infrastructure:

```bash
docker compose -f infra/compose/docker-compose.yml up
```

On a fresh Postgres volume, Compose loads:

- `services/api/src/main/resources/db/migration/V1__initial_schema.sql`
- `seed/exobho/pilot_seed.sql`
