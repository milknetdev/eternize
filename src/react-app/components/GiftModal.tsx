import { useState } from "react";
import { authFetch } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import { X, Check } from "lucide-react";
import type { GiftItem } from "@/react-app/components/dashboard-types";

// Gift Modal Component
export function GiftModal({
  gift,
  onClose,
  onSave,
}: {
  gift: GiftItem | null;
  onClose: () => void;
  onSave: (data: Partial<GiftItem>) => void;
}) {
  const [formData, setFormData] = useState({
    name: gift?.name || "",
    description: gift?.description || "",
    price: gift?.price || 0,
    image_url: gift?.image_url || "",
    category: gift?.category || "Outros",
    quota_total: gift?.quota_total || 1,
    is_available: gift?.is_available ?? 1,
  });

  const categories = [
    { value: "Relacionamento", label: "Relacionamento" },
    { value: "Sobrevivência", label: "Sobrevivência" },
    { value: "Finanças", label: "Finanças" },
    { value: "Diversão", label: "Diversão" },
    { value: "Pets", label: "Pets" },
    { value: "Futuro", label: "Futuro" },
    { value: "Cozinha", label: "Cozinha" },
    { value: "Quarto", label: "Quarto" },
    { value: "Sala", label: "Sala" },
    { value: "Banheiro", label: "Banheiro" },
    { value: "Eletrônicos", label: "Eletrônicos" },
    { value: "Experiências", label: "Experiências" },
    { value: "Contribuição", label: "Contribuição" },
    { value: "Outros", label: "Outros" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-serif text-xl font-semibold">
            {gift ? "Editar Presente" : "Novo Presente"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Imagem do Presente</label>
            {formData.image_url && (
              <div className="mb-2 relative">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image_url: "" })}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="URL ou faça upload"
              />
              <label className="cursor-pointer px-4 py-2 rounded-lg border bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm font-medium">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const res = await authFetch("/api/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (data.url) {
                        setFormData((prev: typeof formData) => ({ ...prev, image_url: data.url }));
                      }
                    } catch (err) {
                      console.error("Upload failed:", err);
                    }
                  }}
                />
                📷 Upload
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={!!formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="available" className="text-sm font-medium">Disponível para compra</label>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <Check className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </form>
      </div>
    </div>
  );
}
