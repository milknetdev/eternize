import { useEffect, useRef, useState } from "react";
import { Pencil, Palette, Share2, Heart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Pencil,
    title: "Crie sua conta",
    description:
      "Cadastre-se gratuitamente em poucos segundos e comece a montar o site do seu casamento.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Personalize tudo",
    description:
      "Escolha templates, cores, fontes e adicione fotos. Deixe com a sua cara em minutos.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Compartilhe",
    description:
      "Envie o link do seu site e convites digitais para todos os convidados pelo WhatsApp.",
  },
  {
    number: "04",
    icon: Heart,
    title: "Celebre",
    description:
      "Acompanhe confirmações, presentes e mensagens. Foque no que importa: seu amor!",
  },
];

export default function HowItWorksSection() {
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
      id="how-it-works"
      ref={sectionRef}
      className="py-24 bg-cream relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
            Simples como dizer
            <br />
            <span className="text-primary">"sim, eu aceito"</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Em 4 passos simples, você terá tudo pronto para o grande dia
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-primary/30 via-primary/20 to-transparent" />
                )}

                <div className="relative text-center">
                  {/* Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center z-10">
                    {step.number}
                  </div>

                  {/* Icon Circle */}
                  <div className="mx-auto w-24 h-24 rounded-full bg-white shadow-lg shadow-primary/10 border border-border/50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="font-serif text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
