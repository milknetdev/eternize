// Predefined gift templates for wedding couples

export interface GiftTemplate {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
}

// Classic wedding gift items (traditional)
export const CLASSIC_GIFTS: GiftTemplate[] = [
  // Cozinha
  { name: "Jogo de Panelas Antiaderente", description: "Conjunto completo com 7 peças para preparar deliciosas refeições", price: 450, category: "Cozinha" },
  { name: "Conjunto de Talheres 42 Peças", description: "Talheres em aço inox de alta qualidade para 6 pessoas", price: 280, category: "Cozinha" },
  { name: "Jogo de Pratos 30 Peças", description: "Aparelho de jantar em porcelana branca elegante", price: 320, category: "Cozinha" },
  { name: "Jogo de Copos 24 Peças", description: "Copos para água, suco e taças para vinho", price: 180, category: "Cozinha" },
  { name: "Batedeira Planetária", description: "Potente e versátil para todas as receitas", price: 650, category: "Cozinha" },
  { name: "Liquidificador Profissional", description: "Alta potência para sucos, vitaminas e sopas", price: 350, category: "Cozinha" },
  { name: "Cafeteira Expresso", description: "Para os amantes de café de qualidade", price: 480, category: "Cozinha" },
  { name: "Air Fryer", description: "Fritadeira elétrica sem óleo para refeições saudáveis", price: 420, category: "Cozinha" },
  { name: "Processador de Alimentos", description: "Multiprocessador com várias funções", price: 380, category: "Cozinha" },
  { name: "Conjunto de Potes Herméticos", description: "Organização perfeita para a despensa", price: 150, category: "Cozinha" },
  { name: "Jogo de Facas Profissionais", description: "Kit com 6 facas e cepo de madeira", price: 290, category: "Cozinha" },
  { name: "Panela de Pressão Elétrica", description: "Cozinha rápida e segura", price: 380, category: "Cozinha" },
  
  // Quarto
  { name: "Jogo de Cama Queen", description: "Lençóis 400 fios em algodão egípcio", price: 450, category: "Quarto" },
  { name: "Edredom King Size", description: "Edredom macio e quentinho para noites aconchegantes", price: 380, category: "Quarto" },
  { name: "Kit de Travesseiros", description: "4 travesseiros de pluma sintética premium", price: 320, category: "Quarto" },
  { name: "Colcha Boutis", description: "Colcha bordada elegante para decoração", price: 280, category: "Quarto" },
  { name: "Luminária de Cabeceira", description: "Par de abajures modernos com LED", price: 240, category: "Quarto" },
  
  // Banheiro
  { name: "Jogo de Toalhas 10 Peças", description: "Toalhas macias em algodão premium", price: 280, category: "Banheiro" },
  { name: "Roupão de Banho Casal", description: "Par de roupões felpudos e aconchegantes", price: 320, category: "Banheiro" },
  { name: "Organizador de Banheiro", description: "Kit completo para organização", price: 180, category: "Banheiro" },
  
  // Sala
  { name: "Aparelho de Jantar Completo", description: "Serviço de jantar para 12 pessoas", price: 580, category: "Sala" },
  { name: "Jogo de Sofá", description: "Almofadas decorativas para sala de estar", price: 350, category: "Sala" },
  { name: "Tapete Decorativo", description: "Tapete premium para sala de estar", price: 420, category: "Sala" },
  { name: "Cortinas Blackout", description: "Par de cortinas com isolamento térmico", price: 280, category: "Sala" },
  
  // Eletrônicos
  { name: "Smart TV 50\"", description: "Televisão LED 4K com sistema inteligente", price: 2500, category: "Eletrônicos" },
  { name: "Aspirador Robô", description: "Limpeza automática inteligente", price: 1200, category: "Eletrônicos" },
  { name: "Purificador de Água", description: "Água pura e gelada para toda família", price: 850, category: "Eletrônicos" },
  { name: "Ventilador de Torre", description: "Climatização silenciosa e eficiente", price: 380, category: "Eletrônicos" },
  
  // Experiências
  { name: "Jantar Romântico", description: "Noite especial em restaurante premium", price: 500, category: "Experiências" },
  { name: "Spa Day Casal", description: "Dia de relaxamento e massagens", price: 600, category: "Experiências" },
  { name: "Diária em Hotel", description: "Uma noite em hotel 5 estrelas", price: 800, category: "Experiências" },
  { name: "Passeio de Barco", description: "Passeio romântico ao pôr do sol", price: 450, category: "Experiências" },
];

