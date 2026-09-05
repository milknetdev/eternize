import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { authFetch } from "@/react-app/lib/api";
import { LifeBuoy, LogOut, ExternalLink } from "lucide-react";

interface Ctx {
  impersonating: boolean;
  couple?: string;
  customUrl?: string | null;
}

/**
 * Shown across the whole app whenever an admin is "acting as" a couple
 * (a support session in the eternize_support cookie). Leaving support does not
 * touch the admin's own login.
 */
export default function SupportBanner() {
  const location = useLocation();
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let alive = true;
    authFetch("/api/support/context")
      .then((r) => r.json())
      .then((d: Ctx) => { if (alive) setCtx(d); })
      .catch(() => { if (alive) setCtx({ impersonating: false }); });
    return () => { alive = false; };
  }, [location.pathname]);

  if (!ctx?.impersonating) return null;

  const stop = async () => {
    setLeaving(true);
    try {
      await authFetch("/api/support/stop", { method: "POST" });
    } finally {
      window.location.href = "/admin";
    }
  };

  return (
    <div className="relative z-[200] bg-amber-500 text-amber-950 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <LifeBuoy className="w-4 h-4" />
          Modo suporte — você está gerenciando o site de <strong>{ctx.couple || "um casal"}</strong>
        </span>
        <div className="flex items-center gap-2">
          {ctx.customUrl && (
            <a
              href={`/c/${ctx.customUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/10 hover:bg-amber-950/20"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver site
            </a>
          )}
          <button
            onClick={stop}
            disabled={leaving}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-950 text-amber-50 hover:bg-amber-900 disabled:opacity-60"
          >
            <LogOut className="w-3.5 h-3.5" /> {leaving ? "Saindo…" : "Sair do suporte"}
          </button>
        </div>
      </div>
    </div>
  );
}
