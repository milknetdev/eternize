import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Clock, Car } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

export default function LocationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <section ref={sectionRef} className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Local do Evento
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Estamos ansiosos para recebê-los neste lugar especial
          </p>
        </div>

        <div
          className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Map */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-[4/3] bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975853578046!2d-46.65665508502099!3d-23.561684784683147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1sen!2sbr!4v1650000000000!5m2!1sen!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8">
            {/* Venue */}
            <div className="bg-cream rounded-2xl p-8">
              <h3 className="font-serif text-2xl font-semibold mb-4">
                Espaço Villa Garden
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Endereço</p>
                    <p className="text-muted-foreground">
                      Av. das Flores, 1500 - Jardim Europa
                      <br />
                      São Paulo - SP, 01452-000
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Horário</p>
                    <p className="text-muted-foreground">
                      Sábado, 15 de Março de 2025
                      <br />
                      A partir das 15:30
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Estacionamento</p>
                    <p className="text-muted-foreground">
                      Estacionamento gratuito no local com manobrista
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="mt-6 bg-gradient-to-r from-primary to-gold-light text-white rounded-full"
                onClick={() =>
                  window.open(
                    "https://www.google.com/maps/dir//Av.+Paulista,+São+Paulo+-+SP",
                    "_blank"
                  )
                }
              >
                <Navigation className="w-4 h-4 mr-2" />
                Como Chegar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
