import { useState } from "react";
import { Link } from "react-router";
import { authFetch } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import { Settings, Loader2, ExternalLink, X, Check, Palette, AlertCircle } from "lucide-react";
import type { Wedding } from "@/react-app/components/dashboard-types";

// Settings Tab Component
export function SettingsTab({
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
        <div className={`rounded-2xl border p-6 mb-6 ${
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
        className="block bg-gradient-to-r from-primary/10 via-gold-light/10 to-primary/10 rounded-2xl border border-primary/20 p-6 mb-4 hover:border-primary/40 transition-colors group"
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
        className="block bg-gradient-to-r from-secondary/30 via-primary/5 to-secondary/30 rounded-2xl border border-secondary p-6 mb-6 hover:border-primary/40 transition-colors group"
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
      
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
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
