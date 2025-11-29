import React from "react";
import { BrandProfile, FullMenu, TypographyStyle } from "../types";
import { Star } from "lucide-react";

interface DigitalMenuProps {
  menu: FullMenu;
  brand: BrandProfile;
  previewMode?: "mobile" | "desktop" | "print";
}

const DigitalMenu: React.FC<DigitalMenuProps> = ({ menu, brand, previewMode = "mobile" }) => {
  // Styles construction
  const containerStyle: React.CSSProperties = {
    backgroundColor: brand.backgroundColor,
    color: brand.textColor,
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100%',
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
    fontSize: `${style.scale}em`,
    color: colorOverride,
    display: 'block', // Ensure block for alignment
  });

  // Print adjustments
  const isPrint = previewMode === 'print';
  const gridClass = (previewMode === 'desktop' || isPrint) ? "grid grid-cols-2 gap-8 items-start" : "flex flex-col gap-6";

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
      <div className={`p-8 md:p-12 ${isPrint ? 'p-0' : ''}`} style={contentStyle}>
        
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
            {brand.logoUrl && (
                <div className="mx-auto mb-6 flex justify-center">
                    <div className={`
                        relative overflow-hidden
                        ${brand.logoStyle === 'circle' ? 'rounded-full' : ''}
                        ${brand.logoStyle === 'rounded' ? 'rounded-2xl' : ''}
                        ${brand.logoStyle !== 'original' ? 'w-24 h-24 bg-white/10 backdrop-blur-sm shadow-lg' : 'w-auto h-24'}
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
            style={{ color: brand.primaryColor }}
          >
            {menu.title}
          </h1>
          {menu.subtitle && (
            <p className="text-xl opacity-90 tracking-wide uppercase" style={{ color: brand.accentColor }}>
              {menu.subtitle}
            </p>
          )}
          {menu.fixedPrice && (
            <div 
              className="inline-block px-4 py-1.5 rounded border border-current mt-2"
              style={{ color: brand.accentColor, borderColor: brand.accentColor }}
            >
              <span className="text-sm font-bold uppercase tracking-wider">{menu.fixedPrice}</span>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className={gridClass}>
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
        {menu.footerNote && (
          <div className="mt-12 text-center text-sm opacity-70 border-t border-white/20 pt-6">
            {menu.footerNote}
          </div>
        )}

      </div>
    </div>
  );
};

export default DigitalMenu;