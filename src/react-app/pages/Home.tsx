import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import HeroSection from "@/react-app/components/home/HeroSection";
import FeaturesSection from "@/react-app/components/home/FeaturesSection";
import HowItWorksSection from "@/react-app/components/home/HowItWorksSection";
import TestimonialsSection from "@/react-app/components/home/TestimonialsSection";
import StatsSection from "@/react-app/components/home/StatsSection";
import CTASection from "@/react-app/components/home/CTASection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
