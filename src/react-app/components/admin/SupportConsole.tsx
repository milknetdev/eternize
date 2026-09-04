import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/react-app/lib/api";
import {
  Search, ExternalLink, KeyRound, Loader2, Check, X, RefreshCw, Save,
} from "lucide-react";

interface CoupleRow {
  id: number;
  partner1_name: string | null;
  partner2_name: string | null;
  custom_url: string | null;
  wedding_date: string | null;
  is_published: boolean | number;
  created_at: string;
  user_id: string;
  user_email: string;
  user_name: string;
  guest_count: number;
  gifts_total: number;
}

interface CoupleDetail {
  wedding: Record<string, unknown>;
  counts: { guests: number; confirmed: number; gifts: number; photos: number; messages: number };
  orders: { id: number; guest_name: string; amount: number; payment_status: string; is_converted: boolean; created_at: string }[];
  withdrawals: { id: number; amount: number; pix_key: string; pix_key_type: string; status: string; created_at: string; processed_at: string | null }[];
}

const brl = (n: number) =>
  (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const bool = (v: unknown) => v === true || v === 1 || v === "1" || v === "t";

export default function SupportConsole() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CoupleRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selId, setSelId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CoupleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ custom_url: string; pix_key: string }>({ custom_url: "", pix_key: "" });

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
    setMsg(null);
    setLoadingDetail(true);
    try {
      const res = await authFetch(`/api/admin/couples/${id}`);
      const data = (await res.json()) as CoupleDetail;
      setDetail(data);
      setEdit({
        custom_url: (data.wedding.custom_url as string) || "",
        pix_key: (data.wedding.pix_key as string) || "",
      });
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const patch = async (payload: Record<string, unknown>, note: string) => {
    if (!selId) return;
    setMsg(null);
    const res = await authFetch(`/api/admin/couples/${selId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMsg(note);
      openCouple(selId);
      search(q);
    } else {
      setMsg("Falha ao salvar.");
    }
  };

  const resetPassword = async () => {
    if (!detail || !selId) return;
    if (!confirm("Gerar senha temporária e derrubar as sessões deste usuário?")) return;
    const res = await authFetch(`/api/admin/users/${detail.wedding.user_id}/reset-password`, { method: "POST" });
    const data = await res.json();
    if (data.tempPassword) {
      setMsg(`Senha temporária de ${data.email}: ${data.tempPassword} — anote agora, não será mostrada de novo.`);
    } else {
      setMsg("Falha ao resetar senha.");
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      {/* Search + results */}
      <div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="E-mail, nome, casal ou URL do site…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-500"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
        </div>
        <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => openCouple(r.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selId === r.id ? "border-gold-500 bg-slate-800" : "border-slate-800 bg-slate-900 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-medium truncate">
                  {r.partner1_name || "—"} &amp; {r.partner2_name || "—"}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${bool(r.is_published) ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                  {bool(r.is_published) ? "publicado" : "rascunho"}
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate">{r.user_email}</div>
              <div className="text-xs text-slate-500">
                {r.guest_count} convidados · {brl(r.gifts_total)} · /c/{r.custom_url || "—"}
              </div>
            </button>
          ))}
          {!searching && rows.length === 0 && (
            <p className="text-slate-500 text-sm p-3">Nenhum casal encontrado.</p>
          )}
        </div>
      </div>

      {/* Detail */}
      <div>
        {!selId && <p className="text-slate-500 text-sm">Selecione um casal para ver a ficha.</p>}
        {loadingDetail && <Loader2 className="w-6 h-6 animate-spin text-slate-400" />}
        {detail && !loadingDetail && (
          <div className="space-y-5">
            {msg && (
              <div className="p-3 rounded-lg bg-gold-500/15 border border-gold-500/30 text-gold-200 text-sm break-words">
                {msg}
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-white text-lg font-semibold">
                    {String(detail.wedding.partner1_name || "—")} &amp; {String(detail.wedding.partner2_name || "—")}
                  </h3>
                  <p className="text-sm text-slate-400">{String(detail.wedding.user_email)}</p>
                  <p className="text-xs text-slate-500">
                    ID {String(detail.wedding.id)} · criado {new Date(String(detail.wedding.created_at)).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {Boolean(detail.wedding.custom_url) && (
                    <a
                      href={`/c/${String(detail.wedding.custom_url)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" /> Abrir site
                    </a>
                  )}
                  <button
                    onClick={() => patch({ is_published: !bool(detail.wedding.is_published) }, bool(detail.wedding.is_published) ? "Despublicado." : "Publicado.")}
                    className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg ${bool(detail.wedding.is_published) ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" : "bg-green-500/20 text-green-300 hover:bg-green-500/30"}`}
                  >
                    {bool(detail.wedding.is_published) ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {bool(detail.wedding.is_published) ? "Despublicar" : "Publicar"}
                  </button>
                  <button
                    onClick={resetPassword}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    <KeyRound className="w-4 h-4" /> Resetar senha
                  </button>
                </div>
              </div>

              {/* Inline fixes */}
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <label className="text-xs text-slate-400">
                  URL do site
                  <div className="mt-1 flex gap-2">
                    <input
                      value={edit.custom_url}
                      onChange={(e) => setEdit((s) => ({ ...s, custom_url: e.target.value }))}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                    />
                    <button onClick={() => patch({ custom_url: edit.custom_url.trim() || null }, "URL atualizada.")} className="px-2 rounded-lg bg-slate-700 text-white"><Save className="w-4 h-4" /></button>
                  </div>
                </label>
                <label className="text-xs text-slate-400">
                  Chave PIX
                  <div className="mt-1 flex gap-2">
                    <input
                      value={edit.pix_key}
                      onChange={(e) => setEdit((s) => ({ ...s, pix_key: e.target.value }))}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                    />
                    <button onClick={() => patch({ pix_key: edit.pix_key.trim() || null }, "Chave PIX atualizada.")} className="px-2 rounded-lg bg-slate-700 text-white"><Save className="w-4 h-4" /></button>
                  </div>
                </label>
              </div>

              <button
                onClick={() => patch(
                  { show_story: 1, show_gallery: 1, show_timeline: 1, show_location: 1, show_dresscode: 1, show_gifts: 1, show_rsvp: 1, show_messages: 1, show_godparents: 1, show_parents: 1, show_accommodations: 1 },
                  "Todas as seções reativadas.",
                )}
                className="mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reativar todas as seções do site
              </button>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {([["Convidados", detail.counts.guests], ["Confirmados", detail.counts.confirmed], ["Presentes", detail.counts.gifts], ["Fotos", detail.counts.photos], ["Recados", detail.counts.messages]] as const).map(([label, v]) => (
                <div key={label} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <p className="text-white text-lg font-bold">{v ?? 0}</p>
                  <p className="text-[11px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Orders */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="text-white font-medium mb-2">Presentes recebidos ({detail.orders.length})</h4>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {detail.orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-800 last:border-0">
                    <span className="text-slate-300 truncate">{o.guest_name}</span>
                    <span className="text-slate-400">{new Date(o.created_at).toLocaleDateString("pt-BR")}</span>
                    <span className={`${o.payment_status === "paid" ? "text-green-400" : "text-slate-500"} font-medium`}>{brl(o.amount)}</span>
                  </div>
                ))}
                {detail.orders.length === 0 && <p className="text-slate-500 text-sm">Nenhum presente ainda.</p>}
              </div>
            </div>

            {/* Withdrawals */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="text-white font-medium mb-2">Saques ({detail.withdrawals.length})</h4>
              <div className="space-y-1">
                {detail.withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-800 last:border-0">
                    <span className="text-slate-300">{brl(w.amount)}</span>
                    <span className="text-slate-500 truncate">{w.pix_key_type}: {w.pix_key}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === "pending" ? "bg-amber-500/20 text-amber-300" : w.status === "approved" ? "bg-green-500/20 text-green-300" : "bg-slate-700 text-slate-400"}`}>{w.status}</span>
                  </div>
                ))}
                {detail.withdrawals.length === 0 && <p className="text-slate-500 text-sm">Nenhum saque.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
