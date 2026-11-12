# fcourt-web

Web frontend of FCourt, a sports court booking system. It is a single-page app for four roles: customers (browse branches, hold slots, book and pay, manage bookings), court owners (branches, courts, pricing, vouchers, dashboard), staff (counter operations, products) and super admins (users, subscription plans, platform dashboard).

Production: https://fcourt.donan.site (S3 + CloudFront).

## Role in the FCourt system

| Repo | Responsibility |
|---|---|
| **fcourt-web** (this repo) | React SPA, calls the backend through same-origin `/api` and `/ws-fcourt` |
| `fcourt-backend` | Spring Boot microservices (auth, facility, booking, payment, notification, ...) |
| `fcourt-flutter` | Android app on the same backend |
| `fcourt-gitops` | Argo CD manifests that deploy the backend to EKS |
| `fcourt-infra` | Terraform for AWS (VPC, EKS, ECR, S3, CloudFront, Route 53, ACM, ...) |

In production CloudFront serves this SPA from a private S3 bucket and routes `/api/*` and `/ws-fcourt` to the backend on the same domain, so the browser never makes cross-origin calls. The AWS side is defined in `fcourt-infra` (`envs/shared`, `web-cdn.tf`).

The repo was split from the `frontend/` folder of the old monorepo (`group-project-sba301_fcourt`) with `git subtree split`. The old UI ran on a monolith backend; the API differences are tracked in [docs/api/api-gap-report.md](docs/api/api-gap-report.md).

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Axios, STOMP over WebSocket (`@stomp/stompjs`), Vitest + Testing Library, ESLint. Production image: nginx. Path alias `@/` points to `src`.

## Project structure

```text
fcourt-web
|- src
|  |- app           # router, providers, query client
|  |- common        # config (env.ts), constants (api-endpoints.ts), helpers
|  |- components    # reusable UI (incl. notifications bell)
|  |- context       # React context (staff session, ...)
|  |- hooks         # custom hooks wrapping query/state
|  |- layouts       # page-level layouts per role
|  |- pages         # route pages (admin, auth, booking, staff, super-admin, ...)
|  |- services      # axios client (services/http) and API modules
|  |- types         # shared types
|  |- utils         # helpers, token storage
|- public           # static files
|- docs             # documentation, see docs/README.md
|- .github/workflows
|  |- ci.yml        # lint, build, test
|  |- deploy-web.yml# S3 + CloudFront deploy (runs on main)
|- Dockerfile, nginx.conf   # container image (nginx, proxies /api to API_UPSTREAM)
|- vite.config.ts   # build, Vitest, dev proxy to the services
```

Convention: endpoints are declared in `src/common/constants/api-endpoints.ts` or in the `services/*` modules, never hard-coded in pages.

## Prerequisites

Node.js 20 (`.nvmrc`) and npm. A running backend is needed for real data: either the services on localhost (ports 8081 to 8092) or a remote host (see `DEV_BACKEND_HOST`).

## Setup, run, test, build

```bash
cp .env.example .env     # adjust values if needed
npm ci
npm run dev              # http://localhost:5173
```

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server; proxies each `/api/...` prefix to the owning service port (see `vite.config.ts`) |
| `npm run build` | `tsc -b && vite build`, output in `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint |
| `npm test` | Vitest (`vitest run`) |

Container image (optional): `docker build -t fcourt-web .` then run it with `API_UPSTREAM` pointing at the gateway/ALB origin.

## Configuration

Copy `.env.example` to `.env`. `.env` and `.env.local` are git-ignored; only `.env.example` is committed.

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | API base URL, default `/api` (same origin). Must end with `/api`. |
| `VITE_WS_URL` | STOMP WebSocket URL for realtime slot updates. Empty means same origin `/ws-fcourt`. |
| `VITE_GOOGLE_CLIENT_ID` | OAuth Web client ID for Google sign-in. Empty hides the Google button. It must match the client the auth service verifies (`AUTH_GOOGLE_CLIENT_ID`), and the web origin must be listed in the client's authorized JavaScript origins. |
| `DEV_BACKEND_HOST` | Dev only: host of the backend services, default `localhost`. |
| `API_UPSTREAM` | Container only: origin of the gateway/ALB, default `http://gateway:8080`. |
| `NGINX_RESOLVER` | Container only: DNS resolver used by nginx, default `127.0.0.11`. |

The password-reset link in emails points to the web route `/reset-password?token=...`; set `NOTIFICATION_RESET_PASSWORD_URL` of the notification service to `<web origin>/reset-password`.

## CI/CD and deployment

- `ci.yml` runs on every pull request and on pushes to `dev` and `main`: `npm ci`, `npm run lint`, `npm run build`, `npm test`.
- `deploy-web.yml` runs on push to `main` (and manually). It builds with `VITE_API_URL=/api`, assumes an AWS role through OIDC, syncs `dist/` to the S3 bucket (hashed assets first, `index.html` last with `no-cache`) and invalidates CloudFront.
- Repository variables used by the deploy: `AWS_WEB_DEPLOY_ROLE_ARN`, `WEB_BUCKET`, `WEB_DISTRIBUTION_ID`, optional `VITE_GOOGLE_CLIENT_ID`.

Release flow: open a pull request from `dev` to `main` titled `merge: release vX.Y.Z`. Merging it triggers `deploy-web`.

## Testing

Unit and component tests use Vitest with jsdom (`npm test`). CI runs lint, build and test on every PR. End-to-end test runs against the full system are recorded in the project docs, not in this repo.

## Contributing

- Branches: `main` (stable, deployed) and `dev` (integration). Create feature branches from `dev` using a prefix such as `feat/`, `fix/`, `docs/`, `ci/`.
- Commit messages and PR titles are in English, in the form `type(scope): message` (for example `fix(web): ...`). Squash merge uses the PR title.
- Open the pull request into `dev`; wait for CI to pass. Releases go `dev` to `main` as described above.
- Never commit secrets or `.env` files.
