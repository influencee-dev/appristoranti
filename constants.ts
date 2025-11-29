
import { BrandProfile, FullMenu, ThemePreset, PresetCategory, TypographyStyle } from "./types";

const DEFAULT_STYLE: TypographyStyle = {
  align: 'left',
  bold: false,
  italic: false,
  uppercase: false,
  underline: false,
  scale: 1,
  color: undefined,
  textGradient: undefined
};

export const DEFAULT_BRAND: BrandProfile = {
  primaryColor: "#ffffff",
  accentColor: "#facc15", // Yellow-400
  backgroundColor: "#111827", // Gray-900
  textColor: "#f3f4f6",
  fontTitle: "playfair",
  fontBody: "lato",
  logoStyle: "circle",
  overlayMode: "solid",
  overlayColor: "#000000",
  overlayOpacity: 0.6,
  backgroundImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1080&auto=format&fit=crop", // Restaurant interior default
  styles: {
    sectionTitle: { ...DEFAULT_STYLE, align: 'center', bold: true, uppercase: true, scale: 1.2 },
    itemName: { ...DEFAULT_STYLE, bold: true },
    itemDescription: { ...DEFAULT_STYLE, scale: 0.9 },
    price: { ...DEFAULT_STYLE, bold: true, align: 'right' }
  }
};

export const DEFAULT_MENU: FullMenu = {
  title: "Gusto & Sapore",
  subtitle: "Menù Stagionale 2025",
  sections: [
    {
      id: "sec-1",
      title: "Antipasti",
      items: [
        { id: "it-1", name: "Trilogia di Bruschette", description: "Pomodoro fresco, paté di olive, crema al tartufo", price: "12€" },
        { id: "it-2", name: "Carpaccio di Manzo", description: "Con scaglie di parmigiano e rucola selvatica", price: "16€", highlight: true }
      ]
    },
    {
      id: "sec-2",
      title: "Primi Piatti",
      items: [
        { id: "it-3", name: "Risotto al Tartufo", description: "Riso Carnaroli, tartufo nero estivo, mantecato al burro", price: "22€" },
        { id: "it-4", name: "Tagliolini al Salmone", description: "Pasta fresca all'uovo con salmone affumicato e aneto", price: "18€" }
      ]
    }
  ],
  footerNote: "Coperto 2.50€ - Si prega di comunicare eventuali allergie allo staff."
};

export const FONTS = [
  { value: "playfair", label: "Playfair Display (Elegante)" },
  { value: "merriweather", label: "Merriweather (Classico)" },
  { value: "oswald", label: "Oswald (Moderno/Bold)" },
  { value: "lato", label: "Lato (Pulito)" },
  { value: "opensans", label: "Open Sans (Leggibile)" },
  { value: "dancing", label: "Dancing Script (Manuale)" },
];

export const TEXT_GRADIENTS = [
  { name: "Nessuno", value: "" },
  { name: "Oro", value: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)" },
  { name: "Argento", value: "linear-gradient(to right, #dcdcdc, #f8f8f8, #a9a9a9)" },
  { name: "Rame", value: "linear-gradient(to right, #e65c00, #f9d423)" },
  { name: "Oceano", value: "linear-gradient(to right, #2E3192, #1BFFFF)" },
  { name: "Tramonto", value: "linear-gradient(to right, #fc5c7d, #6a82fb)" },
  { name: "Lime", value: "linear-gradient(to right, #11998e, #38ef7d)" },
];

// Helper to Create Styles quickly
const createStyle = (overrides: Partial<TypographyStyle>): TypographyStyle => ({ ...DEFAULT_STYLE, ...overrides });

