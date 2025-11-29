import React, { useState } from "react";
import DigitalMenu from "./DigitalMenu";
import { AppState } from "../types";
import { Smartphone, Monitor } from "lucide-react";

interface PreviewProps {
  appState: AppState;
}

const Preview: React.FC<PreviewProps> = ({ appState }) => {
  const [mode, setMode] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="flex-1 bg-black/50 flex flex-col items-center justify-center relative overflow-hidden p-8">
      {/* Viewport Toggles (Desktop only) */}
      <div className="absolute top-6 flex gap-2 bg-gray-800/80 p-1 rounded-lg backdrop-blur z-20">
        <button 
          onClick={() => setMode('mobile')}
          className={`p-2 rounded transition-colors ${mode === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          title="Vista Mobile"
        >
          <Smartphone size={20} />
        </button>
        <button 
          onClick={() => setMode('desktop')}
          className={`p-2 rounded transition-colors ${mode === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          title="Vista Desktop"
        >
          <Monitor size={20} />
        </button>
      </div>

      {/* Device Frame */}
      <div 
        className={`
          relative transition-all duration-500 ease-in-out shadow-2xl bg-black border-[8px] border-gray-800 rounded-[2rem] overflow-hidden
          ${mode === 'mobile' ? 'w-[375px] h-[750px]' : 'w-[90%] max-w-[1024px] h-[80%] rounded-lg border-[4px]'}
        `}
      >
        <div className="w-full h-full overflow-y-auto custom-scrollbar bg-gray-900">
           <DigitalMenu menu={appState.menu} brand={appState.brand} previewMode={mode} />
        </div>
      </div>
      
      <div className="absolute bottom-4 text-xs text-gray-500">
        {mode === 'mobile' ? 'Anteprima iPhone' : 'Anteprima Web'}
      </div>
    </div>
  );
};

export default Preview;