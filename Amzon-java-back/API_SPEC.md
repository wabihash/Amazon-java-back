# API Specification — Amazon Java Backend

This document lists the remaining backend endpoints, request/response shapes, auth requirements, and next implementation steps.

## Roles
- `USER`: authenticated shopper
- `ADMIN`: admin user, set via Firebase custom claim `admin: true`

## Products
- GET `/products` — public. Query: `q`, `category`, `limit`, `page`. Response: list of product summaries.
- GET `/products/{id}` — public. Response: full product.
- POST `/products` — admin only. Body: product create payload. Response: created product.
- PUT `/products/{id}` — admin only. Body: product update payload.
- DELETE `/products/{id}` — admin only.

## Cart
- GET `/cart` — authenticated. Returns user's cart with items and totals.
- POST `/cart/items` — authenticated. Body: `{ productId, quantity }`. Adds or updates item.
- PUT `/cart/items/{itemId}` — authenticated. Update quantity.
- DELETE `/cart/items/{itemId}` — authenticated.
- POST `/cart/checkout` — authenticated. Creates an order and initiates Stripe payment (returns client secret or payment intent id).

## Orders
- GET `/orders` — authenticated; users get their orders, admins can filter all orders with query params.
- GET `/orders/{id}` — authenticated; users only for their orders unless admin.
- POST `/orders` — internal/create from checkout flow. Body: order details, payment info.
- PUT `/orders/{id}/status` — admin only. Update status (e.g., PROCESSING, SHIPPED, COMPLETED, CANCELED).

## Stripe Integration
- POST `/payments/create-intent` — authenticated. Body: `{ orderId }` or `{ amount, currency }`. Creates Stripe PaymentIntent and returns `client_secret`.
- POST `/webhook/stripe` — public webhook endpoint. Validate signature using `STRIPE_WEBHOOK_SECRET`. Handle events:
  - `payment_intent.succeeded` → mark order paid
  - `payment_intent.payment_failed` → mark payment failed
  - `charge.refunded` → update order/refund status

Security notes:
- Use FirebaseAuth filter for authentication (already configured in `SecurityConfig`).
- Authorize admin endpoints by checking Firebase custom claim `admin` (via `FirebaseAuthenticationFilter` or method-level `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`).
- Validate request bodies with DTOs and javax validation annotations (`@Valid`).

Testing & Deployment notes:
- Unit tests for services, controllers, and Stripe integration mocking Stripe's SDK.
- Integration tests: use Firebase emulator or mock `FirebaseAuth` and `Firestore` beans.
- Containerize with the existing `Dockerfile` in `Amzon-java-back/` and add a CI workflow to run `mvn -DskipTests package` and tests.

## Next implementation steps (priority order)
1. Implement Product APIs (controllers + service + repository).
2. Implement Cart APIs and cart persistence (Firestore collections or relational tables depending on data store).
3. Implement Order APIs and state transitions.
4. Integrate Stripe payment creation (`/payments/create-intent`).
5. Implement Stripe webhook handler and idempotency checks.
6. Add admin-only product/order endpoints and method-level authorization.
7. Add validation, role checks, and exception handling.
8. Write unit and integration tests.
9. Prepare Docker image and CI deployment steps.

---
If this layout looks good I will start implementing the Product APIs next (controllers, services, DTOs, and tests).
