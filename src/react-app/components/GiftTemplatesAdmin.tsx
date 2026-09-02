import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  Tag,
  Save,
  X,
  Palette,
} from "lucide-react";

interface ListType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: number;
  sort_order: number;
  item_count: number;
}

interface GiftTemplate {
  id: number;
  list_type_id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_active: number;
  sort_order: number;
}

interface Category {
  id: number;
  list_type_id: number;
  name: string;
  color_class: string | null;
  sort_order: number;
}

const COLOR_OPTIONS = [
  { value: "bg-orange-100 text-orange-700", label: "Laranja", preview: "bg-orange-500" },
  { value: "bg-purple-100 text-purple-700", label: "Roxo", preview: "bg-purple-500" },
  { value: "bg-cyan-100 text-cyan-700", label: "Ciano", preview: "bg-cyan-500" },
  { value: "bg-amber-100 text-amber-700", label: "Âmbar", preview: "bg-amber-500" },
  { value: "bg-blue-100 text-blue-700", label: "Azul", preview: "bg-blue-500" },
  { value: "bg-pink-100 text-pink-700", label: "Rosa", preview: "bg-pink-500" },
  { value: "bg-red-100 text-red-700", label: "Vermelho", preview: "bg-red-500" },
  { value: "bg-yellow-100 text-yellow-700", label: "Amarelo", preview: "bg-yellow-500" },
  { value: "bg-green-100 text-green-700", label: "Verde", preview: "bg-green-500" },
  { value: "bg-indigo-100 text-indigo-700", label: "Índigo", preview: "bg-indigo-500" },
  { value: "bg-teal-100 text-teal-700", label: "Teal", preview: "bg-teal-500" },
  { value: "bg-gray-100 text-gray-700", label: "Cinza", preview: "bg-gray-500" },
];

