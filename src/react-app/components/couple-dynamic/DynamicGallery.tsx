import { authFetch } from "@/react-app/lib/api";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useWedding, useWeddingPhotos } from "@/react-app/contexts/WeddingContext";
import { X, ChevronLeft, ChevronRight, Camera, ImageOff, Upload, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GuestPhoto {
  id: number;
  guest_name: string;
  filename: string;
  storage_key: string;
  caption: string | null;
  created_at: string;
}

// Fallback placeholder photos when no real photos exist
const placeholderPhotos = [
  { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop", caption: "Nosso ensaio" },
  { url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&h=600&fit=crop", caption: "Pôr do sol" },
  { url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=600&fit=crop", caption: "Momento especial" },
  { url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&h=600&fit=crop", caption: "Amor" },
  { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=800&fit=crop", caption: "Juntos" },
  { url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&h=600&fit=crop", caption: "Felicidade" },
];

export default function DynamicGallery() {
  const { theme, wedding, demo } = useWedding();
  const weddingPhotos = useWeddingPhotos();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([]);
  const [viewingGuest, setViewingGuest] = useState(false);
  const [selectedGuestIndex, setSelectedGuestIndex] = useState<number | null>(null);

  // Fetch approved guest photos
  useEffect(() => {
    if (demo) {
      setGuestPhotos((demo.guestPhotos as GuestPhoto[]) ?? []);
      return;
    }
    if (wedding.custom_url) {
      authFetch(`/api/public/wedding/${wedding.custom_url}/guest-photos`)
        .then(res => res.json())
        .then(data => {
          if (data.photos) setGuestPhotos(data.photos);
        })
        .catch(console.error);
    }
  }, [wedding.custom_url]);

  // Check if gallery should be shown
  if (wedding.show_gallery === 0) {
    return null;
  }

  // Convert wedding photos to display format, or use placeholders
  const hasRealPhotos = weddingPhotos.length > 0;
  const photos = hasRealPhotos
    ? weddingPhotos.map((photo) => ({
        url: `/api/files/${photo.storage_key}`,
        caption: photo.caption || "",
      }))
    : placeholderPhotos;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };
  
  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  // Guest photos lightbox
  const openGuestLightbox = (index: number) => {
    setSelectedGuestIndex(index);
    setViewingGuest(true);
  };
  const closeGuestLightbox = () => {
    setSelectedGuestIndex(null);
    setViewingGuest(false);
  };
  const goNextGuest = () => {
    if (selectedGuestIndex !== null) {
      setSelectedGuestIndex((selectedGuestIndex + 1) % guestPhotos.length);
    }
  };
  const goPrevGuest = () => {
    if (selectedGuestIndex !== null) {
      setSelectedGuestIndex((selectedGuestIndex - 1 + guestPhotos.length) % guestPhotos.length);
    }
  };

  return (
    <section 
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.secondary, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p 
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Momentos Especiais
          </p>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Nossa Galeria
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Camera className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
          {!hasRealPhotos && (
            <p className="text-sm mt-4 opacity-60" style={{ color: theme.text }}>
              Fotos de exemplo — em breve nossas fotos!
            </p>
          )}
          
          {/* Guest Upload Link */}
          <Link
            to={`/c/${wedding.custom_url}/galeria`}
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: theme.primary,
              color: theme.background,
              fontFamily: theme.bodyFont
            }}
          >
            <Upload className="w-4 h-4" />
            <span>Compartilhe suas fotos</span>
          </Link>
        </div>

        {/* Empty State */}
        {photos.length === 0 && (
          <div className="text-center py-16">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <ImageOff className="w-10 h-10" style={{ color: theme.primary }} />
            </div>
            <h3 
              className="text-xl font-medium mb-2"
              style={{ fontFamily: theme.headingFont, color: theme.text }}
            >
              Galeria em breve
            </h3>
            <p className="opacity-70" style={{ color: theme.text }}>
              Os noivos ainda estão preparando as fotos
            </p>
          </div>
        )}

        {/* Masonry Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                  index === 0 || index === 4 ? "row-span-2" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Foto ${index + 1}`}
                  className="w-full h-full object-cover min-h-[200px] md:min-h-[250px]"
                  loading="lazy"
                />
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                  style={{ background: `linear-gradient(to top, ${theme.text}80, transparent)` }}
                >
                  {photo.caption && (
                    <p className="text-white font-medium">{photo.caption}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Guest Photos Section */}
        {guestPhotos.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12" style={{ backgroundColor: `${theme.primary}50` }} />
                <Users className="w-5 h-5" style={{ color: theme.primary }} />
                <div className="h-px w-12" style={{ backgroundColor: `${theme.primary}50` }} />
              </div>
              <h3 
                className="text-2xl md:text-3xl mb-2"
                style={{ fontFamily: theme.headingFont, color: theme.text }}
              >
                Fotos dos Convidados
              </h3>
              <p className="text-sm opacity-70" style={{ color: theme.text }}>
                Momentos compartilhados por quem celebra conosco
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {guestPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="relative overflow-hidden rounded-lg cursor-pointer group aspect-square"
                  whileHover={{ scale: 1.03 }}
                  onClick={() => openGuestLightbox(index)}
                >
                  <img
                    src={`/api/files/${photo.storage_key}`}
                    alt={photo.caption || `Foto de ${photo.guest_name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-3"
                    style={{ background: `linear-gradient(to top, ${theme.text}90, transparent 60%)` }}
                  >
                    <p className="text-white text-sm font-medium text-center">{photo.guest_name}</p>
                    {photo.caption && (
                      <p className="text-white/80 text-xs text-center mt-1">{photo.caption}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && photos[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].caption || `Foto ${selectedIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
              {photos[selectedIndex].caption && (
                <p className="font-medium">{photos[selectedIndex].caption}</p>
              )}
              <p className="text-sm opacity-60">{selectedIndex + 1} / {photos.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest Photos Lightbox */}
      <AnimatePresence>
        {viewingGuest && selectedGuestIndex !== null && guestPhotos[selectedGuestIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeGuestLightbox}
          >
            <button
              onClick={closeGuestLightbox}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goPrevGuest(); }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <motion.img
              key={selectedGuestIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={`/api/files/${guestPhotos[selectedGuestIndex].storage_key}`}
              alt={guestPhotos[selectedGuestIndex].caption || `Foto de ${guestPhotos[selectedGuestIndex].guest_name}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); goNextGuest(); }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
              <p className="font-medium">{guestPhotos[selectedGuestIndex].guest_name}</p>
              {guestPhotos[selectedGuestIndex].caption && (
                <p className="text-sm opacity-80 mt-1">{guestPhotos[selectedGuestIndex].caption}</p>
              )}
              <p className="text-sm opacity-60 mt-1">{selectedGuestIndex + 1} / {guestPhotos.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
