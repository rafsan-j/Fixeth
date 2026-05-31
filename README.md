# Fixeth

A Bengali-first, career-track learning platform for Bangladesh.

## Overview

Fixeth is a curated LMS that structures existing tech education into job-ready career tracks — localized in Bengali, priced in BDT, and built around tools learners already own. The platform combines adaptive learning paths, AI-powered video intelligence, and hash-verified certificates into a single cohesive product.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js 14 API routes (TypeScript) — backend logic lives in `app/api/`
- **Auth:** NextAuth.js v5
- **Databases:** PostgreSQL (Supabase) — single source of truth
- **Payments:** Stripe, SSLCommerz, bKash
- **Services:** Judge0 (code execution), OpenAI Whisper (transcription), Resend (email), Cloudflare

## Getting Started

### Prerequisites

- Node.js >= 18
- Supabase project (PostgreSQL)

### Installation

```bash
git clone https://github.com/your-org/fixeth.git
cd fixeth
npm install
```

### Environment Variables

Create a `.env.local` file in the root (template):

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Databases
DATABASE_URL=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=

# Services
RESEND_API_KEY=
OPENAI_API_KEY=
YOUTUBE_API_KEY=
JUDGE0_API_URL=

# App
NEXT_PUBLIC_APP_URL=https://fixeth.vercel.app
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run Subtitle Pipeline (separate service)

```bash
cd services/subtitle-pipeline
npm install
npm run dev
```

## Project Structure

```
fixeth/
├── app/                    # Next.js App Router (backend API routes live under app/api/)
│   ├── (auth)/             # Login, signup, onboarding
│   ├── (dashboard)/        # Post-login pages
│   ├── tracks/             # Track and lesson pages
│   ├── profile/            # Public learner profiles
│   └── api/                # API routes
├── components/             # Shared UI components
├── lib/                    # DB clients, auth config, utilities
├── services/
│   └── subtitle-pipeline/  # Whisper + translation + VTT generation
└── public/
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint
npm run type-check   # TypeScript check
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT