# Increment 1 review

The complete product specification is in [PROJECT_PLAN.md](PROJECT_PLAN.md). This increment makes catalogue exploration runnable and establishes the order-domain vocabulary; it does not implement the complete marketplace.

## Delivered

- Next.js customer discovery, kitchen search/category filters, menu, basket quantities and explicit single-merchant replacement.
- Keyboard-accessible native dialogs, empty/error/retry states, mobile navigation and locally optimized concept artwork.
- Spring Boot public read API backed by PostgreSQL, with restricted/unapproved catalogue filtering and all other routes closed.
- Flyway migrations, corrected five-merchant development seed, OpenAPI, Docker and CI configuration.
- Graph/role validation for the full requested order-state progression and exception/refund states. Order persistence, prerequisites and dispatch locks are future command-service work.

## Verification on 14 September 2026

| Check | Result |
|---|---|
| Maven verify, target Java 21 (local JDK 25) | Passed: 8 domain + 6 PostgreSQL integration tests |
| Fresh PostgreSQL 17 migrations | V1 and V2 applied successfully by Flyway |
| Development seed | Five kitchens and twelve menu items inserted atomically |
| TypeScript and Next.js production build | Passed |
| Playwright | Passed: 3 end-to-end scenarios on desktop and mobile Chromium, 6 total |
| Visual review | Desktop 1440px and mobile 390px, no horizontal page overflow |
| Docker Compose configuration | Validated |
| Full Docker image build | Blocked by container DNS: Maven Central could not be resolved; host networking also failed DNS |

The browser tests use the real catalogue API, with deliberate interception only for the outage scenario. Native iOS/Android, live payment, dispatch concurrency and deployment are not covered because those features have not been implemented. CI configuration is provided; a remote GitHub Actions run has not been triggered here.

## Next increment

Build identity/tenant authorization and merchant catalogue operations before exposing any order commands. Checkout must then use server quotes, idempotency and immutable snapshots; a browser basket subtotal is never an accepted payment amount.
