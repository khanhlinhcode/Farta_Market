# Security Notes

## Frontend Token Storage

The current frontend stores user and admin tokens in `localStorage` for local
development simplicity. Before production deployment, prefer Laravel Sanctum SPA
authentication with secure, HTTP-only cookies so bearer tokens are not readable
from JavaScript.

Minimum production requirements if bearer tokens remain in use:

- Keep `SANCTUM_TOKEN_EXPIRATION` short.
- Revoke all tokens on logout and password changes.
- Do not log tokens in browser or server logs.
- Enforce HTTPS for every frontend/API request.
- Add a strict Content Security Policy that blocks inline scripts and only
  allows trusted asset/API origins.
- Run `npm audit --audit-level=high`, `npm test -- --run`, and `npm run build`
  before release.
