import type { Metadata } from "next";
import StudioApp from "@/components/studio/StudioApp";

export const metadata: Metadata = {
  title: "Protection Studio | Porsche Walnut Creek",
  description: "Paint, film, tint and ceramic coating on a live 3D Porsche. Send the build to Porsche Walnut Creek.",
};

export default function StudioPage() {
  return <StudioApp />;
}
