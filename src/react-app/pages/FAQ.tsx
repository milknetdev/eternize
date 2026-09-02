import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  HelpCircle,
  ChevronDown,
  Search,
  CreditCard,
  Gift,
  Users,
  Settings,
  Camera,
  Mail,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    id: "geral",
    name: "Geral",
    icon: HelpCircle,
    items: [
      {
        question: "O que é o Eternize?",
        answer: "O Eternize é uma plataforma completa para criar sites de casamento personalizados. Com ele, você pode criar um site elegante com lista de presentes, confirmação de presença (RSVP), galeria de fotos, convites digitais e muito mais — tudo em um só lugar."
      },
      {
        question: "Preciso ter conhecimento técnico para usar?",
        answer: "Não! O Eternize foi criado para ser fácil de usar. Você não precisa saber programar ou ter experiência com criação de sites. Basta escolher um template, personalizar com suas informações e publicar."
      },
      {
        question: "Posso usar o Eternize gratuitamente?",
        answer: "Sim! Oferecemos um plano gratuito que inclui as funcionalidades essenciais: site personalizado, lista de presentes, RSVP online e galeria de fotos. Para recursos avançados como domínio personalizado e templates premium, oferecemos planos pagos."
      },
      {
        question: "Quanto tempo leva para criar meu site?",
        answer: "Você pode ter seu site pronto em menos de 15 minutos! Basta escolher um template, adicionar suas informações (data, local, história do casal) e personalizar as cores. É rápido e simples."
      },
      {
        question: "Por quanto tempo meu site fica no ar?",
        answer: "Seu site permanece ativo por 1 ano após a data do casamento. Assim, você e seus convidados podem acessar as fotos e memórias mesmo depois do grande dia."
      },
    ]
  },
  {
    id: "presentes",
    name: "Lista de Presentes",
    icon: Gift,
    items: [
      {
        question: "Como funciona a lista de presentes?",
        answer: "Você pode criar uma lista com presentes tradicionais ou converter tudo em dinheiro via PIX. Os convidados escolhem um presente, fazem o pagamento pelo site, e você recebe o valor diretamente na sua conta."
      },
      {
        question: "Preciso comprar os presentes antes?",
        answer: "Não! Você não precisa comprar nada. Basta adicionar os itens que deseja à lista (podem ser itens reais ou simbólicos). Os convidados pagam pelo presente e você recebe o dinheiro para usar como quiser."
      },
      {
        question: "Qual a taxa cobrada sobre os presentes?",
        answer: "No plano gratuito, cobramos uma taxa de 5% sobre cada presente recebido. Nos planos Premium e Luxo, a taxa é reduzida para 3% e 0%, respectivamente."
      },
      {
        question: "Como recebo o dinheiro dos presentes?",
        answer: "O valor fica disponível para saque na sua conta Eternize. Você pode transferir para sua conta bancária via PIX a qualquer momento, sem custo adicional."
      },
      {
        question: "Os convidados podem dar presentes em grupo?",
        answer: "Sim! Para presentes de maior valor, os convidados podem contribuir parcialmente. Por exemplo, vários amigos podem se juntar para presentear uma lua de mel."
      },
    ]
  },
  {
    id: "rsvp",
    name: "Confirmação (RSVP)",
    icon: Users,
    items: [
      {
        question: "Como funciona o RSVP online?",
        answer: "Os convidados acessam seu site e confirmam presença com apenas alguns cliques. Eles informam quantas pessoas irão, restrições alimentares e outras informações que você solicitar."
      },
      {
        question: "Como acompanho as confirmações?",
        answer: "No painel de controle, você tem acesso a uma lista completa de todos os convidados, seus status (confirmado, pendente, recusou) e todas as informações que eles enviaram."
      },
      {
        question: "Posso enviar lembretes para quem não confirmou?",
        answer: "Sim! Você pode enviar lembretes por email ou WhatsApp diretamente pelo painel. Também pode exportar a lista de pendentes para entrar em contato manualmente."
      },
      {
        question: "É possível limitar o número de acompanhantes?",
        answer: "Sim! Você pode configurar se cada convidado pode trazer acompanhantes e definir um limite máximo por confirmação."
      },
    ]
  },
  {
    id: "fotos",
    name: "Fotos e Galeria",
    icon: Camera,
    items: [
      {
        question: "Quantas fotos posso enviar?",
        answer: "No plano gratuito, você pode enviar até 50 fotos. Nos planos Premium e Luxo, o limite aumenta para 200 e ilimitado, respectivamente."
      },
      {
        question: "Os convidados podem enviar fotos?",
        answer: "Nos planos pagos, sim! Você pode habilitar uma galeria colaborativa onde os convidados enviam fotos do casamento, criando um álbum coletivo."
      },
      {
        question: "Qual o tamanho máximo por foto?",
        answer: "Cada foto pode ter até 10MB. Aceitamos formatos JPG, PNG e WEBP. As fotos são otimizadas automaticamente para carregamento rápido."
      },
      {
        question: "Posso baixar todas as fotos de uma vez?",
        answer: "Sim! No painel de controle, você pode baixar todas as fotos da galeria em um único arquivo ZIP."
      },
    ]
  },
  {
    id: "convites",
    name: "Convites Digitais",
    icon: Mail,
    items: [
      {
        question: "Como criar e enviar convites digitais?",
        answer: "No painel, você escolhe um template de convite, personaliza com suas informações e cores, e pode enviar por WhatsApp, email ou compartilhar um link."
      },
      {
        question: "Posso personalizar o design do convite?",
        answer: "Sim! Você pode alterar cores, fontes, adicionar sua foto de casal e ajustar os textos. Temos mais de 20 templates para escolher."
      },
      {
        question: "O convite inclui link para o site?",
        answer: "Sim! Cada convite inclui automaticamente um link e QR code que leva direto ao seu site de casamento."
      },
    ]
  },
  {
    id: "pagamento",
    name: "Pagamentos e Planos",
    icon: CreditCard,
    items: [
      {
        question: "Quais são os planos disponíveis?",
        answer: "Temos 3 planos: Grátis (funcionalidades básicas), Premium (R$99 - recursos avançados) e Luxo (R$249 - tudo ilimitado + suporte prioritário). Todos são pagamento único, sem mensalidade."
      },
      {
        question: "Posso mudar de plano depois?",
        answer: "Sim! Você pode fazer upgrade a qualquer momento. O valor já pago é descontado do novo plano."
      },
      {
        question: "Quais formas de pagamento são aceitas?",
        answer: "Aceitamos PIX, cartão de crédito (em até 12x) e boleto bancário."
      },
      {
        question: "Vocês oferecem reembolso?",
        answer: "Sim! Se você não ficar satisfeito, oferecemos reembolso integral em até 7 dias após a compra, sem perguntas."
      },
    ]
  },
  {
    id: "tecnico",
    name: "Suporte Técnico",
    icon: Settings,
    items: [
      {
        question: "Meu site está fora do ar. O que fazer?",
        answer: "Isso é muito raro, mas se acontecer, entre em contato pelo chat ou email suporte@eternize.com.br. Nosso time resolve em menos de 1 hora."
      },
      {
        question: "Posso usar meu próprio domínio?",
        answer: "Sim! Nos planos Premium e Luxo, você pode conectar seu próprio domínio (ex: anajoao.com.br) ao seu site Eternize."
      },
      {
        question: "O site funciona em celular?",
        answer: "Sim! Todos os nossos templates são responsivos e ficam perfeitos em qualquer dispositivo — celular, tablet ou computador."
      },
      {
        question: "Como entro em contato com o suporte?",
        answer: "Você pode usar o chat no canto inferior direito, enviar email para suporte@eternize.com.br ou acessar nossa Central de Ajuda."
      },
    ]
  },
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("geral");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

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

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredCategories = searchTerm
    ? faqData.map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : faqData.filter(cat => cat.id === activeCategory);

  const totalQuestions = faqData.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-cream via-blush/30 to-champagne overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-gold-light blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Central de Ajuda
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
            Como podemos <span className="text-primary">ajudar</span>?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais frequentes sobre o Eternize
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar perguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border bg-white focus:border-primary focus:outline-none text-lg"
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {totalQuestions} perguntas em {faqData.length} categorias
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            {!searchTerm && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-border p-4 sticky top-24">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    Categorias
                  </h3>
                  <nav className="space-y-1">
                    {faqData.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                          activeCategory === category.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-gray-50 text-foreground"
                        }`}
                      >
                        <category.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{category.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {category.items.length}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Questions */}
            <div className={searchTerm ? "lg:col-span-4" : "lg:col-span-3"}>
              {filteredCategories.map((category) => (
                <div key={category.id} className="mb-8">
                  {searchTerm && (
                    <div className="flex items-center gap-2 mb-4">
                      <category.icon className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-lg">{category.name}</h2>
                      <span className="text-sm text-muted-foreground">
                        ({category.items.length} resultados)
                      </span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {category.items.map((item, index) => {
                      const itemId = `${category.id}-${index}`;
                      const isOpen = openItems.has(itemId);
                      return (
                        <div
                          key={itemId}
                          className="bg-white rounded-xl border border-border overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium pr-4">{item.question}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 pt-0">
                              <div className="pt-3 border-t border-border">
                                <p className="text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && searchTerm && (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-muted-foreground mb-6">
                    Não encontramos perguntas para "{searchTerm}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Limpar busca
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/5 via-blush/30 to-champagne rounded-3xl p-8 md:p-12 text-center">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Ainda tem dúvidas?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Nossa equipe está pronta para ajudar. Entre em contato e responderemos 
              o mais rápido possível.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contato">
                <Button className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white px-8 py-6 rounded-xl font-semibold text-lg">
                  Falar com Suporte
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="mailto:suporte@eternize.com.br">
                <Button variant="outline" className="px-8 py-6 rounded-xl font-medium text-lg border-2">
                  suporte@eternize.com.br
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-8">
            Links úteis
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Como Funciona", href: "/#como-funciona", icon: HelpCircle },
              { name: "Planos e Preços", href: "/#planos", icon: CreditCard },
              { name: "Templates", href: "/templates", icon: Settings },
              { name: "Demonstração", href: "/demo/ana-e-joao", icon: Camera },
            ].map((link, i) => (
              <Link
                key={i}
                to={link.href}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{link.name}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
