import { useEffect, useState } from "react";
import { Heart, ChevronDown, Music } from "lucide-react";

export default function CoupleHero() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const weddingDate = new Date("2025-03-15T16:00:00");

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
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop"
          alt="Ana e João"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </div>

      {/* Floating Music Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`absolute top-6 right-6 z-20 w-12 h-12 rounded-full glass flex items-center justify-center transition-all ${
          isPlaying ? "bg-white/30" : "bg-white/10"
        }`}
      >
        <Music className={`w-5 h-5 text-white ${isPlaying ? "animate-pulse" : ""}`} />
      </button>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Wedding Label */}
        <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-80">
          Casamento
        </p>

        {/* Names */}
        <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium mb-4 leading-none">
          Ana
          <span className="inline-block mx-4 md:mx-8">
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-rose fill-rose animate-pulse" />
          </span>
          João
        </h1>

        {/* Date */}
        <p className="text-xl md:text-2xl font-light tracking-wide mb-12 opacity-90">
          15 de Março de 2025 • São Paulo
        </p>

        {/* Countdown */}
        <div className="flex justify-center gap-4 md:gap-8 mb-16">
          {[
            { value: timeLeft.days, label: "Dias" },
            { value: timeLeft.hours, label: "Horas" },
            { value: timeLeft.minutes, label: "Min" },
            { value: timeLeft.seconds, label: "Seg" },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center glass rounded-xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]"
            >
              <div className="font-serif text-3xl md:text-4xl font-bold">
                {item.value.toString().padStart(2, "0")}
              </div>
              <div className="text-xs uppercase tracking-wider opacity-80">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="animate-bounce opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronDown className="w-8 h-8 mx-auto" />
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
