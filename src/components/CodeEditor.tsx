import React, { useState, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Wand2, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode, 
  WrapText,
  HelpCircle,
  Sparkles,
  Info,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Diagnostic } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  diagnostics: Diagnostic[];
  onApplyFix: (diag: Diagnostic) => void;
  platform: string;
  projectTitle: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  diagnostics,
  onApplyFix,
  platform,
  projectTitle
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'pins' | 'telemetry'>('main');
  const [fontSize, setFontSize] = useState(13);
  const [lineWrap, setLineWrap] = useState(false);
  const [showBeginnerExplainer, setShowBeginnerExplainer] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync scroll
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Copy code
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Export file
  const handleExport = () => {
    const isArduino = platform.toLowerCase().includes('arduino');
    const filename = isArduino
      ? `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'sketch'}.ino`
      : 'main.cpp';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const hasErrors = diagnostics.some((d) => d.severity === 'error');
  const hasWarnings = diagnostics.some((d) => d.severity === 'warning');

  // Secondary virtual file contents
  const pinsConfigFile = `// Auto-Generated VoltStar Pins Header for ${platform}
#ifndef PINS_CONFIG_H
#define PINS_CONFIG_H

#include <stdint.h>

// Microcontroller Pin Mapping Matrix
namespace Pins {
    constexpr uint8_t MOTOR_ENA = 5;   // Hardware PWM
    constexpr uint8_t MOTOR_IN1 = 7;   // Digital OUT
    constexpr uint8_t MOTOR_IN2 = 8;   // Digital OUT
    constexpr uint8_t SERVO_PIN = 9;   // Hardware PWM
    constexpr uint8_t US_TRIG   = 11;  // Digital OUT
    constexpr uint8_t US_ECHO   = 12;  // Digital IN
    constexpr uint8_t BUZZER    = 4;   // Digital OUT
    constexpr uint8_t ANALOG_IN = A0;  // 10-bit ADC
}

#endif // PINS_CONFIG_H`;

  const telemetryFile = `// Auto-Generated VoltStar Telemetry Struct
#ifndef TELEMETRY_H
#define TELEMETRY_H

#include <stdint.h>

struct SystemTelemetry {
    uint16_t distanceCm;
    uint16_t analogRaw;
    float sensorVoltage;
    uint8_t motorSpeed;
    int servoAngle;
    bool obstacleAlert;
    uint32_t loopCycle;
};

#endif // TELEMETRY_H`;

  const currentDisplayCode =
    activeTab === 'main'
      ? code
      : activeTab === 'pins'
      ? pinsConfigFile
      : telemetryFile;

  // Beginner plain-English breakdowns
  const beginnerExplanations = [
    {
      concept: '#include <Arduino.h>',
      meaning: 'Imports standard commands like digitalWrite() and pinMode() so your board understands them.'
    },
    {
      concept: 'pinMode(pin, OUTPUT/INPUT)',
      meaning: 'Configures a pin: OUTPUT sends voltage out (motors, lights); INPUT listens for signals (sensors, buttons).'
    },
    {
      concept: 'void setup() { ... }',
      meaning: 'Runs once at startup. Great for starting Serial monitor and setting initial pin directions.'
    },
    {
      concept: 'void loop() { ... }',
      meaning: 'Runs continuously forever like your robot’s heartbeat. Code here repeats thousands of times a second.'
    },
    {
      concept: 'millis() instead of delay()',
      meaning: 'Non-blocking timer! Unlike delay() which freezes the robot, millis() lets motors run while checking sensors in real time.'
    },
    {
      concept: 'analogWrite(pin, speed)',
      meaning: 'PWM control: sends pulses from 0 (stopped) to 255 (full speed) to smoothly control motor power.'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#070b16] border-r border-blue-950/60 text-slate-200">
      {/* Tab bar & Toolbar */}
      <div className="h-10 bg-[#050812] border-b border-blue-950/60 flex items-center justify-between px-3 text-xs select-none">
        {/* File Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg transition-colors border-b-2 font-mono ${
              activeTab === 'main'
                ? 'bg-[#0b1324] text-cyan-300 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>{platform.toLowerCase().includes('arduino') ? 'main.ino' : 'main.cpp'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pins')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg transition-colors border-b-2 font-mono ${
              activeTab === 'pins'
                ? 'bg-[#0b1324] text-blue-300 border-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>pins_config.h</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg transition-colors border-b-2 font-mono ${
              activeTab === 'telemetry'
                ? 'bg-[#0b1324] text-sky-300 border-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>telemetry.h</span>
          </button>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-2">
          {/* Beginner Explainer Toggle */}
          <button
            onClick={() => setShowBeginnerExplainer(!showBeginnerExplainer)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              showBeginnerExplainer
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
                : 'bg-[#0e1629] text-blue-300 hover:text-cyan-200 border border-blue-900/50'
            }`}
            title="Toggle Beginner Plain-English Code Explanations"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showBeginnerExplainer ? 'Hide Notes' : 'Explain for Beginners'}</span>
          </button>

          {/* Syntax Diagnostic status pill */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#0e1629] border border-blue-900/50 text-[11px]">
            {hasErrors ? (
              <span className="text-rose-400 flex items-center space-x-1 font-medium">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Syntax Error</span>
              </span>
            ) : hasWarnings ? (
              <span className="text-amber-300 flex items-center space-x-1 font-medium">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>{diagnostics.length} Notice{diagnostics.length > 1 ? 's' : ''}</span>
              </span>
            ) : (
              <span className="text-cyan-300 flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>C++ Syntax Clean</span>
              </span>
            )}
          </div>

          {/* Auto-apply fix if any */}
          {diagnostics.length > 0 && diagnostics[0].fixSuggestion && (
            <button
              onClick={() => onApplyFix(diagnostics[0])}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium transition-colors"
              title="Auto-apply static analysis fix"
            >
              <Wand2 className="w-3 h-3 text-cyan-400" />
              <span>Auto-Apply Fix</span>
            </button>
          )}

          {/* Font size adjustments */}
          <div className="flex items-center border border-blue-900/50 rounded bg-[#0e1629] text-slate-400 text-[11px]">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className="px-1.5 py-0.5 hover:text-white"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-1 text-slate-600">|</span>
            <button
              onClick={() => setFontSize(Math.min(18, fontSize + 1))}
              className="px-1.5 py-0.5 hover:text-white"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Line wrap toggle */}
          <button
            onClick={() => setLineWrap(!lineWrap)}
            className={`p-1 rounded border transition-colors ${
              lineWrap
                ? 'bg-blue-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-[#0e1629] text-slate-400 border-blue-900/50 hover:text-slate-200'
            }`}
            title="Toggle Soft Wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#0e1629] hover:bg-[#152038] border border-blue-900/50 text-slate-300 hover:text-white transition-all text-xs"
            title="Copy Code to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Export Button (Electric Blue) */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white font-medium border border-blue-500/40 transition-all text-xs shadow-sm shadow-blue-500/20"
            title="Download Sketch"
          >
            <Download className="w-3.5 h-3.5 text-cyan-200" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Beginner Explanation Drawer (Collapsible) */}
      {showBeginnerExplainer && (
        <div className="bg-[#0a1224] border-b border-cyan-500/30 p-3 text-xs space-y-2 max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between text-cyan-300 font-bold">
            <span className="flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Beginner Plain-English Code Translation Guide</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Click any topic to understand what this C++ code does</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {beginnerExplanations.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-[#070d1a] border border-blue-900/40 space-y-0.5">
                <div className="font-mono font-bold text-cyan-300">{item.concept}</div>
                <div className="text-slate-300 text-[10.5px] leading-relaxed">{item.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Body with Line Numbers */}
      <div className="flex-1 relative flex overflow-hidden font-mono-code">
        {/* Line numbers gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 py-3 bg-[#050813] text-blue-900 text-right pr-3 select-none overflow-hidden border-r border-blue-950/60"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.6rem' }}
        >
          {Array.from({ length: currentDisplayCode.split('\n').length }).map((_, i) => {
            const lineNum = i + 1;
            const hasError = diagnostics.some((d) => d.line === lineNum && d.severity === 'error');
            const hasWarning = diagnostics.some((d) => d.line === lineNum && d.severity === 'warning');

            return (
              <div
                key={i}
                className={`flex items-center justify-end space-x-1 ${
                  hasError ? 'text-rose-400 font-bold' : hasWarning ? 'text-amber-400' : 'text-slate-600'
                }`}
              >
                {hasError && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input */}
        <div className="flex-1 relative overflow-hidden bg-[#070b16]">
          <textarea
            ref={textareaRef}
            value={currentDisplayCode}
            readOnly={activeTab !== 'main'}
            onChange={(e) => {
              if (activeTab === 'main') {
                onChange(e.target.value);
              }
            }}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={`w-full h-full p-3 bg-transparent text-slate-200 outline-none resize-none font-mono-code z-10 selection:bg-blue-500/30 selection:text-cyan-200 ${
              lineWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.6rem',
              tabSize: 4,
            }}
          />
        </div>
      </div>

      {/* Footer bar */}
      <div className="h-6 bg-[#040710] border-t border-blue-950/60 px-3 flex items-center justify-between text-[11px] text-slate-500 select-none">
        <div className="flex items-center space-x-3">
          <span>Target: <span className="text-cyan-300">{platform}</span></span>
          <span>•</span>
          <span>Encoding: <span className="text-slate-400">UTF-8</span></span>
          <span>•</span>
          <span>Spaces: 4</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400/80">VoltStar Linter Active</span>
        </div>
      </div>
    </div>
  );
};
