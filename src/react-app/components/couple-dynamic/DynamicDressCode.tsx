import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Shirt, Heart } from "lucide-react";

// Dress code presets with descriptions
const dressCodePresets: Record<string, { title: string; description: string }> = {
  "esporte-fino": {
    title: "Esporte Fino",
    description: "Para os homens, sugerimos calça social e camisa. Para as mulheres, vestido midi ou longo, conjuntos elegantes.",
  },
  "traje-social": {
    title: "Traje Social",
    description: "Homens de terno e gravata. Mulheres com vestido longo ou midi elegante.",
  },
  "black-tie": {
    title: "Black Tie",
    description: "Homens de smoking. Mulheres com vestido longo de gala.",
  },
  "casual-chic": {
    title: "Casual Chic",
    description: "Elegante mas descontraído. Homens podem usar blazer sem gravata. Mulheres com vestido ou conjunto sofisticado.",
  },
  "traje-a-rigor": {
    title: "Traje a Rigor",
    description: "A mais alta formalidade. Homens de fraque ou smoking. Mulheres com vestido longo de gala e joias.",
  },
  "rustico": {
    title: "Rústico/Country",
    description: "Celebração ao ar livre. Vista-se confortavelmente mas com elegância. Evite saltos muito altos.",
  },
  "praia": {
    title: "Traje Praia",
    description: "Leve e elegante. Tecidos fluidos, cores claras. Sapatos confortáveis para areia.",
  },
};

export default function DynamicDressCode() {
  const { theme, wedding } = useWedding();

  // Check if section should be shown
  if (wedding.show_dresscode === 0) {
    return null;
  }

  // Get dress code info
  const dressCodeKey = wedding.dress_code || "esporte-fino";
  const preset = dressCodePresets[dressCodeKey] || dressCodePresets["esporte-fino"];
  const customDescription = wedding.dress_code_description;
  
  const displayTitle = preset.title;
  const displayDescription = customDescription && customDescription.trim() 
    ? customDescription 
    : preset.description;

  // Color map for display
  const colorMap: Record<string, string> = {
    "#FFFFFF": "Branco",
    "#000000": "Preto",
    "#1E3A5F": "Azul Marinho",
    "#D4C4B0": "Nude/Bege",
    "#4A6741": "Verde Escuro",
    "#722F37": "Bordeaux/Vinho",
    "#C4C4C4": "Cinza",
    "#E8D5C4": "Rosa Claro",
    "#B4C8D9": "Azul Claro",
    "#B2C4A8": "Verde Claro",
    "#D4AF37": "Dourado",
    "#C0C0C0": "Prata",
    "#F7E7CE": "Champagne",
    "#7B3F00": "Marrom",
    "#4B0082": "Roxo",
  };

  // Parse colors from wedding data
  const allowedColorsRaw = wedding.dress_code_allowed_colors;
  const avoidColorsRaw = wedding.dress_code_avoid_colors;

  let suggestedColors: { name: string; hex: string }[] = [];
  let avoidColors: { name: string; hex: string }[] = [];

  try {
    if (allowedColorsRaw) {
      const parsed = JSON.parse(allowedColorsRaw);
      suggestedColors = parsed.map((hex: string) => ({
        hex,
        name: colorMap[hex] || hex,
      }));
    }
  } catch {
    // Fallback
  }

  try {
    if (avoidColorsRaw) {
      const parsed = JSON.parse(avoidColorsRaw);
      avoidColors = parsed.map((hex: string) => ({
        hex,
        name: colorMap[hex] || hex,
      }));
    }
  } catch {
    // Default
    avoidColors = [
      { name: "Branco", hex: "#FFFFFF" },
      { name: "Preto", hex: "#000000" },
    ];
  }

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
            Dress Code
          </p>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Traje Sugerido
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Shirt className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
        </div>

        <div className={`grid gap-8 ${suggestedColors.length > 0 || avoidColors.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-xl mx-auto'}`}>
          {/* Dress Code Info */}
          <div 
            className="p-8 rounded-2xl text-center"
            style={{ backgroundColor: theme.secondary }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <Shirt className="w-10 h-10" style={{ color: theme.primary }} />
            </div>
            <h3 
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: theme.headingFont, color: theme.text }}
            >
              {displayTitle}
            </h3>
            <p className="mb-6 whitespace-pre-wrap" style={{ color: `${theme.text}80` }}>
              {displayDescription}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-sm" style={{ color: `${theme.text}60` }}>
                O importante é sua presença!
              </span>
            </div>
          </div>

          {/* Colors */}
          {(suggestedColors.length > 0 || avoidColors.length > 0) && (
          <div className="space-y-6">
            {/* Suggested Colors */}
            {suggestedColors.length > 0 && (
            <div 
              className="p-6 rounded-2xl"
              style={{ backgroundColor: theme.secondary }}
            >
              <h4 
                className="text-lg font-semibold mb-4"
                style={{ color: theme.text }}
              >
                Cores sugeridas
              </h4>
              <div className="flex flex-wrap gap-3">
                {suggestedColors.map((color) => (
                  <div key={color.name} className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full shadow-md"
                      style={{ backgroundColor: color.hex, border: "2px solid white" }}
                    />
                    <span className="text-sm" style={{ color: `${theme.text}80` }}>
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Avoid Colors */}
            {avoidColors.length > 0 && (
            <div 
              className="p-6 rounded-2xl"
              style={{ backgroundColor: theme.secondary }}
            >
              <h4 
                className="text-lg font-semibold mb-4"
                style={{ color: theme.text }}
              >
                Por favor, evitar
              </h4>
              <div className="flex flex-wrap gap-3">
                {avoidColors.map((color) => (
                  <div key={color.name} className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full shadow-md relative"
                      style={{ backgroundColor: color.hex, border: "2px solid #ccc" }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45" />
                      </div>
                    </div>
                    <span className="text-sm" style={{ color: `${theme.text}80` }}>
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
