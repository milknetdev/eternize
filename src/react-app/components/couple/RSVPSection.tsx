import { useEffect, useRef, useState } from "react";
import { Mail, Check, Users, Utensils } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";

export default function RSVPSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    attendance: "",
    guests: "1",
    dietary: "",
    message: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section
        ref={sectionRef}
        className="py-24 bg-gradient-to-b from-cream to-blush/30"
      >
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-serif text-3xl font-semibold mb-4">
            Confirmação Recebida!
          </h2>
          <p className="text-muted-foreground">
            Obrigado por confirmar sua presença, {formData.name}! Estamos muito
            felizes em saber que você estará conosco nesse dia especial.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-cream to-blush/30 relative"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Confirme sua Presença
          </h2>
          <p className="text-muted-foreground">
            Por favor, confirme até 1º de Março de 2025
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`bg-white rounded-2xl p-8 shadow-lg border border-border/50 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Nome Completo *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Digite seu nome"
              className="rounded-lg"
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Email *</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="seu@email.com"
              className="rounded-lg"
            />
          </div>

          {/* Attendance */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Você poderá comparecer? *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, attendance: "yes" })
                }
                className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                  formData.attendance === "yes"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Check className="w-5 h-5 mx-auto mb-1" />
                <span className="block font-medium">Sim, estarei lá!</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, attendance: "no" })
                }
                className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                  formData.attendance === "no"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="block text-2xl mb-1">😢</span>
                <span className="block font-medium">Não poderei ir</span>
              </button>
            </div>
          </div>

          {formData.attendance === "yes" && (
            <>
              {/* Number of Guests */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Número de convidados (incluindo você)
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) =>
                    setFormData({ ...formData, guests: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                >
                  <option value="1">1 pessoa</option>
                  <option value="2">2 pessoas</option>
                  <option value="3">3 pessoas</option>
                  <option value="4">4 pessoas</option>
                </select>
              </div>

              {/* Dietary */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Restrições alimentares
                </label>
                <Input
                  value={formData.dietary}
                  onChange={(e) =>
                    setFormData({ ...formData, dietary: e.target.value })
                  }
                  placeholder="Ex: vegetariano, intolerância a lactose..."
                  className="rounded-lg"
                />
              </div>
            </>
          )}

          {/* Message */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              Deixe uma mensagem para os noivos (opcional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Escreva uma mensagem carinhosa..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!formData.attendance}
            className="w-full bg-gradient-to-r from-primary to-gold-light text-white rounded-full py-6 font-semibold text-lg"
          >
            Confirmar Presença
          </Button>
        </form>
      </div>
    </section>
  );
}
