# Cally

Nuxt + Vue 3 app scaffolded with Tailwind CSS, Axios, Geist fonts, and source-owned shadcn-vue theme tokens.

## Setup

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

## Google Calendar OAuth contract

The frontend requests `GET /api/connections/google/redirect` with the user's
existing bearer token, then navigates to the returned Google authorization URL.
Google redirects to the backend-owned `/api/google/callback`; the backend saves
the connection and returns the browser to
`/settings/integrations?google=connected` on the frontend.

No connection-status or disconnect endpoint currently exists, so the UI only
shows a connected confirmation immediately after that successful redirect.

For local development, configure and register this exact Google callback URL:

```text
http://localhost:8000/api/google/callback
```

The backend callback must read the frontend URL from
`config('services.frontend_url')`, matching its current `services.php` location.
