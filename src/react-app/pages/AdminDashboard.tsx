import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from "@/local-auth/react";
import { useNavigate } from "react-router";
import {
  Users,
  Gift,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  RefreshCw,
  TrendingUp,
  Heart,
  Wallet,
  Package,
  LifeBuoy,
} from "lucide-react";
import GiftTemplatesAdmin from "../components/GiftTemplatesAdmin";
import SupportConsole from "../components/admin/SupportConsole";

interface AdminStats {
  totalWeddings: number;
  publishedWeddings: number;
  totalGuests: number;
  totalGiftsValue: number;
  pendingWithdrawals: number;
  pendingWithdrawalsAmount: number;
  totalRevenue: number;
}

interface Wedding {
  id: number;
  user_id: string;
  partner1_name: string | null;
  partner2_name: string | null;
  wedding_date: string | null;
  custom_url: string | null;
  is_published: number;
  created_at: string;
  guest_count: number;
  gifts_total: number;
  user_email: string | null;
}

interface Withdrawal {
  id: number;
  wedding_id: number;
  amount: number;
  pix_key: string;
  pix_key_type: string | null;
  status: string;
  created_at: string;
  partner1_name: string | null;
  partner2_name: string | null;
}

// Admin emails authorized to access this panel
const ADMIN_EMAILS = ["osvaldog.lfilho@gmail.com"];

