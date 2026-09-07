import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Heart, Phone, Loader2, Search, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface Wedding {
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export default function GuestFindConfirmation() {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [phoneLast4, setPhoneLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customUrl) return;
    fetch(`/api/public/wedding/${customUrl}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.wedding && setWedding(d.wedding))
      .catch(() => {});
  }, [customUrl]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneLast4.length !== 4) {
      setError("Digite os 4 últimos dígitos do seu telefone");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/public/wedding/${customUrl}/find-guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneLast4 }),
      });

      const data = await res.json();

      if (!res.ok || !data.found) {
        setError(data.error || "Não encontramos um convite com esse telefone. Verifique os números e tente novamente.");
        setLoading(false);
        return;
      }

      navigate(`/c/${customUrl}/confirmar/${data.confirmation_code}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  };

  const names = wedding
    ? `${wedding.partner1_name} & ${wedding.partner2_name}`
    : "Confirmar Presença";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FDF8F5] via-white to-[#FDF8F5] flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#D4A574]/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-[#E8C4A0]/20 blur-3xl" />
        <Heart className="absolute top-16 right-[12%] w-6 h-6 text-[#D4A574]/25 fill-[#D4A574]/25" />
        <Heart className="absolute bottom-24 left-[14%] w-8 h-8 text-[#D4A574]/20 fill-[#D4A574]/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(179,125,23,0.25)] overflow-hidden border border-[#D4A574]/20">
          {/* Header band */}
          <div className="relative bg-gradient-to-br from-[#bd7d17] via-[#D4A574] to-[#E8C4A0] px-8 pt-10 pb-8 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 ring-1 ring-white/30">
              <Heart className="w-8 h-8 fill-white text-white" />
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/80 mb-1">
              Lista de Convidados
            </p>
            <h1 className="font-serif text-2xl sm:text-[1.7rem] leading-tight">{names}</h1>
            {wedding?.wedding_date && (
              <p className="text-white/85 text-sm mt-1">{formatDate(wedding.wedding_date)}</p>
            )}
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <p className="text-center text-[#6b5b4b] text-sm mb-6">
              Digite os <strong className="font-semibold">4 últimos dígitos</strong> do seu
              telefone para encontrarmos o seu convite.
            </p>

            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#4b3f33] mb-2">
                  Últimos 4 dígitos do telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4A574]" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={phoneLast4}
                    onChange={(e) => {
                      setPhoneLast4(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    placeholder="0000"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#EADFD3] bg-[#FDFAF7] text-center text-2xl font-mono tracking-[0.5em] text-[#4b3f33] placeholder:text-[#cbb9a5] focus:outline-none focus:border-[#D4A574] focus:ring-4 focus:ring-[#D4A574]/15 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || phoneLast4.length !== 4}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#bd7d17] via-[#D4A574] to-[#e6bd54] shadow-lg shadow-[#D4A574]/30 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Buscar meu convite
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#F0E8DF] flex items-start gap-2.5 text-xs text-[#8a7a68]">
              <ShieldCheck className="w-4 h-4 mt-px shrink-0 text-[#D4A574]" />
              <span>
                Use o mesmo número que recebeu o convite pelo WhatsApp. Seus dados não são
                compartilhados.
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
