# Auto Import Platform

SEO-ready automotive import platform demo for `portfolio-demo.example`.

## Demo modules

- Premium responsive homepage
- SEO landing page for Korea vehicle imports
- Demo vehicle catalog and search
- Budget breakdown calculator
- Order tracking with code `AA-DEMO-2406`
- Customer dashboard prototype
- Verified-delivery archive structure
- Privacy and contact pages
- Organization, Service, and FAQ structured data
- Sitemap, robots, canonical URLs, and social metadata
- Platform Risk Score and three-car comparison
- Price alerts and listing-link analysis
- AutoBot budget qualification flow
- Connected customer cabinet
- Demo CRM and catalog administration panel
- Draft model SEO cluster kept behind `noindex`

## Local preview

```bash
npm run dev
```

Open `http://localhost:4173`.

Demo platform routes:

- `/avtomobiller/` — catalog, filters, comparison and alerts
- `/kabinet/` — customer cabinet
- `/admin/` — company administration panel
- `/modeller/` — SEO content cluster prepared for later activation

## Hosting

The current Railway preview uses a small Node static server so the entire demo can be protected with an `X-Robots-Tag`. For the final static marketing version, Cloudflare Pages can reduce hosting to a free tier. A paid backend becomes necessary when private accounts, a database, live admin editing, automated supplier imports, messaging or tracking integrations are activated.

## Search indexing

Indexing is disabled by default. Do not enable it while sample reviews, sample prices, sample deliveries or placeholder legal details are present.

Set `PUBLIC_INDEXING=true` only after final legal and commercial verification.

## Before production

- Replace the placeholder phone and add the verified office address.
- Connect the lead form to the customer's chosen channel.
- Add the legal company name, tax ID, contract sample, and privacy page.
- Add only real delivered-car cases and customer-approved media.
- Confirm current customs rules before publishing exact calculator results.
- Verify `portfolio-demo.example` availability and register it in the customer's name.
