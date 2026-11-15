/**
 * Arman Digital SEO kit: placeholder guard. Our data files mark unknowns with "SLOT: ..." notes; those must never
 * reach a title, description or JSON-LD. Live build: the build fails. Preview: the text is dropped with a warning.
 */
import { INDEXABLE } from "./env";

// Case-sensitive on purpose: "todo" is ordinary Spanish ("todo el hogar"), "TODO:" is a note to ourselves.
export const PLACEHOLDER = /\bSLOT:|\bTODO:|\bTBD\b|\bFIXME\b|\[PLACEHOLDER\]|[Ll]orem ipsum|xxx-xxxx|\(555\)|555-01\d\d/;

/** Returns the trimmed text, or undefined when it's empty or a placeholder (throws instead on a live build). */
export function realText(value: string | undefined | null, where: string): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  if (PLACEHOLDER.test(v)) {
    const message = `[seo-kit] placeholder text in ${where}: "${v.slice(0, 80)}"`;
    if (INDEXABLE) throw new Error(message);
    console.warn(`${message} (left out)`);
    return undefined;
  }
  return v;
}
