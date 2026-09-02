export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  quota?: number; // For gifts that can be split into quotas
}

export interface GiftCategory {
  id: string;
  name: string;
  icon: string;
}

export const categories: GiftCategory[] = [
  { id: "all", name: "Todos", icon: "Gift" },
  { id: "cozinha", name: "Cozinha", icon: "ChefHat" },
  { id: "quarto", name: "Quarto", icon: "Bed" },
  { id: "sala", name: "Sala", icon: "Sofa" },
  { id: "banheiro", name: "Banheiro", icon: "Bath" },
  { id: "eletronicos", name: "Eletrônicos", icon: "Tv" },
  { id: "experiencias", name: "Experiências", icon: "Plane" },
  { id: "dinheiro", name: "Contribuição", icon: "Wallet" },
];

export const gifts: Gift[] = [
  // Cozinha
  {
    id: "1",
    name: "Jogo de Panelas Tramontina",
    description: "Jogo com 10 peças antiaderente, perfeito para o dia a dia do casal.",
    price: 899,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    category: "cozinha",
    isPopular: true,
  },
  {
    id: "2",
    name: "Mixer Philips Walita",
    description: "Mixer de mão com 5 velocidades e acessórios para várias preparações.",
    price: 299,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop",
    category: "cozinha",
  },
  {
    id: "3",
    name: "Jogo de Talheres 42 Peças",
    description: "Talheres em aço inox com design clássico para ocasiões especiais.",
    price: 449,
    image: "https://images.unsplash.com/photo-1530538095376-a4936b35b5f0?w=400&h=400&fit=crop",
    category: "cozinha",
  },
  {
    id: "4",
    name: "Cafeteira Elétrica Nespresso",
    description: "Cafeteira de cápsulas com sistema de pressão para café perfeito.",
    price: 699,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop",
    category: "cozinha",
    isPopular: true,
  },
  {
    id: "5",
    name: "Aparelho de Jantar 30 Peças",
    description: "Porcelana branca com acabamento sofisticado para receber convidados.",
    price: 599,
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop",
    category: "cozinha",
  },
  // Quarto
  {
    id: "6",
    name: "Jogo de Cama King 400 Fios",
    description: "Conjunto completo em algodão egípcio com acabamento premium.",
    price: 799,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop",
    category: "quarto",
    isPopular: true,
  },
  {
    id: "7",
    name: "Edredom Plumas de Ganso",
    description: "Edredom leve e quentinho com preenchimento natural.",
    price: 1299,
    image: "https://images.unsplash.com/photo-1631049035182-249067d7618e?w=400&h=400&fit=crop",
    category: "quarto",
  },
  {
    id: "8",
    name: "Travesseiros Ortopédicos (Par)",
    description: "Travesseiros com espuma viscoelástica para noites tranquilas.",
    price: 399,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
    category: "quarto",
  },
  // Sala
  {
    id: "9",
    name: "Luminária de Piso Design",
    description: "Luminária moderna que adiciona elegância a qualquer ambiente.",
    price: 549,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
    category: "sala",
  },
  {
    id: "10",
    name: "Tapete Persa 2x3m",
    description: "Tapete artesanal com padrões clássicos e cores sofisticadas.",
    price: 1899,
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop",
    category: "sala",
  },
  {
    id: "11",
    name: "Conjunto de Almofadas Decorativas",
    description: "Kit com 4 almofadas em veludo com cores neutras.",
    price: 299,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
    category: "sala",
  },
  // Banheiro
  {
    id: "12",
    name: "Jogo de Toalhas Egípcias",
    description: "Conjunto luxuoso com 6 peças em algodão 500g/m².",
    price: 349,
    image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400&h=400&fit=crop",
    category: "banheiro",
  },
  {
    id: "13",
    name: "Roupão de Banho Premium",
    description: "Par de roupões felpudos para momentos de conforto.",
    price: 449,
    image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=400&fit=crop",
    category: "banheiro",
  },
  // Eletrônicos
  {
    id: "14",
    name: "Smart TV 55\" 4K",
    description: "Televisão com tecnologia OLED e sistema operacional inteligente.",
    price: 3499,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    category: "eletronicos",
    isPopular: true,
    quota: 10,
  },
  {
    id: "15",
    name: "Robô Aspirador Inteligente",
    description: "Aspirador autônomo com mapeamento e controle por app.",
    price: 1899,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    category: "eletronicos",
  },
  {
    id: "16",
    name: "Air Fryer 5L Digital",
    description: "Fritadeira elétrica para refeições mais saudáveis.",
    price: 599,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop",
    category: "eletronicos",
    isPopular: true,
  },
  // Experiências
  {
    id: "17",
    name: "Lua de Mel - 1 Diária",
    description: "Contribua com uma diária da lua de mel dos noivos.",
    price: 500,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=400&fit=crop",
    category: "experiencias",
    isPopular: true,
    quota: 14,
  },
  {
    id: "18",
    name: "Jantar Romântico",
    description: "Jantar especial em restaurante premium para o casal.",
    price: 450,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
    category: "experiencias",
  },
  {
    id: "19",
    name: "Day Spa Casal",
    description: "Dia de relaxamento com massagem e tratamentos especiais.",
    price: 699,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop",
    category: "experiencias",
  },
  // Contribuição em dinheiro
  {
    id: "20",
    name: "Presente em Dinheiro",
    description: "Contribua com qualquer valor para ajudar o casal.",
    price: 100,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop",
    category: "dinheiro",
  },
  {
    id: "21",
    name: "Ajuda para Casa Nova",
    description: "Contribuição para mobiliar a casa dos noivos.",
    price: 200,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop",
    category: "dinheiro",
    quota: 50,
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};
