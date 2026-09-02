import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { Check, X, Trash2, User, Clock, Image, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, QrCode, Copy, Download, Link2 } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

interface GuestPhoto {
  id: number;
  guest_name: string;
  filename: string;
  storage_key: string;
  caption: string | null;
  is_approved: number | null;
  created_at: string;
  url?: string;
}

export function GuestPhotosTab() {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedPhoto, setSelectedPhoto] = useState<GuestPhoto | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const galleryUrl = customUrl ? `${window.location.origin}/c/${customUrl}/galeria` : null;

  const fetchPhotos = async () => {
    try {
      const res = await authFetch("/api/guest-photos", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error("Error fetching guest photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    // Fetch wedding custom URL
    const fetchWedding = async () => {
      try {
        const res = await authFetch("/api/wedding", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.wedding?.custom_url) {
            setCustomUrl(data.wedding.custom_url);
          }
        }
      } catch (error) {
        console.error("Error fetching wedding:", error);
      }
    };
    fetchWedding();
  }, []);

  const copyLink = () => {
    if (galleryUrl) {
      navigator.clipboard.writeText(galleryUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQrCode = () => {
    const svg = document.getElementById("gallery-qr-code");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
      }
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "qrcode-galeria.png";
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleApprove = async (id: number) => {
    setProcessing(id);
    try {
      const res = await authFetch(`/api/guest-photos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_approved: 1 }),
      });
      if (res.ok) {
        setPhotos(photos.map(p => p.id === id ? { ...p, is_approved: 1 } : p));
        if (selectedPhoto?.id === id) {
          setSelectedPhoto({ ...selectedPhoto, is_approved: 1 });
        }
      }
    } catch (error) {
      console.error("Error approving photo:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessing(id);
    try {
      const res = await authFetch(`/api/guest-photos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_approved: 0 }),
      });
      if (res.ok) {
        setPhotos(photos.map(p => p.id === id ? { ...p, is_approved: 0 } : p));
        if (selectedPhoto?.id === id) {
          setSelectedPhoto({ ...selectedPhoto, is_approved: 0 });
        }
      }
    } catch (error) {
      console.error("Error rejecting photo:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta foto?")) return;
    
    setProcessing(id);
    try {
      const res = await authFetch(`/api/guest-photos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== id));
        if (selectedPhoto?.id === id) {
          setSelectedPhoto(null);
        }
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
    } finally {
      setProcessing(null);
    }
  };

  const filteredPhotos = photos.filter(p => {
    if (filter === "pending") return p.is_approved === null;
    if (filter === "approved") return p.is_approved === 1;
    if (filter === "rejected") return p.is_approved === 0;
    return true;
  });

  const pendingCount = photos.filter(p => p.is_approved === null).length;
  const approvedCount = photos.filter(p => p.is_approved === 1).length;
  const rejectedCount = photos.filter(p => p.is_approved === 0).length;

  const currentIndex = selectedPhoto ? filteredPhotos.findIndex(p => p.id === selectedPhoto.id) : -1;
  
  const navigatePhoto = (direction: "prev" | "next") => {
    if (currentIndex === -1) return;
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < filteredPhotos.length) {
      setSelectedPhoto(filteredPhotos[newIndex]);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (photo: GuestPhoto) => {
    if (photo.is_approved === null) {
      return <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">Pendente</span>;
    }
    if (photo.is_approved === 1) {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Aprovada</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Rejeitada</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold">Galeria Colaborativa</h2>
          <p className="text-muted-foreground">Modere as fotos enviadas pelos convidados</p>
        </div>
        <div className="flex gap-2">
          {galleryUrl && (
            <Button variant="outline" size="sm" onClick={() => setShowQrModal(true)} className="gap-2">
              <QrCode className="w-4 h-4" />
              QR Code
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchPhotos} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* QR Code Share Section */}
      {galleryUrl && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-medium mb-1 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link da Galeria para Convidados
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Compartilhe este link para seus convidados enviarem fotos do casamento
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white rounded-lg border text-sm truncate">
                  {galleryUrl}
                </code>
                <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5 shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`p-4 rounded-xl border transition-colors ${
            filter === "all" ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/50"
          }`}
        >
          <div className="text-2xl font-bold">{photos.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`p-4 rounded-xl border transition-colors ${
            filter === "pending" ? "border-amber-500 bg-amber-50" : "border-border bg-white hover:border-amber-300"
          }`}
        >
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">Pendentes</div>
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`p-4 rounded-xl border transition-colors ${
            filter === "approved" ? "border-green-500 bg-green-50" : "border-border bg-white hover:border-green-300"
          }`}
        >
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <div className="text-sm text-muted-foreground">Aprovadas</div>
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`p-4 rounded-xl border transition-colors ${
            filter === "rejected" ? "border-red-500 bg-red-50" : "border-border bg-white hover:border-red-300"
          }`}
        >
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <div className="text-sm text-muted-foreground">Rejeitadas</div>
        </button>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <Image className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {filter === "pending" && "Nenhuma foto pendente"}
            {filter === "approved" && "Nenhuma foto aprovada"}
            {filter === "rejected" && "Nenhuma foto rejeitada"}
            {filter === "all" && "Nenhuma foto recebida ainda"}
          </h3>
          <p className="text-muted-foreground">
            {filter === "all" 
              ? "Compartilhe o link da galeria com seus convidados"
              : "As fotos aparecerão aqui quando houver"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-white cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url || `/api/files/${photo.storage_key}`}
                alt={photo.filename}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-2 text-white text-sm mb-1">
                    <User className="w-3 h-3" />
                    <span className="truncate">{photo.guest_name}</span>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute top-2 right-2">
                {getStatusBadge(photo)}
              </div>

              {/* Quick actions for pending */}
              {photo.is_approved === null && (
                <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white h-8"
                    onClick={(e) => { e.stopPropagation(); handleApprove(photo.id); }}
                    disabled={processing === photo.id}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 h-8"
                    onClick={(e) => { e.stopPropagation(); handleReject(photo.id); }}
                    disabled={processing === photo.id}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigatePhoto("prev"); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < filteredPhotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigatePhoto("next"); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Photo content */}
          <div 
            className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black">
              <img
                src={selectedPhoto.url || `/api/files/${selectedPhoto.storage_key}`}
                alt={selectedPhoto.filename}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6">
              {/* Photo info */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedPhoto.guest_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(selectedPhoto.created_at)}</span>
                </div>
                {getStatusBadge(selectedPhoto)}
              </div>

              {selectedPhoto.caption && (
                <p className="text-muted-foreground mb-4 italic">"{selectedPhoto.caption}"</p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {selectedPhoto.is_approved !== 1 && (
                  <Button
                    className="gap-2 bg-green-500 hover:bg-green-600"
                    onClick={() => handleApprove(selectedPhoto.id)}
                    disabled={processing === selectedPhoto.id}
                  >
                    <Check className="w-4 h-4" />
                    Aprovar
                  </Button>
                )}
                {selectedPhoto.is_approved !== 0 && (
                  <Button
                    variant="outline"
                    className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleReject(selectedPhoto.id)}
                    disabled={processing === selectedPhoto.id}
                  >
                    <X className="w-4 h-4" />
                    Rejeitar
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(selectedPhoto.url || `/api/files/${selectedPhoto.storage_key}`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Original
                </Button>
                <Button
                  variant="ghost"
                  className="gap-2 text-red-600 hover:bg-red-50 ml-auto"
                  onClick={() => handleDelete(selectedPhoto.id)}
                  disabled={processing === selectedPhoto.id}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && galleryUrl && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-xl font-serif font-semibold mb-2">QR Code da Galeria</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Imprima e coloque nas mesas ou no local do evento
              </p>
              
              <div className="bg-white p-4 rounded-xl border border-border inline-block mb-6">
                <QRCodeSVG 
                  id="gallery-qr-code"
                  value={galleryUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-xs text-muted-foreground mb-4 break-all">{galleryUrl}</p>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                  {copied ? "Copiado!" : "Copiar Link"}
                </Button>
                <Button className="flex-1 gap-2" onClick={downloadQrCode}>
                  <Download className="w-4 h-4" />
                  Baixar PNG
                </Button>
              </div>
            </div>
            
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
