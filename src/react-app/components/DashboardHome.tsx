import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Heart,
  Users,
  Gift,
  MessageCircle,
  Clock,
  DollarSign,
  UserCheck,
  CheckSquare,
  Calendar,
  Camera,
  ExternalLink,
  Plus,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  PartyPopper,
  Bell,
  ArrowRight,
  Wallet,
  Image,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

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
}

interface Stats {
  totalGuests: number;
  confirmedGuests: number;
  totalGifts: number;
  totalMessages: number;
  totalAmount: number;
}

interface Task {
  id: number;
  title: string;
  category: string;
  due_date: string | null;
  is_completed: number;
}

interface Expense {
  id: number;
  name: string;
  category: string;
  estimated_amount: number;
  paid_amount: number | null;
  is_paid: number;
}

interface Activity {
  id: string;
  type: "rsvp" | "gift" | "message" | "photo";
  title: string;
  description: string;
  time: string;
  icon: typeof Heart;
  color: string;
}

interface DashboardHomeProps {
  wedding: Wedding | null;
  stats: Stats | null;
  userName: string;
  onSetupWedding: () => void;
  onNavigateTab: (tab: string) => void;
}

export function DashboardHome({
  wedding,
  stats,
  userName,
  onSetupWedding,
  onNavigateTab,
}: DashboardHomeProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState(0);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch tasks
  useEffect(() => {
    authFetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(() => {});
  }, []);

  // Fetch expenses
  useEffect(() => {
    authFetch("/api/budget")
      .then((res) => res.json())
      .then((data) => setExpenses(data.expenses || []))
      .catch(() => {});
  }, []);

  // Fetch pending guest photos
  useEffect(() => {
    authFetch("/api/guest-photos")
      .then((res) => res.json())
      .then((data) => {
        const photos = data.photos || [];
        setPendingPhotos(photos.filter((p: any) => p.is_approved === null).length);
      })
      .catch(() => {});
  }, []);

  // Fetch messages for pending count
  useEffect(() => {
    authFetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        const messages = data.messages || [];
        setPendingMessages(messages.filter((m: any) => m.is_approved === null).length);
      })
      .catch(() => {});
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!wedding?.wedding_date) return;

    const calculateCountdown = () => {
      const weddingDate = new Date(wedding.wedding_date);
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [wedding?.wedding_date]);

  // Build recent activities from available data
  useEffect(() => {
    const recentActivities: Activity[] = [];

    if (stats?.confirmedGuests) {
      recentActivities.push({
        id: "rsvp-1",
        type: "rsvp",
        title: "Confirmações de presença",
        description: `${stats.confirmedGuests} convidados confirmados`,
        time: "Atualizado agora",
        icon: UserCheck,
        color: "text-green-500 bg-green-50",
      });
    }

    if (stats?.totalMessages) {
      recentActivities.push({
        id: "msg-1",
        type: "message",
        title: "Mensagens recebidas",
        description: `${stats.totalMessages} mensagens dos convidados`,
        time: "Recente",
        icon: MessageCircle,
        color: "text-purple-500 bg-purple-50",
      });
    }

    if (pendingPhotos > 0) {
      recentActivities.push({
        id: "photo-1",
        type: "photo",
        title: "Fotos para moderar",
        description: `${pendingPhotos} fotos aguardando aprovação`,
        time: "Pendente",
        icon: Camera,
        color: "text-amber-500 bg-amber-50",
      });
    }

    if (stats?.totalGifts) {
      recentActivities.push({
        id: "gift-1",
        type: "gift",
        title: "Lista de presentes",
        description: `${stats.totalGifts} presentes cadastrados`,
        time: "Ativo",
        icon: Gift,
        color: "text-pink-500 bg-pink-50",
      });
    }

    setActivities(recentActivities);
  }, [stats, pendingPhotos]);

  // Calculate task stats
  const completedTasks = tasks.filter((t) => t.is_completed === 1).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const urgentTasks = tasks
    .filter((t) => t.is_completed === 0 && t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 3);

  // Calculate budget stats
  const totalEstimated = expenses.reduce((sum, e) => sum + (e.estimated_amount || 0), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + (e.paid_amount || 0), 0);
  const budgetPercentage = totalEstimated > 0 ? Math.round((totalSpent / totalEstimated) * 100) : 0;
  const isOverBudget = totalSpent > totalEstimated && totalEstimated > 0;

  // Calculate RSVP stats
  const pendingRsvp = (stats?.totalGuests || 0) - (stats?.confirmedGuests || 0);

  // Get contextual tip
  const getContextualTip = () => {
    if (!wedding?.wedding_date) {
      return { icon: Calendar, message: "Configure a data do casamento para ver o contador regressivo!", color: "bg-blue-50 border-blue-200 text-blue-800" };
    }

    const weddingDate = new Date(wedding.wedding_date);
    const now = new Date();
    const daysUntil = Math.ceil((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 0) {
      return { icon: PartyPopper, message: "Parabéns pelo casamento! 🎉 Esperamos que tudo tenha sido maravilhoso!", color: "bg-pink-50 border-pink-200 text-pink-800" };
    }
    if (daysUntil <= 7) {
      return { icon: Sparkles, message: "A semana do casamento chegou! Respire fundo e aproveite cada momento especial.", color: "bg-amber-50 border-amber-200 text-amber-800" };
    }
    if (daysUntil <= 30) {
      return { icon: Bell, message: "Faltam menos de 30 dias! Hora de confirmar todos os fornecedores e detalhes finais.", color: "bg-orange-50 border-orange-200 text-orange-800" };
    }
    if (daysUntil <= 90) {
      return { icon: CheckSquare, message: "3 meses para o grande dia! Envie os convites e confirme os convidados.", color: "bg-green-50 border-green-200 text-green-800" };
    }
    if (daysUntil <= 180) {
      return { icon: Calendar, message: "6 meses de preparação! Foque em contratar os principais fornecedores.", color: "bg-blue-50 border-blue-200 text-blue-800" };
    }
    return { icon: Heart, message: "Aproveite o tempo para planejar com calma cada detalhe do seu casamento!", color: "bg-purple-50 border-purple-200 text-purple-800" };
  };

  const tip = getContextualTip();
  const TipIcon = tip.icon;

  const quickActions: {
    label: string;
    icon: typeof Heart;
    color: string;
    onClick?: () => void;
    href?: string;
  }[] = [
    { label: "Adicionar Convidado", icon: Users, onClick: () => onNavigateTab("guests"), color: "bg-blue-500 hover:bg-blue-600" },
    { label: "Ver Lista de Presentes", icon: Gift, onClick: () => onNavigateTab("gifts"), color: "bg-pink-500 hover:bg-pink-600" },
    wedding?.custom_url
      ? { label: "Ver Site do Casal", icon: ExternalLink, href: `/c/${wedding.custom_url}`, color: "bg-primary hover:bg-primary/90" }
      : { label: "Configurar Casamento", icon: Sparkles, onClick: onSetupWedding, color: "bg-primary hover:bg-primary/90" },
    { label: "Compartilhar Convite", icon: Heart, onClick: () => onNavigateTab("invite"), color: "bg-rose-500 hover:bg-rose-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium mb-1">
            Olá, {userName}! 💍
          </h1>
          <p className="text-muted-foreground">
            {wedding
              ? `Casamento de ${wedding.partner1_name} & ${wedding.partner2_name}`
              : "Configure seu casamento para começar"}
          </p>
        </div>
        {wedding?.is_published === 1 && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Site publicado
          </div>
        )}
      </div>

      {/* Setup Wedding CTA */}
      {!wedding && (
        <div className="bg-gradient-to-r from-primary via-gold-light to-primary p-8 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="font-serif text-2xl font-semibold mb-2">
              Complete seu perfil de casal
            </h2>
            <p className="text-white/80 mb-6 max-w-lg">
              Configure as informações do seu casamento para começar a criar seu
              site e lista de presentes.
            </p>
            <Button
              onClick={onSetupWedding}
              className="bg-white text-primary hover:bg-white/90 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Configurar Casamento
            </Button>
          </div>
        </div>
      )}

      {/* Countdown Timer */}
      {wedding?.wedding_date && (
        <div className="bg-gradient-to-br from-primary/10 via-blush/40 to-champagne rounded-2xl p-6 md:p-8 border border-primary/15 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 text-primary/15">
            <Heart className="w-40 h-40 fill-current" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Contagem Regressiva
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl">
              {[
                { value: countdown.days, label: "Dias" },
                { value: countdown.hours, label: "Horas" },
                { value: countdown.minutes, label: "Minutos" },
                { value: countdown.seconds, label: "Segundos" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-sm border border-white/60">
                    <span className="font-serif text-3xl md:text-5xl font-bold text-primary tabular-nums">
                      {item.value.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground mt-2 block font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm mt-4 capitalize">
              {new Date(wedding.wedding_date).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Contextual Tip */}
      <div className={`rounded-xl p-4 border flex items-start gap-3 ${tip.color}`}>
        <TipIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium">{tip.message}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            {pendingRsvp > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {pendingRsvp} pendente{pendingRsvp > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Convidados</p>
          <p className="font-serif text-3xl font-semibold">{stats?.totalGuests || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-50">
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs text-green-600 font-medium">
              {stats?.totalGuests ? Math.round(((stats?.confirmedGuests || 0) / stats.totalGuests) * 100) : 0}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Confirmados</p>
          <p className="font-serif text-3xl font-semibold text-green-600">{stats?.confirmedGuests || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <MessageCircle className="w-5 h-5 text-purple-500" />
            </div>
            {pendingMessages > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {pendingMessages} novo{pendingMessages > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Mensagens</p>
          <p className="font-serif text-3xl font-semibold">{stats?.totalMessages || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-pink-50">
              <Gift className="w-5 h-5 text-pink-500" />
            </div>
            {pendingPhotos > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Image className="w-3 h-3" /> {pendingPhotos}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Presentes</p>
          <p className="font-serif text-3xl font-semibold">{stats?.totalGifts || 0}</p>
        </div>
      </div>

      {/* Total Raised */}
      {stats?.totalAmount ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Total Arrecadado</p>
                <p className="font-serif text-3xl font-semibold text-green-700">
                  R$ {stats.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => onNavigateTab("financeiro")}
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      ) : null}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task Progress */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Progresso das Tarefas</h3>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Concluído</span>
              <span className="font-medium text-primary">{taskProgress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-gold-light rounded-full transition-all duration-500"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </div>

          {urgentTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Próximas tarefas</p>
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm p-2 bg-amber-50 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="flex-1 truncate">{task.title}</span>
                  {task.due_date && (
                    <span className="text-xs text-amber-600 whitespace-nowrap">
                      {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button 
            variant="ghost" 
            className="w-full mt-4 text-primary hover:bg-primary/5"
            onClick={() => onNavigateTab("tasks")}
          >
            Ver todas as tarefas <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Budget Summary */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Resumo do Orçamento</h3>
            </div>
            {isOverBudget && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Acima do orçamento
              </span>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Orçamento total</span>
              <span className="font-medium">R$ {totalEstimated.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total gasto</span>
              <span className={`font-medium ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
                R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? "bg-red-500" : budgetPercentage > 80 ? "bg-amber-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{budgetPercentage}% utilizado</span>
              <span>Restante: R$ {Math.max(totalEstimated - totalSpent, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-primary hover:bg-primary/5"
            onClick={() => onNavigateTab("budget")}
          >
            Ver orçamento completo <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Activity Feed */}
      {activities.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Atividade Recente</h3>
          </div>
          <div className="space-y-3">
            {activities.map((activity) => {
              const ActivityIcon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${activity.color}`}>
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Ações Rápidas</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            if (action.href) {
              return (
                <Link
                  key={action.label}
                  to={action.href}
                  target="_blank"
                  className={`${action.color} text-white rounded-xl p-4 text-center transition-all hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <ActionIcon className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              );
            }
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`${action.color} text-white rounded-xl p-4 text-center transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                <ActionIcon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
