import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Zap, 
  Cpu, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Lightbulb, 
  ShieldCheck, 
  Download,
  Flame,
  Layers,
  ArrowLeft
} from 'lucide-react';

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryStarter: () => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({
  isOpen,
  onClose,
  onTryStarter
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const STEPS = [
    {
      title: '1. What is an Arduino & Microcontroller?',
      subtitle: 'The tiny computer brain of your electronics project',
      icon: Cpu,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            Think of an <strong>Arduino Uno</strong> as a mini computer designed to interact with the physical world. Unlike your laptop, it has special pins that can directly control motors, turn on lights, and read information from sensors!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#0d1629] border border-blue-500/20 space-y-1">
              <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>What it can do:</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Measure distance with sound waves, turn water pumps on when soil is dry, rotate motors, display text on screens.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1629] border border-blue-500/20 space-y-1">
              <span className="font-bold text-blue-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>How it powers:</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Plug it into your computer via a standard USB cable. The USB cable supplies 5 Volts of power and uploads your C++ code!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '2. The 3 Types of Pins Explained Simply',
      subtitle: 'Where wires plug in and what each pin does',
      icon: Layers,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#0d1629] border border-cyan-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-cyan-300">1. Power Pins (5V & GND)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800">Must Have</span>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong>5V</strong> is the positive battery power (+). <strong>GND</strong> (Ground) is 0 Volts (-). Electricity always needs a complete circuit from 5V through your component and back to GND!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0d1629] border border-blue-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-300">2. Digital & PWM Pins (~ Pins D2-D13)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">ON / OFF / Speed</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Digital pins can be turned either <strong>HIGH (5V ON)</strong> or <strong>LOW (0V OFF)</strong>. Pins with a tilde <strong>~ (like D5~, D9~)</strong> can do <strong>PWM</strong>, which lets you dim LEDs or adjust motor speed from 0 to 255!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0d1629] border border-sky-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sky-300">3. Analog ADC Pins (A0 to A5)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-sky-300 border border-blue-800">Sensors</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Unlike digital pins that only know ON/OFF, Analog pins can read varying voltages from 0V to 5.0V (translated into numbers from 0 to 1023). Perfect for light sensors and moisture meters!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '3. Wire Color Coding (Never Get Confused!)',
      subtitle: 'Standard electronics color rule used worldwide',
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            Using the right wire colors makes troubleshooting 10x easier and prevents accidental short circuits:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
            <div className="p-2.5 rounded-lg bg-[#0e172a] border border-rose-500/30 flex items-center space-x-2.5">
              <div className="w-4 h-4 rounded-full bg-rose-500 shadow-sm" />
              <div>
                <span className="font-bold text-rose-300 block">RED WIRE</span>
                <span className="text-[10px] text-slate-400 font-sans">Always 5V Power (+)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0e172a] border border-slate-700 flex items-center space-x-2.5">
              <div className="w-4 h-4 rounded-full bg-slate-600 shadow-sm" />
              <div>
                <span className="font-bold text-slate-300 block">BLACK / DARK</span>
                <span className="text-[10px] text-slate-400 font-sans">Always Ground GND (-)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0e172a] border border-amber-500/30 flex items-center space-x-2.5">
              <div className="w-4 h-4 rounded-full bg-amber-400 shadow-sm" />
              <div>
                <span className="font-bold text-amber-300 block">YELLOW / ORANGE</span>
                <span className="text-[10px] text-slate-400 font-sans">PWM Speed & Servos</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0e172a] border border-cyan-500/30 flex items-center space-x-2.5">
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-sm" />
              <div>
                <span className="font-bold text-cyan-300 block">BLUE / GREEN</span>
                <span className="text-[10px] text-slate-400 font-sans">Sensors & Digital Data</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '4. How Arduino C++ Code Works',
      subtitle: 'Only 2 main sections to understand',
      icon: Lightbulb,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            Every Arduino C++ program has two primary functions that run automatically:
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#090f1d] border border-blue-500/30 font-mono-code">
              <span className="font-bold text-cyan-300">void setup() &#123; ... &#125;</span>
              <p className="text-[11px] text-slate-300 font-sans mt-1">
                <strong>Runs ONCE</strong> when you first plug in the board. This is where we prepare the pins (e.g. <code className="text-cyan-400">pinMode(13, OUTPUT)</code>) and start the Serial communication.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090f1d] border border-cyan-500/30 font-mono-code">
              <span className="font-bold text-blue-300">void loop() &#123; ... &#125;</span>
              <p className="text-[11px] text-slate-300 font-sans mt-1">
                <strong>Runs REPEATEDLY forever</strong> like a continuous heartbeat. Thousands of times per second, it reads sensors, checks if an obstacle is close, and updates motors!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '5. How to Upload to your Real Physical Board',
      subtitle: 'Get this running on real hardware in 3 easy clicks',
      icon: Download,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <div className="space-y-2">
            <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-[#0d1629] border border-blue-500/20">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <span className="font-bold text-slate-200">Export the Sketch</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click the <strong>Export</strong> button in VoltStar Code to download your ready-to-run <code>.ino</code> file.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-[#0d1629] border border-blue-500/20">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <span className="font-bold text-slate-200">Open in Official Arduino IDE</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Download free Arduino IDE (arduino.cc) and plug your Arduino Uno into your computer using a USB cable.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-[#0d1629] border border-cyan-500/30">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <span className="font-bold text-cyan-300">Click Upload (Arrow Icon ➔)</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Select your board and Port, then click Upload. The onboard LEDs will blink for 3 seconds, and your project is live!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0a101f] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#070b16] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">Beginner Electronics & C++ Guide</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800 font-semibold">
                  Zero Experience Required
                </span>
              </div>
              <p className="text-xs text-blue-400 font-medium">VoltStar Interactive Learning Series</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="px-6 py-3 bg-[#080d1a] border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-7 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                    : idx < currentStep
                    ? 'w-3 bg-blue-600'
                    : 'w-3 bg-slate-800'
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Step <span className="text-cyan-300 font-bold">{currentStep + 1}</span> of {STEPS.length}
          </span>
        </div>

        {/* Step Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800/60">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">{STEPS[currentStep].title}</h3>
              <p className="text-[11px] text-blue-300">{STEPS[currentStep].subtitle}</p>
            </div>
          </div>

          {STEPS[currentStep].content}
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-4 bg-[#070b16] border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTryStarter();
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Ready! Pick a Starter Project</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
