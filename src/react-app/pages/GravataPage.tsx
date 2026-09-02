import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Heart,
  QrCode,
  Copy,
  Check,
  Send,
  User,
  MessageCircle,
  Sparkles,
  Gift,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface Contribution {
  contributor_name: string;
  amount: number;
  message: string | null;
  is_anonymous: number;
  created_at: string;
}

interface Wedding {
  partner1_name: string;
  partner2_name: string;
  pix_key: string | null;
}

const SUGGESTED_AMOUNTS = [50, 100, 150, 200, 300, 500];

export default function GravataPage() {
  const { customUrl } = useParams();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    contributor_name: "",
    amount: 100,
    message: "",
    is_anonymous: false,
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [customUrl]);

  const fetchData = async () => {
    try {
      const [weddingRes, contributionsRes] = await Promise.all([
        fetch(`/api/public/wedding/${customUrl}`),
        fetch(`/api/public/wedding/${customUrl}/contributions`),
      ]);

      const weddingData = await weddingRes.json();
      const contributionsData = await contributionsRes.json();

      setWedding(weddingData.wedding || null);
      setContributions(contributionsData.contributions || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contributor_name.trim() || form.amount <= 0) return;

    setSubmitting(true);
    try {
      await fetch(`/api/public/wedding/${customUrl}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit contribution:", error);
      alert("Erro ao registrar contribuição. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPixKey = () => {
    if (wedding?.pix_key) {
      navigator.clipboard.writeText(wedding.pix_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100 flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-rose-400" />
        </div>
      </div>
    );
  }

  if (!wedding || !wedding.pix_key) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100 flex items-center justify-center p-4">
        <div className="text-center">
          <QrCode className="w-16 h-16 text-rose-300 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-rose-900 mb-2">Gravata não disponível</h1>
          <p className="text-rose-700">Os noivos ainda não configuraram o PIX.</p>
          <Link to={`/c/${customUrl}`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao site
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(wedding.pix_key)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/c/${customUrl}`} className="flex items-center gap-2 text-rose-800 hover:text-rose-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="font-serif text-lg font-semibold text-rose-900">Gravata</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white px-4 py-2 rounded-full text-sm mb-4">
            <Gift className="w-4 h-4" />
            <span>Presente Especial</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-rose-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Gravata de {wedding.partner1_name} & {wedding.partner2_name}
          </h1>
          <p className="text-rose-700 max-w-lg mx-auto">
            Faça uma contribuição especial para os noivos via PIX. É rápido, seguro e muito significativo!
          </p>
        </div>

        {submitted ? (
          /* Success State */
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-rose-200">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-rose-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Obrigado pela sua contribuição!
            </h2>
            <p className="text-rose-700 mb-6">
              Sua intenção de presente foi registrada. Agora é só fazer o PIX!
            </p>

            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 mb-6">
              <p className="text-sm text-amber-800 mb-3">Escaneie o QR Code ou copie a chave PIX:</p>
              <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-lg border border-amber-200 mb-4" />
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-amber-200">
                <span className="flex-1 font-mono text-sm truncate">{wedding.pix_key}</span>
                <Button size="sm" variant="outline" onClick={copyPixKey}>
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <p className="text-sm text-rose-600 mb-4">
              Valor escolhido: <strong>{formatCurrency(form.amount)}</strong>
            </p>

            <Link to={`/c/${customUrl}`}>
              <Button className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600">
                <Heart className="w-4 h-4 mr-2" />
                Voltar ao site do casamento
              </Button>
            </Link>
          </div>
        ) : (
          /* Form */
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-rose-200">
              <h3 className="text-lg font-serif font-semibold text-rose-900 mb-4 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                <QrCode className="w-5 h-5 inline mr-2" />
                PIX dos Noivos
              </h3>
              <div className="flex flex-col items-center">
                <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 rounded-lg border border-rose-200 mb-4" />
                <div className="w-full">
                  <p className="text-xs text-muted-foreground text-center mb-2">Chave PIX:</p>
                  <div className="flex items-center gap-2 bg-rose-50 rounded-lg p-3 border border-rose-200">
                    <span className="flex-1 font-mono text-sm truncate">{wedding.pix_key}</span>
                    <Button size="sm" variant="ghost" onClick={copyPixKey}>
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-rose-200">
              <h3 className="text-lg font-serif font-semibold text-rose-900 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                <Heart className="w-5 h-5 inline mr-2 text-rose-500" />
                Sua Contribuição
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-rose-800 mb-1">Seu Nome</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                    <input
                      type="text"
                      value={form.contributor_name}
                      onChange={(e) => setForm({ ...form, contributor_name: e.target.value })}
                      placeholder="Como você quer ser identificado?"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rose-800 mb-2">Valor</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {SUGGESTED_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setForm({ ...form, amount })}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          form.amount === amount
                            ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400">R$</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                      min="1"
                      placeholder="Outro valor"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-rose-800 mb-1">Mensagem (opcional)</label>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 absolute left-3 top-3 text-rose-400" />
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Deixe uma mensagem carinhosa para os noivos..."
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none resize-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_anonymous}
                    onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
                    className="w-4 h-4 rounded border-rose-300 text-rose-500 focus:ring-rose-300"
                  />
                  <span className="text-sm text-rose-700">Contribuição anônima</span>
                </label>

                <Button
                  type="submit"
                  disabled={submitting || !form.contributor_name.trim() || form.amount <= 0}
                  className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 py-3"
                >
                  {submitting ? (
                    "Registrando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Registrar Contribuição
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Após registrar, faça o PIX usando o QR Code ao lado
                </p>
              </form>
            </div>
          </div>
        )}

        {/* Recent Contributions */}
        {contributions.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-rose-200">
            <h3 className="text-lg font-serif font-semibold text-rose-900 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <Heart className="w-5 h-5 inline mr-2 text-rose-500 fill-rose-500" />
              Contribuições Recentes
            </h3>
            <div className="space-y-3">
              {contributions.slice(0, 10).map((contribution, index) => (
                <div key={index} className="flex items-start gap-3 bg-rose-50 rounded-lg p-3 border border-rose-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-rose-900 truncate">
                        {contribution.is_anonymous ? "Anônimo" : contribution.contributor_name}
                      </p>
                      <span className="font-semibold text-amber-700 whitespace-nowrap">
                        {formatCurrency(contribution.amount)}
                      </span>
                    </div>
                    {contribution.message && (
                      <p className="text-sm text-rose-700 mt-1">"{contribution.message}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-rose-600 text-sm">
          Feito com <Heart className="w-4 h-4 inline text-rose-500 fill-rose-500" /> por{" "}
          <Link to="/" className="font-semibold hover:underline">Eternize</Link>
        </p>
      </footer>
    </div>
  );
}
