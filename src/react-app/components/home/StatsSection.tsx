import { useEffect, useRef, useState } from "react";
import { Heart, Users, Gift, Globe } from "lucide-react";

const stats = [
  {
    icon: Heart,
    value: 50000,
    suffix: "+",
    label: "Casais felizes",
    color: "text-rose",
  },
  {
    icon: Users,
    value: 2,
    suffix: "M+",
    label: "Convidados gerenciados",
    color: "text-blue-500",
  },
  {
    icon: Gift,
    value: 500000,
    suffix: "+",
    label: "Presentes entregues",
    color: "text-primary",
  },
  {
    icon: Globe,
    value: 100,
    suffix: "+",
    label: "Cidades atendidas",
    color: "text-green-500",
  },
];

function AnimatedCounter({
  value,
  suffix,
  isVisible,
}: {
  value: number;
  suffix: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    const stepTime = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0);
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "k";
    }
    return num.toString();
  };

  return (
    <span>
      {value >= 1000000 ? formatNumber(count) : count.toLocaleString("pt-BR")}
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
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-r from-primary via-gold-light to-primary relative overflow-hidden"
    >
      {/* Background Pattern */}
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
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Icon className="w-8 h-8 mx-auto mb-4 opacity-80" />
                <div className="font-serif text-4xl md:text-5xl font-bold mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    isVisible={isVisible}
                  />
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
