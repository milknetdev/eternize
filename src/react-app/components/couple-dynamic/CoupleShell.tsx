import type { ComponentType } from "react";
import { useWedding } from "@/react-app/contexts/WeddingContext";
import type { LayoutId } from "@/data/templates";
import DynamicHero from "./DynamicHero";
import DynamicStory from "./DynamicStory";
import DynamicGallery from "./DynamicGallery";
import DynamicTimeline from "./DynamicTimeline";
import DynamicParents from "./DynamicParents";
import DynamicGodparents from "./DynamicGodparents";
import DynamicLocation from "./DynamicLocation";
import DynamicDressCode from "./DynamicDressCode";
import DynamicAccommodations from "./DynamicAccommodations";
import DynamicGifts from "./DynamicGifts";
import DynamicConfirmCTA from "./DynamicConfirmCTA";
import DynamicMessages from "./DynamicMessages";
import DynamicFooter from "./DynamicFooter";

type SectionKey =
  | "hero" | "story" | "gallery" | "timeline" | "parents" | "godparents"
  | "location" | "dresscode" | "accommodations" | "gifts" | "cta" | "messages" | "footer";

const SECTIONS: Record<SectionKey, ComponentType> = {
  hero: DynamicHero,
  story: DynamicStory,
  gallery: DynamicGallery,
  timeline: DynamicTimeline,
  parents: DynamicParents,
  godparents: DynamicGodparents,
  location: DynamicLocation,
  dresscode: DynamicDressCode,
  accommodations: DynamicAccommodations,
  gifts: DynamicGifts,
  cta: DynamicConfirmCTA,
  messages: DynamicMessages,
  footer: DynamicFooter,
};

// Each layout reorders the page. "footer" always last, "hero" always first.
const ORDER: Record<LayoutId, SectionKey[]> = {
  classico: ["hero", "story", "gallery", "timeline", "parents", "godparents", "location", "dresscode", "accommodations", "gifts", "cta", "messages", "footer"],
  editorial: ["hero", "story", "timeline", "gallery", "location", "parents", "godparents", "dresscode", "gifts", "accommodations", "messages", "cta", "footer"],
  minimalista: ["hero", "story", "location", "timeline", "dresscode", "gifts", "gallery", "parents", "godparents", "accommodations", "cta", "messages", "footer"],
  moderno: ["hero", "gallery", "story", "gifts", "timeline", "parents", "godparents", "location", "dresscode", "accommodations", "cta", "messages", "footer"],
};

/**
 * Structural overrides per layout. These only target the stable utility-class
 * shapes the Dynamic* sections already use, scoped to the layout wrapper, so
 * "classico" is untouched and the colour/font system is independent of this.
 */
const LAYOUT_CSS = `
.couple-shell[data-layout="editorial"] section > div { max-width: 68rem; }
.couple-shell[data-layout="editorial"] section .text-center { text-align: left; }
.couple-shell[data-layout="editorial"] section .justify-center { justify-content: flex-start; }
.couple-shell[data-layout="editorial"] section .mx-auto { margin-left: 0; }
.couple-shell[data-layout="editorial"] section h2 { font-size: clamp(2.75rem, 6vw, 5rem); line-height: 1.04; }
.couple-shell[data-layout="editorial"] section { padding-top: 5rem; padding-bottom: 5rem; }

.couple-shell[data-layout="minimalista"] section { padding-top: 6rem; padding-bottom: 6rem; }
.couple-shell[data-layout="minimalista"] section > div { max-width: 44rem; }
.couple-shell[data-layout="minimalista"] section h2 { font-size: clamp(1.75rem, 4vw, 2.6rem); font-weight: 400; letter-spacing: 0.04em; margin-bottom: 1rem; }
.couple-shell[data-layout="minimalista"] section .uppercase { opacity: 0.5; letter-spacing: 0.35em; font-size: 0.68rem; }
.couple-shell[data-layout="minimalista"] section .mb-16 { margin-bottom: 3rem; }

.couple-shell[data-layout="moderno"] section h2 { text-transform: uppercase; letter-spacing: -0.005em; font-weight: 800; font-size: clamp(2.5rem, 6vw, 5rem); }
.couple-shell[data-layout="moderno"] section .uppercase { letter-spacing: 0.25em; font-weight: 700; }
.couple-shell[data-layout="moderno"] section .rounded-2xl { border-radius: 1.75rem; }
.couple-shell[data-layout="moderno"] section .rounded-xl { border-radius: 1.25rem; }
.couple-shell[data-layout="moderno"] section { padding-top: 4.5rem; padding-bottom: 4.5rem; }
`;

export default function CoupleShell() {
  const { layout } = useWedding();
  const order = ORDER[layout] ?? ORDER.classico;

  return (
    <div className="couple-shell min-h-screen" data-layout={layout}>
      <style>{LAYOUT_CSS}</style>
      {order.map((key) => {
        const Section = SECTIONS[key];
        return <Section key={key} />;
      })}
    </div>
  );
}
