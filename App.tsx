import React, { useState, useEffect, useRef } from "react";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Onboarding from "./components/Onboarding";
import DigitalMenu from "./components/DigitalMenu";
import { AppState, FullMenu, BrandProfile } from "./types";
import { DEFAULT_BRAND, DEFAULT_MENU } from "./constants";
import { PenTool, Eye, Settings } from "lucide-react";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    // Load from LocalStorage
    const saved = localStorage.getItem("ai_menu_builder_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    return {
      menu: DEFAULT_MENU,
      brand: DEFAULT_BRAND,
      hasOnboarded: false
    };
  });

  // Mobile Navigation State
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isExporting, setIsExporting] = useState(false);
  
  // Carousel Export State
  const [carouselMode, setCarouselMode] = useState<{ active: boolean, slideType: 'cover' | 'section' | 'footer', sectionIndex?: number }>({ active: false, slideType: 'cover' });

  // Persistence
  useEffect(() => {
    localStorage.setItem("ai_menu_builder_state", JSON.stringify(appState));
  }, [appState]);

  // QR Code Generation
  useEffect(() => {
    if (window.QRious && appState.hasOnboarded) {
      const el = document.getElementById('qr-code-canvas');
      if (el) {
        new window.QRious({
          element: el,
          value: appState.menu.socials?.website || 'https://example.com/menu',
          size: 150,
          level: 'H'
        });
      }
    }
  });

  const handleOnboardingComplete = (menu: FullMenu, brand?: BrandProfile) => {
    setAppState(prev => ({
      ...prev,
      menu: menu,
      brand: brand || prev.brand,
      hasOnboarded: true
    }));
  };

  const handleReset = () => {
    if (confirm("Sei sicuro di voler ricominciare da zero? Tutti i dati andranno persi.")) {
      localStorage.removeItem("ai_menu_builder_state");
      window.location.reload();
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const handleExport = async (type: 'image' | 'html' | 'pdf' | 'carousel') => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 800)); // Wait longer for render/images

    if (type === 'html') {
      // Generate Standalone HTML
      // Serialize state for re-hydration
      const safeState = JSON.stringify(appState).replace(/</g, '\\u003c');
      
      const htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appState.menu.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&family=Open+Sans:wght@400;600&family=Merriweather:wght@300;700&family=Oswald:wght@400;700&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            'playfair': ['"Playfair Display"', 'serif'],
            'lato': ['"Lato"', 'sans-serif'],
            'opensans': ['"Open Sans"', 'sans-serif'],
            'merriweather': ['"Merriweather"', 'serif'],
            'oswald': ['"Oswald"', 'sans-serif'],
            'dancing': ['"Dancing Script"', 'cursive'],
          }
        }
      }
    }
  </script>
  <style>
    body { margin: 0; padding: 0; background: ${appState.brand.backgroundColor}; color: ${appState.brand.textColor}; }
    .rich-text b { font-weight: bold; } .rich-text i { font-style: italic; } .rich-text u { text-decoration: underline; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root">
    <!-- Static Render Fallback (Simplified) -->
    <div style="padding: 2rem; text-align: center;">
       <h1 style="font-size: 3rem; margin-bottom: 1rem; color: ${appState.brand.primaryColor}; font-family: ${appState.brand.fontTitle}, serif;">${appState.menu.title}</h1>
       <p style="font-size: 1.2rem; color: ${appState.brand.accentColor};">${appState.menu.subtitle || ''}</p>
       <div style="margin-top: 2rem;">
          ${appState.menu.sections.map(s => `
            <div style="margin-bottom: 2rem;">
               <h2 style="font-size: 1.5rem; border-bottom: 1px solid ${appState.brand.accentColor}; padding-bottom: 0.5rem; margin-bottom: 1rem; color: ${appState.brand.primaryColor};">${s.title}</h2>
               ${s.items.map(i => `
                 <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong style="color: ${i.highlight ? appState.brand.accentColor : 'inherit'}">${i.name}</strong>
                    <span>${i.price || ''}</span>
                 </div>
                 ${i.description ? `<div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1rem;">${i.description}</div>` : ''}
               `).join('')}
            </div>
          `).join('')}
       </div>
    </div>
  </div>
  <script>
    window.MENU_DATA = ${safeState};
    console.log("Menu Data Loaded", window.MENU_DATA);
  </script>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      downloadImage(url, `${appState.menu.title.replace(/\s+/g, '-').toLowerCase()}.html`);
      setIsExporting(false);
      return;
    }

    if (type === 'carousel' && window.html2canvas) {
      // Carousel Logic: Loop through parts
      const container = document.getElementById('export-container-carousel');
      if (!container) return;

      // 1. Cover
      setCarouselMode({ active: true, slideType: 'cover' });
      await new Promise(r => setTimeout(r, 400));
      const coverCanvas = await window.html2canvas(container, { useCORS: true, scale: 2 });
      downloadImage(coverCanvas.toDataURL('image/png'), '01-copertina.png');

      // 2. Sections
      for (let i = 0; i < appState.menu.sections.length; i++) {
        setCarouselMode({ active: true, slideType: 'section', sectionIndex: i });
        await new Promise(r => setTimeout(r, 400));
        const sectionCanvas = await window.html2canvas(container, { useCORS: true, scale: 2 });
        downloadImage(sectionCanvas.toDataURL('image/png'), `0${i + 2}-sezione-${i + 1}.png`);
      }

      // 3. Footer
      setCarouselMode({ active: true, slideType: 'footer' });
      await new Promise(r => setTimeout(r, 400));
      const footerCanvas = await window.html2canvas(container, { useCORS: true, scale: 2 });
      downloadImage(footerCanvas.toDataURL('image/png'), `99-contatti.png`);

      setCarouselMode({ active: false, slideType: 'cover' }); // Reset
      setIsExporting(false);
      return;
    }

    // Standard Single Image Export (Story or A4)
    const elementId = type === 'image' ? 'export-container-mobile' : 'export-container-a4';
    const element = document.getElementById(elementId);

    if (element && window.html2canvas) {
      try {
        const canvas = await window.html2canvas(element, { 
            useCORS: true, 
            scale: 2, 
            backgroundColor: appState.brand.backgroundColor
        });
        downloadImage(canvas.toDataURL('image/png'), `menu-export-${type === 'image' ? 'storia' : 'a4'}.png`);
      } catch (err) {
        console.error("Export failed", err);
        alert("Export fallito. Riprova.");
      }
    }
    setIsExporting(false);
  };

  if (!appState.hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden text-white font-sans selection:bg-indigo-500 selection:text-white bg-gray-950">
      
      {/* Loading Overlay */}
      {isExporting && (
        <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center flex-col gap-4 backdrop-blur-sm">
           <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-500/50"></div>
           <p className="font-bold text-xl animate-pulse">Generazione Export in corso...</p>
           <p className="text-sm text-gray-400">Stiamo creando le immagini ottimizzate per te.</p>
        </div>
      )}

      {/* --- DESKTOP LAYOUT --- */}
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        <Editor appState={appState} setAppState={setAppState} onExport={handleExport} onReset={handleReset} />
        <Preview appState={appState} />
      </div>

      {/* --- MOBILE LAYOUT --- */}
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile Header */}
        <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
           <span className="font-bold text-lg font-playfair bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Menu</span>
           <button onClick={handleReset} className="p-2 text-gray-400 hover:text-white" title="Ricomincia">
             <Settings size={20} />
           </button>
        </div>

        {/* Mobile Viewport Content */}
        <div className="flex-1 overflow-hidden relative">
           {mobileTab === 'editor' ? (
             <div className="h-full overflow-y-auto custom-scrollbar">
                <Editor appState={appState} setAppState={setAppState} onExport={handleExport} onReset={handleReset} isMobile={true} />
             </div>
           ) : (
             <div className="h-full bg-black/90 flex items-center justify-center p-4">
                <div className="w-full h-full max-w-[375px] bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10">
                   <div className="h-full overflow-y-auto custom-scrollbar">
                      <DigitalMenu menu={appState.menu} brand={appState.brand} previewMode="mobile" />
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="h-16 bg-gray-900 border-t border-gray-800 grid grid-cols-2 shrink-0 z-50 pb-safe">
           <button 
             onClick={() => setMobileTab('editor')}
             className={`flex flex-col items-center justify-center gap-1 transition-all ${mobileTab === 'editor' ? 'text-indigo-400 bg-gray-800/50' : 'text-gray-500'}`}
           >
             <PenTool size={20} />
             <span className="text-xs font-medium">Modifica</span>
           </button>
           <button 
             onClick={() => setMobileTab('preview')}
             className={`flex flex-col items-center justify-center gap-1 transition-all ${mobileTab === 'preview' ? 'text-indigo-400 bg-gray-800/50' : 'text-gray-500'}`}
           >
             <Eye size={20} />
             <span className="text-xs font-medium">Anteprima</span>
           </button>
        </div>
      </div>

      {/* --- HIDDEN EXPORT CONTAINERS --- */}
      <div className="fixed left-[9999px] top-0 pointer-events-none">
         {/* Mobile Story Export */}
         <div id="export-container-mobile" style={{ width: '1080px', height: '1920px' }}>
            <DigitalMenu menu={appState.menu} brand={appState.brand} previewMode="mobile" scale={2.88} /> 
         </div>
         {/* A4 Export */}
         <div id="export-container-a4" style={{ width: '2480px', height: '3508px' }}> 
            <DigitalMenu menu={appState.menu} brand={appState.brand} previewMode="print" scale={3} />
         </div>
         {/* Carousel Export (Instagram Portrait 4:5 - 1080x1350) */}
         <div id="export-container-carousel" style={{ width: '1080px', height: '1350px' }}>
            <DigitalMenu 
              menu={appState.menu} 
              brand={appState.brand} 
              previewMode="mobile" 
              scale={2}
              carouselMode={carouselMode}
            />
         </div>
      </div>
    </div>
  );
};

export default App;