export default function AdminDashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"support" | "overview" | "weddings" | "withdrawals" | "templates">("support");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/entrar");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, weddingsRes, withdrawalsRes] = await Promise.all([
        authFetch("/api/admin/stats"),
        authFetch("/api/admin/weddings"),
        authFetch("/api/admin/withdrawals"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (weddingsRes.ok) {
        const data = await weddingsRes.json();
        setWeddings(data.weddings || []);
      }
      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (id: number, action: "approve" | "reject") => {
    setProcessingId(id);
    try {
      const res = await authFetch(`/api/admin/withdrawals/${id}/${action}`, {
        method: "POST",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWeddings = weddings.filter((w) => {
    const search = searchTerm.toLowerCase();
    return (
      w.partner1_name?.toLowerCase().includes(search) ||
      w.partner2_name?.toLowerCase().includes(search) ||
      w.custom_url?.toLowerCase().includes(search) ||
      w.user_email?.toLowerCase().includes(search)
    );
  });

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");

  if (isPending) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-border text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-foreground mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-gold-light rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif text-foreground">Eternize Admin</h1>
                <p className="text-sm text-muted-foreground">Painel Administrativo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Logado como</p>
                <p className="text-foreground font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6">
          {[
            { id: "support", label: "Suporte", icon: LifeBuoy },
            { id: "overview", label: "Visão Geral", icon: TrendingUp },
            { id: "weddings", label: "Casamentos", icon: Heart },
            { id: "withdrawals", label: "Saques", icon: Wallet },
            { id: "templates", label: "Templates Presentes", icon: Package },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "withdrawals" && pendingWithdrawals.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingWithdrawals.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "support" && <SupportConsole />}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total de Casamentos"
                value={stats?.totalWeddings || 0}
                subtext={`${stats?.publishedWeddings || 0} publicados`}
                color="blue"
              />
              <StatCard
                icon={Calendar}
                label="Convidados Cadastrados"
                value={stats?.totalGuests || 0}
                color="green"
              />
              <StatCard
                icon={Gift}
                label="Presentes Vendidos"
                value={`R$ ${((stats?.totalGiftsValue || 0) / 100).toLocaleString("pt-BR")}`}
                color="purple"
              />
              <StatCard
                icon={DollarSign}
                label="Saques Pendentes"
                value={stats?.pendingWithdrawals || 0}
                subtext={`R$ ${((stats?.pendingWithdrawalsAmount || 0) / 100).toLocaleString("pt-BR")}`}
                color="orange"
                highlight={stats?.pendingWithdrawals ? true : false}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Weddings */}
              <div className="bg-white backdrop-blur-sm rounded-xl border border-border p-6">
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose" />
                  Casamentos Recentes
                </h3>
                <div className="space-y-3">
                  {weddings.slice(0, 5).map((wedding) => (
                    <div
                      key={wedding.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="text-foreground font-medium">
                          {wedding.partner1_name && wedding.partner2_name
                            ? `${wedding.partner1_name} & ${wedding.partner2_name}`
                            : "Casal sem nome"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(wedding.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          wedding.is_published
                            ? "bg-green-500/20 text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {wedding.is_published ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                  ))}
                  {weddings.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">Nenhum casamento ainda</p>
                  )}
                </div>
              </div>

              {/* Pending Withdrawals */}
              <div className="bg-white backdrop-blur-sm rounded-xl border border-border p-6">
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Saques Pendentes
                </h3>
                <div className="space-y-3">
                  {pendingWithdrawals.slice(0, 5).map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="text-foreground font-medium">
                          R$ {(withdrawal.amount / 100).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {withdrawal.partner1_name} & {withdrawal.partner2_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleWithdrawalAction(withdrawal.id, "approve")}
                          disabled={processingId === withdrawal.id}
                          className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(withdrawal.id, "reject")}
                          disabled={processingId === withdrawal.id}
                          className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingWithdrawals.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">Nenhum saque pendente</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weddings Tab */}
        {activeTab === "weddings" && (
          <div className="bg-white backdrop-blur-sm rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-foreground">Todos os Casamentos</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground text-sm border-b border-border">
                    <th className="pb-3 font-medium">Casal</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium">URL</th>
                    <th className="pb-3 font-medium">Convidados</th>
                    <th className="pb-3 font-medium">Presentes</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWeddings.map((wedding) => (
                    <tr key={wedding.id} className="text-foreground">
                      <td className="py-4">
                        <p className="font-medium">
                          {wedding.partner1_name && wedding.partner2_name
                            ? `${wedding.partner1_name} & ${wedding.partner2_name}`
                            : "—"}
                        </p>
                      </td>
                      <td className="py-4 text-muted-foreground">{wedding.user_email || "—"}</td>
                      <td className="py-4 text-muted-foreground">
                        {wedding.wedding_date
                          ? new Date(wedding.wedding_date).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td className="py-4">
                        {wedding.custom_url ? (
                          <span className="text-primary font-mono text-sm">
                            /c/{wedding.custom_url}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 text-muted-foreground">{wedding.guest_count}</td>
                      <td className="py-4 text-muted-foreground">
                        R$ {((wedding.gifts_total || 0) / 100).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            wedding.is_published
                              ? "bg-green-500/20 text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {wedding.is_published ? "Publicado" : "Rascunho"}
                        </span>
                      </td>
                      <td className="py-4">
                        {wedding.custom_url && wedding.is_published && (
                          <a
                            href={`/c/${wedding.custom_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors inline-flex"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWeddings.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Nenhum casamento encontrado</p>
              )}
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === "withdrawals" && (
          <div className="bg-white backdrop-blur-sm rounded-xl border border-border p-6">
            <h3 className="text-lg font-medium text-foreground mb-6">Gestão de Saques</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground text-sm border-b border-border">
                    <th className="pb-3 font-medium">Casal</th>
                    <th className="pb-3 font-medium">Valor</th>
                    <th className="pb-3 font-medium">Chave PIX</th>
                    <th className="pb-3 font-medium">Data Solicitação</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="text-foreground">
                      <td className="py-4 font-medium">
                        {withdrawal.partner1_name} & {withdrawal.partner2_name}
                      </td>
                      <td className="py-4 text-primary font-medium">
                        R$ {(withdrawal.amount / 100).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-mono text-sm">{withdrawal.pix_key}</p>
                          {withdrawal.pix_key_type && (
                            <p className="text-xs text-muted-foreground">{withdrawal.pix_key_type}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            withdrawal.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : withdrawal.status === "rejected"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {withdrawal.status === "approved"
                            ? "Aprovado"
                            : withdrawal.status === "rejected"
                            ? "Rejeitado"
                            : "Pendente"}
                        </span>
                      </td>
                      <td className="py-4">
                        {withdrawal.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleWithdrawalAction(withdrawal.id, "approve")}
                              disabled={processingId === withdrawal.id}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleWithdrawalAction(withdrawal.id, "reject")}
                              disabled={processingId === withdrawal.id}
                              className="px-3 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Rejeitar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {withdrawals.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Nenhum saque registrado</p>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="bg-white backdrop-blur-sm rounded-xl border border-border p-6">
            <GiftTemplatesAdmin />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: "blue" | "green" | "purple" | "orange";
  highlight?: boolean;
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div
      className={`bg-white backdrop-blur-sm rounded-xl border p-6 ${
        highlight ? "border-orange-500/50" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtext && <p className="text-sm text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
