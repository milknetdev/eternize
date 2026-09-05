import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Layers, Gift, Timer } from "lucide-react";

type Stat = {
  icon: typeof Gift;
  value: number | null;
  display?: string;
  suffix?: string;
  label: string;
};

const stats: Stat[] = [
  { icon: LayoutGrid, value: 33, suffix: "", label: "Templates prontos" },
  { icon: Layers, value: 13, suffix: "", label: "Seções personalizáveis" },
  { icon: Gift, value: null, display: "PIX", label: "Presentes em dinheiro" },
  { icon: Timer, value: 5, suffix: " min", label: "Do zero ao site no ar" },
];

function AnimatedCounter({ value, suffix, isVisible }: { value: number; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1200;
    const steps = 40;
    const stepValue = value / steps;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-r from-primary via-gold-light to-primary relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`text-center text-white transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Icon className="w-8 h-8 mx-auto mb-4 opacity-80" />
                <div className="font-serif text-4xl md:text-5xl font-bold mb-2">
                  {stat.value === null ? (
                    stat.display
                  ) : (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ""} isVisible={isVisible} />
                  )}
                </div>
                <p className="text-white/80 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
