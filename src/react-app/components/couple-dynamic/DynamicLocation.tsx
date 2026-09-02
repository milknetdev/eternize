import { useWedding } from "@/react-app/contexts/WeddingContext";
import { MapPin, Navigation, Clock, Heart, Calendar } from "lucide-react";

export default function DynamicLocation() {
  const { wedding, theme } = useWedding();

  // Check if section should be shown
  if (wedding.show_location === 0) {
    return null;
  }

  const venueName = wedding.venue_name || "Local a definir";
  const venueAddress = wedding.venue_address || "Endereço será informado em breve";
  const weddingDate = wedding.wedding_date ? new Date(wedding.wedding_date) : null;

  const openInMaps = () => {
    const query = encodeURIComponent(wedding.venue_address || wedding.venue_name || "");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  // Check if ceremony and reception are different locations
  const hasCeremonyVenue = wedding.ceremony_venue && wedding.ceremony_venue.trim();
  const hasReceptionVenue = wedding.reception_venue && wedding.reception_venue.trim();
  const hasSeparateVenues = hasCeremonyVenue || hasReceptionVenue;

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
            Localização
          </p>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Onde Será
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Heart className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Map Placeholder */}
          <div 
            className="relative overflow-hidden rounded-2xl h-80 md:h-96"
            style={{ border: `2px solid ${theme.accent}` }}
          >
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop"
              alt="Local do evento"
              className="w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: `${theme.text}40` }}
            >
              <button
                onClick={openInMaps}
                className="px-6 py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: theme.primary, color: "white" }}
              >
                <Navigation className="w-5 h-5" />
                Abrir no Maps
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Main Venue */}
            <div 
              className="p-6 rounded-2xl"
              style={{ backgroundColor: theme.background }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <MapPin className="w-6 h-6" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ fontFamily: theme.headingFont, color: theme.text }}
                  >
                    {venueName}
                  </h3>
                  <p style={{ color: `${theme.text}80` }}>
                    {venueAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Date */}
            {weddingDate && (
              <div 
                className="p-6 rounded-2xl"
                style={{ backgroundColor: theme.background }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Calendar className="w-6 h-6" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: theme.headingFont, color: theme.text }}
                    >
                      Data
                    </h3>
                    <p style={{ color: `${theme.text}80` }}>
                      {weddingDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ceremony & Reception if different */}
            {hasSeparateVenues && (
              <div 
                className="p-6 rounded-2xl"
                style={{ backgroundColor: theme.background }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Clock className="w-6 h-6" style={{ color: theme.primary }} />
                  </div>
                  <div className="space-y-4 flex-1">
                    {hasCeremonyVenue && (
                      <div>
                        <h4 
                          className="font-semibold mb-1"
                          style={{ color: theme.text }}
                        >
                          Cerimônia {wedding.ceremony_time && `• ${wedding.ceremony_time}`}
                        </h4>
                        <p className="text-sm" style={{ color: `${theme.text}80` }}>
                          {wedding.ceremony_venue}
                        </p>
                      </div>
                    )}
                    {hasReceptionVenue && (
                      <div>
                        <h4 
                          className="font-semibold mb-1"
                          style={{ color: theme.text }}
                        >
                          Recepção {wedding.reception_time && `• ${wedding.reception_time}`}
                        </h4>
                        <p className="text-sm" style={{ color: `${theme.text}80` }}>
                          {wedding.reception_venue}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Simple time if no separate venues */}
            {!hasSeparateVenues && (wedding.ceremony_time || wedding.reception_time) && (
              <div 
                className="p-6 rounded-2xl"
                style={{ backgroundColor: theme.background }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Clock className="w-6 h-6" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: theme.headingFont, color: theme.text }}
                    >
                      Horário
                    </h3>
                    <p style={{ color: `${theme.text}80` }}>
                      {wedding.ceremony_time && `Cerimônia: ${wedding.ceremony_time}`}
                      {wedding.ceremony_time && wedding.reception_time && " • "}
                      {wedding.reception_time && `Recepção: ${wedding.reception_time}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
