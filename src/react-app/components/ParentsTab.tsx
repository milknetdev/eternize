import React, { useState, useEffect } from "react";
import { authFetch } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import { Users, Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react";

// =====================
// Parents (Pais) Tab Component
// =====================
export function ParentsTab() {
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image_url: '',
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [showOnSite, setShowOnSite] = useState(true);

  useEffect(() => {
    fetchParents();
    fetchVisibility();
  }, []);

  const fetchVisibility = async () => {
    try {
      const res = await authFetch('/api/wedding');
      const data = await res.json();
      if (data) setShowOnSite(!(data.show_parents === 0 || data.show_parents === false));
    } catch { /* visibility flag is best-effort */ }
  };

  const toggleVisibility = async () => {
    const newValue = !showOnSite;
    setShowOnSite(newValue);
    await authFetch('/api/wedding/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_parents: newValue ? 1 : 0 }),
    });
  };

  const fetchParents = async () => {
    try {
      const res = await authFetch('/api/parents');
      const data = await res.json();
      setParents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingItem) {
        await authFetch(`/api/parents/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await authFetch('/api/parents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', role: '', image_url: '', sort_order: 0 });
      fetchParents();
    } catch (error) {
      console.error('Failed to save parent:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      role: item.role || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    await authFetch(`/api/parents/${id}`, { method: 'DELETE' });
    fetchParents();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await authFetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image_url: data.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Pais</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {parents.length} {parents.length === 1 ? 'responsável' : 'responsáveis'} cadastrados
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleVisibility}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOnSite ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnSite ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-muted-foreground">{showOnSite ? 'Visível no site' : 'Oculto no site'}</span>
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', role: '', image_url: '', sort_order: 0 });
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Pai/Mãe
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold">
              {editingItem ? 'Editar' : 'Novo Pai/Mãe'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingItem(null); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Função</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                >
                  <option value="">Selecione</option>
                  <option value="pai_noivo">Pai do Noivo</option>
                  <option value="mae_noivo">Mãe do Noivo</option>
                  <option value="pai_noiva">Pai da Noiva</option>
                  <option value="mae_noiva">Mãe da Noiva</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagem</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  placeholder="URL ou faça upload"
                />
                <label className="cursor-pointer px-4 py-2 rounded-lg border bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm font-medium">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  📷 Upload
                </label>
              </div>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordem</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-32 px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {editingItem ? 'Atualizar' : 'Adicionar'}
            </Button>
          </form>
        </div>
      )}

      {parents.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-card rounded-xl border p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold mb-2">Nenhum pai/mãe cadastrado</h3>
          <p className="text-muted-foreground mb-4">Adicione os pais dos noivos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parents.map((item) => (
            <div key={item.id} className="bg-white dark:bg-card rounded-xl border overflow-hidden group">
              {item.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300 mt-1">
                        {item.role.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