export default function GiftTemplatesAdmin() {
  const [listTypes, setListTypes] = useState<ListType[]>([]);
  const [expandedListId, setExpandedListId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<GiftTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Forms
  const [showListForm, setShowListForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingList, setEditingList] = useState<ListType | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<GiftTemplate | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form data
  const [listFormData, setListFormData] = useState({ name: "", description: "" });
  const [templateFormData, setTemplateFormData] = useState({
    name: "", description: "", price: "", category: "", image_url: ""
  });
  const [categoryFormData, setCategoryFormData] = useState({ name: "", color_class: "bg-gray-100 text-gray-700" });

  useEffect(() => {
    fetchListTypes();
  }, []);

  const fetchListTypes = async () => {
    try {
      const res = await authFetch("/api/admin/gift-list-types");
      if (res.ok) {
        const data = await res.json();
        setListTypes(data.listTypes || []);
      }
    } catch (error) {
      console.error("Error fetching list types:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplatesForList = async (listId: number) => {
    try {
      const res = await authFetch(`/api/admin/gift-list-types/${listId}/templates`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const toggleExpand = (listId: number) => {
    if (expandedListId === listId) {
      setExpandedListId(null);
      setTemplates([]);
      setCategories([]);
    } else {
      setExpandedListId(listId);
      fetchTemplatesForList(listId);
    }
  };

  // List Type CRUD
  const handleSaveList = async () => {
    setSaving(true);
    try {
      const url = editingList 
        ? `/api/admin/gift-list-types/${editingList.id}`
        : "/api/admin/gift-list-types";
      const method = editingList ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listFormData),
      });
      
      if (res.ok) {
        setShowListForm(false);
        setEditingList(null);
        setListFormData({ name: "", description: "" });
        fetchListTypes();
      }
    } catch (error) {
      console.error("Error saving list type:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteList = async (id: number) => {
    if (!confirm("Tem certeza? Isso irá excluir todos os templates e categorias desta lista.")) return;
    
    try {
      await authFetch(`/api/admin/gift-list-types/${id}`, { method: "DELETE" });
      fetchListTypes();
      if (expandedListId === id) {
        setExpandedListId(null);
        setTemplates([]);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error deleting list type:", error);
    }
  };

  // Template CRUD
  const handleSaveTemplate = async () => {
    if (!expandedListId) return;
    setSaving(true);
    
    try {
      const url = editingTemplate 
        ? `/api/admin/gift-templates/${editingTemplate.id}`
        : "/api/admin/gift-templates";
      const method = editingTemplate ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          list_type_id: expandedListId,
          name: templateFormData.name,
          description: templateFormData.description,
          price: parseFloat(templateFormData.price) || 0,
          category: templateFormData.category,
          image_url: templateFormData.image_url,
        }),
      });
      
      if (res.ok) {
        setShowTemplateForm(false);
        setEditingTemplate(null);
        setTemplateFormData({ name: "", description: "", price: "", category: "", image_url: "" });
        fetchTemplatesForList(expandedListId);
        fetchListTypes();
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Excluir este item?")) return;
    if (!expandedListId) return;
    
    try {
      await authFetch(`/api/admin/gift-templates/${id}`, { method: "DELETE" });
      fetchTemplatesForList(expandedListId);
      fetchListTypes();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  // Category CRUD
  const handleSaveCategory = async () => {
    if (!expandedListId) return;
    setSaving(true);
    
    try {
      const url = editingCategory 
        ? `/api/admin/gift-categories/${editingCategory.id}`
        : "/api/admin/gift-categories";
      const method = editingCategory ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          list_type_id: expandedListId,
          name: categoryFormData.name,
          color_class: categoryFormData.color_class,
        }),
      });
      
      if (res.ok) {
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryFormData({ name: "", color_class: "bg-gray-100 text-gray-700" });
        fetchTemplatesForList(expandedListId);
      }
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Excluir esta categoria?")) return;
    if (!expandedListId) return;
    
    try {
      await authFetch(`/api/admin/gift-categories/${id}`, { method: "DELETE" });
      fetchTemplatesForList(expandedListId);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const openEditList = (list: ListType) => {
    setEditingList(list);
    setListFormData({ name: list.name, description: list.description || "" });
    setShowListForm(true);
  };

  const openEditTemplate = (template: GiftTemplate) => {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      description: template.description || "",
      price: template.price.toString(),
      category: template.category || "",
      image_url: template.image_url || "",
    });
    setShowTemplateForm(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      color_class: category.color_class || "bg-gray-100 text-gray-700",
    });
    setShowCategoryForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Templates de Presentes</h3>
        <button
          onClick={() => {
            setEditingList(null);
            setListFormData({ name: "", description: "" });
            setShowListForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Lista
        </button>
      </div>

      {/* List Types */}
      <div className="space-y-4">
        {listTypes.map((list) => (
          <div key={list.id} className="bg-slate-700/50 rounded-xl border border-slate-600 overflow-hidden">
            {/* List Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-600/50 transition-colors"
              onClick={() => toggleExpand(list.id)}
            >
              <div className="flex items-center gap-3">
                {expandedListId === list.id ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
                <Package className="w-5 h-5 text-gold-400" />
                <div>
                  <h4 className="text-white font-medium">{list.name}</h4>
                  <p className="text-sm text-slate-400">
                    {list.item_count} itens • {list.description || "Sem descrição"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className={`px-2 py-1 rounded text-xs ${list.is_active ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-400"}`}>
                  {list.is_active ? "Ativa" : "Inativa"}
                </span>
                <button
                  onClick={() => openEditList(list)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedListId === list.id && (
              <div className="border-t border-slate-600 p-4 space-y-6">
                {/* Categories Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Categorias
                    </h5>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryFormData({ name: "", color_class: "bg-gray-100 text-gray-700" });
                        setShowCategoryForm(true);
                      }}
                      className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${cat.color_class}`}
                      >
                        {cat.name}
                        <button
                          onClick={() => openEditCategory(cat)}
                          className="hover:opacity-70"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-sm text-slate-500">Nenhuma categoria</p>
                    )}
                  </div>
                </div>

                {/* Templates Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-slate-300">Itens ({templates.length})</h5>
                    <button
                      onClick={() => {
                        setEditingTemplate(null);
                        setTemplateFormData({ name: "", description: "", price: "", category: "", image_url: "" });
                        setShowTemplateForm(true);
                      }}
                      className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar Item
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium truncate">{template.name}</p>
                            {template.category && (
                              <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded">
                                {template.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 truncate">{template.description || "Sem descrição"}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="text-gold-400 font-medium whitespace-nowrap">
                            R$ {template.price.toLocaleString("pt-BR")}
                          </span>
                          <button
                            onClick={() => openEditTemplate(template)}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {templates.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">Nenhum item nesta lista</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {listTypes.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma lista de presentes criada</p>
          </div>
        )}
      </div>

      {/* List Type Form Modal */}
      {showListForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingList ? "Editar Lista" : "Nova Lista"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={listFormData.name}
                  onChange={(e) => setListFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Ex: Lista Lua de Mel"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                <textarea
                  value={listFormData.description}
                  onChange={(e) => setListFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  rows={2}
                  placeholder="Descrição da lista..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowListForm(false); setEditingList(null); }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveList}
                disabled={saving || !listFormData.name}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Form Modal */}
      {showTemplateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingTemplate ? "Editar Item" : "Novo Item"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={templateFormData.name}
                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                <textarea
                  value={templateFormData.description}
                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    value={templateFormData.price}
                    onChange={(e) => setTemplateFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                  <select
                    value={templateFormData.category}
                    onChange={(e) => setTemplateFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Imagem (opcional)</label>
                {templateFormData.image_url && (
                  <div className="mb-2 relative">
                    <img
                      src={templateFormData.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setTemplateFormData(prev => ({ ...prev, image_url: "" }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateFormData.image_url}
                    onChange={(e) => setTemplateFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="URL ou faça upload"
                  />
                  <label className="cursor-pointer px-4 py-2 rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm font-medium text-slate-300">
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
                            setTemplateFormData(prev => ({ ...prev, image_url: data.url }));
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
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowTemplateForm(false); setEditingTemplate(null); }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving || !templateFormData.name}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Ex: Cozinha"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Cor
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCategoryFormData(prev => ({ ...prev, color_class: color.value }))}
                      className={`w-full aspect-square rounded-lg ${color.preview} ${
                        categoryFormData.color_class === color.value 
                          ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800" 
                          : ""
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Preview</label>
                <span className={`inline-block px-3 py-1.5 rounded-full text-sm ${categoryFormData.color_class}`}>
                  {categoryFormData.name || "Exemplo"}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={saving || !categoryFormData.name}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
