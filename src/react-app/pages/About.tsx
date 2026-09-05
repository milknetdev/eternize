import { Link } from "react-router";
import {
  Heart,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Star,
  ArrowRight,
  MessageCircle,
  Lightbulb,
  Target,
  Check,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";

const values = [
  {
    icon: Heart,
    title: "Cuidado nos detalhes",
    description: "Cada tela foi pensada para deixar o site com a cara do casal, sem esforço.",
  },
  {
    icon: Zap,
    title: "Simples de usar",
    description: "Nada de manual. Você mexe, vê o resultado na hora e publica quando quiser.",
  },
  {
    icon: Shield,
    title: "Seus dados, seus",
    description: "Lista de convidados, mensagens e valores ficam só com você.",
  },
  {
    icon: Sparkles,
    title: "Sempre melhorando",
    description: "É um projeto vivo — feedback de quem usa vira recurso novo.",
  },
];

const facts = [
  { value: "33", label: "Templates prontos" },
  { value: "13", label: "Seções personalizáveis" },
  { value: "PIX", label: "Presentes em dinheiro" },
  { value: "R$ 0", label: "Para começar" },
];

const reasons = [
  { icon: Globe, title: "Brasileiro", text: "Feito aqui, em português, com PIX de verdade." },
  { icon: MessageCircle, title: "Suporte de gente", text: "Você fala com uma pessoa, não com um robô." },
  { icon: Shield, title: "Dados seguros", text: "Privacidade em primeiro lugar, sempre." },
  { icon: Sparkles, title: "Em evolução", text: "Recursos novos entram com frequência." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-gold-light blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            Sobre o Eternize
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
            Uma ferramenta simples
            <span className="text-primary"> para um dia enorme</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            O Eternize nasceu da bagunça de organizar um casamento de verdade — planilhas,
            grupos de WhatsApp, listas espalhadas. A ideia foi juntar tudo num lugar bonito e fácil.
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
                Por que existimos
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Menos parte chata, mais festa
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Planejar casamento não precisa ser estressante. A gente cuida da parte técnica —
                site no ar, confirmações organizadas, presentes com PIX — pra você focar no que importa.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cada recurso saiu de uma dor real de quem já passou por isso. Se algo te
                incomoda no produto, provavelmente incomoda a gente também.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 via-blush/50 to-champagne rounded-3xl p-8 lg:p-12">
                <blockquote className="font-serif text-2xl md:text-3xl italic text-center leading-relaxed">
                  "Cada amor tem sua história. A gente ajuda vocês a contá-la."
                </blockquote>
                <div className="flex justify-center mt-6 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="py-16 bg-gradient-to-r from-primary to-gold-light text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {facts.map((f) => (
              <div key={f.label} className="text-center">
                <p className="font-serif text-4xl md:text-5xl font-semibold mb-2">{f.value}</p>
                <p className="text-white/80">{f.label}</p>
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
              O que nos guia
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Nossos princípios</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Presentes em cada decisão sobre o produto
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-6 border border-border text-center hover:shadow-lg transition-shadow"
              >
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

      {/* Who's behind it */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Quem faz
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Um projeto pequeno e independente
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            O Eternize é tocado por um time enxuto, brasileiro, de gente que já viveu a
            maratona de organizar um casamento. Não tem call center nem script — quando
            você escreve, é uma pessoa que responde. É assim que a gente gosta.
          </p>
        </div>
      </section>

      {/* Why Eternize */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              {reasons.map((r) => (
                <div key={r.title} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
                  <r.icon className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">{r.title}</h4>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Por que o Eternize
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Mais do que um gerador de site, é um lugar pra acompanhar o casamento inteiro
                sem perder o fio da meada — e sem pagar nada pra experimentar.
              </p>
              <ul className="space-y-3">
                {[
                  "Atendimento humano, em português",
                  "Editor simples, resultado na hora",
                  "33 templates com estilos diferentes",
                  "Lista de presentes com PIX integrado",
                  "Grátis pra começar, sem cartão",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Bora começar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Crie seu site de casamento de graça e monte tudo no seu ritmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro">
              <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-10 py-6 rounded-xl font-semibold text-lg">
                Criar meu site grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant="outline" className="px-10 py-6 rounded-xl font-medium text-lg border-2">
                Ver templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
