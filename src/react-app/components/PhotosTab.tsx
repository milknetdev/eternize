import React, { useState } from "react";
import { authFetch } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import { Loader2, Pencil, Trash2, X, Check, Upload, GripVertical, Image, Plus } from "lucide-react";
import type { Photo } from "@/react-app/components/dashboard-types";

// Photos Tab Component
export function PhotosTab({
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
              
              {/* Overlay — always visible on touch, hover-reveal on desktop */}
              <div className="absolute inset-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 bg-gradient-to-b from-black/50 via-black/10 to-black/50 sm:from-black/60 sm:via-black/60 sm:to-black/60">
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
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary resize-none"
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
