/**
 * Renders JSON-LD the way the Next 16 docs recommend: a plain <script> (not next/script), with "<" escaped so a
 * string in the data can't close the tag (XSS). Server Component; put it in the layout (site graph) or a page (FAQ).
 *
 *   import { JsonLd } from "@/components/JsonLd";
 *   import { siteJsonLd } from "@/lib/seo/jsonld";
 *   <body> <JsonLd data={siteJsonLd()} /> {children} </body>
 */
export function JsonLd({ data }: { data: Record<string, unknown> | undefined }) {
  if (!data) return null;
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}
