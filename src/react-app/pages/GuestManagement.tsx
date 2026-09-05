import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  Tag,
  Table2,
  Bell,
  FileSpreadsheet,
  Sparkles,
  Shield,
  Zap,
  Heart,
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

const benefits = [
  {
    icon: Zap,
    title: "Adicione em Segundos",
    description: "Cadastre convidados manualmente ou importe de uma planilha.",
  },
  {
    icon: BarChart3,
    title: "Acompanhe Tudo",
    description: "Veja quem confirmou, quem recusou e quem ainda não respondeu.",
  },
  {
    icon: Tag,
    title: "Organize por Grupos",
    description: "Separe por família, amigos, trabalho ou crie categorias personalizadas.",
  },
  {
    icon: Table2,
    title: "Planeje as Mesas",
    description: "Organize a disposição dos convidados nas mesas do evento.",
  },
];

const features = [
  {
    icon: Upload,
    title: "Importação de Planilha",
    description: "Importe sua lista de convidados de Excel ou Google Sheets em um clique.",
  },
  {
    icon: Download,
    title: "Exportação de Dados",
    description: "Exporte relatórios completos para compartilhar com fornecedores.",
  },
  {
    icon: Bell,
    title: "Lembretes Automáticos",
    description: "Envie lembretes para quem ainda não confirmou presença.",
  },
  {
    icon: Filter,
    title: "Filtros Avançados",
    description: "Filtre por status, grupo, restrição alimentar e muito mais.",
  },
  {
    icon: Shield,
    title: "Dados Protegidos",
    description: "Informações dos convidados armazenadas com total segurança.",
  },
  {
    icon: FileSpreadsheet,
    title: "Relatórios Detalhados",
    description: "Gere relatórios para buffet, cerimonial e outros fornecedores.",
  },
];

const stats = [
  { value: "Sem limite", label: "De convidados" },
  { value: "Adeus", label: "Planilhas soltas" },
  { value: "100%", label: "Organizado" },
  { value: "0", label: "Convidados esquecidos" },
];

const mockGuests = [
  { name: "Maria Silva", email: "maria@email.com", phone: "(11) 99999-1234", group: "Família Noiva", status: "confirmed", guests: 2 },
  { name: "João Santos", email: "joao@email.com", phone: "(11) 99999-5678", group: "Amigos", status: "confirmed", guests: 1 },
  { name: "Ana Oliveira", email: "ana@email.com", phone: "(11) 99999-9012", group: "Trabalho", status: "pending", guests: 0 },
  { name: "Pedro Costa", email: "pedro@email.com", phone: "(11) 99999-3456", group: "Família Noivo", status: "confirmed", guests: 3 },
  { name: "Carla Lima", email: "carla@email.com", phone: "(11) 99999-7890", group: "Amigos", status: "declined", guests: 0 },
];

const groupColors: Record<string, string> = {
  "Família Noiva": "bg-pink-100 text-pink-700",
  "Família Noivo": "bg-blue-100 text-blue-700",
  "Amigos": "bg-green-100 text-green-700",
  "Trabalho": "bg-purple-100 text-purple-700",
};

