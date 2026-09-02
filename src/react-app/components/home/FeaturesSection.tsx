import { useEffect, useRef, useState } from "react";
import {
  Globe,
  Gift,
  Users,
  Camera,
  Mail,
  Calendar,
  Plane,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Site dos Noivos",
    description:
      "Crie um site elegante e personalizado com a história do casal, galeria de fotos e todas as informações do evento.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Gift,
    title: "Lista de Presentes",
    description:
      "Monte sua lista com presentes de qualquer loja ou receba valores em dinheiro via PIX de forma simples.",
    color: "from-primary to-gold-light",
  },
  {
    icon: Users,
    title: "RSVP Online",
    description:
      "Confirme presenças de forma digital. Seus convidados respondem em segundos pelo celular.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Camera,
    title: "Álbum de Fotos",
    description:
      "Galeria colaborativa onde convidados podem enviar fotos do casamento em tempo real.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Mail,
    title: "Convites Digitais",
    description:
      "Envie convites lindos por WhatsApp ou email, com link direto para confirmação de presença.",
    color: "from-rose to-pink-500",
  },
  {
    icon: Calendar,
    title: "Cronograma",
    description:
      "Compartilhe a programação completa do dia com horários, locais e dress code.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Plane,
    title: "Lua de Mel",
    description:
      "Crie uma vaquinha para sua lua de mel e deixe os convidados contribuírem com a viagem dos sonhos.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: LayoutDashboard,
    title: "Painel Completo",
    description:
      "Gerencie tudo em um só lugar: convidados, presentes, mensagens e muito mais.",
    color: "from-indigo-500 to-violet-500",
  },
];

function FeatureCard({
  feature,
  index,
  isVisible,
}: {
  feature: (typeof features)[0];
  index: number;
  isVisible: boolean;
}) {
  const Icon = feature.icon;

  return (
    <div
      className={`group relative p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
        {feature.title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
    </div>
  );
}

export default function FeaturesSection() {
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
      id="features"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-background to-cream relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary/5 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-rose/10 to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Tudo que você precisa
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
            Funcionalidades para um
            <br />
            <span className="text-primary">casamento perfeito</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Uma plataforma completa com todas as ferramentas para organizar,
            personalizar e celebrar o dia mais especial da sua vida.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
