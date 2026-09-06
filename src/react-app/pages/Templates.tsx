import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { templates, categories, layouts, WeddingTemplate } from "@/data/templates";
import { 
  Sparkles, 
  Check, 
  Eye, 
  Crown,
  ArrowRight,
  Filter,
  X,
  Palette
} from "lucide-react";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";

export default function Templates() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WeddingTemplate | null>(null);

  useEffect(() => {
    // Load fonts for preview
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=Great+Vibes&family=Amatic+SC:wght@400;700&family=Bodoni+Moda:wght@400;600;700&family=Cormorant:wght@400;600;700&family=Outfit:wght@400;500;600&family=Bebas+Neue&family=Oswald:wght@400;500;600&family=Archivo+Black&family=Orbitron:wght@400;500;600&family=Sacramento&family=Poppins:wght@400;500;600&family=Fredoka+One&family=Caveat:wght@400;500;600&family=Pacifico&family=Lobster&family=Poiret+One&family=Satisfy&family=Tangerine:wght@400;700&family=Abril+Fatface&family=Marcellus&family=Didot&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: WeddingTemplate) => {
    // In a full implementation, this would save to user's wedding
    navigate(`/dashboard?template=${template.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-champagne/30 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose/20 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Palette className="w-4 h-4" />
              {templates.length} Templates Disponíveis
            </span>
            
            <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6">
              Escolha o Template
              <span className="block text-primary">Perfeito</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada template foi cuidadosamente projetado para criar uma experiência 
              única e memorável. Escolha o estilo que mais combina com vocês.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 pb-8 sticky top-20 z-30 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {'icon' in cat && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  index={index}
                  isHovered={hoveredTemplate === template.id}
                  onHover={() => setHoveredTemplate(template.id)}
                  onLeave={() => setHoveredTemplate(null)}
                  onPreview={() => setPreviewTemplate(template)}
                  onSelect={() => handleSelectTemplate(template)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Nenhum template encontrado nesta categoria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onSelect={() => {
              handleSelectTemplate(previewTemplate);
              setPreviewTemplate(null);
            }}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

interface TemplateCardProps {
  template: WeddingTemplate;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onPreview: () => void;
  onSelect: () => void;
}

function TemplateCard({ 
  template, 
  index, 
  isHovered, 
  onHover, 
  onLeave,
  onPreview,
  onSelect 
}: TemplateCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group relative"
    >
      <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
        {/* Featured badge */}
        {template.isPremium && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-semibold shadow-lg">
            <Crown className="w-3.5 h-3.5" />
            Destaque
          </div>
        )}

        {/* Preview Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={template.previewImage}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <span className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-sm text-white text-[11px] font-medium">
            {layouts[template.layout].name}
          </span>
          
          {/* Color Palette Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex gap-2">
              {Object.entries(template.colors).slice(0, 4).map(([key, color]) => (
                <div
                  key={key}
                  className="w-6 h-6 rounded-full border-2 border-white/50 shadow-md"
                  style={{ backgroundColor: color }}
                  title={key}
                />
              ))}
            </div>
          </div>

          {/* Hover Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-4"
          >
            <button
              onClick={onPreview}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors shadow-lg"
            >
              <Eye className="w-4 h-4" />
              Visualizar
            </button>
            <button
              onClick={onSelect}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Check className="w-4 h-4" />
              Usar
            </button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                {template.name}
              </h3>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                {categories.find(c => c.id === template.category)?.icon}{' '}
                {categories.find(c => c.id === template.category)?.name || template.category}
              </span>
            </div>
          </div>
          
          {'coupleStyle' in template && (
            <p className="text-xs text-primary font-medium mb-2 italic">
              "{template.coupleStyle}"
            </p>
          )}
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {template.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {template.features.slice(0, 3).map((feature, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                {feature}
              </span>
            ))}
          </div>

          {/* Fonts Preview */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Fontes:</p>
            <div className="flex items-center gap-3 text-sm">
              <span style={{ fontFamily: template.fonts.heading }} className="font-semibold">
                {template.fonts.heading}
              </span>
              <span className="text-muted-foreground">+</span>
              <span style={{ fontFamily: template.fonts.body }}>
                {template.fonts.body}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface TemplatePreviewModalProps {
  template: WeddingTemplate;
  onClose: () => void;
  onSelect: () => void;
}

function TemplatePreviewModal({ template, onClose, onSelect }: TemplatePreviewModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[90vh] bg-card rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid lg:grid-cols-2 h-full">
          {/* Preview Image */}
          <div className="relative aspect-square lg:aspect-auto">
            <img
              src={template.previewImage}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            {template.isPremium && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-sm font-semibold shadow-lg">
                <Crown className="w-4 h-4" />
                Destaque
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 lg:p-10 overflow-y-auto max-h-[50vh] lg:max-h-full">
            <h2 
              className="text-3xl font-semibold text-foreground mb-2"
              style={{ fontFamily: template.fonts.heading }}
            >
              {template.name}
            </h2>
            
            <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-2">
              {categories.find(c => c.id === template.category)?.icon}{' '}
              {categories.find(c => c.id === template.category)?.name || template.category}
            </span>
            
            {'coupleStyle' in template && (
              <p className="text-sm text-primary font-medium italic mb-4">
                Para: {template.coupleStyle}
              </p>
            )}

            <p className="text-muted-foreground mb-6" style={{ fontFamily: template.fonts.body }}>
              {template.description}
            </p>

            {/* Color Palette */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Paleta de Cores</h3>
              <div className="flex gap-3">
                {Object.entries(template.colors).map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-12 h-12 rounded-xl border border-border shadow-sm mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-muted-foreground capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Tipografia</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs text-muted-foreground">Títulos:</span>
                  <span 
                    className="text-lg"
                    style={{ fontFamily: template.fonts.heading }}
                  >
                    {template.fonts.heading}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs text-muted-foreground">Corpo:</span>
                  <span style={{ fontFamily: template.fonts.body }}>
                    {template.fonts.body}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-3">Recursos Incluídos</h3>
              <div className="grid grid-cols-2 gap-2">
                {template.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onSelect}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Usar este Template
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to={`/demo/${template.id}`}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Demo
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
