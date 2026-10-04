import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Cpu, 
  ExternalLink, 
  Copy, 
  Check, 
  Code2, 
  BookOpen, 
  Info
} from 'lucide-react';
import { IntelResult } from '../types';
import { searchIntelAi } from '../services/aiService';

interface SearchIntelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode: (snippet: string) => void;
  platform: string;
}

const POPULAR_CHIPS = [
  'MPU6050 6-Axis Gyro & Accel',
  'L298N Dual H-Bridge Motor Driver',
  'HC-SR04 Ultrasonic Distance Sensor',
  'SSD1306 0.96" I2C OLED Display',
  'BME280 Temperature & Humidity Sensor',
  'VL53L1X Time-of-Flight Laser Sensor',
  'SG90 9g Micro Servo Motor',
  'MAX6675 Thermocouple Sensor'
];

export const SearchIntelModal: React.FC<SearchIntelModalProps> = ({
  isOpen,
  onClose,
  onInsertCode,
  platform
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim() || loading) return;
    setLoading(true);

    try {
      const data = await searchIntelAi(searchTerm.trim(), platform);
      setResult(data);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0a101f] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#060a14] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/25">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">Google Search Hardware & Library Intel</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800 font-semibold">
                  Google Search Grounded
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-medium">Powered by VoltStar • Real-Time Grounding</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Chips */}
        <div className="p-6 border-b border-blue-950/80 bg-[#080e1c]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex items-center bg-[#0d1629] border border-blue-900/60 focus-within:border-cyan-400 rounded-xl px-3 py-2 transition-colors"
          >
            <Search className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any sensor, motor driver, or IC (e.g. MPU6050, VL53L1X, TMC2209, MAX6675)..."
              className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="ml-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-40"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </form>

          {/* Popular Chips */}
          <div className="mt-3 flex items-center space-x-1.5 flex-wrap gap-y-1.5 text-[11px]">
            <span className="text-slate-400 mr-1 text-[10px] font-semibold uppercase">Popular Chips:</span>
            {POPULAR_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(chip);
                  handleSearch(chip);
                }}
                className="px-2 py-0.5 bg-[#0d1629] hover:bg-[#152342] text-slate-300 hover:text-cyan-300 border border-blue-900/50 hover:border-cyan-500/50 rounded-md transition-all text-[11px]"
              >
                {chip.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <Search className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">
                Searching Google for technical datasheets, pinouts, and latest embedded libraries...
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-[#0d1629] border border-blue-900/50 space-y-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Technical Overview</span>
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">{result.summary}</p>
              </div>

              {/* Pinout Table */}
              {result.pinout && result.pinout.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0d1629] border border-blue-900/50 space-y-2">
                  <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span>Hardware Pinout Specification</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-blue-900/60 text-slate-400 text-[10px] uppercase">
                          <th className="py-1.5 px-2">Pin</th>
                          <th className="py-1.5 px-2">Function</th>
                          <th className="py-1.5 px-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-900/40 font-mono-code">
                        {result.pinout.map((p, idx) => (
                          <tr key={idx} className="hover:bg-[#121f3a]">
                            <td className="py-1.5 px-2 font-bold text-cyan-300">{p.pin}</td>
                            <td className="py-1.5 px-2 text-blue-300 text-[11px]">{p.function}</td>
                            <td className="py-1.5 px-2 text-slate-300 font-sans text-[11px]">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recommended Libraries */}
              {result.recommendedLibraries && result.recommendedLibraries.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0d1629] border border-blue-900/50 space-y-2">
                  <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    <span>Recommended Arduino Libraries</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.recommendedLibraries.map((lib, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#080e1c] border border-blue-900/40 text-xs">
                        <div className="font-semibold text-slate-100">{lib.name}</div>
                        <div className="text-[10px] text-blue-300 mt-0.5">Author: {lib.author}</div>
                        <div className="text-[11px] text-slate-300 mt-1">{lib.installNote}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wiring Notes */}
              {result.wiringNotes && result.wiringNotes.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-1.5">
                  <h3 className="font-bold text-cyan-300 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Electrical & Wiring Guidelines</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {result.wiringNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code Snippet */}
              {result.codeSnippet && (
                <div className="p-4 rounded-xl bg-[#060a14] border border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Starter Driver Code</span>
                    </h3>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyCode(result.codeSnippet)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#0d1629] hover:bg-[#16233d] text-slate-300 text-xs transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onInsertCode(result.codeSnippet);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                      >
                        Insert into Editor
                      </button>
                    </div>
                  </div>

                  <pre className="p-3 rounded-lg bg-[#04060f] text-[11px] font-mono-code text-slate-300 overflow-x-auto border border-blue-950/60 max-h-56">
                    {result.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Sources */}
              {result.sources && result.sources.length > 0 && (
                <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                  <span className="font-semibold text-slate-300 block">Verified Google Search Sources:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 text-cyan-400 hover:underline bg-[#0d1629] px-2 py-0.5 rounded border border-blue-900/60"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !result && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Cpu className="w-8 h-8 mx-auto text-blue-500/40" />
              <p className="text-xs">Search above or click any popular chip to retrieve pinouts and Arduino C++ code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
