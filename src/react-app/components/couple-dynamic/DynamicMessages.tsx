import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { useWedding } from "@/react-app/contexts/WeddingContext";
import { MessageCircle, Heart, Send, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

export default function DynamicMessages() {
  const { wedding, theme, demo } = useWedding();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if section should be shown
  const shouldShow = wedding.show_messages !== 0;

  useEffect(() => {
    if (demo) { setMessages((demo.messages as Message[]) ?? []); setLoading(false); return; }
    if (!wedding.custom_url) return;

    const fetchMessages = async () => {
      try {
        const res = await authFetch(`/api/public/wedding/${wedding.custom_url}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [wedding.custom_url]);

  // Don't render if section is hidden
  if (!shouldShow) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wedding.custom_url || !formData.name || !formData.message) return;

    setSubmitting(true);

    try {
      const res = await authFetch(`/api/public/wedding/${wedding.custom_url}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: formData.name,
          content: formData.message,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", message: "" });
        setTimeout(() => {
          setShowForm(false);
          setSubmitted(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error submitting message:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section 
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.secondary, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p 
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Mural de Recados
          </p>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Mensagens
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <MessageCircle className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
          <p className="mb-8" style={{ color: `${theme.text}80` }}>
            Deixe uma mensagem carinhosa para os noivos!
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 rounded-full font-medium transition-all hover:scale-105 inline-flex items-center gap-2"
            style={{ backgroundColor: theme.primary, color: "white" }}
          >
            <Heart className="w-5 h-5" />
            Deixar Mensagem
          </button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              {submitted ? (
                <div 
                  className="p-8 rounded-2xl text-center"
                  style={{ backgroundColor: theme.background }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Heart className="w-8 h-8" style={{ color: theme.primary }} />
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ fontFamily: theme.headingFont, color: theme.text }}
                  >
                    Mensagem Enviada!
                  </h3>
                  <p style={{ color: `${theme.text}80` }}>
                    Sua mensagem será exibida após aprovação dos noivos.
                  </p>
                </div>
              ) : (
                <form 
                  onSubmit={handleSubmit}
                  className="p-8 rounded-2xl space-y-4"
                  style={{ backgroundColor: theme.background }}
                >
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Seu nome
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-lg outline-none"
                      style={{ 
                        backgroundColor: theme.secondary,
                        color: theme.text,
                        border: `2px solid ${theme.accent}`,
                      }}
                      placeholder="Como quer ser identificado?"
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Sua mensagem
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full p-3 rounded-lg outline-none resize-none"
                      style={{ 
                        backgroundColor: theme.secondary,
                        color: theme.text,
                        border: `2px solid ${theme.accent}`,
                      }}
                      placeholder="Deixe sua mensagem de carinho..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-full font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ backgroundColor: theme.primary, color: "white" }}
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Mensagem
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div 
              className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: theme.primary, borderTopColor: "transparent" }}
            />
          </div>
        ) : messages.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl relative"
                style={{ backgroundColor: theme.background }}
              >
                <Quote 
                  className="absolute top-4 right-4 w-8 h-8 opacity-10" 
                  style={{ color: theme.primary }}
                />
                <p className="mb-4 italic" style={{ color: theme.text }}>
                  "{msg.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {msg.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: theme.text }}>
                      {msg.author_name}
                    </p>
                    <p className="text-xs" style={{ color: `${theme.text}60` }}>
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div 
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: theme.background }}
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.text}40` }} />
            <p style={{ color: `${theme.text}60` }}>
              Seja o primeiro a deixar uma mensagem!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
