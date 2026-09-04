import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Crown, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface Godparent {
  id: number;
  name: string;
  role: string;
  image_url: string | null;
  description: string | null;
}

export default function DynamicGodparents() {
  const { wedding, theme, demo } = useWedding();
  const [godparents, setGodparents] = useState<Godparent[]>([]);
  const [loading, setLoading] = useState(true);

  const shouldShow = wedding.show_godparents !== 0;

  useEffect(() => {
    if (demo) { setGodparents((demo.godparents as Godparent[]) ?? []); setLoading(false); return; }
    if (!wedding.custom_url) return;

    const fetchGodparents = async () => {
      try {
        const res = await authFetch(`/api/public/wedding/${wedding.custom_url}/godparents`);
        if (res.ok) {
          const data = await res.json();
          setGodparents(data.godparents || []);
        }
      } catch (err) {
        console.error("Error fetching godparents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGodparents();
  }, [wedding.custom_url]);

  if (!shouldShow) {
    return null;
  }

  return (
    <section
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.background, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Nossa Família Especial
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Padrinhos
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Crown className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
          <p className="max-w-2xl mx-auto" style={{ color: `${theme.text}80` }}>
            As pessoas especiais que escolhemos para caminhar ao nosso lado neste dia tão importante.
          </p>
        </div>

        {/* Godparents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: theme.primary, borderTopColor: "transparent" }}
            />
          </div>
        ) : godparents.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {godparents.map((godparent, index) => (
              <motion.div
                key={godparent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center p-8 rounded-2xl"
                style={{ backgroundColor: theme.secondary }}
              >
                {/* Photo */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  {godparent.image_url ? (
                    <img
                      src={godparent.image_url}
                      alt={godparent.name}
                      className="w-full h-full object-cover rounded-full"
                      style={{ border: `3px solid ${theme.primary}` }}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${theme.primary}20` }}
                    >
                      <Heart className="w-12 h-12" style={{ color: theme.primary }} />
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: theme.headingFont, color: theme.text }}
                >
                  {godparent.name}
                </h3>

                {/* Role Badge */}
                <span
                  className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                  style={{
                    backgroundColor: `${theme.primary}20`,
                    color: theme.primary,
                  }}
                >
                  {godparent.role === "padrinho" ? "Padrinho" : godparent.role === "madrinha" ? "Madrinha" : godparent.role}
                </span>

                {/* Description */}
                {godparent.description && (
                  <p className="text-sm" style={{ color: `${theme.text}60` }}>
                    {godparent.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: theme.secondary }}
          >
            <Crown className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.text}40` }} />
            <p style={{ color: `${theme.text}60` }}>
              Em breve revelaremos nossos padrinhos!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
