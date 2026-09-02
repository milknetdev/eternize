import { useEffect, useRef, useState } from "react";
import { Button } from "@/react-app/components/ui/button";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

export default function CTASection() {
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
      className="py-24 bg-cream relative overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=600&fit=crop"
          alt="Casamento"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/95 to-cream" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 animate-float opacity-30">
        <Heart className="w-12 h-12 text-rose fill-rose" />
      </div>
      <div
        className="absolute bottom-10 right-10 animate-float opacity-30"
        style={{ animationDelay: "1s" }}
      >
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <div
        className="absolute top-1/2 right-1/4 animate-float opacity-20"
        style={{ animationDelay: "2s" }}
      >
        <Heart className="w-8 h-8 text-primary fill-primary" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-serif text-4xl md:text-6xl font-medium mb-6 leading-tight">
            Pronto para eternizar
            <br />
            <span className="bg-gradient-to-r from-primary via-gold-light to-primary bg-clip-text text-transparent">
              o seu grande dia?
            </span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Junte-se a mais de 50.000 casais que já criaram sites incríveis e
            organizaram casamentos inesquecíveis com o Eternize.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white shadow-2xl shadow-primary/30 font-semibold text-lg px-10 py-7 rounded-full group"
            >
              Criar Meu Site Grátis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            ✓ 100% gratuito para começar · ✓ Sem cartão de crédito · ✓ Pronto em 5 minutos
          </p>
        </div>
      </div>
    </section>
  );
}
