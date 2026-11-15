import type { Metadata } from "next";
import StudioApp from "@/components/studio/StudioApp";
import { pageMetadata } from "@/lib/seo/metadata";
import { STUDIO_DESCRIPTION, STUDIO_TITLE } from "@/lib/seo/pages";

export const metadata: Metadata = pageMetadata({ title: STUDIO_TITLE, description: STUDIO_DESCRIPTION, path: "/studio" });

export default function StudioPage() {
  return <StudioApp />;
}
