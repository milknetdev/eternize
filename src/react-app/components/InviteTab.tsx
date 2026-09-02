import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import {
  Download,
  Palette,
  Type,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Clock,
  Heart,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface Wedding {
  id: number;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  custom_url: string;
  ceremony_venue?: string;
  ceremony_address?: string;
  ceremony_time?: string;
  reception_venue?: string;
  reception_address?: string;
  reception_time?: string;
}

interface InviteTabProps {
  wedding: Wedding;
}

const INVITE_STYLES = [
  { id: "elegant", name: "Elegante", colors: { bg: "#FAF8F5", text: "#1a1a1a", accent: "#C4A052" } },
  { id: "romantic", name: "Romântico", colors: { bg: "#FFF0F5", text: "#4a1c40", accent: "#D4A5C7" } },
  { id: "modern", name: "Moderno", colors: { bg: "#FFFFFF", text: "#000000", accent: "#000000" } },
  { id: "garden", name: "Jardim", colors: { bg: "#F0F7F0", text: "#2D4A2D", accent: "#6B8E6B" } },
  { id: "ocean", name: "Praia", colors: { bg: "#F0F8FF", text: "#1E3A5F", accent: "#4A90A4" } },
  { id: "sunset", name: "Pôr do Sol", colors: { bg: "#FFF5EB", text: "#5D3A1A", accent: "#E07B39" } },
];

const FONTS = [
  { id: "serif", name: "Clássico", family: "'Cormorant Garamond', serif" },
  { id: "script", name: "Cursivo", family: "'Great Vibes', cursive" },
  { id: "modern", name: "Moderno", family: "'Montserrat', sans-serif" },
  { id: "elegant", name: "Elegante", family: "'Playfair Display', serif" },
];

export function InviteTab({ wedding }: InviteTabProps) {
  const inviteRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(INVITE_STYLES[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [showVenue, setShowVenue] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [customMessage, setCustomMessage] = useState("Você está convidado(a) para celebrar conosco!");

  const weddingUrl = `${window.location.origin}/c/${wedding.custom_url}`;
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    if (!inviteRef.current) return;
    
    setIsDownloading(true);
    try {
      // Load fonts before capture
      await document.fonts.ready;
      
      const canvas = await html2canvas(inviteRef.current, {
        scale: 3,
        backgroundColor: selectedStyle.colors.bg,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement("a");
      link.download = `convite-${wedding.partner1_name}-${wedding.partner2_name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating invite:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Convite Digital</h2>
          <p className="text-muted-foreground">
            Crie um convite personalizado com QR Code para compartilhar
          </p>
        </div>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-2"
        >
          {isDownloading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              Gerando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Baixar Convite
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Customization Panel */}
        <div className="space-y-6">
          {/* Style Selection */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Estilo</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {INVITE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`relative p-3 rounded-xl border-2 transition-all ${
                    selectedStyle.id === style.id
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <div
                    className="w-full h-12 rounded-lg mb-2 flex items-center justify-center"
                    style={{ backgroundColor: style.colors.bg }}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: style.colors.accent }}
                    />
                  </div>
                  <p className="text-xs font-medium text-center">{style.name}</p>
                  {selectedStyle.id === style.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selection */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Fonte</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setSelectedFont(font)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedFont.id === font.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className="text-lg mb-1"
                    style={{ fontFamily: font.family }}
                  >
                    {wedding.partner1_name} & {wedding.partner2_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{font.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Conteúdo</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mensagem personalizada</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVenue}
                    onChange={(e) => setShowVenue(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Mostrar local</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTime}
                    onChange={(e) => setShowTime(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Mostrar horário</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium mb-4 text-center">Preview do Convite</h3>
            
            {/* Invite Card */}
            <div
              ref={inviteRef}
              className="mx-auto max-w-sm"
              style={{
                backgroundColor: selectedStyle.colors.bg,
                padding: "2rem",
                borderRadius: "1rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              {/* Decorative Top */}
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{ backgroundColor: `${selectedStyle.colors.accent}20` }}
                >
                  <Heart
                    className="w-6 h-6"
                    style={{ color: selectedStyle.colors.accent }}
                    fill={selectedStyle.colors.accent}
                  />
                </div>
              </div>

              {/* Names */}
              <div className="text-center mb-6">
                <h2
                  className="text-3xl mb-2"
                  style={{
                    fontFamily: selectedFont.family,
                    color: selectedStyle.colors.text,
                  }}
                >
                  {wedding.partner1_name}
                </h2>
                <div
                  className="text-xl mb-2"
                  style={{
                    fontFamily: selectedFont.family,
                    color: selectedStyle.colors.accent,
                  }}
                >
                  &
                </div>
                <h2
                  className="text-3xl"
                  style={{
                    fontFamily: selectedFont.family,
                    color: selectedStyle.colors.text,
                  }}
                >
                  {wedding.partner2_name}
                </h2>
              </div>

              {/* Message */}
              <p
                className="text-center text-sm mb-6 leading-relaxed"
                style={{ color: selectedStyle.colors.text, opacity: 0.8 }}
              >
                {customMessage}
              </p>

              {/* Date */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar
                    className="w-4 h-4"
                    style={{ color: selectedStyle.colors.accent }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: selectedStyle.colors.text }}
                  >
                    {formatDate(wedding.wedding_date)}
                  </span>
                </div>
                
                {showTime && wedding.ceremony_time && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock
                      className="w-4 h-4"
                      style={{ color: selectedStyle.colors.accent }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: selectedStyle.colors.text }}
                    >
                      {wedding.ceremony_time}
                    </span>
                  </div>
                )}

                {showVenue && (wedding.ceremony_venue || wedding.reception_venue) && (
                  <div className="flex items-center justify-center gap-2">
                    <MapPin
                      className="w-4 h-4"
                      style={{ color: selectedStyle.colors.accent }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: selectedStyle.colors.text }}
                    >
                      {wedding.ceremony_venue || wedding.reception_venue}
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div
                className="w-16 h-0.5 mx-auto mb-6"
                style={{ backgroundColor: selectedStyle.colors.accent }}
              />

              {/* QR Code */}
              <div className="text-center">
                <div
                  className="inline-block p-3 rounded-xl mb-3"
                  style={{ backgroundColor: "white" }}
                >
                  <QRCodeSVG
                    value={weddingUrl}
                    size={120}
                    level="M"
                    fgColor={selectedStyle.colors.text}
                    bgColor="white"
                  />
                </div>
                <p
                  className="text-xs"
                  style={{ color: selectedStyle.colors.text, opacity: 0.6 }}
                >
                  Escaneie para confirmar presença
                </p>
              </div>

              {/* Footer */}
              <div
                className="text-center mt-6 pt-4 border-t"
                style={{ borderColor: `${selectedStyle.colors.accent}30` }}
              >
                <p
                  className="text-xs"
                  style={{ color: selectedStyle.colors.accent }}
                >
                  eternize.mocha.app
                </p>
              </div>
            </div>

            {/* Download Hint */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              Clique em "Baixar Convite" para salvar como imagem
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6">
        <h3 className="font-medium mb-3">💡 Dicas de uso</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• O QR Code leva direto para seu site de casamento</li>
          <li>• Compartilhe pelo WhatsApp, Instagram ou imprima</li>
          <li>• A imagem é gerada em alta resolução (3x)</li>
          <li>• Os convidados podem confirmar presença pelo site</li>
        </ul>
      </div>
    </div>
  );
}
