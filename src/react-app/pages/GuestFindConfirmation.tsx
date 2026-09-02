import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Heart, Phone, ArrowRight, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function GuestFindConfirmation() {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const [phoneLast4, setPhoneLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Redirect to confirmation page with the code
      navigate(`/c/${customUrl}/confirmar/${data.confirmation_code}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-blush/20 to-champagne flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="font-serif text-3xl font-semibold mb-2">
            Confirmar Presença
          </h1>
          <p className="text-muted-foreground">
            Digite os 4 últimos dígitos do seu telefone para encontrar seu convite
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Últimos 4 dígitos do telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                value={phoneLast4}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPhoneLast4(val);
                  setError("");
                }}
                placeholder="0000"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || phoneLast4.length !== 4}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-gold-light hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Use o mesmo telefone que recebeu o convite pelo WhatsApp
        </p>
      </motion.div>
    </div>
  );
}
