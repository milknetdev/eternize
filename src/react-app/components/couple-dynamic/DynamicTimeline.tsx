import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Clock, Church, Utensils, Music, Heart, PartyPopper, Camera, Car, Sparkles, Gift } from "lucide-react";

interface TimelineEventData {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  clock: Clock,
  heart: Heart,
  church: Church,
  rings: Heart,
  champagne: Utensils,
  cake: Gift,
  music: Music,
  camera: Camera,
  car: Car,
  sparkles: Sparkles,
};

export default function DynamicTimeline() {
  const { wedding, theme } = useWedding();

  // Check if section should be shown
  if (wedding.show_timeline === 0) {
    return null;
  }

  const weddingDate = wedding.wedding_date ? new Date(wedding.wedding_date) : null;
  
  // Parse custom timeline events from JSON
  let customEvents: TimelineEventData[] = [];
  if (wedding.timeline_events) {
    try {
      customEvents = JSON.parse(wedding.timeline_events);
    } catch {
      customEvents = [];
    }
  }
  
  // Build events from wedding data
  const legacyEvents = [];
  
  // Add ceremony event (if no custom events)
  if (customEvents.length === 0 && (wedding.ceremony_time || wedding.ceremony_venue)) {
    legacyEvents.push({
      time: wedding.ceremony_time || "A definir",
      title: "Cerimônia",
      description: wedding.ceremony_venue || "Local será informado",
      icon: Church,
    });
  }
  
  // Add reception event (if no custom events)
  if (customEvents.length === 0 && (wedding.reception_time || wedding.reception_venue)) {
    legacyEvents.push({
      time: wedding.reception_time || "A definir",
      title: "Recepção",
      description: wedding.reception_venue || "Local será informado",
      icon: PartyPopper,
    });
  }
  
  // Convert custom events to display format
  const customDisplayEvents = customEvents.map((event) => ({
    time: event.time || "A definir",
    title: event.title || "Evento",
    description: event.description || "",
    icon: iconMap[event.icon] || Clock,
  }));
  
  // If we have custom events, use them; otherwise use legacy or defaults
  const displayEvents = customDisplayEvents.length > 0 
    ? customDisplayEvents 
    : legacyEvents.length > 0 
      ? legacyEvents 
      : [
          {
            time: "15:30",
            title: "Recepção dos Convidados",
            description: "Chegada e acomodação dos convidados",
            icon: Clock,
          },
          {
            time: "16:00",
            title: "Cerimônia",
            description: "Celebração do nosso amor",
            icon: Church,
          },
          {
            time: "17:30",
            title: "Coquetel",
            description: "Drinks e canapés",
            icon: Utensils,
          },
          {
            time: "19:00",
            title: "Festa",
            description: "Jantar, música e diversão!",
            icon: Music,
          },
        ];

  const hasCustomEvents = customDisplayEvents.length > 0 || legacyEvents.length > 0;

  return (
    <section 
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.background, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p 
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Programação
          </p>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            O Grande Dia
          </h2>
          {weddingDate && (
            <p 
              className="text-xl"
              style={{ color: `${theme.text}80` }}
            >
              {weddingDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Heart className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
          {!hasCustomEvents && (
            <p className="text-sm mt-4 opacity-60" style={{ color: theme.text }}>
              Programação de exemplo — em breve os horários definitivos
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div 
            className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-px h-full"
            style={{ backgroundColor: `${theme.primary}30` }}
          />

          {displayEvents.map((event, index) => (
            <div
              key={index}
              className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Icon */}
              <div 
                className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-10"
                style={{ backgroundColor: theme.secondary, border: `2px solid ${theme.primary}` }}
              >
                <event.icon className="w-6 h-6" style={{ color: theme.primary }} />
              </div>

              {/* Content */}
              <div 
                className={`ml-24 md:ml-0 md:w-5/12 p-6 rounded-2xl ${
                  index % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto md:text-left"
                }`}
                style={{ backgroundColor: theme.secondary }}
              >
                <p 
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: theme.headingFont, color: theme.primary }}
                >
                  {event.time}
                </p>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: theme.text }}
                >
                  {event.title}
                </h3>
                <p style={{ color: `${theme.text}80` }}>
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
