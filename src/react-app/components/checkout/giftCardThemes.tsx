import type { ReactNode } from "react";
import { motion, type Transition } from "framer-motion";
import { Gift, Heart, Star, Gem, PartyPopper, Crown } from "lucide-react";

/**
 * Distinct, animated visual treatments for the gift-card tiers on the checkout.
 * Tiers are admin-editable, so a theme is picked by position (index % length).
 */

export interface CardTheme {
  key: string;
  icon: ReactNode;
  /** card background */
  bg: string;
  /** text colour for the name + price (Tailwind class) */
  accent: string;
  /** border colour when the tier is selected (Tailwind class) */
  ring: string;
  /** animated overlay, absolutely positioned inside the surface */
  Decor: (p: { play: boolean }) => ReactNode;
}

const loop = (extra: Partial<Transition> = {}): Transition => ({
  repeat: Infinity,
  ease: "easeInOut",
  ...extra,
});

/* ── 0 · Papel (Grátis) ─────────────────────────────────────────────── */
function PaperDecor({ play }: { play: boolean }) {
  return (
    <>
      <motion.div
        className="absolute -right-3 -bottom-4 text-black/[0.06]"
        animate={play ? { scale: [1, 1.08, 1] } : {}}
        transition={loop({ duration: 5 })}
      >
        <Heart className="w-24 h-24 fill-current" />
      </motion.div>
      <motion.span
        className="absolute left-4 top-3 w-1.5 h-1.5 rounded-full bg-black/10"
        animate={play ? { opacity: [0.3, 0.7, 0.3] } : {}}
        transition={loop({ duration: 3 })}
      />
    </>
  );
}

/* ── 1 · Romântico ──────────────────────────────────────────────────── */
function HeartsDecor({ play }: { play: boolean }) {
  const hearts = [
    { x: "18%", s: 12, d: 0 },
    { x: "52%", s: 9, d: 1.1 },
    { x: "80%", s: 14, d: 2.2 },
  ];
  return (
    <>
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="absolute bottom-1 text-rose-400/60"
          style={{ left: h.x }}
          animate={play ? { y: [8, -46], opacity: [0, 0.9, 0] } : {}}
          transition={loop({ duration: 3.4, delay: h.d })}
        >
          <Heart className="fill-current" style={{ width: h.s, height: h.s }} />
        </motion.div>
      ))}
    </>
  );
}

/* ── 2 · Dourado (shimmer + sparkles) ───────────────────────────────── */
function GoldDecor({ play }: { play: boolean }) {
  const sparks = [
    { x: "22%", y: "60%", d: 0 },
    { x: "68%", y: "26%", d: 0.8 },
    { x: "85%", y: "70%", d: 1.6 },
  ];
  return (
    <>
      <motion.div
        className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/70 to-transparent"
        animate={play ? { x: ["0%", "460%"] } : {}}
        transition={loop({ duration: 2.8, ease: "easeInOut", repeatDelay: 1.2 })}
      />
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-amber-500"
          style={{ left: s.x, top: s.y }}
          animate={play ? { scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] } : {}}
          transition={loop({ duration: 2, delay: s.d })}
        >
          <Star className="w-3 h-3 fill-current" />
        </motion.div>
      ))}
    </>
  );
}

/* ── 3 · Elegante (rotating glow + hairline frame) ──────────────────── */
function EleganceDecor({ play }: { play: boolean }) {
  return (
    <>
      <motion.div
        className="absolute -inset-8"
        style={{
          background:
            "conic-gradient(from 0deg, transparent, rgba(139,92,246,0.28), transparent 55%)",
        }}
        animate={play ? { rotate: 360 } : {}}
        transition={loop({ duration: 12, ease: "linear" })}
      />
      <span className="absolute inset-2 rounded-lg ring-1 ring-white/50" />
      <span className="absolute inset-2 rounded-lg ring-1 ring-violet-300/40" />
    </>
  );
}

