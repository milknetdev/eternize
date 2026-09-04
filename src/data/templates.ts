/**
 * Layout = the *structure* of the couple site (section order, spacing rhythm,
 * heading treatment). Independent of colours/fonts. "classico" is the original
 * look; the others restructure the page without touching the palette.
 */
export type LayoutId = "classico" | "editorial" | "minimalista" | "moderno";

export const layouts: Record<LayoutId, { name: string; description: string }> = {
  classico: {
    name: "Clássico",
    description: "Seções centralizadas, títulos serifados e divisórias delicadas.",
  },
  editorial: {
    name: "Editorial",
    description: "Alinhado à esquerda, títulos enormes, ar de revista.",
  },
  minimalista: {
    name: "Minimalista",
    description: "Muito respiro, tipografia discreta, zero ornamento.",
  },
  moderno: {
    name: "Moderno",
    description: "Títulos em caixa alta, blocos marcantes, cantos bem arredondados.",
  },
};

export interface WeddingTemplate {
  id: string;
  name: string;
  description: string;
  category: "aventureiros" | "romanticos" | "modernos" | "artisticos" | "descontraidos" | "glamourosos" | "natureza" | "vintage";
  coupleStyle: string;
  isPremium: boolean;
  layout: LayoutId;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  previewImage: string;
  features: string[];
}

