import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { ArrowRight, Play, Heart, Star } from "lucide-react";

const FACE_IMGS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces",
];

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-blush/30 to-champagne" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-rose/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/50 to-transparent rounded-full" />
      
      {/* Floating Hearts */}
      <div className="absolute top-32 right-20 animate-float opacity-20" style={{ animationDelay: "1s" }}>
        <Heart className="w-8 h-8 text-rose fill-rose" />
      </div>
      <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: "3s" }}>
        <Heart className="w-6 h-6 text-primary fill-primary" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-border/50 shadow-lg mb-8">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              +50.000 casais já realizaram seus sonhos
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
            Seu amor merece
            <br />
            <span className="bg-gradient-to-r from-primary via-gold-light to-primary bg-clip-text text-transparent">
              ser eternizado
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
            Crie o site do seu casamento, organize sua lista de presentes e
            gerencie cada detalhe do grande dia em uma única plataforma
            elegante e intuitiva.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/cadastro">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white shadow-2xl shadow-primary/30 font-semibold text-lg px-8 py-6 rounded-full group"
              >
                Criar Meu Site Grátis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-border/50 font-semibold text-lg px-8 py-6 rounded-full group hover:bg-white"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Ver Como Funciona
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {FACE_IMGS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white bg-muted"
                  />
                ))}
              </div>
              <span>+50k casais</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-primary fill-primary" />
              ))}
              <span className="ml-1">4.9/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose fill-rose" />
              <span>100% gratuito para começar</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div
          className={`mt-16 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          }`}
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Browser Mockup */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Browser Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    eternize.com/ana-e-joao
                  </div>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="relative aspect-[16/9] bg-gradient-to-br from-blush via-cream to-champagne overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=675&fit=crop"
                  alt="Casal em casamento"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white text-left">
                  <p className="text-sm uppercase tracking-widest mb-2 opacity-80">
                    Casamento
                  </p>
                  <h3 className="font-serif text-4xl font-medium">
                    Ana & João
                  </h3>
                  <p className="text-lg opacity-80 mt-1">15 de Março, 2025</p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -right-4 md:-right-12 top-1/4 glass rounded-xl p-4 shadow-xl animate-float hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Presença Confirmada</p>
                  <p className="text-xs text-muted-foreground">Maria Silva</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 md:-left-12 bottom-1/4 glass rounded-xl p-4 shadow-xl animate-float hidden sm:block" style={{ animationDelay: "1.5s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Presente Comprado</p>
                  <p className="text-xs text-muted-foreground">Jogo de Panelas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
