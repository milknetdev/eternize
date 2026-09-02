import { authFetch } from "@/react-app/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Loader2, Heart, AlertCircle, Clock } from "lucide-react";
import { WeddingProvider, WeddingData, WeddingPhoto, StoryItem } from "@/react-app/contexts/WeddingContext";
import DynamicHero from "@/react-app/components/couple-dynamic/DynamicHero";
import DynamicStory from "@/react-app/components/couple-dynamic/DynamicStory";
import DynamicGallery from "@/react-app/components/couple-dynamic/DynamicGallery";
import DynamicTimeline from "@/react-app/components/couple-dynamic/DynamicTimeline";
import DynamicLocation from "@/react-app/components/couple-dynamic/DynamicLocation";
import DynamicDressCode from "@/react-app/components/couple-dynamic/DynamicDressCode";
import DynamicGifts from "@/react-app/components/couple-dynamic/DynamicGifts";
import DynamicConfirmCTA from "@/react-app/components/couple-dynamic/DynamicConfirmCTA";
import DynamicGodparents from "@/react-app/components/couple-dynamic/DynamicGodparents";
import DynamicParents from "@/react-app/components/couple-dynamic/DynamicParents";
import DynamicAccommodations from "@/react-app/components/couple-dynamic/DynamicAccommodations";
import DynamicMessages from "@/react-app/components/couple-dynamic/DynamicMessages";
import DynamicFooter from "@/react-app/components/couple-dynamic/DynamicFooter";
import MusicPlayer from "@/react-app/components/couple-dynamic/MusicPlayer";

export default function CouplePage() {
  const { customUrl } = useParams<{ customUrl: string }>();
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [photos, setPhotos] = useState<WeddingPhoto[]>([]);
  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnpublished, setIsUnpublished] = useState(false);

  useEffect(() => {
    if (!customUrl) return;

    const fetchWedding = async () => {
      try {
        // Fetch wedding data and photos in parallel
        const [weddingRes, photosRes] = await Promise.all([
          authFetch(`/api/public/wedding/${customUrl}`),
          authFetch(`/api/public/wedding/${customUrl}/photos`)
        ]);
        
        if (!weddingRes.ok) {
          const errorData = await weddingRes.json().catch(() => ({}));
          if (errorData.unpublished) {
            setIsUnpublished(true);
            setError("Site ainda não publicado");
          } else if (weddingRes.status === 404) {
            setError("Casamento não encontrado");
          } else {
            setError("Erro ao carregar página");
          }
          return;
        }
        
        const weddingData = await weddingRes.json();
        setWedding(weddingData.wedding);
        setStoryItems(weddingData.storyItems || []);
        
        if (photosRes.ok) {
          const photosData = await photosRes.json();
          setPhotos(photosData || []);
        }
        
        // Update page title
        document.title = `${weddingData.wedding.partner1_name} & ${weddingData.wedding.partner2_name} | Eternize`;
      } catch (err) {
        setError("Erro ao carregar página");
      } finally {
        setLoading(false);
      }
    };

    fetchWedding();
  }, [customUrl]);

  // Load fonts dynamically based on theme
  useEffect(() => {
    if (!wedding) return;

    const headingFont = wedding.theme_heading_font || "Cormorant Garamond";
    const bodyFont = wedding.theme_body_font || "Montserrat";
    
    const fontFamilies = [headingFont, bodyFont]
      .filter((f, i, arr) => arr.indexOf(f) === i) // Remove duplicates
      .map((f) => f.replace(/ /g, "+") + ":wght@400;500;600;700")
      .join("&family=");

    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [wedding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-champagne mx-auto mb-4" />
          <p className="text-warm-gray font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isUnpublished ? "bg-amber-100" : "bg-rose/10"
          }`}>
            {isUnpublished ? (
              <Clock className="w-10 h-10 text-amber-600" />
            ) : (
              <AlertCircle className="w-10 h-10 text-rose" />
            )}
          </div>
          <h1 className="font-serif text-3xl text-charcoal mb-4">
            {isUnpublished ? "Em breve!" : (error || "Página não encontrada")}
          </h1>
          <p className="text-warm-gray mb-8">
            {isUnpublished 
              ? "Os noivos ainda estão preparando o site. Volte em breve para ver todos os detalhes do casamento!"
              : "Não conseguimos encontrar esta página de casamento. Verifique o endereço e tente novamente."
            }
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-champagne text-white rounded-full hover:bg-champagne/90 transition-colors"
          >
            <Heart className="w-4 h-4" />
            {isUnpublished ? "Conhecer o Eternize" : "Criar seu site de casamento"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <WeddingProvider wedding={wedding} photos={photos} storyItems={storyItems}>
      <CouplePageContent />
    </WeddingProvider>
  );
}

function CouplePageContent() {
  return (
    <div className="min-h-screen">
      <DynamicHero />
      <DynamicStory />
      <DynamicGallery />
      <DynamicTimeline />
      <DynamicParents />
      <DynamicGodparents />
      <DynamicLocation />
      <DynamicDressCode />
      <DynamicAccommodations />
      <DynamicGifts />
      <DynamicConfirmCTA />
      <DynamicMessages />
      <DynamicFooter />
      <MusicPlayer />
    </div>
  );
}
