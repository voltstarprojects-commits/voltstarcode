import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Zap, 
  Cpu, 
  Layers, 
  CheckCircle2,
  ArrowRight,
  Flame,
  HelpCircle
} from 'lucide-react';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, platform: string, domain: string) => void;
  isGenerating: boolean;
  currentPlatform: string;
}

const STARTERS = [
  {
    title: 'Beginner: Obstacle Avoiding Rover (L298N + Ultrasonic)',
    platform: 'Arduino Uno R3',
    prompt: 'Autonomous dual DC motor obstacle avoidance rover with L298N driver, SG90 scanning servo, HC-SR04 ultrasonic distance sensor, and alert buzzer on Arduino Uno.',
    tag: 'Beginner Robotics (No Soldering)',
    badge: 'Most Popular'
  },
  {
    title: 'Beginner: Smart Plant Waterer (Soil Sensor + Pump Relay)',
    platform: 'Arduino Uno R3',
    prompt: 'Arduino Uno automatic plant watering system with capacitive soil moisture sensor on A0, 5V water pump relay on D3, status LEDs on D7/D8, and 16x2 I2C LCD on A4/A5.',
    tag: 'Smart Home & Sensors',
    badge: 'Easy Setup'
  },
  {
    title: 'Precision PID DC Motor Speed Controller with Encoders',
    platform: 'Arduino Uno R3',
    prompt: 'Precision closed-loop PID DC motor speed stabilizer with optical encoder interrupt on D2/D3, L298N PWM speed on D5/D6, and Serial telemetry on Arduino Uno.',
    tag: 'Intermediate Motion Control',
    badge: 'Robotics'
  },
  {
    title: 'Dual-Axis Sun Tracker with 2 Servos & 4 LDRs',
    platform: 'Arduino Uno R3',
    prompt: 'Arduino Uno dual-axis solar panel tracker with 4 light dependent resistors (LDRs) on A0-A3 and 2 SG90 servo motors on D9 and D10.',
    tag: 'Green Energy & Servos',
    badge: 'Fun Project'
  }
];

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  currentPlatform
}) => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState(currentPlatform || 'Arduino Uno R3');
  const [domain, setDomain] = useState('Motors & Sensors (Arduino Uno)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim(), platform, domain);
  };

  const handlePickStarter = (starter: typeof STARTERS[0]) => {
    setPrompt(starter.prompt);
    setPlatform(starter.platform);
    setDomain(starter.tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0a101f] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#060a14] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/25">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">VoltStar AI Generator</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800 font-semibold">
                  Arduino & Embedded C++
                </span>
              </div>
              <p className="text-xs text-blue-300/80">Generates code, wiring schematics, and auto-allocated pins</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Board */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Board / Platform</span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#0d1629] border border-blue-900/50 text-xs text-cyan-200 rounded-xl px-3 py-2.5 focus:border-cyan-400 focus:outline-none"
              >
                <option value="Arduino Uno R3">Arduino Uno R3 (Best for Beginners)</option>
                <option value="Arduino Nano">Arduino Nano (ATmega328P Compact)</option>
                <option value="ESP32 DevKit V1">ESP32 DevKit V1 (WiFi + BLE)</option>
                <option value="Raspberry Pi Pico">Raspberry Pi Pico (RP2040 Dual ARM)</option>
                <option value="STM32 BluePill">STM32 BluePill (Cortex-M3)</option>
                <option value="Modern C++20">Modern C++20 / Robotics Algorithm</option>
              </select>
            </div>

            {/* Architecture Domain */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Project Category</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-[#0d1629] border border-blue-900/50 text-xs text-blue-200 rounded-xl px-3 py-2.5 focus:border-blue-400 focus:outline-none"
              >
                <option value="Motors & Sensors (Arduino Uno)">Motors & Sensors (PWM, Servo, Ultrasonic)</option>
                <option value="Robotics & Autonomous Navigation">Robotics & Autonomous Navigation</option>
                <option value="Industrial Relay & Sensor Automation">Home Automation & Relays</option>
                <option value="Environmental & Telemetry Monitoring">Environmental Weather Station</option>
                <option value="Modern C++ Embedded Control">Modern C++ Embedded Control</option>
              </select>
            </div>
          </div>

          {/* Automatic Hardware Pin Allocation Badge */}
          <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-xs text-cyan-200 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white">Beginner Friendly: Zero Pin Guesswork!</span>
              <p className="text-[11px] text-blue-200/90 mt-0.5 leading-relaxed">
                Just mention what parts you want to connect (like "ultrasonic sensor and 2 motors"). VoltStar automatically picks safe, non-conflicting pins and draws the wires for you.
              </p>
            </div>
          </div>

          {/* Prompt input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Describe the project or parts you want to use:
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build an obstacle-avoiding rover with ultrasonic distance sensor, motor driver, and buzzer on Arduino Uno..."
              className="w-full bg-[#0d1629] border border-blue-900/50 text-xs text-slate-100 placeholder-slate-500 rounded-xl p-3 focus:border-cyan-400 focus:outline-none leading-relaxed resize-none"
            />
          </div>

          {/* Instant Starters */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Or pick an instant beginner project:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTERS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickStarter(s)}
                  className="p-2.5 rounded-lg bg-[#0d1629] hover:bg-[#13223f] border border-blue-900/50 hover:border-cyan-500/60 text-left transition-all text-xs group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300 block truncate group-hover:text-cyan-200">
                      {s.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-900 text-blue-300 font-mono">
                      {s.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {s.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Generates C++ Code + Interactive Schematic</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-1.5 disabled:opacity-50 active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin fill-white" />
                    <span>Synthesizing Project...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    <span>Generate Code & Wiring</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
