# PAK Cargo — Database & Site Functionality Reference

This is the working reference for how the PAK Cargo website is put together: the
Supabase schema, the security model, the page map, and the pieces of business
logic that aren't obvious just from reading component names. Update this file
whenever the schema or a core flow changes — it's meant to be read by Claude
(or a human) cold, without re-deriving any of this from scratch.

## What this project is

A Next.js 16 (App Router, JavaScript, Turbopack) marketing + operations site for
**PAK Cargo**, a UK ⇄ Pakistan/Kashmir freight forwarder (sea, air, excess
baggage, and a "moving back to Pakistan" relocation service). Public-facing
pages are backed by a small Supabase Postgres database; there's a password-
protected `/admin` panel for staff to manage shipments, invoices and rates.

- **Repo**: https://github.com/DexterTrade/uk-website.git
- **Live domains**: pakcargouk.co.uk / pakcargouk.com, deployed on Vercel
- **Backend**: Supabase (Postgres + Auth), accessed via `@supabase/ssr`
- **Styling: Tailwind CSS v4** (CSS-first config — `@import "tailwindcss"` +
  `@theme` in `app/globals.css`, `@tailwindcss/postcss` in
  `postcss.config.mjs`, no `tailwind.config.js`). Migrated from hand-written
  CSS in a single full-site conversion; see "Styling architecture" below.

## Site map

| Route | Purpose |
|---|---|
| `/` | Homepage — hero + contact card, Sea Cargo, Air Cargo, and three "mini" sections (Excess Baggage, Pakistan to UK, Moving Back to Pakistan) |
| `/sea-cargo`, `/air-cargo`, `/excess-baggage`, `/pak-to-uk`, `/moving-back-home` | Dedicated service pages, each with its own layout (not templated identically). Sea/Air lead with the `NextDispatch` poster (see below), placed *above* `PageHero`. Excess Baggage, Pak to UK and Moving Back Home render their "How it works" as a connected flow via `app/components/ProcessDiagram.js` (numbered boxes with arrows between them) rather than a plain card grid. Excess Baggage and Pak to UK are Server Components that fetch `rates.estimated_time` (see "Admin panel" below) |
| `/contact-us` | Contact details + enquiry form |
| `/faq` | FAQ accordion (content in `lib/faq.js`) |
| `/tracking` | Public shipment tracking (see below) |
| `/admin`, `/admin/login` | Staff-only operations panel, protected by Supabase Auth |

Nav order (see `app/components/SiteHeader.js` `NAV_ITEMS`): Sea Cargo, Air
Cargo, Excess Baggage, Pak to UK, Relocation, Track, FAQ.

## Database schema (`public` schema, Supabase Postgres)

Applied via numbered migrations in Supabase (see `mcp__supabase__list_migrations`
or the Supabase dashboard — this repo does not keep a local `supabase/migrations`
folder; migrations were applied directly through the Supabase MCP tools during
development).

### `shipments`
The core shipment record. One row per booking.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `reference` | text | Booking/tracking reference, e.g. `PC-4471`, `BK-20931` |
| `customer_name` | text | |
| `service` | text | e.g. "Air Freight", "Sea Freight" |
| `route` | text | e.g. "London → Karachi" |
| `weight_label` | text | Human-readable pieces/weight string |
| `status` | text | One of `STATUSES` in `lib/data.js` (Booked → Delivered) |
| `eta_label` | text | Nullable, human-readable ETA |
| `summary` | text | Short status blurb shown on the tracking page |
| `flag` | text | Free-text internal flag shown in admin only |
| `sender_phone` | text | UK phone number used to verify a tracking lookup (added in `add_sender_phone_verification_to_tracking`) |
| `created_at`, `updated_at` | timestamptz | |

### `shipment_stages`
Timeline entries for a shipment (one shipment → many stages).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `shipment_id` | uuid FK → `shipments.id` | |
| `position` | int | Sort order |
| `label` | text | e.g. "Collected from sender" |
| `when_label` | text | e.g. "12 Sep" |
| `done` | boolean | Whether this stage is complete |

