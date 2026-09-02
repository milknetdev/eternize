import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Mariana & Lucas",
    location: "São Paulo, SP",
    image:
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&h=100&fit=crop&crop=face",
    text: "O Eternize tornou a organização do nosso casamento muito mais fácil e elegante. Nossos convidados adoraram o site e a lista de presentes!",
    rating: 5,
  },
  {
    name: "Carolina & Pedro",
    location: "Rio de Janeiro, RJ",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    text: "Recebemos muitos elogios pelo nosso site. A plataforma é linda, intuitiva e nos ajudou a gerenciar tudo de forma simples.",
    rating: 5,
  },
  {
    name: "Fernanda & Bruno",
    location: "Belo Horizonte, MG",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    text: "A confirmação de presença online foi um sucesso! Conseguimos organizar tudo sem stress e o suporte é maravilhoso.",
    rating: 5,
  },
  {
    name: "Juliana & Rafael",
    location: "Curitiba, PR",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    text: "O melhor investimento que fizemos para o casamento. A lista de presentes com PIX facilitou muito para os convidados.",
    rating: 5,
  },
];

function TestimonialCard({
  testimonial,
  index,
  isVisible,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
  isVisible: boolean;
}) {
  return (
    <div
      className={`relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Quote Icon */}
      <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-primary fill-primary" />
        ))}
      </div>

      {/* Text */}
      <p className="text-foreground leading-relaxed mb-6">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
        />
        <div>
          <h4 className="font-semibold">{testimonial.name}</h4>
          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
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
      id="testimonials"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-cream to-background relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-rose/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
            Histórias de amor
            <br />
            <span className="text-primary">que inspiram</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Veja o que casais como vocês dizem sobre o Eternize
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
