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
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { authFetch } from "@/react-app/lib/api";

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
  invitation_message?: string | null;
}

interface InviteTabProps {
  wedding: Wedding;
  onSaved?: () => void;
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

export function InviteTab({ wedding, onSaved }: InviteTabProps) {
  const inviteRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(INVITE_STYLES[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [showVenue, setShowVenue] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [customMessage, setCustomMessage] = useState(
    wedding.invitation_message || "Você está convidado(a) para celebrar conosco!"
  );
  const [savingMessage, setSavingMessage] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const savedInvitation = wedding.invitation_message || "";
  const messageDirty = customMessage.trim() !== savedInvitation.trim();

  const saveMessage = async () => {
    setSavingMessage(true);
    setSavedMessage(false);
    try {
      await authFetch("/api/wedding/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitation_message: customMessage.trim() || null }),
      });
      setSavedMessage(true);
      onSaved?.();
      setTimeout(() => setSavedMessage(false), 2500);
    } catch (err) {
      console.error("Failed to save invitation message:", err);
    } finally {
      setSavingMessage(false);
    }
  };

  const hasUrl = !!wedding.custom_url;
  const weddingUrl = hasUrl
    ? `${window.location.origin}/c/${wedding.custom_url}`
    : window.location.origin;
  // Guests scan the code to RSVP, so send them straight to the confirmation page.
  const confirmUrl = hasUrl ? `${weddingUrl}/confirmar` : weddingUrl;
  const shortLink = hasUrl
    ? `${window.location.host}/c/${wedding.custom_url}`
    : window.location.host;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    // wedding_date may arrive as "YYYY-MM-DD" or as a full ISO timestamp.
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T12:00:00` : dateStr;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const prettyDate = formatDate(wedding.wedding_date);

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
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
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
                      : "border-transparent hover:border-border"
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
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
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
                      : "border-border hover:border-primary/30"
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
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Conteúdo</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mensagem do convite</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Aparece na imagem do convite e na página que os convidados abrem pelo WhatsApp.
                  Variáveis opcionais: <code className="px-1 rounded bg-muted">{"{nome}"}</code>{" "}
                  <code className="px-1 rounded bg-muted">{"{link}"}</code>
                </p>
                <button
                  onClick={saveMessage}
                  disabled={savingMessage || !messageDirty}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {savingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedMessage ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                  {savedMessage ? "Mensagem salva" : "Salvar mensagem"}
                </button>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <MessageCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Ao enviar o convite pelo WhatsApp (aba <strong>Lista de Convidados</strong>), o
                  convidado recebe um link para <strong>este</strong> convite, com botão de confirmar
                  presença.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVenue}
                    onChange={(e) => setShowVenue(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/25"
                  />
                  <span className="text-sm">Mostrar local</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTime}
                    onChange={(e) => setShowTime(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/25"
                  />
                  <span className="text-sm">Mostrar horário</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-medium mb-4 text-center">Preview do Convite</h3>
            
            {/* Invite Card */}
            <div
              ref={inviteRef}
              className="mx-auto max-w-sm"
              style={{
                backgroundColor: selectedStyle.colors.bg,
                padding: "0.5rem",
                borderRadius: "1rem",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
              }}
            >
              {/* Inner frame */}
              <div
                style={{
                  border: `1px solid ${selectedStyle.colors.accent}55`,
                  borderRadius: "0.75rem",
                  padding: "2rem 1.75rem",
                }}
              >
                {/* Decorative Top */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span
                    style={{
                      display: "block",
                      width: "38px",
                      height: "1px",
                      backgroundColor: `${selectedStyle.colors.accent}80`,
                    }}
                  />
                  <Heart
                    className="w-4 h-4"
                    style={{ color: selectedStyle.colors.accent }}
                    fill={selectedStyle.colors.accent}
                  />
                  <span
                    style={{
                      display: "block",
                      width: "38px",
                      height: "1px",
                      backgroundColor: `${selectedStyle.colors.accent}80`,
                    }}
                  />
                </div>

                {/* Eyebrow */}
                <p
                  className="text-center mb-4"
                  style={{
                    color: selectedStyle.colors.accent,
                    fontSize: "10px",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                  }}
                >
                  Convite de Casamento
                </p>

                {/* Names */}
                <div className="text-center mb-5">
                  <h2
                    className="text-3xl leading-tight"
                    style={{
                      fontFamily: selectedFont.family,
                      color: selectedStyle.colors.text,
                    }}
                  >
                    {wedding.partner1_name || "Nome 1"}
                  </h2>
                  <div
                    className="text-2xl my-1"
                    style={{
                      fontFamily: "'Great Vibes', cursive",
                      color: selectedStyle.colors.accent,
                    }}
                  >
                    &amp;
                  </div>
                  <h2
                    className="text-3xl leading-tight"
                    style={{
                      fontFamily: selectedFont.family,
                      color: selectedStyle.colors.text,
                    }}
                  >
                    {wedding.partner2_name || "Nome 2"}
                  </h2>
                </div>

                {/* Message */}
                <p
                  className="text-center text-sm mb-5 leading-relaxed"
                  style={{ color: selectedStyle.colors.text, opacity: 0.8 }}
                >
                  {customMessage}
                </p>

                {/* Date block */}
                <div
                  className="text-center mb-5 py-3"
                  style={{
                    borderTop: `1px solid ${selectedStyle.colors.accent}33`,
                    borderBottom: `1px solid ${selectedStyle.colors.accent}33`,
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: selectedStyle.colors.accent }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: selectedStyle.colors.text }}
                    >
                      {prettyDate || "Data a ser confirmada"}
                    </span>
                  </div>

                  {showTime && wedding.ceremony_time && (
                    <div className="flex items-center justify-center gap-2 mt-2">
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
                    <div className="flex items-center justify-center gap-2 mt-2">
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

                {/* QR Code */}
                <div className="text-center">
                  <div
                    className="inline-block p-3 mb-2"
                    style={{
                      backgroundColor: "white",
                      borderRadius: "0.75rem",
                      border: `1px solid ${selectedStyle.colors.accent}40`,
                    }}
                  >
                    <QRCodeSVG
                      value={confirmUrl}
                      size={116}
                      level="M"
                      fgColor={selectedStyle.colors.text}
                      bgColor="white"
                    />
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: selectedStyle.colors.text, opacity: 0.6 }}
                  >
                    Aponte a câmera para confirmar presença
                  </p>
                </div>

                {/* Footer */}
                <div
                  className="text-center mt-5 pt-4"
                  style={{ borderTop: `1px solid ${selectedStyle.colors.accent}30` }}
                >
                  <p
                    className="text-[11px] mb-0.5"
                    style={{ color: selectedStyle.colors.text, opacity: 0.55 }}
                  >
                    Confirme sua presença em
                  </p>
                  <p
                    className="text-xs font-medium"
                    style={{ color: selectedStyle.colors.accent }}
                  >
                    {shortLink}
                  </p>
                </div>
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
