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
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { GiftCardSurface, themeFor } from "@/react-app/components/checkout/giftCardThemes";

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
  // visual treatment is picked by position (themeFor handles the wrap-around)
  themeIndex: number;
}

const FALLBACK_CARDS: CardType[] = [
  { id: "gratis", name: "Grátis", price: 0, description: "Cartão simples com seu nome e mensagem", themeIndex: 0 },
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
    document: "",
    cardSenderName: "",
    cardMessage: "",
  });
  const [pixCopied, setPixCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pixCharge, setPixCharge] = useState<{ emv: string; qrCode: string; ref: string; expiresAt: string | null } | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [payError, setPayError] = useState("");
  const [checking, setChecking] = useState(false);

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
          themeIndex: i,
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

  const handleSubmitCard = () => {
    setStep("info");
  };

  // info -> pix: create the orders, then a real PIX charge for the whole checkout.
  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPayError("");
    setBlocked(false);
    try {
      const ref =
        (crypto as any)?.randomUUID?.() ||
        `chk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

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
            checkout_ref: ref,
          }),
        });
        idx += 1;
      }

      const res = await fetch("/api/public/pix-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout_ref: ref,
          amount: total,
          description: `Presente para ${wedding?.partner1_name || ""} & ${wedding?.partner2_name || ""}`.trim(),
          customer: { name: formData.name, email: formData.email, document: formData.document },
        }),
      });

      if (res.status === 503) {
        setBlocked(true);
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setPayError(d.error || "Não foi possível gerar o PIX. Tente novamente.");
        return;
      }
      const data = await res.json();
      setPixCharge({ emv: data.emv, qrCode: data.qrCode, ref: data.ref || ref, expiresAt: data.expiresAt || null });
      setStep("pix");
    } catch (err) {
      console.error("checkout failed:", err);
      setPayError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const finishSuccess = () => {
    sessionStorage.removeItem(`cart_${customUrl}`);
    setStep("success");
  };

  // Poll payment status while on the PIX step.
  useEffect(() => {
    if (step !== "pix" || !pixCharge?.ref) return;
    let stop = false;
    const started = Date.now();
    const tick = async () => {
      if (stop) return;
      try {
        const r = await fetch(`/api/public/checkout-status/${encodeURIComponent(pixCharge.ref)}`);
        const d = await r.json();
        if (d.paid) {
          stop = true;
          finishSuccess();
          return;
        }
      } catch { /* keep trying */ }
      if (Date.now() - started < 15 * 60 * 1000) setTimeout(tick, 4000);
    };
    const t = setTimeout(tick, 4000);
    return () => {
      stop = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pixCharge?.ref]);

  const handleVerifyPayment = async () => {
    if (!pixCharge?.ref) return;
    setChecking(true);
    setPayError("");
    try {
      const r = await fetch(`/api/public/checkout-status/${encodeURIComponent(pixCharge.ref)}?reconcile=1`);
      const d = await r.json();
      if (d.paid) finishSuccess();
      else setPayError("Ainda não identificamos o pagamento. Se você acabou de pagar, aguarde alguns instantes.");
    } catch {
      setPayError("Não foi possível verificar agora. Tente novamente.");
    } finally {
      setChecking(false);
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
                  {cards.map((card) => {
                    const theme = themeFor(card.themeIndex);
                    const active = selectedCard.id === card.id;
                    return (
                      <GiftCardSurface
                        key={card.id}
                        theme={theme}
                        selected={active}
                        onClick={() => setSelectedCard(card)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`flex items-center gap-2 ${theme.accent}`}>
                            {theme.icon}
                            <span className="font-semibold">{card.name}</span>
                          </div>
                          {active && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/80 text-foreground">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-black/60 mb-2">{card.description}</p>
                        <p className={`font-semibold ${theme.accent}`}>
                          {card.price === 0 ? "Grátis" : formatPrice(card.price)}
                        </p>
                      </GiftCardSurface>
                    );
                  })}
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
                  <div className="mb-6">
                    <GiftCardSurface theme={themeFor(selectedCard.themeIndex)} variant="preview" selected>
                      <div className="text-center">
                        <p className="text-xs uppercase tracking-widest text-black/40 mb-1">Prévia do cartão</p>
                        <div className={`flex items-center justify-center gap-2 mb-3 ${themeFor(selectedCard.themeIndex).accent}`}>
                          {themeFor(selectedCard.themeIndex).icon}
                          <span className="font-serif text-lg font-semibold">
                            Cartão {selectedCard.name}
                          </span>
                        </div>
                        {formData.cardMessage && (
                          <p className="italic text-black/70 mb-3">"{formData.cardMessage}"</p>
                        )}
                        {formData.cardSenderName && (
                          <p className="font-medium text-black/80">— {formData.cardSenderName}</p>
                        )}
                      </div>
                    </GiftCardSurface>
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
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CPF <span className="text-muted-foreground font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.document}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          document: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11)
                            .replace(/(\d{3})(\d)/, "$1.$2")
                            .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
                            .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4"),
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="000.000.000-00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alguns bancos exigem o CPF do pagador no PIX.
                    </p>
                  </div>

                  {blocked && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                      O pagamento de presentes está <strong>temporariamente indisponível</strong>. Os noivos
                      já foram avisados — tente novamente mais tarde.
                    </div>
                  )}
                  {payError && (
                    <p className="text-sm text-red-500">{payError}</p>
                  )}

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
                      disabled={loading}
                      className="flex-1 py-6 rounded-xl font-semibold text-white disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      {loading ? "Gerando PIX…" : "Continuar"}
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
                  Escaneie o QR Code no app do seu banco ou use o código copia-e-cola.
                  A confirmação é automática.
                </p>

                {/* Real QR from the gateway */}
                <div className="bg-white rounded-2xl p-6 text-center mb-4 border border-border">
                  {pixCharge?.qrCode ? (
                    <img
                      src={pixCharge.qrCode}
                      alt="QR Code PIX"
                      className="w-56 h-56 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-56 h-56 mx-auto flex items-center justify-center text-muted-foreground">
                      <QrCode className="w-24 h-24" />
                    </div>
                  )}
                </div>

                {/* copia e cola */}
                {pixCharge?.emv && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">PIX copia e cola</label>
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl border border-border bg-gray-50 font-mono text-xs overflow-hidden">
                        <p className="truncate">{pixCharge.emv}</p>
                      </div>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(pixCharge.emv);
                          setPixCopied(true);
                          setTimeout(() => setPixCopied(false), 2500);
                        }}
                        variant="outline"
                        className="px-6"
                      >
                        {pixCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Clock className="w-4 h-4 animate-pulse" style={{ color: primaryColor }} />
                  Aguardando o pagamento… a tela avança sozinha quando o PIX cair.
                </div>

                {payError && <p className="text-sm text-red-500 mb-3">{payError}</p>}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setStep("info"); setPixCharge(null); }}
                    className="flex-1 py-6 rounded-xl"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleVerifyPayment}
                    disabled={checking}
                    className="flex-1 py-6 rounded-xl font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    {checking ? "Verificando…" : "Já paguei, verificar"}
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-3 mt-4 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  Pagamento processado com segurança
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
                  <div className="mb-6">
                    <GiftCardSurface theme={themeFor(selectedCard.themeIndex)} variant="preview" selected>
                      <div className="text-center">
                        <div className={`flex items-center justify-center gap-2 mb-3 ${themeFor(selectedCard.themeIndex).accent}`}>
                          {themeFor(selectedCard.themeIndex).icon}
                          <span className="font-serif text-lg font-semibold">
                            Cartão {selectedCard.name}
                          </span>
                        </div>
                        {formData.cardMessage && (
                          <p className="italic text-black/70 mb-3">"{formData.cardMessage}"</p>
                        )}
                        {(formData.cardSenderName || formData.name) && (
                          <p className="font-medium text-black/80">— {formData.cardSenderName || formData.name}</p>
                        )}
                      </div>
                    </GiftCardSurface>
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
                <div className="mb-4">
                  <GiftCardSurface theme={themeFor(selectedCard.themeIndex)} variant="chip" selected>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 ${themeFor(selectedCard.themeIndex).accent}`}>
                        <span className="[&>svg]:w-4 [&>svg]:h-4">{themeFor(selectedCard.themeIndex).icon}</span>
                        <span className="text-sm font-medium">Cartão {selectedCard.name}</span>
                      </div>
                      <span className={`text-sm font-semibold ${themeFor(selectedCard.themeIndex).accent}`}>
                        {selectedCard.price === 0 ? "Grátis" : formatPrice(selectedCard.price)}
                      </span>
                    </div>
                  </GiftCardSurface>
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
