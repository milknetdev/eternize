import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/react-app/lib/api";
import {
  Search, ExternalLink, KeyRound, Loader2, Check, X, RefreshCw, Save,
  LogIn, Copy, Users, Gift, Image as ImageIcon, MessageCircle, ShieldCheck,
} from "lucide-react";

interface CoupleRow {
  id: number;
  partner1_name: string | null;
  partner2_name: string | null;
  custom_url: string | null;
  is_published: boolean | number;
  user_email: string;
  guest_count: number;
  gifts_total: number;
}

interface CoupleDetail {
  wedding: Record<string, unknown>;
  counts: { guests: number; confirmed: number; gifts: number; photos: number; messages: number };
  orders: { id: number; guest_name: string; amount: number; payment_status: string; created_at: string }[];
  withdrawals: { id: number; amount: number; pix_key: string; pix_key_type: string; status: string; created_at: string }[];
}

const brl = (n: number) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const truthy = (v: unknown) => v === true || v === 1 || v === "1" || v === "t";
const s = (v: unknown) => (v == null ? "" : String(v));

export default function SupportConsole() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CoupleRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selId, setSelId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CoupleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [tempPw, setTempPw] = useState<{ email: string; password: string } | null>(null);
  const [edit, setEdit] = useState({ custom_url: "", pix_key: "" });
  const [busy, setBusy] = useState(false);

  const search = useCallback(async (term: string) => {
    setSearching(true);
    try {
      const res = await authFetch(`/api/admin/couples?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setRows(data.couples || []);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(q), 300);
    return () => clearTimeout(t);
  }, [q, search]);

  const openCouple = useCallback(async (id: number) => {
    setSelId(id);
    setDetail(null);
    setFlash(null);
    setTempPw(null);
    setLoadingDetail(true);
    try {
      const res = await authFetch(`/api/admin/couples/${id}`);
      const data = (await res.json()) as CoupleDetail;
      setDetail(data);
      setEdit({ custom_url: s(data.wedding.custom_url), pix_key: s(data.wedding.pix_key) });
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const patch = async (payload: Record<string, unknown>, note: string) => {
    if (!selId) return;
    setBusy(true);
    try {
      const res = await authFetch(`/api/admin/couples/${selId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setFlash(res.ok ? note : "Falha ao salvar.");
      if (res.ok) { await openCouple(selId); search(q); }
    } finally {
      setBusy(false);
    }
  };

  const impersonate = async () => {
    if (!selId) return;
    if (!confirm("Abrir o painel deste casal em modo suporte? Você poderá usar todas as funcionalidades como se fosse o casal.")) return;
    const res = await authFetch(`/api/admin/couples/${selId}/impersonate`, { method: "POST" });
    if (res.ok) window.location.href = "/dashboard";
    else setFlash("Não foi possível entrar em modo suporte.");
  };

  const resetPassword = async () => {
    if (!detail) return;
    if (!confirm("Gerar uma senha temporária e desconectar este usuário de todos os dispositivos?")) return;
    const res = await authFetch(`/api/admin/users/${s(detail.wedding.user_id)}/reset-password`, { method: "POST" });
    const data = await res.json();
    if (data.tempPassword) setTempPw({ email: data.email, password: data.tempPassword });
    else setFlash("Falha ao resetar senha.");
  };

  const published = detail ? truthy(detail.wedding.is_published) : false;
  const countCards: [string, number, typeof Users][] = detail
    ? [
        ["Convidados", detail.counts.guests, Users],
        ["Confirmados", detail.counts.confirmed, Check],
        ["Presentes", detail.counts.gifts, Gift],
        ["Fotos", detail.counts.photos, ImageIcon],
        ["Recados", detail.counts.messages, MessageCircle],
      ]
    : [];

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      {/* ── Search + results ── */}
      <div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="E-mail, nome do casal ou URL…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="space-y-2 max-h-[72vh] overflow-y-auto pr-1">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => openCouple(r.id)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                selId === r.id ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{r.partner1_name || "—"} &amp; {r.partner2_name || "—"}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${truthy(r.is_published) ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {truthy(r.is_published) ? "publicado" : "rascunho"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{r.user_email}</p>
              <p className="text-xs text-muted-foreground">
                {r.guest_count} convidados · {brl(r.gifts_total)} · /c/{r.custom_url || "—"}
              </p>
            </button>
          ))}
          {!searching && rows.length === 0 && (
            <p className="text-muted-foreground text-sm p-3">Nenhum casal encontrado.</p>
          )}
        </div>
      </div>

      {/* ── Detail ── */}
      <div>
        {!selId && (
          <div className="h-full min-h-[300px] rounded-xl border border-dashed border-border flex items-center justify-center text-center p-8">
            <p className="text-muted-foreground text-sm max-w-xs">
              Busque e selecione um casal para ver a ficha completa e agir em nome dele.
            </p>
          </div>
        )}
        {loadingDetail && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}

        {detail && !loadingDetail && (
          <div className="space-y-5">
            {flash && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">{flash}</div>
            )}

            {tempPw && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300">
                <p className="text-sm font-medium text-amber-900 mb-1">Senha temporária de {tempPw.email}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-white border border-amber-300 font-mono text-lg tracking-wide text-amber-900 select-all">
                    {tempPw.password}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(tempPw.password); setFlash("Senha copiada."); }}
                    className="p-2 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900"
                    title="Copiar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-amber-800 mt-2">Anote agora — não será mostrada de novo. O usuário foi desconectado de todos os dispositivos.</p>
              </div>
            )}

            {/* Identity + primary actions */}
            <div className="rounded-xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-serif font-semibold">
                    {s(detail.wedding.partner1_name) || "—"} &amp; {s(detail.wedding.partner2_name) || "—"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{s(detail.wedding.user_email)}</p>
                  <p className="text-xs text-muted-foreground">
                    ID {s(detail.wedding.id)} · criado {new Date(s(detail.wedding.created_at)).toLocaleDateString("pt-BR")}
                    {" · "}
                    <span className={published ? "text-green-600" : "text-amber-600"}>{published ? "publicado" : "rascunho"}</span>
                  </p>
                </div>
                <button
                  onClick={impersonate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
                >
                  <LogIn className="w-4 h-4" /> Entrar como suporte
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {Boolean(detail.wedding.custom_url) && (
                  <a href={`/c/${s(detail.wedding.custom_url)}`} target="_blank" rel="noreferrer"
                     className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted">
                    <ExternalLink className="w-4 h-4" /> Abrir site
                  </a>
                )}
                <button
                  disabled={busy}
                  onClick={() => patch({ is_published: !published }, published ? "Site despublicado." : "Site publicado.")}
                  className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg ${published ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
                >
                  {published ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {published ? "Despublicar" : "Publicar"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => patch(
                    { show_story: 1, show_gallery: 1, show_timeline: 1, show_location: 1, show_dresscode: 1, show_gifts: 1, show_rsvp: 1, show_messages: 1, show_godparents: 1, show_parents: 1, show_accommodations: 1 },
                    "Todas as seções reativadas.",
                  )}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
                >
                  <RefreshCw className="w-4 h-4" /> Reativar seções
                </button>
                <button
                  onClick={resetPassword}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
                >
                  <KeyRound className="w-4 h-4" /> Resetar senha
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {([["URL do site", "custom_url"], ["Chave PIX", "pix_key"]] as const).map(([label, key]) => (
                  <label key={key} className="text-xs font-medium text-muted-foreground">
                    {label}
                    <div className="mt-1 flex gap-2">
                      <input
                        value={edit[key]}
                        onChange={(e) => setEdit((st) => ({ ...st, [key]: e.target.value }))}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground"
                      />
                      <button
                        disabled={busy}
                        onClick={() => patch({ [key]: edit[key].trim() || null }, `${label} atualizada.`)}
                        className="px-2.5 rounded-lg bg-primary text-white hover:bg-primary/90"
                        title="Salvar"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {countCards.map(([label, v, Icon]) => (
                <div key={label} className="rounded-xl border border-border bg-white p-3 text-center">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{v ?? 0}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Orders */}
            <div className="rounded-xl border border-border bg-white p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4 text-muted-foreground" /> Presentes recebidos ({detail.orders.length})
              </h4>
              <div className="divide-y divide-border max-h-56 overflow-y-auto">
                {detail.orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm py-1.5">
                    <span className="truncate">{o.guest_name}</span>
                    <span className="text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString("pt-BR")}</span>
                    <span className={`font-medium ${o.payment_status === "paid" ? "text-green-600" : "text-muted-foreground"}`}>{brl(o.amount)}</span>
                  </div>
                ))}
                {detail.orders.length === 0 && <p className="text-muted-foreground text-sm py-2">Nenhum presente ainda.</p>}
              </div>
            </div>

            {/* Withdrawals */}
            <div className="rounded-xl border border-border bg-white p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" /> Saques ({detail.withdrawals.length})
              </h4>
              <div className="divide-y divide-border">
                {detail.withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-sm py-1.5">
                    <span className="font-medium">{brl(w.amount)}</span>
                    <span className="text-muted-foreground text-xs truncate">{w.pix_key_type}: {w.pix_key}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === "pending" ? "bg-amber-100 text-amber-700" : w.status === "approved" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{w.status}</span>
                  </div>
                ))}
                {detail.withdrawals.length === 0 && <p className="text-muted-foreground text-sm py-2">Nenhum saque.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
