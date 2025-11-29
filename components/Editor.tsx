import React, { useState, useRef } from "react";
import { AppState, BrandProfile, FullMenu, TypographyStyle } from "../types";
import { PRESET_CATEGORIES, FONTS, COLOR_PALETTES, BACKGROUND_PRESETS } from "../constants";
import { 
  Palette, Type, Layout, Image as ImageIcon, 
  Trash2, Plus, GripVertical, Download, 
  Settings, Smartphone, Monitor, Printer,
  Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight, Underline, Type as TypeIcon, Minus, Plus as PlusIcon, ChevronDown, ChevronRight,
  AlertCircle
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
    // Fix: Allow dragging on SVG/PATH (the grip icon)
    if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault();
        return;
    }
    // Only prevent dragging on buttons that aren't part of the handle mechanism (if any)
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
                          
                          {/* Styling */}
                          <div className="flex bg-gray-900 rounded border border-gray-700 p-0.5">
                             <button onClick={() => updateTypo(target.id as any, 'bold', !style.bold)} className={`p-1 rounded ${style.bold ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`} title="Grassetto"><Bold size={14}/></button>
                             <button onClick={() => updateTypo(target.id as any, 'italic', !style.italic)} className={`p-1 rounded ${style.italic ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`} title="Corsivo"><Italic size={14}/></button>
                             <button onClick={() => updateTypo(target.id as any, 'underline', !style.underline)} className={`p-1 rounded ${style.underline ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`} title="Sottolineato"><Underline size={14}/></button>
                             <button onClick={() => updateTypo(target.id as any, 'uppercase', !style.uppercase)} className={`p-1 rounded ${style.uppercase ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`} title="Maiuscolo"><TypeIcon size={14}/></button>
                          </div>

                           {/* Scale */}
                           <div className="flex items-center gap-1 bg-gray-900 rounded border border-gray-700 px-2 py-0.5">
                              <button onClick={() => updateTypo(target.id as any, 'scale', Math.max(0.5, style.scale - 0.1))} className="text-gray-500 hover:text-white"><Minus size={12}/></button>
                              <span className="text-[10px] text-gray-300 min-w-[20px] text-center">{style.scale.toFixed(1)}x</span>
                              <button onClick={() => updateTypo(target.id as any, 'scale', Math.min(3, style.scale + 0.1))} className="text-gray-500 hover:text-white"><PlusIcon size={12}/></button>
                           </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
             </div>

            <hr className="border-gray-800" />

            {/* Colors */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Palette Colori</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {COLOR_PALETTES.map((pal, idx) => (
                    <button 
                        key={idx} 
                        className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[60px]"
                        onClick={() => updateBrand(b => {
                            b.backgroundColor = pal.colors.bg;
                            b.textColor = pal.colors.text;
                            b.primaryColor = pal.colors.primary;
                            b.accentColor = pal.colors.accent;
                        })}
                    >
                        <div className="w-12 h-12 rounded-full border border-gray-600 flex overflow-hidden">
                            <div className="w-1/2 h-full" style={{ background: pal.colors.bg }}></div>
                            <div className="w-1/2 h-full flex flex-col">
                                <div className="h-1/2" style={{ background: pal.colors.primary }}></div>
                                <div className="h-1/2" style={{ background: pal.colors.accent }}></div>
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{pal.name}</span>
                    </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                 <div>
                   <label className="text-xs text-gray-400 block mb-1">Sfondo</label>
                   <div className="flex gap-2 items-center">
                     <input type="color" value={appState.brand.backgroundColor} onChange={(e) => updateBrand(b => b.backgroundColor = e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                     <span className="text-xs text-gray-500 font-mono">{appState.brand.backgroundColor}</span>
                   </div>
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 block mb-1">Testo Base</label>
                   <div className="flex gap-2 items-center">
                     <input type="color" value={appState.brand.textColor} onChange={(e) => updateBrand(b => b.textColor = e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                     <span className="text-xs text-gray-500 font-mono">{appState.brand.textColor}</span>
                   </div>
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 block mb-1">Primario</label>
                   <div className="flex gap-2 items-center">
                     <input type="color" value={appState.brand.primaryColor} onChange={(e) => updateBrand(b => b.primaryColor = e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                     <span className="text-xs text-gray-500 font-mono">{appState.brand.primaryColor}</span>
                   </div>
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 block mb-1">Accento</label>
                   <div className="flex gap-2 items-center">
                     <input type="color" value={appState.brand.accentColor} onChange={(e) => updateBrand(b => b.accentColor = e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                     <span className="text-xs text-gray-500 font-mono">{appState.brand.accentColor}</span>
                   </div>
                 </div>
              </div>
            </div>

             <hr className="border-gray-800" />

            {/* Assets */}
             <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Immagini & Overlay</h3>
                
                {/* Logo */}
                <div>
                   <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-gray-400">Logo Ristorante</label>
                    <div className="flex gap-1 bg-gray-800 rounded p-1">
                      {(['original', 'rounded', 'circle'] as const).map(style => (
                        <button 
                          key={style}
                          onClick={() => updateBrand(b => b.logoStyle = style)}
                          className={`w-6 h-6 rounded flex items-center justify-center ${appState.brand.logoStyle === style ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                          title={style === 'original' ? 'Originale' : style === 'rounded' ? 'Arrotondato' : 'Cerchio'}
                        >
                          <div className={`border border-current ${style === 'circle' ? 'rounded-full w-3 h-3' : style === 'rounded' ? 'rounded-sm w-3 h-3' : 'w-3 h-3'}`}></div>
                        </button>
                      ))}
                    </div>
                   </div>
                   <label className="flex items-center gap-3 w-full p-2 border border-dashed border-gray-700 rounded hover:bg-gray-800 cursor-pointer transition-colors">
                      <ImageIcon size={20} className="text-gray-500" />
                      <span className="text-sm text-gray-400">Carica Logo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                   </label>
                </div>

                {/* Background */}
                <div>
                   <label className="text-xs text-gray-400 block mb-2">Immagine di Sfondo</label>
                   
                   <div className="flex gap-2 mb-2">
                       <label className="flex-1 flex items-center justify-center gap-2 p-2 border border-dashed border-gray-700 rounded hover:bg-gray-800 cursor-pointer transition-colors">
                          <ImageIcon size={18} className="text-gray-500" />
                          <span className="text-xs text-gray-400">Carica Foto</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                       </label>
                       <button 
                         onClick={() => setShowBgGallery(!showBgGallery)}
                         className={`flex-1 flex items-center justify-center gap-2 p-2 border border-gray-700 rounded transition-colors ${showBgGallery ? 'bg-indigo-600 border-indigo-500 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
                       >
                          <Layout size={18} />
                          <span className="text-xs">Galleria</span>
                       </button>
                   </div>

                   {showBgGallery && (
                     <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700 h-64 overflow-y-auto custom-scrollbar">
                       {BACKGROUND_PRESETS.map((cat) => (
                         <div key={cat.category} className="mb-4">
                           <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 sticky top-0 bg-gray-800 py-1">{cat.category}</div>
                           <div className="grid grid-cols-3 gap-2">
                             {cat.images.map((img, idx) => (
                               <button 
                                 key={idx}
                                 onClick={() => updateBrand(b => b.backgroundImageUrl = img)}
                                 className="aspect-[9/16] rounded overflow-hidden border border-transparent hover:border-indigo-500 transition-all relative group"
                               >
                                 <img src={img} alt="bg" className="w-full h-full object-cover" />
                                 {appState.brand.backgroundImageUrl === img && (
                                   <div className="absolute inset-0 bg-indigo-500/50 flex items-center justify-center">
                                     <div className="w-2 h-2 bg-white rounded-full"></div>
                                   </div>
                                 )}
                               </button>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                </div>

                {/* Overlay Settings */}
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-3">
                   <div className="flex justify-between text-xs text-gray-400">
                      <span>Modalità Overlay</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateBrand(b => b.overlayMode = 'solid')}
                          className={`px-2 py-0.5 rounded ${appState.brand.overlayMode === 'solid' ? 'bg-indigo-600 text-white' : 'bg-gray-700'}`}
                        >Solido</button>
                        <button 
                           onClick={() => updateBrand(b => b.overlayMode = 'gradient')}
                           className={`px-2 py-0.5 rounded ${appState.brand.overlayMode === 'gradient' ? 'bg-indigo-600 text-white' : 'bg-gray-700'}`}
                        >Sfumato</button>
                      </div>
                   </div>
                   <div>
                     <input 
                      type="range" 
                      min="0" max="1" step="0.1" 
                      value={appState.brand.overlayOpacity} 
                      onChange={(e) => updateBrand(b => b.overlayOpacity = parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>0%</span>
                      <span>Opacità</span>
                      <span>100%</span>
                    </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-400">Colore Velo</span>
                     <input type="color" value={appState.brand.overlayColor} onChange={(e) => updateBrand(b => b.overlayColor = e.target.value)} className="w-6 h-6 rounded border-none bg-transparent" />
                   </div>
                </div>

             </div>
          </div>
        )}

        {/* --- EXPORT TAB --- */}
        {activeTab === 'export' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><Settings size={16} /> QR Code</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Il QR code collegherà i clienti al tuo menù digitale.
                </p>
                <div className="flex justify-center bg-white p-4 rounded-lg w-fit mx-auto">
                   <canvas id="qr-code-canvas"></canvas>
                </div>
             </div>
             
             <div className="space-y-3">
                <button 
                  onClick={() => onExport('image')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-between group transition-all"
                >
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/20 text-pink-500 rounded-lg group-hover:bg-pink-500 group-hover:text-white transition-colors">
                        <Smartphone size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white">Storie Social</div>
                        <div className="text-xs text-gray-400">Immagine PNG (1080x1920)</div>
                      </div>
                   </div>
                   <Download size={20} className="text-gray-500 group-hover:text-white" />
                </button>

                 <button 
                  onClick={() => onExport('pdf')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-between group transition-all"
                >
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Printer size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white">Stampa A4</div>
                        <div className="text-xs text-gray-400">Alta Qualità PNG/PDF</div>
                      </div>
                   </div>
                   <Download size={20} className="text-gray-500 group-hover:text-white" />
                </button>

                <button 
                  onClick={() => onExport('html')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-between group transition-all"
                >
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 text-green-500 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <Monitor size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white">Sito Web HTML</div>
                        <div className="text-xs text-gray-400">File autonomo (Standalone)</div>
                      </div>
                   </div>
                   <Download size={20} className="text-gray-500 group-hover:text-white" />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;