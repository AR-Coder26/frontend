import { Link2 } from "lucide-react";
import type { FC, SVGProps } from "react";

export const SOCIAL_ICON_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X (Twitter)" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "threads", label: "Threads" },
  { value: "pinterest", label: "Pinterest" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "snapchat", label: "Snapchat" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "link", label: "Generic Link (no brand icon)" },
] as const;

export type SocialIconName = (typeof SOCIAL_ICON_OPTIONS)[number]["value"];

type IconProps = SVGProps<SVGSVGElement>;

const ICONS: Record<Exclude<SocialIconName, "link">, FC<IconProps>> = {
  facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  ),
  instagram: (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  x: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.68L23 22h-6.9l-5.4-6.65L4.5 22H1.4l8.13-9.3L1 2h7.07l4.9 6.13L18.9 2Zm-1.2 18.2h1.71L6.4 3.7H4.56l13.14 16.5Z" />
    </svg>
  ),
  tiktok: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 2h-3.1v13.7a2.9 2.9 0 1 1-2.05-2.77V9.7a6 6 0 1 0 5.15 5.94V8.63a7.9 7.9 0 0 0 4.5 1.4V6.9a4.83 4.83 0 0 1-4.5-4.9Z" />
    </svg>
  ),
  youtube: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12s0-3.4-.44-5.02a2.78 2.78 0 0 0-1.95-1.96C17.94 4.6 12 4.6 12 4.6s-5.94 0-7.61.42A2.78 2.78 0 0 0 2.44 7C2 8.6 2 12 2 12s0 3.4.44 5.02a2.78 2.78 0 0 0 1.95 1.96C6.06 19.4 12 19.4 12 19.4s5.94 0 7.61-.42a2.78 2.78 0 0 0 1.95-1.96C22 15.4 22 12 22 12Zm-12.1 3.13V8.87L15.5 12l-5.6 3.13Z" />
    </svg>
  ),
  threads: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.2 2C7 2 3.9 4.9 3.7 9.6h2.5c.2-3.3 2.2-5.2 6-5.2 3.3 0 5.4 1.5 5.4 3.7 0 1.7-1 2.7-3.1 3.2l-2 .45c-3.3.75-4.9 2.3-4.9 4.9 0 3 2.4 4.9 6 4.9 3.5 0 6-1.7 6.5-4.9h-2.5c-.4 1.7-1.8 2.6-4 2.6-1.9 0-3.4-.9-3.4-2.4 0-1.3.9-2 2.9-2.5l2-.45c3.4-.8 5.1-2.6 5.1-5.4C20.2 4.7 16.9 2 12.2 2Z" />
    </svg>
  ),
  pinterest: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-3.65 19.31c-.05-.82-.09-2.08.02-2.98.1-.8.66-5.1.66-5.1s-.17-.34-.17-.83c0-.78.45-1.36 1.02-1.36.48 0 .71.36.71.79 0 .48-.31 1.21-.46 1.88-.13.56.28 1.02.83 1.02 1 0 1.77-1.05 1.77-2.58 0-1.35-.97-2.29-2.35-2.29-1.6 0-2.54 1.2-2.54 2.44 0 .48.18.99.42 1.27a.17.17 0 0 1 .04.17c-.04.19-.15.6-.17.68-.03.11-.09.14-.2.08-.79-.37-1.28-1.52-1.28-2.44 0-1.99 1.44-3.81 4.16-3.81 2.18 0 3.88 1.55 3.88 3.63 0 2.16-1.36 3.9-3.25 3.9-.63 0-1.23-.33-1.43-.72l-.39 1.49c-.14.55-.53 1.23-.79 1.65A10 10 0 1 0 12 2Z" />
    </svg>
  ),
  linkedin: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 5a2 2 0 1 1-4-.01 2 2 0 0 1 4 .01ZM3.2 8.75h3.5V21H3.2V8.75Zm6.2 0h3.35v1.68h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.34V21h-3.5v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9.4V8.75Z" />
    </svg>
  ),
  snapchat: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c2.9 0 4.8 2.06 4.95 4.9.04.7.02 1.45-.02 2.1.36.16.75.26 1.1.2.5-.08.95.24.98.72.03.45-.28.78-.75.95-.2.08-.5.16-.5.4 0 .5.85 1.85 2.6 2.15.3.05.53.3.5.6-.05.66-1.1 1-1.85 1.2-.15.55-.3.98-.5 1.1-.25.16-.9.08-1.4.1-.5.02-.85.55-1.75 1.1-.95.6-1.9.68-3.36.68s-2.4-.08-3.36-.68c-.9-.55-1.25-1.08-1.75-1.1-.5-.02-1.15.06-1.4-.1-.2-.12-.35-.55-.5-1.1-.75-.2-1.8-.54-1.85-1.2-.03-.3.2-.55.5-.6 1.75-.3 2.6-1.65 2.6-2.15 0-.24-.3-.32-.5-.4-.47-.17-.78-.5-.75-.95.03-.48.48-.8.98-.72.35.06.74-.04 1.1-.2-.04-.65-.06-1.4-.02-2.1C7.2 4.06 9.1 2 12 2Z" />
    </svg>
  ),
  whatsapp: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.02 2c-5.5 0-10 4.48-10 10 0 1.77.46 3.44 1.27 4.9L2 22l5.25-1.38A9.96 9.96 0 0 0 12.02 22c5.5 0 10-4.48 10-10s-4.5-10-10-10Zm5.85 14.2c-.25.7-1.45 1.35-2 1.4-.5.05-1.15.08-1.85-.12-.43-.12-.98-.32-1.7-.63-2.98-1.3-4.9-4.3-5.05-4.5-.15-.2-1.2-1.6-1.2-3.05 0-1.46.76-2.17 1.03-2.47.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.5.25.6.85 2.05.92 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.32.38-.45.5-.15.15-.32.32-.13.62.18.3.8 1.32 1.73 2.14 1.2 1.05 2.2 1.38 2.5 1.53.3.15.48.13.65-.07.18-.2.75-.85.95-1.15.2-.3.4-.25.65-.15.27.1 1.7.8 2 .95.3.15.48.22.55.35.07.13.07.75-.18 1.45Z" />
    </svg>
  ),
  telegram: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 3.5 2.9 11.15c-1.2.5-1.2 1.2-.22 1.5l4.9 1.53 1.9 5.83c.23.63.4.9.8.9.3 0 .45-.14.63-.3l1.83-1.75 3.8 2.8c.7.4 1.2.2 1.4-.65l2.5-11.8c.28-1.15-.35-1.62-1.34-1.28Zm-3.4 3.7-6.9 6.28-.28 3.05-1.35-4.15 7.86-5.9c.35-.25.68.05.34.42l-4.9 4.6Z" />
    </svg>
  ),
};

interface SocialIconProps extends IconProps {
  name: string;
}

export function SocialIcon({ name, ...props }: SocialIconProps) {
  if (name === "link" || !(name in ICONS)) {
    return <Link2 {...props} />;
  }
  const IconComponent = ICONS[name as Exclude<SocialIconName, "link">];
  return <IconComponent {...props} />;
}
