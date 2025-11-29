import React from "react";
import { BrandProfile, FullMenu, TypographyStyle } from "../types";
import { Star, AlertCircle, Instagram, Globe, Phone, Music } from "lucide-react";

interface DigitalMenuProps {
  menu: FullMenu;
  brand: BrandProfile;
  previewMode?: "mobile" | "desktop" | "print";
  scale?: number; // Helper for high-res export scaling
  carouselMode?: {
    active: boolean;
    slideType: 'cover' | 'section' | 'footer';
    sectionIndex?: number;
  };
}

const DigitalMenu: React.FC<DigitalMenuProps> = ({ 
  menu, 
  brand, 
  previewMode = "mobile",
  scale = 1,
  carouselMode
}) => {
  // Styles construction
  const containerStyle: React.CSSProperties = {
    backgroundColor: brand.backgroundColor,
    color: brand.textColor,
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100%',
    // If specific scale needed for export containers
    fontSize: `${scale}rem` 
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: brand.overlayMode === 'solid' ? brand.overlayColor : 'transparent',
    backgroundImage: brand.overlayMode === 'gradient' 
      ? `linear-gradient(to bottom, transparent, ${brand.overlayColor})` 
      : 'none',
    opacity: brand.overlayOpacity,
    zIndex: 1,
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const fontTitleClass = `font-${brand.fontTitle}`;
  const fontBodyClass = `font-${brand.fontBody}`;

  // Helper to generate CSS style object from TypographyStyle
  const getTypoStyle = (style: TypographyStyle, colorOverride?: string): React.CSSProperties => ({
    textAlign: style.align,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    textTransform: style.uppercase ? 'uppercase' : 'none',
    textDecoration: style.underline ? 'underline' : 'none',
    fontSize: `${style.scale * 1}em`, // Relative to container font size
    color: colorOverride,
    display: 'block',
  });

  // Render Logic based on Carousel Mode
  const renderCarouselContent = () => {
    if (!carouselMode || !carouselMode.active) return null;

    if (carouselMode.slideType === 'cover') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
           {brand.logoUrl && (
              <img src={brand.logoUrl} className={`w-48 h-48 mb-8 shadow-2xl ${brand.logoStyle === 'circle' ? 'rounded-full' : 'rounded-xl'}`} />
           )}
           <h1 className={`text-7xl font-bold leading-tight mb-6 ${fontTitleClass}`} style={{ color: brand.primaryColor }}>
             {menu.title}
           </h1>
           <div className="w-24 h-1 bg-current mb-6 opacity-50" style={{ color: brand.accentColor }}></div>
           {menu.subtitle && (
             <p className="text-3xl uppercase tracking-widest" style={{ color: brand.accentColor }}>{menu.subtitle}</p>
           )}
           <div className="mt-auto pt-12 opacity-60 text-xl">Scorri per scoprire il menù &rarr;</div>
        </div>
      );
    }

    if (carouselMode.slideType === 'section' && typeof carouselMode.sectionIndex === 'number') {
      const section = menu.sections[carouselMode.sectionIndex];
      return (
        <div className="flex-1 flex flex-col justify-center p-12 h-full">
            <h2 
              className={`text-6xl mb-12 pb-4 border-b-2 ${fontTitleClass} text-center`}
              style={{ 
                  color: brand.primaryColor,
                  borderColor: brand.accentColor 
              }}
            >
              {section.title}
            </h2>
            <div className="space-y-8">
               {section.items.map((item) => (
                  <div key={item.id} className="group">
                    <div className="flex justify-between items-baseline mb-2">
                       <h3 className="text-3xl font-bold" style={{ color: item.highlight ? brand.accentColor : 'inherit' }}>
                         {item.highlight && '★ '} {item.name}
                       </h3>
                       <span className="text-3xl font-bold" style={{ color: brand.accentColor }}>{item.price}</span>
                    </div>
                    {item.description && <p className="text-xl opacity-80 italic">{item.description}</p>}
                  </div>
               ))}
            </div>
            <div className="mt-auto text-center text-xl opacity-50">{carouselMode.sectionIndex + 2} / {menu.sections.length + 2}</div>
        </div>
      );
    }

    if (carouselMode.slideType === 'footer') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
           <h2 className={`text-5xl font-bold mb-12 ${fontTitleClass}`} style={{ color: brand.primaryColor }}>Prenota Ora</h2>
           
           {menu.socials && (
             <div className="space-y-8 text-2xl">
                {menu.socials.companyName && <div className="text-4xl font-bold uppercase mb-8">{menu.socials.companyName}</div>}
                
                {menu.socials.phone && (
                  <div className="flex items-center justify-center gap-4 text-3xl font-bold p-4 bg-white/10 rounded-xl" style={{color: brand.accentColor}}>
                    <Phone size={40} /> {menu.socials.phone}
                  </div>
                )}
                {menu.socials.instagram && <div className="flex items-center justify-center gap-3"><Instagram size={32} /> {menu.socials.instagram}</div>}
                {menu.socials.website && <div className="flex items-center justify-center gap-3"><Globe size={32} /> {menu.socials.website}</div>}
             </div>
           )}
           
           {menu.footerNote && <p className="mt-16 opacity-60 max-w-lg">{menu.footerNote}</p>}
        </div>
      );
    }
  };

  // --- Normal Rendering ---
  const isPrint = previewMode === 'print';
  // Adjust grid based on context. High scale (export) needs adapted gap.
  const gridClass = (previewMode === 'desktop' || isPrint) ? "grid grid-cols-2 gap-12 items-start" : "flex flex-col gap-6";

  return (
    <div id="digital-menu-container" className={`w-full h-full ${fontBodyClass}`} style={containerStyle}>
      {/* Background Image */}
      {brand.backgroundImageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={brand.backgroundImageUrl} 
            alt="Menu Background" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Overlay */}
      <div style={overlayStyle} />

      {/* Content */}
      <div className={`p-8 md:p-12 ${isPrint ? 'p-20' : ''}`} style={contentStyle}>
        
        {/* CAROUSEL MODE OVERRIDE */}
        {carouselMode?.active ? (
           renderCarouselContent()
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-10 space-y-4 shrink-0">
                {brand.logoUrl && (
                    <div className="mx-auto mb-6 flex justify-center">
                        <div className={`
                            relative overflow-hidden
                            ${brand.logoStyle === 'circle' ? 'rounded-full' : ''}
                            ${brand.logoStyle === 'rounded' ? 'rounded-2xl' : ''}
                            ${brand.logoStyle !== 'original' ? 'w-24 h-24 bg-white/10 backdrop-blur-sm shadow-lg' : 'w-auto h-24'}
                            ${isPrint ? 'w-48 h-48' : ''}
                        `}>
                            <img 
                                src={brand.logoUrl} 
                                alt="Logo" 
                                className={`w-full h-full ${brand.logoStyle === 'original' ? 'object-contain' : 'object-cover'}`}
                            />
                        </div>
                    </div>
                )}
              <h1 
                className={`text-4xl md:text-5xl font-bold leading-tight ${fontTitleClass}`}
                style={{ color: brand.primaryColor, fontSize: isPrint ? '4em' : undefined }}
              >
                {menu.title}
              </h1>
              {menu.subtitle && (
                <p className="text-xl opacity-90 tracking-wide uppercase" style={{ color: brand.accentColor, fontSize: isPrint ? '1.5em' : undefined }}>
                  {menu.subtitle}
                </p>
              )}
              {menu.fixedPrice && (
                <div 
                  className="inline-block px-4 py-1.5 rounded border border-current mt-2"
                  style={{ color: brand.accentColor, borderColor: brand.accentColor, fontSize: isPrint ? '1.5em' : undefined }}
                >
                  <span className="text-sm font-bold uppercase tracking-wider">{menu.fixedPrice}</span>
                </div>
              )}
            </div>

            {/* Sections */}
            <div className={`${gridClass} flex-1`}>
              {menu.sections.map((section) => (
                <div key={section.id} className="mb-8 break-inside-avoid">
                  <h2 
                    className={`text-2xl mb-4 pb-2 border-b border-opacity-30 ${fontTitleClass}`}
                    style={{ 
                        ...getTypoStyle(brand.styles.sectionTitle, brand.primaryColor),
                        borderColor: brand.accentColor 
                    }}
                  >
                    {section.title}
                  </h2>
                  
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.id} className="group relative">
                        <div className="flex items-baseline gap-2 justify-between">
                          {/* Name */}
                          <div className="flex-1">
                              <h3 
                                className={`flex items-center gap-2`}
                                style={getTypoStyle(brand.styles.itemName, item.highlight ? brand.accentColor : 'inherit')}
                              >
                                {item.highlight && <Star size={16} fill={brand.accentColor} stroke={brand.accentColor} />}
                                {item.name}
                              </h3>
                          </div>
                          
                          {/* Price */}
                          {item.price && (
                            <span 
                                className="whitespace-nowrap ml-2" 
                                style={getTypoStyle(brand.styles.price, brand.accentColor)}
                            >
                              {item.price}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {item.description && (
                          <div 
                            className="opacity-80 mt-1 leading-relaxed rich-text"
                            style={getTypoStyle(brand.styles.itemDescription)}
                            dangerouslySetInnerHTML={{ __html: item.description }}
                          />
                        )}

                        {/* Allergens */}
                        {item.allergens && (
                          <div className="mt-1 text-[0.7em] opacity-60">
                              <span className="font-bold uppercase">Allergeni:</span> {item.allergens}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-white/10 break-inside-avoid shrink-0 pb-8">
              {menu.footerNote && (
                <div className="text-center text-sm opacity-70 mb-6" style={{ fontSize: isPrint ? '1em' : undefined }}>
                  {menu.footerNote}
                </div>
              )}

              {/* Socials & Contacts */}
              {menu.socials && (
                <div className="flex flex-col items-center gap-4 text-sm opacity-90" style={{ fontSize: isPrint ? '1em' : undefined }}>
                    {menu.socials.companyName && (
                      <div className="font-bold tracking-wider uppercase text-center">{menu.socials.companyName}</div>
                    )}
                    
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                      {menu.socials.phone && (
                        <div className="flex items-center gap-2" style={{ color: brand.accentColor }}>
                            <Phone size={16} /> <span>{menu.socials.phone}</span>
                        </div>
                      )}
                      {menu.socials.instagram && (
                        <div className="flex items-center gap-2">
                            <Instagram size={16} /> <span>{menu.socials.instagram.replace(/^@/, '')}</span>
                        </div>
                      )}
                      {menu.socials.tiktok && (
                        <div className="flex items-center gap-2">
                            <Music size={16} /> <span>{menu.socials.tiktok.replace(/^@/, '')}</span>
                        </div>
                      )}
                      {menu.socials.website && (
                        <div className="flex items-center gap-2">
                            <Globe size={16} /> <span>{menu.socials.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}
                    </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DigitalMenu;