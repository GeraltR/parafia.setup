export interface Theme {
  id: number;
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
  title: string;
  subtitle: string;
}

export interface SocialVisibility {
  facebook: boolean;
  youtube: boolean;
  x: boolean;
  instagram: boolean;
  tiktok: boolean;
  pinterest: boolean;
  linkedin: boolean;
}

export interface SocialLinks {
  facebook: string;
  youtube: string;
  x: string;
  instagram: string;
  tiktok: string;
  pinterest: string;
  linkedin: string;
}

export interface ContactAddresses {
  id: number;
  address: string;
  phone: string;
  social: SocialVisibility;
}

export type VerticalAlign = "top" | "center" | "bottom";

export interface HeroButton {
  id: number;
  label: string;
  href: string;
  icon: "mass" | "announcements" | "live";
  external?: boolean;
}

export interface Hero {
  title: string;
  titleWidth: number;
  titleFont: string;
  titleVAlign: VerticalAlign;
  subtitle: string;
  subtitleWidth: number;
  subtitleFont: string;
  subtitleVAlign: VerticalAlign;
  keynote: string;
  keynoteWidth: number;
  keynoteFont: string;
  keynoteVAlign: VerticalAlign;
  backgroundImage: string;
  buttons: HeroButton[];
}

export interface NavItem {
  id: number;
  label: string;
  href: string;
}

export interface Navbar {
  items: NavItem[];
}

export type ShortActionIcon =
  | "mass"
  | "sacraments"
  | "announcements"
  | "office"
  | "media"
  | "contact";

export interface ShortActionItem {
  id: number;
  icon: ShortActionIcon;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

export interface EventItem {
  id: number;
  date: string; // ISO date
  time: string;
  title: string;
  description: string;
}

export interface NewsItem {
  id: number;
  date: string; // ISO date
  title: string;
  excerpt: string;
  image: string;
}

export interface MassIntention {
  id: number;
  date: string; // ISO date
  time: string;
  intention: string;
}

export interface InfoExtra {
  id: number;
  title: string;
  description: string;
  images: string[]; 
  progressPercent: number;
  bankAccount: string;
  donationUrl: string;
  active: boolean;
}

export interface OfficeHour {
  id: number;
  day: string;
  hours: string;
}

export interface FooterLegalLink {
  id: number;
  label: string;
  href: string;
}

export interface FooterConfig {
  officeHours: OfficeHour[];
  officeNote: string;
  mapEmbedUrl: string;
  mapLink: string;
  legalLinks: FooterLegalLink[];
  copyrightText: string;
}
