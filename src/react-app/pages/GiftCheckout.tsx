import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  Heart,
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  Clock,
  Shield,
  Gift,
  Sparkles,
  Crown,
  Star,
  Gem,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface CartItem {
  gift: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
  quantity: number;
}

interface Wedding {
  id: number;
  partner1_name: string;
  partner2_name: string;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  pix_key?: string;
}

interface CardType {
  id: number | string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
}

// Card tiers come from the admin (GET /api/public/platform-config); the visual
// style is assigned by position.
const CARD_STYLES = [
  { icon: <Gift className="w-6 h-6" />, gradient: "from-gray-100 to-gray-200", borderColor: "border-gray-300" },
  { icon: <Heart className="w-6 h-6" />, gradient: "from-pink-100 to-rose-200", borderColor: "border-pink-300" },
  { icon: <Star className="w-6 h-6" />, gradient: "from-amber-100 to-yellow-200", borderColor: "border-amber-400" },
  { icon: <Gem className="w-6 h-6" />, gradient: "from-purple-100 to-violet-200", borderColor: "border-purple-400" },
  { icon: <PartyPopper className="w-6 h-6" />, gradient: "from-cyan-100 to-blue-200", borderColor: "border-cyan-400" },
  { icon: <Crown className="w-6 h-6" />, gradient: "from-yellow-200 to-amber-300", borderColor: "border-yellow-500" },
];

