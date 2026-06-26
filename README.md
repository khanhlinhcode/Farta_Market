# Farta Market Frontend

React 19 + Vite frontend for Farta Market.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

The development server is available at `http://127.0.0.1:5173`.

Required environment variables:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
VITE_API_TIME_OUT=20000
```

## Production

`VITE_API_URL` is a build-time variable. Set it to the public Laravel API URL
before running the build. The committed production default is `/api`, intended
for a reverse proxy serving frontend and backend under the same domain.

```bash
VITE_API_URL=https://api.example.com/api npm run build
```

Never build production with a placeholder domain.

## Verification

```bash
npm test
npm run build
npm audit
```
