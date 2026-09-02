import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Heart, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function DynamicConfirmCTA() {
  const { wedding, theme } = useWedding();

  // Don't show if RSVP is disabled
  if (wedding.show_rsvp === 0) return null;

  return (
    <section
      className="py-16 md:py-24 px-4"
      style={{ backgroundColor: theme.background, fontFamily: theme.bodyFont }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${theme.primary}15` }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: theme.primary }} />
        </div>

        {/* Title */}
        <h2
          className="text-3xl md:text-4xl mb-4"
          style={{ fontFamily: theme.headingFont, color: theme.text }}
        >
          Já confirmou sua presença?
        </h2>

        {/* Subtitle */}
        <p className="text-lg mb-8" style={{ color: `${theme.text}80` }}>
          Digite os 4 últimos dígitos do seu telefone para encontrar seu convite e confirmar!
        </p>

        {/* CTA Button */}
        <a
          href={`/c/${wedding.custom_url}/confirmar`}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all hover:scale-105 shadow-lg"
          style={{
            backgroundColor: theme.primary,
            color: "white",
          }}
        >
          <CheckCircle className="w-6 h-6" />
          Confirmar Presença
          <ArrowRight className="w-5 h-5" />
        </a>

        {/* Decorative */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <div className="h-px w-12" style={{ backgroundColor: `${theme.primary}40` }} />
          <Heart className="w-4 h-4" style={{ color: theme.primary }} />
          <div className="h-px w-12" style={{ backgroundColor: `${theme.primary}40` }} />
        </div>
      </motion.div>
    </section>
  );
}
