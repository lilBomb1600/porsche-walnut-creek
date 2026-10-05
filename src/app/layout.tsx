import type { Metadata, Viewport } from "next";
import { Archivo, Mona_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  display: "swap",
});

const mona = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Porsche Walnut Creek | Paint, protection and the 911, lit up",
  description:
    "Porsche Walnut Creek at 2555 N Main St. Build your paint protection on a live 3D 911, then shop new, Porsche Approved and pre-owned, or book service. Concept site by Arman Digital.",
  metadataBase: new URL("https://porsche-walnut-creek.vercel.app"),
  openGraph: {
    title: "Porsche Walnut Creek",
    description: "Paint, film, tint and ceramic on a live 3D 911. Concept site by Arman Digital.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090e",
  colorScheme: "dark",
};

const CONTRACT = `<!--
THESIS: The car introduces itself by its lights; the tail-light band becomes the page's rail. Refuses the category default: full-bleed car photo, model carousel, red button.
OWN-WORLD: Night asphalt #07090e under blue hour #1b2742. Interface color is lamp light only: DRL white #eef4ff, tail red #e8102a, indicator amber #ffab1f. One horizontal light bar carries nav, progress and dividers; state is line form (lit solid, dim dashed, struck). Archivo Expanded italic display like a motorsport livery; Mona Sans text; tabular numerals; liquid-glass controls.
STORY: The visitor watches the 911 wake up, plays with paint, film, tint and coat on the live car, sends the build (or the salesperson sends it to finance), then finds service, hours and the way in.
FIRST VIEWPORT: Black. Four points ignite; the live 911 turns to its tail; its light band extends edge to edge as the rail, lettered WALNUT CREEK. H1 and two actions sit below it, left.
FORM: Light Signature, #6 of 7, seed 657d44bf.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${mona.variable} antialiased`}>
      <body>
        <div hidden aria-hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
