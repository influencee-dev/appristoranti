
import React from "react";
import { BrandProfile, FullMenu, TypographyStyle } from "../types";
import { Star, AlertCircle, Instagram, Globe, Phone, Music, ChevronRight, Hash } from "lucide-react";

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
  const getTypoStyle = (style: TypographyStyle, colorOverride?: string): React.CSSProperties => {
    const css: React.CSSProperties = {
      textAlign: style.align,
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textTransform: style.uppercase ? 'uppercase' : 'none',
      textDecoration: style.underline ? 'underline' : 'none',
      fontSize: `${style.scale * 1}em`, // Relative to container font size
      display: 'block',
    };

    // Color Logic: Gradient > Specific Color > Override > Inherit
    if (style.textGradient) {
      css.backgroundImage = style.textGradient;
      css.WebkitBackgroundClip = 'text';
      css.WebkitTextFillColor = 'transparent';
      css.backgroundClip = 'text';
    } else if (style.color) {
      css.color = style.color;
    } else if (colorOverride) {
      css.color = colorOverride;
    }

    return css;
  };

  // Render Logic based on Carousel Mode (Magazine Style 4:5)
  const renderCarouselContent = () => {
    if (!carouselMode || !carouselMode.active) return null;

    // Common Card Style for Glassmorphism
    const cardStyle = "bg-black/30 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl flex flex-col h-full justify-between relative overflow-hidden";
    const magazineBorder = "absolute inset-4 border border-white/20 rounded-[2.5rem] pointer-events-none";

    // --- SLIDE 1: COVER ---
    if (carouselMode.slideType === 'cover') {
      return (
        <div className="flex-1 p-8 h-full flex flex-col justify-center">
           <div className={`${cardStyle} items-center text-center`}>
               <div className={magazineBorder}></div>
               
               {/* Brand Top */}
               <div className="mt-8">
                  {brand.logoUrl && (
                     <img src={brand.logoUrl} className={`w-40 h-40 mx-auto shadow-2xl object-cover border-4 border-white/10 ${brand.logoStyle === 'circle' ? 'rounded-full' : 'rounded-3xl'}`} />
                  )}
                  <div className="mt-6 text-sm uppercase tracking-[0.3em] opacity-70">Ristorante</div>
               </div>

               {/* Big Title */}
               <div className="my-auto">
                   <h1 className={`text-[6em] leading-[0.9] font-bold mb-6 ${fontTitleClass} drop-shadow-2xl`} style={getTypoStyle({ ...brand.styles.sectionTitle, scale: 1 }, brand.primaryColor)}>
                     {menu.title}
                   </h1>
                   <div className="w-32 h-2 bg-current mx-auto rounded-full" style={{ color: brand.accentColor }}></div>
               </div>

               {/* Badge & Subtitle */}
               <div className="mb-12">
                   {menu.subtitle && (
                     <div className="inline-block px-8 py-3 bg-white/10 backdrop-blur rounded-full border border-white/20">
                       <p className="text-2xl uppercase tracking-widest font-bold" style={{ color: brand.accentColor }}>{menu.subtitle}</p>
                     </div>
                   )}
               </div>

               {/* Swipe Indicator */}
               <div className="absolute bottom-8 right-8 flex items-center gap-2 animate-pulse">
                  <span className="text-lg font-bold opacity-60">SCOPRI</span>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <ChevronRight size={24} />
                  </div>
               </div>
           </div>
        </div>
      );
    }

    // --- SLIDE 2...N: SECTION ---
    if (carouselMode.slideType === 'section' && typeof carouselMode.sectionIndex === 'number') {
      const section = menu.sections[carouselMode.sectionIndex];
      return (
        <div className="flex-1 p-6 h-full flex flex-col">
            <div className={`${cardStyle} !p-0`}>
                {/* Header Section */}
                <div className="p-10 pb-6 border-b border-white/10 bg-black/20">
                    <div className="flex justify-between items-start">
                        <h2 
                          className={`text-[4em] leading-none ${fontTitleClass}`}
                          style={getTypoStyle(brand.styles.sectionTitle, brand.primaryColor)}
                        >
                          {section.title}
                        </h2>
                        <span className="text-6xl opacity-10 font-bold font-sans">
                           {(carouselMode.sectionIndex + 1).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 p-10 space-y-8 overflow-hidden">
                   {section.items.slice(0, 6).map((item) => ( // Limit items per slide for safety
                      <div key={item.id} className="group">
                        <div className="flex justify-between items-baseline mb-1 border-b border-dashed border-white/10 pb-2">
                           <h3 className={`text-3xl font-bold truncate pr-4 ${fontBodyClass}`} style={getTypoStyle(brand.styles.itemName, item.highlight ? brand.accentColor : undefined)}>
                             {item.name}
                           </h3>
                           <span className={`text-3xl font-bold whitespace-nowrap ${fontTitleClass}`} style={getTypoStyle(brand.styles.price, brand.accentColor)}>{item.price}</span>
                        </div>
                        {item.description && <div className="text-lg opacity-70 italic line-clamp-2 leading-tight" style={getTypoStyle(brand.styles.itemDescription)} dangerouslySetInnerHTML={{ __html: item.description }} />}
                      </div>
                   ))}
                   {section.items.length > 6 && <div className="text-center opacity-50 italic">...e molto altro</div>}
                </div>

                {/* Footer Page Num */}
                <div className="p-6 bg-black/20 flex justify-between items-center text-sm opacity-50 font-mono">
                    <span>{menu.title}</span>
                    <span>{carouselMode.sectionIndex + 2} / {menu.sections.length + 2}</span>
                </div>
            </div>
        </div>
      );
    }

    // --- SLIDE LAST: CONTACTS ---
    if (carouselMode.slideType === 'footer') {
      return (
        <div className="flex-1 p-8 h-full flex flex-col justify-center">
           <div className={`${cardStyle} items-center justify-center text-center`}>
               <div className={magazineBorder}></div>
               
               <h2 className={`text-[4em] font-bold mb-12 ${fontTitleClass}`} style={{ color: brand.primaryColor }}>Prenota Ora</h2>
               
               {menu.socials && (
                 <div className="w-full space-y-8 px-8">
                    {menu.socials.companyName && <div className="text-4xl font-bold uppercase tracking-widest mb-12 pb-8 border-b border-white/20">{menu.socials.companyName}</div>}
                    
                    {menu.socials.phone && (
                      <div className="flex items-center justify-between p-6 bg-white/10 rounded-2xl border border-white/10">
                         <div className="flex items-center gap-4 text-3xl font-bold" style={{color: brand.accentColor}}>
                           <Phone size={40} /> Telefono
                         </div>
                         <span className="text-3xl font-mono">{menu.socials.phone}</span>
                      </div>
                    )}
                    
                    {menu.socials.instagram && (
                      <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-4 text-2xl font-bold opacity-80">
                           <Instagram size={32} /> Instagram
                         </div>
                         <span className="text-2xl">{menu.socials.instagram.replace('@','')}</span>
                      </div>
                    )}

                     {menu.socials.website && (
                      <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-4 text-2xl font-bold opacity-80">
                           <Globe size={32} /> Website
                         </div>
                         <span className="text-2xl">{menu.socials.website.replace('https://','')}</span>
                      </div>
                    )}
                 </div>
               )}
               
               <div className="absolute bottom-8 text-center w-full opacity-40 text-lg uppercase tracking-widest">
                  Link in Bio
               </div>
           </div>
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
                style={{ ...getTypoStyle(brand.styles.sectionTitle, brand.primaryColor), fontSize: isPrint ? '4em' : undefined }}
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
                                style={getTypoStyle(brand.styles.itemName, item.highlight ? brand.accentColor : undefined)}
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