### `invoices`
**Internal only — never exposed to the public.** See "Invoicing is internal
only" below.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `number` | text | e.g. `INV-1042`, generated via `nextval_invoice_number()` |
| `shipment_id` | uuid FK → `shipments.id`, nullable | |
| `shipment_reference` | text, nullable | Free-text fallback if no shipment match |
| `customer_name` | text | |
| `customer_city` | text, nullable | |
| `issued_date` | date | Defaults to `CURRENT_DATE` |
| `due_date` | date, nullable | |
| `status` | text | One of `INVOICE_STATUSES` in `lib/data.js`: Draft, Unpaid, Paid |
| `total` | numeric | |
| `created_at`, `updated_at` | timestamptz | |

### `invoice_lines`
Line items for an invoice (one invoice → many lines).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `invoice_id` | uuid FK → `invoices.id` | |
| `position` | int | |
| `description` | text | |
| `qty` | numeric | |
| `unit_price` | numeric | |
| `amount` | numeric, nullable | |

### `rates`
Exactly two rows (`mode = 'sea'`, `mode = 'air'`). Public read-only, and the
**single source of truth** for every rate/time/pickup figure shown anywhere
on the site — every page that mentions a delivery estimate, headline rate or
UK pickup fee for sea or air reads it from this table, not from its own
hardcoded copy. Edit a value once in `/admin` → Rates and it updates
everywhere that mode's figure appears (see "Admin panel" below for the exact
propagation list).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `mode` | text | `'sea'` or `'air'` |
| `headline_rate` | text | Current values: sea `"From £1.20/kg"`, air `"From £3.10/kg"` — **sea is deliberately priced per kg, not per m³**, per an explicit request; this is a departure from typical sea-freight convention (usually priced by volume), so don't "fix" it back to `/m³` without checking with the user first |
| `rate_note` | text, nullable | Short descriptor only, e.g. `"Shared container (LCL)"` / `"Tiered by weight"` — does **not** include a delivery-time phrase; that lives in `estimated_time` now so the two can be edited/read independently |
| `estimated_time` | text, nullable | The delivery-time figure shown everywhere: sea `"8–10 weeks"`, air `"8–10 days"`. Added specifically to stop this drifting into 3+ different hardcoded values across pages (it had: `"30–40 days"`, `"5–7 days"` and `"8–10 weeks"`/`"8–10 days"` simultaneously live in different places before this column existed) |
| `pickup_charge` | numeric | Flat UK pickup fee, shown as "UK pickup" / "Collection charge" depending on the page |
| `next_dispatch_date` | date, nullable | Drives the `NextDispatch` poster on both the Sea Cargo and Air Cargo pages (both modes, not sea-only) |
| `next_dispatch_note` | text, nullable | |
| `updated_at` | timestamptz | |

## Row Level Security

RLS is **enabled on every table**. Policies:

| Table | Policy | Role | Effect |
|---|---|---|---|
| `shipments` | `staff full access` | `authenticated` | Full CRUD for logged-in staff only |
| `shipment_stages` | `staff full access` | `authenticated` | Full CRUD for logged-in staff only |
| `invoices` | `staff full access` | `authenticated` | Full CRUD for logged-in staff only |
| `invoice_lines` | `staff full access` | `authenticated` | Full CRUD for logged-in staff only |
| `rates` | `public read rates` | `anon`, `authenticated` | Public `SELECT` only |
| `rates` | `staff update rates` | `authenticated` | Staff can `UPDATE` |

**There is no public SELECT policy on `shipments`, `shipment_stages`,
`invoices` or `invoice_lines`.** The *only* way the public site reads shipment
data is through the narrow SECURITY DEFINER RPC below — direct table access
from the anon key returns nothing.

## Database functions (RPCs)

