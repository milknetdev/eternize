import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Search,
  Gift,
  ChefHat,
  Bed,
  Sofa,
  Bath,
  Tv,
  Plane,
  Wallet,
  Sparkles,
  Check,
  ArrowRight,
  CreditCard,
  Shield,
  Banknote,
  QrCode,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import { gifts, categories, formatPrice, type Gift as GiftType } from "@/data/gifts";

const iconMap: Record<string, React.ElementType> = {
  Gift,
  ChefHat,
  Bed,
  Sofa,
  Bath,
  Tv,
  Plane,
  Wallet,
};

const benefits = [
  {
    icon: QrCode,
    title: "Pagamento via PIX",
    description: "Seus convidados pagam de forma instantânea e segura pelo PIX, sem taxas extras.",
  },
  {
    icon: Banknote,
    title: "Converta em Dinheiro",
    description: "Receba o valor dos presentes diretamente na sua conta, quando quiser.",
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Plataforma protegida com criptografia e sistema antifraude.",
  },
  {
    icon: CreditCard,
    title: "Sem Taxas Abusivas",
    description: "Taxa única de apenas 3.5% sobre os valores recebidos.",
  },
];

const stats = [
  { value: "R$ 2M+", label: "Em presentes movimentados" },
  { value: "15K+", label: "Casais atendidos" },
  { value: "98%", label: "Satisfação dos noivos" },
  { value: "0%", label: "Fraudes registradas" },
];

export default function GiftCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredGifts = gifts.filter((gift) => {
    const matchesCategory =
      selectedCategory === "all" || gift.category === selectedCategory;
    const matchesSearch =
      gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gift.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularGifts = gifts.filter((g) => g.isPopular);

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-gold-light blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Gift className="w-4 h-4" />
                Lista de Presentes Inteligente
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
                Presentes que viram
                <span className="text-primary"> dinheiro</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Crie sua lista de presentes e converta tudo em dinheiro para realizar 
                seus sonhos. Seus convidados escolhem o presente, pagam via PIX e você 
                recebe o valor na sua conta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/cadastro">
                  <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-8 py-6 rounded-xl font-semibold text-lg w-full sm:w-auto">
                    Criar Minha Lista
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/demo/ana-e-joao">
                  <Button variant="outline" className="px-8 py-6 rounded-xl font-medium text-lg w-full sm:w-auto border-2">
                    Ver Demonstração
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Lista de Ana & João</p>
                    <p className="text-sm text-muted-foreground">32 presentes • R$ 18.450</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {popularGifts.slice(0, 3).map((gift) => (
                    <div key={gift.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <img
                        src={gift.image}
                        alt={gift.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{gift.name}</p>
                        <p className="text-primary font-semibold text-sm">{formatPrice(gift.price)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total recebido</p>
                    <p className="font-serif text-2xl font-semibold text-primary">R$ 8.750</p>
                  </div>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    <Banknote className="w-4 h-4 mr-2" />
                    Sacar
                  </Button>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 animate-bounce">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                  <p className="text-sm font-semibold text-green-600">+R$ 450</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Convidados</p>
                  <p className="text-sm font-semibold">23 presentearam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Por que escolher nossa lista?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A forma mais moderna e prática de receber presentes de casamento
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-primary to-gold-light text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-serif text-4xl md:text-5xl font-semibold mb-2">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Como funciona?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Em 3 passos simples você cria sua lista e começa a receber
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <Gift className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Crie sua lista</h3>
              <p className="text-muted-foreground">
                Escolha presentes do nosso catálogo ou adicione itens personalizados com valores livres.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <QrCode className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Compartilhe</h3>
              <p className="text-muted-foreground">
                Envie o link da sua lista para os convidados. Eles escolhem e pagam via PIX instantâneo.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <Banknote className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Receba em dinheiro</h3>
              <p className="text-muted-foreground">
                Converta os presentes em dinheiro e saque direto para sua conta quando quiser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Catalog Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Explore nosso catálogo
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Centenas de opções de presentes para todos os gostos e bolsos
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar presentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => {
                const Icon = iconMap[category.icon] || Gift;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-muted border border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Section */}
          {selectedCategory === "all" && !searchQuery && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-2xl font-semibold">Mais Populares</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularGifts.slice(0, 4).map((gift) => (
                  <GiftCard key={gift.id} gift={gift} />
                ))}
              </div>
            </div>
          )}

          {/* All Gifts */}
          <div>
            <h3 className="font-serif text-2xl font-semibold mb-6">
              {selectedCategory === "all"
                ? "Todos os Presentes"
                : categories.find((c) => c.id === selectedCategory)?.name}
              <span className="text-muted-foreground font-normal text-lg ml-2">
                ({filteredGifts.length})
              </span>
            </h3>
            {filteredGifts.length === 0 ? (
              <div className="text-center py-16 bg-muted/50 rounded-2xl border border-border">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum presente encontrado</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGifts.slice(0, 8).map((gift) => (
                  <GiftCard key={gift.id} gift={gift} />
                ))}
              </div>
            )}
          </div>

          {/* View More CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              E muito mais! Crie sua conta para acessar o catálogo completo.
            </p>
            <Link to="/cadastro">
              <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-8 py-6 rounded-xl font-semibold">
                Criar Minha Lista Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Pronto para criar sua lista?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de casais que já estão usando o Eternize para 
            receber presentes de forma moderna e prática.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro">
              <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-10 py-6 rounded-xl font-semibold text-lg">
                Começar Agora — É Grátis
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Não precisa de cartão de crédito • Configure em minutos
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function GiftCard({ gift }: { gift: GiftType }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={gift.image}
          alt={gift.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {gift.isPopular && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Popular
          </div>
        )}
        {gift.quota && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
            {gift.quota}x sem juros
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-medium mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {gift.name}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {gift.description}
        </p>
        <p className="font-serif text-xl font-semibold text-primary">
          {formatPrice(gift.price)}
        </p>
      </div>
    </div>
  );
}
