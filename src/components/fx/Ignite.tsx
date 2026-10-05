"use client";

import { Fragment, type CSSProperties } from "react";

/**
 * Splits text into letters that light up in sequence when `lit` turns true.
 * Words stay unbroken; the accessible name is the plain string.
 */
export function Ignite({ text, lit, stagger = 32, delay = 0 }: { text: string; lit: boolean; stagger?: number; delay?: number }) {
  let i = 0;
  const lines = text.split("\n");
  return (
    <span data-lit={lit} aria-label={text.replace(/\n/g, " ")} role="text">
      {lines.map((line, li) => (
        <Fragment key={li}>
          {line.split(" ").map((word, wi) => (
            <Fragment key={wi}>
              <span aria-hidden className="inline-block whitespace-nowrap">
                {[...word].map((ch, ci) => {
                  const style: CSSProperties = { transitionDelay: `${delay + i++ * stagger}ms` };
                  return (
                    <span key={ci} className="ignite-char" style={style}>
                      {ch}
                    </span>
                  );
                })}
              </span>
              {wi < line.split(" ").length - 1 && " "}
            </Fragment>
          ))}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </span>
  );
}
