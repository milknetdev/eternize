import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Hotel, MapPin, Phone, Globe, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface Accommodation {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  price_range: string | null;
}

export default function DynamicAccommodations() {
  const { wedding, theme } = useWedding();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  const shouldShow = wedding.show_accommodations !== 0;

  useEffect(() => {
    if (!wedding.custom_url) return;

    const fetchAccommodations = async () => {
      try {
        const res = await authFetch(`/api/public/wedding/${wedding.custom_url}/accommodations`);
        if (res.ok) {
          const data = await res.json();
          setAccommodations(data.accommodations || []);
        }
      } catch (err) {
        console.error("Error fetching accommodations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, [wedding.custom_url]);

  if (!shouldShow) {
    return null;
  }

  const getPriceRangeLabel = (range: string | null) => {
    if (!range) return null;
    const labels: Record<string, string> = {
      "economico": "$ Econômico",
      "moderado": "$$ Moderado",
      "premium": "$$$ Premium",
      "luxo": "$$$$ Luxo",
    };
    return labels[range] || range;
  };

  return (
    <section
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.background, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Fique por perto
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Onde se Hospedar
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Hotel className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
          <p className="max-w-2xl mx-auto" style={{ color: `${theme.text}80` }}>
            Separamos algumas opções de hospedagem para você e sua família aproveitarem ao máximo a celebração.
          </p>
        </div>

        {/* Accommodations Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: theme.primary, borderTopColor: "transparent" }}
            />
          </div>
        ) : accommodations.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {accommodations.map((accommodation, index) => (
              <motion.div
                key={accommodation.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: theme.secondary }}
              >
                {/* Image */}
                {accommodation.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={accommodation.image_url}
                      alt={accommodation.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Price Range Badge */}
                    {accommodation.price_range && (
                      <div
                        className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: theme.primary,
                          color: "white",
                        }}
                      >
                        {getPriceRangeLabel(accommodation.price_range)}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Name */}
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ fontFamily: theme.headingFont, color: theme.text }}
                  >
                    {accommodation.name}
                  </h3>

                  {/* Description */}
                  {accommodation.description && (
                    <p className="text-sm mb-4" style={{ color: `${theme.text}80` }}>
                      {accommodation.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-3">
                    {accommodation.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.primary }} />
                        <span className="text-sm" style={{ color: `${theme.text}60` }}>
                          {accommodation.address}
                        </span>
                      </div>
                    )}

                    {accommodation.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
                        <span className="text-sm" style={{ color: `${theme.text}60` }}>
                          {accommodation.phone}
                        </span>
                      </div>
                    )}

                    {accommodation.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
                        <a
                          href={accommodation.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline transition-colors"
                          style={{ color: theme.primary }}
                        >
                          Visitar site
                        </a>
                      </div>
                    )}

                    {/* Price range if no image */}
                    {!accommodation.image_url && accommodation.price_range && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
                        <span
                          className="text-sm font-medium"
                          style={{ color: theme.primary }}
                        >
                          {getPriceRangeLabel(accommodation.price_range)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: theme.secondary }}
          >
            <Hotel className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.text}40` }} />
            <p style={{ color: `${theme.text}60` }}>
              Em breve teremos sugestões de hospedagem!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
