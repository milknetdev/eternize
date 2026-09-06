import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  due_date: string | null;
  is_completed: number;
  completed_at: string | null;
  sort_order: number;
}

const CATEGORIES = [
  { id: "Cerimônia", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "Recepção", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "Decoração", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: "Foto & Vídeo", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "Vestuário", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: "Beleza", color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
  { id: "Convidados", color: "bg-green-100 text-green-700 border-green-200" },
  { id: "Documentação", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "Viagem", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { id: "Outros", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

export function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.id)));

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Outros");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await authFetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTasks = async () => {
    try {
      const res = await authFetch("/api/tasks/seed", { method: "POST" });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to seed tasks:", error);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await authFetch(`/api/tasks/${taskId}/toggle`, { method: "PUT" });
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, is_completed: t.is_completed ? 0 : 1 } : t
      ));
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const handleAddTask = async () => {
    if (!title.trim()) return;
    
    try {
      const res = await authFetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category,
          due_date: dueDate || null,
        }),
      });
      
      if (res.ok) {
        resetForm();
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !title.trim()) return;
    
    try {
      await authFetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category,
          due_date: dueDate || null,
          is_completed: editingTask.is_completed,
        }),
      });
      
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    
    try {
      await authFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Outros");
    setDueDate("");
    setShowAddForm(false);
    setEditingTask(null);
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setCategory(task.category || "Outros");
    setDueDate(task.due_date || "");
    setShowAddForm(true);
  };

  const toggleCategoryExpand = (cat: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(cat)) {
      newExpanded.delete(cat);
    } else {
      newExpanded.add(cat);
    }
    setExpandedCategories(newExpanded);
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by category
  const filteredTasks = filterCategory 
    ? tasks.filter(t => t.category === filterCategory)
    : tasks;
    
  const tasksByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = filteredTasks.filter(t => t.category === cat.id);
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Progress */}
      <div className="bg-gradient-to-r from-primary/10 to-gold-light/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Progresso do Planejamento</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {completedTasks} de {totalTasks} tarefas concluídas
            </p>
          </div>
          <div className="text-3xl font-bold text-primary">{progress}%</div>
        </div>
        
        <div className="h-4 bg-white/50 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-gold-light rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-border shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Comece seu planejamento
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Adicione tarefas para organizar seu casamento ou comece com nossa lista sugerida de 26 itens essenciais.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleSeedTasks}
              className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Usar lista sugerida
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar do zero
            </Button>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      {tasks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={showFilters ? "bg-primary/10 border-primary" : ""}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
              {filterCategory && (
                <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  1
                </span>
              )}
            </Button>
          </div>
          
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      )}

      {/* Filter Pills */}
      <AnimatePresence>
        {showFilters && tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            <button
              onClick={() => setFilterCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                !filterCategory
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map(cat => {
              const count = tasks.filter(t => t.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filterCategory === cat.id
                      ? "bg-primary text-white"
                      : `${cat.color} border hover:opacity-80`
                  }`}
                >
                  {cat.id} ({count})
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-5 border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground">
                {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
              </h4>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Contratar fotógrafo"
                  className="w-full px-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.id}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Data Limite</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Descrição (opcional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalhes ou anotações..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                  className="bg-gradient-to-r from-primary to-gold-light hover:opacity-90 text-white"
                >
                  {editingTask ? "Salvar" : "Adicionar"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks by Category */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const catTasks = tasksByCategory[cat.id];
            if (catTasks.length === 0) return null;
            
            const isExpanded = expandedCategories.has(cat.id);
            const completedInCat = catTasks.filter(t => t.is_completed).length;
            
            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleCategoryExpand(cat.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${cat.color}`}>
                      {cat.id}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {completedInCat}/{catTasks.length} concluídas
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border">
                        {catTasks.map(task => (
                          <div
                            key={task.id}
                            className={`flex items-start gap-3 p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                              task.is_completed ? "opacity-60" : ""
                            }`}
                          >
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {task.is_completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground/50 hover:text-primary transition-colors" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-0.5">{task.description}</p>
                              )}
                              {task.due_date && (
                                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(task.due_date).toLocaleDateString("pt-BR")}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEditing(task)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
