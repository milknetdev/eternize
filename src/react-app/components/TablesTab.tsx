import { authFetch } from "@/react-app/lib/api";
import React, { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import {
  Plus,
  Trash2,
  Users,
  Circle,
  Square,
  UserMinus,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Baby,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface Companion {
  id?: number;
  name: string;
  is_confirmed: number | boolean;
  is_child?: number | boolean;
  dietary_restrictions?: string | null;
}

interface Guest {
  id: number;
  name: string;
  is_confirmed: number | boolean;
  rsvp_status?: string | null;
  is_child?: number | boolean;
  dietary_restrictions?: string | null;
  label: string | null;
  table_id: number | null;
  companions: Companion[];
}

// Postgres returns BOOLEAN as true/false (not 1/0), and a couple can also mark a
// guest confirmed from the dashboard, which only sets rsvp_status.
const isGuestConfirmed = (g: Guest) =>
  Boolean(g.is_confirmed) || g.rsvp_status === "confirmed";

const confirmedCompanions = (g: Guest) =>
  (g.companions || []).filter((c) => c.is_confirmed);

interface SeatPerson {
  name: string;
  child: boolean;
  diet: string | null;
}

/** The guest plus every confirmed companion, flattened into seated people. */
function peopleOf(g: Guest): SeatPerson[] {
  const clean = (d?: string | null) => {
    const t = (d || "").trim();
    return t ? t : null;
  };
  return [
    { name: g.name, child: Boolean(g.is_child), diet: clean(g.dietary_restrictions) },
    ...confirmedCompanions(g).map((c) => ({
      name: c.name,
      child: Boolean(c.is_child),
      diet: clean(c.dietary_restrictions),
    })),
  ];
}

function tableStats(guests: Guest[]) {
  const people = guests.flatMap(peopleOf);
  return {
    total: people.length,
    children: people.filter((p) => p.child).length,
    adults: people.filter((p) => !p.child).length,
    allergies: people
      .filter((p) => p.diet)
      .map((p) => ({ name: p.name, diet: p.diet as string })),
  };
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  table_number: number | null;
  shape: string;
  notes: string | null;
  guests: Guest[];
}

const LABEL_COLORS: Record<string, string> = {
  padrinho: "bg-amber-100 text-amber-800 border-amber-300",
  familia_noivo: "bg-blue-100 text-blue-800 border-blue-300",
  familia_noiva: "bg-pink-100 text-pink-800 border-pink-300",
  amigos: "bg-green-100 text-green-800 border-green-300",
};

export default function TablesTab() {
  const [tables, setTables] = useState<Table[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [expandedTable, setExpandedTable] = useState<number | null>(null);
  const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      const [tablesRes, guestsRes] = await Promise.all([
        authFetch("/api/tables"),
        authFetch("/api/guests"),
      ]);
      const tablesData = await tablesRes.json();
      const guestsData: Guest[] = await guestsRes.json();

      // Only confirmed guests can be assigned to tables
      const confirmedGuests = guestsData.filter(isGuestConfirmed);
      
      // Group guests by table
      const tablesWithGuests = (tablesData || []).map((table: any) => ({
        ...table,
        guests: confirmedGuests.filter(g => g.table_id === table.id),
      }));

      // Unassigned confirmed guests
      const unassigned = confirmedGuests.filter(g => !g.table_id);

      setTables(tablesWithGuests);
      setUnassignedGuests(unassigned);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreateTable = async (data: { name: string; capacity: number; shape: string; table_number?: number }) => {
    await authFetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowAddModal(false);
    fetchTables();
  };

  const handleUpdateTable = async (id: number, data: { name: string; capacity: number; shape: string; table_number?: number }) => {
    await authFetch(`/api/tables/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingTable(null);
    fetchTables();
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm("Remover esta mesa? Os convidados ficarão sem mesa atribuída.")) return;
    await authFetch(`/api/tables/${id}`, { method: "DELETE" });
    fetchTables();
  };

  const handleAssignGuest = async (guestId: number, tableId: number | null) => {
    await authFetch(`/api/guests/${guestId}/table`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_id: tableId }),
    });
    fetchTables();
  };

  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);

  const countGuestWithCompanions = (guest: Guest) => peopleOf(guest).length;

  const seatedPeople = tables.flatMap((t) => t.guests.flatMap(peopleOf));
  const totalSeated = seatedPeople.length;
  const seatedChildren = seatedPeople.filter((p) => p.child).length;
  const seatedAllergies = seatedPeople.filter((p) => p.diet).length;

  const totalUnassigned = unassignedGuests.reduce((sum, g) => sum + countGuestWithCompanions(g), 0);

  const handleExportPdf = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    const lh = 6;
    let y = 18;
    const line = (text: string, indent = 0, bold = false) => {
      if (y > pageHeight - 15) {
        pdf.addPage();
        y = 18;
      }
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.text(text, 16 + indent, y);
      y += lh;
    };

    pdf.setFontSize(16);
    line("Mapa de Mesas", 0, true);
    pdf.setFontSize(10);
    line(
      `${tables.length} mesas · ${totalSeated} pessoas sentadas · ${seatedChildren} crianças · ${seatedAllergies} com restrição alimentar`,
    );
    y += 3;

    const ordered = [...tables].sort(
      (a, b) => (a.table_number || 999) - (b.table_number || 999) || a.name.localeCompare(b.name),
    );

    pdf.setFontSize(11);
    for (const table of ordered) {
      const s = tableStats(table.guests);
      y += 2;
      line(
        `${table.table_number ? `Mesa ${table.table_number} — ` : ""}${table.name}   (${s.total}/${table.capacity} lugares · ${s.children} crianças)`,
        0,
        true,
      );
      if (table.guests.length === 0) {
        line("sem convidados", 4);
      }
      for (const g of table.guests) {
        const gDiet = (g.dietary_restrictions || "").trim();
        line(
          `• ${g.name}${g.is_child ? " (criança)" : ""}${gDiet ? `  [restrição: ${gDiet}]` : ""}`,
          4,
        );
        for (const c of confirmedCompanions(g)) {
          const cDiet = (c.dietary_restrictions || "").trim();
          line(
            `- ${c.name}${c.is_child ? " (criança)" : ""}${cDiet ? `  [restrição: ${cDiet}]` : ""}`,
            10,
          );
        }
      }
      if (s.allergies.length > 0) {
        line(
          `Restrições nesta mesa: ${s.allergies.map((a) => `${a.name} (${a.diet})`).join("; ")}`,
          4,
        );
      }
    }

    if (unassignedGuests.length > 0) {
      y += 4;
      pdf.setFontSize(11);
      line("Sem mesa", 0, true);
      for (const g of unassignedGuests) {
        line(`• ${g.name}${g.is_child ? " (criança)" : ""} (+${confirmedCompanions(g).length} acomp.)`, 4);
      }
    }

    pdf.save("mapa-de-mesas.pdf");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold">Sistema de Mesas</h2>
          <p className="text-muted-foreground">Organize seus convidados confirmados nas mesas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={tables.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar lista
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Mesa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Mesas</p>
          <p className="text-2xl font-semibold">{tables.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Lugares Totais</p>
          <p className="text-2xl font-semibold">{totalSeats}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Sentados</p>
          <p className="text-2xl font-semibold text-green-600">{totalSeated}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Baby className="w-3.5 h-3.5" /> Crianças
          </p>
          <p className="text-2xl font-semibold text-blue-600">{seatedChildren}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Restrições
          </p>
          <p className={`text-2xl font-semibold ${seatedAllergies > 0 ? "text-amber-600" : ""}`}>
            {seatedAllergies}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Sem Mesa</p>
          <p className="text-2xl font-semibold text-amber-600">{totalUnassigned}</p>
        </div>
      </div>

      {/* Unassigned Guests */}
      {unassignedGuests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-amber-800">
              Convidados Confirmados Sem Mesa ({totalUnassigned} pessoas)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {unassignedGuests.map((guest) => (
              <div
                key={guest.id}
                draggable
                onDragStart={() => setDraggedGuest(guest)}
                onDragEnd={() => setDraggedGuest(null)}
                className={`px-3 py-1.5 bg-white rounded-full border border-amber-300 text-sm cursor-move hover:shadow-md transition-shadow ${
                  guest.label ? LABEL_COLORS[guest.label] : ""
                }`}
              >
                {guest.name}
                {guest.companions?.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    +{guest.companions.filter(c => c.is_confirmed).length}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-600 mt-2">
            Arraste os convidados para as mesas — ou abra uma mesa e toque em "Adicionar convidado"
          </p>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            expanded={expandedTable === table.id}
            onToggleExpand={() => setExpandedTable(expandedTable === table.id ? null : table.id)}
            onEdit={() => setEditingTable(table)}
            onDelete={() => handleDeleteTable(table.id)}
            onRemoveGuest={(guestId) => handleAssignGuest(guestId, null)}
            draggedGuest={draggedGuest}
            onDropGuest={(guestId) => handleAssignGuest(guestId, table.id)}
            unassignedGuests={unassignedGuests}
          />
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-border shadow-sm">
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma mesa criada</h3>
          <p className="text-muted-foreground mb-4">
            Crie mesas para organizar seus convidados confirmados
          </p>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Primeira Mesa
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingTable) && (
        <TableModal
          table={editingTable}
          onClose={() => {
            setShowAddModal(false);
            setEditingTable(null);
          }}
          onSave={(data) => {
            if (editingTable) {
              handleUpdateTable(editingTable.id, data);
            } else {
              handleCreateTable(data);
            }
          }}
        />
      )}
    </div>
  );
}

// Table Card Component
function TableCard({
  table,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onRemoveGuest,
  draggedGuest,
  onDropGuest,
  unassignedGuests,
}: {
  table: Table;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRemoveGuest: (guestId: number) => void;
  draggedGuest: Guest | null;
  onDropGuest: (guestId: number) => void;
  unassignedGuests: Guest[];
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAddPicker, setShowAddPicker] = useState(false);
  
  const s = tableStats(table.guests);
  const totalPeopleAtTable = s.total;

  const isFull = totalPeopleAtTable >= table.capacity;
  const ShapeIcon = table.shape === "round" ? Circle : Square;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (draggedGuest && !isFull) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        if (draggedGuest && !isFull) {
          onDropGuest(draggedGuest.id);
        }
        setIsDragOver(false);
      }}
      className={`bg-white rounded-2xl border border-border shadow-sm transition-all ${
        isDragOver ? "border-primary ring-2 ring-primary/20" : "border-border"
      } ${isFull ? "opacity-75" : ""}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              table.shape === "round" ? "bg-primary/10" : "bg-blue-50"
            }`}>
              <ShapeIcon className={`w-5 h-5 ${
                table.shape === "round" ? "text-primary" : "text-blue-600"
              }`} />
            </div>
            <div>
              <h3 className="font-medium">{table.name}</h3>
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>
                  {totalPeopleAtTable}/{table.capacity} lugares
                  {table.table_number && ` • Mesa ${table.table_number}`}
                </span>
                {s.children > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-blue-600">
                    <Baby className="w-3.5 h-3.5" />
                    {s.children}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Capacity indicator */}
        <div className="mt-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isFull ? "bg-red-500" : totalPeopleAtTable > table.capacity * 0.8 ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min((totalPeopleAtTable / table.capacity) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Allergy / dietary warning */}
        {s.allergies.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2 text-xs text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              <strong>{s.allergies.length}</strong> com restrição alimentar:{" "}
              {s.allergies.map((a) => `${a.name} (${a.diet})`).join("; ")}
            </span>
          </div>
        )}
      </div>

      {/* Guests List */}
      {expanded && (
        <div className="p-4 space-y-3">
          {table.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Arraste convidados para cá ou use o botão abaixo
            </p>
          ) : (
            <ul className="space-y-2">
              {table.guests.map((guest) => {
                const comps = confirmedCompanions(guest);
                const guestDiet = (guest.dietary_restrictions || "").trim();
                return (
                  <li
                    key={guest.id}
                    className="flex items-start justify-between py-2 px-3 bg-muted/50 rounded-lg gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {guest.is_child && (
                          <span title="Criança" className="text-blue-600">
                            <Baby className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className={`text-sm ${guest.label ? LABEL_COLORS[guest.label] : ""} px-2 py-0.5 rounded`}>
                          {guest.name}
                        </span>
                        {comps.length > 0 && (
                          <span className="text-xs text-muted-foreground">+{comps.length} acomp.</span>
                        )}
                      </div>

                      {comps.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {comps.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-0.5 text-[11px] bg-white border border-border rounded-full px-1.5 py-0.5"
                            >
                              {c.is_child && <Baby className="w-3 h-3 text-blue-600" />}
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {(guestDiet || comps.some((c) => (c.dietary_restrictions || "").trim())) && (
                        <div className="mt-1 space-y-0.5">
                          {guestDiet && (
                            <p className="text-[11px] text-amber-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {guest.name}: {guestDiet}
                            </p>
                          )}
                          {comps
                            .filter((c) => (c.dietary_restrictions || "").trim())
                            .map((c, i) => (
                              <p key={i} className="text-[11px] text-amber-700 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                {c.name}: {c.dietary_restrictions}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveGuest(guest.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors shrink-0"
                      title="Remover da mesa"
                    >
                      <UserMinus className="w-4 h-4 text-red-500" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!isFull && unassignedGuests.length > 0 && (
            <div>
              <button
                onClick={() => setShowAddPicker((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar convidado
              </button>
              {showAddPicker && (
                <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border divide-y">
                  {unassignedGuests.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { onDropGuest(g.id); setShowAddPicker(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <span>{g.name}</span>
                      {g.companions?.filter((c) => c.is_confirmed).length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          +{g.companions.filter((c) => c.is_confirmed).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Table Modal Component
function TableModal({
  table,
  onClose,
  onSave,
}: {
  table: Table | null;
  onClose: () => void;
  onSave: (data: { name: string; capacity: number; shape: string; table_number?: number }) => void;
}) {
  const [name, setName] = useState(table?.name || "");
  const [capacity, setCapacity] = useState(table?.capacity || 10);
  const [shape, setShape] = useState(table?.shape || "round");
  const [tableNumber, setTableNumber] = useState(table?.table_number || undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), capacity, shape, table_number: tableNumber });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">
            {table ? "Editar Mesa" : "Nova Mesa"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Mesa</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mesa dos Padrinhos"
              className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/25"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Capacidade</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número (opcional)</label>
              <input
                type="number"
                value={tableNumber || ""}
                onChange={(e) => setTableNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                min={1}
                placeholder="Ex: 1"
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Formato</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShape("round")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                  shape === "round"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Circle className="w-5 h-5" />
                Redonda
              </button>
              <button
                type="button"
                onClick={() => setShape("rectangular")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                  shape === "rectangular"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Square className="w-5 h-5" />
                Retangular
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {table ? "Salvar" : "Criar Mesa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
