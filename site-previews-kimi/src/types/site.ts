export type TemplateId =
  | "forge-automotive"
  | "apple-spatial"
  | "horology-chrono"
  | "kinetic-monolith"
  | "swiss-editorial";

/** Older IDs emitted by existing n8n workflows stay supported. */
export const LEGACY_TEMPLATE_FALLBACK: Record<string, TemplateId> = {
  "luxury-dark": "forge-automotive",
  "modern-clean": "apple-spatial",
  "warm-boutique": "swiss-editorial",
  "whisky-obsidian": "forge-automotive",
  "cyber-quantum": "kinetic-monolith",
  "atelier-boutique": "swiss-editorial",
};

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "forge-automotive", label: "Forge Automotive — מפרט אוטומוטיבי" },
  { id: "apple-spatial", label: "Apple Spatial — איים מרחפים" },
  { id: "horology-chrono", label: "Obsidian VIP Penthouse — גלריה תלת־ממדית" },
  { id: "kinetic-monolith", label: "Kinetic Monolith — תעשייתי" },
  { id: "swiss-editorial", label: "Swiss Editorial — אדריכלי" },
];

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
}

export interface BusinessInfo {
  name: string;
  category: string;
  city: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  openingHours: string;
  googleRating: number;
  reviewsCount: number;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundImage: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  price?: string;
  iconName: string;
}

export interface BenefitItem {
  title: string;
  description: string;
}

export interface ReviewItem {
  author: string;
  text: string;
  rating: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

export interface TimelineStep {
  title: string;
  description: string;
}

export interface Checkpoint {
  id: string;
  label: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface SiteData {
  businessId: string;
  slug: string;
  templateId: TemplateId;
  isDemo: boolean;
  checkoutUrl: string;
  theme: ThemeConfig;
  businessInfo: BusinessInfo;
  hero: HeroContent;
  services: ServiceItem[];
  benefits: BenefitItem[];
  reviews: ReviewItem[];
  faq: FaqItem[];
  initialBackup?: SiteData | boolean;
  checkpoints?: Array<Omit<Checkpoint, "data"> & { data?: Record<string, unknown> }>;
  projects?: ProjectItem[];
  processTimeline?: TimelineStep[];
  [key: string]: unknown;
}
