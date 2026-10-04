import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Radio, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Send, 
  Play, 
  Pause, 
  CheckCircle2,
  HardDrive,
  Cpu,
  Info
} from 'lucide-react';
import { Diagnostic } from '../types';

interface BuildConsoleProps {
  platform: string;
  diagnostics: Diagnostic[];
  isCompiling: boolean;
  onRunCompile: () => void;
  onApplyFix: (diag: Diagnostic) => void;
}

export const BuildConsole: React.FC<BuildConsoleProps> = ({
  platform,
  diagnostics,
  isCompiling,
  onRunCompile,
  onApplyFix
}) => {
  const [isOpen, setIsOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [activeTab, setActiveTab] = useState<'compiler' | 'serial' | 'diagnostics'>('compiler');
  const [serialLogs, setSerialLogs] = useState<string[]>([
    `[00:00:01.002] ⚡ VoltStar Code - Serial Console Connected (115200 baud)`,
    `[00:00:01.120] [VoltStar] System Boot: Hardware peripherals initialized.`,
    `[00:00:01.250] [VoltStar] Board: ${platform} online.`
  ]);
  const [serialInput, setSerialInput] = useState('');
  const [baudRate, setBaudRate] = useState('115200');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const serialEndRef = useRef<HTMLDivElement>(null);

  // Periodic serial telemetry simulation matching the active sketch
  useEffect(() => {
    if (isPaused) return;

    let cycle = 1;
    const interval = setInterval(() => {
      cycle++;
      const distance = Math.floor(18 + Math.random() * 25);
      const voltage = (2.1 + Math.random() * 0.8).toFixed(2);
      const isAlert = distance < 20;

      const log = `[VoltStar #${cycle}] Dist: ${distance} cm | Analog A0: ${voltage} V | Motor PWM: ${isAlert ? 0 : 180} | Alert: ${isAlert ? 'STOPPED 🛑' : 'CLEAR ✓'}`;

      setSerialLogs((prev) => [...prev.slice(-100), log]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && serialEndRef.current) {
      serialEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLogs, autoScroll]);

  const sendCommand = (cmdText: string) => {
    const cmd = cmdText.trim().toUpperCase();
    const userLog = `> ${cmdText.trim()}`;
    let resp = `[Firmware] Command '${cmd}' executed successfully.`;

    if (cmd === 'HELP') {
      resp = `[Firmware] Available commands: HELP, STOP, START, CALIBRATE, PING, STATUS`;
    } else if (cmd === 'PING') {
      resp = `[Firmware] PONG! System latency: 0.42ms.`;
    } else if (cmd === 'STOP') {
      resp = `[Firmware] MOTORS EMERGENCY STOP ENGAGED. PWM = 0.`;
    } else if (cmd === 'STATUS') {
      resp = `[Firmware] MCU: ATmega328P | VCC: 5.02V | Free RAM: 1480 bytes | Uptime: 42s`;
    } else if (cmd === 'CALIBRATE') {
      resp = `[Firmware] Ultrasonic & Analog sensors zero-point calibrated.`;
    }

    setSerialLogs((prev) => [...prev, userLog, resp]);
  };

  const handleSendSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim()) return;
    sendCommand(serialInput);
    setSerialInput('');
  };

  const hasErrors = diagnostics.some((d) => d.severity === 'error');
  const hasWarnings = diagnostics.some((d) => d.severity === 'warning');

  return (
    <div className="bg-[#050812] border-t border-blue-950/80 text-slate-200 select-none flex flex-col transition-all z-20">
      {/* Console Header Bar */}
      <div className="h-9 bg-[#04060f] px-3 flex items-center justify-between border-b border-blue-950/60 text-xs">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              setActiveTab('compiler');
              if (!isOpen) setIsOpen(true);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'compiler' && isOpen
                ? 'bg-[#0e1629] text-cyan-300 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Virtual Build Console</span>
            <span className="sm:hidden">Terminal</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('serial');
              if (!isOpen) setIsOpen(true);
            }}
            className={`flex items-center space-x-1.5 px-2 sm:px-3 py-1 rounded transition-colors ${
              activeTab === 'serial' && isOpen
                ? 'bg-[#0e1629] text-cyan-300 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Live Serial Monitor</span>
            <span className="sm:hidden">Serial</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5 sm:ml-1" />
          </button>

          <button
            onClick={() => {
              setActiveTab('diagnostics');
              if (!isOpen) setIsOpen(true);
            }}
            className={`flex items-center space-x-1.5 px-2 sm:px-3 py-1 rounded transition-colors ${
              activeTab === 'diagnostics' && isOpen
                ? 'bg-[#0e1629] text-rose-300 font-semibold border-b-2 border-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${hasErrors ? 'text-rose-400' : hasWarnings ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Diagnostics ({diagnostics.length})</span>
            <span className="sm:hidden">Issues ({diagnostics.length})</span>
          </button>
        </div>

        {/* Console Controls */}
        <div className="flex items-center space-x-2">
          {activeTab === 'serial' && isOpen && (
            <div className="flex items-center space-x-2 mr-2">
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className="bg-[#0b1324] border border-blue-900/60 text-[11px] text-cyan-300 rounded px-1.5 py-0.5 focus:outline-none"
              >
                <option value="9600">9600 baud</option>
                <option value="57600">57600 baud</option>
                <option value="115200">115200 baud</option>
              </select>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title={isPaused ? 'Resume Serial Stream' : 'Pause Stream'}
              >
                {isPaused ? <Play className="w-3 h-3 text-cyan-400" /> : <Pause className="w-3 h-3 text-blue-400" />}
              </button>

              <button
                onClick={() => setSerialLogs([])}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="Clear Output"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isOpen ? 'Collapse Console' : 'Expand Console'}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Console Body Area */}
      {isOpen && (
        <div className="h-32 sm:h-44 max-h-[35vh] overflow-hidden flex flex-col font-mono-code text-xs bg-[#04060e]">
          {/* TAB 1: BUILD / COMPILER CONSOLE */}
          {activeTab === 'compiler' && (
            <div className="p-3 overflow-y-auto flex-1 space-y-2 select-text">
              <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                <span className="text-cyan-400 font-semibold">⚡ Initializing VoltStar Embedded Toolchain...</span>
                <span>•</span>
                <span>Target: {platform}</span>
                <span>•</span>
                <span>Compiler: avr-g++ (GCC 11.2.0)</span>
              </div>

              <div className="text-slate-300 text-[11px] leading-relaxed">
                Compiling sketch files: main.cpp pins_config.h telemetry.h...<br />
                Linking object files: main.o wire.o hardware.o<br />
                {hasErrors ? (
                  <span className="text-rose-400 font-bold block mt-1">
                    Build Failed! Check the Diagnostics tab for syntax errors.
                  </span>
                ) : hasWarnings ? (
                  <span className="text-amber-300 block mt-1">
                    Build Warning: Code contains syntax issues or blocking delays. Virtual flash succeeded with warnings.
                  </span>
                ) : (
                  <span className="text-cyan-300 block mt-1 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
                    Virtual compilation successful! Flash verification: Passed. (Ready to upload to hardware)
                  </span>
                )}
              </div>

              {/* Memory Footprint Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-950/70">
                <div className="bg-[#08101e] p-2 rounded-lg border border-blue-900/40 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      <span>Program Storage (Flash Memory):</span>
                    </span>
                    <span className="text-cyan-300 font-semibold">248,832 bytes (19%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full w-[19%]" />
                  </div>
                </div>

                <div className="bg-[#08101e] p-2 rounded-lg border border-blue-900/40 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 flex items-center space-x-1">
                      <Cpu className="w-3 h-3 text-blue-400" />
                      <span>Dynamic Memory (SRAM Variables):</span>
                    </span>
                    <span className="text-blue-300 font-semibold">21,450 bytes (6.5%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-sky-400 h-full w-[6.5%]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SERIAL MONITOR */}
          {activeTab === 'serial' && (
            <div className="flex flex-col h-full">
              {/* Beginner Quick Command Buttons */}
              <div className="bg-[#070d1a] border-b border-blue-950/70 px-3 py-1 flex items-center space-x-2 text-[11px]">
                <span className="text-slate-400">Quick Test Commands:</span>
                {['HELP', 'STOP', 'STATUS', 'CALIBRATE', 'PING'].map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => sendCommand(cmd)}
                    className="px-2 py-0.5 rounded bg-[#0e172a] hover:bg-[#16233d] border border-blue-900/60 text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-1 select-text">
                {serialLogs.map((log, index) => {
                  const isUser = log.startsWith('>');
                  const isFirmware = log.startsWith('[Firmware]');
                  const isAlert = log.includes('STOPPED');

                  return (
                    <div
                      key={index}
                      className={`text-[11px] leading-relaxed ${
                        isUser
                          ? 'text-cyan-300 font-bold'
                          : isFirmware
                          ? 'text-blue-300'
                          : isAlert
                          ? 'text-amber-300 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}
                <div ref={serialEndRef} />
              </div>

              {/* Serial input bar */}
              <form
                onSubmit={handleSendSerial}
                className="h-8 bg-[#060a16] border-t border-blue-950/70 px-2 flex items-center space-x-2"
              >
                <span className="text-blue-400 text-xs font-mono">&gt;</span>
                <input
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  placeholder="Send command to Arduino (e.g. HELP, STOP, CALIBRATE, PING)..."
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-0.5 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-semibold flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: DIAGNOSTICS & LINTER */}
          {activeTab === 'diagnostics' && (
            <div className="p-3 overflow-y-auto flex-1 space-y-2 select-text">
              {diagnostics.length === 0 ? (
                <div className="flex items-center space-x-2 text-cyan-300 py-4 justify-center text-xs">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>No static analysis errors or warnings detected! Clean code.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {diagnostics.map((d, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg border text-xs flex items-start justify-between ${
                        d.severity === 'error'
                          ? 'bg-rose-950/20 border-rose-800/50 text-rose-300'
                          : 'bg-blue-950/30 border-blue-800/50 text-blue-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                            Line {d.line}
                          </span>
                          <span className="font-semibold">{d.message}</span>
                        </div>
                        {d.fixSuggestion && (
                          <div className="text-[11px] text-slate-400 pl-8">
                            Fix: <span className="font-mono text-cyan-300">{d.fixSuggestion}</span>
                          </div>
                        )}
                      </div>

                      {d.fixSuggestion && (
                        <button
                          onClick={() => onApplyFix(d)}
                          className="px-2 py-1 rounded bg-[#0b1424] hover:bg-[#12203a] text-cyan-300 border border-cyan-500/30 text-[11px] font-medium"
                        >
                          Auto-Fix
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
