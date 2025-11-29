export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  highlight?: boolean;
  allergens?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface SocialInfo {
  companyName?: string;
  phone?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
}

export interface FullMenu {
  title: string;
  subtitle?: string; // e.g., "Christmas 2025" or "Fixed Price 50€"
  fixedPrice?: string;
  sections: MenuSection[];
  footerNote?: string;
  socials?: SocialInfo;
}

export interface TypographyStyle {
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  uppercase: boolean;
  underline: boolean;
  scale: number; // 1 is base size
}

export interface BrandProfile {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  fontTitle: string;
  fontBody: string;

  logoUrl?: string;
  logoStyle: 'original' | 'rounded' | 'circle';
  
  backgroundImageUrl?: string;
  overlayMode: 'solid' | 'gradient';
  overlayColor: string;
  overlayOpacity: number;

  // Global Text Styles
  styles: {
    sectionTitle: TypographyStyle;
    itemName: TypographyStyle;
    itemDescription: TypographyStyle;
    price: TypographyStyle;
  }
}

export interface AppState {
  menu: FullMenu;
  brand: BrandProfile;
  hasOnboarded: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  brand: Partial<BrandProfile>;
}

export interface PresetCategory {
  id: string;
  title: string;
  presets: ThemePreset[];
}

// Declarations for global libraries loaded via CDN
declare global {
  interface Window {
    html2canvas: any;
    QRious: any;
  }
}