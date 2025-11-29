import React, { useState, useRef } from "react";
import { AppState, BrandProfile, FullMenu, TypographyStyle } from "../types";
import { PRESET_CATEGORIES, FONTS, COLOR_PALETTES, BACKGROUND_PRESETS } from "../constants";
import { 
  Palette, Type, Layout, Image as ImageIcon, 
  Trash2, Plus, GripVertical, Download, 
  Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight, Underline, Type as TypeIcon, Minus, Plus as PlusIcon, ChevronDown, ChevronRight,
  AlertCircle, Copy, Instagram, Globe, Phone, Music, Grid, Settings, Layers, Code, Smartphone, Check
} from "lucide-react";

interface EditorProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onExport: (type: 'image' | 'html' | 'pdf' | 'carousel') => void;
  onReset?: () => void;
  isMobile?: boolean;
}

const Editor: React.FC<EditorProps> = ({ appState, setAppState, onExport, onReset, isMobile = false }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'export'>('content');
  const [draggableId, setDraggableId] = useState<string | null>(null);
  const [openPresetCategory, setOpenPresetCategory] = useState<string | null>("restaurants");
  const [showBgGallery, setShowBgGallery] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  // State for Typography Builder
  const [typoTarget, setTypoTarget] = useState<keyof BrandProfile['styles']>('sectionTitle');

  const dragSectionNode = useRef<number | null>(null);
  const dragItemNode = useRef<{ sIdx: number; iIdx: number } | null>(null);
  
  // -- Update Helpers (Menu & Brand) --
  const updateMenu = (updater: (m: FullMenu) => void) => {
    setAppState(prev => {
      const newMenu = { ...prev.menu };
      newMenu.sections = prev.menu.sections.map(s => ({...s, items: [...s.items.map(i => ({...i}))] }));
      newMenu.socials = prev.menu.socials ? {...prev.menu.socials} : {};
      updater(newMenu);
      return { ...prev, menu: newMenu };
    });
  };

  const updateBrand = (updater: (b: BrandProfile) => void) => {
    setAppState(prev => {
      const newBrand = { ...prev.brand };
      newBrand.styles = { ...prev.brand.styles }; // Shallow copy styles keys
      // Deep copy specific style objects to avoid mutation issues
      newBrand.styles.sectionTitle = { ...prev.brand.styles.sectionTitle };
      newBrand.styles.itemName = { ...prev.brand.styles.itemName };
      newBrand.styles.itemDescription = { ...prev.brand.styles.itemDescription };
      newBrand.styles.price = { ...prev.brand.styles.price };
      
      updater(newBrand);
      return { ...prev, brand: newBrand };
    });
  };

  const updateTypo = (target: keyof BrandProfile['styles'], key: keyof TypographyStyle, value: any) => {
      updateBrand(b => {
          // @ts-ignore
          b.styles[target][key] = value;
      });
  };

  const toggleSectionCollapse = (id: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
      return newSet;
    });
  };

  const handleSectionAdd = () => {
    updateMenu(m => m.sections.push({ id: Math.random().toString(), title: "Nuova Sezione", items: [] }));
  };

  const handleDuplicateSection = (index: number) => {
    updateMenu(m => {
      const original = m.sections[index];
      const copy = { ...original, id: Math.random().toString(), title: `${original.title} (Copia)`, items: original.items.map(i => ({...i, id: Math.random().toString()})) };
      m.sections.splice(index + 1, 0, copy);
    });
  };

  const handleItemAdd = (sectionIndex: number) => {
    updateMenu(m => m.sections[sectionIndex].items.push({ id: Math.random().toString(), name: "Nuovo Piatto", price: "10€", description: "" }));
  };

  // --- Drag Logic ---
  const handleDragStartSection = (e: React.DragEvent, index: number) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') { e.preventDefault(); return; }
    dragSectionNode.current = index;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnterSection = (e: React.DragEvent, index: number) => {
    if (dragSectionNode.current !== null && dragSectionNode.current !== index) {
        updateMenu(m => {
            const section = m.sections[dragSectionNode.current!];
            m.sections.splice(dragSectionNode.current!, 1);
            m.sections.splice(index, 0, section);
        });
        dragSectionNode.current = index;
    }
  };
  const handleDragEndSection = () => { dragSectionNode.current = null; setDraggableId(null); };

  const handleDragStartItem = (e: React.DragEvent, sIdx: number, iIdx: number) => {
    e.stopPropagation();
    dragItemNode.current = { sIdx, iIdx };
  };
  const handleDragEnterItem = (e: React.DragEvent, sIdx: number, iIdx: number) => {
    e.stopPropagation();
    if (!dragItemNode.current) return;
    const { sIdx: srcSIdx, iIdx: srcIIdx } = dragItemNode.current;
    if (srcSIdx === sIdx && srcIIdx === iIdx) return;
    updateMenu(m => {
        const [item] = m.sections[srcSIdx].items.splice(srcIIdx, 1);
        m.sections[sIdx].items.splice(iIdx, 0, item);
    });
    dragItemNode.current = { sIdx, iIdx };
  };
  const handleDragEndItem = () => { dragItemNode.current = null; setDraggableId(null); };

  // --- Render ---
  return (
    <div className={`flex flex-col h-full bg-gray-900 border-r border-gray-800 shrink-0 z-20 shadow-2xl ${isMobile ? 'w-full' : 'w-[450px]'}`}>
      
      {/* Desktop Header with Reset */}
      {!isMobile && (
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800">
           <span className="font-bold text-lg font-playfair text-white">AI Menu Builder</span>
           <button onClick={onReset} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Resetta tutto">
             <Settings size={20} />
           </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button onClick={() => setActiveTab('content')} className={`flex-1 p-4 flex flex-col md:flex-row items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'content' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}>
          <Type size={18} /> <span className="hidden md:inline">Contenuto</span>
        </button>
        <button onClick={() => setActiveTab('style')} className={`flex-1 p-4 flex flex-col md:flex-row items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'style' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}>
          <Palette size={18} /> <span className="hidden md:inline">Stile</span>
        </button>
        <button onClick={() => setActiveTab('export')} className={`flex-1 p-4 flex flex-col md:flex-row items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'export' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}>
          <Download size={18} /> <span className="hidden md:inline">Esporta</span>
        </button>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-8">
        
        {/* --- CONTENT TAB --- */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Intestazione</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Titolo Menù</label>
                <input type="text" value={appState.menu.title} onChange={(e) => updateMenu(m => m.title = e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sottotitolo</label>
                <input type="text" value={appState.menu.subtitle || ''} onChange={(e) => updateMenu(m => m.subtitle = e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prezzo Fisso</label>
                <input type="text" value={appState.menu.fixedPrice || ''} onChange={(e) => updateMenu(m => m.fixedPrice = e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none text-white" placeholder="Es. 35€" />
              </div>
            </div>

            <div className="space-y-4">
               {appState.menu.sections.map((section, sIdx) => (
                 <div key={section.id} className={`bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden transition-opacity ${dragSectionNode.current === sIdx ? 'opacity-50 border-dashed border-indigo-500' : ''}`} draggable={!isMobile} onDragStart={(e) => handleDragStartSection(e, sIdx)} onDragEnter={(e) => handleDragEnterSection(e, sIdx)} onDragEnd={handleDragEndSection} onDragOver={e => e.preventDefault()}>
                   <div className="p-3 bg-gray-800/80 flex items-center gap-2">
                     {!isMobile && <div className="cursor-grab text-gray-600 p-1"><GripVertical size={16} /></div>}
                     <button onClick={() => toggleSectionCollapse(section.id)} className="text-gray-400 p-1">{collapsedSections.has(section.id) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}</button>
                     <input type="text" value={section.title} onChange={(e) => updateMenu(m => m.sections[sIdx].title = e.target.value)} className="bg-transparent font-bold text-white w-full outline-none" />
                     <button onClick={() => handleDuplicateSection(sIdx)} className="text-gray-500 hover:text-indigo-400 p-1"><Copy size={16} /></button>
                     <button onClick={() => updateMenu(m => m.sections.splice(sIdx, 1))} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                   </div>
                   {!collapsedSections.has(section.id) && (
                     <div className="p-3 space-y-3 border-t border-gray-700/50">
                        {section.items.map((item, iIdx) => (
                          <div key={item.id} className="flex items-start gap-2 pl-2 border-l-2 border-gray-700 hover:border-indigo-500 transition-colors" draggable={!isMobile} onDragStart={(e) => handleDragStartItem(e, sIdx, iIdx)} onDragEnter={(e) => handleDragEnterItem(e, sIdx, iIdx)} onDragEnd={handleDragEndItem} onDragOver={e => e.preventDefault()}>
                            <div className="w-full">
                                <div className="flex gap-2 mb-1">
                                  <input type="text" value={item.name} onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].name = e.target.value)} className="bg-transparent text-sm w-full font-medium outline-none text-white" placeholder="Piatto" />
                                  <input type="text" value={item.price || ''} onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].price = e.target.value)} className="bg-transparent text-sm w-16 text-right text-indigo-300 outline-none" placeholder="€" />
                                </div>
                                <textarea value={item.description || ''} onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].description = e.target.value)} className="w-full bg-transparent text-xs text-gray-400 outline-none resize-y min-h-[40px]" placeholder="Descrizione" rows={2} />
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer"><input type="checkbox" checked={item.highlight || false} onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].highlight = e.target.checked)} className="rounded bg-gray-700 border-gray-600 text-indigo-500" /> Top</label>
                                        <div className="flex items-center gap-1 border-l border-gray-700 pl-3">
                                           <AlertCircle size={12} className="text-gray-500" />
                                           <input type="text" value={item.allergens || ''} onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].allergens = e.target.value)} placeholder="Allergeni" className="bg-transparent text-xs text-gray-400 outline-none w-20" />
                                        </div>
                                    </div>
                                    <button onClick={() => updateMenu(m => m.sections[sIdx].items.splice(iIdx, 1))} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
                                </div>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => handleItemAdd(sIdx)} className="w-full py-2 border border-dashed border-gray-700 rounded text-xs text-gray-500 hover:text-white flex items-center justify-center gap-1"><Plus size={12} /> Aggiungi Piatto</button>
                     </div>
                   )}
                 </div>
               ))}
               <button onClick={handleSectionAdd} className="w-full py-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-indigo-500 flex items-center justify-center gap-2 font-medium"><Plus size={20} /> Nuova Sezione</button>
            </div>
            
            {/* Contacts */}
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Phone size={14} /> Contatti (Footer)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" value={appState.menu.socials?.companyName || ''} onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.companyName = e.target.value })} className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Nome Azienda" />
                  <input type="text" value={appState.menu.socials?.phone || ''} onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.phone = e.target.value })} className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Telefono" />
                  <input type="text" value={appState.menu.socials?.instagram || ''} onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.instagram = e.target.value })} className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Instagram (@...)" />
                  <input type="text" value={appState.menu.socials?.website || ''} onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.website = e.target.value })} className="bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Sito Web" />
               </div>
            </div>
          </div>
        )}

        {/* --- STYLE TAB --- */}
        {activeTab === 'style' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Presets */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preset Veloci</h3>
              {PRESET_CATEGORIES.map(category => (
                <div key={category.id} className="border border-gray-700 rounded-lg overflow-hidden">
                   <button onClick={() => setOpenPresetCategory(openPresetCategory === category.id ? null : category.id)} className="w-full p-3 bg-gray-800 flex justify-between items-center text-gray-300 font-bold text-sm">
                     {category.title} {openPresetCategory === category.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                   </button>
                   {openPresetCategory === category.id && (
                     <div className="p-2 grid grid-cols-2 gap-2 bg-gray-900/50">
                        {category.presets.map(preset => (
                          <button key={preset.id} onClick={() => updateBrand(b => Object.assign(b, preset.brand))} className="p-3 rounded border border-gray-700 bg-gray-800 text-left hover:border-indigo-500 transition-all">
                            <div className="text-xs font-bold text-white">{preset.name}</div>
                            <div className="flex gap-1 mt-2">
                              <div className="w-3 h-3 rounded-full" style={{background: preset.brand.backgroundColor}}></div>
                              <div className="w-3 h-3 rounded-full" style={{background: preset.brand.primaryColor}}></div>
                            </div>
                          </button>
                        ))}
                     </div>
                   )}
                </div>
              ))}
            </div>

            <hr className="border-gray-800" />

            {/* Images & Overlay */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Immagini & Overlay</h3>
                <div className="p-3 bg-gray-800/50 rounded border border-gray-700 space-y-4">
                   <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded text-center">
                         Carica Foto <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) updateBrand(b => b.backgroundImageUrl = URL.createObjectURL(e.target.files![0])) }} />
                      </label>
                      <button onClick={() => setShowBgGallery(!showBgGallery)} className="flex-1 bg-indigo-600 text-white text-xs px-3 py-2 rounded flex items-center justify-center gap-2"><Grid size={14} /> Galleria</button>
                   </div>
                   
                   {/* Background Gallery */}
                   {showBgGallery && (
                     <div className="bg-gray-900 border border-gray-700 rounded p-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {BACKGROUND_PRESETS.map((cat) => (
                          <div key={cat.category} className="mb-2">
                             <div className="text-xs font-bold text-gray-400 mb-1">{cat.category}</div>
                             <div className="grid grid-cols-3 gap-2">
                                  {cat.images.map((img, idx) => (
                                    <button key={idx} onClick={() => updateBrand(b => b.backgroundImageUrl = img)} className="aspect-[2/3] rounded overflow-hidden border border-transparent hover:border-indigo-500 relative">
                                      <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                             </div>
                          </div>
                        ))}
                     </div>
                   )}

                   {/* OVERLAY CONTROLS - RESTORED */}
                   <div className="pt-2 border-t border-gray-700/50 space-y-3">
                        <label className="text-xs text-gray-400 font-bold block">Overlay (Leggibilità Testo)</label>
                        <div className="flex gap-2 text-xs">
                           <button onClick={() => updateBrand(b => b.overlayMode = 'solid')} className={`flex-1 py-1.5 rounded transition-colors ${appState.brand.overlayMode === 'solid' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Solido</button>
                           <button onClick={() => updateBrand(b => b.overlayMode = 'gradient')} className={`flex-1 py-1.5 rounded transition-colors ${appState.brand.overlayMode === 'gradient' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Sfumato</button>
                        </div>
                        <div className="flex items-center gap-3">
                           <input type="color" value={appState.brand.overlayColor} onChange={(e) => updateBrand(b => b.overlayColor = e.target.value)} className="h-8 w-10 bg-transparent cursor-pointer rounded" />
                           <div className="flex-1 flex flex-col gap-1">
                              <div className="flex justify-between text-[10px] text-gray-400"><span>Trasparente</span><span>Coprente</span></div>
                              <input type="range" min="0" max="1" step="0.1" value={appState.brand.overlayOpacity} onChange={(e) => updateBrand(b => b.overlayOpacity = parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                           </div>
                        </div>
                   </div>
                </div>
            </div>
            
            <hr className="border-gray-800" />

            {/* Colors */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Colori Base</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Primario (Titoli)</label>
                    <input type="color" value={appState.brand.primaryColor} onChange={(e) => updateBrand(b => b.primaryColor = e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Sfondo Pagina</label>
                    <input type="color" value={appState.brand.backgroundColor} onChange={(e) => updateBrand(b => b.backgroundColor = e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" />
                 </div>
               </div>
            </div>

            <hr className="border-gray-800" />

            {/* TYPOGRAPHY BUILDER - RESTORED */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                 <TypeIcon size={14} /> Tipografia Avanzata
               </h3>
               
               {/* Target Selector */}
               <div className="flex bg-gray-800 p-1 rounded-lg gap-1 overflow-x-auto">
                 {[
                   { id: 'sectionTitle', label: 'Titoli Sezione' },
                   { id: 'itemName', label: 'Nomi Piatti' },
                   { id: 'itemDescription', label: 'Descrizioni' },
                   { id: 'price', label: 'Prezzi' }
                 ].map((t) => (
                   <button 
                     key={t.id} 
                     onClick={() => setTypoTarget(t.id as any)}
                     className={`flex-1 py-1.5 px-2 text-xs font-medium rounded whitespace-nowrap transition-colors ${typoTarget === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                   >
                     {t.label}
                   </button>
                 ))}
               </div>

               {/* Controls for Selected Target */}
               <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                  {/* Font Family */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Font</label>
                    <select 
                      // @ts-ignore
                      value={appState.brand[typoTarget === 'sectionTitle' ? 'fontTitle' : 'fontBody']} // Simplification: actually BrandProfile splits fonts differently, but for custom styling we might want to override. 
                      // For now, let's keep basic global fonts or implement specific overrides.
                      // To keep it simple and consistent with previous logic, we use the global fonts logic but applied here for display, 
                      // or better: let's allow changing the GLOBAL font that affects this target.
                      // Actually, the app separates fontTitle and fontBody.
                      onChange={(e) => {
                         const val = e.target.value;
                         if (typoTarget === 'sectionTitle') updateBrand(b => b.fontTitle = val);
                         else updateBrand(b => b.fontBody = val);
                      }}
                      className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded p-2 outline-none"
                    >
                      {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">Nota: Titoli usa Font Titolo, altri usano Font Corpo.</p>
                  </div>

                  {/* Toggles Row */}
                  <div className="flex justify-between items-center">
                     <div className="flex bg-gray-900 rounded border border-gray-700 overflow-hidden">
                        <button onClick={() => updateTypo(typoTarget, 'bold', !appState.brand.styles[typoTarget].bold)} className={`p-2 hover:bg-gray-700 ${appState.brand.styles[typoTarget].bold ? 'text-indigo-400 bg-gray-800' : 'text-gray-400'}`}><Bold size={16} /></button>
                        <button onClick={() => updateTypo(typoTarget, 'italic', !appState.brand.styles[typoTarget].italic)} className={`p-2 hover:bg-gray-700 border-l border-gray-700 ${appState.brand.styles[typoTarget].italic ? 'text-indigo-400 bg-gray-800' : 'text-gray-400'}`}><Italic size={16} /></button>
                        <button onClick={() => updateTypo(typoTarget, 'underline', !appState.brand.styles[typoTarget].underline)} className={`p-2 hover:bg-gray-700 border-l border-gray-700 ${appState.brand.styles[typoTarget].underline ? 'text-indigo-400 bg-gray-800' : 'text-gray-400'}`}><Underline size={16} /></button>
                        <button onClick={() => updateTypo(typoTarget, 'uppercase', !appState.brand.styles[typoTarget].uppercase)} className={`p-2 hover:bg-gray-700 border-l border-gray-700 ${appState.brand.styles[typoTarget].uppercase ? 'text-indigo-400 bg-gray-800' : 'text-gray-400'}`}><TypeIcon size={16} /></button>
                     </div>
                     
                     <div className="flex bg-gray-900 rounded border border-gray-700 overflow-hidden">
                        <button onClick={() => updateTypo(typoTarget, 'align', 'left')} className={`p-2 hover:bg-gray-700 ${appState.brand.styles[typoTarget].align === 'left' ? 'text-indigo-400 bg-gray-800' : 'text-gray-400'}`}><AlignLeft size={16} /></button>
                        <button onClick={() => updateTypo(typoTarget, 'align', 'center')} className={`p-2 hover:bg-gray-700 border-l border-gray-700 ${appState.brand.styles[typoTarget].align === 'center' ? 'text-indigo-400 bg-gray-800' : 'text-gray-400'}`}><AlignCenter size={16} /></button>
                        <button onClick={() => updateTypo(typoTarget, 'align', 'right')} className={`p-2 hover:bg-gray-700 border-l border-gray-700 ${appState.brand.styles[typoTarget].align === 'right' ? 'text-indigo-400 bg-gray-800' : 'text-gray-400'}`}><AlignRight size={16} /></button>
                     </div>
                  </div>

                  {/* Scale Slider */}
                  <div>
                     <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Dimensione</span>
                        <span>{appState.brand.styles[typoTarget].scale.toFixed(1)}x</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => updateTypo(typoTarget, 'scale', Math.max(0.5, appState.brand.styles[typoTarget].scale - 0.1))} className="text-gray-500 hover:text-white"><Minus size={14} /></button>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="3" 
                          step="0.1" 
                          value={appState.brand.styles[typoTarget].scale} 
                          onChange={(e) => updateTypo(typoTarget, 'scale', parseFloat(e.target.value))}
                          className="flex-1 accent-indigo-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                        />
                        <button onClick={() => updateTypo(typoTarget, 'scale', Math.min(3, appState.brand.styles[typoTarget].scale + 0.1))} className="text-gray-500 hover:text-white"><PlusIcon size={14} /></button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- EXPORT TAB --- */}
        {activeTab === 'export' && (
           <div className="space-y-4 animate-in fade-in duration-300">
              <button onClick={() => onExport('image')} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 text-left flex items-center gap-4 transition-all group">
                 <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><Smartphone size={24} /></div>
                 <div><h3 className="font-bold text-white">Storia Instagram</h3><p className="text-xs text-gray-400">Immagine verticale singola.</p></div>
              </button>

              <button onClick={() => onExport('carousel')} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 text-left flex items-center gap-4 transition-all group">
                 <div className="w-12 h-12 bg-pink-900/50 rounded-full flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform"><Layers size={24} /></div>
                 <div><h3 className="font-bold text-white">Carosello Instagram</h3><p className="text-xs text-gray-400">Genera multiple immagini quadrate (Copertina, Sezioni, Contatti).</p></div>
              </button>
              
              <button onClick={() => onExport('html')} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 text-left flex items-center gap-4 transition-all group">
                 <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform"><Code size={24} /></div>
                 <div><h3 className="font-bold text-white">Sito Web HTML</h3><p className="text-xs text-gray-400">Scarica un file .html da caricare sul tuo sito.</p></div>
              </button>

              <button onClick={() => onExport('pdf')} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 text-left flex items-center gap-4 transition-all group">
                 <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform"><Layout size={24} /></div>
                 <div><h3 className="font-bold text-white">Stampa A4</h3><p className="text-xs text-gray-400">Alta risoluzione per stampanti.</p></div>
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default Editor;