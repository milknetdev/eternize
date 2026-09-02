import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Heart, ArrowUp } from "lucide-react";

export default function DynamicFooter() {
  const { wedding, theme } = useWedding();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const weddingDate = wedding.wedding_date ? new Date(wedding.wedding_date) : null;

  return (
    <footer 
      className="py-16 px-4 relative"
      style={{ backgroundColor: theme.text, fontFamily: theme.bodyFont }}
    >
      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ backgroundColor: theme.primary }}
      >
        <ArrowUp className="w-5 h-5 text-white" />
      </button>

      <div className="max-w-4xl mx-auto text-center">
        {/* Names */}
        <h2 
          className="text-4xl md:text-5xl mb-4"
          style={{ fontFamily: theme.headingFont, color: theme.background }}
        >
          {wedding.partner1_name}
          <span className="mx-3">
            <Heart 
              className="w-6 h-6 md:w-8 md:h-8 inline" 
              style={{ color: theme.primary, fill: theme.primary }}
            />
          </span>
          {wedding.partner2_name}
        </h2>

        {/* Date */}
        {weddingDate && (
          <p 
            className="text-lg mb-8"
            style={{ color: `${theme.background}80` }}
          >
            {weddingDate.toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-24" style={{ backgroundColor: `${theme.background}30` }} />
          <Heart className="w-4 h-4" style={{ color: theme.primary }} />
          <div className="h-px w-24" style={{ backgroundColor: `${theme.background}30` }} />
        </div>

        {/* Social / Hashtag */}
        <div className="mb-8">
          <p className="text-sm mb-2" style={{ color: `${theme.background}60` }}>
            Compartilhe suas fotos usando
          </p>
          <p 
            className="text-xl font-medium"
            style={{ color: theme.primary }}
          >
            #{wedding.partner1_name.replace(/\s/g, "")}e{wedding.partner2_name.replace(/\s/g, "")}
          </p>
        </div>

        {/* Credits */}
        <div 
          className="text-sm"
          style={{ color: `${theme.background}40` }}
        >
          <p className="mb-2">
            Feito com{" "}
            <Heart className="w-3 h-3 inline text-rose fill-rose" />{" "}
            usando{" "}
            <a 
              href="/" 
              className="underline hover:opacity-80 transition-opacity"
              style={{ color: theme.primary }}
            >
              Eternize
            </a>
          </p>
          <p>© {new Date().getFullYear()} Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}