export default function GuestManagement() {
  const confirmedCount = mockGuests.filter((g) => g.status === "confirmed").length;
  const pendingCount = mockGuests.filter((g) => g.status === "pending").length;
  const declinedCount = mockGuests.filter((g) => g.status === "declined").length;
  const totalPeople = mockGuests
    .filter((g) => g.status === "confirmed")
    .reduce((sum, g) => sum + g.guests, 0);

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <HeroBg />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal immediate>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                Gestão Inteligente
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
                Todos os seus
                <span className="text-primary"> convidados</span> em um só lugar
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Chega de planilhas confusas e listas perdidas. Organize seus convidados, 
                acompanhe confirmações e planeje mesas com facilidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <CtaButton to="/cadastro" withArrow>
                  Começar a Organizar
                </CtaButton>
                <CtaButton to="/demo/ana-e-joao" variant="outline">
                  Ver Demonstração
                </CtaButton>
              </div>
            </Reveal>

            {/* Guest List Preview */}
            <Reveal immediate delay={0.1} className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Lista de Convidados</h3>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <Upload className="w-3 h-3 mr-1" />
                        Importar
                      </Button>
                      <Button size="sm" className="h-8 bg-primary">
                        <UserPlus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar convidados..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-white"
                        readOnly
                      />
                    </div>
                    <Button size="sm" variant="outline" className="h-9">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 p-4 bg-muted/20">
                  <div className="text-center p-2 rounded-lg bg-white">
                    <p className="text-lg font-semibold">{mockGuests.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-green-50">
                    <p className="text-lg font-semibold text-green-600">{confirmedCount}</p>
                    <p className="text-xs text-green-600">Confirmados</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-yellow-50">
                    <p className="text-lg font-semibold text-yellow-600">{pendingCount}</p>
                    <p className="text-xs text-yellow-600">Pendentes</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-red-50">
                    <p className="text-lg font-semibold text-red-500">{declinedCount}</p>
                    <p className="text-xs text-red-500">Recusaram</p>
                  </div>
                </div>

                {/* Guest List */}
                <div className="divide-y max-h-64 overflow-y-auto">
                  {mockGuests.map((guest, i) => (
                    <div key={i} className="p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
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
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {guest.email}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${groupColors[guest.group]}`}>
                            {guest.group}
                          </span>
                          {guest.status === "confirmed" && (
                            <p className="text-xs text-muted-foreground mt-1">{guest.guests} pessoa(s)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{totalPeople} pessoas confirmadas</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 animate-bounce">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Agora</p>
                  <p className="text-sm font-semibold text-green-600">+12 importados!</p>
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
            icon={Users}
            eyebrow="Fim das planilhas soltas"
            title="Organize seu casamento com facilidade"
            subtitle="Ferramentas pensadas para simplificar o planejamento do seu grande dia"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <Reveal key={i} delay={i * 0.05} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
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

      {/* How it Works */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            eyebrow="Simples assim"
            title="Como funciona?"
            subtitle="Em poucos passos você tem total controle da sua lista"
          />
          <div className="grid md:grid-cols-3 gap-8">
            <Reveal className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <UserPlus className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Adicione seus convidados</h3>
              <p className="text-muted-foreground">
                Cadastre manualmente ou importe de uma planilha Excel ou Google Sheets.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <Tag className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Organize por grupos</h3>
              <p className="text-muted-foreground">
                Separe família, amigos e colegas de trabalho para facilitar o gerenciamento.
              </p>
            </Reveal>
            <Reveal delay={0.16} className="bg-white rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <BarChart3 className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Acompanhe em tempo real</h3>
              <p className="text-muted-foreground">
                Veja estatísticas de confirmação e exporte relatórios para fornecedores.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Import Feature */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Importe sua lista em segundos
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Já tem uma lista de convidados em planilha? Importe diretamente para o Eternize 
                e comece a gerenciar sem perder tempo digitando nome por nome.
              </p>
              <ul className="space-y-4">
                {[
                  "Suporte a Excel (.xlsx) e CSV",
                  "Mapeamento automático de colunas",
                  "Detecta emails e telefones automaticamente",
                  "Agrupa por sobrenome ou família",
                  "Remove duplicatas automaticamente",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Import Preview */}
            <div className="bg-gradient-to-b from-cream to-blush/30 rounded-3xl p-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-border/50">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Importar Planilha</h3>
                  <p className="text-sm text-muted-foreground">Arraste seu arquivo ou clique para selecionar</p>
                </div>

                <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-primary/5 mb-4">
                  <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">convidados.xlsx</p>
                  <p className="text-xs text-primary font-medium mt-1">156 convidados encontrados</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="font-medium">Coluna A ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">Coluna B ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Telefone</span>
                    <span className="font-medium">Coluna C ✓</span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-gold-light text-white rounded-full py-5">
                  Importar 156 Convidados
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            icon={Sparkles}
            eyebrow="Recursos"
            title="Recursos completos"
            subtitle="Tudo que você precisa para gerenciar seus convidados com eficiência"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Reveal key={i} delay={(i % 3) * 0.05} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ClosingCTA
        title="Pronto para organizar seus convidados?"
        sub="Crie sua conta gratuita e comece a gerenciar sua lista de convidados hoje mesmo."
        primaryLabel="Criar minha lista grátis"
        note="Incluso em todos os planos · importe sua planilha em segundos"
        secondaryTo="/demo/ana-e-joao"
        secondaryLabel="Ver demonstração"
      />

      <MoreFeatures current="convidados" />

      <Footer />
    </div>
  );
}
