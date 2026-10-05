import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { dealership } from "@/data/dealership";
import { LampLink, LampLine } from "@/components/ui/lamp";
import { LitHeading } from "./LitHeading";
import { HoursBoard } from "./HoursBoard";

function Fact({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[34px_1fr] gap-x-4 border-t border-[var(--line)] py-5">
      <LampLine state="lit" tone="red" className="mt-[11px] w-[34px]" />
      <div>
        <h3 className="text-[17px] font-semibold text-drl">{title}</h3>
        <p className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-drl-dim text-pretty">{children}</p>
      </div>
    </li>
  );
}

export function Service() {
  const d = dealership;
  return (
    <section id="service" className="px-5 py-32 sm:px-8 lg:px-12 lg:py-40">
      <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <LitHeading className="text-[clamp(38px,5.2vw,80px)] leading-[0.92]">Service that knows the car.</LitHeading>
          <ul className="mt-12">
            <Fact title="Certified Porsche technicians">The skills and equipment for every kind of maintenance and repair, and they&apos;ll service any vehicle you drive.</Fact>
            <Fact title="Authentic OEM Porsche parts">A full stock in the parts center, or order parts online.</Fact>
            <Fact title="Porsche tire center">{d.promises.tires}</Fact>
            <Fact title="Service now, pay later">Financing is available on service visits, so the work doesn&apos;t have to wait.</Fact>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <LampLink href={d.links.scheduleService}>
              Schedule service <ArrowUpRight size={17} />
            </LampLink>
            <LampLink href={d.links.serviceSpecials} tone="ghost">
              Service specials
            </LampLink>
            <LampLink href={d.links.orderParts} tone="quiet">
              Order parts
            </LampLink>
          </div>
        </div>
        <div className="lg:pt-6">
          <h3 className="font-display text-[22px] font-extrabold text-drl">Hours</h3>
          <p className="mt-2 text-[14px] text-drl-dim">Walnut Creek time. Today is lit.</p>
          <div className="mt-8">
            <HoursBoard />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Buying() {
  const d = dealership;
  const rows = [
    { href: d.links.cpo, title: "Porsche Approved", note: "Certified pre-owned with added Porsche benefits." },
    { href: d.links.applyFinancing, title: "Finance and leasing", note: "Apply online. The finance center walks you through every step." },
    { href: d.links.tradeIn, title: "Value your trade", note: "Get a number for your current car before you come in." },
    { href: d.links.usedInventory, title: "Pre-owned inventory", note: "Carefully inspected, listed live." },
  ];
  return (
    <section id="buying" className="border-t border-[var(--line)] px-5 py-32 sm:px-8 lg:px-12 lg:py-40">
      <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-2">
        <div>
          <LitHeading className="text-[clamp(38px,5.2vw,80px)] leading-[0.92]">The price you see is the price you can get.</LitHeading>
          <p className="mt-8 max-w-[46ch] text-[16.5px] leading-relaxed text-drl-2 text-pretty">
            That&apos;s Porsche Walnut Creek Transparent Pricing: no hidden fees. The store is part of Sonic Automotive, which Newsweek
            named one of its 2026 Most Trustworthy Companies in America.
          </p>
        </div>
        <ul className="self-end border-t border-[var(--line)]">
          {rows.map((r) => (
            <li key={r.title} className="border-b border-[var(--line)]">
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-[1fr_auto] items-center gap-6 py-6 transition-colors"
              >
                <span>
                  <span className="font-display block text-[clamp(22px,2.4vw,30px)] font-extrabold text-drl-2 transition-colors duration-300 group-hover:text-drl">
                    {r.title}
                  </span>
                  <span className="mt-1.5 block text-[14.5px] text-drl-dim">{r.note}</span>
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-full text-drl-2 ring-1 ring-[var(--line-2)] transition-[transform,color,box-shadow] duration-300 group-hover:translate-x-1 group-hover:text-night group-hover:ring-drl group-hover:[background:#eef4ff]">
                  <ArrowUpRight size={18} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Visit() {
  const d = dealership;
  const lat = d.geo.lat.toFixed(4);
  const lng = Math.abs(d.geo.lng).toFixed(4);
  return (
    <section id="visit" className="relative overflow-hidden border-t border-[var(--line)] px-5 pb-28 pt-32 sm:px-8 lg:px-12 lg:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <LitHeading className="text-[clamp(48px,10vw,170px)] leading-[0.84] tracking-[-0.025em]" line={false}>
          2555 N Main St
        </LitHeading>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[18px] font-medium text-drl-2">
              Walnut Creek, CA 94597. {d.address.note}
            </p>
            <p className="tnum font-display mt-4 text-[13px] font-bold tracking-[0.24em] text-drl-dim">
              {lat}° N · {lng}° W
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LampLink href={d.directionsUrl}>
                Get directions <ArrowRight size={17} />
              </LampLink>
              <LampLink href={`tel:${d.phone.tel}`} tone="ghost">
                <Phone size={16} /> {d.phone.display}
              </LampLink>
            </div>
          </div>
          <div className="flex gap-6 text-[14.5px] font-semibold">
            <a href={d.social.instagram} target="_blank" rel="noopener noreferrer" className="text-drl-2 hover:text-drl hover:underline">
              Instagram
            </a>
            <a href={d.social.facebook} target="_blank" rel="noopener noreferrer" className="text-drl-2 hover:text-drl hover:underline">
              Facebook
            </a>
            <a href={d.links.contact} target="_blank" rel="noopener noreferrer" className="text-drl-2 hover:text-drl hover:underline">
              Contact form
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudioModes() {
  return (
    <section id="studio" className="border-b border-[var(--line)] px-5 py-28 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1400px]">
        <LitHeading className="max-w-[16ch] text-[clamp(38px,5.2vw,80px)] leading-[0.92]">One studio for the couch and the desk.</LitHeading>
        <div className="relative mt-16">
          <div aria-hidden className="pointer-events-none absolute -left-10 top-0 h-80 w-80 rounded-full bg-[#e8102a]/30 blur-[90px]" />
          <div aria-hidden className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-[#0098c9]/25 blur-[90px]" />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 rounded-full bg-[#f4c400]/15 blur-[80px]" />
          <div className="relative grid gap-5 md:grid-cols-2">
            <div className="glass rounded-[28px] p-8 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white">
                <span aria-hidden className="block h-2 w-2 rounded-full bg-[#ff3348] shadow-[0_0_10px_#ff3348]" /> For buyers
              </span>
              <h3 className="font-livery mt-6 text-[34px] leading-none text-white">At home</h3>
              <p className="mt-4 max-w-[42ch] text-[15.5px] leading-relaxed text-white/75 text-pretty">
                Build it on your phone tonight. Copy the link, and whoever picks up at the store opens your exact car, film lines and all.
              </p>
              <div className="mt-8">
                <LampLink href="/studio">
                  Open the studio <ArrowRight size={17} />
                </LampLink>
              </div>
            </div>
            <div className="glass rounded-[28px] p-8 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white">
                <span aria-hidden className="block h-2 w-2 rounded-full bg-[#ffab1f] shadow-[0_0_10px_#ffab1f]" /> For the sales team
              </span>
              <h3 className="font-livery mt-6 text-[34px] leading-none text-white">At the desk</h3>
              <p className="mt-4 max-w-[42ch] text-[15.5px] leading-relaxed text-white/75 text-pretty">
                Showroom mode adds the finance handoff: customer, salesperson and stock number go out with the build, ready for the deal.
              </p>
              <div className="mt-8">
                <LampLink href="/studio?mode=showroom" tone="ghost">
                  Showroom mode <ArrowRight size={17} />
                </LampLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
