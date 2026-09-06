import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import {
  QrCode,
  Copy,
  Check,
  DollarSign,
  MessageCircle,
  Trash2,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface Contribution {
  id: number;
  contributor_name: string;
  amount: number;
  message: string | null;
  is_anonymous: number;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
}

interface GravataTabProps {
  pixKey: string | null;
  customUrl: string | null;
}

export function GravataTab({ pixKey, customUrl }: GravataTabProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      const res = await authFetch("/api/contributions");
      const data = await res.json();
      setContributions(data);
    } catch (error) {
      console.error("Failed to fetch contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await authFetch(`/api/contributions/${id}/confirm`, { method: "PUT" });
      fetchContributions();
    } catch (error) {
      console.error("Failed to confirm contribution:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta contribuição?")) return;
    try {
      await authFetch(`/api/contributions/${id}`, { method: "DELETE" });
      fetchContributions();
    } catch (error) {
      console.error("Failed to delete contribution:", error);
    }
  };

  const copyPixKey = () => {
    if (pixKey) {
      navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pendingContributions = contributions.filter(c => c.payment_status === "pending");
  const confirmedContributions = contributions.filter(c => c.payment_status === "paid");
  const totalConfirmed = confirmedContributions.reduce((sum, c) => sum + c.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate QR Code URL using an external service
  const qrCodeUrl = pixKey
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixKey)}`
    : null;

  const gravataUrl = customUrl ? `${window.location.origin}/c/${customUrl}/gravata` : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Cofrinho / PIX</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Contribuições dos convidados via PIX com QR Code
        </p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-amber-700">Total Recebido</p>
              <p className="text-xl font-bold text-amber-900">{formatCurrency(totalConfirmed)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-green-700">Confirmadas</p>
              <p className="text-xl font-bold text-green-900">{confirmedContributions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-200 rounded-lg">
              <Clock className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <p className="text-sm text-orange-700">Pendentes</p>
              <p className="text-xl font-bold text-orange-900">{pendingContributions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code & PIX Key Section */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-serif font-semibold">Cofrinho Eternize</h3>
        </div>

        {!pixKey ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
            <p className="mb-2">Configure sua chave PIX nas configurações</p>
            <p className="text-sm">O Cofrinho Eternize permite que seus convidados façam contribuições via PIX com QR Code.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="QR Code PIX"
                  className="w-48 h-48 rounded-lg border border-border mb-4"
                />
              )}
              <p className="text-sm text-muted-foreground text-center">
                Compartilhe este QR Code com seus convidados
              </p>
            </div>

            {/* PIX Key & Link */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Chave PIX</label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 bg-muted rounded-lg px-4 py-2 font-mono text-sm truncate">
                    {pixKey}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyPixKey}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {gravataUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Link do Cofrinho</label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-lg px-4 py-2 text-sm truncate">
                      {gravataUrl}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(gravataUrl);
                        alert("Link copiado!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-1">Como funciona?</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Convidados acessam o link ou escaneiam o QR Code</li>
                  <li>• Escolhem um valor e deixam uma mensagem</li>
                  <li>• Fazem o pagamento via PIX</li>
                  <li>• Você confirma o recebimento aqui</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Contributions */}
      {pendingContributions.length > 0 && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Aguardando Confirmação ({pendingContributions.length})
          </h3>
          <div className="space-y-3">
            {pendingContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between bg-orange-50 rounded-lg p-4 border border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {contribution.is_anonymous ? "Anônimo" : contribution.contributor_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(contribution.created_at)}</p>
                    {contribution.message && (
                      <p className="text-sm text-orange-700 mt-1 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {contribution.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-orange-800">
                    {formatCurrency(contribution.amount)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(contribution.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(contribution.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Contributions */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Contribuições Confirmadas ({confirmedContributions.length})
        </h3>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : confirmedContributions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma contribuição confirmada ainda</p>
            <p className="text-sm mt-1">Compartilhe o link da Gravata com seus convidados!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {confirmedContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between bg-green-50 rounded-lg p-4 border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {contribution.is_anonymous ? "Anônimo" : contribution.contributor_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contribution.paid_at ? formatDate(contribution.paid_at) : formatDate(contribution.created_at)}
                    </p>
                    {contribution.message && (
                      <p className="text-sm text-green-700 mt-1 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {contribution.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-green-800">
                    {formatCurrency(contribution.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contribution.id)}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
