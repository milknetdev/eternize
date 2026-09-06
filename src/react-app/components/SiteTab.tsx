import { useState } from "react";
import { Link } from "react-router";
import { authFetch } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import {
  Rocket,
  Palette,
  SlidersHorizontal,
  BookOpen,
  Image as ImageIcon,
  Camera,
  Crown,
  Users,
  Hotel,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  ArrowRight,
} from "lucide-react";
import { StoryTab } from "@/react-app/components/StoryTab";
import { PhotosTab } from "@/react-app/components/PhotosTab";
import { GuestPhotosTab } from "@/react-app/components/GuestPhotosTab";
import { GodparentsTab } from "@/react-app/components/GodparentsTab";
import { ParentsTab } from "@/react-app/components/ParentsTab";
import { AccommodationsTab } from "@/react-app/components/AccommodationsTab";
import type { Wedding, Photo } from "@/react-app/components/dashboard-types";

type SiteSection =
  | "publish"
  | "theme"
  | "sections"
  | "story"
  | "photos"
  | "guest-photos"
  | "godparents"
  | "parents"
  | "accommodations";

const NAV: { id: SiteSection; label: string; icon: typeof Rocket }[] = [
  { id: "publish", label: "Publicar", icon: Rocket },
  { id: "theme", label: "Aparência", icon: Palette },
  { id: "sections", label: "Seções & Conteúdo", icon: SlidersHorizontal },
  { id: "story", label: "Nossa História", icon: BookOpen },
  { id: "photos", label: "Fotos do Casal", icon: ImageIcon },
  { id: "guest-photos", label: "Galeria dos Convidados", icon: Camera },
  { id: "godparents", label: "Padrinhos", icon: Crown },
  { id: "parents", label: "Pais", icon: Users },
  { id: "accommodations", label: "Hospedagem", icon: Hotel },
];

export function SiteTab({
  wedding,
  photos,
  onRefresh,
}: {
  wedding: Wedding | null;
  photos: Photo[];
  onRefresh: () => void;
}) {
  const [section, setSection] = useState<SiteSection>("publish");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Meu Site</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Monte, personalize e publique o site do casamento — tudo aqui.
        </p>
      </div>

      {/* Sub navigation */}
      <div className="-mx-1 overflow-x-auto">
        <div className="flex gap-1 px-1 min-w-max">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {section === "publish" && <PublishPanel wedding={wedding} photos={photos} onRefresh={onRefresh} />}
        {section === "theme" && (
          <EditorLink
            to="/dashboard/tema"
            icon={Palette}
            title="Aparência do site"
            text="Escolha um template, ajuste as cores e as fontes. As mudanças aparecem no preview em tempo real."
          />
        )}
        {section === "sections" && (
          <EditorLink
            to="/dashboard/configuracoes"
            icon={SlidersHorizontal}
            title="Seções, conteúdo e evento"
            text="Ative ou esconda seções, defina horários e locais da cerimônia e recepção, dress code, linha do tempo e mídia."
          />
        )}
        {section === "story" && <StoryTab />}
        {section === "photos" && <PhotosTab photos={photos} onRefresh={onRefresh} />}
        {section === "guest-photos" && <GuestPhotosTab />}
        {section === "godparents" && <GodparentsTab />}
        {section === "parents" && <ParentsTab />}
        {section === "accommodations" && <AccommodationsTab />}
      </div>
    </div>
  );
}

function EditorLink({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string;
  icon: typeof Palette;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 bg-white rounded-2xl border border-border shadow-sm p-6 hover:border-primary/40 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-gold-light flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{text}</p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3">
          Abrir editor <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

function PublishPanel({
  wedding,
  photos,
  onRefresh,
}: {
  wedding: Wedding | null;
  photos: Photo[];
  onRefresh: () => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!wedding) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="font-serif text-lg font-medium mb-1">Configure seu casamento primeiro</h3>
        <p className="text-muted-foreground text-sm">
          Preencha os dados do casal na aba <strong>Configurações</strong> para começar a montar o site.
        </p>
      </div>
    );
  }

  const isPublished = wedding.is_published === 1;
  const siteUrl = wedding.custom_url ? `${window.location.origin}/c/${wedding.custom_url}` : null;

  const checklist = [
    { done: !!(wedding.partner1_name && wedding.partner2_name), label: "Nomes do casal" },
    { done: !!wedding.wedding_date, label: "Data do casamento" },
    { done: !!wedding.venue_name, label: "Local do evento" },
    { done: !!wedding.custom_url, label: "Endereço do site (URL)" },
    { done: photos.length > 0, label: "Ao menos uma foto do casal" },
    { done: !!wedding.pix_key, label: "Chave PIX (para a lista de presentes)" },
  ];
  const missing = checklist.filter((c) => !c.done).length;

  const togglePublish = async () => {
    setPublishing(true);
    try {
      const res = await authFetch("/api/wedding/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !isPublished }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = () => {
    if (!siteUrl) return;
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div
        className={`rounded-2xl border p-6 ${
          isPublished
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPublished ? "bg-green-100" : "bg-amber-100"
              }`}
            >
              {isPublished ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className={`font-medium ${isPublished ? "text-green-800" : "text-amber-800"}`}>
                {isPublished ? "Site no ar" : "Site em rascunho"}
              </h3>
              <p className={`text-sm ${isPublished ? "text-green-600" : "text-amber-600"}`}>
                {isPublished
                  ? "Qualquer pessoa com o link já consegue acessar."
                  : "Só você enxerga o site. Publique quando estiver pronto."}
              </p>
            </div>
          </div>
          <Button
            onClick={togglePublish}
            disabled={publishing || !wedding.custom_url}
            className={isPublished ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"}
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isPublished ? "Despublicar" : "Publicar site"}
          </Button>
        </div>

        {!wedding.custom_url && (
          <p className="text-xs text-amber-700 mt-3">
            Defina o endereço do site (URL) em <strong>Configurações</strong> antes de publicar.
          </p>
        )}

        {siteUrl && (
          <div className="mt-4 pt-4 border-t border-black/5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Link:</span>
            <code className="text-sm font-medium">{siteUrl.replace(/^https?:\/\//, "")}</code>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <Link
              to={`/c/${wedding.custom_url}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir
            </Link>
          </div>
        )}
      </div>

      {/* Readiness checklist */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Antes de publicar</h3>
          <span className="text-sm text-muted-foreground">
            {missing === 0 ? "Tudo pronto ✨" : `${missing} pendente${missing > 1 ? "s" : ""}`}
          </span>
        </div>
        <ul className="space-y-2">
          {checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-3 text-sm">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  c.done ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                }`}
              >
                {c.done ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <span className={c.done ? "" : "text-muted-foreground"}>{c.label}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mt-4">
          Nada disso é obrigatório para publicar — é só um roteiro para o site ficar completo.
        </p>
      </div>
    </div>
  );
}
