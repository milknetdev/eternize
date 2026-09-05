import { useEffect, type ReactNode, type InputHTMLAttributes, type ComponentType } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Star, Sparkles, ShieldCheck, Gift } from "lucide-react";

/** Labelled input with a leading icon and an optional trailing adornment. */
export function AuthInput({
  label,
  icon: Icon,
  adornment,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ComponentType<{ className?: string }>;
  adornment?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          {...props}
          className="w-full pl-11 pr-11 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-shadow"
        />
        {adornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{adornment}</div>
        )}
      </div>
    </label>
  );
}

const POINTS = [
  { icon: Sparkles, text: "Site do casamento pronto em minutos" },
  { icon: Gift, text: "Lista de presentes e PIX num só lugar" },
  { icon: ShieldCheck, text: "Confirmações e recados sob seu controle" },
];

/**
 * Shared scaffold for /entrar and /cadastro: a designed brand panel on the
 * left, and a centred card holding the form on the right.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ── Brand panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-14 text-white">
        {/* layered warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c98a1e] via-[#d9a521] to-[#e7c583]" />
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-rose/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-[32rem] h-[32rem] rounded-full bg-white/20 blur-3xl" />

        {/* floating hearts */}
        {[
          { x: "12%", y: "22%", s: 26, d: 0 },
          { x: "78%", y: "16%", s: 18, d: 1.2 },
          { x: "68%", y: "72%", s: 34, d: 0.6 },
          { x: "22%", y: "68%", s: 16, d: 1.8 },
        ].map((h, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: h.x, top: h.y }}
            animate={{ y: [0, -14, 0], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 5 + h.d, repeat: Infinity, ease: "easeInOut", delay: h.d }}
          >
            <Heart className="fill-white/60 text-white/60" style={{ width: h.s, height: h.s }} />
          </motion.div>
        ))}

        <Link to="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-1 ring-white/40">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <span className="font-serif text-2xl font-semibold">Eternize</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-md"
        >
          <h2 className="font-serif text-[2.75rem] leading-[1.1] font-medium mb-6">
            O casamento inteiro,<br />organizado com carinho.
          </h2>
          <ul className="space-y-3.5">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/20 ring-1 ring-white/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-white/95">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="relative flex items-center gap-3 text-sm text-white/90">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-white text-white" />
            ))}
          </div>
          <span>Feito para milhares de casais brasileiros</span>
        </div>
      </div>

      {/* ── Form side ── */}
      <div className="flex flex-col min-h-screen">
        <div className="p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md"
          >
            {/* logo — mobile only, panel already has it on desktop */}
            <Link to="/" className="lg:hidden flex items-center gap-2 justify-center mb-8">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-serif text-2xl font-semibold">Eternize</span>
            </Link>

            <div className="rounded-2xl border border-border bg-white shadow-xl shadow-primary/5 p-7 sm:p-8">
              <div className="mb-6">
                <h1 className="font-serif text-3xl font-medium">{title}</h1>
                <p className="text-muted-foreground mt-1.5">{subtitle}</p>
              </div>
              {children}
            </div>

            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
