export interface WebsiteConfig {
  product: ProductConfig;
  social?: SocialConfig;
}

export interface ProductConfig {
  name: string;
  company: string;
  logoLight: string;
  logoDark?: string;
}

export interface SocialConfig {
  twitter?: string;
  github?: string;
  discord?: string;
  blueSky?: string;
  mastodon?: string;
  youtube?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
}
