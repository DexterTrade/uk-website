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
| `/admin/new-booking` | Staff-only booking form — creates the customer, shipment and invoice in one submit |
| `/admin/shipments/[reference]` | Shipment detail — specs, sender, receiver, invoice summary, tracking timeline |
| `/admin/shipments/[reference]/edit` | Edit an existing booking (same form component as new-booking) |
| `/admin/invoices/[reference]` | The printable invoice document (A4 print stylesheet, print/save-as-PDF) |
| `/admin/customers/[id]` | Customer record — details plus all their shipments and invoices |
| `/invoice/[token]` | **Public** — the customer's own invoice, reached by an unguessable share link, with a download button. `noindex`, and disallowed in robots.txt |

Nav order (see `app/components/SiteHeader.js` `NAV_ITEMS`): Sea Cargo, Air
Cargo, Excess Baggage, Pak to UK, Relocation, Track, FAQ.

## Database schema (`public` schema, Supabase Postgres)

Applied via numbered migrations in Supabase (see `mcp__supabase__list_migrations`
or the Supabase dashboard — this repo does not keep a local `supabase/migrations`
folder; migrations were applied directly through the Supabase MCP tools during
development).

### `customers`
The UK sender. One row per real person, and the master record the booking form
prefills from when someone books again.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `phone` | text | UK mobile, stored normalized as `07xxxxxxxxx` |
| `email` | text, nullable | Optional — plenty of customers don't give one |
| `address` | text | |
| `postcode` | text | UK, stored uppercased and spaced (`B10 9AB`) |
| `town` | text | Also the origin half of the derived tracking route |
| `created_at`, `updated_at` | timestamptz | |

**Unique index on `normalize_uk_phone(phone)`, not on `phone` itself** — this
is what makes `07700 900001`, `+44 7700 900001` and `0044 7700 900001` one
customer instead of three. Don't replace it with a plain unique constraint on
the raw column.

### `shipments`
The core shipment record. One row per booking, always created together with
its invoice by `create_booking()` — never on its own.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `reference` | text | `PC0001`, `PC0002`, … — **defaults to `next_shipment_reference()`**, so never set it from application code |
| `customer_id` | uuid FK → `customers.id` (`ON DELETE RESTRICT`) | |
| `mode` | text | CHECK `'air'` or `'sea'` |
| `parcels` | int | CHECK between 1 and 30 |
| `weight_kg` | numeric(10,2) | CHECK > 0 |
| `goods_description` | text | |
| `goods_value_gbp` | numeric(12,2) | CHECK ≥ 1 |
| `collection_date` | date | Always the day the booking was taken. Not typed and not editable — set server-side from a network time source in `Europe/London`; see "Collection date and server time" below |
| `receiver_name` | text | |
| `receiver_phone` | text | Overseas; `+92…` for Pakistan, E.164 otherwise |
| `receiver_phone_alt` | text, nullable | The one optional contact field on the receiver |
| `receiver_email` | text, nullable | |
| `receiver_address` | text | |
| `receiver_city` | text | Also the destination half of the derived tracking route |
| `receiver_country` | text | 2-letter code, defaults `'PK'` |
| `status` | text | FK → `shipment_statuses.value` (`ON UPDATE CASCADE`), **not** a CHECK constraint and **not** a constant in `lib/data.js` |
| `eta_label` | text, nullable | Human-readable ETA |
| `summary` | text | Short status blurb shown on the tracking page; seeded by `create_booking()` |
| `flag` | text, nullable | Free-text internal flag shown in admin only |
| `created_at`, `updated_at` | timestamptz | |

There is deliberately **no `route` or `weight_label` column** any more (and no
`service`, `customer_name` or `sender_phone`). Those were display strings
frozen at write time; they're now derived at read time — `route` from
`customers.town → receiver_city`, `weight_label` from `parcels` + `weight_kg`
— inside `get_shipment_by_reference()` and in `app/admin/page.js`. If you need
a new display string, derive it too rather than adding a column.

