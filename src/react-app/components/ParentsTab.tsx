import React, { useState, useEffect } from "react";
import { authFetch } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import { Users, Loader2, Plus, Pencil, Trash2, X, Check, UserRound } from "lucide-react";

interface Parent {
  id: number;
  name: string;
  role: string | null;
  image_url: string | null;
  sort_order: number;
}

// The four fixed slots, in the order they should appear on the site.
const ROLES = [
  { value: "pai_noivo", label: "Pai do Noivo", side: "noivo" as const },
  { value: "mae_noivo", label: "Mãe do Noivo", side: "noivo" as const },
  { value: "pai_noiva", label: "Pai da Noiva", side: "noiva" as const },
  { value: "mae_noiva", label: "Mãe da Noiva", side: "noiva" as const },
];

const roleLabel = (role: string | null) =>
  ROLES.find((r) => r.value === role)?.label || "Outro responsável";

const roleOrder = (role: string | null) => {
  const i = ROLES.findIndex((r) => r.value === role);
  return i === -1 ? 90 : i;
};

const emptyForm = { name: "", role: "", image_url: "", sort_order: 0 };

export function ParentsTab() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [roleLocked, setRoleLocked] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showOnSite, setShowOnSite] = useState(true);

  useEffect(() => {
    fetchParents();
    fetchVisibility();
  }, []);

  const fetchVisibility = async () => {
    try {
      const res = await authFetch("/api/wedding");
      const data = await res.json();
      if (data) setShowOnSite(!(data.show_parents === 0 || data.show_parents === false));
    } catch {
      /* visibility flag is best-effort */
    }
  };

  const toggleVisibility = async () => {
    const newValue = !showOnSite;
    setShowOnSite(newValue);
    await authFetch("/api/wedding/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ show_parents: newValue ? 1 : 0 }),
    });
  };

  const fetchParents = async () => {
    try {
      const res = await authFetch("/api/parents");
      const data = await res.json();
      setParents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch parents:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = (role: string) => {
    setEditingId(null);
    setRoleLocked(!!role);
    setFormData({ ...emptyForm, role });
    setShowForm(true);
  };

  const openEdit = (item: Parent) => {
    setEditingId(item.id);
    setRoleLocked(false);
    setFormData({
      name: item.name || "",
      role: item.role || "",
      image_url: item.image_url || "",
      sort_order: item.sort_order || 0,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setRoleLocked(false);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    const payload = { ...formData, sort_order: roleOrder(formData.role) };
    try {
      if (editingId) {
        await authFetch(`/api/parents/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch("/api/parents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      closeForm();
      fetchParents();
    } catch (error) {
      console.error("Failed to save parent:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    await authFetch(`/api/parents/${id}`, { method: "DELETE" });
    fetchParents();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await authFetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setFormData((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const byRole = (role: string) => parents.find((p) => p.role === role);
  const others = parents.filter((p) => !ROLES.some((r) => r.value === p.role));

  const Slot = ({ role, label }: { role: string; label: string }) => {
    const item = byRole(role);
    if (!item) {
      return (
        <button
          onClick={() => openAdd(role)}
          className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/40 text-left transition-colors"
        >
          <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </span>
          <span className="text-sm">
            <span className="font-medium text-foreground">Adicionar {label.toLowerCase()}</span>
            <span className="block text-xs text-muted-foreground">Nome e foto (opcional)</span>
          </span>
        </button>
      );
    }
    return (
      <div className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-white">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        ) : (
          <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <UserRound className="w-5 h-5 text-primary" />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-medium truncate">{item.name}</p>
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
          <button onClick={() => openEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Pais</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Pai e mãe do noivo, pai e mãe da noiva. Aparecem na seção "Pais" do site.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleVisibility}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showOnSite ? "bg-green-500" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                showOnSite ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-muted-foreground">
            {showOnSite ? "Visível no site" : "Oculto no site"}
          </span>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold">
              {editingId ? "Editar" : `Adicionar ${roleLabel(formData.role).toLowerCase()}`}
            </h3>
            <button onClick={closeForm} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  placeholder="Nome completo"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Papel</label>
                {roleLocked ? (
                  <div className="px-3 py-2 rounded-lg border border-border bg-muted text-sm text-muted-foreground">
                    {roleLabel(formData.role)}
                  </div>
                ) : (
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  >
                    <option value="">Outro responsável</option>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Foto (opcional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  placeholder="URL ou faça upload"
                />
                <label className="cursor-pointer px-4 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  📷 Upload
                </label>
              </div>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {editingId ? "Salvar" : "Adicionar"}
            </Button>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <h3 className="font-semibold mb-3">Família do Noivo</h3>
          <div className="space-y-3">
            <Slot role="pai_noivo" label="Pai do Noivo" />
            <Slot role="mae_noivo" label="Mãe do Noivo" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <h3 className="font-semibold mb-3">Família da Noiva</h3>
          <div className="space-y-3">
            <Slot role="pai_noiva" label="Pai da Noiva" />
            <Slot role="mae_noiva" label="Mãe da Noiva" />
          </div>
        </div>
      </div>

      {/* Anything that doesn't fit the four slots */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Outros responsáveis</h3>
          <button
            onClick={() => openAdd("")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
        {others.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Padrastos, madrastas ou outras pessoas que você queira homenagear.
          </p>
        ) : (
          <div className="space-y-2">
            {others.map((item) => (
              <div key={item.id} className="group flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserRound className="w-4 h-4 text-primary" />
                  </span>
                )}
                <span className="flex-1 min-w-0 font-medium truncate">{item.name}</span>
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-2 hover:bg-muted rounded-lg" title="Editar">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {parents.length === 0 && !showForm && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          Comece adicionando o pai e a mãe de cada um nos campos acima.
        </div>
      )}
    </div>
  );
}
