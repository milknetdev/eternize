import { useEffect, useRef, useState } from "react";
import { Shirt, X, Check } from "lucide-react";

export default function DressCode() {
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

  const colors = [
    { color: "#1A1A1A", name: "Preto" },
    { color: "#1E3A5F", name: "Azul Marinho" },
    { color: "#2F4F4F", name: "Verde Escuro" },
    { color: "#4A3728", name: "Marrom" },
    { color: "#722F37", name: "Bordô" },
  ];

  const avoidColors = [
    { color: "#FFFFFF", name: "Branco", border: true },
    { color: "#FFF5F5", name: "Off-white", border: true },
    { color: "#FF0000", name: "Vermelho" },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-blush/30 to-cream relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Shirt className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Dress Code
          </h2>
          <p className="text-muted-foreground">Traje: Esporte Fino</p>
        </div>

        <div
          className={`grid md:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Homens */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/50">
            <h3 className="font-serif text-2xl font-semibold mb-6 text-center">
              Homens
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                Terno ou blazer com calça social
              </p>
              <p className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                Camisa social (com ou sem gravata)
              </p>
              <p className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                Sapato social
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-medium mb-3">Cores sugeridas:</p>
              <div className="flex gap-3 flex-wrap">
                {colors.map((c) => (
                  <div key={c.name} className="text-center">
                    <div
                      className="w-10 h-10 rounded-full shadow-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mulheres */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/50">
            <h3 className="font-serif text-2xl font-semibold mb-6 text-center">
              Mulheres
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                Vestido longo ou midi elegante
              </p>
              <p className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                Conjunto de saia ou calça social
              </p>
              <p className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                Salto ou sapatilha fina
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                Por favor, evite:
              </p>
              <div className="flex gap-3 flex-wrap">
                {avoidColors.map((c) => (
                  <div key={c.name} className="text-center">
                    <div
                      className={`w-10 h-10 rounded-full shadow-sm relative ${
                        c.border ? "border-2 border-border" : ""
                      }`}
                      style={{ backgroundColor: c.color }}
                    >
                      <X className="absolute inset-0 m-auto w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <p
          className={`text-center text-muted-foreground mt-8 text-sm transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          * O evento será em área externa e interna. Recomendamos calçados confortáveis.
        </p>
      </div>
    </section>
  );
}
