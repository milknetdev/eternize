// Shared types for the dashboard shell and its tab components.
export type Tab = "overview" | "guests" | "tables" | "tasks" | "budget" | "gifts" | "site" | "photos" | "story" | "guest-photos" | "messages" | "financeiro" | "gravata" | "invite" | "godparents" | "parents" | "accommodations" | "settings";

export interface Companion {
  id?: number;
  name: string;
  is_confirmed: number;
  is_child?: number;
  dietary_restrictions?: string | null;
}

export interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  rsvp_status: string;
  guests_count: number;
  dietary_restrictions: string;
  label: string | null;
  is_child?: number;
  confirmation_code: string | null;
  is_confirmed: number;
  confirmed_at: string | null;
  message: string | null;
  companions: Companion[];
}

export const GUEST_LABELS = [
  { value: "padrinho", label: "Padrinho/Madrinha", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "familia_noivo", label: "Família do Noivo", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "familia_noiva", label: "Família da Noiva", color: "bg-pink-100 text-pink-800 border-pink-300" },
  { value: "amigos", label: "Amigos", color: "bg-green-100 text-green-800 border-green-300" },
] as const;

export interface GiftItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: number;
  quota_total: number;
  quota_purchased: number;
}

export interface GuestMessage {
  id: number;
  guest_name: string;
  message: string;
  is_approved: number;
  created_at: string;
}

export interface Photo {
  id: number;
  filename: string;
  storage_key: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Wedding {
  id: number;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  custom_url: string;
  pix_key: string;
  is_published: number;
  invitation_message: string | null;
}

export interface Stats {
  totalGuests: number;
  confirmedGuests: number;
  totalGifts: number;
  totalMessages: number;
  totalAmount: number;
}
