import type { ReactElement } from "react";

export type IconKey =
  | "mass"
  | "sacraments"
  | "announcements"
  | "office"
  | "media"
  | "contact"
  | "calendar"
  | "heart"
  | "book"
  | "community"
  | "church"
  | "cross";

export const ICON_KEYS: IconKey[] = [
  "mass",
  "sacraments",
  "announcements",
  "office",
  "media",
  "contact",
  "calendar",
  "heart",
  "book",
  "community",
  "church",
  "cross",
];

type IconProps = { className?: string };

function MassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <ellipse cx="24" cy="36" rx="13" ry="4" />
      <path d="M11 36V26c0-7 5.8-13 13-13s13 6 13 13v10" />
      <path d="M19 13V9M29 13V9M24 9V4M18 4h12" />
    </svg>
  );
}

function SacramentsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <line x1="24" y1="6" x2="24" y2="42" />
      <line x1="6" y1="24" x2="42" y2="24" />
      <circle cx="24" cy="24" r="9" />
    </svg>
  );
}

function AnnouncementsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M32 8h7v32H9V8h7" />
      <rect x="17" y="4" width="14" height="8" rx="2" />
      <path d="M20 24l4 4 8-8" />
    </svg>
  );
}

function OfficeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="8" y="16" width="32" height="24" rx="2" />
      <path d="M8 22l16 12 16-12" />
      <path d="M16 16v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
    </svg>
  );
}

function MediaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="4" y="12" width="40" height="26" rx="4" />
      <polygon points="20 19 32 25 20 31 20 19" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ContactIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M16 10h-4a4 4 0 0 0-4 4v4c0 13 10 22 22 22h4a4 4 0 0 0 4-4v-3a1 1 0 0 0-.6-.9l-7-3a1 1 0 0 0-1.1.3l-3 3.3C19.5 30 18 28.5 16 26l3.3-3a1 1 0 0 0 .3-1.1l-3-7A1 1 0 0 0 15.6 14z" />
    </svg>
  );
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="6" y="10" width="36" height="32" rx="3" />
      <path d="M6 19h36" />
      <path d="M15 6v8M33 6v8" />
      <path d="M14 27h4M22 27h4M30 27h4M14 34h4M22 34h4" />
    </svg>
  );
}

function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M24 40S7 29.5 7 17.8C7 11.8 11.7 7 17.5 7c3.4 0 6.4 1.7 8.5 4.4C28.1 8.7 31.1 7 34.5 7 40.3 7 45 11.8 45 17.8 45 29.5 24 40 24 40z" />
    </svg>
  );
}

function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M24 12c-3.5-3-8.4-4-14-4v28c5.6 0 10.5 1 14 4 3.5-3 8.4-4 14-4V8c-5.6 0-10.5 1-14 4z" />
      <path d="M24 12v28" />
    </svg>
  );
}

function CommunityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="17" cy="16" r="6" />
      <circle cx="33" cy="18" r="5" />
      <path d="M6 40v-3c0-6 5-10 11-10s11 4 11 10v3" />
      <path d="M28 40v-2c0-4.5 3-8.5 7.5-9.8" />
    </svg>
  );
}

function ChurchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M24 6v6M21 9h6" />
      <path d="M24 12l14 10v6H10v-6z" />
      <path d="M10 28h28v14H10z" />
      <path d="M20 42v-9a4 4 0 0 1 8 0v9" />
      <path d="M14 34h4v4h-4zM30 34h4v4h-4z" />
    </svg>
  );
}

function CrossIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M24 6v36M14 16h20" />
    </svg>
  );
}

const ICONS: Record<IconKey, (props: IconProps) => ReactElement> = {
  mass: MassIcon,
  sacraments: SacramentsIcon,
  announcements: AnnouncementsIcon,
  office: OfficeIcon,
  media: MediaIcon,
  contact: ContactIcon,
  calendar: CalendarIcon,
  heart: HeartIcon,
  book: BookIcon,
  community: CommunityIcon,
  church: ChurchIcon,
  cross: CrossIcon,
};

export function Icon({ icon, className }: { icon: IconKey; className?: string }) {
  const Glyph = ICONS[icon];
  return <Glyph className={className} />;
}
