import { useEffect, useRef, useState } from "react";
import { Button } from "@/react-app/components/ui/button";
import { Check, Star, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    description: "Perfeito para começar a planejar seu casamento",
    features: [
      "Site personalizado",
      "Lista de até 50 presentes",
      "Confirmação de presença",
      "Galeria de fotos",
      "URL personalizada",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Premium",
    price: "R$ 99",
    period: "pagamento único",
    description: "Tudo que você precisa para o casamento perfeito",
    features: [
      "Tudo do plano Grátis",
      "Presentes ilimitados",
      "Convites digitais",
      "Música de fundo",
      "Domínio personalizado",
      "Cronograma interativo",
      "Álbum colaborativo",
      "Sem marca d'água",
      "Suporte prioritário",
    ],
    cta: "Escolher Premium",
    popular: true,
  },
  {
    name: "Luxo",
    price: "R$ 249",
    period: "pagamento único",
    description: "Experiência exclusiva para casamentos inesquecíveis",
    features: [
      "Tudo do plano Premium",
      "Templates exclusivos",
      "Vídeo de fundo",
      "QR Code personalizado",
      "Consultoria de design",
      "Integração WhatsApp",
      "Relatórios avançados",
      "Backup permanente",
      "Suporte VIP 24/7",
    ],
    cta: "Escolher Luxo",
    popular: false,
  },
];

function PricingCard({
  plan,
  index,
  isVisible,
}: {
  plan: (typeof plans)[0];
  index: number;
  isVisible: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${
        plan.popular
          ? "bg-gradient-to-br from-primary via-gold-light to-primary p-[2px]"
          : ""
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary to-gold-light rounded-full text-white text-sm font-semibold flex items-center gap-1 shadow-lg">
          <Star className="w-4 h-4 fill-white" />
          Mais Popular
        </div>
      )}

      <div
        className={`h-full rounded-2xl p-8 ${
          plan.popular
            ? "bg-white"
            : "bg-white/70 backdrop-blur-sm border border-border/50"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl font-semibold mb-2">
            {plan.name}
          </h3>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="font-serif text-5xl font-bold">{plan.price}</span>
          </div>
          <p className="text-muted-foreground text-sm">{plan.period}</p>
          <p className="text-muted-foreground text-sm mt-4">
            {plan.description}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  plan.popular
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          className={`w-full py-6 rounded-full font-semibold ${
            plan.popular
              ? "bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white shadow-lg shadow-primary/20"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          {plan.cta}
        </Button>
      </div>
    </div>
  );
}

export default function PricingSection() {
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
      id="pricing"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-background to-cream relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-40 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-0 w-96 h-96 bg-rose/5 rounded-full blur-3xl" />

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
              Preços transparentes
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
            Escolha o plano
            <br />
            <span className="text-primary">perfeito para vocês</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Comece gratuitamente e faça upgrade quando quiser. Sem surpresas,
            sem taxas ocultas.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Trust Badge */}
        <div
          className={`text-center mt-12 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Pagamento 100% seguro · Garantia de 7 dias · Suporte em português
          </p>
        </div>
      </div>
    </section>
  );
}
