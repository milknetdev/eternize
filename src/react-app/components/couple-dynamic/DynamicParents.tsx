import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

interface Parent {
  id: number;
  name: string;
  role: string;
  photo_url: string | null;
}

export default function DynamicParents() {
  const { wedding, theme } = useWedding();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  const shouldShow = wedding.show_parents !== 0;

  useEffect(() => {
    if (!wedding.custom_url) return;

    const fetchParents = async () => {
      try {
        const res = await authFetch(`/api/public/wedding/${wedding.custom_url}/parents`);
        if (res.ok) {
          const data = await res.json();
          setParents(data.parents || []);
        }
      } catch (err) {
        console.error("Error fetching parents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
  }, [wedding.custom_url]);

  if (!shouldShow) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      "pai_noivo": "Pai do Noivo",
      "mae_noivo": "Mãe do Noivo",
      "pai_noiva": "Pai da Noiva",
      "mae_noiva": "Mãe da Noiva",
    };
    return labels[role] || role;
  };

  return (
    <section
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.secondary, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Quem nos trouxe até aqui
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Nossos Pais
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Users className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
          <p className="max-w-2xl mx-auto" style={{ color: `${theme.text}80` }}>
            As pessoas que nos deram a vida e nos ensinaram o significado do amor.
          </p>
        </div>

        {/* Parents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: theme.primary, borderTopColor: "transparent" }}
            />
          </div>
        ) : parents.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-8">
            {parents.map((parent, index) => (
              <motion.div
                key={parent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center p-8 rounded-2xl"
                style={{ backgroundColor: theme.background }}
              >
                {/* Photo */}
                <div className="relative w-36 h-36 mx-auto mb-6">
                  {parent.photo_url ? (
                    <img
                      src={parent.photo_url}
                      alt={parent.name}
                      className="w-full h-full object-cover rounded-full"
                      style={{ border: `3px solid ${theme.primary}` }}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${theme.primary}20` }}
                    >
                      <Heart className="w-14 h-14" style={{ color: theme.primary }} />
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3
                  className="text-2xl font-semibold mb-2"
                  style={{ fontFamily: theme.headingFont, color: theme.text }}
                >
                  {parent.name}
                </h3>

                {/* Role Badge */}
                <span
                  className="inline-block px-4 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${theme.primary}20`,
                    color: theme.primary,
                  }}
                >
                  {getRoleLabel(parent.role)}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: theme.background }}
          >
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.text}40` }} />
            <p style={{ color: `${theme.text}60` }}>
              Em breve apresentaremos nossos pais!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
