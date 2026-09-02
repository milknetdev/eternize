import { useEffect, useRef, useState } from "react";
import { MessageCircle, Heart, Quote } from "lucide-react";

const messages = [
  {
    name: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    message:
      "Que o amor de vocês seja eterno e repleto de momentos felizes! Mal posso esperar para celebrar esse dia especial com vocês. 💕",
    date: "Há 2 dias",
  },
  {
    name: "Carlos Santos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    message:
      "Parabéns pelo noivado! Que essa nova etapa seja apenas o começo de uma vida inteira de amor e cumplicidade. Vocês formam um casal lindo!",
    date: "Há 3 dias",
  },
  {
    name: "Fernanda Costa",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    message:
      "Conheci vocês separados e ver esse amor nascer foi maravilhoso! Tenho certeza que serão muito felizes juntos. Amo vocês! ❤️",
    date: "Há 5 dias",
  },
  {
    name: "Roberto Oliveira",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    message:
      "Que Deus abençoe essa união! Muito feliz por vocês. O casamento será inesquecível, tenho certeza!",
    date: "Há 1 semana",
  },
];

export default function GuestMessages() {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <MessageCircle className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Recados dos Convidados
          </h2>
          <p className="text-muted-foreground">
            Mensagens de carinho dos nossos amigos e familiares
          </p>
        </div>

        {/* Messages Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`relative bg-cream rounded-2xl p-6 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

              <div className="flex items-start gap-4">
                <img
                  src={msg.avatar}
                  alt={msg.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{msg.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {msg.date}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {msg.message}
                  </p>
                  <button className="mt-3 flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>Curtir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