const FALLBACK_CARDS: CardType[] = [
  { id: "gratis", name: "Grátis", price: 0, description: "Cartão simples com seu nome e mensagem", ...CARD_STYLES[0] },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function GiftCheckout() {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<"card" | "info" | "pix" | "success">("card");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [cards, setCards] = useState<CardType[]>(FALLBACK_CARDS);
  const [selectedCard, setSelectedCard] = useState<CardType>(FALLBACK_CARDS[0]);
  const [commissionPct, setCommissionPct] = useState(0);
  const [maintenanceFee, setMaintenanceFee] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardSenderName: "",
    cardMessage: "",
  });
  const [pixCopied, setPixCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/public/platform-config")
      .then((r) => r.json())
      .then((cfg) => {
        setCommissionPct(Number(cfg.commissionPct) || 0);
        setMaintenanceFee(Number(cfg.maintenanceFee) || 0);
        const opts: CardType[] = (cfg.cardOptions || []).map((o: any, i: number) => ({
          id: o.id,
          name: o.name,
          price: Number(o.price) || 0,
          description: o.description || "",
          ...CARD_STYLES[i % CARD_STYLES.length],
        }));
        if (opts.length > 0) {
          setCards(opts);
          setSelectedCard(opts[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!customUrl) return;

    // Load cart and wedding from sessionStorage
    const savedCart = sessionStorage.getItem(`cart_${customUrl}`);
    const savedWedding = sessionStorage.getItem(`wedding_${customUrl}`);

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // No cart, redirect back
      navigate(`/c/${customUrl}/presentes`);
    }

    if (savedWedding) {
      setWedding(JSON.parse(savedWedding));
    }
  }, [customUrl, navigate]);

  const giftsTotal = cart.reduce(
    (sum, item) => sum + item.gift.price * item.quantity,
    0
  );
  const total = giftsTotal + selectedCard.price + maintenanceFee;
  const coupleReceives = giftsTotal * (1 - commissionPct / 100);

  const primaryColor = wedding?.theme_primary_color || "#d4a574";
  const secondaryColor = wedding?.theme_secondary_color || "#c9a86c";

  const handleCopyPix = () => {
    if (wedding?.pix_key) {
      navigator.clipboard.writeText(wedding.pix_key);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const handleSubmitCard = () => {
    setStep("info");
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("pix");
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      // Submit order to API. The card price and the flat maintenance fee are
      // charged once per checkout — attach them to the first item only.
      let idx = 0;
      for (const item of cart) {
        await authFetch("/api/public/gift-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wedding_id: wedding?.id,
            gift_id: item.gift.id,
            guest_name: formData.name,
            guest_email: formData.email,
            amount: item.gift.price * item.quantity,
            message: formData.cardMessage,
            card_type: String(selectedCard.name).toLowerCase(),
            card_sender_name: formData.cardSenderName || formData.name,
            card_message: formData.cardMessage,
            card_price: idx === 0 ? selectedCard.price : 0,
            apply_maintenance_fee: idx === 0,
          }),
        });
        idx += 1;
      }

      // Clear cart
      sessionStorage.removeItem(`cart_${customUrl}`);
      setStep("success");
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setLoading(false);
    }
  };

  const stepNumber = step === "card" ? 1 : step === "info" ? 2 : step === "pix" ? 3 : 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-blush/20 to-champagne/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to={`/c/${customUrl}/presentes`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-xl font-semibold">Eternize</span>
            </Link>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
          {[
            { key: "card", label: "Cartão" },
            { key: "info", label: "Dados" },
            { key: "pix", label: "Pagamento" },
            { key: "success", label: "Pronto" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    stepNumber > i + 1
                      ? "bg-green-500 text-white"
                      : stepNumber === i + 1
                      ? "text-white shadow-lg"
                      : "bg-white/60 text-muted-foreground border border-border"
                  }`}
                  style={stepNumber === i + 1 ? { backgroundColor: primaryColor } : {}}
                >
                  {stepNumber > i + 1 ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block text-muted-foreground">{s.label}</span>
              </div>
              {i < 3 && (
                <div
                  className={`w-8 sm:w-12 h-1 rounded-full transition-all ${
                    stepNumber > i + 1 ? "bg-green-500" : "bg-white/60"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Step 1: Card Selection */}
            {step === "card" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6" style={{ color: primaryColor }} />
                  <h1 className="font-serif text-2xl font-semibold">
                    Escolha seu Cartão Personalizado
                  </h1>
                </div>
                <p className="text-muted-foreground mb-6">
                  Adicione um toque especial ao seu presente com um cartão personalizado
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                        selectedCard.id === card.id
                          ? `${card.borderColor} shadow-lg`
                          : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${card.gradient} opacity-50`}
                      />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span style={{ color: primaryColor }}>{card.icon}</span>
                            <span className="font-semibold">{card.name}</span>
                          </div>
                          {selectedCard.id === card.id && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {card.description}
                        </p>
                        <p className="font-semibold" style={{ color: primaryColor }}>
                          {card.price === 0 ? "Grátis" : formatPrice(card.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Card Preview */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                    Preencha seu cartão
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Seu nome no cartão
                      </label>
                      <input
                        type="text"
                        value={formData.cardSenderName}
                        onChange={(e) =>
                          setFormData({ ...formData, cardSenderName: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Como você quer assinar o cartão"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Sua mensagem
                      </label>
                      <textarea
                        value={formData.cardMessage}
                        onChange={(e) =>
                          setFormData({ ...formData, cardMessage: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        placeholder="Escreva uma mensagem especial para os noivos..."
                      />
                    </div>
                  </div>
                </div>

                {/* Card Preview Box */}
                {(formData.cardSenderName || formData.cardMessage) && (
                  <div
                    className={`p-6 rounded-xl bg-gradient-to-br ${selectedCard.gradient} border-2 ${selectedCard.borderColor} mb-6`}
                  >
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Prévia do cartão</p>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        {selectedCard.icon}
                        <span className="font-serif text-lg font-semibold">
                          Cartão {selectedCard.name}
                        </span>
                      </div>
                      {formData.cardMessage && (
                        <p className="italic text-gray-700 mb-3">"{formData.cardMessage}"</p>
                      )}
                      {formData.cardSenderName && (
                        <p className="font-medium">— {formData.cardSenderName}</p>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubmitCard}
                  className="w-full py-6 rounded-xl font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  Continuar
                </Button>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === "info" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl">
                <h1 className="font-serif text-2xl font-semibold mb-6">
                  Seus Dados
                </h1>
                <form onSubmit={handleSubmitInfo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Seu nome completo"
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
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="seu@email.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enviaremos a confirmação do presente para este e-mail
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("card")}
                      className="flex-1 py-6 rounded-xl"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 py-6 rounded-xl font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      Continuar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: PIX Payment */}
            {step === "pix" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl">
                <h1 className="font-serif text-2xl font-semibold mb-2">
                  Pagamento via PIX
                </h1>
                <p className="text-muted-foreground mb-6">
                  Escaneie o QR Code ou copie a chave PIX para pagar
                </p>

                {/* QR Code Placeholder */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center mb-6">
                  <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <QrCode className="w-32 h-32 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    QR Code válido por 30 minutos
                  </p>
                </div>

                {/* PIX Key */}
                {wedding?.pix_key && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Chave PIX
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl border border-border bg-gray-50 font-mono text-sm overflow-hidden">
                        <p className="truncate">{wedding.pix_key}</p>
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
                )}

                {/* Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                    Pagamento instantâneo
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" style={{ color: primaryColor }} />
                    Transação 100% segura
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("info")}
                    className="flex-1 py-6 rounded-xl"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="flex-1 py-6 rounded-xl font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    {loading ? "Processando..." : "Já Fiz o Pagamento"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-xl text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Check className="w-10 h-10" style={{ color: primaryColor }} />
                </div>
                <h1 className="font-serif text-3xl font-semibold mb-2">
                  Obrigado, {formData.name}!
                </h1>
                <p className="text-muted-foreground mb-6">
                  Seu presente foi registrado com sucesso.{" "}
                  {wedding?.partner1_name} & {wedding?.partner2_name} ficarão muito felizes!
                </p>

                {/* Card Preview */}
                {selectedCard.price > 0 && (
                  <div
                    className={`p-6 rounded-xl bg-gradient-to-br ${selectedCard.gradient} border-2 ${selectedCard.borderColor} mb-6 text-left`}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        {selectedCard.icon}
                        <span className="font-serif text-lg font-semibold">
                          Cartão {selectedCard.name}
                        </span>
                      </div>
                      {formData.cardMessage && (
                        <p className="italic text-gray-700 mb-3">"{formData.cardMessage}"</p>
                      )}
                      {(formData.cardSenderName || formData.name) && (
                        <p className="font-medium">— {formData.cardSenderName || formData.name}</p>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="rounded-xl p-4 mb-6"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <p className="text-sm" style={{ color: primaryColor }}>
                    Um e-mail de confirmação foi enviado para{" "}
                    <strong>{formData.email}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/c/${customUrl}/presentes`} className="flex-1">
                    <Button variant="outline" className="w-full py-6 rounded-xl">
                      Voltar à Lista
                    </Button>
                  </Link>
                  <Link to={`/c/${customUrl}`} className="flex-1">
                    <Button
                      className="w-full py-6 rounded-xl text-white"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      Ver Site do Casal
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl sticky top-24">
              <h2 className="font-serif text-xl font-semibold mb-4">
                Resumo do Pedido
              </h2>
              
              {/* Gifts */}
              <div className="space-y-4 mb-4">
                {cart.map((item) => (
                  <div key={item.gift.id} className="flex gap-3">
                    {item.gift.image_url ? (
                      <img
                        src={item.gift.image_url}
                        alt={item.gift.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-gold-light/10 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-primary/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.gift.name}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                      )}
                      <p className="font-semibold" style={{ color: primaryColor }}>
                        {formatPrice(item.gift.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card */}
              {selectedCard && (
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${selectedCard.gradient} border ${selectedCard.borderColor} mb-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{selectedCard.icon}</span>
                      <span className="text-sm font-medium">Cartão {selectedCard.name}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                      {selectedCard.price === 0 ? "Grátis" : formatPrice(selectedCard.price)}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presentes</span>
                  <span>{formatPrice(giftsTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cartão Personalizado</span>
                  <span>
                    {selectedCard.price === 0 ? (
                      <span className="text-green-500">Grátis</span>
                    ) : (
                      formatPrice(selectedCard.price)
                    )}
                  </span>
                </div>
                {maintenanceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de manutenção do site</span>
                    <span>{formatPrice(maintenanceFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span style={{ color: primaryColor }}>{formatPrice(total)}</span>
                </div>
                {commissionPct > 0 && giftsTotal > 0 && (
                  <p className="text-xs text-muted-foreground pt-1">
                    Os noivos recebem {formatPrice(coupleReceives)} (taxa de serviço de {commissionPct}% sobre o valor do presente).
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  Pagamento 100% seguro via PIX
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
