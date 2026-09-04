import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/local-auth/react";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowLeft,
  Palette,
  Type,
  Check,
  Loader2,
  RefreshCw,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { templates, layouts } from "@/data/templates";

interface ThemeSettings {
  template_id: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  theme_accent_color: string;
  theme_background_color: string;
  theme_text_color: string;
  theme_heading_font: string;
  theme_body_font: string;
}

interface Wedding {
  id: number;
  partner1_name: string;
  partner2_name: string;
  template_id: string | null;
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  theme_accent_color: string | null;
  theme_background_color: string | null;
  theme_text_color: string | null;
  theme_heading_font: string | null;
  theme_body_font: string | null;
}

const fontOptions = [
  { value: "Cormorant Garamond", label: "Cormorant Garamond", category: "serif" },
  { value: "Playfair Display", label: "Playfair Display", category: "serif" },
  { value: "Libre Baskerville", label: "Libre Baskerville", category: "serif" },
  { value: "Crimson Text", label: "Crimson Text", category: "serif" },
  { value: "Lora", label: "Lora", category: "serif" },
  { value: "EB Garamond", label: "EB Garamond", category: "serif" },
  { value: "Montserrat", label: "Montserrat", category: "sans" },
  { value: "Raleway", label: "Raleway", category: "sans" },
  { value: "Open Sans", label: "Open Sans", category: "sans" },
  { value: "Poppins", label: "Poppins", category: "sans" },
  { value: "Quicksand", label: "Quicksand", category: "sans" },
  { value: "Dancing Script", label: "Dancing Script", category: "script" },
  { value: "Great Vibes", label: "Great Vibes", category: "script" },
  { value: "Parisienne", label: "Parisienne", category: "script" },
];

const defaultTheme: ThemeSettings = {
  template_id: "eternal",
  theme_primary_color: "#C9A962",
  theme_secondary_color: "#F5F0E8",
  theme_accent_color: "#E8D5B7",
  theme_background_color: "#FFFBF5",
  theme_text_color: "#1A1A1A",
  theme_heading_font: "Cormorant Garamond",
  theme_body_font: "Montserrat",
};

