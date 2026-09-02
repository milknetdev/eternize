import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Gift, Heart, Check, Copy, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface GiftItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_reserved: boolean;
}

export default function DynamicGifts() {
  const { wedding, theme } = useWedding();
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPixModal, setShowPixModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if section should be shown
  const shouldShow = wedding.show_gifts !== 0;

  useEffect(() => {
    if (!wedding.custom_url) return;

    const fetchGifts = async () => {
      try {
        const res = await authFetch(`/api/public/wedding/${wedding.custom_url}/gifts`);
        if (res.ok) {
          const data = await res.json();
          setGifts(data.gifts || []);
        }
      } catch (err) {
        console.error("Error fetching gifts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, [wedding.custom_url]);

  // Don't render if section is hidden
  if (!shouldShow) {
    return null;
  }

  const copyPixKey = () => {
    if (wedding.pix_key) {
      navigator.clipboard.writeText(wedding.pix_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <section 
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.secondary, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p 
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Lista de Presentes
          </p>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Presenteie-nos
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Gift className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
          <p className="max-w-2xl mx-auto" style={{ color: `${theme.text}80` }}>
            Sua presença é o maior presente! Mas se quiser nos presentear, 
            preparamos uma lista especial com muito carinho.
          </p>
        </div>

        {/* PIX Option */}
        {wedding.pix_key && (
          <div 
            className="mb-12 p-8 rounded-2xl text-center"
            style={{ backgroundColor: theme.background }}
          >
            <h3 
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: theme.headingFont, color: theme.text }}
            >
              Presente via PIX
            </h3>
            <p className="mb-6" style={{ color: `${theme.text}80` }}>
              Prefere contribuir em dinheiro? Use nossa chave PIX!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setShowPixModal(true)}
                className="px-6 py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: theme.primary, color: "white" }}
              >
                <Heart className="w-5 h-5" />
                Contribuir via PIX
              </button>
            </div>
          </div>
        )}

        {/* Gift Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div 
              className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: theme.primary, borderTopColor: "transparent" }}
            />
          </div>
        ) : gifts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.slice(0, 6).map((gift) => (
              <motion.div
                key={gift.id}
                whileHover={{ y: -5 }}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: theme.background }}
              >
                {gift.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={gift.image_url}
                      alt={gift.name}
                      className="w-full h-full object-cover"
                    />
                    {gift.is_reserved && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: `${theme.text}60` }}
                      >
                        <div 
                          className="px-4 py-2 rounded-full flex items-center gap-2"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <Check className="w-5 h-5 text-white" />
                          <span className="text-white font-medium">Reservado</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h4 
                    className="text-xl font-semibold mb-2"
                    style={{ fontFamily: theme.headingFont, color: theme.text }}
                  >
                    {gift.name}
                  </h4>
                  {gift.description && (
                    <p className="text-sm mb-4" style={{ color: `${theme.text}60` }}>
                      {gift.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xl font-bold"
                      style={{ color: theme.primary }}
                    >
                      {formatCurrency(gift.price)}
                    </span>
                    {!gift.is_reserved && (
                      <button
                        className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        style={{ 
                          backgroundColor: `${theme.primary}20`,
                          color: theme.primary
                        }}
                      >
                        Presentear
                      </button>
                    )}
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
            <Gift className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.text}40` }} />
            <p style={{ color: `${theme.text}60` }}>
              Lista de presentes em breve!
            </p>
          </div>
        )}

        {/* Link to full gift list */}
        {gifts.length > 0 && (
          <div className="text-center mt-12">
            <a
              href={`/c/${wedding.custom_url}/presentes`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-all hover:scale-105"
              style={{ backgroundColor: theme.primary, color: "white" }}
            >
              Ver Lista Completa
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>

      {/* PIX Modal */}
      {showPixModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: `${theme.text}80` }}
          onClick={() => setShowPixModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-2xl"
            style={{ backgroundColor: theme.background }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-2xl font-semibold mb-6 text-center"
              style={{ fontFamily: theme.headingFont, color: theme.text }}
            >
              Presente via PIX
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: `${theme.text}80` }}
                >
                  Chave PIX
                </label>
                <div className="flex items-center gap-2">
                  <div 
                    className="flex-1 p-3 rounded-lg font-mono text-sm truncate"
                    style={{ backgroundColor: theme.secondary, color: theme.text }}
                  >
                    {wedding.pix_key}
                  </div>
                  <button
                    onClick={copyPixKey}
                    className="p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    {copied ? (
                      <Check className="w-5 h-5" style={{ color: theme.primary }} />
                    ) : (
                      <Copy className="w-5 h-5" style={{ color: `${theme.text}60` }} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPixModal(false)}
              className="w-full py-3 rounded-full font-medium"
              style={{ backgroundColor: theme.primary, color: "white" }}
            >
              Fechar
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