### `get_shipment_by_reference(p_reference text, p_sender_phone text) → jsonb`
`SECURITY DEFINER`, granted to `anon, authenticated`. The **only** public
read path into shipment data. Requires **both** the tracking reference *and*
the sender's phone number used on the booking to match — a reference alone is
not enough (this was an explicit requirement: tracking must not let someone
enumerate/guess other people's shipments by reference alone).

- Matches `reference` case-insensitively.
- Matches phone numbers via `normalize_uk_phone()` on both sides (see below)
  so `07700 900001` and `+44 7700 900001` are treated as equal.
- Returns a single JSON object with `reference, status, service, route,
  weight_label, eta_label, summary, stages[]` — **never** invoice/pricing
  data.
- Returns `null` (not an error) on no match or on an empty/unparseable phone.
- Called from `app/tracking/actions.js` → `trackShipment(reference, senderPhone)`.

### `normalize_uk_phone(p text) → text`
Plain SQL, `IMMUTABLE`. Strips all non-digits, then if the result is 12
digits and starts with `44` (i.e. a `+44...` international number with the
leading `0` dropped), rewrites it to the `0...` national form so it matches
numbers stored in local format. **Known gap**: does not handle the `00 44...`
(double-zero international prefix) form — only bare `+44...`/`44...`. Not
currently a problem since all seeded/real numbers are UK numbers entered in
either local or `+44` form.

### `nextval_invoice_number() → bigint`
`SECURITY DEFINER`. Pulls the next value from `invoice_number_seq`, used to
build invoice numbers like `INV-1042` in `issueInvoice()`. Only ever called
from an authenticated admin server action (see below) — not exposed to the
public UI, but the function itself doesn't check role (the *caller* is what's
locked down).

### `set_updated_at() → trigger`
Standard `updated_at = now()` trigger function, attached to tables with an
`updated_at` column.

## Security model — the rules that must not regress

1. **Invoicing is internal only.** There is no public invoice lookup, no
   route, no RPC, no API that returns invoice data to an unauthenticated
   visitor. This was deliberately built once (a public invoice-lookup RPC)
   and then **removed** for security — do not re-add anything that lets the
   public read `invoices`/`invoice_lines` by any identifier.
2. **Tracking requires reference + sender phone**, not reference alone (see
   `get_shipment_by_reference` above). Don't loosen this back to a single
   parameter.
3. **Competitor names never appear in site copy.** SEO content may target the
   same search intent as named competitors but must never print a
   competitor's actual business name (trademark/passing-off risk).
4. **`/admin` is gated two ways**: `proxy.js` (`matcher: ["/admin/:path*"]`)
   refreshes/redirects based on session for page navigations, *and* every
   Server Action in `app/admin/actions.js` independently calls
   `requireStaff()` (checks `supabase.auth.getClaims()`, redirects to
   `/admin/login` if absent) — because Server Actions are their own public
   HTTP endpoints and can't rely on having been reached via a proxied page
   load. Keep both checks if you touch this code.

## Auth (staff/admin)

