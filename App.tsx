import React, { useState, useEffect, useRef } from "react";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Onboarding from "./components/Onboarding";
import DigitalMenu from "./components/DigitalMenu";
import { AppState, FullMenu, BrandProfile } from "./types";
import { DEFAULT_BRAND, DEFAULT_MENU } from "./constants";

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

  const [isExporting, setIsExporting] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem("ai_menu_builder_state", JSON.stringify(appState));
  }, [appState]);

  // QR Code Generation
  useEffect(() => {
    if (window.QRious && appState.hasOnboarded) {
      // Just for demo purposes, we link to a placeholder URL
      const qr = new window.QRious({
        element: document.getElementById('qr-code-canvas'),
        value: 'https://example.com/menu', // In a real app this would be the hosted link
        size: 150,
        level: 'H'
      });
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

  const handleExport = async (type: 'image' | 'html' | 'pdf') => {
    setIsExporting(true);
    
    // We need to render a specific hidden element for capture
    // However, for this demo, we will capture the hidden off-screen export container
    // wait for render
    await new Promise(r => setTimeout(r, 500));

    const elementId = type === 'image' ? 'export-container-mobile' : 'export-container-a4';
    const element = document.getElementById(elementId);

    if (element && window.html2canvas) {
      try {
        if (type === 'html') {
          // Generate standalone HTML
          // We serialize the state into the script tag of the current template
          alert("Logica di export HTML: Genererebbe un file scaricabile. Per questa demo, prova l'export Immagine.");
        } else {
            const canvas = await window.html2canvas(element, { 
                useCORS: true, 
                scale: 2, // Retina quality
                backgroundColor: null // Transparent if needed, but DigitalMenu has bg
            });
            
            const link = document.createElement('a');
            link.download = `menu-export-${type === 'image' ? 'storia' : 'a4'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
      } catch (err) {
        console.error("Export failed", err);
        alert("Export fallito. Controlla la console.");
      }
    }
    setIsExporting(false);
  };

  if (!appState.hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden text-white font-sans selection:bg-indigo-500 selection:text-white">
      {isExporting && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center flex-col gap-4">
           <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="font-bold text-xl">Generazione file alta qualità in corso...</p>
        </div>
      )}

      {/* Main Layout */}
      <Editor appState={appState} setAppState={setAppState} onExport={handleExport} />
      <Preview appState={appState} />

      {/* Hidden Export Containers */}
      <div className="fixed left-[9999px] top-0">
         {/* Mobile Story Export (1080x1920 scaled down or natural) */}
         <div id="export-container-mobile" style={{ width: '375px', height: '667px' }}>
            <DigitalMenu menu={appState.menu} brand={appState.brand} previewMode="mobile" />
         </div>
         {/* A4 Export (approx 794px x 1123px at 96dpi) */}
         <div id="export-container-a4" style={{ width: '794px', height: '1123px' }}>
            <DigitalMenu menu={appState.menu} brand={appState.brand} previewMode="print" />
         </div>
      </div>
    </div>
  );
};

export default App;