import React from 'react';
import { 
  Zap, 
  Code2, 
  Cpu, 
  MessageSquare, 
  Columns, 
  Search, 
  Sparkles,
  Play,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  currentPlatform: string;
  onPlatformChange: (platform: string) => void;
  activeView: 'split' | 'code' | 'wiring' | 'chat';
  onViewChange: (view: 'split' | 'code' | 'wiring' | 'chat') => void;
  onOpenGenerator: () => void;
  onOpenSearchIntel: () => void;
  onOpenBeginnerGuide: () => void;
  onCompile: () => void;
  isCompiling: boolean;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlatform,
  onPlatformChange,
  activeView,
  onViewChange,
  onOpenGenerator,
  onOpenSearchIntel,
  onOpenBeginnerGuide,
  onCompile,
  isCompiling,
  isGenerating
}) => {
  const platforms = [
    'Arduino Uno R3 (Primary Flagship)',
    'Arduino Nano (ATmega328P)',
    'ESP32 DevKit V1 (WiFi + BLE)',
    'Raspberry Pi Pico (RP2040 Dual ARM)',
    'STM32 BluePill (Cortex-M3)',
    'Modern C++20 / Robotics Algorithm'
  ];

  return (
    <header className="h-14 bg-[#070b16] border-b border-blue-950/60 px-2 sm:px-4 flex items-center justify-between select-none z-30 sticky top-0 shadow-md gap-1 sm:gap-2">
      {/* Brand & Platform */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white flex items-center">
                VoltStar <span className="text-cyan-400 ml-0.5 sm:ml-1 hidden xs:inline">Code</span>
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-cyan-300 border border-blue-500/30 font-mono font-medium hidden sm:inline">
                IDE
              </span>
            </div>
          </div>
        </div>

        {/* Platform Selector (hidden on small mobile, visible on tablet/desktop) */}
        <div className="relative group hidden md:block">
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-[#0e1629] border border-blue-900/50 text-xs text-slate-300 hover:border-cyan-500/50 cursor-pointer transition-colors">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={currentPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="bg-transparent text-xs text-cyan-200 font-medium focus:outline-none cursor-pointer pr-1 max-w-[140px] truncate"
            >
              {platforms.map((p) => (
                <option key={p} value={p.split(' (')[0]} className="bg-[#0b1324] text-slate-200">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs (Responsive icons & labels) */}
      <div className="flex items-center bg-[#091122] p-0.5 sm:p-1 rounded-xl border border-blue-900/40 flex-shrink-0">
        <button
          onClick={() => onViewChange('split')}
          className={`flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeView === 'split'
              ? 'bg-[#132240] text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Split View: C++ Code Editor & Wiring Schematic"
        >
          <Columns className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Split</span>
        </button>

        <button
          onClick={() => onViewChange('code')}
          className={`flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeView === 'code'
              ? 'bg-[#132240] text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="C++ Source Editor"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Code</span>
        </button>

        <button
          onClick={() => onViewChange('wiring')}
          className={`flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeView === 'wiring'
              ? 'bg-[#132240] text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Interactive Schematic & Pinout Studio"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Wiring</span>
        </button>

        <button
          onClick={() => onViewChange('chat')}
          className={`flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeView === 'chat'
              ? 'bg-[#132240] text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="AI Architect Brainstorming"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Chat</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
        {/* Beginner Guide Button */}
        <button
          onClick={onOpenBeginnerGuide}
          className="flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900/80 border border-blue-500/40 text-cyan-300 text-xs font-semibold transition-all shadow-sm group"
          title="Interactive Beginner Guide: Learn Arduino & C++ from scratch"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">Beginner Guide</span>
        </button>

        {/* Verify Button */}
        <button
          onClick={onCompile}
          disabled={isCompiling}
          className="flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#0e1629] hover:bg-[#16223d] border border-blue-900/60 text-slate-300 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
          title="Verify & Compile Virtual C++ Sketch"
        >
          <Play className={`w-3.5 h-3.5 text-emerald-400 ${isCompiling ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isCompiling ? 'Compiling...' : 'Verify'}</span>
        </button>

        {/* Google Search Intel */}
        <button
          onClick={onOpenSearchIntel}
          className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e1629] hover:bg-[#16223d] text-blue-300 border border-blue-700/40 text-xs font-medium transition-all shadow-sm"
          title="Search real-time Google Search data for components, pinouts, and libraries"
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>Search Intel</span>
        </button>

        {/* Generate Code & Wiring Button */}
        <button
          onClick={onOpenGenerator}
          disabled={isGenerating}
          className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/30 active:scale-95 disabled:opacity-50"
          title="Generate full C++ code & circuit wiring"
        >
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Generate Project'}</span>
          <span className="sm:hidden">{isGenerating ? '...' : 'Gen'}</span>
        </button>
      </div>
    </header>
  );
};
