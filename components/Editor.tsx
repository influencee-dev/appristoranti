
import React, { useState, useRef } from "react";
import { AppState, BrandProfile, FullMenu, TypographyStyle } from "../types";
import { PRESET_CATEGORIES, FONTS, COLOR_PALETTES, BACKGROUND_PRESETS } from "../constants";
import { 
  Palette, Type, Layout, Image as ImageIcon, 
  Trash2, Plus, GripVertical, Download, 
  Settings, Smartphone, Monitor, Printer,
  Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight, Underline, Type as TypeIcon, Minus, Plus as PlusIcon, ChevronDown, ChevronRight,
  AlertCircle, Copy, Instagram, Globe, Phone, Music, Grid
} from "lucide-react";

interface EditorProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onExport: (type: 'image' | 'html' | 'pdf') => void;
}

const Editor: React.FC<EditorProps> = ({ appState, setAppState, onExport }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'export'>('content');
  const [draggableId, setDraggableId] = useState<string | null>(null);
  const [openPresetCategory, setOpenPresetCategory] = useState<string | null>("restaurants");
  const [showBgGallery, setShowBgGallery] = useState(false);
  const [openBgCategory, setOpenBgCategory] = useState<string | null>(null);
  
  // State to track collapsed menu sections
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const dragSectionNode = useRef<number | null>(null);
  const dragItemNode = useRef<{ sIdx: number; iIdx: number } | null>(null);
  
  // Helper to update menu content
  const updateMenu = (updater: (m: FullMenu) => void) => {
    setAppState(prev => {
      const newMenu = { ...prev.menu };
      // Deep clone sections for safety in complex splices
      newMenu.sections = prev.menu.sections.map(s => ({
          ...s,
          items: [...s.items.map(i => ({...i}))]
      }));
      // Deep clone socials if it exists, or init
      newMenu.socials = prev.menu.socials ? {...prev.menu.socials} : {};
      
      updater(newMenu);
      return { ...prev, menu: newMenu };
    });
  };

  // Helper to update brand content
  const updateBrand = (updater: (b: BrandProfile) => void) => {
    setAppState(prev => {
      const newBrand = { ...prev.brand };
      // Deep clone styles for safety
      newBrand.styles = { 
          sectionTitle: {...prev.brand.styles.sectionTitle},
          itemName: {...prev.brand.styles.itemName},
          itemDescription: {...prev.brand.styles.itemDescription},
          price: {...prev.brand.styles.price},
      };
      updater(newBrand);
      return { ...prev, brand: newBrand };
    });
  };

  // Generic Typography Updater
  const updateTypo = (target: keyof BrandProfile['styles'], key: keyof TypographyStyle, value: any) => {
      updateBrand(b => {
          (b.styles[target] as any)[key] = value;
      });
  };

  const toggleSectionCollapse = (id: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSectionAdd = () => {
    updateMenu(m => m.sections.push({ 
      id: Math.random().toString(), 
      title: "Nuova Sezione", 
      items: [] 
    }));
  };

  const handleDuplicateSection = (index: number) => {
    updateMenu(m => {
      const original = m.sections[index];
      const copy = {
        ...original,
        id: Math.random().toString(),
        title: `${original.title} (Copia)`,
        items: original.items.map(i => ({...i, id: Math.random().toString()}))
      };
      m.sections.splice(index + 1, 0, copy);
    });
  };

  const handleItemAdd = (sectionIndex: number) => {
    updateMenu(m => m.sections[sectionIndex].items.push({
      id: Math.random().toString(),
      name: "Nuovo Piatto",
      price: "10€",
      description: ""
    }));
  };

  // --- Drag & Drop Handlers ---
  const handleDragStartSection = (e: React.DragEvent, index: number) => {
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault();
        return;
    }
    if (target.closest('button') && !target.closest('.drag-handle')) {
        e.preventDefault();
        return;
    }
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

    if (dragItemNode.current !== null && appState.menu.sections[index].items.length === 0) {
         const { sIdx, iIdx } = dragItemNode.current;
         if (sIdx !== index) {
             e.preventDefault(); 
             updateMenu(m => {
                 const [item] = m.sections[sIdx].items.splice(iIdx, 1);
                 m.sections[index].items.push(item);
             });
             dragItemNode.current = { sIdx: index, iIdx: 0 };
         }
    }
  };

  const handleDragEndSection = () => {
    dragSectionNode.current = null;
    setDraggableId(null);
  };

  const handleDragStartItem = (e: React.DragEvent, sIdx: number, iIdx: number) => {
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault();
        return;
    }
    if (target.closest('button') && !target.closest('.drag-handle')) {
        e.preventDefault();
        return;
    }
    e.stopPropagation();
    dragItemNode.current = { sIdx, iIdx };
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnterItem = (e: React.DragEvent, sIdx: number, iIdx: number) => {
    e.stopPropagation();
    if (dragItemNode.current === null) return;
    
    const { sIdx: srcSIdx, iIdx: srcIIdx } = dragItemNode.current;
    if (srcSIdx === sIdx && srcIIdx === iIdx) return;

    updateMenu(m => {
        const [item] = m.sections[srcSIdx].items.splice(srcIIdx, 1);
        m.sections[sIdx].items.splice(iIdx, 0, item);
    });
    dragItemNode.current = { sIdx, iIdx };
  };

  const handleDragEndItem = () => {
    dragItemNode.current = null;
    setDraggableId(null);
  };

  const handleThemeApply = (theme: any) => {
      updateBrand(b => {
        Object.assign(b, theme.brand);
      });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      updateBrand(b => b.logoUrl = url);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      updateBrand(b => b.backgroundImageUrl = url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-full md:w-[450px] shrink-0 z-20 shadow-2xl">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 p-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'content' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}
        >
          <Type size={18} /> Contenuto
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 p-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'style' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}
        >
          <Palette size={18} /> Stile
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 p-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'export' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}
        >
          <Download size={18} /> Esporta
        </button>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* --- CONTENT TAB --- */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Info */}
            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Intestazione Menù</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Titolo Menù</label>
                <input 
                  type="text" 
                  value={appState.menu.title}
                  onChange={(e) => updateMenu(m => m.title = e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Es. Ristorante da Mario"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sottotitolo / Slogan</label>
                <input 
                  type="text" 
                  value={appState.menu.subtitle || ''}
                  onChange={(e) => updateMenu(m => m.subtitle = e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Es. Menù Degustazione 2025"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prezzo Menù Fisso (Opzionale)</label>
                <input 
                  type="text" 
                  value={appState.menu.fixedPrice || ''}
                  onChange={(e) => updateMenu(m => m.fixedPrice = e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Es. 35€ a Persona"
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                 Sezioni Menù
               </h3>
               
               {appState.menu.sections.map((section, sIdx) => (
                 <div 
                    key={section.id} 
                    className={`bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden transition-opacity ${dragSectionNode.current === sIdx ? 'opacity-50 border-dashed border-indigo-500' : ''}`}
                    draggable={draggableId === section.id}
                    onDragStart={(e) => handleDragStartSection(e, sIdx)}
                    onDragEnter={(e) => handleDragEnterSection(e, sIdx)}
                    onDragEnd={handleDragEndSection}
                    onDragOver={(e) => e.preventDefault()}
                 >
                   {/* Section Header */}
                   <div className="p-3 bg-gray-800/80 flex items-center gap-2">
                     <div 
                        onMouseEnter={() => setDraggableId(section.id)}
                        onMouseLeave={() => setDraggableId(null)}
                        className="cursor-grab hover:text-indigo-400 text-gray-600 p-1 drag-handle"
                     >
                       <GripVertical size={16} />
                     </div>
                     
                     <button 
                        onClick={() => toggleSectionCollapse(section.id)}
                        className="text-gray-400 hover:text-white p-1"
                        title={collapsedSections.has(section.id) ? "Espandi Sezione" : "Collassa Sezione"}
                     >
                        {collapsedSections.has(section.id) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                     </button>

                     <input 
                        type="text" 
                        value={section.title}
                        onChange={(e) => updateMenu(m => m.sections[sIdx].title = e.target.value)}
                        className="bg-transparent font-bold text-white w-full outline-none placeholder-gray-500"
                        placeholder="Nome Sezione"
                        onClick={(e) => e.stopPropagation()}
                     />
                     
                     <button 
                        onClick={() => handleDuplicateSection(sIdx)}
                        className="text-gray-500 hover:text-indigo-400 p-1"
                        title="Duplica Sezione"
                     >
                       <Copy size={16} />
                     </button>

                     <button 
                      onClick={() => updateMenu(m => m.sections.splice(sIdx, 1))}
                      className="text-gray-500 hover:text-red-400 p-1"
                      title="Elimina Sezione"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>

                   {/* Items */}
                   {!collapsedSections.has(section.id) && (
                     <div className="p-3 space-y-3 border-t border-gray-700/50">
                        {section.items.map((item, iIdx) => (
                          <div 
                              key={item.id} 
                              className={`flex items-start gap-2 pl-2 border-l-2 border-gray-700 hover:border-indigo-500 transition-colors ${dragItemNode.current?.sIdx === sIdx && dragItemNode.current?.iIdx === iIdx ? 'opacity-40 bg-gray-800' : ''}`}
                              draggable={draggableId === item.id}
                              onDragStart={(e) => handleDragStartItem(e, sIdx, iIdx)}
                              onDragEnter={(e) => handleDragEnterItem(e, sIdx, iIdx)}
                              onDragEnd={handleDragEndItem}
                              onDragOver={(e) => e.preventDefault()}
                          >
                            <div 
                              onMouseEnter={() => setDraggableId(item.id)}
                              onMouseLeave={() => setDraggableId(null)}
                              className="cursor-grab pt-2 text-gray-600 hover:text-indigo-400 shrink-0 drag-handle"
                            >
                              <GripVertical size={14} />
                            </div>
                            <div className="w-full">
                                <div className="flex gap-2 mb-1">
                                  <input 
                                    type="text" 
                                    value={item.name}
                                    onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].name = e.target.value)}
                                    className="bg-transparent text-sm w-full font-medium outline-none"
                                    placeholder="Nome Piatto"
                                  />
                                  <input 
                                    type="text" 
                                    value={item.price || ''}
                                    onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].price = e.target.value)}
                                    className="bg-transparent text-sm w-16 text-right text-indigo-300 outline-none"
                                    placeholder="Prezzo"
                                  />
                                </div>
                                <textarea 
                                  id={`desc-${sIdx}-${iIdx}`}
                                  value={item.description || ''}
                                  onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].description = e.target.value)}
                                  className="w-full bg-transparent text-xs text-gray-400 outline-none resize-y min-h-[40px]"
                                  placeholder="Descrizione piatto..."
                                  rows={2}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                                            <input 
                                                type="checkbox" 
                                                checked={item.highlight || false}
                                                onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].highlight = e.target.checked)}
                                                className="rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-0"
                                            />
                                            Evidenza
                                        </label>
                                        
                                        <div className="flex items-center gap-1 border-l border-gray-700 pl-3">
                                           <AlertCircle size={12} className="text-gray-500" />
                                           <input 
                                              type="text" 
                                              value={item.allergens || ''}
                                              onChange={(e) => updateMenu(m => m.sections[sIdx].items[iIdx].allergens = e.target.value)}
                                              placeholder="Allergeni..."
                                              className="bg-transparent text-xs text-gray-400 outline-none w-24 focus:text-white"
                                           />
                                        </div>
                                    </div>
                                    <button 
                                      onClick={() => updateMenu(m => m.sections[sIdx].items.splice(iIdx, 1))}
                                      className="text-gray-600 hover:text-red-400"
                                      title="Elimina Piatto"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={() => handleItemAdd(sIdx)}
                          className="w-full py-2 border border-dashed border-gray-700 rounded text-xs text-gray-500 hover:text-white hover:border-gray-500 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus size={12} /> Aggiungi Piatto
                        </button>
                     </div>
                   )}
                 </div>
               ))}

               {/* New Large Add Section Button */}
               <button 
                  onClick={handleSectionAdd}
                  className="w-full py-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-indigo-500 hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2 font-medium"
               >
                 <Plus size={20} /> Aggiungi Nuova Sezione Menù
               </button>
            </div>
            
            <hr className="border-gray-800" />
            
            {/* Footer Note */}
            <div>
               <label className="block text-sm text-gray-400 mb-1">Nota a pié di pagina</label>
               <input 
                  type="text" 
                  value={appState.menu.footerNote || ''}
                  onChange={(e) => updateMenu(m => m.footerNote = e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Es. Coperto 2€ - Allergeni disponibili su richiesta"
               />
            </div>

            {/* Contacts & Socials */}
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                 <Phone size={14} /> Contatti & Social (Footer)
               </h3>
               <div>
                  <label className="block text-xs text-gray-400 mb-1">Nome Azienda (Footer)</label>
                  <input 
                    type="text" 
                    value={appState.menu.socials?.companyName || ''}
                    onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.companyName = e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Es. Ristorante Da Mario S.r.l."
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Telefono</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-2 top-2.5 text-gray-500" />
                      <input 
                        type="text" 
                        value={appState.menu.socials?.phone || ''}
                        onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.phone = e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 pl-8 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="333 1234567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Instagram</label>
                    <div className="relative">
                      <Instagram size={14} className="absolute left-2 top-2.5 text-gray-500" />
                      <input 
                        type="text" 
                        value={appState.menu.socials?.instagram || ''}
                        onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.instagram = e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 pl-8 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="@ristorante"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">TikTok</label>
                    <div className="relative">
                      <Music size={14} className="absolute left-2 top-2.5 text-gray-500" />
                      <input 
                        type="text" 
                        value={appState.menu.socials?.tiktok || ''}
                        onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.tiktok = e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 pl-8 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="@ristorante"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Sito Web</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-2 top-2.5 text-gray-500" />
                      <input 
                        type="text" 
                        value={appState.menu.socials?.website || ''}
                        onChange={(e) => updateMenu(m => { if(!m.socials) m.socials={}; m.socials.website = e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 pl-8 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="www.sito.it"
                      />
                    </div>
                  </div>
               </div>
            </div>

          </div>
        )}

        {/* --- STYLE TAB --- */}
        {activeTab === 'style' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Presets Accordion */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preset & Temi</h3>
              {PRESET_CATEGORIES.map(category => (
                <div key={category.id} className="border border-gray-700 rounded-lg overflow-hidden">
                   <button 
                    onClick={() => setOpenPresetCategory(openPresetCategory === category.id ? null : category.id)}
                    className="w-full p-3 bg-gray-800 flex justify-between items-center hover:bg-gray-750 transition-colors"
                   >
                     <span className="font-bold text-sm text-gray-300">{category.title}</span>
                     {openPresetCategory === category.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                   </button>
                   {openPresetCategory === category.id && (
                     <div className="p-2 grid grid-cols-2 gap-2 bg-gray-900/50">
                        {category.presets.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => handleThemeApply(preset)}
                            className="p-3 rounded border border-gray-700 bg-gray-800 text-left hover:border-indigo-500 hover:bg-gray-700 transition-all group"
                          >
                            <div className="text-xs font-bold text-white group-hover:text-indigo-300">{preset.name}</div>
                            <div className="flex gap-1 mt-2">
                              <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: preset.brand.backgroundColor }}></div>
                              <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: preset.brand.primaryColor }}></div>
                              <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: preset.brand.accentColor }}></div>
                            </div>
                          </button>
                        ))}
                     </div>
                   )}
                </div>
              ))}
            </div>

            <hr className="border-gray-800" />

            {/* Typography & Formatting Controls */}
             <div className="space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipografia & Formattazione</h3>
               
               {/* Fonts Selection */}
               <div className="grid grid-cols-2 gap-3 mb-4">
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Font Titoli</label>
                    <select 
                      value={appState.brand.fontTitle} 
                      onChange={(e) => updateBrand(b => b.fontTitle = e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Font Corpo</label>
                    <select 
                      value={appState.brand.fontBody} 
                      onChange={(e) => updateBrand(b => b.fontBody = e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                 </div>
               </div>

               {/* Global Text Style Controls */}
               <div className="space-y-3">
                 {[
                   { id: 'sectionTitle', label: 'Titoli Sezione' },
                   { id: 'itemName', label: 'Nomi Piatti' },
                   { id: 'itemDescription', label: 'Descrizioni' },
                   { id: 'price', label: 'Prezzi' },
                 ].map((target) => {
                   const style = appState.brand.styles[target.id as keyof BrandProfile['styles']];
                   return (
                     <div key={target.id} className="bg-gray-800/50 p-3 rounded border border-gray-700">
                        <div className="text-xs font-semibold text-gray-400 mb-2">{target.label}</div>
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* Alignment */}
                          <div className="flex bg-gray-900 rounded border border-gray-700 p-0.5">
                             <button onClick={() => updateTypo(target.id as any, 'align', 'left')} className={`p-1 rounded ${style.align === 'left' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><AlignLeft size={14}/></button>
                             <button onClick={() => updateTypo(target.id as any, 'align', 'center')} className={`p-1 rounded ${style.align === 'center' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><AlignCenter size={14}/></button>
                             <button onClick={() => updateTypo(target.id as any, 'align', 'right')} className={`p-1 rounded ${style.align === 'right' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><AlignRight size={14}/></button>
                          </div>
                          
                          {/* Formatting */}
                          <div className="flex bg-gray-900 rounded border border-gray-700 p-0.5">
                             <button onClick={() => updateTypo(target.id as any, 'bold', !style.bold)} className={`p-1 rounded ${style.bold ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><Bold size={14}/></button>
                             <button onClick={() => updateTypo(target.id as any, 'italic', !style.italic)} className={`p-1 rounded ${style.italic ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><Italic size={14}/></button>
                             <button onClick={() => updateTypo(target.id as any, 'underline', !style.underline)} className={`p-1 rounded ${style.underline ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><Underline size={14}/></button>
                             <button onClick={() => updateTypo(target.id as any, 'uppercase', !style.uppercase)} className={`p-1 rounded ${style.uppercase ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><TypeIcon size={14}/></button>
                          </div>

                          {/* Scaling */}
                          <div className="flex items-center bg-gray-900 rounded border border-gray-700 p-0.5">
                             <button onClick={() => updateTypo(target.id as any, 'scale', Math.max(0.5, style.scale - 0.1))} className="p-1 text-gray-500 hover:text-white"><Minus size={12}/></button>
                             <span className="text-xs w-8 text-center text-gray-300">{style.scale.toFixed(1)}x</span>
                             <button onClick={() => updateTypo(target.id as any, 'scale', Math.min(3, style.scale + 0.1))} className="p-1 text-gray-500 hover:text-white"><PlusIcon size={12}/></button>
                          </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
             </div>

             <hr className="border-gray-800" />
             
             {/* Colors & Palette */}
             <div className="space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Colori & Palette</h3>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {COLOR_PALETTES.map(p => (
                     <button
                       key={p.name}
                       onClick={() => updateBrand(b => {
                           b.backgroundColor = p.colors.bg;
                           b.textColor = p.colors.text;
                           b.primaryColor = p.colors.primary;
                           b.accentColor = p.colors.accent;
                       })}
                       className="p-2 rounded bg-gray-800 border border-gray-700 hover:border-white transition-all text-xs text-left"
                     >
                        <div className="flex gap-1 mb-1">
                          <div className="w-3 h-3 rounded-full" style={{background: p.colors.bg}}></div>
                          <div className="w-3 h-3 rounded-full" style={{background: p.colors.primary}}></div>
                          <div className="w-3 h-3 rounded-full" style={{background: p.colors.accent}}></div>
                        </div>
                        {p.name}
                     </button>
                  ))}
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Colore Primario</label>
                    <div className="flex items-center gap-2">
                       <input type="color" value={appState.brand.primaryColor} onChange={(e) => updateBrand(b => b.primaryColor = e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                       <span className="text-xs font-mono text-gray-500">{appState.brand.primaryColor}</span>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Colore Accento</label>
                    <div className="flex items-center gap-2">
                       <input type="color" value={appState.brand.accentColor} onChange={(e) => updateBrand(b => b.accentColor = e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                       <span className="text-xs font-mono text-gray-500">{appState.brand.accentColor}</span>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Sfondo</label>
                    <div className="flex items-center gap-2">
                       <input type="color" value={appState.brand.backgroundColor} onChange={(e) => updateBrand(b => b.backgroundColor = e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                       <span className="text-xs font-mono text-gray-500">{appState.brand.backgroundColor}</span>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Testo Base</label>
                    <div className="flex items-center gap-2">
                       <input type="color" value={appState.brand.textColor} onChange={(e) => updateBrand(b => b.textColor = e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                       <span className="text-xs font-mono text-gray-500">{appState.brand.textColor}</span>
                    </div>
                 </div>
               </div>
             </div>

             <hr className="border-gray-800" />
             
             {/* Logo & Background */}
             <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Immagini & Overlay</h3>
                
                {/* Logo */}
                <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
                   <label className="text-xs text-gray-400 block mb-2">Logo Ristorante</label>
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border border-gray-600">
                         {appState.brand.logoUrl ? (
                           <img src={appState.brand.logoUrl} className="w-full h-full object-cover" />
                         ) : <ImageIcon size={20} className="text-gray-500" />}
                      </div>
                      <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded transition-colors">
                         Carica Logo
                         <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                      <div className="flex gap-1 ml-auto">
                         <button onClick={() => updateBrand(b => b.logoStyle = 'original')} className={`p-1.5 rounded ${appState.brand.logoStyle === 'original' ? 'bg-indigo-600' : 'bg-gray-700 text-gray-400'}`} title="Originale"><Layout size={14}/></button>
                         <button onClick={() => updateBrand(b => b.logoStyle = 'rounded')} className={`p-1.5 rounded ${appState.brand.logoStyle === 'rounded' ? 'bg-indigo-600' : 'bg-gray-700 text-gray-400'}`} title="Arrotondato"><div className="w-3.5 h-3.5 border border-current rounded-sm"></div></button>
                         <button onClick={() => updateBrand(b => b.logoStyle = 'circle')} className={`p-1.5 rounded ${appState.brand.logoStyle === 'circle' ? 'bg-indigo-600' : 'bg-gray-700 text-gray-400'}`} title="Cerchio"><div className="w-3.5 h-3.5 border border-current rounded-full"></div></button>
                      </div>
                   </div>
                </div>

                {/* Background Image */}
                <div className="p-3 bg-gray-800/50 rounded border border-gray-700 space-y-3">
                   <label className="text-xs text-gray-400 block">Sfondo Menù</label>
                   <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded transition-colors text-center">
                         Carica Foto
                         <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                      </label>
                      <button 
                        onClick={() => setShowBgGallery(!showBgGallery)}
                        className={`flex-1 text-xs px-3 py-2 rounded transition-colors flex items-center justify-center gap-2 ${showBgGallery ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                      >
                        <Grid size={14} /> Galleria
                      </button>
                   </div>
                   
                   {/* Background Gallery */}
                   {showBgGallery && (
                     <div className="bg-gray-900 border border-gray-700 rounded p-2 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                        {BACKGROUND_PRESETS.map((cat) => (
                          <div key={cat.category} className="mb-3 last:mb-0">
                             <button 
                               onClick={() => setOpenBgCategory(openBgCategory === cat.category ? null : cat.category)}
                               className="w-full text-left text-xs font-bold text-gray-400 hover:text-white mb-2 flex justify-between items-center"
                             >
                               {cat.category}
                               {openBgCategory === cat.category ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                             </button>
                             {openBgCategory === cat.category && (
                               <div className="grid grid-cols-3 gap-2">
                                  {cat.images.map((img, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => updateBrand(b => b.backgroundImageUrl = img)}
                                      className="aspect-[2/3] rounded overflow-hidden border border-transparent hover:border-indigo-500 relative group"
                                    >
                                      <img src={img} className="w-full h-full object-cover" />
                                      {appState.brand.backgroundImageUrl === img && (
                                        <div className="absolute inset-0 bg-indigo-500/50 flex items-center justify-center">
                                          <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                      )}
                                    </button>
                                  ))}
                               </div>
                             )}
                          </div>
                        ))}
                     </div>
                   )}

                   <div className="space-y-2 pt-2 border-t border-gray-700/50">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Modalità Overlay</span>
                        <div className="flex gap-2">
                           <button onClick={() => updateBrand(b => b.overlayMode = 'solid')} className={appState.brand.overlayMode === 'solid' ? 'text-indigo-400 font-bold' : ''}>Solido</button>
                           <button onClick={() => updateBrand(b => b.overlayMode = 'gradient')} className={appState.brand.overlayMode === 'gradient' ? 'text-indigo-400 font-bold' : ''}>Sfumato</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="color" value={appState.brand.overlayColor} onChange={(e) => updateBrand(b => b.overlayColor = e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                         <input 
                           type="range" min="0" max="1" step="0.1" 
                           value={appState.brand.overlayOpacity} 
                           onChange={(e) => updateBrand(b => b.overlayOpacity = parseFloat(e.target.value))}
                           className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                         />
                      </div>
                   </div>
                </div>
             </div>

          </div>
        )}

        {/* --- EXPORT TAB --- */}
        {activeTab === 'export' && (
           <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl text-center space-y-4">
                 <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                    <Smartphone size={32} />
                 </div>
                 <h3 className="text-xl font-bold">Storia / Post Instagram</h3>
                 <p className="text-sm text-gray-400">Formato verticale ottimizzato per smartphone. Perfetto per le storie o da inviare su WhatsApp.</p>
                 <button 
                   onClick={() => onExport('image')}
                   className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                 >
                    <Download size={20} /> Scarica Immagine (PNG)
                 </button>
              </div>

              <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl text-center space-y-4">
                 <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto text-purple-400">
                    <Printer size={32} />
                 </div>
                 <h3 className="text-xl font-bold">Locandina A4</h3>
                 <p className="text-sm text-gray-400">Formato classico per la stampa in alta risoluzione. Ideale da appendere in bacheca.</p>
                 <button 
                   onClick={() => onExport('pdf')}
                   className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                 >
                    <Download size={20} /> Scarica Stampa (PNG HD)
                 </button>
              </div>

              <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg text-xs text-center text-gray-500">
                 Il QR Code viene generato automaticamente se pubblichi il menù online.
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default Editor;