### `shipment_statuses`
The set of statuses a shipment can have. A table rather than a CHECK
constraint or a JS array, so the admin panel's filters and dropdowns read the
list from the database and **adding or reordering a status is an INSERT, not a
migration plus matching edits in two code files**.

| Column | Type | Notes |
|---|---|---|
| `value` | text PK | The status itself, e.g. `In transit`. Referenced by `shipments.status` |
| `position` | int | Sort order for filters and dropdowns |
| `tone` | text | CHECK `grey` / `amber` / `navy` / `green` — the badge colour. A tone name, not a CSS class, so the database isn't describing Tailwind; `statusBadgeClass()` in `lib/data.js` maps it |

The workflow, in order: **Collected → Dispatched from warehouse → Dispatched
from UK → In transit → Arrived in Karachi → Cleared from customs → Out for
delivery → Delivered.**

`shipments.status` is a foreign key onto this table with `ON UPDATE CASCADE`,
so renaming a status carries through to existing shipments instead of
orphaning them. Two things to remember when changing the list:

- **`shipments.status` has a column default** (currently `'Collected'`), and
  `create_booking()` relies on it rather than setting a status itself. Remove
  or rename the status the default points at without updating the default and
  every new booking fails the foreign key.
- **Nothing may still reference a status being deleted** — migrate those rows
  first, or the foreign key will refuse the delete.

The admin panel never names a status in code. The dashboard treats
`position` 1 as the earliest stage and the highest `position` as the terminal
one, so reordering the table doesn't silently zero the "Awaiting dispatch" and
"Active shipments" figures.

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
only" below. Exactly one invoice per shipment.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `shipment_id` | uuid FK → `shipments.id` (`ON DELETE CASCADE`) | NOT NULL and **UNIQUE** — the 1:1 rule is enforced by the database, not by convention |
| `rate_per_kg` | numeric(10,2) | CHECK ≥ 0 |
| `other_charges` | numeric(12,2) | Customs duty + handling + packing, combined. CHECK ≥ 0 |
| `total_charges` | numeric(12,2) | Stored **as staff entered it**, not recomputed — see below |
| `bill_to_name` | text | |
| `bill_to_address` | text | |
| `bill_to_postcode` | text | |
| `bill_to_town` | text | |
| `bill_to_phone` | text | |
| `bill_to_email` | text, nullable | |
| `issued_date` | date | Defaults to `CURRENT_DATE` |
| `share_token` | text, unique, nullable | The customer link's secret. Null until staff create a link; regenerating it revokes the old one |
| `share_created_at` | timestamptz, nullable | When the current token was minted |
| `created_at`, `updated_at` | timestamptz | |

Two things here are deliberate and shouldn't be "tidied up":

- **The `bill_to_*` fields duplicate `customers`.** That's a snapshot, not
  denormalization by accident: reprinting `PC0001` two years later has to show
  the address the customer was actually given, even if they've since moved and
  their `customers` row has been updated.
- **`total_charges` is not derived.** The form *suggests*
  `(rate_per_kg × weight_kg) + other_charges` and prefills it, but staff can
  overwrite it when a customer was quoted something different, and whatever
  they submit is what's stored. Don't add a generated column or a CHECK tying
  it to the formula.

There is **no invoice number, no status, no due date and no line-items table**.
Bookings are paid at the point of sale, so there is no Draft/Unpaid/Paid
lifecycle to model; the shipment reference (`PC0001`) is the only identifier
anyone quotes; and with fixed-shape pricing there are no free-form lines, so
`invoice_lines`, `invoice_number_seq` and `nextval_invoice_number()` were all
dropped. The printed invoice renders the three figures above as its lines.

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
| `customers` | `staff full access` | `authenticated` | Full CRUD for logged-in staff only |
| `shipments` | `staff full access` | `authenticated` | Full CRUD for logged-in staff only |
| `shipment_stages` | `staff full access` | `authenticated` | Full CRUD for logged-in staff only |
| `shipment_statuses` | `staff read statuses` | `authenticated` | `SELECT` only — the list is edited in Supabase, not from the app |
| `invoices` | `staff full access` | `authenticated` | Full CRUD for logged-in staff only |
| `rates` | `public read rates` | `anon`, `authenticated` | Public `SELECT` only |
| `rates` | `staff update rates` | `authenticated` | Staff can `UPDATE` |

