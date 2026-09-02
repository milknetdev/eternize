import { useEffect, useRef, useState } from "react";
import { Clock, Church, Utensils, Music, Cake } from "lucide-react";

const events = [
  {
    time: "15:30",
    title: "Recepção dos Convidados",
    description: "Chegada e welcome drinks no jardim",
    icon: Clock,
  },
  {
    time: "16:00",
    title: "Cerimônia",
    description: "Troca de votos e alianças",
    icon: Church,
  },
  {
    time: "17:30",
    title: "Coquetel",
    description: "Drinks e finger foods no lounge",
    icon: Utensils,
  },
  {
    time: "19:00",
    title: "Jantar",
    description: "Menu degustação do Chef Carlos",
    icon: Utensils,
  },
  {
    time: "21:00",
    title: "Primeira Dança",
    description: "Abertura da pista pelos noivos",
    icon: Music,
  },
  {
    time: "23:00",
    title: "Corte do Bolo",
    description: "Bolo de 5 andares da confeitaria Doce Arte",
    icon: Cake,
  },
];

export default function EventTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-cream to-blush/30 relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Cronograma do Dia
          </h2>
          <p className="text-muted-foreground">
            Sábado, 15 de Março de 2025
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-primary/30" />

          {events.map((event, index) => {
            const Icon = event.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={event.time}
                className={`relative flex items-center gap-8 mb-12 last:mb-0 transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Mobile Layout */}
                <div className="md:hidden flex items-start gap-4 w-full pl-4">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-border/50">
                    <span className="text-primary font-bold text-lg">
                      {event.time}
                    </span>
                    <h3 className="font-serif text-xl font-semibold mt-1 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center w-full">
                  {/* Left Content */}
                  <div
                    className={`w-1/2 ${
                      isEven ? "pr-12 text-right" : "pr-12 opacity-0"
                    }`}
                  >
                    {isEven && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 inline-block text-left">
                        <span className="text-primary font-bold text-xl">
                          {event.time}
                        </span>
                        <h3 className="font-serif text-xl font-semibold mt-1 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center Icon */}
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Right Content */}
                  <div
                    className={`w-1/2 ${
                      !isEven ? "pl-12 text-left" : "pl-12 opacity-0"
                    }`}
                  >
                    {!isEven && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 inline-block">
                        <span className="text-primary font-bold text-xl">
                          {event.time}
                        </span>
                        <h3 className="font-serif text-xl font-semibold mt-1 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
