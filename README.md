# DepositGuard AI

AI-powered security deposit recovery tool. Upload your lease, get an instant analysis of illegal charges, and download a professional demand letter.

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** (dark theme, glassmorphism)
- **Supabase** (Auth, PostgreSQL with RLS, Storage)
- **Lemon Squeezy** for payments ($39 one-time)
- **Anthropic Claude API** for lease analysis
- **jsPDF** for client-side PDF generation

## Getting Started

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

3. Run the Supabase migration (copy `supabase/migration.sql` into your Supabase SQL Editor and run it).

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Lemon Squeezy webhook signing secret |
| `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` | Lemon Squeezy checkout URL |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL |

## Disclaimer

DepositGuard AI is a self-help tool, not a law firm. Information provided does not constitute legal advice.
