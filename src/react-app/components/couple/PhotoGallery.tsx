import { useEffect, useRef, useState } from "react";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&h=400&fit=crop",
    alt: "Ensaio 1",
  },
  {
    src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&h=800&fit=crop",
    alt: "Ensaio 2",
  },
  {
    src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=400&fit=crop",
    alt: "Ensaio 3",
  },
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop",
    alt: "Ensaio 4",
  },
  {
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=400&fit=crop",
    alt: "Ensaio 5",
  },
  {
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop",
    alt: "Ensaio 6",
  },
];

export default function PhotoGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const openLightbox = (index: number) => {
    setCurrentPhoto(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Camera className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
              Nosso Ensaio
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Momentos especiais capturados pelo fotógrafo Ricardo Oliveira
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                onClick={() => openLightbox(index)}
                className={`relative group cursor-pointer overflow-hidden rounded-xl transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                } ${
                  index === 1 || index === 3 ? "row-span-2" : ""
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-50 group-hover:scale-100">
                    <Camera className="w-5 h-5 text-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <img
            src={photos[currentPhoto].src.replace("w=600", "w=1200")}
            alt={photos[currentPhoto].alt}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhoto(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPhoto ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
