# Farta Market Storefront

Customer-facing React 19 and Vite application for Farta Market. It consumes the
Laravel API for catalog data, Sanctum authentication, customer profiles,
wishlist, reviews, analytics, AI chat, orders, and payments.

## Current release status

The storefront changes were merged into `main` on 24 September 2026. The public
domain is currently operated as a staging/demo environment:

- Storefront: <https://fartamarket.company>
- API health: <https://api.fartamarket.company/up>

Cloudflare Pages labels the Direct Upload deployment as `Production` because it
uses the `main` alias. That provider label does not mean the overall Farta
Market system has completed its production-readiness gates.

The SePay interface is deployed, but staging payment creation remains
unavailable until the backend receives the real Test Mode bank-account and HMAC
webhook configuration. The API intentionally returns HTTP `503` while that
configuration is missing.

## Features

- Product catalog with categories, stock, price, search, sorting, pagination,
  related items, and frequently-bought-together suggestions.
- Product detail skeletons, route-level loading placeholders, lazy-loaded images,
  responsive layouts, and reduced-motion support.
- Cart stored in `sessionStorage`, expired after 60 minutes, and cleared on
  logout rather than persisted across browser sessions.
- Checkout with coupons, COD, and SePay VietQR. VNPay is no longer offered for
  new storefront payments.
- SePay pending-payment screen with QR details and server-side status polling;
  the cart is cleared only after the API confirms the payment.
- Registration, login, email verification, password recovery, profile,
  addresses, wishlist, reviews, and customer-owned order history.
- Grounded conversational assistant with backend-verified product cards,
  ID/quantity-only cart context, recoverable error states, and explicit
  customer confirmation before cart changes.
- Vietnamese and English UI through `react-i18next`.
- Same-origin API proxy, CSP/HSTS headers, Turnstile for guest checkout, unit
  tests with Vitest, and browser tests with Playwright.

The administration portal is a separate application in `../websivi-admin` and
is intentionally not bundled into the customer storefront.

## Tech stack

- React 19, React Router, Redux Toolkit, and TanStack Query
- Vite 8, JavaScript, SCSS, and BE Vietnam Pro
- Axios, DOMPurify, i18next, and React Testing Library
- Vitest and Playwright

## Local development

Requirements: Node.js 22 or newer and the Laravel backend running locally.

```bash
npm ci
cp .env.example .env
npm run dev
```

Open <http://127.0.0.1:5173>. Use `127.0.0.1` consistently for the backend,
storefront, and Admin app when testing Sanctum cookies; do not mix it with
`localhost`.

Default local configuration:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
VITE_API_TIME_OUT=20000
VITE_SITE_URL=http://127.0.0.1:5173
VITE_ANALYTICS_ENABLED=true
VITE_TURNSTILE_SITE_KEY=
```

Only the Turnstile site key is public. Never put database, payment, mail,
Cloudinary, AI-provider, or webhook secrets in a `VITE_` variable.

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run test:e2e
```

There are currently no `lint` or `typecheck` scripts. Do not report those checks
as executed unless scripts are added to `package.json`.

## Testing

Run unit tests:

```bash
npm test
```

Install Chromium and run browser tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright starts isolated Laravel and Vite processes and uses test data rather
than the deployed staging database. If the backend is stored elsewhere, set
`BACKEND_DIR` before running the suite:

```bash
BACKEND_DIR=/absolute/path/to/backend npm run test:e2e
```

Create a deployable build:

```bash
VITE_API_URL=/api \
VITE_ANALYTICS_ENABLED=true \
VITE_TURNSTILE_SITE_KEY=replace-with-public-site-key \
npm run build
```

## Checkout behavior

COD orders are created through the standard order endpoint. SePay requires an
authenticated, email-verified customer and a unique idempotency key. The API,
not the browser, calculates the final amount and generates the transfer
reference.

For SePay, the storefront displays the VietQR image returned by the API and
polls the customer-owned payment-status endpoint. A browser redirect, query
parameter, or client-side action can never mark an order as paid. If the payment
expires or fails, the cart remains available for retry.

## Chat behavior

The widget sends the current question and bounded display history. It sends at
most 20 cart references containing only `product_id` and `quantity` **only**
after auth bootstrap confirms an email-verified customer. Product names,
prices, images, inventory, and order/payment status displayed in chat come from
the backend's structured response rather than parsed assistant prose.

`suggested_actions` are proposals. All cart mutation paths share the auth gate
in `useShoppingCart`. During bootstrap actions are temporarily disabled; guests
see a login CTA and are redirected with a safe current-page return URL. A guest
cannot restore, write, update, or remove the session cart. Logout, session loss,
or owner change clears both cart data and its owner marker. There is no automatic
replay after login.

For knowledge answers, the widget shows “Đã kiểm chứng / Verified” only when the
backend supplies `answer_status=verified` and structurally valid citations. The
native source disclosure is keyboard accessible and announced to assistive
technology. Network, timeout, rate-limit,
authentication, malformed-response, no-result, and provider-unavailable states
remain recoverable through clear messages and retry controls.

## Cloudflare Pages deployment

The project uses Cloudflare Pages Direct Upload. A Git push or merge does not
deploy the storefront automatically.

```bash
VITE_API_URL=/api \
VITE_ANALYTICS_ENABLED=true \
VITE_TURNSTILE_SITE_KEY=replace-with-public-site-key \
npm run build

npx wrangler pages deploy build \
  --project-name=farta-storefront \
  --branch=main
```

The Pages runtime must provide `API_ORIGIN` as the full HTTPS backend origin
without an `/api` suffix. The worker proxies only `/api/*` and
`/sanctum/csrf-cookie`, rejects cross-origin browser requests, and returns `503`
when its upstream configuration is invalid.

## Project structure

```text
.
├── public/                 # Pages worker, routes, and static assets
├── src/
│   ├── api/                # Laravel API clients
│   ├── component/          # Shared UI and skeletons
│   ├── hooks/
│   ├── i18n/
│   ├── pages/              # Customer routes
│   ├── redux/
│   ├── style/
│   └── utils/              # Session/cart/security helpers
├── tests/e2e/              # Playwright flows
├── security-headers.mjs
├── playwright.config.ts
├── vite.config.js
└── README.md
```

## Production gates

Before treating the public domain as production:

1. Configure SePay Test Mode on the backend and complete a simulated inbound
   transfer using the exact amount and reference shown by checkout.
2. Repeat registration, Gmail verification, login, COD checkout, order view,
   and cancellation on the deployed domain.
3. Confirm SePay success, expiration, retry, and cart-retention behavior on
   desktop and mobile.
4. Rebuild from the reviewed `main` revision, rerun CI, and perform a controlled
   release with a rollback point.
