import { useEffect } from "react";
import CoupleHero from "@/react-app/components/couple/CoupleHero";
import OurStory from "@/react-app/components/couple/OurStory";
import PhotoGallery from "@/react-app/components/couple/PhotoGallery";
import EventTimeline from "@/react-app/components/couple/EventTimeline";
import LocationSection from "@/react-app/components/couple/LocationSection";
import DressCode from "@/react-app/components/couple/DressCode";
import GiftRegistry from "@/react-app/components/couple/GiftRegistry";
import RSVPSection from "@/react-app/components/couple/RSVPSection";
import GuestMessages from "@/react-app/components/couple/GuestMessages";
import CoupleFooter from "@/react-app/components/couple/CoupleFooter";

export default function CoupleDemo() {
  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Update page title
    document.title = "Ana & João - 15 de Março, 2025";

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <CoupleHero />
      <OurStory />
      <PhotoGallery />
      <EventTimeline />
      <LocationSection />
      <DressCode />
      <GiftRegistry />
      <RSVPSection />
      <GuestMessages />
      <CoupleFooter />
    </div>
  );
}