- Supabase Auth, email + password, via `@supabase/ssr`.
- `lib/supabase/client.js` — browser client (uses `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
- `lib/supabase/server.js` — server client for Server Components/Actions,
  cookie-aware, created fresh per request (cheap, not memoized).
- `lib/supabase/proxy-session.js` — `updateSession()`, called from `proxy.js`
  to refresh the auth cookie on every `/admin/*` request.
- `app/admin/login/actions.js` — `signIn()` Server Action, redirects to
  `?next=` target (default `/admin`) on success.
- `app/admin/actions.js` — `signOutAction`, `updateShipmentStatus`,
  `markInvoicePaid`, `updateRate`, `issueInvoice`. Every one of these calls
  `requireStaff()` first.

## Admin panel (`/admin`)

Server Component (`app/admin/page.js`) fetches shipments (with their invoice
number via the `invoices(number)` join), invoices (with shipment reference
via join), and both rate rows in parallel, then hands them to
`AdminClient.js` (client component) for the interactive table/filter/edit UI.
Key actions: change shipment status, mark an invoice paid, edit sea/air rates
(headline rate, note, **estimated time**, UK pickup charge, and the
next-dispatch date/note — all per mode), and issue a new invoice (creates
`invoices` row + `invoice_lines`, using `nextval_invoice_number()` for the
number).

`updateRate(mode, {...})` in `app/admin/actions.js` revalidates `/admin`,
`/`, `/sea-cargo`, `/air-cargo`, `/excess-baggage` and `/pak-to-uk` — every
page that reads from `rates`. If you add another page that displays a rate
field, add its path to that revalidation list too, or edits there will show
a stale value until the next unrelated deploy/rebuild.

Pages currently reading `rates` (so treat all of these as "the same figure,
five places" — see the `rates` table note above):
- `app/page.js` (homepage) — `headline_rate`, `rate_note`, `estimated_time`, `pickup_charge` for both modes
- `app/sea-cargo/page.js`, `app/air-cargo/page.js` — full row for their own mode, feeds both the `PageHero` stat and the rates table
- `app/excess-baggage/page.js` — air's `estimated_time` only (excess baggage rides on air cargo, so its stated delivery time follows air's)
- `app/pak-to-uk/page.js` — both modes' `estimated_time` (shown as "Air, door to door" / "Sea, port to door" stats)

## Public tracking flow (`/tracking`)

`TrackingClient.js` (client component) requires **both** a tracking
reference and the sender's phone number before it will look anything up
(two required inputs, gated by a `searchNonce` pattern to avoid a
setState-in-effect lint violation and to allow re-submitting the same
values). On submit it calls the `trackShipment` Server Action
(`app/tracking/actions.js`), which passes both values straight to the
`get_shipment_by_reference` RPC and returns `null` on any mismatch. Demo
pairs seeded in the DB: `PC-4471` / `07700 900001` (air), `BK-20931` /
`07700 900002` (sea).

## Business config (`lib/seo.js`)

Single source of truth for contact details, used everywhere so a change here
propagates sitewide:

- `BUSINESS.phones[]` — `{ city, display, href }` per branch (London,
  Birmingham, Nottingham)
- `BUSINESS.whatsapp` / `whatsappDisplay` — `wa.me` link + display number
- `BUSINESS.email` — `info@pakcargo.com`
- `BUSINESS.legalName`, address fields, `hours`
- `pageMeta({ title, description, path })` — every page's `metadata` export
  should build on this, not just set `{title, description}` directly. Without
  it, a page silently inherits the root layout's `openGraph`/`twitter` block
  (this was a real bug: sharing any page other than the homepage showed the
  homepage's preview card in WhatsApp/iMessage/Slack). Every page must call
  this helper.

## Contact UI components

These have been redesigned several times — what follows is the **current**
design as of the `estimated_time` consolidation work. If it looks stale
against the live site, trust the code over this doc and update this section.

- **`app/components/contact-icons.js`** — `PhoneIcon`, `EmailIcon`,
  `WhatsAppIcon`, small inline SVGs, `{...props}` spreadable.
- **`app/components/WhatsAppFloat.js`** — fixed floating WhatsApp button
  (bottom-right), every page.
- **`app/components/ContactDrawer.js`** — mobile-only (≤640px) UI for phone
  numbers, rendered as its own component, not nested inside a page's hero
  card (so it stays mounted even where that card is hidden). Two parts:
  - A small **arrow tab fixed to the left edge** of the viewport (vertically
    centered), *not* a full-width row — tapping it opens a left-sliding
    drawer panel (`fixed inset-y-0 left-0`, `translate-x` open/closed) with
    every phone number, WhatsApp and email as bordered **info cards** (icon
    badge + number + label) — deliberately *not* styled like the nav list,
    since these are reference details to glance at, not navigation links.
  - A recurring heads-up nudge: fires ~1.2s after page load, then every 20s
    while the drawer is closed, showing a bubble next to the tab for ~4.5s.
    Suppressed via `IntersectionObserver` while an element with
    `id="phone-numbers"` is in the viewport (currently only the homepage has
    one) — no point nagging someone who can already see the numbers on
    screen. No-ops entirely on pages without that element.
  - On the homepage and Contact Us page, the hero/contact card's own inline
    phone/WhatsApp/email list (`.hero-contact-list`) is hidden on mobile
    (`max-[640px]:hidden`) — the drawer is the only mobile access path there.
    The homepage additionally has a **separate, always-mobile-only** "Call
    us directly" section (`id="phone-numbers"`, `hidden max-[640px]:block`)
    a few sections below the hero — visible only on phones, since desktop
    already shows the same numbers in the hero card and showing both would
    duplicate.
- **`app/components/SiteHeader.js`** — mobile/tablet nav (<1120px) is a
  **full-width panel that opens vertically below the header**, not a side
  drawer: `display: grid` with `grid-template-rows` animated `0fr → 1fr` on
  open (a "CSS grid accordion" — smooth height reveal with no text
  distortion, unlike animating `scale` or `max-height`). Panel content is a
  numbered list (`01`, `02`...) of nav links in large display type, plus a
  footer with a WhatsApp CTA and the first branch number. Two things worth
  knowing if you touch this:
  - CSS Grid items default to `min-height: auto`, which ignores the
    `grid-template-rows` track size and keeps the item full-height
    regardless — the closed state needs an explicit `min-h-0` on the grid
    item or it silently stays visible. (Same class of bug as a separate,
    earlier `min-width: auto` grid trap on a different component.)
  - The closed state also carries explicit `opacity-0 pointer-events-none`
    (and open carries `opacity-100 pointer-events-auto`) as a deliberate
    belt-and-suspenders guarantee on top of the grid collapse, added after a
    report that the panel stayed visible when closed — kept even though the
    grid-rows mechanics checked out correct in the compiled CSS, since it
    costs nothing and removes any doubt.
  - Desktop nav (≥1120px) is unaffected — the wrapper `<div>`s around the
    links use base `contents` + `max-[1120px]:` overrides, so on desktop
    they collapse and the `<Link>`s become direct flex children of `<nav>`,
    exactly like the pre-redesign markup.
- **`app/components/NextDispatch.js`** — the "next departure" poster on both
  the Sea Cargo and Air Cargo pages (`mode="sea"|"air"` prop). Deliberately
  minimal, redesigned away from an earlier version with a dark gradient
  overlay and a floating countdown circle on top of the photo: now a plain
  stack — photo on top (plain `<img>`, no overlay), then a clean white info
  row below it with the departure date (plus, sea-only, a small "(in N
  days)" countdown next to the date), the `estimated_time` stat (label
  "Estimated time"), and a "Book your space" CTA. Renders nothing at all if
  `date` is empty/past (`next_dispatch_date` unset, or in the past) — staff
  clear the date in `/admin` to hide it entirely rather than there being a
  separate visibility toggle.

## Styling architecture

The site runs on **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js`).

- **`postcss.config.mjs`** — registers `@tailwindcss/postcss`.
- **`app/globals.css`** — `@import "tailwindcss";` followed by:
  - `@theme` — brand tokens as real CSS custom properties, so Tailwind
    generates matching utilities: `--color-green`, `--color-green-dark`,
    `--color-green-soft`, `--color-green-ink`, `--color-navy` (+ dark/soft),
    `--color-ink`, `--color-muted`, `--color-soft`, `--color-faint`,
    `--color-line` (+ `-light`), `--color-bg-soft`, `--color-red` (+
    `-soft`), `--color-amber-soft`, `--color-amber-ink`, plus `--font-head`
    / `--font-body` wired to the `next/font/google` variables from
    `app/layout.js`. Use them as `bg-green`, `text-navy`, `border-line`,
    `font-head`, etc. — never reintroduce raw hex values for these colors.
  - `@layer base` — the handful of true global element resets (heading
    font-family/margin/letter-spacing, `p` margin reset, link colors,
    form-control font inheritance) that would be impractical to repeat as
    utility classes on every heading/paragraph/input across ~20 files.
  - `@layer components` — cross-cutting design-system primitives that
    repeat across many files, written with `@apply` (e.g. `.btn`/
    `.btn-green`/`.btn-navy`/`.btn-ghost`, `.wrap`/`.wrap-narrow`,
    `.eyebrow`, `.card`, `.badge`, `.input`/`.select`/`.textarea`,
    `.hero-contact-list`/`.row-icon`/`.row-text` (the inline phone/WhatsApp/
    email rows shared by the homepage hero and Contact Us page — *not* used
    by the contact drawer body, which has its own bordered info-card style
    inlined directly in `ContactDrawer.js`), the service-page
    patterns (`.cards`/`.svc`/`.step`, `.band-soft`, `.table-wrap`,
    `.rate-grid`/`.rate-card`, `.compare-card`, `.schedule-strip`,
    `.route-strip`), the FAQ accordion, the tracking result panel
    (`.panel`/`.result-grid`/`.timeline-row`/`.progress`), and the full
    `/admin` panel (`.admin`/`.admin-side`/`.kpis`/`.pane`/`.chips`/
    `.line-row`, etc.). This is the one deliberate exception to "utility
    classes inline in markup" — reused 2+ times identically, so a named
    `@apply` class beats retyping 10-15 utilities in every file.
  - `@layer utilities` — the couple of constructs with no utility
    equivalent at all: the `.contact-hint::after` CSS-triangle pointer.
  - Everything else (page-specific one-off layout — hero grids, feature
    sections, mini-feature sections, the nav/contact drawers' open/closed
    transform states, etc.) is inlined as Tailwind utility classes directly
    on the JSX elements, including arbitrary values (`text-[15.5px]`,
    `shadow-[...]`, `max-[860px]:grid-cols-1`) where the design's exact
    pixel values don't land on Tailwind's default scale.
- **Custom breakpoints**: the original hand-written breakpoints (420, 480,
  560, 640, 760, 860, 900, 1120px) are expressed with Tailwind's arbitrary
  `max-[Npx]:` variant syntax rather than remapping the theme's breakpoint
  scale — exact pixel parity with no risk of misreading Tailwind's
  `max-*`-generates-from-named-breakpoints behavior.
- Two pre-existing CSS specificity bugs were found and fixed during the
  conversion (not deliberately reintroduced, since Tailwind's utility
  cascade doesn't have the same descendant-selector specificity trap):
  the footer's "Quick Response on WhatsApp" button was rendering with
  grayish-blue text instead of white (`.site-footer a` outspecified
  `.btn-green`'s color), and the numbered index (`01`, `02`...) in the
  mobile nav drawer was also visible in the desktop horizontal nav row.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional — falls back to `https://pakcargouk.co.uk`
  in `lib/seo.js`)

## Working agreements for this repo

- **Never `git push` unless the user's message contains the literal word
  "push".** Commit locally after each round of work; the user tests locally
  before anything goes live.
- **Lint-only for minor changes.** Run `npm run lint` for small edits;
  reserve a full `npm run build` + dev-server smoke test for bigger changes
  (new routes, DB/auth changes, structural restructuring).
- Next.js 16 specifics that differ from older training data: middleware file
  is `proxy.js` exporting `proxy()` (not `middleware.js`/`middleware()`), and
  Request APIs like `cookies()`/`headers()` must be awaited. See
  `node_modules/next/dist/docs/` for anything that looks off vs. expectations.

## Known placeholder/rough-edge status

- `public/assets/photos/sea-cargo.jpg`, `air-cargo.jpg`, `moving-home.jpg` —
  real AI-generated photos (already swapped in from earlier placeholder
  gradients). If replaced again, they must land at these exact paths (not
  `public/` root) to be picked up by `app/page.js`, `app/contact-us/page.js`
  and `NextDispatch.js` (sea/air only — `moving-home.jpg` isn't used there).
- Phone normalization only handles bare `+44`/`44` international prefixes,
  not `00 44...`.
- **Sea cargo's `£1.20/kg` headline rate is a placeholder**, set when the
  pricing model was switched from per-m³ to per-kg at the user's explicit
  request — not a real quoted figure. Same for `estimated_time` values
  (`8–10 weeks` sea / `8–10 days` air) — given directly by the user as the
  numbers to display, not derived from an existing rate card. All three are
  editable in `/admin` → Rates whenever real figures are available; nothing
  else needs to change since every page reads them from the same row now.
- `PageHero`'s intro paragraph renders at 18px on all screen sizes. The
  original hand-written CSS had a mobile-only 16px override that a
  specificity clash silently defeated (a higher-specificity unconditional
  rule always won); preserved as-is during the Tailwind port rather than
  guessed at, since fixing it would be a design change, not a like-for-like
  port. Worth a deliberate look if the intro text ever feels too large on
  small phones.
