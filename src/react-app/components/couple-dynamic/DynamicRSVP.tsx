import { authFetch } from "@/react-app/lib/api";
import { useState } from "react";
import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Send, Heart, Check, AlertCircle } from "lucide-react";

export default function DynamicRSVP() {
  const { wedding, theme } = useWedding();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "1",
    dietary: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Check if section should be shown
  if (wedding.show_rsvp === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wedding.custom_url) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await authFetch(`/api/public/wedding/${wedding.custom_url}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          plus_ones: parseInt(formData.guests) - 1,
          dietary_restrictions: formData.dietary || null,
          notes: formData.message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao confirmar presença");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", guests: "1", dietary: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Erro ao confirmar presença");
    }
  };

  return (
    <section 
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.background, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p 
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Confirmação
          </p>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Confirme sua Presença
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Heart className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
          <p style={{ color: `${theme.text}80` }}>
            Ficaremos muito felizes com sua presença! Por favor, confirme até uma semana antes do evento.
          </p>
        </div>

        {status === "success" ? (
          <div 
            className="p-8 rounded-2xl text-center"
            style={{ backgroundColor: theme.secondary }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <Check className="w-8 h-8" style={{ color: theme.primary }} />
            </div>
            <h3 
              className="text-2xl font-semibold mb-2"
              style={{ fontFamily: theme.headingFont, color: theme.text }}
            >
              Presença Confirmada!
            </h3>
            <p style={{ color: `${theme.text}80` }}>
              Obrigado por confirmar! Mal podemos esperar para celebrar com você.
            </p>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit}
            className="p-8 rounded-2xl space-y-6"
            style={{ backgroundColor: theme.secondary }}
          >
            {status === "error" && (
              <div 
                className="p-4 rounded-lg flex items-center gap-3"
                style={{ backgroundColor: "#FEE2E2" }}
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errorMsg}</p>
              </div>
            )}

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Nome completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 rounded-lg outline-none transition-all"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `2px solid ${theme.accent}`,
                }}
                placeholder="Seu nome"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.text }}
                >
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 rounded-lg outline-none transition-all"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    border: `2px solid ${theme.accent}`,
                  }}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.text }}
                >
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 rounded-lg outline-none transition-all"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text,
                    border: `2px solid ${theme.accent}`,
                  }}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Número de pessoas (incluindo você)
              </label>
              <select
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full p-3 rounded-lg outline-none transition-all"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `2px solid ${theme.accent}`,
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "pessoa" : "pessoas"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Restrições alimentares
              </label>
              <input
                type="text"
                value={formData.dietary}
                onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                className="w-full p-3 rounded-lg outline-none transition-all"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `2px solid ${theme.accent}`,
                }}
                placeholder="Vegetariano, vegano, alergias..."
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Mensagem para os noivos
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-lg outline-none transition-all resize-none"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `2px solid ${theme.accent}`,
                }}
                placeholder="Deixe uma mensagem carinhosa..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-full font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ backgroundColor: theme.primary, color: "white" }}
            >
              {status === "loading" ? (
                <div 
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Confirmar Presença
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