/* ── 4 · Animado (confetti) ─────────────────────────────────────────── */
function ConfettiDecor({ play }: { play: boolean }) {
  const bits = [
    { x: "12%", c: "bg-rose-400", d: 0, r: true },
    { x: "30%", c: "bg-amber-400", d: 0.5, r: false },
    { x: "48%", c: "bg-sky-400", d: 1, r: true },
    { x: "64%", c: "bg-emerald-400", d: 0.3, r: false },
    { x: "80%", c: "bg-fuchsia-400", d: 0.8, r: true },
    { x: "92%", c: "bg-yellow-400", d: 1.3, r: false },
  ];
  return (
    <>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className={`absolute top-2 w-1.5 h-1.5 ${b.c} ${b.r ? "rounded-full" : "rounded-[1px]"}`}
          style={{ left: b.x }}
          animate={play ? { y: [0, 40, 0], rotate: [0, 180], opacity: [0.9, 0.9, 0.4] } : {}}
          transition={loop({ duration: 2.4, delay: b.d })}
        />
      ))}
    </>
  );
}

/* ── 5 · VIP (metallic glare) ───────────────────────────────────────── */
function VipDecor({ play }: { play: boolean }) {
  return (
    <>
      <span
        className="absolute -top-6 -left-6 w-24 h-24 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)" }}
      />
      <motion.div
        className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/55 to-transparent"
        animate={play ? { x: ["0%", "320%"] } : {}}
        transition={loop({ duration: 3.4, ease: "easeInOut", repeatDelay: 0.6 })}
      />
      <motion.div
        className="absolute right-3 top-3 text-white/80"
        animate={play ? { scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] } : {}}
        transition={loop({ duration: 2.2 })}
      >
        <Star className="w-3.5 h-3.5 fill-current" />
      </motion.div>
    </>
  );
}

export const CARD_THEMES: CardTheme[] = [
  {
    key: "paper",
    icon: <Gift className="w-6 h-6" />,
    bg: "linear-gradient(135deg,#ffffff 0%,#f1f1f3 100%)",
    accent: "text-slate-600",
    ring: "border-slate-300",
    Decor: PaperDecor,
  },
  {
    key: "romantic",
    icon: <Heart className="w-6 h-6" />,
    bg: "linear-gradient(135deg,#ffe6ee 0%,#ffcfe0 100%)",
    accent: "text-rose-600",
    ring: "border-rose-300",
    Decor: HeartsDecor,
  },
  {
    key: "gold",
    icon: <Star className="w-6 h-6" />,
    bg: "linear-gradient(135deg,#fff4d1 0%,#ffe08c 100%)",
    accent: "text-amber-700",
    ring: "border-amber-400",
    Decor: GoldDecor,
  },
  {
    key: "elegance",
    icon: <Gem className="w-6 h-6" />,
    bg: "linear-gradient(135deg,#f0e8ff 0%,#ddd0f7 100%)",
    accent: "text-violet-700",
    ring: "border-violet-400",
    Decor: EleganceDecor,
  },
  {
    key: "party",
    icon: <PartyPopper className="w-6 h-6" />,
    bg: "linear-gradient(135deg,#d9f3ff 0%,#c4e2ff 100%)",
    accent: "text-sky-600",
    ring: "border-sky-400",
    Decor: ConfettiDecor,
  },
  {
    key: "vip",
    icon: <Crown className="w-6 h-6" />,
    bg: "linear-gradient(135deg,#f8dd86 0%,#e7b64a 48%,#f9e6a5 100%)",
    accent: "text-amber-800",
    ring: "border-yellow-500",
    Decor: VipDecor,
  },
];

export const themeFor = (i: number) => CARD_THEMES[((i % CARD_THEMES.length) + CARD_THEMES.length) % CARD_THEMES.length];

/**
 * Themed, animated surface used for the selection tile, the live preview and
 * (without decor) the order-summary chip.
 */
export function GiftCardSurface({
  theme,
  variant = "tile",
  selected = false,
  onClick,
  className = "",
  children,
}: {
  theme: CardTheme;
  variant?: "tile" | "preview" | "chip";
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const pad = variant === "chip" ? "p-3 rounded-lg" : variant === "preview" ? "p-6 rounded-2xl" : "p-4 rounded-xl";
  const Wrap = onClick ? motion.button : motion.div;
  return (
    <Wrap
      type={onClick ? "button" : undefined}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`relative overflow-hidden border-2 text-left transition-shadow ${pad} ${
        selected ? `${theme.ring} shadow-lg` : "border-transparent hover:border-black/10"
      } ${className}`}
      style={{ backgroundImage: theme.bg }}
    >
      {variant !== "chip" && (
        <div className="pointer-events-none absolute inset-0">
          <theme.Decor play={variant === "preview" || selected} />
        </div>
      )}
      <div className="relative">{children}</div>
    </Wrap>
  );
}
