import { useEffect, useRef, useState } from "react";
import { Gift, ExternalLink, Heart, CreditCard } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

const gifts = [
  {
    name: "Jogo de Panelas Premium",
    price: "R$ 899",
    image:
      "https://images.unsplash.com/photo-1584990347449-a2d4c2c044c9?w=300&h=300&fit=crop",
  },
  {
    name: "Aparelho de Jantar 42 peças",
    price: "R$ 650",
    image:
      "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=300&h=300&fit=crop",
  },
  {
    name: "Smart TV 55\"",
    price: "R$ 2.500",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop",
  },
  {
    name: "Robô Aspirador",
    price: "R$ 1.200",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
  },
];

export default function GiftRegistry() {
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
    <section ref={sectionRef} className="py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Gift className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Lista de Presentes
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Sua presença é o nosso maior presente! Mas se desejar nos presentear,
            aqui estão algumas sugestões
          </p>
        </div>

        {/* PIX Option */}
        <div
          className={`max-w-2xl mx-auto mb-16 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gradient-to-r from-primary/10 via-gold-light/10 to-primary/10 rounded-2xl p-8 text-center border border-primary/20">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-3">
              Presente em Dinheiro via PIX
            </h3>
            <p className="text-muted-foreground mb-6">
              Prefere nos ajudar com a lua de mel ou a montar nosso lar?
              Você pode fazer um PIX de qualquer valor!
            </p>
            <Button className="bg-gradient-to-r from-primary to-gold-light text-white rounded-full">
              <Heart className="w-4 h-4 mr-2" />
              Enviar PIX
            </Button>
          </div>
        </div>

        {/* Gift Grid */}
        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h3 className="font-serif text-2xl font-semibold text-center mb-8">
            Algumas Sugestões
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gifts.map((gift, index) => (
              <div
                key={gift.name}
                className="group bg-cream rounded-xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">
                    {gift.name}
                  </h4>
                  <p className="text-primary font-semibold">{gift.price}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 rounded-full"
                  >
                    Presentear
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All */}
        <div
          className={`text-center mt-12 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Button variant="outline" className="rounded-full">
            Ver Lista Completa
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