export const templates: WeddingTemplate[] = [
  // ═══════════════════════════════════════════
  // CASAIS AVENTUREIROS
  // ═══════════════════════════════════════════
  {
    id: "explorer",
    name: "Exploradores",
    description: "Para casais que amam viajar e descobrir o mundo juntos. Design inspirado em mapas e aventuras.",
    category: "aventureiros",
    coupleStyle: "Viajantes e desbravadores",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#2E5339",
      secondary: "#D4C4A8",
      accent: "#8B4513",
      background: "#F5F1E8",
      text: "#1A2F1E",
    },
    fonts: {
      heading: "Bebas Neue",
      body: "Source Sans Pro",
    },
    previewImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    features: ["Mapa interativo", "Timeline de viagens", "Estilo aventureiro", "Ícones de bússola"],
  },
  {
    id: "mountain",
    name: "Pico da Montanha",
    description: "Inspirado nas alturas para casais que amam trilhas, escaladas e a natureza selvagem.",
    category: "aventureiros",
    coupleStyle: "Amantes de montanha",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#4A6572",
      secondary: "#F9F7F4",
      accent: "#C75B39",
      background: "#FFFFFF",
      text: "#232F34",
    },
    fonts: {
      heading: "Oswald",
      body: "Open Sans",
    },
    previewImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    features: ["Silhuetas de montanhas", "Cores da natureza", "Layout panorâmico", "Estilo outdoor"],
  },

  // ═══════════════════════════════════════════
  // CASAIS ROMÂNTICOS CLÁSSICOS
  // ═══════════════════════════════════════════
  {
    id: "fairytale",
    name: "Conto de Fadas",
    description: "Para casais que sonham com um amor de princesa. Elegância, brilho e magia.",
    category: "romanticos",
    coupleStyle: "Sonhadores românticos",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#C9A861",
      secondary: "#FDF8F0",
      accent: "#E8B4B8",
      background: "#FFFDF9",
      text: "#3D3225",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Montserrat",
    },
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    features: ["Detalhes dourados", "Tipografia elegante", "Bordas ornamentadas", "Brilhos sutis"],
  },
  {
    id: "eternal",
    name: "Amor Eterno",
    description: "Clássico e atemporal. Para casais que valorizam tradição e elegância duradoura.",
    category: "romanticos",
    coupleStyle: "Tradicionalistas elegantes",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#1A1A2E",
      secondary: "#F5E6D3",
      accent: "#B8860B",
      background: "#FAF7F2",
      text: "#1A1A2E",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Crimson Text",
    },
    previewImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    features: ["Tipografia serifada", "Layout simétrico", "Cores atemporais", "Monograma do casal"],
  },
  {
    id: "roses",
    name: "Jardim de Rosas",
    description: "Delicado e feminino, com tons de rosa e elementos florais românticos.",
    category: "romanticos",
    coupleStyle: "Românticos apaixonados",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#C77B8B",
      secondary: "#FFF5F7",
      accent: "#6B5B4F",
      background: "#FFFBFC",
      text: "#4A3F44",
    },
    fonts: {
      heading: "Great Vibes",
      body: "Nunito",
    },
    previewImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    features: ["Elementos florais", "Tons rosé", "Fontes cursivas", "Animações suaves"],
  },

  // ═══════════════════════════════════════════
  // CASAIS MODERNOS & URBANOS
  // ═══════════════════════════════════════════
  {
    id: "metro",
    name: "Metrópole",
    description: "Design urbano e sofisticado para casais cosmopolitas que amam a vida na cidade.",
    category: "modernos",
    coupleStyle: "Urbanos sofisticados",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#000000",
      secondary: "#F5F5F5",
      accent: "#FF4444",
      background: "#FFFFFF",
      text: "#1A1A1A",
    },
    fonts: {
      heading: "Archivo Black",
      body: "Inter",
    },
    previewImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
    features: ["Layout em grid", "Tipografia bold", "Alto contraste", "Estilo editorial"],
  },
  {
    id: "neon",
    name: "Neon Nights",
    description: "Vibrante e ousado, para casais que amam a vida noturna e festas.",
    category: "modernos",
    coupleStyle: "Festeiros modernos",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#FF00FF",
      secondary: "#0A0A0F",
      accent: "#00FFFF",
      background: "#0D0D14",
      text: "#FFFFFF",
    },
    fonts: {
      heading: "Orbitron",
      body: "Rajdhani",
    },
    previewImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    features: ["Efeitos neon", "Tema escuro", "Animações vibrantes", "Estilo cyberpunk"],
  },
  {
    id: "architect",
    name: "Arquitetura",
    description: "Linhas limpas e geometria precisa. Para casais que apreciam design e arquitetura.",
    category: "modernos",
    coupleStyle: "Minimalistas contemporâneos",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#2C3E50",
      secondary: "#ECF0F1",
      accent: "#E67E22",
      background: "#FAFAFA",
      text: "#2C3E50",
    },
    fonts: {
      heading: "Poppins",
      body: "Work Sans",
    },
    previewImage: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80",
    features: ["Formas geométricas", "Espaço negativo", "Grid preciso", "Design funcional"],
  },

  // ═══════════════════════════════════════════
  // CASAIS ARTÍSTICOS & CRIATIVOS
  // ═══════════════════════════════════════════
  {
    id: "watercolor",
    name: "Aquarela",
    description: "Artístico e fluido, como uma pintura em aquarela. Para casais criativos e sensíveis.",
    category: "artisticos",
    coupleStyle: "Artistas e criativos",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#7B68EE",
      secondary: "#FFF8F0",
      accent: "#FF7F7F",
      background: "#FFFEFA",
      text: "#4A4A6A",
    },
    fonts: {
      heading: "Sacramento",
      body: "Karla",
    },
    previewImage: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    features: ["Efeitos aquarela", "Cores artísticas", "Bordas suaves", "Visual pintado"],
  },
  {
    id: "bohemian",
    name: "Boho Livre",
    description: "Espírito livre e eclético. Para casais que fogem do convencional.",
    category: "artisticos",
    coupleStyle: "Espíritos livres",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#CD853F",
      secondary: "#FFF5EB",
      accent: "#8B4513",
      background: "#FFFAF5",
      text: "#4A3728",
    },
    fonts: {
      heading: "Amatic SC",
      body: "Quicksand",
    },
    previewImage: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
    features: ["Padrões boho", "Mix de texturas", "Elementos étnicos", "Estilo handmade"],
  },
  {
    id: "gallery",
    name: "Galeria de Arte",
    description: "Elegante como um museu. Para casais que apreciam arte e cultura.",
    category: "artisticos",
    coupleStyle: "Apreciadores de arte",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#1A1A1A",
      secondary: "#FFFFFF",
      accent: "#C5A572",
      background: "#F8F8F8",
      text: "#1A1A1A",
    },
    fonts: {
      heading: "Bodoni Moda",
      body: "Libre Baskerville",
    },
    previewImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    features: ["Layout museu", "Foco nas fotos", "Tipografia clássica", "Espaço branco"],
  },

  // ═══════════════════════════════════════════
  // CASAIS DESCONTRAÍDOS & DIVERTIDOS
  // ═══════════════════════════════════════════
  {
    id: "fiesta",
    name: "Festa Total",
    description: "Alegre e colorido! Para casais que querem uma celebração animada e divertida.",
    category: "descontraidos",
    coupleStyle: "Alegres e festeiros",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#FF6B6B",
      secondary: "#FFF9E6",
      accent: "#4ECDC4",
      background: "#FFFBF5",
      text: "#2C3E50",
    },
    fonts: {
      heading: "Fredoka One",
      body: "Nunito Sans",
    },
    previewImage: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
    features: ["Cores vibrantes", "Ícones divertidos", "Layout dinâmico", "Confetes animados"],
  },
  {
    id: "casual",
    name: "Simplesmente Nós",
    description: "Descontraído e autêntico. Para casais que valorizam simplicidade e bom humor.",
    category: "descontraidos",
    coupleStyle: "Casais autênticos",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#5D8AA8",
      secondary: "#F5F5F5",
      accent: "#FFB347",
      background: "#FFFFFF",
      text: "#333333",
    },
    fonts: {
      heading: "Caveat",
      body: "Rubik",
    },
    previewImage: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&q=80",
    features: ["Estilo casual", "Fontes manuscritas", "Tom informal", "Fotos espontâneas"],
  },
  {
    id: "tropical",
    name: "Tropical Paradise",
    description: "Vibes de praia e verão eterno. Para casais que amam sol, mar e descontração.",
    category: "descontraidos",
    coupleStyle: "Amantes de praia",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#00B4D8",
      secondary: "#FFF8E7",
      accent: "#FF6B35",
      background: "#FFFDF8",
      text: "#1D3557",
    },
    fonts: {
      heading: "Pacifico",
      body: "Lato",
    },
    previewImage: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=800&q=80",
    features: ["Paleta tropical", "Elementos de praia", "Layout arejado", "Vibes de verão"],
  },

  // ═══════════════════════════════════════════
  // CASAIS GLAMOUROSOS & LUXUOSOS
  // ═══════════════════════════════════════════
  {
    id: "blacktie",
    name: "Black Tie",
    description: "Sofisticação máxima. Para casais que planejam uma festa de gala inesquecível.",
    category: "glamourosos",
    coupleStyle: "Elegantes refinados",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#D4AF37",
      secondary: "#0D0D0D",
      accent: "#FFFFFF",
      background: "#0A0A0A",
      text: "#F5F5F5",
    },
    fonts: {
      heading: "Cinzel Decorative",
      body: "Cormorant",
    },
    previewImage: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80",
    features: ["Ouro e preto", "Animações luxuosas", "Tipografia premium", "Brilhos dourados"],
  },
  {
    id: "champagne",
    name: "Champagne & Diamantes",
    description: "Brilho e sofisticação em tons champagne. Para casais que amam o luxo discreto.",
    category: "glamourosos",
    coupleStyle: "Luxo discreto",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#C9B037",
      secondary: "#1E1E28",
      accent: "#F7E7CE",
      background: "#16161D",
      text: "#EAEAEA",
    },
    fonts: {
      heading: "Didot",
      body: "Montserrat",
    },
    previewImage: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",
    features: ["Tons champagne", "Efeitos de brilho", "Layout sofisticado", "Detalhes premium"],
  },
  {
    id: "royalty",
    name: "Realeza",
    description: "Digno de um palácio. Para casais que querem se sentir como reis e rainhas.",
    category: "glamourosos",
    coupleStyle: "Amantes de realeza",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#4B0082",
      secondary: "#F8F4FF",
      accent: "#FFD700",
      background: "#FDFBFF",
      text: "#2D1B4E",
    },
    fonts: {
      heading: "Marcellus",
      body: "EB Garamond",
    },
    previewImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    features: ["Roxo real", "Detalhes em ouro", "Ornamentos clássicos", "Estilo palaciano"],
  },

  // ═══════════════════════════════════════════
  // CASAIS AMANTES DA NATUREZA
  // ═══════════════════════════════════════════
  {
    id: "forest",
    name: "Floresta Encantada",
    description: "Mágico e natural. Para casais que sonham com um casamento em meio à natureza.",
    category: "natureza",
    coupleStyle: "Conectados com a natureza",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#228B22",
      secondary: "#F0FFF0",
      accent: "#8B4513",
      background: "#FAFFF8",
      text: "#1B4332",
    },
    fonts: {
      heading: "Libre Baskerville",
      body: "Source Sans Pro",
    },
    previewImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    features: ["Tons verdes", "Elementos naturais", "Estilo orgânico", "Folhagens decorativas"],
  },
  {
    id: "garden",
    name: "Jardim Secreto",
    description: "Romântico e bucólico, inspirado em jardins ingleses e flores silvestres.",
    category: "natureza",
    coupleStyle: "Românticos campestres",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#6B8E23",
      secondary: "#FFF8F5",
      accent: "#E6B8A2",
      background: "#FFFEFA",
      text: "#3D4A38",
    },
    fonts: {
      heading: "Tangerine",
      body: "Open Sans",
    },
    previewImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    features: ["Flores silvestres", "Bordas florais", "Paleta pastel", "Estilo cottage"],
  },
  {
    id: "rustic",
    name: "Fazenda & Campo",
    description: "Rústico e acolhedor. Para casais que amam a simplicidade da vida no campo.",
    category: "natureza",
    coupleStyle: "Amantes do campo",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#8B6914",
      secondary: "#FBF8F1",
      accent: "#A0522D",
      background: "#FDFCF9",
      text: "#3E3428",
    },
    fonts: {
      heading: "Abril Fatface",
      body: "Josefin Sans",
    },
    previewImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    features: ["Texturas naturais", "Madeira e palha", "Estilo country", "Tom acolhedor"],
  },

  // ═══════════════════════════════════════════
  // CASAIS VINTAGE & RETRÔ
  // ═══════════════════════════════════════════
  {
    id: "vintage50",
    name: "Anos 50",
    description: "Charme retrô dos anos dourados. Para casais que amam a estética vintage americana.",
    category: "vintage",
    coupleStyle: "Nostálgicos clássicos",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#DC143C",
      secondary: "#FFF8F0",
      accent: "#008B8B",
      background: "#FFFBF5",
      text: "#2F2F2F",
    },
    fonts: {
      heading: "Lobster",
      body: "Lora",
    },
    previewImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    features: ["Estética retrô", "Cores vibrantes", "Tipografia vintage", "Elementos pin-up"],
  },
  {
    id: "artdeco",
    name: "Art Déco",
    description: "Glamour dos anos 20. Para casais que amam o estilo Gatsby e a era do jazz.",
    category: "vintage",
    coupleStyle: "Amantes do glamour antigo",
    isPremium: true,
    layout: "classico",
    colors: {
      primary: "#C9A227",
      secondary: "#1A1A2E",
      accent: "#EAEAEA",
      background: "#12121A",
      text: "#F5F5F5",
    },
    fonts: {
      heading: "Poiret One",
      body: "Raleway",
    },
    previewImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    features: ["Padrões geométricos", "Ouro e preto", "Estilo Gatsby", "Linhas art déco"],
  },
  {
    id: "polaroid",
    name: "Memórias Polaroid",
    description: "Nostálgico e íntimo, como um álbum de fotos antigas. Para casais sentimentais.",
    category: "vintage",
    coupleStyle: "Colecionadores de memórias",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#704214",
      secondary: "#FFF8E7",
      accent: "#C19A6B",
      background: "#FFFDF5",
      text: "#4A3C2A",
    },
    fonts: {
      heading: "Satisfy",
      body: "Merriweather",
    },
    previewImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
    features: ["Efeito polaroid", "Tons sépia", "Molduras de foto", "Estilo álbum"],
  },

  // ═══════════════════════════════════════════
  // NOVOS — com layouts alternativos
  // ═══════════════════════════════════════════
  {
    id: "cartorio",
    name: "Só no Civil",
    description: "Para quem quer algo enxuto e elegante. Um site direto ao ponto, sem firulas, perfeito para casamento no cartório.",
    category: "modernos",
    coupleStyle: "Práticos e discretos",
    isPremium: false,
    layout: "minimalista",
    colors: {
      primary: "#3F3F46",
      secondary: "#FAFAFA",
      accent: "#A1A1AA",
      background: "#FFFFFF",
      text: "#18181B",
    },
    fonts: { heading: "Work Sans", body: "Inter" },
    previewImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    features: ["Layout minimalista", "Uma coluna", "Tipografia discreta", "Carrega rápido"],
  },
  {
    id: "pride",
    name: "Amor é Amor",
    description: "Cores vivas e um layout ousado para celebrar todo tipo de amor, do jeito mais colorido possível.",
    category: "descontraidos",
    coupleStyle: "Orgulhosos e sem medo de cor",
    isPremium: false,
    layout: "moderno",
    colors: {
      primary: "#E4007C",
      secondary: "#FFF0F6",
      accent: "#00B4D8",
      background: "#FFFFFF",
      text: "#1A1A2E",
    },
    fonts: { heading: "Poppins", body: "Poppins" },
    previewImage: "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=800&q=80",
    features: ["Layout moderno", "Títulos em caixa alta", "Blocos de cor", "Cantos arredondados"],
  },
  {
    id: "tropical",
    name: "Pé na Areia",
    description: "Turquesa, coral e areia. Layout editorial com fotos grandes para casamentos na praia ou destino tropical.",
    category: "natureza",
    coupleStyle: "Casamento na praia",
    isPremium: false,
    layout: "editorial",
    colors: {
      primary: "#0E7C86",
      secondary: "#EAF7F6",
      accent: "#FF8C61",
      background: "#FDFCF7",
      text: "#173A3A",
    },
    fonts: { heading: "Playfair Display", body: "Raleway" },
    previewImage: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
    features: ["Layout editorial", "Fotos em destaque", "Paleta praiana", "Títulos grandes"],
  },
  {
    id: "industrial",
    name: "Loft Urbano",
    description: "Concreto, cobre e tipografia forte. Para casamentos em galpão, rooftop ou espaço industrial.",
    category: "modernos",
    coupleStyle: "Urbanos e despojados",
    isPremium: false,
    layout: "moderno",
    colors: {
      primary: "#B87333",
      secondary: "#F0EEEC",
      accent: "#4B4B4B",
      background: "#FAFAF9",
      text: "#1C1C1C",
    },
    fonts: { heading: "Oswald", body: "Barlow" },
    previewImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    features: ["Layout moderno", "Tipografia condensada", "Tons de metal", "Visual de galpão"],
  },
  {
    id: "boho-campo",
    name: "Boho de Campo",
    description: "Terracota, verde-oliva e linho. Clima de casamento ao ar livre, com pampas e luz dourada.",
    category: "natureza",
    coupleStyle: "Ao ar livre, descalços",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#C1662F",
      secondary: "#F3EEE4",
      accent: "#7C8C5A",
      background: "#FBF8F1",
      text: "#3B2F26",
    },
    fonts: { heading: "Cormorant Garamond", body: "Nunito Sans" },
    previewImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    features: ["Paleta terrosa", "Clima ao ar livre", "Tons de linho", "Romântico e leve"],
  },
  {
    id: "black-tie",
    name: "Gala Black Tie",
    description: "Preto, dourado e marfim, com layout editorial. Para recepções formais e festas de gala.",
    category: "glamourosos",
    coupleStyle: "Formais e sofisticados",
    isPremium: true,
    layout: "editorial",
    colors: {
      primary: "#C9A227",
      secondary: "#F4F1EA",
      accent: "#1A1A1A",
      background: "#FFFEFB",
      text: "#141414",
    },
    fonts: { heading: "Playfair Display", body: "Montserrat" },
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    features: ["Layout editorial", "Preto e dourado", "Títulos imponentes", "Ar de gala"],
  },
  {
    id: "fe-classica",
    name: "Bênção",
    description: "Azul profundo e dourado, tipografia serifada tradicional. Pensado para cerimônias religiosas.",
    category: "romanticos",
    coupleStyle: "Cerimônia na igreja",
    isPremium: false,
    layout: "classico",
    colors: {
      primary: "#B8912F",
      secondary: "#EEF1F6",
      accent: "#22335C",
      background: "#FDFCF9",
      text: "#1E2A44",
    },
    fonts: { heading: "EB Garamond", body: "Lora" },
    previewImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    features: ["Tipografia tradicional", "Azul e dourado", "Espaço para leitura", "Sóbrio e afetuoso"],
  },
  {
    id: "jardim-secreto",
    name: "Jardim Secreto",
    description: "Rosa empoeirado e musgo, com layout editorial e muitas fotos. Romântico sem ser açucarado.",
    category: "romanticos",
    coupleStyle: "Românticos contemporâneos",
    isPremium: false,
    layout: "editorial",
    colors: {
      primary: "#A56A7A",
      secondary: "#F3ECEF",
      accent: "#6B7F5B",
      background: "#FCFAF8",
      text: "#3A2E33",
    },
    fonts: { heading: "Libre Baskerville", body: "Raleway" },
    previewImage: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80",
    features: ["Layout editorial", "Rosa e verde", "Fotos grandes", "Romance moderno"],
  },
  {
    id: "retro-70",
    name: "Setentão",
    description: "Mostarda, laranja queimado e tipografia gigante. Um throwback aos anos 70, cheio de personalidade.",
    category: "vintage",
    coupleStyle: "Nostálgicos e divertidos",
    isPremium: false,
    layout: "moderno",
    colors: {
      primary: "#D98324",
      secondary: "#F6EEDD",
      accent: "#7A4419",
      background: "#FBF6EC",
      text: "#3A2A17",
    },
    fonts: { heading: "Bebas Neue", body: "Poppins" },
    previewImage: "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=800&q=80",
    features: ["Layout moderno", "Cores dos anos 70", "Títulos enormes", "Muito estilo"],
  },
  {
    id: "so-branco",
    name: "Tudo Branco",
    description: "Branco sobre branco, com um fio de prata. Minimalismo de luxo para quem quer sofisticação silenciosa.",
    category: "glamourosos",
    coupleStyle: "Minimalistas exigentes",
    isPremium: true,
    layout: "minimalista",
    colors: {
      primary: "#8C8C8C",
      secondary: "#F7F7F7",
      accent: "#C0C0C0",
      background: "#FFFFFF",
      text: "#2B2B2B",
    },
    fonts: { heading: "Cormorant Garamond", body: "Montserrat" },
    previewImage: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80",
    features: ["Layout minimalista", "Branco sobre branco", "Muito espaço", "Luxo silencioso"],
  },
];

export const categories = [
  { id: "all", name: "Todos os Estilos", icon: "✨" },
  { id: "aventureiros", name: "Aventureiros", icon: "🏔️", description: "Para casais exploradores" },
  { id: "romanticos", name: "Românticos", icon: "💕", description: "Amor clássico e eterno" },
  { id: "modernos", name: "Modernos", icon: "🌆", description: "Urbanos e contemporâneos" },
  { id: "artisticos", name: "Artísticos", icon: "🎨", description: "Criativos e únicos" },
  { id: "descontraidos", name: "Descontraídos", icon: "🎉", description: "Leves e divertidos" },
  { id: "glamourosos", name: "Glamourosos", icon: "👑", description: "Luxo e sofisticação" },
  { id: "natureza", name: "Natureza", icon: "🌿", description: "Conectados com a terra" },
  { id: "vintage", name: "Vintage", icon: "📷", description: "Charme retrô e nostálgico" },
];
