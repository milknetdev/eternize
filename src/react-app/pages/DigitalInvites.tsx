import { useState } from "react";
import {
  Mail,
  Send,
  Palette,
  Smartphone,
  Share2,
  Heart,
  Check,
  QrCode,
  MessageCircle,
  Bell,
  Users,
  Zap,
  Globe,
  Edit3,
  Eye,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import MoreFeatures from "@/react-app/components/marketing/MoreFeatures";
import {
  HeroBg,
  Reveal,
  SectionHeading,
  CtaButton,
  ClosingCTA,
} from "@/react-app/components/marketing/kit";

const inviteStyles = [
  { id: "classic", name: "Clássico", colors: ["#D4AF37", "#FFF8E7", "#2C1810"] },
  { id: "modern", name: "Moderno", colors: ["#1a1a2e", "#eaeaea", "#e94560"] },
  { id: "romantic", name: "Romântico", colors: ["#f8b4c4", "#fff5f7", "#8b5a5a"] },
  { id: "rustic", name: "Rústico", colors: ["#8B7355", "#F5F0E6", "#4A3728"] },
];

const benefits = [
  {
    icon: Zap,
    title: "Envio Instantâneo",
    description: "Seus convites chegam em segundos, não semanas.",
  },
  {
    icon: Globe,
    title: "Ecologicamente Correto",
    description: "Zero papel, zero desperdício. Casamento sustentável.",
  },
  {
    icon: Bell,
    title: "Confirmação Automática",
    description: "Convidados confirmam direto pelo convite.",
  },
  {
    icon: Edit3,
    title: "Edite a Qualquer Momento",
    description: "Mudou algo? Atualize o convite instantaneamente.",
  },
];

const features = [
  { icon: Palette, title: "Templates variados", desc: "Designs exclusivos para cada estilo" },
  { icon: Edit3, title: "Personalização Total", desc: "Cores, fontes e textos customizáveis" },
  { icon: QrCode, title: "QR Code", desc: "Acesso rápido ao site do casamento" },
  { icon: MessageCircle, title: "RSVP Integrado", desc: "Confirmação direto no convite" },
  { icon: Share2, title: "Fácil Compartilhar", desc: "WhatsApp, email ou link direto" },
  { icon: Eye, title: "Visualização Prévia", desc: "Veja como ficará antes de enviar" },
];

const stats = [
  { value: "WhatsApp", label: "Envio direto" },
  { value: "Link único", label: "Por convidado" },
  { value: "1 clique", label: "Para confirmar" },
  { value: "R$ 0", label: "Custo de envio" },
];

export default function DigitalInvites() {
  const [selectedStyle, setSelectedStyle] = useState("classic");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSendDemo = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  const currentStyle = inviteStyles.find(s => s.id === selectedStyle)!;

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <HeroBg />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal immediate>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Mail className="w-4 h-4" />
                Convites Digitais
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
                Convites <span className="text-primary">elegantes</span> e sustentáveis
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Surpreenda seus convidados com convites digitais personalizados. 
                Envio instantâneo, confirmação automática e zero desperdício de papel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <CtaButton to="/cadastro" withArrow>
                  Criar Meus Convites
                </CtaButton>
                <CtaButton to="/templates" variant="outline">
                  Ver Templates
                </CtaButton>
              </div>
            </Reveal>

            {/* Demo Invite */}
            <Reveal immediate delay={0.1} className="relative">
              <div 
                className="rounded-3xl shadow-2xl p-8 border-2 transition-all duration-500"
                style={{ 
                  backgroundColor: currentStyle.colors[1],
                  borderColor: currentStyle.colors[0]
                }}
              >
                {/* Invite Content */}
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${currentStyle.colors[0]}20` }}
                  >
                    <Heart 
                      className="w-8 h-8" 
                      style={{ color: currentStyle.colors[0] }}
                    />
                  </div>
                  <p 
                    className="text-sm font-medium mb-2 uppercase tracking-widest"
                    style={{ color: currentStyle.colors[2] }}
                  >
                    Você está convidado para
                  </p>
                  <h2 
                    className="text-4xl mb-4"
                    style={{ 
                      fontFamily: "'Great Vibes', cursive",
                      color: currentStyle.colors[0]
                    }}
                  >
                    Ana & João
                  </h2>
                  <div 
                    className="w-24 h-0.5 mx-auto mb-4"
                    style={{ backgroundColor: currentStyle.colors[0] }}
                  />
                  <p 
                    className="text-lg font-medium mb-1"
                    style={{ color: currentStyle.colors[2] }}
                  >
                    15 de Março de 2026
                  </p>
                  <p 
                    className="text-sm mb-6"
                    style={{ color: `${currentStyle.colors[2]}99` }}
                  >
                    às 16h • Fazenda Santa Clara • São Paulo
                  </p>
                  <button
                    onClick={handleSendDemo}
                    className="px-6 py-3 rounded-full font-medium text-white transition-all hover:scale-105"
                    style={{ backgroundColor: currentStyle.colors[0] }}
                  >
                    {isAnimating ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Enviado!
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Confirmar Presença
                      </span>
                    )}
                  </button>
                </div>

                {/* QR Code */}
                <div className="mt-6 pt-6 border-t flex items-center justify-center gap-3" style={{ borderColor: `${currentStyle.colors[0]}30` }}>
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${currentStyle.colors[0]}10` }}
                  >
                    <QrCode className="w-6 h-6" style={{ color: currentStyle.colors[0] }} />
                  </div>
                  <span className="text-sm" style={{ color: `${currentStyle.colors[2]}80` }}>
                    Escaneie para acessar o site
                  </span>
                </div>
              </div>

              {/* Style Selector */}
              <div className="mt-6 flex items-center justify-center gap-3">
                {inviteStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                      selectedStyle === style.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-white hover:border-primary/50'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: style.colors[0] }}
                    />
                    <span className="text-sm font-medium">{style.name}</span>
                  </button>
                ))}
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3 animate-bounce">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Agora</p>
                  <p className="text-sm font-semibold text-green-600">João confirmou!</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            icon={Mail}
            eyebrow="Papel? Só se você quiser"
            title="Por que escolher convites digitais?"
            subtitle="Modernize seu casamento com convites que impressionam"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <Reveal key={i} delay={i * 0.05} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Reveal>
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

      {/* How It Works */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            eyebrow="Rápido"
            title="Crie e envie em minutos"
            subtitle="Processo simples para convites incríveis"
          />
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Escolha o Template", desc: "Selecione um dos designs exclusivos para o seu estilo." },
              { step: 2, title: "Personalize", desc: "Adicione seus nomes, data, local e escolha as cores perfeitas." },
              { step: 3, title: "Visualize", desc: "Veja exatamente como seu convite ficará antes de enviar." },
              { step: 4, title: "Envie", desc: "Compartilhe por WhatsApp, email ou gere um link único." },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.05} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-border text-center hover:shadow-lg transition-shadow h-full">
                  <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-gold-light text-white flex items-center justify-center font-semibold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeading
            eyebrow="Comparativo"
            title="Digital vs. Tradicional"
            subtitle="Veja por que os convites digitais são a escolha inteligente"
          />
          <div className="grid md:grid-cols-2 gap-8">
            {/* Digital */}
            <div className="bg-gradient-to-br from-primary/5 via-blush/30 to-champagne rounded-2xl p-8 border-2 border-primary">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Convite Digital</h3>
                  <p className="text-sm text-primary font-medium">Recomendado</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Entrega instantânea",
                  "Custo zero de envio",
                  "Confirmação automática",
                  "Atualizações em tempo real",
                  "100% sustentável",
                  "Rastreamento de visualizações",
                  "Link para o site do casamento",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Traditional */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gray-300 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-600">Convite Tradicional</h3>
                  <p className="text-sm text-gray-400">Método antigo</p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-500">
                {[
                  "Semanas para produção e entrega",
                  "Alto custo com gráfica e correios",
                  "Confirmação manual por telefone",
                  "Erros não podem ser corrigidos",
                  "Papel descartado após o evento",
                  "Sem controle de quem recebeu",
                  "Informações limitadas",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-400">—</span>
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            icon={Palette}
            eyebrow="Recursos"
            title="Recursos completos"
            subtitle="Tudo que você precisa para criar convites perfeitos"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Reveal key={i} delay={(i % 3) * 0.05} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sharing Options */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
                <Share2 className="w-4 h-4" />
                Compartilhamento Fácil
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Envie do jeito que preferir
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Seus convites podem ser compartilhados de várias formas. Escolha a 
                que funciona melhor para cada convidado — seja por WhatsApp, email, 
                redes sociais ou um link direto.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "WhatsApp", color: "bg-green-500" },
                  { name: "Email", color: "bg-blue-500" },
                  { name: "Instagram", color: "bg-pink-500" },
                  { name: "Link Direto", color: "bg-primary" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-border">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 via-blush/30 to-champagne rounded-3xl p-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Lista de Convidados</p>
                    <p className="text-sm text-muted-foreground">150 convidados</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Família da Noiva", count: 45, sent: true },
                    { name: "Família do Noivo", count: 42, sent: true },
                    { name: "Amigos", count: 38, sent: false },
                    { name: "Trabalho", count: 25, sent: false },
                  ].map((group, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{group.name}</span>
                        <span className="text-xs text-muted-foreground">({group.count})</span>
                      </div>
                      {group.sent ? (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Enviado
                        </span>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Enviar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClosingCTA
        title="Comece a criar seus convites"
        sub="Impressione seus convidados com convites digitais elegantes e modernos. Crie gratuitamente e envie em minutos."
        primaryLabel="Criar meus convites grátis"
        secondaryTo="/templates"
        secondaryLabel="Ver templates"
      />

      <MoreFeatures current="convites" />

      <Footer />
    </div>
  );
}
