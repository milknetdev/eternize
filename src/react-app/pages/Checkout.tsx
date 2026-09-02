import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Heart,
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  Clock,
  Shield,
  CreditCard,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { formatPrice } from "@/data/gifts";

// Demo cart data - in real app, this would come from state/context
const demoCartItems = [
  {
    id: "4",
    name: "Cafeteira Elétrica Nespresso",
    price: 699,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    name: "Jogo de Cama King 400 Fios",
    price: 799,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop",
  },
];

export default function Checkout() {
  useNavigate(); // keep for future use
  const [step, setStep] = useState<"info" | "pix" | "success">("info");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [pixCopied, setPixCopied] = useState(false);

  const total = demoCartItems.reduce((sum, item) => sum + item.price, 0);
  const pixCode = "00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540" + total.toFixed(2).replace(".", "") + "5802BR5920ANA E JOAO CASAMENTO6009SAO PAULO62070503***6304ABCD";

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

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("pix");
  };

  const handleConfirmPayment = () => {
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/presentes" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-xl font-semibold">Eternize</span>
            </Link>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { key: "info", label: "Seus Dados" },
            { key: "pix", label: "Pagamento" },
            { key: "success", label: "Confirmação" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step === s.key || (step === "pix" && i === 0) || (step === "success" && i <= 1)
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {(step === "pix" && i === 0) || (step === "success" && i <= 1) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-1 rounded-full ${
                    (step === "pix" && i === 0) || (step === "success" && i <= 1)
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {step === "info" && (
              <div className="bg-white rounded-2xl p-6 border border-border">
                <h1 className="font-serif text-2xl font-semibold mb-6">
                  Seus Dados
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Como você quer ser identificado(a)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mensagem para os Noivos (opcional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      placeholder="Deixe uma mensagem especial para Ana & João..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white py-6 rounded-xl font-semibold mt-4"
                  >
                    Continuar para Pagamento
                  </Button>
                </form>
              </div>
            )}

            {step === "pix" && (
              <div className="bg-white rounded-2xl p-6 border border-border">
                <h1 className="font-serif text-2xl font-semibold mb-2">
                  Pagamento via PIX
                </h1>
                <p className="text-muted-foreground mb-6">
                  Escaneie o QR Code ou copie o código para pagar
                </p>

                {/* QR Code Placeholder */}
                <div className="bg-muted/30 rounded-2xl p-8 text-center mb-6">
                  <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-border">
                    <QrCode className="w-32 h-32 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    QR Code válido por 30 minutos
                  </p>
                </div>

                {/* PIX Copy Paste */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    PIX Copia e Cola
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-xs overflow-hidden">
                      <p className="truncate">{pixCode}</p>
                    </div>
                    <Button
                      onClick={handleCopyPix}
                      variant="outline"
                      className="px-6"
                    >
                      {pixCopied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    Pagamento instantâneo
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    Transação 100% segura
                  </div>
                </div>

                <Button
                  onClick={handleConfirmPayment}
                  className="w-full bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white py-6 rounded-xl font-semibold"
                >
                  Já Fiz o Pagamento
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="bg-white rounded-2xl p-8 border border-border text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="font-serif text-3xl font-semibold mb-2">
                  Obrigado, {formData.name || "Convidado"}!
                </h1>
                <p className="text-muted-foreground mb-6">
                  Seu presente foi registrado com sucesso. Ana & João ficarão
                  muito felizes!
                </p>

                {formData.message && (
                  <div className="bg-muted/30 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm font-medium mb-1">Sua mensagem:</p>
                    <p className="text-muted-foreground italic">
                      "{formData.message}"
                    </p>
                  </div>
                )}

                <div className="bg-primary/10 rounded-xl p-4 mb-6">
                  <p className="text-sm text-primary">
                    Um e-mail de confirmação foi enviado para{" "}
                    <strong>{formData.email || "seu e-mail"}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/presentes" className="flex-1">
                    <Button variant="outline" className="w-full py-6 rounded-xl">
                      Voltar à Lista
                    </Button>
                  </Link>
                  <Link to="/demo/ana-e-joao" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white py-6 rounded-xl">
                      Ver Site do Casal
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-border sticky top-24">
              <h2 className="font-serif text-xl font-semibold mb-4">
                Resumo do Pedido
              </h2>
              <div className="space-y-4 mb-6">
                {demoCartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-primary font-semibold">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de serviço</span>
                  <span className="text-green-500">Grátis</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  Pagamento via PIX
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
