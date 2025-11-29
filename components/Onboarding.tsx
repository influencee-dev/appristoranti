import React, { useState } from "react";
import { FileText, Edit3, ArrowRight, Wand2, Palette, ChefHat, SkipForward } from "lucide-react";
import { parseMenuText } from "../services/menuParser";
import { FullMenu, BrandProfile, ThemePreset } from "../types";
import { PRESET_CATEGORIES, DEFAULT_BRAND } from "../constants";

interface OnboardingProps {
  onComplete: (menu: FullMenu, brand?: BrandProfile) => void;
}

type Step = 'choice' | 'import' | 'magic-intro' | 'wizard-type' | 'wizard-vibe';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('choice');
  const [text, setText] = useState("");
  
  // Staging data used during the wizard
  const [parsedMenu, setParsedMenu] = useState<FullMenu | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  
  // --- Handlers ---

  const handleManualStart = () => {
    const defaultMenu: FullMenu = {
        title: "Nuovo Menù",
        sections: [{ id: "1", title: "Antipasti", items: [{ id: "1", name: "Piatto Esempio", price: "10€" }]}]
    };
    onComplete(defaultMenu);
  };

  const handleParseAndProceed = () => {
    if (!text.trim()) return;
    const menu = parseMenuText(text);
    setParsedMenu(menu);
    setStep('magic-intro');
  };

  const skipMagic = () => {
    if (parsedMenu) {
      onComplete(parsedMenu);
    }
  };

  const handleRestaurantSelect = (presetId: string) => {
    setSelectedRestaurantId(presetId);
    setStep('wizard-vibe');
  };

  const handleVibeSelect = (vibePresetId: string | 'none') => {
    if (!parsedMenu) return;

    // 1. Start with Default
    let finalBrand: BrandProfile = { ...DEFAULT_BRAND };

    // 2. Apply Restaurant Preset (Structure & Fonts)
    const restaurantCategory = PRESET_CATEGORIES.find(c => c.id === 'restaurants');
    const restaurantPreset = restaurantCategory?.presets.find(p => p.id === selectedRestaurantId);

    if (restaurantPreset && restaurantPreset.brand) {
        finalBrand = { ...finalBrand, ...restaurantPreset.brand };
        // Ensure styles object is merged correctly (deep merge for styles)
        if (restaurantPreset.brand.styles) {
            finalBrand.styles = { ...finalBrand.styles, ...restaurantPreset.brand.styles };
        }
    }

    // 3. Apply Vibe Preset (Colors & Backgrounds ONLY)
    // We intentionally keep fonts and layout from the restaurant type
    let vibePreset: ThemePreset | undefined;
    if (vibePresetId !== 'none') {
        const seasonCategory = PRESET_CATEGORIES.find(c => c.id === 'seasons');
        const eventCategory = PRESET_CATEGORIES.find(c => c.id === 'events');
        vibePreset = seasonCategory?.presets.find(p => p.id === vibePresetId) || 
                     eventCategory?.presets.find(p => p.id === vibePresetId);
    }

    if (vibePreset && vibePreset.brand) {
        const vb = vibePreset.brand;
        // Override only visual properties, not typography structure
        if (vb.primaryColor) finalBrand.primaryColor = vb.primaryColor;
        if (vb.accentColor) finalBrand.accentColor = vb.accentColor;
        if (vb.backgroundColor) finalBrand.backgroundColor = vb.backgroundColor;
        if (vb.textColor) finalBrand.textColor = vb.textColor;
        if (vb.backgroundImageUrl) finalBrand.backgroundImageUrl = vb.backgroundImageUrl;
        if (vb.overlayMode) finalBrand.overlayMode = vb.overlayMode;
        if (vb.overlayColor) finalBrand.overlayColor = vb.overlayColor;
        if (vb.overlayOpacity !== undefined) finalBrand.overlayOpacity = vb.overlayOpacity;
    }

    onComplete(parsedMenu, finalBrand);
  };

  // --- Render Helpers ---

  const renderRestaurantGrid = () => {
    const restaurants = PRESET_CATEGORIES.find(c => c.id === 'restaurants')?.presets || [];
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {restaurants.map(p => (
          <button
            key={p.id}
            onClick={() => handleRestaurantSelect(p.id)}
            className="p-4 bg-gray-700/50 hover:bg-indigo-600/20 border border-gray-600 hover:border-indigo-500 rounded-xl transition-all group flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 group-hover:bg-indigo-500 transition-colors">
               <ChefHat size={20} className="text-gray-300 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-white">{p.name}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderVibeGrid = () => {
    const seasons = PRESET_CATEGORIES.find(c => c.id === 'seasons')?.presets || [];
    const events = PRESET_CATEGORIES.find(c => c.id === 'events')?.presets || [];
    const allVibes = [...seasons, ...events];

    return (
      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
         <button
            onClick={() => handleVibeSelect('none')}
            className="w-full p-4 mb-2 bg-gray-700/30 border border-gray-600 border-dashed rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <SkipForward size={18} /> Nessuno stile particolare (Usa standard)
          </button>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allVibes.map(p => (
              <button
                key={p.id}
                onClick={() => handleVibeSelect(p.id)}
                className="p-3 bg-gray-700/50 hover:bg-pink-600/20 border border-gray-600 hover:border-pink-500 rounded-xl transition-all group flex flex-col items-center gap-2 text-center"
              >
                {/* Mini color preview */}
                <div className="flex gap-1 mb-1 justify-center">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.brand?.backgroundColor }}></div>
                    <div className="w-2 h-2 rounded-full" style={{ background: p.brand?.primaryColor }}></div>
                    <div className="w-2 h-2 rounded-full" style={{ background: p.brand?.accentColor }}></div>
                </div>
                <span className="text-xs font-bold text-gray-300 group-hover:text-white">{p.name}</span>
              </button>
            ))}
         </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 relative">
        
        <div className="p-8 md:p-12 text-center">
          
          {/* Header */}
          {(step === 'choice' || step === 'import') && (
            <>
                <h1 className="text-4xl font-bold text-white mb-4 font-playfair">AI Menu Builder</h1>
                <p className="text-gray-400 mb-8">Crea menù digitali, locandine e post social in pochi minuti.</p>
            </>
          )}

          {/* STEP 1: INITIAL CHOICE */}
          {step === 'choice' && (
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
              <button 
                onClick={() => setStep('import')}
                className="group p-6 bg-indigo-900/30 border border-indigo-500/30 rounded-xl hover:bg-indigo-900/50 hover:border-indigo-500 transition-all text-left"
              >
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Importa Testo</h3>
                <p className="text-sm text-gray-400">Incolla il testo del menù da WhatsApp o Word. Noi lo formatteremo.</p>
              </button>

              <button 
                onClick={handleManualStart}
                className="group p-6 bg-gray-700/30 border border-gray-600/30 rounded-xl hover:bg-gray-700/50 hover:border-gray-500 transition-all text-left"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                  <Edit3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Crea da Zero</h3>
                <p className="text-sm text-gray-400">Usa un template vuoto e inserisci i piatti manualmente.</p>
              </button>
            </div>
          )}

          {/* STEP 2: TEXT INPUT */}
          {step === 'import' && (
             <div className="text-left animate-in fade-in slide-in-from-right-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Incolla testo del Menù</label>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="ANTIPASTI&#10;Bruschetta - 5€&#10;Caprese - 8€&#10;&#10;PRIMI&#10;Carbonara - 12€"
                  className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                ></textarea>
                <div className="mt-6 flex justify-between">
                   <button 
                    onClick={() => setStep('choice')}
                    className="text-gray-400 hover:text-white px-4 py-2"
                   >Indietro</button>
                   <button 
                    onClick={handleParseAndProceed}
                    disabled={!text.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Avanti <ArrowRight size={18} />
                   </button>
                </div>
             </div>
          )}

          {/* STEP 3: MAGIC CHOICE */}
          {step === 'magic-intro' && (
            <div className="animate-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Wand2 size={32} className="text-white" />
               </div>
               <h2 className="text-3xl font-bold text-white mb-2">Configurazione Magica?</h2>
               <p className="text-gray-400 mb-8 max-w-md mx-auto">
                 Posso suggerirti lo stile perfetto per il tuo locale. Ci vorrà solo un istante.
               </p>
               
               <div className="grid gap-4 max-w-md mx-auto">
                 <button 
                   onClick={() => setStep('wizard-type')}
                   className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02]"
                 >
                   <Wand2 size={20} /> Consigliami Tu
                 </button>
                 <button 
                   onClick={skipMagic}
                   className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium text-gray-300 hover:text-white transition-all"
                 >
                   No, imposto io manualmente
                 </button>
               </div>
            </div>
          )}

          {/* WIZARD 1: RESTAURANT TYPE */}
          {step === 'wizard-type' && (
             <div className="animate-in slide-in-from-right-8 duration-300 text-left">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ChefHat className="text-indigo-400" /> Che tipo di locale è?
                    </h2>
                    <p className="text-gray-400 text-sm">Scegli lo stile che più si avvicina al tuo ristorante. Questo definirà i font e la struttura.</p>
                </div>
                {renderRestaurantGrid()}
             </div>
          )}

          {/* WIZARD 2: VIBE / EVENT */}
          {step === 'wizard-vibe' && (
             <div className="animate-in slide-in-from-right-8 duration-300 text-left">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Palette className="text-pink-400" /> C'è un'occasione speciale?
                    </h2>
                    <p className="text-gray-400 text-sm">Seleziona un evento o una stagione per applicare colori e sfondi a tema.</p>
                </div>
                {renderVibeGrid()}
             </div>
          )}

        </div>
        
        {/* Progress Bar for Wizard */}
        {(step === 'wizard-type' || step === 'wizard-vibe') && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: step === 'wizard-type' ? '50%' : '90%' }}
                ></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;