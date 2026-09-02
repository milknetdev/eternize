import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";

const timeline = [
  {
    year: "2018",
    title: "Onde Tudo Começou",
    description:
      "Nos conhecemos em uma festa de amigos em comum. Foi amor à primeira vista para João, que passou a noite inteira tentando impressionar Ana.",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop",
  },
  {
    year: "2019",
    title: "O Primeiro Encontro",
    description:
      "Depois de semanas de conversas, finalmente tivemos nosso primeiro encontro em um café charmoso em Pinheiros. Conversamos por horas!",
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop",
  },
  {
    year: "2021",
    title: "Morar Juntos",
    description:
      "Decidimos dar o próximo passo e morar juntos. Foram muitas risadas montando móveis e descobrindo nossos hábitos um do outro.",
    image:
      "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&h=300&fit=crop",
  },
  {
    year: "2024",
    title: "O Pedido",
    description:
      "Em uma viagem surpresa para Paris, João pediu Ana em casamento sob a Torre Eiffel. Ela disse sim antes mesmo dele terminar a pergunta!",
    image:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=300&fit=crop",
  },
];

export default function OurStory() {
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
      className="py-24 bg-cream relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-rose/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Heart className="w-8 h-8 text-rose fill-rose mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Nossa História
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Uma história de amor que começou com um olhar e vai durar para sempre
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden md:block" />

          {timeline.map((item, index) => (
            <div
              key={item.year}
              className={`relative mb-16 last:mb-0 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div className="w-full md:w-1/2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-rose/20 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform" />
                    <img
                      src={item.image}
                      alt={item.title}
                      className="relative w-full aspect-[4/3] object-cover rounded-2xl shadow-xl"
                    />
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`w-full md:w-1/2 text-center md:text-left ${
                    index % 2 === 1 ? "md:text-right" : ""
                  }`}
                >
                  <span className="inline-block px-4 py-1 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
                    {item.year}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Timeline Dot */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-4 border-cream hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
