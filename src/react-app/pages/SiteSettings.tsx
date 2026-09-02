import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/local-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Image,
  Music,
  Instagram,
  MapPin,
  Clock,
  Shirt,
  BookOpen,
  Gift,
  MessageSquare,
  Share2,
  Users,
  Camera,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
}

interface SiteSettingsData {
  show_story: boolean;
  show_gallery: boolean;
  show_timeline: boolean;
  show_location: boolean;
  show_dresscode: boolean;
  show_gifts: boolean;
  show_rsvp: boolean;
  show_messages: boolean;
  hero_style: string;
  our_story: string;
  ceremony_time: string;
  ceremony_venue: string;
  reception_time: string;
  reception_venue: string;
  dress_code: string;
  dress_code_description: string;
  dress_code_allowed_colors: string[];
  dress_code_avoid_colors: string[];
  timeline_events: TimelineEvent[];
  instagram_url: string;
  music_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
}

const defaultSettings: SiteSettingsData = {
  show_story: true,
  show_gallery: true,
  show_timeline: true,
  show_location: true,
  show_dresscode: true,
  show_gifts: true,
  show_rsvp: true,
  show_messages: true,
  hero_style: "centered",
  our_story: "",
  ceremony_time: "",
  ceremony_venue: "",
  reception_time: "",
  reception_venue: "",
  dress_code: "esporte-fino",
  dress_code_description: "",
  dress_code_allowed_colors: [],
  dress_code_avoid_colors: ["#FFFFFF", "#000000"],
  timeline_events: [],
  instagram_url: "",
  music_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
};

const heroStyles = [
  { id: "centered", label: "Centralizado", description: "Texto centralizado sobre a imagem" },
  { id: "left", label: "Esquerda", description: "Texto alinhado à esquerda" },
  { id: "minimal", label: "Minimalista", description: "Apenas nomes e data" },
  { id: "fullscreen", label: "Tela cheia", description: "Imagem ocupando toda a tela" },
];

const dressCodes = [
  { id: "esporte-fino", label: "Esporte Fino" },
  { id: "traje-social", label: "Traje Social" },
  { id: "black-tie", label: "Black Tie" },
  { id: "casual-chic", label: "Casual Chic" },
  { id: "traje-a-rigor", label: "Traje a Rigor" },
  { id: "rustico", label: "Rústico/Country" },
  { id: "praia", label: "Traje Praia" },
];

const colorOptions = [
  { hex: "#FFFFFF", name: "Branco" },
  { hex: "#000000", name: "Preto" },
  { hex: "#1a1a2e", name: "Azul Marinho" },
  { hex: "#E8D5C4", name: "Nude/Bege" },
  { hex: "#F7E7CE", name: "Champagne" },
  { hex: "#B4C8D9", name: "Azul Serenity" },
  { hex: "#B2C4A8", name: "Verde Sage" },
  { hex: "#D4A5A5", name: "Rosa Blush" },
  { hex: "#C9A959", name: "Dourado" },
  { hex: "#C0C0C0", name: "Prata" },
  { hex: "#722F37", name: "Marsala" },
  { hex: "#DC143C", name: "Vermelho" },
  { hex: "#800080", name: "Roxo" },
  { hex: "#FFD700", name: "Amarelo" },
  { hex: "#FFA500", name: "Laranja" },
];

