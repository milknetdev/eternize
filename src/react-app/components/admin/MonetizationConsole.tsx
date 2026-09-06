import { authFetch } from "@/react-app/lib/api";
import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  Check,
  Plus,
  Pencil,
  Trash2,
  X,
  Percent,
  Wallet,
  CreditCard,
  Receipt,
} from "lucide-react";

interface CardOption {
  id: number;
  name: string;
  price: number;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Revenue {
  orderCount: number;
  commissionTotal: number;
  cardTotal: number;
  feeTotal: number;
  platformTotal: number;
  coupleTotal: number;
  grossTotal: number;
}

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary";
const primaryBtn =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#bd7d17] via-primary to-[#e6bd54] shadow-sm shadow-primary/25 hover:shadow-primary/40 transition-shadow disabled:opacity-50";

export default function MonetizationConsole() {
  const [loading, setLoading] = useState(true);
  const [commission, setCommission] = useState("2");
  const [fee, setFee] = useState("12");
  const [savedSettings, setSavedSettings] = useState({ commission: "2", fee: "12" });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [cards, setCards] = useState<CardOption[]>([]);

  const [editing, setEditing] = useState<CardOption | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "", is_active: true });
  const [savingCard, setSavingCard] = useState(false);

  const load = async () => {
    try {
      const [s, r, c] = await Promise.all([
        authFetch("/api/admin/platform/settings").then((x) => x.json()),
        authFetch("/api/admin/platform/revenue").then((x) => x.json()),
        authFetch("/api/admin/platform/cards").then((x) => x.json()),
      ]);
      setCommission(String(s.commission_pct ?? 2));
      setFee(String(s.maintenance_fee ?? 12));
      setSavedSettings({ commission: String(s.commission_pct ?? 2), fee: String(s.maintenance_fee ?? 12) });
      setRevenue(r);
      setCards(c.cards || []);
    } catch (e) {
      console.error("Failed to load monetization data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const settingsDirty =
    commission.trim() !== savedSettings.commission || fee.trim() !== savedSettings.fee;

  const saveSettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      await authFetch("/api/admin/platform/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commission_pct: Number(commission) || 0,
          maintenance_fee: Number(fee) || 0,
        }),
      });
      setSavedSettings({ commission: commission.trim(), fee: fee.trim() });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", price: "", description: "", is_active: true });
    setShowForm(true);
  };
  const openEdit = (c: CardOption) => {
    setEditing(c);
    setForm({
      name: c.name,
      price: String(c.price),
      description: c.description || "",
      is_active: !!c.is_active,
    });
    setShowForm(true);
  };

  const saveCard = async () => {
    if (!form.name.trim()) return;
    setSavingCard(true);
    try {
      const body = JSON.stringify({
        name: form.name.trim(),
        price: Number(form.price) || 0,
        description: form.description || null,
        is_active: form.is_active,
        sort_order: editing?.sort_order ?? 0,
      });
      if (editing) {
        await authFetch(`/api/admin/platform/cards/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } else {
        await authFetch("/api/admin/platform/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCard(false);
    }
  };

  const deleteCard = async (id: number) => {
    if (!confirm("Excluir este nível de cartão?")) return;
    await authFetch(`/api/admin/platform/cards/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Monetização</h3>
        <p className="text-sm text-muted-foreground">
          O site é grátis para o casal. A plataforma ganha por compra de presente:
          comissão %, cartão de presente pago e taxa fixa por compra.
        </p>
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Wallet className="w-4 h-4 text-primary" /> Receita da plataforma
          </div>
          <p className="text-2xl font-semibold text-primary">{brl(revenue?.platformTotal || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">{revenue?.orderCount || 0} pedidos pagos</p>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Percent className="w-4 h-4" /> Comissões
          </div>
          <p className="text-2xl font-semibold">{brl(revenue?.commissionTotal || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CreditCard className="w-4 h-4" /> Cartões
          </div>
          <p className="text-2xl font-semibold">{brl(revenue?.cardTotal || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Receipt className="w-4 h-4" /> Taxas de manutenção
          </div>
          <p className="text-2xl font-semibold">{brl(revenue?.feeTotal || 0)}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Volume bruto de presentes: {brl(revenue?.grossTotal || 0)} · repassado aos casais:{" "}
        {brl(revenue?.coupleTotal || 0)}
      </p>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <h4 className="font-semibold mb-4">Configuração</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm text-muted-foreground mb-1">Comissão sobre o presente (%)</span>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-muted-foreground mb-1">Taxa de manutenção por compra (R$)</span>
            <input
              type="number"
              step="1"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>
        <button
          onClick={saveSettings}
          disabled={savingSettings || !settingsDirty}
          className={`mt-4 ${primaryBtn}`}
        >
          {savingSettings ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : settingsSaved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {settingsSaved ? "Salvo" : "Salvar configuração"}
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          Vale para as próximas compras. Pedidos já feitos guardam o valor da época.
        </p>
      </div>

      {/* Card options */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Níveis de cartão de presente</h4>
          <button onClick={openNew} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            <Plus className="w-4 h-4" /> Novo nível
          </button>
        </div>

        {showForm && (
          <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{editing ? "Editar nível" : "Novo nível"}</span>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-muted rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm text-muted-foreground mb-1">Nome</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-muted-foreground mb-1">Preço (R$)</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-sm text-muted-foreground mb-1">Descrição</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/25"
                />
                Ativo (aparece no checkout)
              </label>
            </div>
            <button onClick={saveCard} disabled={savingCard || !form.name.trim()} className={`mt-3 ${primaryBtn}`}>
              {savingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editing ? "Salvar" : "Adicionar"}
            </button>
          </div>
        )}

        <div className="divide-y divide-border">
          {cards.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.name}</span>
                  {!c.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">oculto</span>
                  )}
                </div>
                {c.description && <p className="text-sm text-muted-foreground truncate">{c.description}</p>}
              </div>
              <span className="text-primary font-semibold whitespace-nowrap">
                {c.price > 0 ? brl(c.price) : "Grátis"}
              </span>
              <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteCard(c.id)} className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {cards.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground text-center">Nenhum nível cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
