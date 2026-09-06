import { Button } from "@/react-app/components/ui/button";
import { Gift, Plus, Pencil, Trash2, Search, Sparkles } from "lucide-react";
import type { GiftItem } from "@/react-app/components/dashboard-types";

// Gifts Tab Component
export function GiftsTab({
  gifts,
  searchQuery,
  onSearchChange,
  onAddGift,
  onOpenTemplates,
  onEditGift,
  onDeleteGift,
}: {
  gifts: GiftItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddGift: () => void;
  onOpenTemplates: () => void;
  onEditGift: (gift: GiftItem) => void;
  onDeleteGift: (id: number) => void;
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar presentes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onOpenTemplates} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Sparkles className="w-4 h-4 mr-2" />
            Lista Pronta
          </Button>
          <Button onClick={onAddGift} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Presente
          </Button>
        </div>
      </div>

      {gifts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-12 text-center">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold mb-2">Nenhum presente ainda</h3>
          <p className="text-muted-foreground mb-4">
            Adicione presentes à sua lista ou escolha uma lista pronta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onOpenTemplates} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Sparkles className="w-4 h-4 mr-2" />
              Usar Lista Pronta
            </Button>
            <Button onClick={onAddGift}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Manualmente
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {gifts.map((gift) => (
            <div key={gift.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden group">
              {gift.image_url ? (
                <img
                  src={gift.image_url}
                  alt={gift.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <Gift className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium mb-1 line-clamp-1">{gift.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {gift.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg font-semibold text-primary">
                    R$ {gift.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    gift.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {gift.is_available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onEditGift(gift)}
                    className="flex-1 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 inline mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDeleteGift(gift.id)}
                    className="py-2 px-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
