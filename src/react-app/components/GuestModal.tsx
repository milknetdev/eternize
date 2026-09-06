import { useState } from "react";
import { Button } from "@/react-app/components/ui/button";
import { X, Check } from "lucide-react";
import { GUEST_LABELS } from "@/react-app/components/dashboard-types";
import type { Guest } from "@/react-app/components/dashboard-types";

// Guest Modal Component
export function GuestModal({
  guest,
  onClose,
  onSave,
}: {
  guest: Guest | null;
  onClose: () => void;
  onSave: (data: Partial<Guest> & { companions?: { name: string; is_child: boolean }[] }) => void;
}) {
  const [formData, setFormData] = useState({
    name: guest?.name || "",
    email: guest?.email || "",
    phone: guest?.phone || "",
    guests_count: guest?.guests_count || 1,
    rsvp_status: guest?.rsvp_status || "pending",
    dietary_restrictions: guest?.dietary_restrictions || "",
    label: guest?.label || "",
    is_child: guest?.is_child === 1,
  });
  
  const [companions, setCompanions] = useState<{ name: string; is_child: boolean }[]>(
    guest?.companions?.map(c => ({ name: c.name, is_child: c.is_child === 1 })) || []
  );
  const [numCompanions, setNumCompanions] = useState(
    guest?.companions?.length || 0
  );

  const handleNumCompanionsChange = (num: number) => {
    setNumCompanions(num);
    // Adjust companions array
    if (num > companions.length) {
      setCompanions([...companions, ...Array(num - companions.length).fill({ name: "", is_child: false })]);
    } else {
      setCompanions(companions.slice(0, num));
    }
  };

  const updateCompanion = (index: number, field: 'name' | 'is_child', value: string | boolean) => {
    const newCompanions = [...companions];
    newCompanions[index] = { ...newCompanions[index], [field]: value };
    setCompanions(newCompanions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-serif text-xl font-semibold">
            {guest ? "Editar Convidado" : "Novo Convidado"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              ...formData,
              is_child: formData.is_child ? 1 : 0,
              companions: companions.filter(c => c.name.trim()),
            } as any);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Convidado *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_child}
                onChange={(e) => setFormData({ ...formData, is_child: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span className="text-sm font-medium">Criança</span>
            </label>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {formData.is_child ? "👶 Criança" : "👤 Adulto"}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Etiqueta</label>
            <div className="grid grid-cols-2 gap-2">
              {GUEST_LABELS.map((label) => (
                <button
                  key={label.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, label: formData.label === label.value ? "" : label.value })}
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${
                    formData.label === label.value
                      ? `${label.color} ring-2 ring-offset-1 ring-primary`
                      : "bg-white hover:bg-muted/50"
                  }`}
                >
                  {label.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Quantidade de Acompanhantes</label>
            <select
              value={numCompanions}
              onChange={(e) => handleNumCompanionsChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "acompanhante" : "acompanhantes"}</option>
              ))}
            </select>
          </div>

          {numCompanions > 0 && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <label className="block text-sm font-medium">Acompanhantes</label>
              {Array.from({ length: numCompanions }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={companions[index]?.name || ""}
                    onChange={(e) => updateCompanion(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                    placeholder={`Acompanhante ${index + 1}`}
                  />
                  <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={companions[index]?.is_child || false}
                      onChange={(e) => updateCompanion(index, 'is_child', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/25"
                    />
                    <span className="text-xs">
                      {companions[index]?.is_child ? "👶" : "👤"}
                    </span>
                  </label>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Marque a caixa para indicar criança</p>
            </div>
          )}

          {guest && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.rsvp_status}
                onChange={(e) => setFormData({ ...formData, rsvp_status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              >
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="declined">Recusou</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Restrições Alimentares</label>
            <input
              type="text"
              value={formData.dietary_restrictions}
              onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              placeholder="Ex: Vegetariano, sem glúten..."
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
