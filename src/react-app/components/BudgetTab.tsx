import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Pencil,
  Sparkles,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Wallet,
  X,
  Building2,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Expense {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  vendor_name: string | null;
  estimated_amount: number;
  paid_amount: number;
  is_paid: number;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
}

const CATEGORIES = [
  { id: "Local", color: "#8B5CF6", bg: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "Buffet", color: "#F59E0B", bg: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "Foto & Vídeo", color: "#3B82F6", bg: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "Música", color: "#EC4899", bg: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: "Vestuário", color: "#EF4444", bg: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: "Beleza", color: "#D946EF", bg: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
  { id: "Papelaria", color: "#14B8A6", bg: "bg-teal-100 text-teal-700 border-teal-200" },
  { id: "Outros", color: "#6B7280", bg: "bg-gray-100 text-gray-700 border-gray-200" },
];

export function BudgetTab() {
  const [totalBudget, setTotalBudget] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Local",
    vendor_name: "",
    estimated_amount: "",
    paid_amount: "",
    is_paid: false,
    due_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const res = await authFetch("/api/budget");
      const data = await res.json();
      setTotalBudget(data.total_budget);
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error("Error fetching budget:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async () => {
    try {
      await authFetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_budget: parseFloat(tempBudget) || null }),
      });
      setTotalBudget(parseFloat(tempBudget) || null);
      setEditingBudget(false);
    } catch (err) {
      console.error("Error saving budget:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        estimated_amount: parseFloat(formData.estimated_amount) || 0,
        paid_amount: parseFloat(formData.paid_amount) || 0,
      };

      if (editingExpense) {
        await authFetch(`/api/expenses/${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchBudget();
      resetForm();
    } catch (err) {
      console.error("Error saving expense:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
    try {
      await authFetch(`/api/expenses/${id}`, { method: "DELETE" });
      fetchBudget();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleSeedExpenses = async () => {
    try {
      await authFetch("/api/expenses/seed", { method: "POST" });
      fetchBudget();
    } catch (err) {
      console.error("Error seeding expenses:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "Local",
      vendor_name: "",
      estimated_amount: "",
      paid_amount: "",
      is_paid: false,
      due_date: "",
      notes: "",
    });
    setShowAddForm(false);
    setEditingExpense(null);
  };

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      description: expense.description || "",
      category: expense.category || "Outros",
      vendor_name: expense.vendor_name || "",
      estimated_amount: expense.estimated_amount.toString(),
      paid_amount: expense.paid_amount.toString(),
      is_paid: expense.is_paid === 1,
      due_date: expense.due_date || "",
      notes: expense.notes || "",
    });
    setShowAddForm(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate totals
  const totalEstimated = expenses.reduce((sum, e) => sum + e.estimated_amount, 0);
  const totalPaid = expenses.reduce((sum, e) => sum + e.paid_amount, 0);
  const totalPending = totalEstimated - totalPaid;
  const budgetRemaining = totalBudget ? totalBudget - totalEstimated : null;

  // Category breakdown for chart
  const categoryData = CATEGORIES.map(cat => {
    const catExpenses = expenses.filter(e => e.category === cat.id);
    const total = catExpenses.reduce((sum, e) => sum + e.estimated_amount, 0);
    return { name: cat.id, value: total, color: cat.color };
  }).filter(c => c.value > 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A574]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-gradient-to-br from-[#D4A574]/10 to-[#D4A574]/5 border border-[#D4A574]/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Orçamento Total</span>
            <Wallet className="w-5 h-5 text-[#D4A574]" />
          </div>
          {editingBudget ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                placeholder="R$ 0,00"
                className="w-full px-2 py-1 text-lg font-bold border rounded"
              />
              <Button size="sm" onClick={handleSaveBudget}>OK</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">
                {totalBudget ? formatCurrency(totalBudget) : "Não definido"}
              </span>
              <button
                onClick={() => {
                  setTempBudget(totalBudget?.toString() || "");
                  setEditingBudget(true);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Estimated Total */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Estimado</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalEstimated)}
          </span>
          {budgetRemaining !== null && (
            <p className={`text-sm mt-1 ${budgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              {budgetRemaining >= 0 ? "Dentro do orçamento" : `${formatCurrency(Math.abs(budgetRemaining))} acima`}
            </p>
          )}
        </div>

        {/* Paid */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Já Pago</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(totalPaid)}
          </span>
          <p className="text-sm text-gray-400 mt-1">
            {totalEstimated > 0 ? Math.round((totalPaid / totalEstimated) * 100) : 0}% do total
          </p>
        </div>

        {/* Pending */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">A Pagar</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-600">
            {formatCurrency(totalPending)}
          </span>
          <p className="text-sm text-gray-400 mt-1">
            {expenses.filter(e => !e.is_paid).length} itens pendentes
          </p>
        </div>
      </div>

      {/* Chart & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        {categoryData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:col-span-1">
            <h3 className="font-medium text-gray-800 mb-4">Gastos por Categoria</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-600">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions & List */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 ${categoryData.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Despesas</h3>
            <div className="flex gap-2">
              {expenses.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeedExpenses}
                  className="text-[#D4A574] border-[#D4A574]/30 hover:bg-[#D4A574]/10"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Usar lista sugerida
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="bg-[#D4A574] hover:bg-[#C49464]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Expense List */}
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma despesa cadastrada</p>
              <p className="text-sm mt-1">Use a lista sugerida ou adicione manualmente</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {CATEGORIES.map(cat => {
                const catExpenses = expenses.filter(e => e.category === cat.id);
                if (catExpenses.length === 0) return null;
                return (
                  <div key={cat.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium text-gray-700">{cat.id}</span>
                      <span className="text-xs text-gray-400">
                        {formatCurrency(catExpenses.reduce((s, e) => s + e.estimated_amount, 0))}
                      </span>
                    </div>
                    <div className="space-y-1 pl-5">
                      {catExpenses.map(expense => (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={async () => {
                                const newPaid = expense.is_paid ? 0 : expense.estimated_amount;
                                await authFetch(`/api/expenses/${expense.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    ...expense,
                                    is_paid: !expense.is_paid,
                                    paid_amount: newPaid,
                                  }),
                                });
                                fetchBudget();
                              }}
                              className="flex-shrink-0"
                            >
                              {expense.is_paid ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${expense.is_paid ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                {expense.name}
                              </p>
                              {expense.vendor_name && (
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {expense.vendor_name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-800">
                                {formatCurrency(expense.estimated_amount)}
                              </p>
                              {expense.paid_amount > 0 && expense.paid_amount < expense.estimated_amount && (
                                <p className="text-xs text-green-600">
                                  Pago: {formatCurrency(expense.paid_amount)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditForm(expense)}
                                className="p-1 text-gray-400 hover:text-blue-500"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingExpense ? "Editar Despesa" : "Nova Despesa"}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da despesa *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574]"
                    placeholder="Ex: Fotógrafo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574]"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574]"
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Estimado *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.estimated_amount}
                      onChange={(e) => setFormData({ ...formData, estimated_amount: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574]"
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Pago
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574]"
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574]"
                    placeholder="Anotações adicionais..."
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_paid}
                    onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                    className="w-4 h-4 text-[#D4A574] border-gray-300 rounded focus:ring-[#D4A574]"
                  />
                  <span className="text-sm text-gray-700">Marcar como pago</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#D4A574] hover:bg-[#C49464]"
                  >
                    {editingExpense ? "Salvar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
