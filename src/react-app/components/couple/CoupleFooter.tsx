import { Heart, Instagram, ArrowUp } from "lucide-react";

export default function CoupleFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-white py-16 relative">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Names */}
        <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
          Ana & João
        </h2>
        <p className="text-white/60 mb-8">15 de Março de 2025 • São Paulo</p>

        {/* Hashtag */}
        <div className="mb-8">
          <p className="text-sm text-white/60 mb-2">
            Compartilhe suas fotos com a hashtag
          </p>
          <a
            href="https://instagram.com/explore/tags/AnaeJoao2025"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <Instagram className="w-5 h-5" />
            <span className="font-semibold">#AnaeJoao2025</span>
          </a>
        </div>

        {/* Divider */}
        <div className="w-24 h-px bg-white/20 mx-auto mb-8" />

        {/* Made with Love */}
        <p className="text-sm text-white/50 flex items-center justify-center gap-1 mb-4">
          Feito com <Heart className="w-4 h-4 text-rose fill-rose" /> no{" "}
          <a href="/" className="text-primary hover:underline">
            Eternize
          </a>
        </p>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
          Voltar ao topo
        </button>
      </div>
    </footer>
  );
}
