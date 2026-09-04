import { useState } from "react";
import { Button } from "@/react-app/components/ui/button";
import { X, Check } from "lucide-react";
import type { Wedding } from "@/react-app/components/dashboard-types";

// Wedding Modal Component
export function WeddingModal({
  wedding,
  onClose,
  onSave,
}: {
  wedding: Wedding | null;
  onClose: () => void;
  onSave: (data: Partial<Wedding>) => void;
}) {
  const [formData, setFormData] = useState({
    partner1_name: wedding?.partner1_name || "",
    partner2_name: wedding?.partner2_name || "",
    wedding_date: wedding?.wedding_date || "",
    venue_name: wedding?.venue_name || "",
    venue_address: wedding?.venue_address || "",
    custom_url: wedding?.custom_url || "",
    pix_key: wedding?.pix_key || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-serif text-xl font-semibold">Configurar Casamento</h2>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome 1</label>
              <input
                type="text"
                value={formData.partner1_name}
                onChange={(e) => setFormData({ ...formData, partner1_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="Ana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome 2</label>
              <input
                type="text"
                value={formData.partner2_name}
                onChange={(e) => setFormData({ ...formData, partner2_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="João"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data do Casamento</label>
            <input
              type="date"
              value={formData.wedding_date}
              onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Local</label>
            <input
              type="text"
              value={formData.venue_name}
              onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              placeholder="Espaço Villa Garden"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endereço</label>
            <input
              type="text"
              value={formData.venue_address}
              onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              placeholder="Rua das Flores, 123 - São Paulo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Personalizada</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">eternize.com/c/</span>
              <input
                type="text"
                value={formData.custom_url}
                onChange={(e) => setFormData({ ...formData, custom_url: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="ana-e-joao"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chave PIX</label>
            <input
              type="text"
              value={formData.pix_key}
              onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              placeholder="email@exemplo.com ou CPF"
            />
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
