import React, { useState, useEffect } from "react";
import { authFetch } from "@/react-app/lib/api";
import jsPDF from "jspdf";
import { Button } from "@/react-app/components/ui/button";
import { Users, MessageCircle, MessageSquare, Plus, ExternalLink, Pencil, Trash2, X, Check, Search, UserCheck, UserX, Clock, Share2, ChevronDown, ChevronUp, RefreshCw, UtensilsCrossed, Download, FileText } from "lucide-react";
import { GUEST_LABELS } from "@/react-app/components/dashboard-types";
import type { Guest, Wedding } from "@/react-app/components/dashboard-types";

// Guests Tab Component
export function GuestsTab({
  guests,
  searchQuery,
  onSearchChange,
  labelFilter,
  onLabelFilterChange,
  onAddGuest,
  onEditGuest,
  onDeleteGuest,
  onRefresh,
  wedding,
  onWeddingUpdate,
}: {
  guests: Guest[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  labelFilter: string | null;
  onLabelFilterChange: (label: string | null) => void;
  onAddGuest: () => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (id: number) => void;
  onRefresh: () => void;
  wedding: Wedding | null;
  onWeddingUpdate: () => void;
}) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMessageEditor, setShowMessageEditor] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState(wedding?.invitation_message || '');
  const [savingMessage, setSavingMessage] = useState(false);

  // Update local state when wedding changes
  useEffect(() => {
    setInvitationMessage(wedding?.invitation_message || '');
  }, [wedding?.invitation_message]);

  const saveInvitationMessage = async () => {
    setSavingMessage(true);
    try {
      await authFetch('/api/wedding/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation_message: invitationMessage || null }),
      });
      onWeddingUpdate();
      setShowMessageEditor(false);
    } catch (error) {
      console.error('Failed to save invitation message:', error);
    } finally {
      setSavingMessage(false);
    }
  };

  const defaultMessageTemplate = `Olá {nome}! 💒

Você está convidado(a) para nosso casamento! Por favor, confirme sua presença através deste link:

{link}

Aguardamos você! 💕`;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <UserCheck className="w-3 h-3" /> Confirmado
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <UserX className="w-3 h-3" /> Recusou
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" /> Pendente
          </span>
        );
    }
  };

  const getLabelBadge = (label: string | null) => {
    if (!label) return null;
    const labelInfo = GUEST_LABELS.find(l => l.value === label);
    if (!labelInfo) return null;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${labelInfo.color}`}>
        {labelInfo.label}
      </span>
    );
  };

  const copyConfirmationLink = async (guest: Guest) => {
    if (!guest.confirmation_code) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/c/${wedding?.custom_url}/confirmar/${guest.confirmation_code}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareWhatsApp = (guest: Guest) => {
    if (!guest.confirmation_code || !guest.phone) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/c/${wedding?.custom_url}/confirmar/${guest.confirmation_code}`;
    
    // Use custom message or default
    const defaultMessage = `Olá ${guest.name.split(' ')[0]}! 💒\n\nVocê está convidado(a) para nosso casamento! Por favor, confirme sua presença através deste link:\n\n${link}\n\nAguardamos você! 💕`;
    
    let finalMessage = defaultMessage;
    if (wedding?.invitation_message) {
      // Replace placeholders in custom message
      finalMessage = wedding.invitation_message
        .replace(/{nome}/gi, guest.name.split(' ')[0])
        .replace(/{nome_completo}/gi, guest.name)
        .replace(/{link}/gi, link);
    }
    
    const message = encodeURIComponent(finalMessage);
    const phone = guest.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatConfirmedAt = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download functions
  const downloadCSV = async () => {
    try {
      const confirmedGuests = guests.filter(g => g.rsvp_status === "confirmed");
      
      if (confirmedGuests.length === 0) {
        alert("Nenhum convidado confirmado para exportar.");
        return;
      }

      // Fetch tables to get guest-table assignments
      let tablesData: { id: number; name: string; table_number: number | null }[] = [];
      try {
        const res = await authFetch("/api/tables");
        if (res.ok) {
          tablesData = await res.json() || [];
        }
      } catch (e) {
        console.error("Failed to fetch tables for export:", e);
      }

      const tableMap = new Map(tablesData.map(t => [t.id, t.name || `Mesa ${t.table_number || t.id}`]));

      // Fetch guests with table_id
      let guestsWithTables: { id: number; table_id: number | null }[] = [];
      try {
        const res = await authFetch("/api/guests");
        if (res.ok) {
          guestsWithTables = await res.json() || [];
        }
      } catch (e) {
        console.error("Failed to fetch guests with tables:", e);
      }

      const guestTableMap = new Map(guestsWithTables.map(g => [g.id, g.table_id]));

      // CSV Header
      const rows: string[] = ["Nome,Tipo,Status,Etiqueta,Acompanhantes Confirmados,Mesa"];
      
      for (const guest of confirmedGuests) {
        const labelInfo = GUEST_LABELS.find(l => l.value === guest.label);
        const confirmedCompanions = guest.companions?.filter(c => c.is_confirmed === 1) || [];
        const tableId = guestTableMap.get(guest.id);
        const tableName = tableId ? tableMap.get(tableId) || "" : "";
        const tipo = guest.is_child ? "Criança" : "Adulto";

        // Main guest row
        rows.push(`"${guest.name}",${tipo},Confirmado,"${labelInfo?.label || ""}","${confirmedCompanions.map(c => `${c.name}${c.is_child ? " (Criança)" : ""}`).join(", ")}","${tableName}"`);
      }

      const csvContent = rows.join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      // Use window.open as fallback for iframe environments
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = "convidados_confirmados.csv";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 250);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Erro ao baixar CSV. Tente novamente.");
    }
  };

  const downloadPDF = async () => {
    try {
      const confirmedGuests = guests.filter(g => g.rsvp_status === "confirmed");
      
      if (confirmedGuests.length === 0) {
        alert("Nenhum convidado confirmado para exportar.");
        return;
      }

      // Fetch tables to get guest-table assignments
      let tablesData: { id: number; name: string; table_number: number | null }[] = [];
      try {
        const res = await authFetch("/api/tables");
        if (res.ok) {
          tablesData = await res.json() || [];
        }
      } catch (e) {
        console.error("Failed to fetch tables for export:", e);
      }

      const tableMap = new Map(tablesData.map(t => [t.id, t.name || `Mesa ${t.table_number || t.id}`]));

      // Fetch guests with table_id
      let guestsWithTables: { id: number; table_id: number | null }[] = [];
      try {
        const res = await authFetch("/api/guests");
        if (res.ok) {
          guestsWithTables = await res.json() || [];
        }
      } catch (e) {
        console.error("Failed to fetch guests with tables:", e);
      }

      const guestTableMap = new Map(guestsWithTables.map(g => [g.id, g.table_id]));

      const pdf = new jsPDF();
      
      let yPos = 20;
      const lineHeight = 7;
      const pageHeight = pdf.internal.pageSize.height;

      // Title
      pdf.setFontSize(18);
      pdf.text("Lista de Convidados Confirmados", 20, yPos);
      yPos += 15;

      pdf.setFontSize(10);
      pdf.text(`Total: ${confirmedGuests.length} convidados + ${confirmedGuests.reduce((acc, g) => acc + (g.companions?.filter(c => c.is_confirmed === 1).length || 0), 0)} acompanhantes`, 20, yPos);
      yPos += 15;

      pdf.setFontSize(11);

      for (const guest of confirmedGuests) {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }

        const labelInfo = GUEST_LABELS.find(l => l.value === guest.label);
        const confirmedCompanions = guest.companions?.filter(c => c.is_confirmed === 1) || [];
        const tableId = guestTableMap.get(guest.id);
        const tableName = tableId ? tableMap.get(tableId) : null;
        const tipo = guest.is_child ? " (Criança)" : "";

        // Guest name with type indicator
        pdf.setFont("helvetica", "bold");
        pdf.text(`${guest.name}${tipo}`, 20, yPos);
        
        // Label and table on same line
        pdf.setFont("helvetica", "normal");
        const infoText = [labelInfo?.label, tableName].filter(Boolean).join(" | ");
        if (infoText) {
          pdf.text(infoText, 120, yPos);
        }
        yPos += lineHeight;

        // Companions
        if (confirmedCompanions.length > 0) {
          pdf.setFontSize(9);
          for (const comp of confirmedCompanions) {
            if (yPos > pageHeight - 20) {
              pdf.addPage();
              yPos = 20;
            }
            const compTipo = comp.is_child ? " (Criança)" : "";
            pdf.text(`    • ${comp.name}${compTipo}`, 20, yPos);
            yPos += lineHeight - 1;
          }
          pdf.setFontSize(11);
        }

        yPos += 3;
      }

      pdf.save("convidados_confirmados.pdf");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Erro ao baixar PDF. Tente novamente.");
    }
  };

  // Stats by label
  const statsByLabel = GUEST_LABELS.map(label => ({
    ...label,
    count: guests.filter(g => g.label === label.value).length,
    confirmed: guests.filter(g => g.label === label.value && g.rsvp_status === "confirmed").length,
  }));

  const totalConfirmed = guests.filter((g) => g.rsvp_status === "confirmed").length;

  return (
    <>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold">Lista de Convidados</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {guests.length} {guests.length === 1 ? "convidado" : "convidados"} · {totalConfirmed} confirmado{totalConfirmed === 1 ? "" : "s"}
        </p>
      </div>

      {/* Stats by label */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statsByLabel.map((stat) => (
          <button
            key={stat.value}
            onClick={() => onLabelFilterChange(labelFilter === stat.value ? null : stat.value)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              labelFilter === stat.value 
                ? "ring-2 ring-primary ring-offset-2" 
                : "hover:border-primary/50"
            } ${stat.color.replace("text-", "bg-").split(" ")[0]}/30`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${stat.color.split(" ")[1]}`}>{stat.label}</span>
              {labelFilter === stat.value && <Check className="w-4 h-4 text-primary" />}
            </div>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.confirmed} confirmados</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar convidados..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="gap-2"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button variant="outline" onClick={downloadCSV} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
          <Button variant="outline" onClick={downloadPDF} className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          {labelFilter && (
            <Button variant="outline" onClick={() => onLabelFilterChange(null)} className="gap-2">
              <X className="w-4 h-4" />
              Limpar filtro
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowMessageEditor(true)} className="gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Mensagem Convite</span>
          </Button>
          <Button onClick={onAddGuest} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Convidado
          </Button>
        </div>
      </div>

      {/* Invitation Message Editor Modal */}
      {showMessageEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold">Personalizar Mensagem do Convite</h3>
                <button onClick={() => setShowMessageEditor(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Customize a mensagem enviada pelo WhatsApp aos convidados.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Variáveis disponíveis:</strong>
                </p>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li><code className="bg-amber-100 px-1 rounded">{'{nome}'}</code> - Primeiro nome do convidado</li>
                  <li><code className="bg-amber-100 px-1 rounded">{'{nome_completo}'}</code> - Nome completo</li>
                  <li><code className="bg-amber-100 px-1 rounded">{'{link}'}</code> - Link de confirmação</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Mensagem personalizada</label>
                <textarea
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  placeholder={defaultMessageTemplate}
                  className="w-full h-48 px-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Deixe em branco para usar a mensagem padrão.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Mensagem padrão:</p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{defaultMessageTemplate}</pre>
              </div>
            </div>
            
            <div className="p-6 border-t flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowMessageEditor(false)}>
                Cancelar
              </Button>
              <Button variant="outline" onClick={() => setInvitationMessage('')}>
                Restaurar Padrão
              </Button>
              <Button onClick={saveInvitationMessage} disabled={savingMessage}>
                {savingMessage ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {guests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold mb-2">Nenhum convidado ainda</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando seus convidados para gerenciar as confirmações.
          </p>
          <Button onClick={onAddGuest}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Convidado
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Nome</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Etiqueta</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Telefone</th>
                  <th className="text-center p-4 font-medium">Pessoas</th>
                  <th className="text-center p-4 font-medium">Status</th>
                  <th className="text-center p-4 font-medium">Link</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {guests.map((guest) => (
                  <React.Fragment key={guest.id}>
                    <tr 
                      className={`hover:bg-muted/30 cursor-pointer ${expandedId === guest.id ? 'bg-muted/20' : ''}`}
                      onClick={() => setExpandedId(expandedId === guest.id ? null : guest.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="text-muted-foreground">
                            {expandedId === guest.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {guest.name}
                              <span className={`text-xs px-1.5 py-0.5 rounded ${guest.is_child ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                {guest.is_child ? '👶 Criança' : '👤 Adulto'}
                              </span>
                            </div>
                            {guest.companions && guest.companions.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                                + {guest.companions.map((c, i) => (
                                  <span key={i} className="inline-flex items-center gap-1">
                                    {c.name}
                                    <span className={`text-[10px] px-1 rounded ${c.is_child ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                                      {c.is_child ? '👶' : '👤'}
                                    </span>
                                    {i < guest.companions.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="lg:hidden mt-1">
                              {getLabelBadge(guest.label)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {getLabelBadge(guest.label)}
                      </td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">
                        {guest.phone || "-"}
                      </td>
                      <td className="p-4 text-center">
                        {1 + (guest.companions?.length || 0)}
                      </td>
                      <td className="p-4 text-center">{getStatusBadge(guest.rsvp_status)}</td>
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => copyConfirmationLink(guest)}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedId === guest.id 
                                ? "bg-green-100 text-green-600" 
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                            title="Copiar link de confirmação"
                          >
                            {copiedId === guest.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                          </button>
                          {guest.phone && (
                            <button
                              onClick={() => shareWhatsApp(guest)}
                              className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                              title="Enviar pelo WhatsApp"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEditGuest(guest)}
                            className="p-2 hover:bg-muted rounded-lg"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteGuest(guest.id)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expandable details row */}
                    {expandedId === guest.id && (
                      <tr className="bg-muted/10">
                        <td colSpan={7} className="p-4 border-t border-dashed">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Email</p>
                              <p className="font-medium">{guest.email || '-'}</p>
                            </div>
                            {guest.is_confirmed === 1 && guest.confirmed_at && (
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Confirmado em</p>
                                <p className="font-medium text-green-600">
                                  <Check className="w-3 h-3 inline mr-1" />
                                  {formatConfirmedAt(guest.confirmed_at)}
                                </p>
                              </div>
                            )}
                            {guest.dietary_restrictions && (
                              <div>
                                <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                  <UtensilsCrossed className="w-3 h-3" /> Restrições alimentares
                                </p>
                                <p className="font-medium">{guest.dietary_restrictions}</p>
                              </div>
                            )}
                            {guest.message && (
                              <div className="md:col-span-3">
                                <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" /> Mensagem do convidado
                                </p>
                                <p className="font-medium bg-white p-2 rounded border italic">
                                  "{guest.message}"
                                </p>
                              </div>
                            )}
                            {guest.companions && guest.companions.length > 0 && (
                              <div className="md:col-span-3">
                                <p className="text-muted-foreground text-xs mb-1">Acompanhantes</p>
                                <div className="flex flex-wrap gap-2">
                                  {guest.companions.map((comp, idx) => (
                                    <span 
                                      key={idx} 
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        comp.is_confirmed 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {comp.name} 
                                      <span className={`ml-1 ${comp.is_child ? 'text-pink-600' : 'text-blue-600'}`}>
                                        {comp.is_child ? '👶' : '👤'}
                                      </span>
                                      {comp.is_confirmed ? ' ✓' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
