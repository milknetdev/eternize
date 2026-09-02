import { useEffect } from "react";
import { Link } from "react-router";
import {
  Heart,
  Sparkles,
  Users,
  Shield,
  Zap,
  Globe,
  Award,
  Target,
  Star,
  ArrowRight,
  MessageCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";

const values = [
  {
    icon: Heart,
    title: "Amor em Cada Detalhe",
    description: "Cada funcionalidade é pensada com carinho para tornar seu dia ainda mais especial.",
  },
  {
    icon: Zap,
    title: "Simplicidade",
    description: "Tecnologia que simplifica, não complica. Fácil de usar para todos.",
  },
  {
    icon: Shield,
    title: "Confiança",
    description: "Seus dados e momentos são tratados com total segurança e privacidade.",
  },
  {
    icon: Sparkles,
    title: "Excelência",
    description: "Buscamos a perfeição em cada pixel, em cada experiência.",
  },
];

const stats = [
  { value: "50.000+", label: "Casamentos realizados" },
  { value: "2M+", label: "Convidados conectados" },
  { value: "98%", label: "Casais satisfeitos" },
  { value: "27", label: "Estados atendidos" },
];

const team = [
  {
    name: "Ana Carolina",
    role: "Fundadora & CEO",
    bio: "Apaixonada por casamentos e tecnologia, Ana fundou o Eternize após organizar seu próprio casamento.",
    initial: "AC",
  },
  {
    name: "Rafael Santos",
    role: "CTO",
    bio: "Engenheiro de software com 15 anos de experiência, lidera a equipe técnica do Eternize.",
    initial: "RS",
  },
  {
    name: "Mariana Lima",
    role: "Head de Design",
    bio: "Designer premiada, responsável pela experiência visual elegante da plataforma.",
    initial: "ML",
  },
  {
    name: "Pedro Oliveira",
    role: "Head de Suporte",
    bio: "Especialista em atendimento ao cliente, garante que cada casal tenha a melhor experiência.",
    initial: "PO",
  },
];

const timeline = [
  {
    year: "2019",
    title: "O Início",
    description: "Eternize nasceu da necessidade de uma noiva que queria um site de casamento bonito e funcional.",
  },
  {
    year: "2020",
    title: "Primeiros 1.000 casais",
    description: "Mesmo na pandemia, ajudamos casais a manterem seus convidados informados sobre mudanças.",
  },
  {
    year: "2021",
    title: "Lista de Presentes",
    description: "Lançamos a lista de presentes com PIX integrado, revolucionando os presentes de casamento.",
  },
  {
    year: "2022",
    title: "RSVP Digital",
    description: "Confirmação de presença online com taxa de resposta 3x maior que convites tradicionais.",
  },
  {
    year: "2023",
    title: "50.000 Casamentos",
    description: "Alcançamos a marca de 50 mil casamentos eternizados em nossa plataforma.",
  },
  {
    year: "2024",
    title: "Nova Plataforma",
    description: "Redesign completo com templates exclusivos e experiência ainda mais personalizada.",
  },
];

export default function About() {
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

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-gold-light blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            Nossa História
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
            Eternizando momentos
            <span className="text-primary"> de amor</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Nascemos da paixão por celebrar o amor. Nossa missão é tornar cada casamento 
            único, memorável e perfeitamente organizado.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
                <Target className="w-4 h-4" />
                Nossa Missão
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Simplificar o planejamento, amplificar a emoção
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Acreditamos que planejar um casamento deve ser uma experiência prazerosa, 
                não estressante. Por isso, criamos ferramentas intuitivas que cuidam dos 
                detalhes técnicos enquanto você foca no que realmente importa: celebrar o amor.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cada funcionalidade do Eternize foi pensada a partir de conversas reais com 
                casais, entendendo suas dores e desejos. O resultado é uma plataforma que 
                parece ter sido feita especialmente para você.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 via-blush/50 to-champagne rounded-3xl p-8 lg:p-12">
                <blockquote className="font-serif text-2xl md:text-3xl italic text-center leading-relaxed">
                  "Cada amor tem sua história. Nós ajudamos você a contá-la."
                </blockquote>
                <div className="flex justify-center mt-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
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

      {/* Values */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
              <Lightbulb className="w-4 h-4" />
              Nossos Valores
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              O que nos guia
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Princípios que estão presentes em cada decisão que tomamos
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-border text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Nossa Jornada
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Uma história de crescimento
            </h2>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-gold-light to-primary/30" />
            
            {timeline.map((item, i) => (
              <div key={i} className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} pl-12 md:pl-0`}>
                  <div className={`bg-gradient-to-br from-cream to-blush/30 rounded-2xl p-6 border border-border inline-block ${i % 2 === 0 ? 'md:ml-auto' : ''}`}>
                    <span className="text-primary font-semibold text-sm">{item.year}</span>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-md" />
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Nossa Equipe
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Pessoas apaixonadas por amor
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma equipe dedicada a fazer seu casamento brilhar
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-border text-center hover:shadow-lg transition-shadow group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center text-white text-xl font-semibold group-hover:scale-105 transition-transform">
                  {member.initial}
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary/10 to-blush rounded-2xl p-6">
                  <Globe className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">100% Brasileiro</h4>
                  <p className="text-sm text-muted-foreground">Feito no Brasil, para brasileiros</p>
                </div>
                <div className="bg-gradient-to-br from-gold-light/20 to-champagne rounded-2xl p-6">
                  <MessageCircle className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Suporte Humano</h4>
                  <p className="text-sm text-muted-foreground">Atendimento real, não robôs</p>
                </div>
                <div className="bg-gradient-to-br from-blush to-cream rounded-2xl p-6">
                  <Shield className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Dados Seguros</h4>
                  <p className="text-sm text-muted-foreground">Privacidade em primeiro lugar</p>
                </div>
                <div className="bg-gradient-to-br from-champagne to-cream rounded-2xl p-6">
                  <Sparkles className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Sempre Evoluindo</h4>
                  <p className="text-sm text-muted-foreground">Novidades toda semana</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Por que mais de 50 mil casais escolheram o Eternize?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Somos mais do que uma plataforma de sites de casamento. Somos parceiros 
                na jornada mais importante da sua vida. Nossa equipe está sempre aqui 
                para ajudar, seja com uma dúvida técnica ou uma sugestão criativa.
              </p>
              <ul className="space-y-3">
                {[
                  "Atendimento humanizado em português",
                  "Plataforma intuitiva e fácil de usar",
                  "Templates exclusivos e personalizáveis",
                  "PIX integrado na lista de presentes",
                  "Atualizações constantes com novos recursos",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Faça parte da nossa história
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se aos milhares de casais que eternizaram seu amor conosco. 
            Crie seu site de casamento grátis e comece a planejar o dia mais especial da sua vida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro">
              <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-10 py-6 rounded-xl font-semibold text-lg">
                Criar Meu Site Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/demo/ana-e-joao">
              <Button variant="outline" className="px-10 py-6 rounded-xl font-medium text-lg border-2">
                Ver Demonstração
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
