import { useEffect, useState } from "react";
import { Heart, ChevronDown } from "lucide-react";
import { useWedding, useWeddingPhotos } from "@/react-app/contexts/WeddingContext";

export default function DynamicHero() {
  const { wedding, theme } = useWedding();
  const photos = useWeddingPhotos();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const weddingDate = wedding.wedding_date ? new Date(wedding.wedding_date) : null;

  // Determine hero image: uploaded hero > first photo > placeholder
  const heroImageUrl = wedding.hero_image_key 
    ? `/api/files/${wedding.hero_image_key}`
    : photos.length > 0
      ? `/api/files/${photos[0].storage_key}`
      : "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop";

  useEffect(() => {
    if (!weddingDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const venue = wedding.venue_name || "Local a definir";

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ fontFamily: theme.bodyFont }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImageUrl}
          alt={`${wedding.partner1_name} e ${wedding.partner2_name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Wedding Label */}
        <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-80">
          Casamento
        </p>

        {/* Names */}
        <h1 
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium mb-4 leading-none"
          style={{ fontFamily: theme.headingFont }}
        >
          {wedding.partner1_name}
          <span className="inline-block mx-4 md:mx-8">
            <Heart 
              className="w-8 h-8 md:w-12 md:h-12 animate-pulse" 
              style={{ color: theme.primary, fill: theme.primary }}
            />
          </span>
          {wedding.partner2_name}
        </h1>

        {/* Date & Venue */}
        <p className="text-xl md:text-2xl font-light tracking-wide mb-12 opacity-90">
          {weddingDate ? formatDate(weddingDate) : "Data a definir"} • {venue}
        </p>

        {/* Countdown */}
        {weddingDate && (
          <div className="flex justify-center gap-4 md:gap-8 mb-16">
            {[
              { value: timeLeft.days, label: "Dias" },
              { value: timeLeft.hours, label: "Horas" },
              { value: timeLeft.minutes, label: "Min" },
              { value: timeLeft.seconds, label: "Seg" },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center rounded-xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px] backdrop-blur-md"
                style={{ 
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: `1px solid ${theme.primary}30`
                }}
              >
                <div 
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: theme.headingFont }}
                >
                  {item.value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs uppercase tracking-wider opacity-80">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="animate-bounce opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronDown className="w-8 h-8 mx-auto" />
        </button>
      </div>

      {/* Decorative Bottom Gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: `linear-gradient(to top, ${theme.background}, transparent)` }}
      />
    </section>
  );
}
