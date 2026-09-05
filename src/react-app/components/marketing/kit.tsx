import { type ReactNode, type ComponentType } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";

/**
 * Shared building blocks for the public marketing pages, tuned to the same
 * finish as the /entrar redesign: a layered warm hero backdrop with drifting
 * hearts, scroll-reveal sections, a consistent section heading, and the
 * gold-sweep call-to-action button.
 */

/* ── Hero backdrop ─────────────────────────────────────────────────────── */

const HEARTS = [
  { x: "9%", y: "24%", s: 24, d: 0 },
  { x: "82%", y: "18%", s: 16, d: 1.1 },
  { x: "71%", y: "68%", s: 30, d: 0.5 },
  { x: "20%", y: "72%", s: 14, d: 1.7 },
];

/** Drop-in absolute layer for a hero `<section className="relative ...">`. */
export function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-[-14%] left-[-10%] w-[34rem] h-[34rem] rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute bottom-[-22%] right-[-12%] w-[38rem] h-[38rem] rounded-full bg-gold-light/20 blur-[130px]" />
      <div className="absolute top-[20%] right-[24%] w-[20rem] h-[20rem] rounded-full bg-rose/25 blur-[110px]" />
      {HEARTS.map((h, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: h.x, top: h.y }}
          animate={{ y: [0, -14, 0], opacity: [0.18, 0.4, 0.18] }}
          transition={{ duration: 5 + h.d, repeat: Infinity, ease: "easeInOut", delay: h.d }}
        >
          <Heart className="fill-primary/40 text-primary/40" style={{ width: h.s, height: h.s }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ── Scroll reveal ─────────────────────────────────────────────────────── */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Section heading ───────────────────────────────────────────────────── */

export function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  invert = false,
}: {
  icon?: ComponentType<{ className?: string }>;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  invert?: boolean;
}) {
  return (
    <Reveal className="text-center mb-12 max-w-2xl mx-auto">
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 text-sm font-medium mb-4 ${
            invert ? "text-white/80" : "text-primary"
          }`}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {eyebrow}
        </div>
      )}
      <h2
        className={`font-serif text-3xl md:text-4xl font-semibold mb-4 ${
          invert ? "text-white" : ""
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={invert ? "text-white/80" : "text-muted-foreground"}>{subtitle}</p>
      )}
    </Reveal>
  );
}

/* ── Call to action button ─────────────────────────────────────────────── */

const SOLID =
  "bg-gradient-to-r from-[#bd7d17] via-primary to-[#e6bd54] bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-[background-position,box-shadow,transform] duration-500";
const OUTLINE =
  "border-2 border-border bg-white/70 backdrop-blur hover:border-primary/40 hover:bg-white text-foreground transition-colors";

export function CtaButton({
  to,
  children,
  variant = "solid",
  size = "lg",
  className = "",
  withArrow = false,
}: {
  to: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  size?: "md" | "lg";
  className?: string;
  withArrow?: boolean;
}) {
  const pad = size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3";
  return (
    <Link
      to={to}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl font-semibold ${pad} ${
        variant === "solid" ? SOLID : OUTLINE
      } ${className}`}
    >
      {children}
      {withArrow && (
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      )}
    </Link>
  );
}

/* ── Closing CTA band ──────────────────────────────────────────────────── */

export function ClosingCTA({
  title,
  sub,
  note = "Sem cartão de crédito · pronto em minutos",
  primaryTo = "/cadastro",
  primaryLabel = "Criar meu site grátis",
  secondaryTo,
  secondaryLabel,
}: {
  title: ReactNode;
  sub: ReactNode;
  note?: string;
  primaryTo?: string;
  primaryLabel?: string;
  secondaryTo?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-blush/30 to-champagne">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Reveal>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center mx-auto mb-6">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-5">{title}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{sub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CtaButton to={primaryTo} withArrow>
              {primaryLabel}
            </CtaButton>
            {secondaryTo && secondaryLabel && (
              <CtaButton to={secondaryTo} variant="outline">
                {secondaryLabel}
              </CtaButton>
            )}
          </div>
          {note && <p className="mt-6 text-sm text-muted-foreground">{note}</p>}
        </Reveal>
      </div>
    </section>
  );
}
