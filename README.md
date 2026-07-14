# Sandryne Boutique

A luxury fashion e-commerce experience — minimalist, editorial, and highly interactive.
Built with Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, React Bits Pro,
Framer Motion (`motion`), Supabase, and the Heartland (Global Payments) gateway.

## Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Frontend   | Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui        |
| Motion     | `motion` (Framer Motion), GSAP (via React Bits components)     |
| Premium UI | React Bits Pro (`@reactbits-starter` / `@reactbits-pro`)       |
| Backend    | Supabase (Postgres, Auth, Storage, RLS)                        |
| Payments   | Heartland / Global Payments (hosted fields + `globalpayments-api`) |
| Hosting    | Vercel                                                          |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

The storefront renders with a built-in sample catalog even before Supabase is
configured, so you can develop the UI immediately. Checkout, auth, and the
admin panel require the environment variables below.

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run, in order:
   - [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) — tables, RLS policies, auth trigger, inventory RPC, `product-images` storage bucket.
   - [`supabase/migrations/002_seed.sql`](supabase/migrations/002_seed.sql) — optional sample catalog.
   - [`supabase/migrations/003_blog.sql`](supabase/migrations/003_blog.sql) — journal posts.
   - [`supabase/migrations/004_journal_replace.sql`](supabase/migrations/004_journal_replace.sql) — journal seed content.
   - [`supabase/migrations/005_homepage_sections.sql`](supabase/migrations/005_homepage_sections.sql) — admin-curated homepage product sections.
3. Copy the project URL, anon key, and service role key into `.env.local`.
4. Sign up through the site (`/login`), then promote yourself to admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## 2. Heartland setup

1. Create a developer account at [developer.globalpayments.com](https://developer.globalpayments.com/heartland/getting-started/overview).
2. Grab your **public key** (`pkapi_cert_...`) and **secret key** (`skapi_cert_...`).
3. Add them to `.env.local`. The checkout page renders Heartland hosted fields
   (card data never touches this server); the Server Action charges the
   single-use token via the `globalpayments-api` SDK and records the order.

## 3. React Bits Pro

`components.json` registers the `@reactbits-starter` and `@reactbits-pro`
registries. With `REACTBITS_LICENSE_KEY` in `.env.local` you can install more
components any time:

```bash
npx shadcn@latest add @reactbits-starter/silk-waves-tw @reactbits-pro/hero-7
```

## Environment variables (Vercel)

Add all of these in **Vercel > Project > Settings > Environment Variables**:

| Variable                           | Scope   | Purpose                                    |
| ---------------------------------- | ------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`         | Public  | Supabase project URL                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Public  | Supabase anon key (RLS enforced)           |
| `SUPABASE_SERVICE_ROLE_KEY`        | Secret  | Server-only: order writes, admin ops       |
| `NEXT_PUBLIC_HEARTLAND_PUBLIC_KEY` | Public  | Hosted fields tokenization                 |
| `HEARTLAND_SECRET_KEY`             | Secret  | Server-side charges                        |
| `REACTBITS_LICENSE_KEY`            | Secret  | React Bits component installs (build/dev)  |
| `NEXT_PUBLIC_SITE_URL`             | Public  | Canonical URL for auth redirects/metadata  |

Also set `NEXT_PUBLIC_SITE_URL` to `https://sandryneboutique.com` in production
and add that URL to **Supabase > Authentication > URL Configuration**.

## Project structure

```
app/
  (store)/            Storefront: home, shop/[category], products/[slug],
                      checkout, account, login, policies
  admin/              Admin command center (auth + role gated)
  actions/            Shared server actions (auth, newsletter)
components/
  layout/             Glass header, footer, newsletter
  home/               Hero support, carousels, brand sections
  product/            Cards, gallery, filters, purchase panel
  cart/               Slide-out drawer (zustand store in lib/store)
  checkout/           Heartland hosted-fields checkout form
  admin/              Product form, image uploads, charts, order tools
  react-bits/         React Bits components (installed source)
  blocks/             React Bits Pro blocks (installed source)
lib/
  supabase/           Browser / server / service-role clients
  data/               Product queries + local fallback catalog
  heartland.ts        Portico charge wrapper (server-only)
supabase/migrations/  SQL to run in the Supabase SQL Editor
proxy.ts              Session refresh + /admin & /account gating
```

## Commands

```bash
npm run dev     # develop at http://localhost:3000
npm run build   # production build
npm run lint    # eslint
```