export default function ThemeEditor() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [activeSection, setActiveSection] = useState<"template" | "colors" | "fonts">("template");

  useEffect(() => {
    const fonts = [...new Set([...fontOptions.map(f => f.value)])];
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/entrar");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    async function fetchWedding() {
      try {
        const res = await authFetch("/api/wedding");
        if (res.ok) {
          const data = await res.json();
          setWedding(data);
          if (data) {
            setTheme({
              template_id: data.template_id || defaultTheme.template_id,
              theme_primary_color: data.theme_primary_color || defaultTheme.theme_primary_color,
              theme_secondary_color: data.theme_secondary_color || defaultTheme.theme_secondary_color,
              theme_accent_color: data.theme_accent_color || defaultTheme.theme_accent_color,
              theme_background_color: data.theme_background_color || defaultTheme.theme_background_color,
              theme_text_color: data.theme_text_color || defaultTheme.theme_text_color,
              theme_heading_font: data.theme_heading_font || defaultTheme.theme_heading_font,
              theme_body_font: data.theme_body_font || defaultTheme.theme_body_font,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch wedding:", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchWedding();
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authFetch("/api/wedding/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
    } catch (error) {
      console.error("Failed to save theme:", error);
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTheme({
        template_id: templateId,
        theme_primary_color: template.colors.primary,
        theme_secondary_color: template.colors.secondary,
        theme_accent_color: template.colors.accent,
        theme_background_color: template.colors.background,
        theme_text_color: template.colors.text,
        theme_heading_font: template.fonts.heading,
        theme_body_font: template.fonts.body,
      });
    }
  };

  const resetToTemplate = () => {
    const template = templates.find(t => t.id === theme.template_id);
    if (template) {
      applyTemplate(template.id);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <span className="font-serif text-xl font-semibold">Editor de Tema</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={resetToTemplate}
                className="hidden sm:flex gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Resetar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Section Tabs */}
            <div className="bg-white rounded-xl border p-1 flex gap-1">
              {[
                { id: "template", label: "Template", icon: Sparkles },
                { id: "colors", label: "Cores", icon: Palette },
                { id: "fonts", label: "Fontes", icon: Type },
              ].map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as typeof activeSection)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>

            {/* Template Selection */}
            {activeSection === "template" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border p-6"
              >
                <h3 className="font-serif text-lg font-semibold mb-1">Escolha um Template Base</h3>
                {(() => {
                  const lid = templates.find((t) => t.id === theme.template_id)?.layout ?? "classico";
                  return (
                    <p className="text-xs text-muted-foreground mb-4">
                      Layout: <span className="font-medium text-foreground">{layouts[lid].name}</span> — {layouts[lid].description}
                    </p>
                  );
                })()}
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template.id)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        theme.template_id === template.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-primary/30"
                      }`}
                    >
                      <div
                        className="w-full aspect-[4/3] rounded-t-lg"
                        style={{
                          background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%)`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                        <p className="text-white text-sm font-medium">{template.name}</p>
                        <p className="text-white/70 text-[10px] uppercase tracking-wide">{layouts[template.layout].name}</p>
                      </div>
                      {theme.template_id === template.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {template.isPremium && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full text-white text-xs font-medium">
                          Premium
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Color Controls */}
            {activeSection === "colors" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border p-6 space-y-5"
              >
                <h3 className="font-serif text-lg font-semibold">Paleta de Cores</h3>
                
                <ColorPicker
                  label="Cor Principal"
                  description="Botões, links e destaques"
                  value={theme.theme_primary_color}
                  onChange={(color) => setTheme({ ...theme, theme_primary_color: color })}
                />
                
                <ColorPicker
                  label="Cor Secundária"
                  description="Fundos de seções e cards"
                  value={theme.theme_secondary_color}
                  onChange={(color) => setTheme({ ...theme, theme_secondary_color: color })}
                />
                
                <ColorPicker
                  label="Cor de Destaque"
                  description="Detalhes e decorações"
                  value={theme.theme_accent_color}
                  onChange={(color) => setTheme({ ...theme, theme_accent_color: color })}
                />
                
                <ColorPicker
                  label="Cor de Fundo"
                  description="Fundo geral do site"
                  value={theme.theme_background_color}
                  onChange={(color) => setTheme({ ...theme, theme_background_color: color })}
                />
                
                <ColorPicker
                  label="Cor do Texto"
                  description="Textos e títulos"
                  value={theme.theme_text_color}
                  onChange={(color) => setTheme({ ...theme, theme_text_color: color })}
                />
              </motion.div>
            )}

            {/* Font Controls */}
            {activeSection === "fonts" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border p-6 space-y-6"
              >
                <h3 className="font-serif text-lg font-semibold">Tipografia</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Fonte dos Títulos</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {fontOptions.filter(f => f.category === "serif" || f.category === "script").map((font) => (
                      <button
                        key={font.value}
                        onClick={() => setTheme({ ...theme, theme_heading_font: font.value })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          theme.theme_heading_font === font.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        <span className="text-lg">{font.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Fonte do Corpo</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {fontOptions.filter(f => f.category === "sans").map((font) => (
                      <button
                        key={font.value}
                        onClick={() => setTheme({ ...theme, theme_body_font: font.value })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          theme.theme_body_font === font.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        <span className="text-sm">{font.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="bg-white rounded-xl border overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
              
              <div 
                className="flex-1 overflow-auto"
                style={{ backgroundColor: theme.theme_background_color }}
              >
                <PreviewContent theme={theme} wedding={wedding} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border appearance-none"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 px-2 py-1 text-sm font-mono rounded border border-border uppercase"
      />
    </div>
  );
}

function PreviewContent({ theme, wedding }: { theme: ThemeSettings; wedding: Wedding | null }) {
  const names = wedding
    ? `${wedding.partner1_name || "Ana"} & ${wedding.partner2_name || "João"}`
    : "Ana & João";

  return (
    <div className="min-h-full" style={{ fontFamily: theme.theme_body_font }}>
      {/* Hero Preview */}
      <div 
        className="relative h-64 flex items-center justify-center"
        style={{ backgroundColor: theme.theme_secondary_color }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(${theme.theme_primary_color} 1px, transparent 1px)`,
          backgroundSize: "20px 20px"
        }} />
        <div className="text-center relative z-10">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: theme.theme_primary_color }}
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1
            className="text-4xl font-medium mb-2"
            style={{ 
              fontFamily: theme.theme_heading_font,
              color: theme.theme_text_color
            }}
          >
            {names}
          </h1>
          <p style={{ color: theme.theme_primary_color }}>15 de Março de 2025</p>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2
            className="text-2xl mb-3"
            style={{ 
              fontFamily: theme.theme_heading_font,
              color: theme.theme_text_color
            }}
          >
            Nossa História
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: `${theme.theme_text_color}99` }}>
            Uma história de amor que começou há muitos anos e agora 
            estamos prontos para celebrar este momento especial juntos.
          </p>
        </div>

        {/* Cards Preview */}
        <div className="grid grid-cols-2 gap-3">
          {["Cerimônia", "Recepção"].map((item) => (
            <div
              key={item}
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.theme_secondary_color }}
            >
              <h3
                className="font-medium mb-1"
                style={{ 
                  fontFamily: theme.theme_heading_font,
                  color: theme.theme_text_color
                }}
              >
                {item}
              </h3>
              <p className="text-xs" style={{ color: `${theme.theme_text_color}80` }}>
                15:00 - Local
              </p>
            </div>
          ))}
        </div>

        {/* Button Preview */}
        <button
          className="w-full py-3 rounded-lg text-white font-medium text-sm"
          style={{ backgroundColor: theme.theme_primary_color }}
        >
          Confirmar Presença
        </button>

        {/* Accent Preview */}
        <div
          className="p-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: `${theme.theme_accent_color}30`,
            borderColor: theme.theme_accent_color
          }}
        >
          <p className="text-sm" style={{ color: theme.theme_text_color }}>
            Sua presença é o melhor presente que poderíamos receber.
          </p>
        </div>
      </div>
    </div>
  );
}
