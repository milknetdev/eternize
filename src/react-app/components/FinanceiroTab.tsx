import { useState, useEffect } from "react";
import { authFetch } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import { Gift, Loader2, X, Check, Clock, DollarSign, Wallet, ArrowDownCircle, ArrowUpCircle, AlertCircle } from "lucide-react";

// Financeiro Tab Component
interface GiftOrder {
  id: number;
  gift_id: number;
  gift_name: string;
  gift_image: string;
  guest_name: string;
  guest_email: string;
  amount: number;
  commission_amount: number;
  couple_amount: number;
  payment_status: string;
  is_converted: number;
  converted_at: string;
  created_at: string;
}

interface Withdrawal {
  id: number;
  amount: number;
  pix_key: string;
  pix_key_type: string;
  status: string;
  processed_at: string;
  created_at: string;
}

interface Balance {
  availableBalance: number;
  convertedTotal: number;
  pendingWithdrawal: number;
  serviceFeesTotal: number;
  pixKey: string | null;
}

export function FinanceiroTab() {
  const [orders, setOrders] = useState<GiftOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [submitting, setSubmitting] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const confirmOrder = async (id: number, paid: boolean) => {
    setConfirmingId(id);
    try {
      await authFetch(`/api/gift-orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid }),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to update order status:", e);
    } finally {
      setConfirmingId(null);
    }
  };

  const fetchData = async () => {
    try {
      const [ordersRes, withdrawalsRes, balanceRes] = await Promise.all([
        authFetch("/api/gift-orders"),
        authFetch("/api/withdrawals"),
        authFetch("/api/balance"),
      ]);
      const ordersData = await ordersRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      const balanceData = await balanceRes.json();
      setOrders(ordersData.orders || []);
      setWithdrawals(withdrawalsData.withdrawals || []);
      setBalance(balanceData);
      if (balanceData.pixKey) {
        setPixKey(balanceData.pixKey);
      }
    } catch (error) {
      console.error("Failed to fetch financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !pixKey) return;
    setSubmitting(true);
    try {
      const res = await authFetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          pixKey,
          pixKeyType,
        }),
      });
      if (res.ok) {
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to request withdrawal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <h2 className="font-serif text-2xl font-semibold">Financeiro</h2>
        {balance && balance.availableBalance > 0 && (
          <Button onClick={() => setShowWithdrawModal(true)} className="gap-2">
            <ArrowUpCircle className="w-4 h-4" />
            Converter para PIX
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground -mt-2">
        Os valores abaixo já são líquidos: o valor de cada presente menos a taxa de serviço da plataforma.
      </p>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">Disponível para Saque</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(balance?.availableBalance || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">Já Convertido</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(balance?.convertedTotal || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground">Saque Pendente</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {formatCurrency(balance?.pendingWithdrawal || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Taxa de serviço retida</span>
          </div>
          <p className="text-2xl font-bold text-muted-foreground">
            {formatCurrency(balance?.serviceFeesTotal || 0)}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Presentes Recebidos
          </h3>
          {orders.some((o) => o.payment_status !== "paid") && (
            <p className="text-xs text-muted-foreground mt-1">
              Confirme o recebimento de cada PIX para o valor entrar no seu saldo.
            </p>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum presente recebido ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.id} className="p-4 flex items-center gap-4">
                {order.gift_image ? (
                  <img
                    src={order.gift_image}
                    alt={order.gift_name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Gift className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{order.gift_name || "Presente"}</p>
                  <p className="text-sm text-muted-foreground">
                    De: {order.guest_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(order.couple_amount || order.amount)}</p>
                  {order.commission_amount > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(order.amount)} − {formatCurrency(order.commission_amount)} taxa
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs justify-end mt-0.5">
                    {order.payment_status !== "paid" ? (
                      <>
                        <span className="text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Aguardando confirmação
                        </span>
                        <button
                          onClick={() => confirmOrder(order.id, true)}
                          disabled={confirmingId === order.id}
                          className="px-2 py-0.5 rounded-md bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                          {confirmingId === order.id ? "…" : "Confirmar recebimento"}
                        </button>
                      </>
                    ) : order.is_converted ? (
                      <span className="text-blue-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Convertido
                      </span>
                    ) : (
                      <>
                        <span className="text-green-600 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Disponível
                        </span>
                        <button
                          onClick={() => confirmOrder(order.id, false)}
                          disabled={confirmingId === order.id}
                          className="text-muted-foreground hover:text-foreground underline"
                        >
                          desfazer
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-2xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Histórico de Saques
          </h3>
        </div>
        {withdrawals.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum saque realizado</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  w.status === "completed" ? "bg-green-100" : 
                  w.status === "pending" ? "bg-amber-100" : "bg-red-100"
                }`}>
                  {w.status === "completed" ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : w.status === "pending" ? (
                    <Clock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{formatCurrency(w.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    PIX: {w.pix_key_type.toUpperCase()} - {w.pix_key}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    w.status === "completed" ? "bg-green-100 text-green-700" :
                    w.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>
                    {w.status === "completed" ? "Concluído" : 
                     w.status === "pending" ? "Pendente" : "Falhou"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(w.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-semibold">Converter para PIX</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  Saldo disponível: <span className="font-bold">{formatCurrency(balance?.availableBalance || 0)}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Valor do Saque</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={balance?.availableBalance || 0}
                    className="w-full pl-10 pr-4 py-2 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                    placeholder="0,00"
                  />
                </div>
                <button 
                  onClick={() => setWithdrawAmount(String(balance?.availableBalance || 0))}
                  className="text-xs text-primary mt-1 hover:underline"
                >
                  Sacar tudo
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Chave PIX</label>
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value)}
                  className="w-full px-4 py-2 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chave PIX</label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-4 py-2 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                  placeholder={pixKeyType === "cpf" ? "000.000.000-00" : pixKeyType === "email" ? "email@exemplo.com" : "Sua chave PIX"}
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  O valor será transferido para a chave PIX informada em até 3 dias úteis.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleWithdraw}
                  disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !pixKey}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Saque"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
