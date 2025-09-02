import { ReactNode } from "react";

/**
 * menu item, used for navbar links, sidebar links, footer links
 */
export interface MenuItem {
  title: string; // The text to display
  description?: string; // The description of the item
  icon?: ReactNode; // The icon to display
  href?: string; // The url to link to
  external?: boolean; // Whether the link is external
  authorizeOnly?: string[]; // The roles that are authorized to see the item
}

/**
 * nested menu item, used for navbar links, sidebar links, footer links
 */
export type NestedMenuItem = MenuItem & {
  items?: MenuItem[]; // The items to display in the nested menu
};

export interface ThemeMessage {
  toggle: string;
  light: string;
  dark: string;
  system: string;
}

export interface SocialLink {
  name: string;
  link: string;
}

export interface SectionInfo {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
}

export interface QAItem {
  question: string;
  answer: string;
}
