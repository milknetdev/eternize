import { Link } from "react-router";
import { Globe, Gift, Users, Camera, Mail, ArrowRight } from "lucide-react";

const ALL = [
  { key: "site", to: "/templates", icon: Globe, title: "Site dos Noivos", text: "Um site elegante com a história do casal." },
  { key: "presentes", to: "/presentes", icon: Gift, title: "Lista de Presentes", text: "Presentes e PIX num só lugar." },
  { key: "rsvp", to: "/rsvp", icon: Users, title: "RSVP Online", text: "Confirmações organizadas em tempo real." },
  { key: "album", to: "/album", icon: Camera, title: "Álbum de Fotos", text: "Galeria colaborativa com os convidados." },
  { key: "convites", to: "/convites", icon: Mail, title: "Convites Digitais", text: "Convite por WhatsApp com link de RSVP." },
  { key: "convidados", to: "/convidados", icon: Users, title: "Gestão de Convidados", text: "Mesas, etiquetas e acompanhantes." },
];

/** Cross-links to the other feature pages. `current` hides its own card. */
export default function MoreFeatures({ current }: { current: string }) {
  const items = ALL.filter((i) => i.key !== current).slice(0, 3);

  return (
    <section className="py-20 bg-cream">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-3">Tudo conectado</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Cada recurso conversa com os outros — e todos vivem no mesmo painel.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {items.map((i) => (
            <Link
              key={i.key}
              to={i.to}
              className="group bg-white rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-gold-light/10 flex items-center justify-center mb-4">
                <i.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{i.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{i.text}</p>
              <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                Ver mais <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
