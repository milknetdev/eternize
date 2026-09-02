import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  Heart,
  Sparkles,
  CheckCircle,
  Loader2,
  ImagePlus,
  User,
  MessageSquare,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface WeddingInfo {
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  theme_primary_color?: string;
  theme_accent_color?: string;
}

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  caption: string;
  status: "pending" | "uploading" | "done" | "error";
}

export default function GuestGalleryUpload() {
  const { customUrl } = useParams<{ customUrl: string }>();
  const [wedding, setWedding] = useState<WeddingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchWedding() {
      try {
        const res = await fetch(`/api/public/wedding/${customUrl}`);
        if (res.ok) {
          const data = await res.json();
          setWedding(data.wedding);
        }
      } catch (error) {
        console.error("Failed to fetch wedding:", error);
      } finally {
        setLoading(false);
      }
    }
    if (customUrl) {
      fetchWedding();
    }
  }, [customUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: UploadedPhoto[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      status: "pending",
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const updateCaption = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const handleUpload = async () => {
    if (!guestName.trim() || photos.length === 0) return;

    setUploading(true);

    for (const photo of photos) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, status: "uploading" } : p))
      );

      try {
        const formData = new FormData();
        formData.append("file", photo.file);
        formData.append("guest_name", guestName.trim());
        formData.append("caption", photo.caption);

        const res = await fetch(`/api/public/wedding/${customUrl}/guest-photos`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          setPhotos((prev) =>
            prev.map((p) => (p.id === photo.id ? { ...p, status: "done" } : p))
          );
        } else {
          setPhotos((prev) =>
            prev.map((p) => (p.id === photo.id ? { ...p, status: "error" } : p))
          );
        }
      } catch {
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: "error" } : p))
        );
      }
    }

    setUploading(false);
    setUploadComplete(true);
  };

  const primaryColor = wedding?.theme_primary_color || "#B8860B";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white flex items-center justify-center p-4">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-serif mb-2">Casamento não encontrado</h1>
          <p className="text-muted-foreground">
            O link pode estar incorreto ou o casamento não está publicado.
          </p>
        </div>
      </div>
    );
  }

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-3xl font-serif mb-4">Obrigado, {guestName}!</h1>
          <p className="text-muted-foreground mb-8">
            Suas fotos foram enviadas com sucesso! Elas aparecerão na galeria após aprovação dos noivos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setPhotos([]);
                setUploadComplete(false);
              }}
              style={{ backgroundColor: primaryColor }}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              Enviar mais fotos
            </Button>
            <Link to={`/c/${customUrl}`}>
              <Button variant="outline" className="gap-2 w-full">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao site
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to={`/c/${customUrl}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="font-serif text-sm">
              {wedding.partner1_name} & {wedding.partner2_name}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Camera className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif mb-3">
            Galeria Colaborativa
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Compartilhe seus melhores momentos do casamento de{" "}
            <span className="font-medium text-foreground">
              {wedding.partner1_name} & {wedding.partner2_name}
            </span>
          </p>
        </motion.div>

        {/* Guest Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border p-6 mb-6"
        >
          <label className="flex items-center gap-2 text-sm font-medium mb-3">
            <User className="w-4 h-4" style={{ color: primaryColor }} />
            Seu nome
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Como você quer ser identificado(a)?"
            className="w-full p-4 rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
            style={{ borderColor: guestName ? primaryColor : undefined }}
          />
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border p-6 mb-6"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {photos.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-16 border-2 border-dashed rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <ImagePlus className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg mb-1">
                    Clique para selecionar fotos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou arraste e solte aqui
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou HEIC • Máximo 10MB por foto
                </p>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                  {photos.length} foto{photos.length !== 1 ? "s" : ""} selecionada
                  {photos.length !== 1 ? "s" : ""}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1"
                >
                  <ImagePlus className="w-4 h-4" />
                  Adicionar mais
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <AnimatePresence>
                  {photos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                        <img
                          src={photo.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {photo.status === "uploading" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                          </div>
                        )}
                        {photo.status === "done" && (
                          <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                          </div>
                        )}
                        {photo.status === "error" && (
                          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                            <X className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      {photo.status === "pending" && (
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {photo.status === "pending" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={photo.caption}
                            onChange={(e) => updateCaption(photo.id, e.target.value)}
                            placeholder="Legenda (opcional)"
                            className="w-full text-xs p-2 rounded-lg border focus:border-primary outline-none"
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4"
          >
            <Button
              onClick={handleUpload}
              disabled={!guestName.trim() || uploading}
              className="w-full py-6 text-lg gap-2 shadow-xl"
              style={{ backgroundColor: primaryColor }}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Enviar {photos.length} foto{photos.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
            {!guestName.trim() && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                <MessageSquare className="w-3 h-3 inline mr-1" />
                Preencha seu nome para enviar
              </p>
            )}
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-muted/30 rounded-xl"
        >
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
            Dicas para fotos incríveis
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Fotos em boa iluminação ficam mais bonitas</li>
            <li>• Momentos espontâneos são os mais especiais</li>
            <li>• Adicione legendas para contar a história da foto</li>
            <li>• As fotos serão aprovadas pelos noivos antes de aparecer</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
