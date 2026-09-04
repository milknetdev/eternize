import { createContext, useContext, ReactNode } from "react";

export interface WeddingTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  headingFont: string;
  bodyFont: string;
}

export interface WeddingPhoto {
  id: number;
  filename: string;
  storage_key: string;
  caption: string | null;
  sort_order: number;
}

export interface StoryItem {
  id: number;
  title: string;
  description: string | null;
  story_date: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface WeddingData {
  id: number;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  custom_url: string | null;
  pix_key: string | null;
  template_id: string | null;
  // Theme colors
  theme_primary_color: string | null;
  theme_secondary_color: string | null;
  theme_accent_color: string | null;
  theme_background_color: string | null;
  theme_text_color: string | null;
  theme_heading_font: string | null;
  theme_body_font: string | null;
  // Section visibility
  show_story?: number;
  show_gallery?: number;
  show_timeline?: number;
  show_location?: number;
  show_dresscode?: number;
  show_gifts?: number;
  show_rsvp?: number;
  show_messages?: number;
  show_godparents?: number;
  show_parents?: number;
  show_accommodations?: number;
  // Content
  hero_image_key?: string | null;
  hero_style?: string | null;
  our_story?: string | null;
  ceremony_time?: string | null;
  ceremony_venue?: string | null;
  reception_time?: string | null;
  reception_venue?: string | null;
  dress_code?: string | null;
  dress_code_description?: string | null;
  dress_code_allowed_colors?: string | null;
  dress_code_avoid_colors?: string | null;
  timeline_events?: string | null;
  instagram_url?: string | null;
  music_url?: string | null;
}

interface WeddingContextType {
  wedding: WeddingData;
  theme: WeddingTheme;
  photos: WeddingPhoto[];
  storyItems: StoryItem[];
}

const defaultTheme: WeddingTheme = {
  primary: "#C9A962",
  secondary: "#F5F0E8",
  accent: "#E8D5B7",
  background: "#FFFBF5",
  text: "#1A1A1A",
  headingFont: "Cormorant Garamond",
  bodyFont: "Montserrat",
};

const WeddingContext = createContext<WeddingContextType | null>(null);

export function WeddingProvider({
  wedding,
  photos = [],
  storyItems = [],
  children,
}: {
  wedding: WeddingData;
  photos?: WeddingPhoto[];
  storyItems?: StoryItem[];
  children: ReactNode;
}) {
  const theme: WeddingTheme = {
    primary: wedding.theme_primary_color || defaultTheme.primary,
    secondary: wedding.theme_secondary_color || defaultTheme.secondary,
    accent: wedding.theme_accent_color || defaultTheme.accent,
    background: wedding.theme_background_color || defaultTheme.background,
    text: wedding.theme_text_color || defaultTheme.text,
    headingFont: wedding.theme_heading_font || defaultTheme.headingFont,
    bodyFont: wedding.theme_body_font || defaultTheme.bodyFont,
  };

  return (
    <WeddingContext.Provider value={{ wedding, theme, photos, storyItems }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error("useWedding must be used within a WeddingProvider");
  }
  return context;
}

export function useWeddingTheme() {
  const { theme } = useWedding();
  return theme;
}

export function useWeddingData() {
  const { wedding } = useWedding();
  return wedding;
}

export function useWeddingPhotos() {
  const { photos } = useWedding();
  return photos;
}

export function useStoryItems() {
  const { storyItems } = useWedding();
  return storyItems;
}
