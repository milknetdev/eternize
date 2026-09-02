import { Link } from "react-router";
import { Heart, Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { label: "Site dos Noivos", href: "#" },
      { label: "Lista de Presentes", href: "#" },
      { label: "RSVP Online", href: "#" },
      { label: "Convites Digitais", href: "#" },
      { label: "Álbum de Fotos", href: "#" },
    ],
    recursos: [
      { label: "Blog", href: "#" },
      { label: "Dicas de Casamento", href: "#" },
      { label: "Tendências", href: "#" },
      { label: "Checklist", href: "#" },
      { label: "Calculadora", href: "#" },
    ],
    empresa: [
      { label: "Sobre Nós", href: "#" },
      { label: "Carreiras", href: "#" },
      { label: "Imprensa", href: "#" },
      { label: "Contato", href: "#" },
    ],
    legal: [
      { label: "Termos de Uso", href: "#" },
      { label: "Privacidade", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  };

  return (
    <footer className="bg-foreground text-white/90">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-serif text-2xl font-semibold text-white">
                Eternize
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Transformamos sonhos em realidade. Crie o casamento perfeito com
              nossa plataforma completa e elegante.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Produto
            </h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Recursos
            </h4>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Empresa
            </h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/10">
          <a
            href="mailto:contato@eternize.com"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            contato@eternize.com
          </a>
          <a
            href="tel:+5511999999999"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4" />
            (11) 99999-9999
          </a>
          <span className="flex items-center gap-2 text-sm text-white/60">
            <MapPin className="w-4 h-4" />
            São Paulo, Brasil
          </span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              © {currentYear} Eternize. Todos os direitos reservados.
            </p>
            <p className="text-sm text-white/50 flex items-center gap-1">
              Feito com <Heart className="w-4 h-4 text-rose fill-rose" /> para
              casais apaixonados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
