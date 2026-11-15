import type { Metadata, Viewport } from "next";
import { JsonLd } from "@/components/JsonLd";
import { dealership } from "@/data/dealership";
import { SITE_URL } from "@/lib/seo/env";
import { WEBSITE_ID, jsonLdGraph } from "@/lib/seo/jsonld";
import { rootMetadata } from "@/lib/seo/metadata";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/seo/pages";
import { Archivo, Michroma, Mona_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  display: "swap",
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mona = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = rootMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION });

/**
 * Unofficial concept for a real dealer: no LocalBusiness/AutoDealer node, only a WebSite node that says what it is
 * (same words as the footer). Never present this as the dealer's official site.
 */
const conceptJsonLd = jsonLdGraph({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: `${dealership.name} (independent concept)`,
  description: "Independent concept site designed and built by Arman Digital.",
  inLanguage: "en",
  creator: { "@type": "Organization", name: "Arman Digital", url: "https://arman-digital.vercel.app" },
});

export const viewport: Viewport = {
  themeColor: "#07090e",
  colorScheme: "dark",
};

const CONTRACT = `<!--
THESIS: The car introduces itself by its lights; the tail-light band becomes the page's rail. Refuses the category default: full-bleed car photo, model carousel, red button.
OWN-WORLD: Night asphalt #07090e under blue hour #1b2742. Interface color is lamp light only: DRL white #eef4ff, tail red #e8102a, indicator amber #ffab1f. One horizontal light bar carries nav, progress and dividers; state is line form (lit solid, dim dashed, struck). Michroma wide squared display echoing the Porsche wordmark; Mona Sans text; tabular numerals; liquid-glass controls.
STORY: The visitor watches the 911 wake up, plays with paint, film, tint and coat on the live car, sends the build (or the salesperson sends it to finance), then finds service, hours and the way in.
FIRST VIEWPORT: Black. Four points ignite; the live 911 turns to its tail; its light band extends edge to edge as the rail, lettered WALNUT CREEK. H1 and two actions sit below it, left.
FORM: Light Signature, #6 of 7, seed 657d44bf.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${michroma.variable} ${mona.variable} antialiased`}>
      <body>
        <div hidden aria-hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <JsonLd data={conceptJsonLd} />
        {children}
      </body>
    </html>
  );
}