export default function SiteSettings() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [activeTab, setActiveTab] = useState<"sections" | "content" | "event" | "media" | "social">("sections");

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/entrar");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await authFetch("/api/wedding");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setSettings({
              show_story: data.show_story !== 0,
              show_gallery: data.show_gallery !== 0,
              show_timeline: data.show_timeline !== 0,
              show_location: data.show_location !== 0,
              show_dresscode: data.show_dresscode !== 0,
              show_gifts: data.show_gifts !== 0,
              show_rsvp: data.show_rsvp !== 0,
              show_messages: data.show_messages !== 0,
              hero_style: data.hero_style || "centered",
              our_story: data.our_story || "",
              ceremony_time: data.ceremony_time || "",
              ceremony_venue: data.ceremony_venue || "",
              reception_time: data.reception_time || "",
              reception_venue: data.reception_venue || "",
              dress_code: data.dress_code || "esporte-fino",
              dress_code_description: data.dress_code_description || "",
              dress_code_allowed_colors: data.dress_code_allowed_colors ? JSON.parse(data.dress_code_allowed_colors) : [],
              dress_code_avoid_colors: data.dress_code_avoid_colors ? JSON.parse(data.dress_code_avoid_colors) : ["#FFFFFF", "#000000"],
              timeline_events: data.timeline_events ? JSON.parse(data.timeline_events) : [],
              instagram_url: data.instagram_url || "",
              music_url: data.music_url || "",
              og_title: data.og_title || "",
              og_description: data.og_description || "",
              og_image: data.og_image || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await authFetch("/api/wedding/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          show_story: settings.show_story ? 1 : 0,
          show_gallery: settings.show_gallery ? 1 : 0,
          show_timeline: settings.show_timeline ? 1 : 0,
          show_location: settings.show_location ? 1 : 0,
          show_dresscode: settings.show_dresscode ? 1 : 0,
          show_gifts: settings.show_gifts ? 1 : 0,
          show_rsvp: settings.show_rsvp ? 1 : 0,
          show_messages: settings.show_messages ? 1 : 0,
          dress_code_allowed_colors: JSON.stringify(settings.dress_code_allowed_colors),
          dress_code_avoid_colors: JSON.stringify(settings.dress_code_avoid_colors),
          timeline_events: JSON.stringify(settings.timeline_events),
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSaveMessage({ type: "success", text: "Configurações salvas com sucesso!" });
          setTimeout(() => setSaveMessage(null), 3000);
        } else {
          setSaveMessage({ type: "error", text: data.error || "Erro ao salvar configurações" });
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setSaveMessage({ type: "error", text: errorData.error || "Erro ao salvar configurações" });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage({ type: "error", text: "Erro de conexão. Tente novamente." });
    } finally {
      setSaving(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sectionToggles = [
    { key: "show_story", label: "Nossa História", icon: BookOpen, description: "Conte como vocês se conheceram" },
    { key: "show_gallery", label: "Galeria de Fotos", icon: Camera, description: "Álbum de fotos do casal" },
    { key: "show_timeline", label: "Linha do Tempo", icon: Calendar, description: "Momentos especiais do relacionamento" },
    { key: "show_location", label: "Localização", icon: MapPin, description: "Mapa e endereço do evento" },
    { key: "show_dresscode", label: "Dress Code", icon: Shirt, description: "Orientações sobre vestimenta" },
    { key: "show_gifts", label: "Lista de Presentes", icon: Gift, description: "Sugestões de presentes" },
    { key: "show_rsvp", label: "Confirmação (RSVP)", icon: Users, description: "Confirmar presença dos convidados" },
    { key: "show_messages", label: "Recados", icon: MessageSquare, description: "Mensagens dos convidados" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <span className="font-serif text-xl font-semibold">Configurações do Site</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saveMessage && (
                <span className={`text-sm font-medium ${saveMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {saveMessage.text}
                </span>
              )}
              <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl border p-1.5 flex gap-1 mb-8">
          {[
            { id: "sections", label: "Seções", icon: Eye },
            { id: "content", label: "Conteúdo", icon: BookOpen },
            { id: "event", label: "Evento", icon: Calendar },
            { id: "media", label: "Mídia", icon: Image },
            { id: "social", label: "WhatsApp", icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-primary text-white" : "hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sections Tab */}
        {activeTab === "sections" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-serif text-lg font-semibold mb-2">Seções Visíveis</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Escolha quais seções aparecerão no seu site de casamento
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {sectionToggles.map((section) => {
                  const Icon = section.icon;
                  const isEnabled = settings[section.key as keyof SiteSettingsData] as boolean;
                  return (
                    <button
                      key={section.key}
                      onClick={() =>
                        setSettings({ ...settings, [section.key]: !isEnabled })
                      }
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isEnabled
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/20 bg-muted/30 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isEnabled ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{section.label}</span>
                          {isEnabled ? (
                            <Eye className="w-4 h-4 text-primary" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {section.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hero Style */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-serif text-lg font-semibold mb-2">Estilo do Cabeçalho</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Como você quer que a primeira seção do site apareça
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {heroStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSettings({ ...settings, hero_style: style.id })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      settings.hero_style === style.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-medium">{style.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Dress Code */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-serif text-lg font-semibold mb-2">Dress Code</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Orientações sobre vestimenta para os convidados
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {dressCodes.map((code) => (
                  <button
                    key={code.id}
                    onClick={() => setSettings({ ...settings, dress_code: code.id })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      settings.dress_code === code.id
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    {code.label}
                  </button>
                ))}
              </div>

              <textarea
                value={settings.dress_code_description}
                onChange={(e) =>
                  setSettings({ ...settings, dress_code_description: e.target.value })
                }
                placeholder="Adicione orientações extras sobre o traje (cores a evitar, sugestões, etc.)"
                className="w-full h-24 p-4 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
              />

              {/* Cores Permitidas */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Cores Sugeridas (opcional)</h4>
                <p className="text-muted-foreground text-xs mb-3">Selecione as cores que os convidados podem usar</p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        const newColors = settings.dress_code_allowed_colors.includes(color.hex)
                          ? settings.dress_code_allowed_colors.filter(c => c !== color.hex)
                          : [...settings.dress_code_allowed_colors, color.hex];
                        setSettings({ ...settings, dress_code_allowed_colors: newColors });
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                        settings.dress_code_allowed_colors.includes(color.hex)
                          ? "border-green-500 bg-green-50 ring-2 ring-green-500/30"
                          : "border-muted-foreground/20 hover:border-muted-foreground/40"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores a Evitar */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Cores a Evitar</h4>
                <p className="text-muted-foreground text-xs mb-3">Selecione as cores que os convidados devem evitar</p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        const newColors = settings.dress_code_avoid_colors.includes(color.hex)
                          ? settings.dress_code_avoid_colors.filter(c => c !== color.hex)
                          : [...settings.dress_code_avoid_colors, color.hex];
                        setSettings({ ...settings, dress_code_avoid_colors: newColors });
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                        settings.dress_code_avoid_colors.includes(color.hex)
                          ? "border-red-500 bg-red-50 ring-2 ring-red-500/30"
                          : "border-muted-foreground/20 hover:border-muted-foreground/40"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Event Tab */}
        {activeTab === "event" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Ceremony */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold">Cerimônia</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Horário</label>
                  <input
                    type="time"
                    value={settings.ceremony_time}
                    onChange={(e) => setSettings({ ...settings, ceremony_time: e.target.value })}
                    className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Local</label>
                  <input
                    type="text"
                    value={settings.ceremony_venue}
                    onChange={(e) => setSettings({ ...settings, ceremony_venue: e.target.value })}
                    placeholder="Nome da igreja, cartório, etc."
                    className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Reception */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold">Recepção</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Horário</label>
                  <input
                    type="time"
                    value={settings.reception_time}
                    onChange={(e) => setSettings({ ...settings, reception_time: e.target.value })}
                    className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Local</label>
                  <input
                    type="text"
                    value={settings.reception_venue}
                    onChange={(e) => setSettings({ ...settings, reception_venue: e.target.value })}
                    placeholder="Salão, restaurante, etc."
                    className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Timeline Events */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold">Linha do Tempo</h3>
                    <p className="text-muted-foreground text-xs">Adicione eventos personalizados do dia</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newEvent: TimelineEvent = {
                      id: Date.now().toString(),
                      time: "",
                      title: "",
                      description: "",
                      icon: "clock"
                    };
                    setSettings({ ...settings, timeline_events: [...settings.timeline_events, newEvent] });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              {settings.timeline_events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum evento adicionado</p>
                  <p className="text-xs mt-1">Clique em "Adicionar" para criar eventos do dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.timeline_events.map((event, index) => (
                    <div key={event.id} className="p-4 border rounded-xl bg-muted/20">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Horário</label>
                            <input
                              type="time"
                              value={event.time}
                              onChange={(e) => {
                                const updated = [...settings.timeline_events];
                                updated[index] = { ...event, time: e.target.value };
                                setSettings({ ...settings, timeline_events: updated });
                              }}
                              className="w-full p-2 text-sm rounded-lg border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium mb-1">Título</label>
                            <input
                              type="text"
                              value={event.title}
                              onChange={(e) => {
                                const updated = [...settings.timeline_events];
                                updated[index] = { ...event, title: e.target.value };
                                setSettings({ ...settings, timeline_events: updated });
                              }}
                              placeholder="Ex: Cerimônia, Recepção..."
                              className="w-full p-2 text-sm rounded-lg border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Ícone</label>
                            <select
                              value={event.icon}
                              onChange={(e) => {
                                const updated = [...settings.timeline_events];
                                updated[index] = { ...event, icon: e.target.value };
                                setSettings({ ...settings, timeline_events: updated });
                              }}
                              className="w-full p-2 text-sm rounded-lg border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                            >
                              <option value="clock">⏰ Relógio</option>
                              <option value="heart">💕 Coração</option>
                              <option value="church">⛪ Igreja</option>
                              <option value="rings">💍 Alianças</option>
                              <option value="champagne">🥂 Brinde</option>
                              <option value="cake">🎂 Bolo</option>
                              <option value="music">🎵 Música</option>
                              <option value="camera">📸 Foto</option>
                              <option value="car">🚗 Carro</option>
                              <option value="sparkles">✨ Festa</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updated = settings.timeline_events.filter((_, i) => i !== index);
                            setSettings({ ...settings, timeline_events: updated });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-medium mb-1">Descrição (opcional)</label>
                        <input
                          type="text"
                          value={event.description}
                          onChange={(e) => {
                            const updated = [...settings.timeline_events];
                            updated[index] = { ...event, description: e.target.value };
                            setSettings({ ...settings, timeline_events: updated });
                          }}
                          placeholder="Detalhes do evento..."
                          className="w-full p-2 text-sm rounded-lg border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Media Tab */}
        {activeTab === "media" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Instagram */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-serif text-lg font-semibold">Instagram</h3>
              </div>

              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/seuperfil"
                className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Link para o perfil do casal ou hashtag do casamento
              </p>
            </div>

            {/* Background Music */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold">Música de Fundo</h3>
              </div>

              <input
                type="url"
                value={settings.music_url}
                onChange={(e) => setSettings({ ...settings, music_url: e.target.value })}
                placeholder="https://open.spotify.com/track/... ou link do YouTube"
                className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Cole o link de uma música no Spotify, YouTube ou SoundCloud
              </p>
            </div>
          </motion.div>
        )}

        {/* Social Tab (WhatsApp Preview) */}
        {activeTab === "social" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold">Preview do WhatsApp</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Configure como seu site aparece quando compartilhado no WhatsApp, Facebook e outras redes sociais.
              </p>

              <div className="space-y-4">
                {/* OG Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Título</label>
                  <input
                    type="text"
                    value={settings.og_title}
                    onChange={(e) => setSettings({ ...settings, og_title: e.target.value })}
                    placeholder="Ex: Maria & Pedro - Nosso Casamento"
                    className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe em branco para usar "Nome1 & Nome2" automaticamente
                  </p>
                </div>

                {/* OG Description */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Descrição</label>
                  <textarea
                    value={settings.og_description}
                    onChange={(e) => setSettings({ ...settings, og_description: e.target.value })}
                    placeholder="Ex: Você está convidado(a) para celebrar conosco!"
                    rows={3}
                    className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe em branco para usar mensagem padrão
                  </p>
                </div>

                {/* OG Image */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Imagem de Preview</label>
                  <input
                    type="url"
                    value={settings.og_image}
                    onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                    placeholder="https://... (URL da imagem)"
                    className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recomendado: 1200x630 pixels. Deixe em branco para usar a foto de capa
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-serif text-lg font-semibold mb-4">Como vai aparecer:</h3>
              
              <div className="bg-gray-100 rounded-xl p-4 max-w-sm">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                  {settings.og_image ? (
                    <img 
                      src={settings.og_image} 
                      alt="Preview" 
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Image className="w-12 h-12 text-primary/40" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-green-600 mb-1">eternize.mocha.app</p>
                    <p className="font-semibold text-sm line-clamp-2">
                      {settings.og_title || "Nome1 & Nome2"}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {settings.og_description || "Você está convidado(a) para o casamento!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
