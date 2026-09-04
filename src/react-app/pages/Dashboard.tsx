import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/local-auth/react";
import { authFetch } from "@/react-app/lib/api";
import { Heart, Users, Gift, MessageCircle, Settings, LogOut, BarChart3, Loader2, ExternalLink, Image, Wallet, Share2, ChevronUp, UtensilsCrossed, CheckSquare, Sparkles, BookOpen, Sun, Moon, Crown, Hotel } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import TablesTab from "@/react-app/components/TablesTab";
import { TasksTab } from "@/react-app/components/TasksTab";
import { BudgetTab } from "@/react-app/components/BudgetTab";
import { GiftTemplateSelector } from "@/react-app/components/GiftTemplateSelector";
import { GravataTab } from "@/react-app/components/GravataTab";
import { InviteTab } from "@/react-app/components/InviteTab";
import { StoryTab } from "@/react-app/components/StoryTab";
import { GuestPhotosTab } from "@/react-app/components/GuestPhotosTab";
import { DashboardHome } from "@/react-app/components/DashboardHome";
import { GiftTemplate } from "@/data/giftTemplates";
import { GuestsTab } from "@/react-app/components/GuestsTab";
import { GiftsTab } from "@/react-app/components/GiftsTab";
import { PhotosTab } from "@/react-app/components/PhotosTab";
import { MessagesTab } from "@/react-app/components/MessagesTab";
import { FinanceiroTab } from "@/react-app/components/FinanceiroTab";
import { SettingsTab } from "@/react-app/components/SettingsTab";
import { WeddingModal } from "@/react-app/components/WeddingModal";
import { GuestModal } from "@/react-app/components/GuestModal";
import { GiftModal } from "@/react-app/components/GiftModal";
import { GodparentsTab } from "@/react-app/components/GodparentsTab";
import { ParentsTab } from "@/react-app/components/ParentsTab";
import { AccommodationsTab } from "@/react-app/components/AccommodationsTab";
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
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-theme');
      return saved === 'dark';
    }
    return false;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dashboard-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Cleanup dark mode when leaving dashboard
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

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
      
      const weddingData = await weddingRes.json();
      const guestsData = await guestsRes.json();
      const giftsData = await giftsRes.json();
      const messagesData = await messagesRes.json();
      const photosData = await photosRes.json();
      const statsData = await statsRes.json();
      
      setWedding(weddingData);
      setGuests(guestsData);
      setGifts(giftsData);
      setMessages(messagesData);
      setPhotos(Array.isArray(photosData) ? photosData : []);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
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
      <div className="min-h-screen bg-cream dark:bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = user.name || user.email.split("@")[0];

  const tabs = [
    { id: "overview" as Tab, label: "Visão Geral", icon: BarChart3 },
    { id: "guests" as Tab, label: "Convidados", icon: Users },
    { id: "tables" as Tab, label: "Mesas", icon: UtensilsCrossed },
    { id: "tasks" as Tab, label: "Tarefas", icon: CheckSquare },
    { id: "budget" as Tab, label: "Orçamento", icon: Wallet },
    { id: "gifts" as Tab, label: "Presentes", icon: Gift },
    { id: "photos" as Tab, label: "Fotos", icon: Image },
    { id: "story" as Tab, label: "Nossa História", icon: BookOpen },
    { id: "guest-photos" as Tab, label: "Galeria Convidados", icon: Image },
    { id: "messages" as Tab, label: "Mensagens", icon: MessageCircle },
    { id: "financeiro" as Tab, label: "Financeiro", icon: Wallet },
    { id: "gravata" as Tab, label: "Gravata", icon: Sparkles },
    { id: "invite" as Tab, label: "Convite", icon: Share2 },
    { id: "godparents" as Tab, label: "Padrinhos", icon: Crown },
    { id: "parents" as Tab, label: "Pais", icon: Users },
    { id: "accommodations" as Tab, label: "Estadia", icon: Hotel },
    { id: "settings" as Tab, label: "Configurações", icon: Settings },
  ];

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
    <div className="min-h-screen bg-cream dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-xl font-semibold">Eternize</span>
            </Link>

            <div className="flex items-center gap-4">
              {wedding?.custom_url && (
                <Link to={`/c/${wedding.custom_url}`}>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Ver Meu Site
                  </Button>
                </Link>
              )}
              
              {/* Mobile theme toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                title={darkMode ? "Modo Diurno" : "Modo Noturno"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-primary" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-light flex items-center justify-center text-white text-xs font-bold"
                >
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
        <aside className="w-64 bg-white dark:bg-card border-r border-border flex-shrink-0 hidden md:flex md:flex-col">
          <nav className="p-4 space-y-1 flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          
          {/* Theme Toggle */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm font-medium">
                  {darkMode ? "Modo Noturno" : "Modo Diurno"}
                </span>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    darkMode ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-border z-50 overflow-x-auto">
          <div className="flex">
            {tabs.slice(0, 6).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 text-xs transition-colors ${
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="truncate">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                const moreMenu = document.getElementById('mobile-more-menu');
                if (moreMenu) moreMenu.classList.toggle('hidden');
              }}
              className="flex-1 flex flex-col items-center gap-1 py-2 px-2 text-xs text-muted-foreground"
            >
              <ChevronUp className="w-5 h-5" />
              <span>Mais</span>
            </button>
          </div>
          <div id="mobile-more-menu" className="hidden bg-white dark:bg-card border-t grid grid-cols-3 gap-2 p-3">
            {tabs.slice(6).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    document.getElementById('mobile-more-menu')?.classList.add('hidden');
                  }}
                  className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
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

        {/* Photos Tab */}
        {activeTab === "photos" && (
          <PhotosTab
            photos={photos}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "story" && <StoryTab />}

        {activeTab === "guest-photos" && <GuestPhotosTab />}

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
          <InviteTab wedding={wedding} />
        )}

        {/* Godparents Tab */}
        {activeTab === "godparents" && (
          <GodparentsTab />
        )}

        {/* Parents Tab */}
        {activeTab === "parents" && (
          <ParentsTab />
        )}

        {/* Accommodations Tab */}
        {activeTab === "accommodations" && (
          <AccommodationsTab />
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