**There is no public SELECT policy on `customers`, `shipments`,
`shipment_stages` or `invoices`.** The *only* way the public site reads
shipment data is through the narrow SECURITY DEFINER RPC below — direct table
access from the anon key returns nothing. Customer contact details in
particular are never readable by `anon` through any path.

## Database functions (RPCs)

### `get_shipment_by_reference(p_reference text, p_sender_phone text) → jsonb`
`SECURITY DEFINER`, granted to `anon, authenticated`. The **only** public
read path into shipment data. Requires **both** the tracking reference *and*
the sender's phone number used on the booking to match — a reference alone is
not enough (this was an explicit requirement: tracking must not let someone
enumerate/guess other people's shipments by reference alone).

- Matches `reference` case-insensitively.
- The sender's phone now lives on `customers`, so the function joins through
  `shipments.customer_id` to compare it. Both sides go through
  `normalize_uk_phone()` (see below), so `07700 900001`, `+44 7700 900001` and
  `0044 7700 900001` are all treated as equal.
- Returns a single JSON object with `reference, status, service, route,
  weight_label, eta_label, summary, stages[]` — **never** invoice/pricing
  data. `service`, `route` and `weight_label` are **derived inside the
  function** (from `mode`, `customers.town → receiver_city`, and
  `parcels` + `weight_kg`) since they're no longer stored columns. The JSON
  shape the tracking page consumes is unchanged.
- Returns `null` (not an error) on no match or on an empty/unparseable phone.
- Called from `app/tracking/actions.js` → `trackShipment(reference, senderPhone)`.

### `create_booking(payload jsonb) → jsonb`
`SECURITY INVOKER`, granted to `authenticated` only (explicitly revoked from
`public`/`anon`). **The only way a booking is created.** In one transaction it
finds-or-creates the customer by normalized phone (refreshing their details if
they've changed), inserts the shipment, seeds a first `shipment_stages` row so
tracking isn't empty immediately after booking, and inserts the invoice with
its `bill_to_*` snapshot. Returns `{ reference, shipment_id, customer_id }`.

It exists because the Supabase JS client **cannot span tables atomically** — a
failure partway through separate inserts would leave an orphan shipment with
no invoice. `SECURITY INVOKER` is deliberate: the caller's own RLS applies, so
staff can write and `anon` cannot, with no privilege escalation. The calling
Server Action still runs `requireStaff()` first.

### `update_booking(p_reference text, payload jsonb) → jsonb`
`SECURITY INVOKER`, `authenticated` only. The edit counterpart to
`create_booking` — customer, shipment and invoice updated in one transaction.
Two behaviours worth knowing:

- **It rewrites the invoice's `bill_to_*` snapshot.** That is not a
  contradiction of the snapshot rule: this path exists to correct a booking
  that was entered wrong. Nothing *else* may touch those columns.
- **Changing the sender phone to one that already belongs to another customer
  re-links the shipment to that customer** rather than overwriting their
  number. If the previous customer is left with no shipments at all (which
  only happens when the row was a duplicate created by the typo being
  corrected), it is deleted.

### `get_invoice_by_token(p_token text) → jsonb`
`SECURITY DEFINER`, granted to `anon, authenticated`. The **only** public read
path into invoice data — see rule 1 of the security model. One invoice, by
exact `share_token`, with a hand-built field list; no operator identity, no
internal flags, no listing, and a length guard so a blank or truncated token
can't match. Called from `/invoice/[token]`.

### `find_customer_by_phone(p_phone text) → jsonb`
`SECURITY INVOKER`, `authenticated` only. Prefill lookup for the booking form.
Matching happens on the normalized number, which PostgREST can't express as a
column filter — hence an RPC rather than a `.from("customers")` query.

### `next_shipment_reference() → text`
Returns `'PC' || lpad(nextval('shipment_reference_seq'), 4, '0')` — `PC0001`,
`PC0002`, … It is the **column default** on `shipments.reference`, so nothing
in application code should ever generate or pass a reference. Generating it in
the database is what makes it race-free; computing it in JS from the current
maximum would let two simultaneous submits claim the same number.

### `normalize_uk_phone(p text) → text`
Plain SQL, `IMMUTABLE`. Strips all non-digits, then rewrites `0044…` (14
digits) and `44…`/`+44…` (12 digits) into the `0…` national form so every way
of typing a UK number compares equal. Used both by tracking verification and
by the unique index on `customers`, which is why it must stay `IMMUTABLE`.

### `set_updated_at() → trigger`
Standard `updated_at = now()` trigger function, attached to tables with an
`updated_at` column.

## Security model — the rules that must not regress

1. **Invoices are public only through an unguessable share token.** This rule
   changed deliberately: the site previously had *no* public invoice access at
   all, and now staff can generate a customer-facing link. What must not
   regress is *how*:
   - The link is keyed on `invoices.share_token`, **never on the reference**.
     `PC0001`, `PC0002`, … is sequential, so a reference-keyed URL would let
     anyone walk the entire invoice book by counting.
   - The token is 64 hex characters from two random UUIDs (~244 bits),
     generated from the platform CSPRNG in `createInvoiceShareLink()`.
   - `get_invoice_by_token()` is the **only** public read path, returns one
     invoice by exact token, builds its own field list by hand, and cannot
     list anything. It deliberately omits the operator/staff identity.
   - `/invoice/[token]` sends `noindex, nofollow, nocache` and is disallowed
     in `robots.txt`.
   - Regenerating a token invalidates the previous link — that is the
     revocation mechanism for a link sent to the wrong person.

   Anyone holding a link can view that one invoice; that is inherent to
   sending a customer a link, and is why the token must never be derived from
   anything guessable. There is still no public listing, and `customers`
   remains staff-only — sender names, addresses and phone numbers are never
   readable by `anon` except as part of that customer's own invoice.
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
  `updateRate`, `lookupCustomer`, `createBooking`. Every one of these calls
  `requireStaff()` first.

## Admin panel (`/admin`)

Server Component (`app/admin/page.js`) fetches shipments (joined to
`customers` for the sender and to `invoices` for the amount charged), invoices
(joined back to `shipments` for the reference), and both rate rows in
parallel, then hands them to `AdminClient.js` (client component) for the
interactive table/filter/edit UI. Tabs: **Dashboard, Shipments, Customers,
Rates**. Key actions: change shipment status, and edit sea/air rates (headline
rate, note, **estimated time**, UK pickup charge, and the next-dispatch
date/note — all per mode). Every reference and customer name in those tables
links through to the matching detail page.

**Shipments: filter panel and bulk edit.** Five filters above the table, all
combining (AND) with the search box:

| Filter | Control | Source |
|---|---|---|
| Status | dropdown | `shipment_statuses`, in `position` order |
| Service | dropdown | air / sea |
| Collection date | two-handle slider | min/max of the loaded shipments |
| Price charged | two-handle slider | 0 to the highest total |
| Parcel weight | two-handle slider | 0 to the heaviest |

The sliders (`app/admin/RangeSlider.js`) are two overlaid
`<input type="range">` elements rather than hand-rolled drag maths, so
keyboard, touch and screen-reader support come for free. The one trick that
makes it work: stacked inputs would have the top one swallowing every click,
so both get `pointer-events: none` and only their thumbs take pointer events
back — see `.range-slider` in `globals.css`, where the thumb pseudo-elements
are written as raw CSS because `@apply` can't target them.

Two details worth keeping:

- **Slider bounds are derived from the data**, so the handles always span
  exactly what exists rather than an invented ceiling. A range the user hasn't
  touched is stored as `null` meaning "the whole span", which avoids having to
  resync state every time the list reloads and the bounds shift; a range they
  have touched is clamped on read for the same reason.
- **Dates travel as whole days since the epoch** (`toDay`/`dayLabel`), because
  a range input needs an integer to step through. Parsing is pinned to UTC
  midnight so the conversion is stable either side of the BST/GMT switch.

Each row also carries four actions: **View** (the shipment detail page),
**Invoice** (the preview modal), **Send** (WhatsApp) and **Copy link**. Send
and Copy link both create the customer share link on the spot if the invoice
has never been shared, so neither needs a trip through the preview first.

The row already carries `shareUrl` when the invoice has been shared, fetched
with the list. That is not just a saved round trip: it means Copy link writes
to the clipboard **inside the click**, rather than after an `await`, which
browsers increasingly refuse — and Send opens its tab with nothing in between
that could look like a popup.

Details on Send:

- **The destination depends on the device.** On a computer — desktop and
  laptop are the same case — it targets `web.whatsapp.com/send`, which drops
  straight into the chat in the WhatsApp Web session the browser is already
  signed in to, with no "Continue to Chat" interstitial and no attempt to hand
  off to the desktop app. On a phone or tablet it falls back to `wa.me`,
  because `web.whatsapp.com` refuses to run on handhelds and just tells you to
  use the app. `isHandheld()` prefers `navigator.userAgentData.mobile` and
  falls back to a UA test; iPadOS reports a desktop UA, so it is caught by
  being a touch-capable "Macintosh". Don't collapse this back to one URL.
  (The public site's own WhatsApp links stay on `wa.me` throughout — those are
  for customers, mostly on phones, who do want the app.)
- It creates the share link first if the invoice has never been shared, so
  staff don't have to visit the preview to generate one.
- The new tab is opened **synchronously, before the `await`**, and pointed at
  WhatsApp once the link comes back. Opening it after the await instead would
  count as an unrequested popup and be blocked.

The endpoint needs a bare international number, so `toWhatsAppNumber()` turns
the stored UK national form (`07…`) into `447…`, and returns empty for
anything that isn't a UK mobile — a landline on file raises an error toast
rather than opening a broken chat.

Each row has a checkbox, with a header checkbox that selects everything
currently shown, and a bar above the table applies one status to the selection
in a single `UPDATE ... IN (...)`.

**The bulk controls only appear once two or more rows are selected.** Below
that the bar carries a red "Select multiple shipments to bulk update the
status" instead — and when exactly one is selected it also points at the
per-row status dropdown, which is the right tool for a single shipment. A
disabled dropdown with no explanation would leave staff guessing.

### Feedback on admin actions

Anything that changes data and stays on the page raises a toast
(`app/admin/Toast.js`, mounted once in `AdminClient`): a single status change,
a bulk update, a rate save, and the failure case of each. Errors returned by
the Server Actions surface there too, in red, rather than being swallowed —
several of these previously succeeded or failed in complete silence.

Creating or editing a booking is the exception: it keeps its own modal,
because that one produces a reference the user has to copy or follow, which a
toast that disappears after four seconds cannot carry. Toasts are for "that
worked"; the modal is for "here is the thing you now need".

The selection is always intersected with the visible rows before anything is
applied. Without that, narrowing the filter would leave rows selected that the
user can't see, and "apply to N selected" would silently change more than what
is in front of them. It also means the same control covers both cases asked
for: with no filter, select-all is every shipment; with a filter, it is
exactly the filtered set.

**There is deliberately no Invoices tab.** An invoice is 1:1 with its shipment
and is shown in full on the shipment detail page, so a separate list would be
the same rows a second time under a different heading. Invoice totals still
feed the dashboard's monthly figures, and the printable document still has its
own route.

Customer booking counts and lifetime spend on the Customers tab are derived in
`page.js` from the shipments already fetched, rather than asking Postgres for
a per-customer aggregate.

### Detail pages

Three read views, all staff-only under `/admin/*` (so covered by the same
proxy matcher), sharing the presentational pieces in `app/admin/DetailUI.js`:

- **`/admin/shipments/[reference]`** — **everything about one booking in one
  place**: shipment specs, sender, receiver, the invoice in full (rate,
  freight subtotal, charges, any adjustment, total, and the `bill_to_*`
  snapshot as printed) and the tracking timeline. This is why there is no
  invoices list. "Edit booking" leads to the edit form.
- **`/admin/invoices/[reference]`** — the invoice document, full page.
- **`/admin/customers/[id]`** — **the customer record only**: contact details,
  booking count and lifetime value. No shipment or invoice tables; it answers
  "who is this person", and the shipment page answers "what happened on this
  booking". Don't add listings back here without checking — the split is
  deliberate.

Keyed by `reference`, not `id`, for shipments and invoices: the reference is
what staff and customers actually quote, and since invoices are 1:1 with
shipments it identifies both.

### The invoice document (`app/admin/InvoiceDocument.js`)

The invoice as the customer receives it, modelled on the layout supplied as a
reference: letterhead with the logo and watermark, office address and all
three branch numbers, sender and receiver blocks side by side, a fact strip
(freight type, parcels, weight, collection date, operator), then pricing in a
table, then the footer with tracking instructions and the company number.

**One component, two renderers.** It is a plain presentational component with
no server-only imports, so the printable page (a Server Component) and the
preview modal in the shipments list (a client component) render the *same*
markup. Keep it that way — two copies would drift.

- **Preview modal**: the "Invoice" button on each shipment row calls
  `getInvoicePreview(reference)`, a staff-gated Server Action, so the
  shipments list doesn't carry an invoice body for every row it renders.
- **"Download PDF" is the browser's print dialogue**, not a PDF library. That
  keeps text vector-sharp and the output identical to the design, with no
  dependency; the trade-off is that staff pick "Save as PDF" as the
  destination themselves. A one-click download would need a PDF library and a
  second implementation of this layout.
- Printing works **from the modal as well as the page**: `.invoice-overlay` in
  the print block flattens the overlay and hides `.admin-side` / `.admin-main`
  around it.
- `@page { size: A4 }` and `print-color-adjust: exact` are set, because
  browsers drop background graphics by default and the header bar, total row
  and watermark are exactly that. The page tells staff to enable background
  graphics.
- **`operator` is a placeholder** — currently the signed-in staff account's
  email, pending the roles work. It is passed as empty on the customer's copy
  and the "Booked by" cell then disappears, because an internal email address
  shouldn't be handed to customers.
- **Terms sit after the footer, at the very bottom**, styled as small print:
  no panel, low contrast, two narrow columns, and smaller again below 560px.
  On screen that means the invoice is what's visible and the customer scrolls
  past it to reach them; in print the whole document is scaled to `zoom: 0.82`
  so it stays compact on paper. They remain real text throughout — selectable,
  searchable and printed in full — just visually subordinate.
- **`@page` has `margin: 0`.** That is what suppresses the browser's own print
  header and footer — the page title ("Admin panel | PAK CARGO") and the
  timestamp are drawn in that margin and cannot be removed any other way. The
  sheet's margin is supplied by the document's own print padding instead.
- The tracking number is the only thing printed in **red**, since it is the
  one value a customer has to read off the document.
- Because staff can overwrite the suggested total, the rows don't always sum
  to it; the difference prints as its own **Adjustment** line rather than
  leaving a document whose arithmetic appears wrong.
- **The terms and conditions are the business's own**, supplied verbatim and
  reproduced as given in `termsList()` — only two plain spelling slips were
  corrected. Treat that text as contractual: don't reword, renumber or
  "improve" it without being asked.
- **Clause 3 quotes the sea delivery time, so it is interpolated from
  `rates.estimated_time`** rather than frozen into the string. That figure had
  previously drifted into three different values across the site, which is the
  reason the column exists; an invoice is the last place it should go stale.
  Both the page and the preview action read it per request, so no
  `revalidatePath` entry is needed for it.

### Editing a booking

`/admin/shipments/[reference]/edit` renders the **same `BookingForm`
component** as `/admin/new-booking` — it takes `initial` and `reference` props
and switches to `updateBooking`. Keeping one component means a field added to
the booking form can't be forgotten on the edit form. It lives at
`app/admin/BookingForm.js` (not inside `new-booking/`) for that reason.

The dashboard's "this month" figures take a `monthKey` (`"2026-09"`) computed
on the server in `page.js`, rather than string-matching a hardcoded month name
the way they used to — that quietly read zero the moment the month rolled
over.

### New booking (`/admin/new-booking`)

Its own route, not a tab — it's ~20 fields across three sections and benefits
from a real URL. `page.js` is a thin Server Component that passes down
`today` (computing the default collection date inside the client component
would render UTC on the server and local time in the browser, which can
disagree across midnight and trip hydration); `BookingForm.js` is the form.

**One flat form — no sections, no headings.** The field order was specified
directly and is deliberate, so keep it if you add anything: shipping → number
of parcels → the whole customer block (sender, then the "not in Pakistan"
toggle, then receiver) → total weight → rate per kg → duty + handling +
packing → total charges → worth of goods → collection date → description of
goods. Field labels carry the sender/receiver distinction on their own, which
is why the group headings could go.

- **Total charges is suggested, not computed.** It prefills with
  `(rate × weight) + other charges` and keeps in step with those inputs until
  staff type their own figure; after that it's left alone and the recalculated
  number is offered as a "use this total" link instead.
- **Returning customers prefill.** Blurring the sender mobile calls
  `lookupCustomer` → `find_customer_by_phone`, and fills in the rest of the
  sender block. It **only fills blanks**: the name field comes before the
  mobile, so the lookup always fires after staff have typed the name, and
  overwriting it would silently undo what they just entered.
- **The receiver is assumed to be in Pakistan.** A "Not in Pakistan" toggle
  switches both receiver mobile fields from the Pakistan rule to generic
  E.164 and reveals a short country select (`OTHER_COUNTRIES` in the
  validation module — a dozen realistic destinations plus "Other", not all
  ~200 countries, since the dialling code carries the detail).
- **The collection date is fixed to today and disabled.** See "Collection date
  and server time" below — the disabled input is presentation only.
- **On success a modal opens** over the form showing the invoice number
  (`PC0001` — the shipment reference is the invoice number) with two actions:
  copy it to the clipboard, and go to the shipment detail page. Copying falls
  back to the old `execCommand` selection trick, because `navigator.clipboard`
  needs a secure context and would silently do nothing on an office machine
  over plain http. Dismissing the modal (×, Escape, or the backdrop) clears
  the form for the next booking.

### Collection date and server time (`lib/server-time.js`)

The collection date is always today, is not typed, and is never taken from the
request payload. Three things make that true, and all three are needed:

1. **The value is resolved on the server**, so the staff machine's clock is
   irrelevant to it.
2. **`createBooking()` overwrites `collection_date` with that value** before
   validating. A disabled input stops nobody — a Server Action is a public
   HTTP endpoint — so the input being disabled is presentation, not the
   control. `updateBooking()` likewise re-reads the stored date from the row
   instead of trusting the payload, since collection dates aren't editable.
3. **The instant comes from the network**, not the host clock: `timeapi.io`
   and the `Date` header of a Cloudflare response, raced against each other,
   falling back to the host clock if both fail.

Details that matter if you touch this:

- **It formats in `Europe/London`, not UTC.** For most of the year London is an
  hour ahead, so between 23:00 and midnight BST the UTC date is still
  yesterday — a booking taken at 23:30 would be dated the day before.
- **The result is cached in module scope, not through `fetch`'s
  `next: { revalidate }`.** `/admin/new-booking` is `force-dynamic`, and Next
  turns that into `cache: 'no-store'` on every fetch in the segment, so the
  fetch cache would be ignored and an external API would be called on every
  page load. Five minutes on success, one minute on failure.
- **The lookup is capped by a wall clock**, not only by `AbortSignal.timeout`,
  which only bites if the request honours it. Worst case is ~1.75s and then
  the host clock; a booking must never hang waiting for a clock.
- `/admin/new-booking` must stay dynamic. As a static route it would be
  prerendered at build time with that day's date baked in, and would still be
  showing it weeks later.

### Validation (`lib/validation/booking.js`)

One `yup` schema, run **twice**: in the browser for live per-field errors, and
again inside `createBooking()`/`updateBooking()` before anything reaches the
database. The second run is not redundant — a Server Action is a public HTTP
endpoint, so anything validated only on the client can be bypassed by posting
to it directly.

**Errors appear per field, on touch.** A field validates when first blurred
and on every keystroke after that, via `bookingSchema.validateAt(name, …)`;
attempting a submit marks everything touched so flagged fields clear as
they're fixed. Two details: `validateAt` is given the whole values object
because `receiver_phone`'s rule depends on `receiver_country`, and toggling
the country **un-touches** the mobile fields it clears — a blank the user
didn't type shouldn't be flagged red.

The same module also owns phone/postcode normalization
(`normalizeUkMobile`, `normalizePkMobile`, `normalizeInternational`,
`formatPostcode`) and `toBookingPayload()`, which produces the canonical shape
`create_booking` expects.

Rules worth knowing: sender must be a **UK mobile** (`07…`, landlines
rejected — it's the number used to verify tracking); receiver must be a
Pakistan mobile (`+923…`) unless the overseas toggle is on; both email fields
and the second receiver mobile are the only optional inputs; `goods_value_gbp`
has a minimum of £1 and no maximum. The `collection_date` rule rejects past
dates but allows the value passed as `{ context: { originalDate } }` through —
that is what lets an existing booking, whose collection date has since passed,
still be re-saved when editing an unrelated field.

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
`get_shipment_by_reference` RPC and returns `null` on any mismatch.

**There is no seeded demo data any more.** The old `PC-4471` / `07700 900001`
and `BK-20931` / `07700 900002` pairs were removed along with the old
reference format — the database starts empty and `PC0001` is the first real
booking. To test tracking, create a booking in `/admin/new-booking` and use
its reference plus the sender mobile you entered.

## Business config (`lib/seo.js`)

Single source of truth for contact details, used everywhere so a change here
propagates sitewide:

- `BUSINESS.phones[]` — `{ city, display, href }` per branch (London,
  Birmingham, Nottingham)
- `BUSINESS.whatsapp` / `whatsappDisplay` — `wa.me` link + display number
- `BUSINESS.email` — `info@pakcargo.co.uk`
- `BUSINESS.companyNumber` — `17455357`. A UK limited company must show its
  registration number on its website and on every invoice, so this renders in
  the site footer and on the printed invoice document
- `BUSINESS.streetAddress` / `addressLocality` / `postalCode` — the office at
  **148 Sneinton Dale, Nottingham NG2 4HJ**. Defined only here, so it reaches
  the footer, Contact Us, the `Organization` structured data and the invoice
  from one place; don't hardcode it anywhere else
- `BUSINESS.legalName`, `hours`
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
- **Bookings can't be deleted from the UI** (only edited). Deleting a shipment
  cascades to its invoice and stages, which is a real destructive action and
  hasn't been given a confirmation flow yet — do it in Supabase for now.
- **No invoice emailing.** The invoice document is print/save-as-PDF only;
  there is no email provider wired up, deliberately.
- **Two currency figures in the printed terms need confirming**: clause 4
  ("a credit note of 20") has no currency symbol at all, and clause 12
  ("Service Charges (Mandatory) € 20 in by Air") is in euros for a UK company
  invoicing in pounds. Both are reproduced exactly as supplied rather than
  guessed at — they are contractual text on a customer-facing document.
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
