import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/local-auth/react";
import { authFetch } from "@/react-app/lib/api";
import { Heart, Users, Gift, MessageCircle, Settings, LogOut, BarChart3, Loader2, ExternalLink, Wallet, Share2, ChevronUp, X, UtensilsCrossed, CheckSquare, Sparkles, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import TablesTab from "@/react-app/components/TablesTab";
import { TasksTab } from "@/react-app/components/TasksTab";
import { BudgetTab } from "@/react-app/components/BudgetTab";
import { GiftTemplateSelector } from "@/react-app/components/GiftTemplateSelector";
import { GravataTab } from "@/react-app/components/GravataTab";
import { InviteTab } from "@/react-app/components/InviteTab";
import { SiteTab } from "@/react-app/components/SiteTab";
import { DashboardHome } from "@/react-app/components/DashboardHome";
import { GiftTemplate } from "@/data/giftTemplates";
import { GuestsTab } from "@/react-app/components/GuestsTab";
import { GiftsTab } from "@/react-app/components/GiftsTab";
import { MessagesTab } from "@/react-app/components/MessagesTab";
import { FinanceiroTab } from "@/react-app/components/FinanceiroTab";
import { SettingsTab } from "@/react-app/components/SettingsTab";
import { WeddingModal } from "@/react-app/components/WeddingModal";
import { GuestModal } from "@/react-app/components/GuestModal";
import { GiftModal } from "@/react-app/components/GiftModal";
import type { Tab, Guest, GiftItem, GuestMessage, Photo, Wedding, Stats } from "@/react-app/components/dashboard-types";

export default function Dashboard() {
  const { user, isPending, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWeddingModal, setShowWeddingModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [weddingRes, guestsRes, giftsRes, messagesRes, photosRes, statsRes] = await Promise.all([
        authFetch("/api/wedding"),
        authFetch("/api/guests"),
        authFetch("/api/gifts"),
        authFetch("/api/messages"),
        authFetch("/api/photos"),
        authFetch("/api/dashboard/stats"),
      ]);

      if (!weddingRes.ok) throw new Error(`wedding ${weddingRes.status}`);

      const weddingData = await weddingRes.json();
      const guestsData = await guestsRes.json();
      const giftsData = await giftsRes.json();
      const messagesData = await messagesRes.json();
      const photosData = await photosRes.json();
      const statsData = await statsRes.json();

      setWedding(weddingData && weddingData.id ? weddingData : null);
      setGuests(Array.isArray(guestsData) ? guestsData : []);
      setGifts(Array.isArray(giftsData) ? giftsData : []);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setPhotos(Array.isArray(photosData) ? photosData : []);
      setStats(statsData || null);
      setLoadError(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await authFetch("/api/guests");
      const data = await res.json();
      setGuests(data);
    } catch (error) {
      console.error("Failed to fetch guests:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Auto-refresh guests every 30 seconds when on guests tab
  useEffect(() => {
    if (!user || activeTab !== "guests") return;
    const interval = setInterval(fetchGuests, 30000);
    return () => clearInterval(interval);
  }, [user, activeTab, fetchGuests]);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/entrar");
    }
  }, [user, isPending, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (isPending || !user || loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando seu painel…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="font-serif text-2xl font-medium mb-2">Não foi possível carregar</h1>
          <p className="text-muted-foreground mb-6">
            Houve um problema ao buscar os dados do seu casamento. Verifique sua conexão e tente de novo.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => { setLoading(true); fetchData(); }}
              className="bg-gradient-to-r from-primary to-gold-light text-white"
            >
              Tentar novamente
            </Button>
            <Button variant="outline" onClick={handleLogout}>Sair</Button>
          </div>
        </div>
      </div>
    );
  }

  const userName = user.name || user.email.split("@")[0];

  const tabGroups: { label: string | null; tabs: { id: Tab; label: string; icon: typeof Heart }[] }[] = [
    {
      label: null,
      tabs: [{ id: "overview", label: "Visão Geral", icon: BarChart3 }],
    },
    {
      label: "Convidados",
      tabs: [
        { id: "guests", label: "Lista de Convidados", icon: Users },
        { id: "tables", label: "Mesas", icon: UtensilsCrossed },
        { id: "messages", label: "Mensagens", icon: MessageCircle },
        { id: "invite", label: "Convite", icon: Share2 },
      ],
    },
    {
      label: "Nosso Site",
      tabs: [{ id: "site", label: "Meu Site", icon: Globe }],
    },
    {
      label: "Presentes",
      tabs: [
        { id: "gifts", label: "Lista de Presentes", icon: Gift },
        { id: "financeiro", label: "Recebimentos", icon: Wallet },
        { id: "gravata", label: "Cofrinho / PIX", icon: Sparkles },
      ],
    },
    {
      label: "Planejamento",
      tabs: [
        { id: "tasks", label: "Tarefas", icon: CheckSquare },
        { id: "budget", label: "Orçamento", icon: Wallet },
      ],
    },
    {
      label: "Ajustes",
      tabs: [{ id: "settings", label: "Configurações", icon: Settings }],
    },
  ];
  const tabs = tabGroups.flatMap((g) => g.tabs);

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLabel = !labelFilter || g.label === labelFilter;
    return matchesSearch && matchesLabel;
  });

  const filteredGifts = gifts.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-xl font-semibold">Eternize</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              {wedding?.custom_url ? (
                <Link to={`/c/${wedding.custom_url}`} target="_blank">
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Ver meu site
                  </Button>
                </Link>
              ) : (
                <button
                  onClick={() => setShowWeddingModal(true)}
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Sparkles className="w-4 h-4" />
                  Configurar casamento
                </button>
              )}

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center text-white text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-border flex-shrink-0 hidden md:flex md:flex-col overflow-y-auto">
          <nav className="p-4 flex-1">
            {tabGroups.map((group, gi) => (
              <div key={group.label ?? "root"} className={gi > 0 ? "mt-5" : ""}>
                {group.label && (
                  <p className="px-4 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {group.tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-lg font-medium text-sm transition-colors border-l-2 ${
                          isActive
                            ? "bg-primary/10 text-primary border-primary"
                            : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {wedding?.custom_url && (
            <div className="p-4 border-t border-border">
              <Link
                to={`/c/${wedding.custom_url}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-border hover:border-primary/40 hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver meu site
              </Link>
            </div>
          )}
        </aside>

        {/* Mobile Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.15)]">
          <div className="flex">
            {tabs.slice(0, 6).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMoreOpen(false); }}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 text-[11px] transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="truncate max-w-full">{tab.label.split(" ")[0]}</span>
                </button>
              );
            })}
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 text-[11px] transition-colors ${
                moreOpen ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {moreOpen ? <X className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              <span>Mais</span>
            </button>
          </div>
          {moreOpen && (
            <div className="border-t border-border grid grid-cols-3 gap-2 p-3 max-h-[60vh] overflow-y-auto">
              {tabs.slice(6).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMoreOpen(false); }}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs text-center transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <DashboardHome
            wedding={wedding}
            stats={stats}
            userName={userName}
            onSetupWedding={() => setShowWeddingModal(true)}
            onNavigateTab={(tab) => setActiveTab(tab as Tab)}
          />
        )}

        {/* Guests Tab */}
        {activeTab === "guests" && (
          <GuestsTab
            guests={filteredGuests}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            labelFilter={labelFilter}
            onLabelFilterChange={setLabelFilter}
            onAddGuest={() => {
              setEditingGuest(null);
              setShowGuestModal(true);
            }}
            onEditGuest={(guest) => {
              setEditingGuest(guest);
              setShowGuestModal(true);
            }}
            onDeleteGuest={async (id) => {
              await authFetch(`/api/guests/${id}`, { method: "DELETE" });
              fetchData();
            }}
            onRefresh={fetchData}
            wedding={wedding}
            onWeddingUpdate={fetchData}
          />
        )}

        {/* Tables Tab */}
        {activeTab === "tables" && <TablesTab />}
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "budget" && <BudgetTab />}

        {/* Gifts Tab */}
        {activeTab === "gifts" && (
          <GiftsTab
            gifts={filteredGifts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddGift={() => {
              setEditingGift(null);
              setShowGiftModal(true);
            }}
            onOpenTemplates={() => setShowTemplateSelector(true)}
            onEditGift={(gift) => {
              setEditingGift(gift);
              setShowGiftModal(true);
            }}
            onDeleteGift={async (id) => {
              await authFetch(`/api/gifts/${id}`, { method: "DELETE" });
              fetchData();
            }}
          />
        )}

        {/* Site (unified builder: appearance, sections, story, photos, guest gallery,
            godparents, parents, accommodations, publish) */}
        {activeTab === "site" && (
          <SiteTab wedding={wedding} photos={photos} onRefresh={fetchData} />
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <MessagesTab
            messages={messages}
            onApprove={async (id) => {
              await authFetch(`/api/messages/${id}/approve`, { method: "PUT" });
              fetchData();
            }}
            onReject={async (id) => {
              await authFetch(`/api/messages/${id}/reject`, { method: "PUT" });
              fetchData();
            }}
            onDelete={async (id) => {
              await authFetch(`/api/messages/${id}`, { method: "DELETE" });
              fetchData();
            }}
          />
        )}

        {/* Financeiro Tab */}
        {activeTab === "financeiro" && (
          <FinanceiroTab />
        )}

        {/* Gravata Tab */}
        {activeTab === "gravata" && (
          <GravataTab 
            pixKey={wedding?.pix_key || null} 
            customUrl={wedding?.custom_url || null} 
          />
        )}

        {/* Invite Tab */}
        {activeTab === "invite" && wedding && (
          <InviteTab wedding={wedding} onSaved={fetchData} />
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <SettingsTab
            wedding={wedding}
            onEditWedding={() => setShowWeddingModal(true)}
            onRefresh={fetchData}
          />
        )}
        </main>
      </div>

      {/* Wedding Setup Modal */}
      {showWeddingModal && (
        <WeddingModal
          wedding={wedding}
          onClose={() => setShowWeddingModal(false)}
          onSave={async (data) => {
            await authFetch("/api/wedding", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            setShowWeddingModal(false);
            fetchData();
          }}
        />
      )}

      {/* Guest Modal */}
      {showGuestModal && (
        <GuestModal
          guest={editingGuest}
          onClose={() => setShowGuestModal(false)}
          onSave={async (data) => {
            if (editingGuest) {
              await authFetch(`/api/guests/${editingGuest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
            } else {
              await authFetch("/api/guests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
            }
            setShowGuestModal(false);
            fetchData();
          }}
        />
      )}

      {/* Gift Modal */}
      {showGiftModal && (
        <GiftModal
          gift={editingGift}
          onClose={() => setShowGiftModal(false)}
          onSave={async (data) => {
            if (editingGift) {
              await authFetch(`/api/gifts/${editingGift.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
            } else {
              await authFetch("/api/gifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
            }
            setShowGiftModal(false);
            fetchData();
          }}
        />
      )}

      {/* Gift Template Selector */}
      <GiftTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onAddGifts={async (templates: GiftTemplate[]) => {
          for (const template of templates) {
            await authFetch("/api/gifts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: template.name,
                description: template.description,
                price: template.price,
                category: template.category,
                image_url: template.image_url || null,
              }),
            });
          }
          fetchData();
        }}
      />
    </div>
  );
}
