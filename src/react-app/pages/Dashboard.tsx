import { authFetch } from "@/react-app/lib/api";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/local-auth/react";
import {
  Heart,
  Users,
  Gift,
  MessageCircle,
  MessageSquare,
  Settings,
  LogOut,
  BarChart3,
  Loader2,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  UserCheck,
  UserX,
  Clock,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Palette,
  Image,
  Upload,
  GripVertical,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UtensilsCrossed,
  CheckSquare,
  Sparkles,
  BookOpen,
  Sun,
  Moon,
  Download,
  FileText,
  Crown,
  Hotel,
} from "lucide-react";
import jsPDF from "jspdf";
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

type Tab = "overview" | "guests" | "tables" | "tasks" | "budget" | "gifts" | "photos" | "story" | "guest-photos" | "messages" | "financeiro" | "gravata" | "invite" | "godparents" | "parents" | "accommodations" | "settings";

interface Companion {
  id?: number;
  name: string;
  is_confirmed: number;
  is_child?: number;
}

interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  rsvp_status: string;
  guests_count: number;
  dietary_restrictions: string;
  label: string | null;
  is_child?: number;
  confirmation_code: string | null;
  is_confirmed: number;
  confirmed_at: string | null;
  message: string | null;
  companions: Companion[];
}

const GUEST_LABELS = [
  { value: "padrinho", label: "Padrinho/Madrinha", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "familia_noivo", label: "Família do Noivo", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "familia_noiva", label: "Família da Noiva", color: "bg-pink-100 text-pink-800 border-pink-300" },
  { value: "amigos", label: "Amigos", color: "bg-green-100 text-green-800 border-green-300" },
] as const;

interface GiftItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: number;
  quota_total: number;
  quota_purchased: number;
}

interface GuestMessage {
  id: number;
  guest_name: string;
  message: string;
  is_approved: number;
  created_at: string;
}

