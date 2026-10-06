import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteRail } from "@/components/home/SiteRail";
import { HomeStory } from "@/components/home/HomeStory";
import { Lineup } from "@/components/home/Lineup";
import { Heritage } from "@/components/home/Heritage";
import { History } from "@/components/home/History";
import { Legends } from "@/components/home/Legends";
import { FilmBand } from "@/components/home/FilmBand";
import { Motorsport } from "@/components/home/Motorsport";
import { Buying, Service, StudioModes, Visit } from "@/components/home/Sections";
import { Footer } from "@/components/home/Footer";
import { CursorLamp } from "@/components/fx/CursorLamp";
import { LedTicker } from "@/components/fx/LedTicker";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SiteRail />
      <CursorLamp />
      <main>
        <HomeStory />
        <StudioModes />
        <LedTicker />
        <FilmBand />
        <Lineup />
        <Motorsport />
        <Legends />
        <Heritage />
        <History />
        <Service />
        <Buying />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
