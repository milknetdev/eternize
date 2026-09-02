import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  Heart,
  Search,
  Gift,
  ShoppingBag,
  X,
  Check,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface GiftItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: number;
  quota_total: number | null;
  quota_purchased: number | null;
}

interface Wedding {
  id: number;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  custom_url: string;
  theme_primary_color?: string;
  theme_secondary_color?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function PublicGiftList() {
  const { customUrl } = useParams<{ customUrl: string }>();
  const navigate = useNavigate();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ gift: GiftItem; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

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
    if (!customUrl) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch wedding info
        const weddingRes = await fetch(`/api/public/wedding/${customUrl}`);
        if (!weddingRes.ok) {
          throw new Error("Casamento não encontrado");
        }
        const weddingData = await weddingRes.json();
        setWedding(weddingData.wedding);

        // Fetch gifts
        const giftsRes = await fetch(`/api/public/wedding/${customUrl}/gifts`);
        if (giftsRes.ok) {
          const giftsData = await giftsRes.json();
          setGifts(giftsData.gifts || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customUrl]);

  const filteredGifts = gifts.filter((gift) => {
    const matchesSearch =
      gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gift.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const addToCart = (gift: GiftItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.gift.id === gift.id);
      if (existing) {
        return prev.map((item) =>
          item.gift.id === gift.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { gift, quantity: 1 }];
    });
    setSelectedGift(null);
  };

  const removeFromCart = (giftId: number) => {
    setCart((prev) => prev.filter((item) => item.gift.id !== giftId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.gift.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const primaryColor = wedding?.theme_primary_color || "#d4a574";

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando lista de presentes...</p>
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-semibold mb-2">
            Lista não encontrada
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || "Não foi possível encontrar esta lista de presentes."}
          </p>
          <Link to="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to={`/c/${customUrl}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao site</span>
            </Link>

            <Link to="/" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${wedding.theme_secondary_color || '#c9a86c'})` }}
              >
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-xl font-semibold">Eternize</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="absolute bottom-10 right-10 w-40 h-40 rounded-full blur-3xl"
            style={{ backgroundColor: wedding.theme_secondary_color || '#c9a86c' }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            <Gift className="w-4 h-4" />
            Lista de Presentes
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
            {wedding.partner1_name} & {wedding.partner2_name}
          </h1>
          {wedding.wedding_date && (
            <p className="text-lg text-muted-foreground mb-2">
              {formatDate(wedding.wedding_date)}
            </p>
          )}
          <p className="text-muted-foreground max-w-xl mx-auto">
            Sua presença é o nosso maior presente! Mas se quiser nos
            presentear, escolha algo especial para começarmos nossa nova vida juntos.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar presentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Gifts Grid */}
        <section>
          <h2 className="font-serif text-2xl font-semibold mb-6">
            Presentes Disponíveis
            <span className="text-muted-foreground font-normal text-lg ml-2">
              ({filteredGifts.length})
            </span>
          </h2>
          {filteredGifts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {gifts.length === 0
                  ? "A lista de presentes ainda está sendo preparada"
                  : "Nenhum presente encontrado"}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onSelect={() => setSelectedGift(gift)}
                  isInCart={cart.some((item) => item.gift.id === gift.id)}
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Gift Detail Modal */}
      {selectedGift && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedGift(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              {selectedGift.image_url ? (
                <img
                  src={selectedGift.image_url}
                  alt={selectedGift.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-gold-light/20 flex items-center justify-center">
                  <Gift className="w-16 h-16 text-primary/50" />
                </div>
              )}
              <button
                onClick={() => setSelectedGift(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-2xl font-semibold mb-2">
                {selectedGift.name}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedGift.description || "Presente especial para os noivos"}
              </p>
              <div className="flex items-center justify-between mb-6">
                <span
                  className="font-serif text-3xl font-semibold"
                  style={{ color: primaryColor }}
                >
                  {formatPrice(selectedGift.price)}
                </span>
                {selectedGift.quota_total && selectedGift.quota_total > 1 && (
                  <span className="text-sm text-muted-foreground">
                    ou {selectedGift.quota_total}x de{" "}
                    {formatPrice(selectedGift.price / selectedGift.quota_total)}
                  </span>
                )}
              </div>
              <Button
                onClick={() => addToCart(selectedGift)}
                className="w-full py-6 rounded-xl font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${wedding?.theme_secondary_color || '#c9a86c'})` }}
              >
                <Gift className="w-5 h-5 mr-2" />
                Presentear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="font-serif text-xl font-semibold">
                  Seus Presentes
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 hover:bg-muted rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Nenhum presente selecionado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Explore a lista e escolha algo especial
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.gift.id}
                        className="flex gap-4 p-4 bg-muted/50 rounded-xl"
                      >
                        {item.gift.image_url ? (
                          <img
                            src={item.gift.image_url}
                            alt={item.gift.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-gold-light/20 rounded-lg flex items-center justify-center">
                            <Gift className="w-8 h-8 text-primary/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {item.gift.name}
                          </h3>
                          <p style={{ color: primaryColor }} className="font-semibold">
                            {formatPrice(item.gift.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.gift.id)}
                          className="self-start p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 border-t bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-muted-foreground">Total</span>
                      <span
                        className="font-serif text-2xl font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        setIsCartOpen(false);
                        // Store cart in sessionStorage for checkout
                        sessionStorage.setItem(`cart_${customUrl}`, JSON.stringify(cart));
                        sessionStorage.setItem(`wedding_${customUrl}`, JSON.stringify(wedding));
                        navigate(`/c/${customUrl}/checkout`);
                      }}
                      className="w-full py-6 rounded-xl font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${wedding?.theme_secondary_color || '#c9a86c'})` }}
                    >
                      Finalizar Presente
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Pagamento seguro via PIX
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${wedding?.theme_secondary_color || '#c9a86c'})` }}
            >
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-serif text-lg font-semibold">Eternize</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Lista de presentes de {wedding.partner1_name} & {wedding.partner2_name}
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

function GiftCard({
  gift,
  onSelect,
  isInCart,
  primaryColor,
}: {
  gift: GiftItem;
  onSelect: () => void;
  isInCart: boolean;
  primaryColor: string;
}) {
  return (
    <button
      onClick={onSelect}
      className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-left group"
    >
      <div className="relative aspect-square overflow-hidden">
        {gift.image_url ? (
          <img
            src={gift.image_url}
            alt={gift.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center">
            <Gift className="w-16 h-16 text-primary/30" />
          </div>
        )}
        {isInCart && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        )}
        {gift.quota_total && gift.quota_total > 1 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
            {gift.quota_total}x sem juros
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {gift.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {gift.description || "Presente especial"}
        </p>
        <p className="font-serif text-xl font-semibold" style={{ color: primaryColor }}>
          {formatPrice(gift.price)}
        </p>
      </div>
    </button>
  );
}
