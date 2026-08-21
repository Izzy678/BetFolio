# Ledgerline — Betting P&L Tracker

Ledgerline is a private historical betting profit-and-loss tracker. A user creates a globally unique username and password account, uploads a settled betslip, reviews structured extraction, and confirms a deterministic ledger import. It does not offer picks, predictions, live odds, or wager placement.

## Architecture

- Next.js 16 App Router, strict TypeScript, Tailwind CSS 4
- Username/password authentication backed by Supabase Auth and `@supabase/ssr` cookie sessions
- Supabase PostgreSQL with Row Level Security on every user-owned table
- Private `betslips` Storage bucket with owner-folder policies
- Authenticated Edge Functions for username claims, multimodal extraction, and atomic finalization
- Google Gen AI SDK (`@google/genai`) with JSON-schema output; Gemini runs only in the Edge Function
- Signed ledger transactions as the P&L source of truth

Normal profile, dashboard, history, and detail reads use the RLS-protected Supabase Data API directly. The browser never receives a service-role key or Gemini key. Import finalization calls a security-invoker PostgreSQL function so bet, legs, transactions, and upload status commit atomically.

## Local development

Requirements: Node.js 22+, Docker, and the Supabase CLI.

```bash
cp .env.example .env.local
npm install
supabase start
supabase db reset
npm run dev
```

Copy the local API URL and publishable/anon key printed by `supabase status` into `.env.local`. Open the local URL printed by the development server.

The app displays realistic read-only preview data when public Supabase variables are absent, which is useful for interface work. Configure Supabase to exercise persistence, authentication, and imports.

## Supabase setup

Email/password signups must be enabled and email confirmation must be disabled because Ledgerline does not collect a deliverable email address. Local configuration already sets `enable_anonymous_sign_ins = false` and `enable_confirmations = false` in `supabase/config.toml`. Apply equivalent Auth settings to a hosted project.

The visible username is converted deterministically to an internal, non-deliverable Auth identifier. Supabase Auth stores and verifies the password hash; Ledgerline never stores plaintext passwords or custom password hashes. The case-insensitive unique index on `profiles.username` guarantees one username across all users. The profile UUID remains the same Supabase Auth user UUID used by every owned record and RLS policy.

Apply all schema, RLS, Storage, analytics, and transaction changes with migrations:

```bash
supabase db push
```

The initial migration creates the private bucket and policies; no SQL needs to be pasted into the Dashboard. Deploy functions with JWT verification left enabled:

```bash
supabase functions deploy claim-username
supabase functions deploy process-betslip
supabase functions deploy finalize-bet-import
```

For local Edge Functions:

```bash
supabase functions serve --env-file supabase/.env.local
```

## Gemini and mock extraction

Set secrets for deployed functions separately from Next.js:

```bash
supabase secrets set GEMINI_API_KEY=... GEMINI_MODEL=... BETSLIP_AI_MODE=gemini APP_ENV=production
```

The model name is configurable and never hardcoded. For development, use `BETSLIP_AI_MODE=mock` and `APP_ENV=development`; filename hints such as `lost`, `void`, `cashout`, or `ambiguous` select realistic fixtures. Mock mode refuses to run when `APP_ENV=production`.

The extraction schema is versioned as `betslip-extraction-v1`. Raw model JSON, normalized output, deterministic issues, prompt/model metadata, and quality score are all retained. Every import requires review regardless of score.

## Accounting and currency behavior

P&L is always `SUM(bet_transactions.amount)`. Cash stakes are negative, while settlements, refunds, and cashouts are positive. Promotional stake is stored separately and never counted as cash staked. Ambiguous returns and partial cashouts are held for review.

Currencies are never combined. Dashboard aggregations are selected per original ISO currency; V1 performs no FX conversion.

## Privacy and retention

Betslips are sensitive, private objects stored at `{user_id}/{upload_id}/{sanitized_filename}`. Only short-lived signed URLs are used for review/detail screens. The file is sent only to Supabase Storage and, in Gemini mode, Gemini for extraction. V1 retains the source slip with its import/bet; configurable retention and deletion controls are future work.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`tests/rls-policy.test.sql` provides migration policy assertions for a local database. Unit coverage includes username canonicalization, ledger/P&L, ROI, extraction review rules, malformed AI output, and duplicate keys.

## Known V1 limitations

- Users can sign in across devices with their username and password. Automated password reset is unavailable until a real recovery identity such as email or passkey is added.
- No FX conversion or combined cross-currency P&L.
- Complex promotional settlements and partial cashouts require manual review and cannot finalize automatically.
- Dates without an explicit timezone remain optional; the app does not invent one.
- No fuzzy semantic duplicate matching beyond exact file hash and bookmaker Bet ID.
- No automatic bet import, manual bookmaker connection, live betting data, advice, or recommendations.
