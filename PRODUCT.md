# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Shoppers at home.** East Bay drivers (Walnut Creek, Concord, Pleasant Hill, Alamo, Berkeley) researching a new or pre-owned Porsche, servicing one they own, or deciding which protection to add to a car they're buying. They browse on phone and desktop, often in the evening, and want to see the car and the options before they call or come in.
- **Salespeople at the desk (showroom mode).** A Porsche Walnut Creek salesperson sitting with a customer, walking them through paint protection film, window tint and ceramic coating on a live 3D car, then sending the chosen package to the finance office with the customer name, salesperson and stock/deal number.

## Product Purpose

A demo dealership website for Porsche Walnut Creek, built by Arman (Arman Digital, who works at the dealership) to out-class an existing internal demo: a manager's 3D "Protection Studio 911" configurator (carsrecon-demo.vercel.app). That demo is one 911 Carrera 4S in a plain white panel UI with tabs for color, tint, PPF, ceramic and lighting scene, a running total, and a "send to finance" form.

This site has to do everything that demo does (paint, tint, PPF coverage and finish, ceramic tier, lighting environments, running total, send-to-finance handoff) and then go well beyond it. That means a full dealership experience around the studio, more cars, and a far more cinematic, memorable presentation. Success means Arman's colleagues and managers see it and immediately rate it above the existing demo.

## Positioning

The only Porsche dealership site where the protection sale happens on a live, cinematic 3D car the customer can play with themselves at home, which the salesperson then continues at the desk in showroom mode. It's a real store's real details wrapped around a studio that turns "add-ons at the finance desk" into something a buyer actually wants to explore.

## Operating Context

- Customer path: browse the site, then open the 3D studio, pick paint, PPF coverage and finish, tint and ceramic, and send the build to the store for a quote.
- Showroom path: a salesperson switches the studio into showroom mode, configures with the customer, fills in customer name, phone, salesperson, stock/deal number and notes, then copies the summary or emails it to the finance office (the reference demo uses copy-summary and open-email; no backend in this version).
- The dealership's own transactional pages (live inventory, credit application, schedule service, trade-in) live on the official site at porschewalnutcreek.com. This demo links out to them rather than faking inventory.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router, TypeScript, Tailwind v4), React Three Fiber + drei + postprocessing for 3D, GSAP ScrollTrigger + Lenis and Framer Motion for motion. Static Vercel deploy, no backend and no env vars.
- 3D assets on hand (in `public/models/`):
  - `911-carrera-4s.glb`: "(FREE) Porsche 911 Carrera 4S" by Karol Miklas, CC BY-SA 4.0 (same base model as the reference demo). Has a separable `paint` material and named parts.
  - `930-turbo.glb`: "FREE 1975 Porsche 911 (930) Turbo" by Lionsharp Studios, CC BY 4.0. Has a `paint` material with clearcoat.
  - Both came via github.com/pmndrs/examples (MIT). Attribution must appear on the site.
- Lighting (in `public/hdri/`): Poly Haven CC0 HDRIs `studio_small_09`, `kloofendal_48d_partly_cloudy_puresky`, `potsdamer_platz`, `rooftop_night` (1k).
- Arman wants GT3, 964 and 993 models too. **Open:** no cleanly licensed free downloads were found yet. Most free Sketchfab ones are game rips or non-commercial. The site's car data must make adding models later a drop-in.
- Protection pricing is **sample menu pricing**, clearly labeled as such ("final price set by the finance office"). Do not present it as the store's real prices.
- No real photography (Arman chose a 3D/graphic-only build). No Porsche press photos.
- Trademark: do not reproduce the official Porsche crest or wordmark artwork, or the proprietary Porsche Next typeface. Express the Porsche identity through design language instead. The dealership's name as text is fine.
- The site must carry a clear note that it is an independent concept by Arman Digital and not the dealership's official website.

## Brand Commitments

- Arman's binding brief: "flashy and unique," "give it a Porsche look," heavy motion, built to blow people away. The quieter editorial register is explicitly not wanted.
- Real dealership identity: **Porsche Walnut Creek**, "a Sonic Automotive® Company."

## Evidence on Hand

Verified from porschewalnutcreek.com on 2026-10-04:

- Address: 2555 N Main St, Walnut Creek, CA 94597 (off the 680; describes itself as near Concord and Alamo).
- Main phone: 925-532-0016.
- Sales hours: Mon–Fri 8:00 AM–6:00 PM · Sat 9:00 AM–6:00 PM · Sun 11:00 AM–5:00 PM.
- Service hours: Mon–Fri 7:30 AM–6:00 PM · Sat 8:00 AM–2:00 PM · Sun Closed.
- Parts hours: Mon–Fri 7:30 AM–6:00 PM · Sat 9:00 AM–5:00 PM · Sun Closed.
- Departments: new vehicles, pre-owned, Porsche Approved Certified Pre-Owned, service center with certified Porsche technicians (services any vehicle), OEM parts center, tire center, finance and leasing, trade-in appraisal.
- Tire center offer: eligible tires purchased there come with complimentary 100% road hazard replacement coverage for 24 months.
- "Service Now, Pay Later" financing (via Affirm).
- Sonic Automotive: 140+ locations; "Transparent Pricing" (no hidden fees, the price you see is the price you can get); Sonic named one of Newsweek's 2026 Most Trustworthy Companies in America. Sonic acquired the store in August 2026.
- Social: facebook.com/porschewalnutcreek, instagram.com/porschewalnutcreek.
- Official site links: /new-vehicles/, /used-vehicles/, /service/schedule/, /finance/, trade-in tool, /parts/order-parts/, /contact-us/.

**Absent, do not fabricate:** customer reviews (DealerRater has 0; Yelp is behind bot verification), founding year, staff names, live inventory counts, and vehicle prices or MSRPs.

## Product Principles

1. Do everything the reference demo does, visibly better, and then more. Every feature of his has a superior equivalent here.
2. Real store, real facts. Sample pricing is always labeled; nothing invented.
3. The car is the hero. Interface and copy serve the car and get out of its way.
4. One studio, two audiences: it has to work for a buyer alone on a phone and for a salesperson at the desk.
5. Spectacle with discipline: motion carries meaning (ignition, light, paint, reveal), stays smooth on real devices, and respects reduced motion.

## Accessibility & Inclusion

WCAG AA contrast on all text, full keyboard operation of the studio controls, `prefers-reduced-motion` honored for scroll and camera motion, and a usable non-WebGL fallback.
