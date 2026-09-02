export interface WeddingTemplate {
  id: string;
  name: string;
  description: string;
  category: "aventureiros" | "romanticos" | "modernos" | "artisticos" | "descontraidos" | "glamourosos" | "natureza" | "vintage";
  coupleStyle: string;
  isPremium: boolean;
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
