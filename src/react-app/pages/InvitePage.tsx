import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Heart, Calendar, MapPin, Clock, Check, Loader2, AlertCircle, Globe } from "lucide-react";

interface InviteData {
  guestName: string;
  code: string;
  isConfirmed: boolean;
  wedding: {
    partner1_name: string;
    partner2_name: string;
    wedding_date: string;
    venue_name: string | null;
    custom_url: string;
    invitation_message: string | null;
    ceremony_time: string | null;
    ceremony_venue: string | null;
    reception_venue: string | null;
  };
}

const DEFAULT_MESSAGE =
  "Com imensa alegria, convidamos você para celebrar conosco a nossa união. Sua presença tornará esse dia ainda mais especial.";

function fillMessage(raw: string | null, firstName: string, fullName: string) {
  if (!raw || !raw.trim()) return DEFAULT_MESSAGE;
  return raw
    .replace(/\{nome_completo\}/gi, fullName)
    .replace(/\{nome\}/gi, firstName)
    .replace(/\{link\}/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function InvitePage() {
  const { code } = useParams<{ customUrl: string; code: string }>();
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [data, setData] = useState<InviteData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/confirm/${code}`);
        if (!res.ok) throw new Error("not found");
        const json = await res.json();
        if (cancelled) return;
        setData({
          guestName: json.guest.name,
          code: code!,
          isConfirmed: json.guest.isConfirmed,
          wedding: json.wedding,
        });
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    // wedding_date may be "YYYY-MM-DD" or a full ISO timestamp.
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T12:00:00` : dateStr;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4A052]" />
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6">
        <div className="max-w-sm text-center bg-white rounded-2xl shadow-xl p-8 border border-[#E8DFD0]">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="font-serif text-xl mb-2">Convite não encontrado</h1>
          <p className="text-gray-500 text-sm">
            Este link de convite é inválido ou expirou. Peça um novo aos noivos.
          </p>
        </div>
      </div>
    );
  }

  const { wedding } = data;
  const firstName = data.guestName.split(" ")[0];
  const message = fillMessage(wedding.invitation_message, firstName, data.guestName);
  const siteUrl = `${window.location.origin}/c/${wedding.custom_url}`;
  const venue = wedding.ceremony_venue || wedding.venue_name || wedding.reception_venue;

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(120,90,30,0.35)] overflow-hidden border border-[#EADFC9]"
      >
        {/* Ornamental header */}
        <div className="bg-gradient-to-br from-[#C4A052] via-[#d9bd7e] to-[#efd9a9] px-8 pt-10 pb-8 text-center text-white">
          <div className="w-14 h-14 rounded-full bg-white/25 ring-1 ring-white/40 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 fill-white text-white" />
          </div>
          <p className="uppercase tracking-[0.3em] text-[11px] text-white/80 mb-3">Convite</p>
          <h1 className="font-serif text-3xl leading-tight">
            {wedding.partner1_name}
            <span className="block text-xl my-1 text-white/90">&amp;</span>
            {wedding.partner2_name}
          </h1>
        </div>

        <div className="px-8 py-8">
          <p className="text-center text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
            {message}
          </p>

          <div className="w-12 h-px bg-[#C4A052]/40 mx-auto mb-6" />

          <div className="space-y-3 text-sm text-gray-700 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-[#C4A052]" />
              <span className="font-medium capitalize">
                {formatDate(wedding.wedding_date) || "Data a ser confirmada"}
              </span>
            </div>
            {wedding.ceremony_time && (
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#C4A052]" />
                <span>{wedding.ceremony_time}</span>
              </div>
            )}
            {venue && (
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-[#C4A052]" />
                <span>{venue}</span>
              </div>
            )}
          </div>

          {data.isConfirmed ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm mb-3">
                <Check className="w-4 h-4" />
                Presença confirmada
              </div>
              <Link
                to={`/c/${wedding.custom_url}/confirmar/${data.code}`}
                className="block text-sm text-[#C4A052] hover:underline"
              >
                Ver ou alterar minha resposta
              </Link>
            </div>
          ) : (
            <Link
              to={`/c/${wedding.custom_url}/confirmar/${data.code}`}
              className="block w-full text-center py-3.5 rounded-full font-medium text-white bg-[#C4A052] hover:bg-[#b28f42] transition-colors shadow-lg shadow-[#C4A052]/30"
            >
              Confirmar Presença
            </Link>
          )}

          {/* Wedding site — link first (guest is likely on their phone), QR as a bonus */}
          <div className="mt-8 pt-6 border-t border-[#EADFC9] text-center">
            <a
              href={siteUrl}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full font-medium text-[#8a6d2e] border border-[#C4A052]/40 bg-[#faf4e8] hover:bg-[#f4e9d3] transition-colors"
            >
              <Globe className="w-4 h-4" />
              Abrir o site do casamento
            </a>
            <p className="text-[11px] text-gray-400 mt-2 break-all">
              {siteUrl.replace(/^https?:\/\//, "")}
            </p>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 h-px bg-[#EADFC9]" />
              <span className="text-[11px] text-gray-400 uppercase tracking-wider">ou escaneie</span>
              <span className="flex-1 h-px bg-[#EADFC9]" />
            </div>

            <div className="inline-block p-2.5 bg-white rounded-xl border border-[#EADFC9]">
              <QRCodeSVG value={siteUrl} size={104} level="M" fgColor="#5b4a2e" bgColor="#ffffff" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Aponte a câmera de outro celular</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
