import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { X, Sparkles, Home, Plus, Check, Search, Loader2 } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface GiftTemplate {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
}

interface Category {
  id: number;
  name: string;
  color_class: string;
}

interface ListType {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface GiftTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGifts: (gifts: { name: string; description: string; price: number; category: string }[]) => void;
}

export function GiftTemplateSelector({ isOpen, onClose, onAddGifts }: GiftTemplateSelectorProps) {
  const [listTypes, setListTypes] = useState<ListType[]>([]);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<GiftTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedGifts, setSelectedGifts] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchListTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeListId) {
      fetchTemplates(activeListId);
    }
  }, [activeListId]);

  const fetchListTypes = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/public/gift-templates");
      if (res.ok) {
        const data = await res.json();
        setListTypes(data.listTypes || []);
        if (data.listTypes?.length > 0) {
          setActiveListId(data.listTypes[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching list types:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async (listId: number) => {
    setLoadingTemplates(true);
    try {
      const res = await authFetch(`/api/public/gift-templates/${listId}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setCategories(data.categories || []);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const filteredGifts = templates.filter(gift => {
    const matchesCategory = !selectedCategory || gift.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gift.description && gift.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleGift = (gift: GiftTemplate) => {
    const newSelected = new Set(selectedGifts);
    if (newSelected.has(gift.id)) {
      newSelected.delete(gift.id);
    } else {
      newSelected.add(gift.id);
    }
    setSelectedGifts(newSelected);
  };

  const isSelected = (gift: GiftTemplate) => {
    return selectedGifts.has(gift.id);
  };

  const handleAddSelected = () => {
    const giftsToAdd = templates
      .filter(t => selectedGifts.has(t.id))
      .map(t => ({
        name: t.name,
        description: t.description || "",
        price: t.price,
        category: t.category || "",
        image_url: t.image_url || null
      }));
    
    if (giftsToAdd.length > 0) {
      onAddGifts(giftsToAdd);
      setSelectedGifts(new Set());
      onClose();
    }
  };

  const selectAll = () => {
    const newSelected = new Set(selectedGifts);
    filteredGifts.forEach(gift => {
      newSelected.add(gift.id);
    });
    setSelectedGifts(newSelected);
  };

  const clearSelection = () => {
    const newSelected = new Set(selectedGifts);
    filteredGifts.forEach(gift => {
      newSelected.delete(gift.id);
    });
    setSelectedGifts(newSelected);
  };

  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.color_class || "bg-gray-100 text-gray-700";
  };

  const activeList = listTypes.find(l => l.id === activeListId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">Adicionar Presentes</h2>
            <p className="text-muted-foreground mt-1">Escolha itens da lista pronta ou adicione manualmente</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* List Type Tabs */}
            <div className="p-4 border-b shrink-0">
              <div className="flex gap-2 flex-wrap">
                {listTypes.map((list, index) => (
                  <button
                    key={list.id}
                    onClick={() => { setActiveListId(list.id); setSelectedCategory(null); }}
                    className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      activeListId === list.id
                        ? index === 0 
                          ? "bg-primary text-white shadow-lg"
                          : "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index === 0 ? <Home className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    {list.name}
                  </button>
                ))}
              </div>
              
              {activeList && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  {activeList.description || "Escolha os itens que deseja adicionar à sua lista"}
                </p>
              )}
            </div>

            {/* Search and Categories */}
            <div className="p-4 border-b shrink-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar presentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat.name
                        ? "bg-gray-900 text-white"
                        : `${cat.color_class} hover:opacity-80`
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Gift Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">
                      {filteredGifts.length} presente{filteredGifts.length !== 1 ? "s" : ""} disponíve{filteredGifts.length !== 1 ? "is" : "l"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={selectAll} className="text-sm text-primary hover:underline">
                        Selecionar todos
                      </button>
                      <span className="text-gray-300">|</span>
                      <button onClick={clearSelection} className="text-sm text-muted-foreground hover:underline">
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredGifts.map((gift) => (
                      <button
                        key={gift.id}
                        onClick={() => toggleGift(gift)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected(gift)
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {gift.category && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(gift.category)}`}>
                                  {gift.category}
                                </span>
                              </div>
                            )}
                            <h3 className="font-medium text-gray-900 line-clamp-1">{gift.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {gift.description}
                            </p>
                            <p className="font-serif font-semibold text-primary mt-2">
                              R$ {gift.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected(gift)
                              ? "bg-primary border-primary text-white"
                              : "border-gray-300"
                          }`}>
                            {isSelected(gift) && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {filteredGifts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum presente encontrado
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between shrink-0 rounded-b-2xl">
              <span className="text-sm font-medium">
                {selectedGifts.size} presente{selectedGifts.size !== 1 ? "s" : ""} selecionado{selectedGifts.size !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddSelected}
                  disabled={selectedGifts.size === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar {selectedGifts.size > 0 ? `(${selectedGifts.size})` : ""}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
