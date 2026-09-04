import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { templates } from "@/data/templates";
import {
  WeddingProvider,
  type WeddingData,
  type StoryItem,
  type DemoContent,
} from "@/react-app/contexts/WeddingContext";
import CoupleShell from "@/react-app/components/couple-dynamic/CoupleShell";

const IMG = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&fit=crop`;

const DEMO_STORY: StoryItem[] = [
  { id: 1, title: "Como nos conhecemos", description: "Foi num café de esquina numa tarde de chuva. Ela pediu o último pão de queijo; ele ofereceu metade.", story_date: "2019-05-12", image_url: IMG("1522673607200-164d1b6ce486"), sort_order: 1 },
  { id: 2, title: "O primeiro 'sim'", description: "Seis meses depois, já falávamos de morar juntos. O primeiro apartamento tinha goteira, mas tinha nós dois.", story_date: "2020-11-03", image_url: IMG("1519741497674-611481863552"), sort_order: 2 },
  { id: 3, title: "O pedido", description: "No mesmo café, mesma mesa, mesma chuva. Dessa vez o pão de queijo veio com um anel do lado.", story_date: "2024-05-12", image_url: IMG("1511285560929-80b456fea0bc"), sort_order: 3 },
];

const DEMO: DemoContent = {
  gifts: [
    { id: 1, name: "Jogo de panelas", description: "Para as primeiras (e muitas) jantas em casa.", price: 480, image_url: IMG("1584990347449-a2d4c2c7a1e5"), is_reserved: false },
    { id: 2, name: "Lua de mel em Fernando de Noronha", description: "Ajude a pagar uma diária do sonho.", price: 900, image_url: IMG("1507525428034-b723cf961d3e"), is_reserved: false },
    { id: 3, name: "Adega para dois", description: "Porque toda comemoração merece um brinde.", price: 350, image_url: IMG("1510812431401-41d2bd2722f3"), is_reserved: true },
  ],
  messages: [
    { id: 1, author_name: "Tia Marta", content: "Que a vida de vocês seja tão doce quanto esse dia. Amo demais!", created_at: "2025-01-10T12:00:00Z" },
    { id: 2, author_name: "Rafael e Bia", content: "Contando os dias! Vai ser lindo.", created_at: "2025-01-12T15:30:00Z" },
    { id: 3, author_name: "Vó Cida", content: "Meus dois netos do coração se casando. Deus abençoe.", created_at: "2025-01-15T09:00:00Z" },
  ],
  parents: [
    { id: 1, name: "Carlos e Regina", role: "pai_noivo", image_url: IMG("1518895949257-7621c3c786d7") },
    { id: 2, name: "Antônio e Lúcia", role: "pai_noiva", image_url: IMG("1500648767791-00dcc994a43e") },
  ],
  godparents: [
    { id: 1, name: "Fernanda Alves", role: "Madrinha", description: "Amiga desde a escola.", image_url: IMG("1544005313-94ddf0286df2") },
    { id: 2, name: "Bruno Costa", role: "Padrinho", description: "Irmão de coração do noivo.", image_url: IMG("1507003211169-0a1dd7228f2d") },
    { id: 3, name: "Juliana Reis", role: "Madrinha", description: "Prima e confidente da noiva.", image_url: IMG("1502823403499-6ccfcf4fb453") },
    { id: 4, name: "Diego Martins", role: "Padrinho", description: "Companheiro de mil viagens.", image_url: IMG("1506794778202-cad84cf45f1d") },
  ],
  accommodations: [
    { id: 1, name: "Hotel Villa Bosque", description: "A 5 min do local da cerimônia. Bloqueio de quartos com desconto para convidados.", address: "Rua das Acácias, 120", phone: "(11) 4000-0000", website: "https://exemplo.com", price_range: "R$ 320–480 / noite", image_url: IMG("1566073771259-6a8506099945"), sort_order: 1 },
    { id: 2, name: "Pousada Recanto", description: "Opção charmosa e mais econômica, a 15 min de carro.", address: "Estrada do Vale, km 3", phone: "(11) 4000-1111", website: "https://exemplo.com", price_range: "R$ 180–260 / noite", image_url: IMG("1445019980597-93fa8acb246c"), sort_order: 2 },
  ],
  guestPhotos: [],
};

const DEMO_TIMELINE = JSON.stringify([
  { time: "16:00", title: "Cerimônia", description: "Recepção dos convidados e celebração." },
  { time: "17:30", title: "Coquetel", description: "Drinks e canapés no jardim." },
  { time: "19:00", title: "Jantar", description: "Servido à mesa, com opções vegetarianas." },
  { time: "21:00", title: "Festa", description: "Pista aberta até o último convidado." },
]);

export default function TemplateDemo() {
  const { templateId } = useParams<{ templateId: string }>();
  const template = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0],
    [templateId],
  );

  useEffect(() => {
    document.title = `${template.name} — Demo | Eternize`;
  }, [template]);

  const wedding = useMemo<WeddingData>(
    () => ({
      id: 0,
      partner1_name: "Ana",
      partner2_name: "João",
      wedding_date: new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      venue_name: "Espaço Jardim das Oliveiras",
      venue_address: "Rua das Acácias, 100 — São Paulo, SP",
      custom_url: null,
      pix_key: "ana.joao@exemplo.com",
      template_id: template.id,
      theme_layout: template.layout,
      theme_primary_color: template.colors.primary,
      theme_secondary_color: template.colors.secondary,
      theme_accent_color: template.colors.accent,
      theme_background_color: template.colors.background,
      theme_text_color: template.colors.text,
      theme_heading_font: template.fonts.heading,
      theme_body_font: template.fonts.body,
      show_story: 1, show_gallery: 1, show_timeline: 1, show_location: 1,
      show_dresscode: 1, show_gifts: 1, show_rsvp: 1, show_messages: 1,
      show_godparents: 1, show_parents: 1, show_accommodations: 1,
      our_story: "Duas pessoas comuns que encontraram no outro o lugar mais bonito para voltar todos os dias.",
      ceremony_time: "16:00", reception_time: "19:00",
      dress_code: "esporte-fino",
      timeline_events: DEMO_TIMELINE,
      music_url: null,
    }),
    [template],
  );

  return (
    <div className="min-h-screen">
      {/* Demo ribbon */}
      <div
        className="fixed top-0 inset-x-0 z-[100] flex items-center justify-between gap-3 px-4 py-2 text-sm text-white"
        style={{ backgroundColor: template.colors.primary }}
      >
        <Link to="/templates" className="inline-flex items-center gap-1.5 font-medium hover:opacity-90">
          <ArrowLeft className="w-4 h-4" /> Templates
        </Link>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Demonstração do template <strong>{template.name}</strong>
        </span>
        <Link to="/cadastro" className="rounded-full bg-white/20 px-3 py-1 font-medium hover:bg-white/30">
          Usar este
        </Link>
      </div>

      <div className="pt-10">
        <WeddingProvider wedding={wedding} photos={[]} storyItems={DEMO_STORY} demo={DEMO}>
          <CoupleShell />
        </WeddingProvider>
      </div>
    </div>
  );
}
