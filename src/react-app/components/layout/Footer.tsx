import { Link } from "react-router";
import { Heart, Mail, MapPin } from "lucide-react";

const CONTACT_EMAIL = "contato@eternize.com";

const columns: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Recursos",
    links: [
      { label: "Site dos Noivos", to: "/templates" },
      { label: "Lista de Presentes", to: "/presentes" },
      { label: "RSVP Online", to: "/rsvp" },
      { label: "Convites Digitais", to: "/convites" },
      { label: "Álbum de Fotos", to: "/album" },
    ],
  },
  {
    title: "Comece agora",
    links: [
      { label: "Criar site grátis", to: "/cadastro" },
      { label: "Ver templates", to: "/templates" },
      { label: "Entrar", to: "/entrar" },
      { label: "Perguntas frequentes", to: "/faq" },
    ],
  },
  {
    title: "Eternize",
    links: [
      { label: "Sobre nós", to: "/sobre" },
      { label: "Central de ajuda", to: "/faq" },
      { label: "Termos de uso", to: "/faq" },
      { label: "Privacidade", to: "/faq" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-serif text-2xl font-semibold text-white">Eternize</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              O casamento inteiro num lugar só — site, lista de presentes, confirmações
              e recados, com o cuidado que o grande dia merece.
            </p>
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-primary text-sm font-medium transition-colors"
            >
              <Heart className="w-4 h-4" /> Criar meu site grátis
            </Link>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/10">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
          <span className="flex items-center gap-2 text-sm text-white/60">
            <MapPin className="w-4 h-4" />
            Brasil
          </span>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/50">© {year} Eternize. Todos os direitos reservados.</p>
          <p className="text-sm text-white/50 flex items-center gap-1">
            Feito com <Heart className="w-4 h-4 text-rose fill-rose" /> para casais apaixonados
          </p>
        </div>
      </div>
    </footer>
  );
}
