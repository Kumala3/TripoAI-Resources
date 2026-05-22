# Ticket Watcher

A Next.js app that scrapes a ticket page hourly and calls your phone when keywords indicating availability are detected.

## How It Works

1. A Vercel Cron Job hits `/api/check-tickets` every hour
2. The route checks if the current UTC+2 hour is within your configured window
3. If in window, it scrapes `TICKET_URL` via Firecrawl and checks for `TICKET_KEYWORDS`
4. If any keyword is found, it places a Twilio phone call to `TWILIO_TO`
5. Each check is logged; the last 10 are available at `/api/status`

## Local Development

```bash
cp .env.example .env.local
# Fill in all values in .env.local

npm install
npm run dev
```

Test the check endpoint:

```bash
curl -H "Authorization: Bearer your_cron_secret" http://localhost:3000/api/check-tickets
```

Check status:

```bash
curl http://localhost:3000/api/status
```

View TwiML response:

```bash
curl http://localhost:3000/api/twiml
```

> **Note:** To test the full Twilio call flow locally, Twilio must be able to reach `/api/twiml`. Use [ngrok](https://ngrok.com/) to expose your local server, then set `VERCEL_URL=your-ngrok-id.ngrok.io` (without `https://`) in `.env.local`.

## Vercel Deployment

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example` in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy — the cron job in `vercel.json` activates automatically

> **Vercel plan note:** The hourly cron schedule (`0 * * * *`) requires a **Vercel Pro** plan. Hobby plan only supports daily cron jobs.

## Environment Variables

| Variable          | Description                                                  |
|-------------------|--------------------------------------------------------------|
| `FIRECRAWL_KEY`   | Firecrawl API key                                            |
| `TICKET_URL`      | URL to scrape for ticket availability                        |
| `TICKET_KEYWORDS` | Comma-separated keywords to detect (case-insensitive)        |
| `TWILIO_SID`      | Twilio Account SID                                           |
| `TWILIO_TOKEN`    | Twilio Auth Token                                            |
| `TWILIO_FROM`     | Twilio phone number to call from (E.164 format)              |
| `TWILIO_TO`       | Your phone number to receive calls (E.164 format)            |
| `START_HOUR`      | Start of active window in UTC+2, inclusive (e.g. `8`)        |
| `END_HOUR`        | End of active window in UTC+2, exclusive (e.g. `22`)         |
| `CRON_SECRET`     | Secret for cron authorization (set in Vercel dashboard)      |

## API Endpoints

| Endpoint              | Method | Description                                       |
|-----------------------|--------|---------------------------------------------------|
| `/api/check-tickets`  | GET    | Cron job trigger (requires `Authorization` header) |
| `/api/status`         | GET    | Returns last 10 check results as JSON             |
| `/api/twiml`          | GET    | TwiML response served to Twilio on call connect   |

## Storage Note

Check results are stored in `/tmp/ticket-checks.json` (max 10 entries). This persists within a Vercel function instance but **resets on cold starts**. The `/api/status` endpoint returns an empty array after a cold start until the first check runs. This is expected behavior.
