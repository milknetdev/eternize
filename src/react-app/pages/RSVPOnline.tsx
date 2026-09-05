import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Mail,
  Check,
  Users,
  Utensils,
  ArrowRight,
  Clock,
  Bell,
  BarChart3,
  Smartphone,
  Globe,
  Shield,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  XCircle,
  UserPlus,
  Send,
  Gift,
  Share2,
  Copy,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import MoreFeatures from "@/react-app/components/marketing/MoreFeatures";

const benefits = [
  {
    icon: Clock,
    title: "Confirmação Instantânea",
    description: "Receba as confirmações em tempo real, sem esperar pelo correio.",
  },
  {
    icon: BarChart3,
    title: "Controle Total",
    description: "Acompanhe quem confirmou, quantos acompanhantes e restrições alimentares.",
  },
  {
    icon: Bell,
    title: "Lembretes Automáticos",
    description: "Envie lembretes para quem ainda não respondeu com um clique.",
  },
  {
    icon: Smartphone,
    title: "Funciona em Qualquer Dispositivo",
    description: "Seus convidados confirmam do celular, tablet ou computador.",
  },
];

const features = [
  {
    icon: Users,
    title: "Gestão de Acompanhantes",
    description: "Saiba exatamente quantas pessoas virão, incluindo acompanhantes e crianças.",
  },
  {
    icon: Utensils,
    title: "Restrições Alimentares",
    description: "Colete informações sobre alergias e preferências alimentares dos convidados.",
  },
  {
    icon: MessageSquare,
    title: "Mensagens dos Convidados",
    description: "Receba mensagens carinhosas junto com as confirmações de presença.",
  },
  {
    icon: Globe,
    title: "Link Personalizado",
    description: "Compartilhe um link único para seu casamento: eternize.com/c/seu-casamento",
  },
  {
    icon: Shield,
    title: "Dados Protegidos",
    description: "Informações dos seus convidados armazenadas com segurança e privacidade.",
  },
  {
    icon: Send,
    title: "Integração com Convites",
    description: "Adicione o link do RSVP diretamente nos seus convites digitais.",
  },
];

const stats = [
  { value: "Pelo celular", label: "Confirma em segundos" },
  { value: "2 min", label: "Tempo médio para confirmar" },
  { value: "0", label: "Papel desperdiçado" },
  { value: "24/7", label: "Disponível sempre" },
];

const mockGuests = [
  { name: "Maria Silva", status: "confirmed", guests: 2, message: "Mal posso esperar! 💕" },
  { name: "João Santos", status: "confirmed", guests: 1, message: "Estarei lá com certeza!" },
  { name: "Ana Oliveira", status: "pending", guests: 0, message: "" },
  { name: "Pedro Costa", status: "confirmed", guests: 3, message: "Muito feliz por vocês!" },
  { name: "Carla Lima", status: "declined", guests: 0, message: "Infelizmente não poderei ir 😢" },
];

