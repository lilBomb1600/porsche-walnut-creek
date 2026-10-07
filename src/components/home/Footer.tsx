import Link from "next/link";
import { dealership } from "@/data/dealership";
import { cars, hdriCredits } from "@/data/cars";
import { SAMPLE_PRICING_NOTE } from "@/data/protection";
import { Wordmark } from "@/components/Wordmark";
import { mediaCredit } from "@/data/media";

export function Footer() {
  const d = dealership;
  const cols = [
    {
      title: "Shop",
      links: [
        { label: "New vehicles", href: d.links.newInventory },
        { label: "Pre-owned", href: d.links.usedInventory },
        { label: "Porsche Approved", href: d.links.cpo },
        { label: "Electric and hybrid", href: d.links.electric },
      ],
    },
    {
      title: "Own",
      links: [
        { label: "Schedule service", href: d.links.scheduleService },
        { label: "Order parts", href: d.links.orderParts },
        { label: "Service specials", href: d.links.serviceSpecials },
        { label: "Protection studio", href: "/studio" },
      ],
    },
    {
      title: "Store",
      links: [
        { label: "Finance center", href: d.links.finance },
        { label: "Value your trade", href: d.links.tradeIn },
        { label: "Contact", href: d.links.contact },
        { label: "Official website", href: d.official },
      ],
    },
  ];
  return (
    <footer className="border-t border-[var(--line)] bg-[#05070b] px-5 pb-10 pt-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-[30ch] text-[14px] leading-relaxed text-drl-dim">
              {d.address.oneLine}
              <br />
              <a href={`tel:${d.phone.tel}`} className="text-drl-2 hover:text-drl">
                {d.phone.display}
              </a>
            </p>
            <p className="mt-3 text-[13px] text-drl-dim">{d.parent}</p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="text-[13px] font-semibold text-drl-2">{c.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link href={l.href} className="text-[14.5px] text-drl-dim transition-colors hover:text-drl">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[14.5px] text-drl-dim transition-colors hover:text-drl">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 grid gap-6 border-t border-[var(--line)] pt-8 text-[12.5px] leading-relaxed text-drl-dim md:grid-cols-2">
          <p>
            Independent concept site designed and built by{" "}
            <a href="https://arman-digital.vercel.app" target="_blank" rel="noopener noreferrer" className="text-drl-2 underline decoration-[var(--line-2)] hover:text-drl">
              Arman Digital
            </a>
            . Not the official Porsche Walnut Creek website, and not affiliated with or endorsed by Sonic Automotive or Porsche Cars North
            America. Porsche, the Porsche wordmark, 911, Carrera, Turbo, Taycan, Panamera, Macan, Cayenne, Boxster and Cayman are
            trademarks of Dr. Ing. h.c. F. Porsche AG. {SAMPLE_PRICING_NOTE}
          </p>
          <p>
            3D models:{" "}
            {cars.map((c, i) => (
              <span key={c.id}>
                <a href={c.credit.source} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line-2)] hover:text-drl">
                  {c.credit.title}
                </a>{" "}
                by {c.credit.author} (
                <a href={c.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line-2)] hover:text-drl">
                  {c.credit.license}
                </a>
                ){i < cars.length - 1 ? "; " : ". "}
              </span>
            ))}
            Materials and lighting adapted for this site. Lighting environments from Poly Haven (CC0):{" "}
            {hdriCredits.map((h, i) => (
              <span key={h.name}>
                <a href={h.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line-2)] hover:text-drl">
                  {h.name}
                </a>
                {i < hdriCredits.length - 1 ? ", " : "."}
              </span>
            ))}{" "}
            Photos and film: Porsche AG, via{" "}
            <a href={mediaCredit.newsroom} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line-2)] hover:text-drl">
              the Porsche Newsroom
            </a>
            , used with approval. Showroom films: Porsche Walnut Creek. Creator films by @brannoncjackson, @lxck.render and @hitte69
            on TikTok, shown with permission. The opening film cuts Porsche's Nürburgring 24 Hours footage with shots generated in
            Higgsfield from Porsche photography. Studio backdrops and textures generated with Higgsfield.
          </p>
        </div>
      </div>
    </footer>
  );
}