// Color Palettes (Only Colors)
export const COLOR_PALETTES = [
    { name: "Oceano", colors: { bg: "#0f172a", text: "#e2e8f0", primary: "#38bdf8", accent: "#0ea5e9" }},
    { name: "Foresta", colors: { bg: "#052e16", text: "#f0fdf4", primary: "#86efac", accent: "#4ade80" }},
    { name: "Tramonto", colors: { bg: "#431407", text: "#ffedd5", primary: "#fb923c", accent: "#f97316" }},
    { name: "Monocromo", colors: { bg: "#000000", text: "#ffffff", primary: "#ffffff", accent: "#a3a3a3" }},
    { name: "Reale", colors: { bg: "#312e81", text: "#e0e7ff", primary: "#c7d2fe", accent: "#fbbf24" }},
    { name: "Lavanda", colors: { bg: "#2e1065", text: "#f3e8ff", primary: "#d8b4fe", accent: "#c084fc" }},
];

export const BACKGROUND_PRESETS = [
  {
    category: "Pizzeria",
    images: [
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1080&auto=format&fit=crop", // Pizza Napoletana
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1080&auto=format&fit=crop", // Pizza detail
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1080&auto=format&fit=crop", // Pizza dark
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1080&auto=format&fit=crop", // Pizza oven/rustic
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=1080&auto=format&fit=crop", // Pizza slice
    ]
  },
  {
    category: "Cucina Italiana",
    images: [
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1080&auto=format&fit=crop", // Pasta basil
      "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=1080&auto=format&fit=crop", // Pasta creamy
      "https://images.unsplash.com/photo-1544669896-1877995eb87a?q=80&w=1080&auto=format&fit=crop", // Mediterranean
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1080&auto=format&fit=crop", // Cocktail/Aperitivo
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1080&auto=format&fit=crop", // Spaghetti
    ]
  },
  {
    category: "Sushi & Asia",
    images: [
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1080&auto=format&fit=crop", // Sushi dark
      "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1080&auto=format&fit=crop", // Sushi bright
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1080&auto=format&fit=crop", // Ramen
      "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=1080&auto=format&fit=crop", // Asian food
      "https://images.unsplash.com/photo-1552539618-7eec9b4d1796?q=80&w=1080&auto=format&fit=crop", // Dumplings
    ]
  },
  {
    category: "Gourmet & Carne",
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1080&auto=format&fit=crop", // Steak dark
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1080&auto=format&fit=crop", // Fine dining plate
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1080&auto=format&fit=crop", // Food darker
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1080&auto=format&fit=crop", // Restaurant interior
    ]
  },
  {
    category: "Fast Food",
    images: [
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1080&auto=format&fit=crop", // Burger
      "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1080&auto=format&fit=crop", // Burger & Fries
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1080&auto=format&fit=crop", // Burger close
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1080&auto=format&fit=crop", // Diner style
    ]
  },
  {
    category: "Dolci & Colazione",
    images: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1080&auto=format&fit=crop", // Coffee
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1080&auto=format&fit=crop", // Cake/Dessert
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1080&auto=format&fit=crop", // Cookies/Bakery
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1080&auto=format&fit=crop", // Croissant
    ]
  },
  {
    category: "Stagioni",
    images: [
      "https://images.unsplash.com/photo-1490750967868-58cb75069ed6?q=80&w=1080&auto=format&fit=crop", // Spring/Flowers
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop", // Summer/Beach
      "https://images.unsplash.com/photo-1508264165352-258db2ebd59b?q=80&w=1080&auto=format&fit=crop", // Autumn/Leaves
      "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=1080&auto=format&fit=crop", // Winter/Snow
      "https://images.unsplash.com/photo-1560159752-d6d027f3005a?q=80&w=1080&auto=format&fit=crop", // Fresh Summer Drink
    ]
  },
  {
    category: "Feste & Eventi",
    images: [
      "https://images.unsplash.com/photo-1512474932049-78ea696f9c42?q=80&w=1080&auto=format&fit=crop", // Christmas
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcf8?q=80&w=1080&auto=format&fit=crop", // Christmas Lights
      "https://images.unsplash.com/photo-1508341591423-4347099e1f19?q=80&w=1080&auto=format&fit=crop", // Halloween/Pumpkin
      "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?q=80&w=1080&auto=format&fit=crop", // Party/NewYear
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1080&auto=format&fit=crop", // Wedding/Elegant
    ]
  },
  {
    category: "Texture & Astratto",
    images: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop", // Black texture
      "https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?q=80&w=1080&auto=format&fit=crop", // Grey concrete
      "https://images.unsplash.com/photo-1524312792348-7357c9183494?q=80&w=1080&auto=format&fit=crop", // Paper texture
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1080&auto=format&fit=crop", // Wood texture
    ]
  }
];

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: "seasons",
    title: "Stagioni",
    presets: [
      {
        id: "spring",
        name: "Primavera",
        brand: {
          backgroundColor: "#fdf4ff", textColor: "#4a044e", primaryColor: "#d946ef", accentColor: "#86efac",
          fontTitle: "dancing", fontBody: "lato", overlayMode: "gradient", overlayColor: "#ffffff", overlayOpacity: 0.4,
        }
      },
      {
        id: "summer",
        name: "Estate",
        brand: {
          backgroundColor: "#fff7ed", textColor: "#7c2d12", primaryColor: "#f97316", accentColor: "#0ea5e9",
          fontTitle: "oswald", fontBody: "opensans", overlayMode: "solid", overlayColor: "#ffedd5", overlayOpacity: 0.2,
        }
      },
      {
        id: "autumn",
        name: "Autunno",
        brand: {
          backgroundColor: "#271c19", textColor: "#fed7aa", primaryColor: "#fb923c", accentColor: "#a16207",
          fontTitle: "merriweather", fontBody: "lato", overlayMode: "solid", overlayColor: "#000000", overlayOpacity: 0.6,
        }
      },
      {
        id: "winter",
        name: "Inverno",
        brand: {
          backgroundColor: "#1e293b", textColor: "#f1f5f9", primaryColor: "#94a3b8", accentColor: "#38bdf8",
          fontTitle: "playfair", fontBody: "opensans", overlayMode: "gradient", overlayColor: "#0f172a", overlayOpacity: 0.8,
        }
      }
    ]
  },
  {
    id: "restaurants",
    title: "Tipo Ristorante",
    presets: [
      {
        id: "pizzeria",
        name: "Pizzeria",
        brand: {
          backgroundColor: "#991b1b", textColor: "#fef2f2", primaryColor: "#ffffff", accentColor: "#22c55e",
          fontTitle: "oswald", fontBody: "lato", styles: {
             sectionTitle: createStyle({ align: 'center', uppercase: true, bold: true, scale: 1.3 }),
             itemName: createStyle({ bold: true, scale: 1.1 }),
             itemDescription: createStyle({ italic: true, scale: 0.9 }),
             price: createStyle({ bold: true, align: 'right', scale: 1.1 })
          }
        }
      },
      {
        id: "sushi",
        name: "Sushi Bar",
        brand: {
          backgroundColor: "#ffffff", textColor: "#171717", primaryColor: "#000000", accentColor: "#ef4444",
          fontTitle: "lato", fontBody: "lato", styles: {
             sectionTitle: createStyle({ align: 'left', uppercase: true, scale: 1.1, underline: true }),
             itemName: createStyle({ bold: false, uppercase: true, scale: 1 }),
             itemDescription: createStyle({ scale: 0.85 }),
             price: createStyle({ align: 'right' })
          }
        }
      },
      {
        id: "fine-dining",
        name: "Fine Dining",
        brand: {
          backgroundColor: "#000000", textColor: "#d4d4d4", primaryColor: "#ca8a04", accentColor: "#ca8a04",
          fontTitle: "playfair", fontBody: "merriweather", styles: {
             sectionTitle: createStyle({ align: 'center', italic: true, scale: 1.4 }),
             itemName: createStyle({ align: 'center', bold: true }),
             itemDescription: createStyle({ align: 'center', scale: 0.9, italic: true }),
             price: createStyle({ align: 'center', scale: 0.9 })
          }
        }
      },
      {
        id: "burger",
        name: "Burger Joint",
        brand: {
          backgroundColor: "#171717", textColor: "#ffffff", primaryColor: "#eab308", accentColor: "#eab308",
          fontTitle: "oswald", fontBody: "oswald", styles: {
             sectionTitle: createStyle({ align: 'left', uppercase: true, bold: true, scale: 1.5, italic: true }),
             itemName: createStyle({ uppercase: true, bold: true, scale: 1.2 }),
             itemDescription: createStyle({ scale: 1 }),
             price: createStyle({ bold: true, scale: 1.2, align: 'right' })
          }
        }
      },
      {
        id: "trattoria",
        name: "Trattoria",
        brand: {
          backgroundColor: "#fef3c7", textColor: "#78350f", primaryColor: "#92400e", accentColor: "#b45309",
          fontTitle: "merriweather", fontBody: "merriweather",
        }
      },
      {
        id: "cafe",
        name: "Cafè & Bistro",
        brand: {
          backgroundColor: "#f5f5f4", textColor: "#44403c", primaryColor: "#57534e", accentColor: "#a8a29e",
          fontTitle: "lato", fontBody: "opensans",
        }
      },
      {
        id: "vegan",
        name: "Green / Vegan",
        brand: {
          backgroundColor: "#f0fdf4", textColor: "#14532d", primaryColor: "#15803d", accentColor: "#4ade80",
          fontTitle: "lato", fontBody: "lato",
        }
      },
      {
        id: "seafood",
        name: "Ristorante di Mare",
        brand: {
          backgroundColor: "#eff6ff", textColor: "#1e3a8a", primaryColor: "#1d4ed8", accentColor: "#60a5fa",
          fontTitle: "playfair", fontBody: "lato",
        }
      }
    ]
  },
  {
    id: "events",
    title: "Eventi",
    presets: [
      { id: "xmas", name: "Natale", brand: { backgroundColor: "#14532d", textColor: "#f0fdf4", primaryColor: "#fca5a5", accentColor: "#fbbf24", fontTitle: "dancing" } },
      { id: "newyear", name: "Capodanno", brand: { backgroundColor: "#000000", textColor: "#e5e5e5", primaryColor: "#d4af37", accentColor: "#c0c0c0", fontTitle: "playfair" } },
      { id: "easter", name: "Pasqua", brand: { backgroundColor: "#fdf2f8", textColor: "#831843", primaryColor: "#f472b6", accentColor: "#facc15", fontTitle: "dancing" } },
      { id: "valentine", name: "San Valentino", brand: { backgroundColor: "#881337", textColor: "#ffe4e6", primaryColor: "#fb7185", accentColor: "#ffffff", fontTitle: "dancing" } },
      { id: "wedding", name: "Matrimonio", brand: { backgroundColor: "#fafaf9", textColor: "#57534e", primaryColor: "#a8a29e", accentColor: "#d6d3d1", fontTitle: "playfair" } },
      { id: "halloween", name: "Halloween", brand: { backgroundColor: "#1a0b2e", textColor: "#e9d5ff", primaryColor: "#f97316", accentColor: "#22c55e", fontTitle: "oswald" } },
      { id: "birthday", name: "Compleanno", brand: { backgroundColor: "#fff1f2", textColor: "#be123c", primaryColor: "#f43f5e", accentColor: "#3b82f6", fontTitle: "dancing" } },
      { id: "aperitivo", name: "Aperitivo", brand: { backgroundColor: "#431407", textColor: "#ffedd5", primaryColor: "#fb923c", accentColor: "#fdba74", fontTitle: "lato" } },
      { id: "brunch", name: "Brunch", brand: { backgroundColor: "#ecfccb", textColor: "#3f6212", primaryColor: "#65a30d", accentColor: "#84cc16", fontTitle: "opensans" } },
      { id: "corporate", name: "Cena Aziendale", brand: { backgroundColor: "#1e293b", textColor: "#cbd5e1", primaryColor: "#94a3b8", accentColor: "#60a5fa", fontTitle: "lato" } },
    ]
  }
];