// Fun/Creative gift items (humorous names)
export const FUN_GIFTS: GiftTemplate[] = [
  // Relacionamento
  { name: "Fundo de Discussão", description: "Para quando precisarem resolver 'divergências criativas' com uma pizza", price: 50, category: "Relacionamento" },
  { name: "Kit Netflix & Chill", description: "Pipoca, cobertor e assinatura do streaming favorito", price: 150, category: "Relacionamento" },
  { name: "Caixinha do Perdão", description: "Chocolates de emergência para pedir desculpas", price: 80, category: "Relacionamento" },
  { name: "Reserva de TPM", description: "Sorvete, chocolate e paciência infinita", price: 100, category: "Relacionamento" },
  { name: "Seguro Anti-Sogra", description: "Fundo para visitas inesperadas (inclui terapia)", price: 200, category: "Relacionamento" },
  { name: "Fundo 'Você Tinha Razão'", description: "Para admitir derrota com estilo", price: 75, category: "Relacionamento" },
  
  // Sobrevivência Doméstica
  { name: "Manual de Sobrevivência a Dois", description: "Livro + vinhos para ler juntos", price: 120, category: "Sobrevivência" },
  { name: "Kit Primeira Briga", description: "Flores, bombons e um pedido de desculpas pré-escrito", price: 90, category: "Sobrevivência" },
  { name: "Detector de Meias no Chão", description: "Também conhecido como 'próxima discussão'", price: 60, category: "Sobrevivência" },
  { name: "Fundo de Comida por Delivery", description: "Para quando ninguém quiser cozinhar", price: 200, category: "Sobrevivência" },
  { name: "Alarme de Assento Levantado", description: "Tecnologia de ponta para harmonia conjugal", price: 40, category: "Sobrevivência" },
  { name: "Kit Ressaca de Domingo", description: "Aspirina, café forte e silêncio", price: 85, category: "Sobrevivência" },
  
  // Finanças
  { name: "Pé de Meia do Casamento", description: "Começar a vida de casados com o pé direito (e dinheiro)", price: 500, category: "Finanças" },
  { name: "Fundo Imobiliário do Amor", description: "Para comprar o ninho de vocês", price: 1000, category: "Finanças" },
  { name: "Reserva de Emergência", description: "Ou 'Fundo para Compras no Shopping'", price: 300, category: "Finanças" },
  { name: "Investimento na Lua de Mel", description: "Porque vocês merecem!", price: 800, category: "Finanças" },
  { name: "Fundo do Primeiro Móvel", description: "Aquele sofá que cabe no orçamento", price: 600, category: "Finanças" },
  
  // Diversão
  { name: "Assinatura de Streaming", description: "Para maratonar séries de pijama", price: 180, category: "Diversão" },
  { name: "Kit Jogo de Tabuleiro", description: "Para descobrir quem é mais competitivo", price: 150, category: "Diversão" },
  { name: "Fundo de Cinema", description: "Pipoca, refrigerante e ingresso premium", price: 120, category: "Diversão" },
  { name: "Kit Churrasco de Domingo", description: "Carne, carvão e cerveja inclusa", price: 250, category: "Diversão" },
  { name: "Dia de Videogame", description: "Para reviver a infância juntos", price: 180, category: "Diversão" },
  
  // Pet Friendly
  { name: "Fundo Pro Primeiro Pet", description: "Preparação para o novo membro da família", price: 400, category: "Pets" },
  { name: "Kit Adoção Responsável", description: "Ração, vacinas e muito amor", price: 350, category: "Pets" },
  
  // Futuro
  { name: "Fundo Fraldas & Mamadeiras", description: "Para quando o amor multiplicar", price: 500, category: "Futuro" },
  { name: "Reserva do Primeiro Carro", description: "Para passear de mãos dadas... no volante", price: 1500, category: "Futuro" },
  { name: "Fundo de Viagem dos Sonhos", description: "Aquela viagem que vocês sempre quiseram", price: 2000, category: "Futuro" },
  { name: "Plano B (literalmente)", description: "Quando a aventura chamar, vocês estarão prontos", price: 600, category: "Futuro" },
];

// Gift categories with colors
export const GIFT_CATEGORIES = {
  classic: [
    { id: "Cozinha", label: "Cozinha", color: "bg-orange-100 text-orange-700" },
    { id: "Quarto", label: "Quarto", color: "bg-purple-100 text-purple-700" },
    { id: "Banheiro", label: "Banheiro", color: "bg-cyan-100 text-cyan-700" },
    { id: "Sala", label: "Sala", color: "bg-amber-100 text-amber-700" },
    { id: "Eletrônicos", label: "Eletrônicos", color: "bg-blue-100 text-blue-700" },
    { id: "Experiências", label: "Experiências", color: "bg-pink-100 text-pink-700" },
  ],
  fun: [
    { id: "Relacionamento", label: "Relacionamento", color: "bg-red-100 text-red-700" },
    { id: "Sobrevivência", label: "Sobrevivência", color: "bg-yellow-100 text-yellow-700" },
    { id: "Finanças", label: "Finanças", color: "bg-green-100 text-green-700" },
    { id: "Diversão", label: "Diversão", color: "bg-indigo-100 text-indigo-700" },
    { id: "Pets", label: "Pets", color: "bg-amber-100 text-amber-700" },
    { id: "Futuro", label: "Futuro", color: "bg-teal-100 text-teal-700" },
  ],
};