export default function RSVPOnline() {
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const confirmedCount = mockGuests.filter((g) => g.status === "confirmed").length;
  const totalGuests = mockGuests
    .filter((g) => g.status === "confirmed")
    .reduce((sum, g) => sum + g.guests, 0);

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-gold-light blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Mail className="w-4 h-4" />
                RSVP Digital
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
                Confirmações de
                <span className="text-primary"> presença online</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Esqueça os cartões de resposta pelo correio. Com o RSVP digital do Eternize, 
                seus convidados confirmam em segundos e você acompanha tudo em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/cadastro">
                  <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-8 py-6 rounded-xl font-semibold text-lg w-full sm:w-auto">
                    Criar Meu RSVP
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

            {/* Interactive Demo */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Confirmações</p>
                      <p className="text-sm text-muted-foreground">Ana & João</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-serif font-semibold text-primary">{confirmedCount}/{mockGuests.length}</p>
                    <p className="text-xs text-muted-foreground">confirmados</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-gold-light rounded-full transition-all duration-500"
                    style={{ width: `${(confirmedCount / mockGuests.length) * 100}%` }}
                  />
                </div>

                {/* Guest list */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {mockGuests.map((guest, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                        demoStep === i % 3 ? "bg-primary/5 scale-[1.02]" : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          guest.status === "confirmed"
                            ? "bg-green-100"
                            : guest.status === "declined"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                        }`}>
                          {guest.status === "confirmed" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : guest.status === "declined" ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{guest.name}</p>
                          {guest.status === "confirmed" && (
                            <p className="text-xs text-muted-foreground">{guest.guests} pessoa(s)</p>
                          )}
                        </div>
                      </div>
                      {guest.message && (
                        <div className="text-xs text-muted-foreground max-w-24 truncate">
                          "{guest.message}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de convidados</p>
                    <p className="font-serif text-xl font-semibold">{totalGuests} pessoas</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Lembrete
                  </Button>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 animate-bounce">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Agora</p>
                  <p className="text-sm font-semibold text-green-600">+1 confirmou!</p>
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
              Por que usar RSVP online?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simplifique a confirmação de presença e tenha controle total dos seus convidados
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
              Em 3 passos simples seus convidados confirmam presença
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <Globe className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Compartilhe o link</h3>
              <p className="text-muted-foreground">
                Adicione o link do RSVP nos convites ou envie pelo WhatsApp para seus convidados.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <Check className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Convidados confirmam</h3>
              <p className="text-muted-foreground">
                Em poucos cliques eles informam presença, acompanhantes e restrições alimentares.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <BarChart3 className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Acompanhe em tempo real</h3>
              <p className="text-muted-foreground">
                Veja todas as confirmações no seu painel, com estatísticas e relatórios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Form Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Formulário elegante e simples
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Seus convidados veem um formulário bonito que combina com o tema do seu 
                casamento. Simples de preencher, sem complicações.
              </p>
              <ul className="space-y-4">
                {[
                  "Confirmação de presença com um toque",
                  "Seleção de número de acompanhantes",
                  "Campo para restrições alimentares",
                  "Espaço para mensagem aos noivos",
                  "Design responsivo para celular",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form Preview */}
            <div className="bg-gradient-to-b from-cream to-blush/30 rounded-3xl p-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-border/50">
                <div className="text-center mb-6">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-serif text-2xl font-medium mb-1">Confirme sua Presença</h3>
                  <p className="text-sm text-muted-foreground">Casamento de Ana & João</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo</label>
                    <div className="px-4 py-3 rounded-lg bg-muted/50 border border-border text-muted-foreground">
                      Maria Silva
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Você poderá comparecer?</label>
                    <div className="flex gap-3">
                      <div className="flex-1 py-3 px-4 rounded-xl border-2 border-primary bg-primary/10 text-primary text-center">
                        <Check className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">Sim!</span>
                      </div>
                      <div className="flex-1 py-3 px-4 rounded-xl border-2 border-border text-center">
                        <span className="block text-xl mb-1">😢</span>
                        <span className="text-sm font-medium">Não poderei</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Acompanhantes</label>
                      <div className="px-4 py-3 rounded-lg bg-muted/50 border border-border text-center">
                        2 pessoas
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Restrições</label>
                      <div className="px-4 py-3 rounded-lg bg-muted/50 border border-border text-muted-foreground truncate">
                        Vegetariano
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-primary to-gold-light text-white rounded-full py-5">
                    Confirmar Presença
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Recursos inclusos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar as confirmações do seu casamento
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift List Integration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Gift List Preview Card */}
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-[#FDF8F5] to-[#F9F0E8] rounded-3xl p-8 relative">
                <div className="absolute -top-3 -right-3 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                  Novo!
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-border/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-gold-light/20 flex items-center justify-center">
                      <Gift className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl font-medium">Lista de Presentes</h4>
                      <p className="text-sm text-muted-foreground">Ana & João</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { name: "Jogo de Panelas", price: "R$ 450,00", progress: 75 },
                      { name: "Cafeteira Expresso", price: "R$ 890,00", progress: 40 },
                      { name: "Jogo de Toalhas", price: "R$ 280,00", progress: 100 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-gold-light rounded-full"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{item.progress}%</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-primary">{item.price}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                    <Share2 className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs text-green-700">Link para compartilhar:</p>
                      <p className="text-sm font-medium text-green-800 truncate">eternize.com/c/ana-e-joao/presentes</p>
                    </div>
                    <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                      <Copy className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Gift className="w-4 h-4" />
                Lista de Presentes
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Integração com Lista de Presentes
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Após confirmar presença, seus convidados podem acessar sua lista de presentes 
                diretamente. Quem não comprou na hora da confirmação? Sem problemas! 
                Compartilhe o link da lista a qualquer momento.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Link da lista aparece após confirmar presença",
                  "Compartilhe o link com quem ainda não presenteou",
                  "Cartões personalizados acompanham cada presente",
                  "Receba contribuições via PIX diretamente",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/presentes">
                <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-6 py-5 rounded-xl font-semibold">
                  Conhecer Lista de Presentes
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Pronto para simplificar suas confirmações?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Crie seu RSVP online gratuitamente e comece a receber confirmações hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro">
              <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-10 py-6 rounded-xl font-semibold text-lg">
                Criar Meu RSVP Grátis
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Incluso em todos os planos • Configure em minutos
          </p>
        </div>
      </section>

      <MoreFeatures current="rsvp" />

      <Footer />
    </div>
  );
}