interface Photo {
  id: number;
  filename: string;
  storage_key: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

interface Wedding {
  id: number;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  custom_url: string;
  pix_key: string;
  is_published: number;
  invitation_message: string | null;
}

interface Stats {
  totalGuests: number;
  confirmedGuests: number;
  totalGifts: number;
  totalMessages: number;
  totalAmount: number;
}

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

// Guests Tab Component
function GuestsTab({
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

  return (
    <>
      {/* Stats by label */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statsByLabel.map((stat) => (
          <button
            key={stat.value}
            onClick={() => onLabelFilterChange(labelFilter === stat.value ? null : stat.value)}
            className={`p-4 rounded-xl border text-left transition-all ${
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
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  className="w-full h-48 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
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
        <div className="bg-white rounded-xl border p-12 text-center">
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
        <div className="bg-white rounded-xl border overflow-hidden">
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

// Gifts Tab Component
function GiftsTab({
  gifts,
  searchQuery,
  onSearchChange,
  onAddGift,
  onOpenTemplates,
  onEditGift,
  onDeleteGift,
}: {
  gifts: GiftItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddGift: () => void;
  onOpenTemplates: () => void;
  onEditGift: (gift: GiftItem) => void;
  onDeleteGift: (id: number) => void;
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar presentes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onOpenTemplates} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Sparkles className="w-4 h-4 mr-2" />
            Lista Pronta
          </Button>
          <Button onClick={onAddGift} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Presente
          </Button>
        </div>
      </div>

      {gifts.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold mb-2">Nenhum presente ainda</h3>
          <p className="text-muted-foreground mb-4">
            Adicione presentes à sua lista ou escolha uma lista pronta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onOpenTemplates} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Sparkles className="w-4 h-4 mr-2" />
              Usar Lista Pronta
            </Button>
            <Button onClick={onAddGift}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Manualmente
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {gifts.map((gift) => (
            <div key={gift.id} className="bg-white rounded-xl border overflow-hidden group">
              {gift.image_url ? (
                <img
                  src={gift.image_url}
                  alt={gift.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <Gift className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium mb-1 line-clamp-1">{gift.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {gift.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg font-semibold text-primary">
                    R$ {gift.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    gift.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {gift.is_available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onEditGift(gift)}
                    className="flex-1 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 inline mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDeleteGift(gift.id)}
                    className="py-2 px-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Photos Tab Component
function PhotosTab({
  photos,
  onRefresh,
}: {
  photos: Photo[];
  onRefresh: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editCaption, setEditCaption] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        
        await authFetch("/api/photos", {
          method: "POST",
          body: formData,
        });
      }
      onRefresh();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUpdateCaption = async () => {
    if (!editingPhoto) return;
    
    await authFetch(`/api/photos/${editingPhoto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: editCaption }),
    });
    
    setEditingPhoto(null);
    setEditCaption("");
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta foto?")) return;
    
    await authFetch(`/api/photos/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Galeria de Fotos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {photos.length} {photos.length === 1 ? "foto" : "fotos"} na galeria
          </p>
        </div>
        <label className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Adicionar Fotos
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold mb-2">Nenhuma foto ainda</h3>
          <p className="text-muted-foreground mb-4">
            Adicione fotos do casal para exibir na galeria do seu site.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Adicionar Primeira Foto
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative bg-white rounded-xl border overflow-hidden">
              <div className="aspect-square">
                <img
                  src={`/api/files/${photo.storage_key}`}
                  alt={photo.caption || photo.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingPhoto(photo);
                      setEditCaption(photo.caption || "");
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Editar legenda"
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                {photo.caption && (
                  <p className="text-white text-sm line-clamp-2">{photo.caption}</p>
                )}
              </div>
              
              {/* Drag handle indicator */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-white/70" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Caption Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-serif text-xl font-semibold">Editar Legenda</h2>
              <button
                onClick={() => {
                  setEditingPhoto(null);
                  setEditCaption("");
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={`/api/files/${editingPhoto.storage_key}`}
                  alt={editingPhoto.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Legenda</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Adicione uma legenda para esta foto..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <Button onClick={handleUpdateCaption} className="w-full bg-primary hover:bg-primary/90">
                <Check className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Messages Tab Component
function MessagesTab({
  messages,
  onApprove,
  onReject,
  onDelete,
}: {
  messages: GuestMessage[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const pendingMessages = messages.filter(m => m.is_approved === null || m.is_approved === undefined);
  const approvedMessages = messages.filter(m => m.is_approved === 1);
  const rejectedMessages = messages.filter(m => m.is_approved === 0);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-semibold">Mensagens dos Convidados</h2>
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
            {pendingMessages.length} pendentes
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
            {approvedMessages.length} aprovadas
          </span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-2">Nenhuma mensagem ainda</h3>
          <p className="text-muted-foreground">
            As mensagens dos convidados aparecerão aqui para você aprovar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Aguardando Aprovação</h3>
              <div className="space-y-3">
                {pendingMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    showActions
                  />
                ))}
              </div>
            </div>
          )}

          {approvedMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-6">Aprovadas</h3>
              <div className="space-y-3">
                {approvedMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    status="approved"
                  />
                ))}
              </div>
            </div>
          )}

          {rejectedMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-6">Rejeitadas</h3>
              <div className="space-y-3">
                {rejectedMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    status="rejected"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Message Card Component
function MessageCard({
  message,
  onApprove,
  onReject,
  onDelete,
  showActions,
  status,
}: {
  message: GuestMessage;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  showActions?: boolean;
  status?: "approved" | "rejected";
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${status === "rejected" ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">
                {message.guest_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium">{message.guest_name}</h4>
              <p className="text-xs text-muted-foreground">
                {new Date(message.created_at).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{message.message}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {showActions ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onApprove(message.id)}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onReject(message.id)}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </>
          ) : (
            <>
              {status === "approved" && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Aprovada
                </span>
              )}
              {status === "rejected" && (
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  Rejeitada
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-red-500"
                onClick={() => onDelete(message.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Financeiro Tab Component
interface GiftOrder {
  id: number;
  gift_id: number;
  gift_name: string;
  gift_image: string;
  guest_name: string;
  guest_email: string;
  amount: number;
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
  pixKey: string | null;
}

function FinanceiroTab() {
  const [orders, setOrders] = useState<GiftOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-border">
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
        <div className="bg-white rounded-xl p-6 border border-border">
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
        <div className="bg-white rounded-xl p-6 border border-border">
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
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Presentes Recebidos
          </h3>
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
                  <p className="font-semibold text-green-600">{formatCurrency(order.amount)}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {order.is_converted ? (
                      <span className="text-blue-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Convertido
                      </span>
                    ) : (
                      <span className="text-green-600 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Disponível
                      </span>
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
      <div className="bg-white rounded-xl border border-border">
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
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

// Settings Tab Component
function SettingsTab({
  wedding,
  onEditWedding,
  onRefresh,
}: {
  wedding: Wedding | null;
  onEditWedding: () => void;
  onRefresh: () => void;
}) {
  const [publishing, setPublishing] = useState(false);

  const handleTogglePublish = async () => {
    if (!wedding) return;
    setPublishing(true);
    try {
      const res = await authFetch("/api/wedding/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !wedding.is_published }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to toggle publish:", error);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl font-semibold mb-6">Configurações do Casamento</h2>
      
      {/* Publish Status Banner */}
      {wedding && (
        <div className={`rounded-xl border p-6 mb-6 ${
          wedding.is_published 
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
            : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                wedding.is_published 
                  ? "bg-green-100" 
                  : "bg-amber-100"
              }`}>
                {wedding.is_published ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div>
                <h3 className={`font-medium ${
                  wedding.is_published ? "text-green-800" : "text-amber-800"
                }`}>
                  {wedding.is_published ? "Site Publicado" : "Site em Rascunho"}
                </h3>
                <p className={`text-sm ${
                  wedding.is_published ? "text-green-600" : "text-amber-600"
                }`}>
                  {wedding.is_published 
                    ? "Seus convidados podem acessar o site" 
                    : "Apenas você pode ver o site. Publique quando estiver pronto!"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleTogglePublish}
              disabled={publishing || !wedding.custom_url}
              className={wedding.is_published 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-green-600 hover:bg-green-700"
              }
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : wedding.is_published ? (
                <X className="w-4 h-4 mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {wedding.is_published ? "Despublicar" : "Publicar Site"}
            </Button>
          </div>
          {!wedding.custom_url && (
            <p className="text-xs text-amber-600 mt-3">
              ⚠️ Configure a URL personalizada antes de publicar
            </p>
          )}
          {wedding.is_published && wedding.custom_url && (
            <div className="mt-4 pt-4 border-t border-green-200 flex items-center gap-2">
              <span className="text-sm text-green-700">Link do site:</span>
              <a 
                href={`/c/${wedding.custom_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-green-800 font-medium hover:underline flex items-center gap-1"
              >
                eternize.com/c/{wedding.custom_url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* Theme Editor Link */}
      <Link
        to="/dashboard/tema"
        className="block bg-gradient-to-r from-primary/10 via-gold-light/10 to-primary/10 rounded-xl border border-primary/20 p-6 mb-4 hover:border-primary/40 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-gold-light flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium group-hover:text-primary transition-colors">Personalizar Tema</h3>
            <p className="text-sm text-muted-foreground">
              Customize cores, fontes e escolha um template para seu site
            </p>
          </div>
          <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Link>
      
      {/* Site Settings Link */}
      <Link
        to="/dashboard/configuracoes"
        className="block bg-gradient-to-r from-secondary/30 via-primary/5 to-secondary/30 rounded-xl border border-secondary p-6 mb-6 hover:border-primary/40 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary/30 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium group-hover:text-primary transition-colors">Configurações do Site</h3>
            <p className="text-sm text-muted-foreground">
              Seções visíveis, conteúdo, horários e mídia
            </p>
          </div>
          <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Link>
      
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Informações do Casamento</h3>
            <p className="text-sm text-muted-foreground">
              {wedding
                ? `${wedding.partner1_name} & ${wedding.partner2_name}`
                : "Não configurado"}
            </p>
          </div>
          <Button variant="outline" onClick={onEditWedding}>
            {wedding ? "Editar" : "Configurar"}
          </Button>
        </div>

        {wedding && (
          <>
            <div className="h-px bg-border" />
            <div>
              <h3 className="font-medium mb-2">Data do Casamento</h3>
              <p className="text-muted-foreground">
                {wedding.wedding_date
                  ? new Date(wedding.wedding_date).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Não definida"}
              </p>
            </div>
            <div className="h-px bg-border" />
            <div>
              <h3 className="font-medium mb-2">Local</h3>
              <p className="text-muted-foreground">
                {wedding.venue_name || "Não definido"}
              </p>
              {wedding.venue_address && (
                <p className="text-sm text-muted-foreground">{wedding.venue_address}</p>
              )}
            </div>
            <div className="h-px bg-border" />
            <div>
              <h3 className="font-medium mb-2">URL do Site</h3>
              <p className="text-muted-foreground">
                {wedding.custom_url
                  ? `eternize.com/c/${wedding.custom_url}`
                  : "Não configurada"}
              </p>
            </div>
            <div className="h-px bg-border" />
            <div>
              <h3 className="font-medium mb-2">Chave PIX</h3>
              <p className="text-muted-foreground">
                {wedding.pix_key || "Não configurada"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Wedding Modal Component
function WeddingModal({
  wedding,
  onClose,
  onSave,
}: {
  wedding: Wedding | null;
  onClose: () => void;
  onSave: (data: Partial<Wedding>) => void;
}) {
  const [formData, setFormData] = useState({
    partner1_name: wedding?.partner1_name || "",
    partner2_name: wedding?.partner2_name || "",
    wedding_date: wedding?.wedding_date || "",
    venue_name: wedding?.venue_name || "",
    venue_address: wedding?.venue_address || "",
    custom_url: wedding?.custom_url || "",
    pix_key: wedding?.pix_key || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-serif text-xl font-semibold">Configurar Casamento</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome 1</label>
              <input
                type="text"
                value={formData.partner1_name}
                onChange={(e) => setFormData({ ...formData, partner1_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="Ana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome 2</label>
              <input
                type="text"
                value={formData.partner2_name}
                onChange={(e) => setFormData({ ...formData, partner2_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="João"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data do Casamento</label>
            <input
              type="date"
              value={formData.wedding_date}
              onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Local</label>
            <input
              type="text"
              value={formData.venue_name}
              onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              placeholder="Espaço Villa Garden"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endereço</label>
            <input
              type="text"
              value={formData.venue_address}
              onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              placeholder="Rua das Flores, 123 - São Paulo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Personalizada</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">eternize.com/c/</span>
              <input
                type="text"
                value={formData.custom_url}
                onChange={(e) => setFormData({ ...formData, custom_url: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="ana-e-joao"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chave PIX</label>
            <input
              type="text"
              value={formData.pix_key}
              onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              placeholder="email@exemplo.com ou CPF"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <Check className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </form>
      </div>
    </div>
  );
}

// Guest Modal Component
function GuestModal({
  guest,
  onClose,
  onSave,
}: {
  guest: Guest | null;
  onClose: () => void;
  onSave: (data: Partial<Guest> & { companions?: { name: string; is_child: boolean }[] }) => void;
}) {
  const [formData, setFormData] = useState({
    name: guest?.name || "",
    email: guest?.email || "",
    phone: guest?.phone || "",
    guests_count: guest?.guests_count || 1,
    rsvp_status: guest?.rsvp_status || "pending",
    dietary_restrictions: guest?.dietary_restrictions || "",
    label: guest?.label || "",
    is_child: guest?.is_child === 1,
  });
  
  const [companions, setCompanions] = useState<{ name: string; is_child: boolean }[]>(
    guest?.companions?.map(c => ({ name: c.name, is_child: c.is_child === 1 })) || []
  );
  const [numCompanions, setNumCompanions] = useState(
    guest?.companions?.length || 0
  );

  const handleNumCompanionsChange = (num: number) => {
    setNumCompanions(num);
    // Adjust companions array
    if (num > companions.length) {
      setCompanions([...companions, ...Array(num - companions.length).fill({ name: "", is_child: false })]);
    } else {
      setCompanions(companions.slice(0, num));
    }
  };

  const updateCompanion = (index: number, field: 'name' | 'is_child', value: string | boolean) => {
    const newCompanions = [...companions];
    newCompanions[index] = { ...newCompanions[index], [field]: value };
    setCompanions(newCompanions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="font-serif text-xl font-semibold dark:text-white">
            {guest ? "Editar Convidado" : "Novo Convidado"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              ...formData,
              is_child: formData.is_child ? 1 : 0,
              companions: companions.filter(c => c.name.trim()),
            } as any);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nome do Convidado *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_child}
                onChange={(e) => setFormData({ ...formData, is_child: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-medium dark:text-gray-200">Criança</span>
            </label>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted dark:bg-gray-700 text-muted-foreground">
              {formData.is_child ? "👶 Criança" : "👤 Adulto"}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Etiqueta</label>
            <div className="grid grid-cols-2 gap-2">
              {GUEST_LABELS.map((label) => (
                <button
                  key={label.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, label: formData.label === label.value ? "" : label.value })}
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${
                    formData.label === label.value
                      ? `${label.color} ring-2 ring-offset-1 ring-primary`
                      : "bg-white dark:bg-gray-700 dark:text-white hover:bg-muted/50 dark:hover:bg-gray-600"
                  }`}
                >
                  {label.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Telefone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/20"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Quantidade de Acompanhantes</label>
            <select
              value={numCompanions}
              onChange={(e) => handleNumCompanionsChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/20"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "acompanhante" : "acompanhantes"}</option>
              ))}
            </select>
          </div>

          {numCompanions > 0 && (
            <div className="space-y-3 p-4 bg-muted/30 dark:bg-gray-700/50 rounded-lg">
              <label className="block text-sm font-medium dark:text-gray-200">Acompanhantes</label>
              {Array.from({ length: numCompanions }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={companions[index]?.name || ""}
                    onChange={(e) => updateCompanion(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/20"
                    placeholder={`Acompanhante ${index + 1}`}
                  />
                  <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={companions[index]?.is_child || false}
                      onChange={(e) => updateCompanion(index, 'is_child', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-xs dark:text-gray-300">
                      {companions[index]?.is_child ? "👶" : "👤"}
                    </span>
                  </label>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Marque a caixa para indicar criança</p>
            </div>
          )}

          {guest && (
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Status</label>
              <select
                value={formData.rsvp_status}
                onChange={(e) => setFormData({ ...formData, rsvp_status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/20"
              >
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="declined">Recusou</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Restrições Alimentares</label>
            <input
              type="text"
              value={formData.dietary_restrictions}
              onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/20"
              placeholder="Ex: Vegetariano, sem glúten..."
            />
          </div>
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <Check className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </form>
      </div>
    </div>
  );
}

// Gift Modal Component
function GiftModal({
  gift,
  onClose,
  onSave,
}: {
  gift: GiftItem | null;
  onClose: () => void;
  onSave: (data: Partial<GiftItem>) => void;
}) {
  const [formData, setFormData] = useState({
    name: gift?.name || "",
    description: gift?.description || "",
    price: gift?.price || 0,
    image_url: gift?.image_url || "",
    category: gift?.category || "Outros",
    quota_total: gift?.quota_total || 1,
    is_available: gift?.is_available ?? 1,
  });

  const categories = [
    { value: "Relacionamento", label: "Relacionamento" },
    { value: "Sobrevivência", label: "Sobrevivência" },
    { value: "Finanças", label: "Finanças" },
    { value: "Diversão", label: "Diversão" },
    { value: "Pets", label: "Pets" },
    { value: "Futuro", label: "Futuro" },
    { value: "Cozinha", label: "Cozinha" },
    { value: "Quarto", label: "Quarto" },
    { value: "Sala", label: "Sala" },
    { value: "Banheiro", label: "Banheiro" },
    { value: "Eletrônicos", label: "Eletrônicos" },
    { value: "Experiências", label: "Experiências" },
    { value: "Contribuição", label: "Contribuição" },
    { value: "Outros", label: "Outros" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-serif text-xl font-semibold">
            {gift ? "Editar Presente" : "Novo Presente"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Imagem do Presente</label>
            {formData.image_url && (
              <div className="mb-2 relative">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image_url: "" })}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="URL ou faça upload"
              />
              <label className="cursor-pointer px-4 py-2 rounded-lg border bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm font-medium">
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
                        setFormData((prev: typeof formData) => ({ ...prev, image_url: data.url }));
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
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={!!formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked ? 1 : 0 })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="available" className="text-sm font-medium">Disponível para compra</label>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <Check className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </form>
      </div>
    </div>
  );
}

// =====================
// Godparents (Padrinhos) Tab Component
// =====================
function GodparentsTab() {
  const [godparents, setGodparents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    image_url: '',
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [showOnSite, setShowOnSite] = useState(true);

  useEffect(() => {
    fetchGodparents();
    fetchVisibility();
  }, []);

  const fetchVisibility = async () => {
    try {
      const res = await authFetch('/api/wedding');
      const data = await res.json();
      if (data) setShowOnSite(data.show_godparents !== 0);
    } catch {}
  };

  const toggleVisibility = async () => {
    const newValue = !showOnSite;
    setShowOnSite(newValue);
    await authFetch('/api/wedding/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_godparents: newValue ? 1 : 0 }),
    });
  };

  const fetchGodparents = async () => {
    try {
      const res = await authFetch('/api/godparents');
      const data = await res.json();
      setGodparents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch godparents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingItem) {
        await authFetch(`/api/godparents/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await authFetch('/api/godparents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', role: '', description: '', image_url: '', sort_order: 0 });
      fetchGodparents();
    } catch (error) {
      console.error('Failed to save godparent:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      role: item.role || '',
      description: item.description || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este padrinho?')) return;
    await authFetch(`/api/godparents/${id}`, { method: 'DELETE' });
    fetchGodparents();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await authFetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image_url: data.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
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
        <div>
          <h2 className="font-serif text-2xl font-semibold">Padrinhos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {godparents.length} {godparents.length === 1 ? 'padrinho' : 'padrinhos'} cadastrados
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleVisibility}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOnSite ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnSite ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-muted-foreground">{showOnSite ? 'Visível no site' : 'Oculto no site'}</span>
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', role: '', description: '', image_url: '', sort_order: 0 });
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Padrinho
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold">
              {editingItem ? 'Editar Padrinho' : 'Novo Padrinho'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingItem(null); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="Nome do padrinho"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Função</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: Padrinho, Madrinha"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="Descrição ou mensagem especial"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagem</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="URL ou faça upload"
                />
                <label className="cursor-pointer px-4 py-2 rounded-lg border bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm font-medium">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  📷 Upload
                </label>
              </div>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordem</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-32 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {editingItem ? 'Atualizar' : 'Adicionar'}
            </Button>
          </form>
        </div>
      )}

      {godparents.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-card rounded-xl border p-12 text-center">
          <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold mb-2">Nenhum padrinho cadastrado</h3>
          <p className="text-muted-foreground mb-4">Adicione os padrinhos e madrinhas do casamento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {godparents.map((item) => (
            <div key={item.id} className="bg-white dark:bg-card rounded-xl border overflow-hidden group">
              {item.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 mt-1">
                        {item.role}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================
// Parents (Pais) Tab Component
// =====================
function ParentsTab() {
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image_url: '',
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [showOnSite, setShowOnSite] = useState(true);

  useEffect(() => {
    fetchParents();
    fetchVisibility();
  }, []);

  const fetchVisibility = async () => {
    try {
      const res = await authFetch('/api/wedding');
      const data = await res.json();
      if (data) setShowOnSite(data.show_parents !== 0);
    } catch {}
  };

  const toggleVisibility = async () => {
    const newValue = !showOnSite;
    setShowOnSite(newValue);
    await authFetch('/api/wedding/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_parents: newValue ? 1 : 0 }),
    });
  };

  const fetchParents = async () => {
    try {
      const res = await authFetch('/api/parents');
      const data = await res.json();
      setParents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingItem) {
        await authFetch(`/api/parents/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await authFetch('/api/parents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', role: '', image_url: '', sort_order: 0 });
      fetchParents();
    } catch (error) {
      console.error('Failed to save parent:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      role: item.role || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    await authFetch(`/api/parents/${id}`, { method: 'DELETE' });
    fetchParents();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await authFetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image_url: data.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
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
        <div>
          <h2 className="font-serif text-2xl font-semibold">Pais</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {parents.length} {parents.length === 1 ? 'responsável' : 'responsáveis'} cadastrados
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleVisibility}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOnSite ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnSite ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-muted-foreground">{showOnSite ? 'Visível no site' : 'Oculto no site'}</span>
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', role: '', image_url: '', sort_order: 0 });
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Pai/Mãe
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold">
              {editingItem ? 'Editar' : 'Novo Pai/Mãe'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingItem(null); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Função</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione</option>
                  <option value="pai_noivo">Pai do Noivo</option>
                  <option value="mae_noivo">Mãe do Noivo</option>
                  <option value="pai_noiva">Pai da Noiva</option>
                  <option value="mae_noiva">Mãe da Noiva</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagem</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="URL ou faça upload"
                />
                <label className="cursor-pointer px-4 py-2 rounded-lg border bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm font-medium">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  📷 Upload
                </label>
              </div>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordem</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-32 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {editingItem ? 'Atualizar' : 'Adicionar'}
            </Button>
          </form>
        </div>
      )}

      {parents.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-card rounded-xl border p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold mb-2">Nenhum pai/mãe cadastrado</h3>
          <p className="text-muted-foreground mb-4">Adicione os pais dos noivos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parents.map((item) => (
            <div key={item.id} className="bg-white dark:bg-card rounded-xl border overflow-hidden group">
              {item.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300 mt-1">
                        {item.role.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================
// Accommodations (Estadia) Tab Component
// =====================
function AccommodationsTab() {
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    price_range: '',
    image_url: '',
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [showOnSite, setShowOnSite] = useState(true);

  useEffect(() => {
    fetchAccommodations();
    fetchVisibility();
  }, []);

  const fetchVisibility = async () => {
    try {
      const res = await authFetch('/api/wedding');
      const data = await res.json();
      if (data) setShowOnSite(data.show_accommodations !== 0);
    } catch {}
  };

  const toggleVisibility = async () => {
    const newValue = !showOnSite;
    setShowOnSite(newValue);
    await authFetch('/api/wedding/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_accommodations: newValue ? 1 : 0 }),
    });
  };

  const fetchAccommodations = async () => {
    try {
      const res = await authFetch('/api/accommodations');
      const data = await res.json();
      setAccommodations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch accommodations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingItem) {
        await authFetch(`/api/accommodations/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await authFetch('/api/accommodations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', address: '', phone: '', website: '', price_range: '', image_url: '', sort_order: 0 });
      fetchAccommodations();
    } catch (error) {
      console.error('Failed to save accommodation:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      address: item.address || '',
      phone: item.phone || '',
      website: item.website || '',
      price_range: item.price_range || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta acomodação?')) return;
    await authFetch(`/api/accommodations/${id}`, { method: 'DELETE' });
    fetchAccommodations();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await authFetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image_url: data.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
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
        <div>
          <h2 className="font-serif text-2xl font-semibold">Estadia</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {accommodations.length} {accommodations.length === 1 ? 'acomodação' : 'acomodações'} cadastradas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleVisibility}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOnSite ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnSite ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-muted-foreground">{showOnSite ? 'Visível no site' : 'Oculto no site'}</span>
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', description: '', address: '', phone: '', website: '', price_range: '', image_url: '', sort_order: 0 });
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Acomodação
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold">
              {editingItem ? 'Editar Acomodação' : 'Nova Acomodação'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingItem(null); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="Nome do hotel/pousada"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Faixa de Preço</label>
                <input
                  type="text"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: R$ 200-400/noite"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="Descrição da acomodação"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                placeholder="Endereço completo"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagem</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
                  placeholder="URL ou faça upload"
                />
                <label className="cursor-pointer px-4 py-2 rounded-lg border bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm font-medium">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  📷 Upload
                </label>
              </div>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordem</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-32 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {editingItem ? 'Atualizar' : 'Adicionar'}
            </Button>
          </form>
        </div>
      )}

      {accommodations.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-card rounded-xl border p-12 text-center">
          <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold mb-2">Nenhuma acomodação cadastrada</h3>
          <p className="text-muted-foreground mb-4">Adicione opções de hospedagem para os convidados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accommodations.map((item) => (
            <div key={item.id} className="bg-white dark:bg-card rounded-xl border overflow-hidden group">
              {item.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.price_range && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300 mt-1">
                        {item.price_range}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                )}
                {item.address && (
                  <p className="text-xs text-muted-foreground mt-1">📍 {item.address}</p>
                )}
                {item.phone && (
                  <p className="text-xs text-muted-foreground mt-1">📞 {item.phone}</p>
                )}
                {item.website && (
                  <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
