import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  ListTree, 
  AlertTriangle, 
  Package, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sliders, 
  Copy, 
  Check, 
  FileSpreadsheet,
  ShieldAlert,
  Info,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { Project, PinAssignment, BomItem } from '../types';

interface WiringStudioProps {
  project: Project;
}

export const WiringStudio: React.FC<WiringStudioProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'schematic' | 'checklist' | 'pinout' | 'bom' | 'gotchas'>('schematic');
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>('D5~');
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedPinout, setCopiedPinout] = useState(false);
  const [copiedBom, setCopiedBom] = useState(false);
  const [filterPinQuery, setFilterPinQuery] = useState('');
  const [checkedWires, setCheckedWires] = useState<Record<number, boolean>>({});

  // Live simulation interactive controls
  const [simDistance, setSimDistance] = useState<number>(28);
  const [simAnalog, setSimAnalog] = useState<number>(450);

  const isObstacle = simDistance < 20;

  // Board pin positions calculation for Arduino Uno
  const boardLeftPins = [
    { name: 'VIN', y: 100, type: 'POWER', tip: 'External battery voltage input (7V - 12V).' },
    { name: 'GND', y: 125, type: 'GROUND', tip: 'Ground 0V. Every component MUST connect to GND to complete the electrical circuit.' },
    { name: 'GND', y: 150, type: 'GROUND', tip: 'Second ground pin for convenient multiple sensor wiring.' },
    { name: '5V', y: 175, type: 'POWER', tip: 'Regulated +5V power rail. Powers the microchips, sensors, and servos.' },
    { name: '3.3V', y: 200, type: 'POWER', tip: 'Regulated 3.3V power rail for low-voltage sensors.' },
    { name: 'RESET', y: 225, type: 'SYS', tip: 'Pulling this LOW restarts the microcontroller program.' },
    { name: 'IOREF', y: 250, type: 'SYS', tip: 'Voltage reference for Arduino shields (5.0V on Uno).' },
    { name: 'A0', y: 310, type: 'ADC', tip: 'Analog Input 0. Reads analog voltage (0V to 5V) converted to 0-1023.' },
    { name: 'A1', y: 335, type: 'ADC', tip: 'Analog Input 1. General sensor voltage measurement.' },
    { name: 'A2', y: 360, type: 'ADC', tip: 'Analog Input 2. 10-bit ADC channel.' },
    { name: 'A3', y: 385, type: 'ADC', tip: 'Analog Input 3. 10-bit ADC channel.' },
    { name: 'A4 (SDA)', y: 410, type: 'I2C', tip: 'I2C Serial Data line. Connects to screens (OLED) and gyro chips.' },
    { name: 'A5 (SCL)', y: 435, type: 'I2C', tip: 'I2C Serial Clock line. Synchronizes 2-wire data packets.' },
  ];

  const boardRightPins = [
    { name: 'D13', y: 100, type: 'DIGITAL', tip: 'Digital Pin 13. Connected to the onboard test LED on the circuit board.' },
    { name: 'D12', y: 125, type: 'DIGITAL', tip: 'Digital Pin 12. Standard high/low input or output.' },
    { name: 'D11~', y: 150, type: 'PWM', tip: 'Digital Pin 11 (~PWM). Timer 2 pulse width modulation for speed/dimming.' },
    { name: 'D10~', y: 175, type: 'PWM', tip: 'Digital Pin 10 (~PWM). Hardware timer PWM output.' },
    { name: 'D9~', y: 200, type: 'PWM', tip: 'Digital Pin 9 (~PWM). Precision 50Hz Timer 1 servo control output.' },
    { name: 'D8', y: 225, type: 'DIGITAL', tip: 'Digital Pin 8. Motor driver direction logic.' },
    { name: 'D7', y: 270, type: 'DIGITAL', tip: 'Digital Pin 7. Motor driver direction logic.' },
    { name: 'D6~', y: 295, type: 'PWM', tip: 'Digital Pin 6 (~PWM). Hardware Timer 0 PWM output.' },
    { name: 'D5~', y: 320, type: 'PWM', tip: 'Digital Pin 5 (~PWM). Hardware Timer 0 PWM output for motor speed.' },
    { name: 'D4', y: 345, type: 'DIGITAL', tip: 'Digital Pin 4. Digital buzzer or relay output.' },
    { name: 'D3~', y: 370, type: 'PWM', tip: 'Digital Pin 3 (~PWM / Interrupt). Hardware interrupt capable.' },
    { name: 'D2', y: 395, type: 'INT', tip: 'Digital Pin 2 (Interrupt 0). High speed optical encoder input.' },
    { name: 'TX (D1)', y: 420, type: 'UART', tip: 'USB Serial Transmit. Reserved for computer communication.' },
    { name: 'RX (D0)', y: 445, type: 'UART', tip: 'USB Serial Receive. Reserved for computer communication.' },
  ];

  const allPins = [...boardLeftPins, ...boardRightPins];

  // Helper to find board pin coordinates
  const getPinCoordinate = (pinName: string): { x: number; y: number } => {
    const clean = pinName.replace(/[~()]/g, '').trim().toUpperCase();

    const leftMatch = boardLeftPins.find(p => p.name.replace(/[~()]/g, '').trim().toUpperCase() === clean);
    if (leftMatch) return { x: 40, y: leftMatch.y };

    const rightMatch = boardRightPins.find(p => p.name.replace(/[~()]/g, '').trim().toUpperCase() === clean);
    if (rightMatch) return { x: 260, y: rightMatch.y };

    return { x: 260, y: 300 };
  };

  const copyPinoutMarkdown = async () => {
    let md = `| Board Pin | Component | Component Pin | Wire Color | Signal Type | Notes |\n|---|---|---|---|---|---|\n`;
    project.pinTable.forEach(p => {
      md += `| ${p.boardPin} | ${p.component} | ${p.componentPin} | ${p.wireColor} | ${p.signalType} | ${p.notes} |\n`;
    });
    try {
      await navigator.clipboard.writeText(md);
      setCopiedPinout(true);
      setTimeout(() => setCopiedPinout(false), 2000);
    } catch {}
  };

  const copyBomCSV = async () => {
    let csv = `Item,Quantity,Specification,Functional Role\n`;
    project.bom.forEach(b => {
      csv += `"${b.name}",${b.quantity},"${b.spec}","${b.role}"\n`;
    });
    try {
      await navigator.clipboard.writeText(csv);
      setCopiedBom(true);
      setTimeout(() => setCopiedBom(false), 2000);
    } catch {}
  };

  const filteredPins = project.pinTable.filter(p => 
    p.boardPin.toLowerCase().includes(filterPinQuery.toLowerCase()) ||
    p.component.toLowerCase().includes(filterPinQuery.toLowerCase()) ||
    p.signalType.toLowerCase().includes(filterPinQuery.toLowerCase())
  );

  const activePinInfo = allPins.find(p => p.name === (hoveredPin || selectedPin));
  const activePinAssignment = project.pinTable.find(p => p.boardPin.includes(hoveredPin || selectedPin || ''));

  return (
    <div className="flex flex-col h-full bg-[#070b16] text-slate-200">
      {/* Subtab Navigation Bar */}
      <div className="h-10 bg-[#050812] border-b border-blue-950/60 flex items-center justify-between px-3 text-xs select-none">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('schematic')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'schematic'
                ? 'bg-[#0b1324] text-cyan-300 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Schematic</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'checklist'
                ? 'bg-[#0b1324] text-cyan-300 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Beginner Wiring Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('pinout')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'pinout'
                ? 'bg-[#0b1324] text-blue-300 border-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <ListTree className="w-3.5 h-3.5 text-blue-400" />
            <span>Pinout Table</span>
          </button>

          <button
            onClick={() => setActiveTab('bom')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'bom'
                ? 'bg-[#0b1324] text-sky-300 border-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-sky-400" />
            <span>Hardware BOM ({project.bom.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gotchas')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'gotchas'
                ? 'bg-[#0b1324] text-rose-300 border-rose-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Safety Gotchas</span>
          </button>
        </div>

        {/* Zoom Controls for schematic */}
        {activeTab === 'schematic' && (
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center bg-[#0e1629] border border-blue-900/60 rounded-lg p-0.5 text-slate-400">
              <button
                onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.1))}
                className="p-1 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="px-1.5 text-[10px] font-mono text-cyan-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                className="p-1 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:text-white rounded ml-1 text-slate-500 hover:text-slate-300"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        {/* TAB 1: INTERACTIVE SCHEMATIC */}
        {activeTab === 'schematic' && (
          <div className="flex flex-col h-full bg-schematic-grid relative overflow-hidden">
            {/* Beginner Quick Helper Strip */}
            <div className="bg-[#091122]/95 backdrop-blur border-b border-blue-900/50 px-4 py-2 flex items-center justify-between text-xs z-10 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-cyan-200">Beginner Wiring Tip:</span>
                <span className="text-[11px] text-slate-300">
                  Click any pin on the Arduino board to highlight its wire and read what it does!
                </span>
              </div>

              {/* Wire Color Legend */}
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="text-slate-300">Red: 5V Power</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                  <span className="text-slate-300">Black: GND</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="text-slate-300">Yellow: PWM</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                  <span className="text-slate-300">Cyan: Signals</span>
                </span>
              </div>
            </div>

            {/* Live Interactive Hardware Simulation Bar */}
            <div className="bg-[#080d1a]/90 backdrop-blur border-b border-blue-950/70 px-4 py-2 flex items-center justify-between text-xs z-10">
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-slate-200">Test Circuit in Real Time:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  isObstacle ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {isObstacle ? 'OBSTACLE DETECTED (<20cm) 🛑' : 'ROVER CRUISING ✓'}
                </span>
              </div>

              <div className="flex items-center space-x-6">
                {/* Distance Slider */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Ultrasonic Distance:</span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={simDistance}
                    onChange={(e) => setSimDistance(parseInt(e.target.value))}
                    className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="font-mono text-cyan-300 text-xs w-8 text-right font-bold">{simDistance}cm</span>
                </div>

                {/* Analog Slider */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Analog (A0):</span>
                  <input
                    type="range"
                    min="0"
                    max="1023"
                    value={simAnalog}
                    onChange={(e) => setSimAnalog(parseInt(e.target.value))}
                    className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                  />
                  <span className="font-mono text-blue-300 text-xs w-12 text-right">{((simAnalog / 1023) * 5).toFixed(2)}V</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="relative w-[860px] h-[640px] select-none"
              >
                <svg
                  className="w-full h-full"
                  viewBox="0 0 860 640"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* DEFINE FILTERS & PATTERNS */}
                  <defs>
                    <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="boardGradBlue" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#082f49" />
                      <stop offset="100%" stopColor="#041829" />
                    </linearGradient>
                    <linearGradient id="chipGradBlue" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0f1f38" />
                      <stop offset="100%" stopColor="#091322" />
                    </linearGradient>
                  </defs>

                  {/* 1. ARDUINO UNO BOARD SVG SHAPE */}
                  <g id="arduino-uno-board">
                    {/* PCB Board Body (Electric Blue Outline) */}
                    <rect
                      x="40"
                      y="40"
                      width="220"
                      height="500"
                      rx="16"
                      fill="url(#boardGradBlue)"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />

                    {/* Arduino Uno USB Port */}
                    <rect x="55" y="15" width="45" height="35" rx="3" fill="#cbd5e1" stroke="#64748b" />
                    <rect x="65" y="10" width="25" height="15" fill="#475569" />

                    {/* DC Barrel Jack */}
                    <rect x="175" y="15" width="45" height="40" rx="4" fill="#0f172a" stroke="#1e293b" />
                    <circle cx="197" cy="35" r="7" fill="#020617" />

                    {/* ATmega328P DIP-28 Chip */}
                    <rect
                      x="100"
                      y="240"
                      width="100"
                      height="170"
                      rx="4"
                      fill="url(#chipGradBlue)"
                      stroke="#1e3a8a"
                      strokeWidth="1.5"
                    />
                    <text x="150" y="320" fill="#93c5fd" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      ATmega328P
                    </text>
                    <text x="150" y="335" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      16 MHz Crystal
                    </text>

                    {/* VoltStar Branding on PCB */}
                    <text x="150" y="140" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
                      VoltStar Code
                    </text>
                    <text x="150" y="155" fill="#60a5fa" fontSize="9" textAnchor="middle">
                      {project.targetPlatform}
                    </text>

                    {/* Built-in Status LED D13 */}
                    <circle
                      cx="110"
                      cy="185"
                      r="6"
                      fill={isObstacle ? '#f59e0b' : '#38bdf8'}
                      className={isObstacle ? 'animate-pulse' : ''}
                      filter="url(#glow-blue)"
                    />
                    <text x="122" y="188" fill="#93c5fd" fontSize="8" fontFamily="monospace">
                      LED (D13)
                    </text>

                    {/* LEFT HEADER PINS (Power & Analog) */}
                    {boardLeftPins.map((pin, i) => {
                      const isHighlighted = (hoveredPin || selectedPin) === pin.name;
                      return (
                        <g
                          key={i}
                          onClick={() => setSelectedPin(pin.name)}
                          onMouseEnter={() => setHoveredPin(pin.name)}
                          onMouseLeave={() => setHoveredPin(null)}
                          className="cursor-pointer"
                        >
                          <rect
                            x="42"
                            y={pin.y - 8}
                            width="16"
                            height="16"
                            rx="3"
                            fill={isHighlighted ? '#0284c7' : '#0a1426'}
                            stroke={isHighlighted ? '#38bdf8' : '#1e3a8a'}
                          />
                          <circle cx="50" cy={pin.y} r="3" fill="#93c5fd" />
                          <text x="65" y={pin.y + 4} fill={isHighlighted ? '#38bdf8' : '#cbd5e1'} fontSize="9" fontFamily="monospace" fontWeight={isHighlighted ? 'bold' : 'normal'}>
                            {pin.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* RIGHT HEADER PINS (Digital & PWM) */}
                    {boardRightPins.map((pin, i) => {
                      const isHighlighted = (hoveredPin || selectedPin) === pin.name;
                      return (
                        <g
                          key={i}
                          onClick={() => setSelectedPin(pin.name)}
                          onMouseEnter={() => setHoveredPin(pin.name)}
                          onMouseLeave={() => setHoveredPin(null)}
                          className="cursor-pointer"
                        >
                          <rect
                            x="242"
                            y={pin.y - 8}
                            width="16"
                            height="16"
                            rx="3"
                            fill={isHighlighted ? '#0284c7' : '#0a1426'}
                            stroke={isHighlighted ? '#38bdf8' : '#1e3a8a'}
                          />
                          <circle cx="250" cy={pin.y} r="3" fill="#93c5fd" />
                          <text x="235" y={pin.y + 4} fill={isHighlighted ? '#38bdf8' : '#cbd5e1'} fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight={isHighlighted ? 'bold' : 'normal'}>
                            {pin.name}
                          </text>
                        </g>
                      );
                    })}
                  </g>

                  {/* 2. COMPONENT MODULES CARDS (Right side) */}
                  {project.wiringDiagram.components.map((comp) => {
                    const isCompHovered = hoveredComponentId === comp.id;
                    const compY = comp.y;

                    return (
                      <g
                        key={comp.id}
                        id={comp.id}
                        onMouseEnter={() => setHoveredComponentId(comp.id)}
                        onMouseLeave={() => setHoveredComponentId(null)}
                        className="cursor-pointer transition-all"
                      >
                        {/* Module Card Background */}
                        <rect
                          x={comp.x}
                          y={compY}
                          width="300"
                          height="95"
                          rx="10"
                          fill="#0a1224"
                          stroke={isCompHovered ? '#38bdf8' : '#172545'}
                          strokeWidth={isCompHovered ? '2' : '1'}
                          filter={isCompHovered ? 'url(#glow-blue)' : undefined}
                        />

                        {/* Module Header Icon */}
                        <rect x={comp.x + 10} y={compY + 10} width="24" height="24" rx="6" fill="#132342" />
                        <circle cx={comp.x + 22} cy={compY + 22} r="4" fill="#38bdf8" />

                        {/* Title & Role */}
                        <text x={comp.x + 42} y={compY + 24} fill="#f1f5f9" fontSize="11" fontWeight="bold">
                          {comp.name}
                        </text>
                        <text x={comp.x + 42} y={compY + 38} fill="#93c5fd" fontSize="9">
                          Assigned: {comp.assignedPin}
                        </text>

                        {/* Component Pins Row */}
                        <g>
                          {comp.pins.map((pinName, pIdx) => {
                            const pinX = comp.x + 15 + pIdx * 54;
                            const pinY = compY + 68;
                            const isPinHovered = hoveredPin === pinName;

                            return (
                              <g
                                key={pIdx}
                                onMouseEnter={(e) => {
                                  e.stopPropagation();
                                  setHoveredPin(pinName);
                                }}
                                onMouseLeave={() => setHoveredPin(null)}
                              >
                                <rect
                                  x={pinX - 4}
                                  y={pinY - 14}
                                  width="48"
                                  height="22"
                                  rx="4"
                                  fill={isPinHovered ? '#1e3a8a' : '#070f1e'}
                                  stroke={isPinHovered ? '#60a5fa' : '#1e2d4d'}
                                />
                                <circle cx={pinX + 4} cy={pinY - 3} r="3" fill="#60a5fa" />
                                <text x={pinX + 12} y={pinY} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                                  {pinName.slice(0, 5)}
                                </text>
                              </g>
                            );
                          })}
                        </g>

                        {/* Live Visual Indicators on Component Cards */}
                        {comp.id === 'comp-servo' && (
                          <g transform={`translate(${comp.x + 265}, ${compY + 30})`}>
                            <circle cx="0" cy="0" r="14" fill="#0f1f3a" stroke="#2563eb" />
                            {/* Sweeping needle */}
                            <line
                              x1="0"
                              y1="0"
                              x2={isObstacle ? "-8" : "8"}
                              y2={isObstacle ? "-8" : "-8"}
                              stroke="#38bdf8"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                            <text x="0" y="24" fill="#38bdf8" fontSize="8" textAnchor="middle" fontWeight="bold">
                              {isObstacle ? '45° Scan' : '90° Center'}
                            </text>
                          </g>
                        )}

                        {comp.id === 'comp-motor-driver' && (
                          <g transform={`translate(${comp.x + 265}, ${compY + 30})`}>
                            <circle
                              cx="0"
                              cy="0"
                              r="14"
                              fill="#0f1f3a"
                              stroke={isObstacle ? '#ef4444' : '#38bdf8'}
                              className={isObstacle ? '' : 'animate-spin'}
                              style={{ transformOrigin: `${comp.x + 265}px ${compY + 30}px`, animationDuration: '2s' }}
                            />
                            <text x="0" y="24" fill={isObstacle ? '#ef4444' : '#38bdf8'} fontSize="8" textAnchor="middle" fontWeight="bold">
                              {isObstacle ? 'STOPPED' : '180 PWM'}
                            </text>
                          </g>
                        )}

                        {comp.id === 'comp-buzzer' && (
                          <g transform={`translate(${comp.x + 265}, ${compY + 30})`}>
                            <circle
                              cx="0"
                              cy="0"
                              r="12"
                              fill={isObstacle ? '#f97316' : '#0f1f3a'}
                              className={isObstacle ? 'animate-pulse' : ''}
                            />
                            <text x="0" y="22" fill={isObstacle ? '#f97316' : '#64748b'} fontSize="8" textAnchor="middle" fontWeight="bold">
                              {isObstacle ? 'ALARM ON' : 'MUTE'}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* 3. WIRE CONNECTIONS (SVG Bezier Paths with animated current) */}
                  <g id="circuit-wire-connections">
                    {project.wiringDiagram.connections.map((conn, idx) => {
                      const fromCoord = getPinCoordinate(conn.fromPin);
                      const targetComp = project.wiringDiagram.components.find(c => c.id === conn.toComponentId);
                      const compY = targetComp ? targetComp.y : 300;
                      const targetX = targetComp ? targetComp.x : 520;
                      const targetY = compY + 68;

                      const midX = (fromCoord.x + targetX) / 2;
                      const isHighlighted =
                        (hoveredPin || selectedPin) === conn.fromPin ||
                        (hoveredPin || selectedPin) === conn.toPin ||
                        hoveredComponentId === conn.toComponentId;

                      const pathData = `M ${fromCoord.x} ${fromCoord.y} C ${midX} ${fromCoord.y}, ${midX} ${targetY}, ${targetX} ${targetY}`;

                      return (
                        <g key={idx} className="transition-all">
                          {/* Glow background on hover */}
                          {isHighlighted && (
                            <path
                              d={pathData}
                              fill="none"
                              stroke={conn.color}
                              strokeWidth="6"
                              opacity="0.6"
                              filter="url(#glow-blue)"
                            />
                          )}

                          {/* Base colored wire */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke={conn.color}
                            strokeWidth={isHighlighted ? '3.5' : '2'}
                            opacity={isHighlighted ? 1 : 0.85}
                          />

                          {/* Running electrical current pulse animation */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="animate-wire-current"
                            opacity={isHighlighted ? 0.95 : 0.4}
                          />

                          {/* Wire label pill */}
                          {isHighlighted && (
                            <g transform={`translate(${midX - 40}, ${(fromCoord.y + targetY) / 2 - 10})`}>
                              <rect width="80" height="20" rx="4" fill="#040814" stroke={conn.color} strokeWidth="1.5" />
                              <text x="40" y="13" fill={conn.color} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                                {conn.label.slice(0, 14)}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>
            </div>

            {/* Bottom Pin Inspector Card (For Beginners) */}
            <div className="bg-[#050914] border-t border-blue-950/80 px-4 py-2.5 flex items-center justify-between text-xs select-text">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-300 font-mono font-bold">
                  {(hoveredPin || selectedPin || 'D5~').slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-cyan-200">
                      Pin {hoveredPin || selectedPin || 'D5~'}
                    </span>
                    {activePinAssignment && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-cyan-300 border border-blue-800">
                        Wires to: {activePinAssignment.component} ({activePinAssignment.componentPin})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activePinInfo?.tip || activePinAssignment?.notes || 'Connects microcontroller pin to your peripheral device.'}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-2 text-[11px] text-blue-300/80">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auto-routed by VoltStar AI</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BEGINNER STEP-BY-STEP WIRING CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="p-6 max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  <span>Step-by-Step Wiring Checklist</span>
                </h3>
                <p className="text-xs text-blue-300/80 mt-0.5">
                  Check off each wire as you plug it into your physical Arduino board!
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCheckedWires({})}
                  className="px-2.5 py-1 text-xs rounded bg-[#0e1629] text-slate-400 hover:text-white border border-blue-900/50"
                >
                  Reset Checklist
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="p-3 rounded-xl bg-[#091020] border border-blue-950/80 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Wiring Progress:</span>
                <span className="text-cyan-300 font-bold font-mono">
                  {Object.values(checkedWires).filter(Boolean).length} / {project.pinTable.length} Connected
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${(Object.values(checkedWires).filter(Boolean).length / Math.max(1, project.pinTable.length)) * 100}%` }}
                />
              </div>
              {Object.values(checkedWires).filter(Boolean).length === project.pinTable.length && (
                <div className="pt-1 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>🎉 All wires connected! You are ready to plug in the USB cable and upload your code!</span>
                </div>
              )}
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5">
              {project.pinTable.map((item, idx) => {
                const isChecked = !!checkedWires[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => setCheckedWires({ ...checkedWires, [idx]: !isChecked })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'bg-blue-950/30 border-cyan-500/40 opacity-75'
                        : 'bg-[#091020] border-blue-900/40 hover:border-cyan-500/50 hover:bg-[#0c162d]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isChecked
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                          : 'border-blue-700 bg-[#070b16]'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono font-bold text-xs ${isChecked ? 'text-slate-400 line-through' : 'text-cyan-300'}`}>
                            Step {idx + 1}: Arduino Pin {item.boardPin}
                          </span>
                          <span className="text-slate-500 font-mono">➔</span>
                          <span className={`font-semibold text-xs ${isChecked ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {item.component} ({item.componentPin})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {item.notes}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: item.wireColor }}
                        title={`Wire Color: ${item.wireColor}`}
                      />
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800">
                        {item.signalType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PINOUT TABLE */}
        {activeTab === 'pinout' && (
          <div className="p-6 max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <ListTree className="w-4 h-4 text-cyan-400" />
                  <span>Hardware Pin Assignment Matrix</span>
                </h3>
                <p className="text-xs text-blue-300/80 mt-0.5">
                  Beginner-friendly cheat sheet: matches each wire on your board to the right component pin.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Filter by pin or component..."
                  value={filterPinQuery}
                  onChange={(e) => setFilterPinQuery(e.target.value)}
                  className="bg-[#0b1324] border border-blue-900/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />

                <button
                  onClick={copyPinoutMarkdown}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0e172a] hover:bg-[#16223d] border border-blue-900/60 text-slate-300 text-xs transition-colors"
                >
                  {copiedPinout ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPinout ? 'Copied' : 'Copy Markdown'}</span>
                </button>
              </div>
            </div>

            <div className="border border-blue-950/80 rounded-xl overflow-hidden bg-[#091020]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#060b17] text-blue-300/80 border-b border-blue-950/80 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Board Pin</th>
                    <th className="py-3 px-4">Target Component</th>
                    <th className="py-3 px-4">Component Pin</th>
                    <th className="py-3 px-4">Wire Color</th>
                    <th className="py-3 px-4">Signal Type</th>
                    <th className="py-3 px-4">Engineering Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-950/50 font-mono-code">
                  {filteredPins.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#0d172e] transition-colors">
                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {item.boardPin}
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                        {item.component}
                      </td>
                      <td className="py-3 px-4 text-blue-300">
                        {item.componentPin}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shadow-sm"
                            style={{ backgroundColor: item.wireColor }}
                          />
                          <span className="text-slate-400 text-[11px] uppercase">{item.wireColor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#111e38] text-cyan-300 border border-blue-500/30">
                          {item.signalType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans text-[11px]">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: HARDWARE BILL OF MATERIALS (BOM) */}
        {activeTab === 'bom' && (
          <div className="p-6 max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  <span>Hardware Bill of Materials (BOM)</span>
                </h3>
                <p className="text-xs text-blue-300/80 mt-0.5">
                  Parts checklist for purchasing or finding parts in your starter kit.
                </p>
              </div>

              <button
                onClick={copyBomCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0e172a] hover:bg-[#16223d] border border-blue-900/60 text-slate-300 text-xs transition-colors"
              >
                {copiedBom ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedBom ? 'Copied CSV' : 'Export CSV'}</span>
              </button>
            </div>

            <div className="border border-blue-950/80 rounded-xl overflow-hidden bg-[#091020]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#060b17] text-blue-300/80 border-b border-blue-950/80 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Component Name</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4">Technical Specification</th>
                    <th className="py-3 px-4">What it does (Beginner Explanation)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-950/50">
                  {project.bom.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#0d172e] transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-300 font-bold">
                        {item.quantity}x
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {item.spec}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {item.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SAFETY GOTCHAS */}
        {activeTab === 'gotchas' && (
          <div className="p-6 max-w-4xl mx-auto space-y-4">
            <div>
              <h3 className="text-base font-bold text-rose-300 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Beginner Safety & Circuit Protection Gotchas</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Read these 3 rules to make sure you never damage your board or cause mysterious resets!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {project.potentialIssues.map((gotcha, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-r from-rose-950/30 to-[#0a1122] border border-rose-800/40 text-xs text-slate-200 flex items-start space-x-3.5 shadow-sm"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-rose-200">Rule #{idx + 1}</h4>
                    <p className="text-slate-300 leading-relaxed text-[12px]">{gotcha}</p>
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-[#091122] border border-blue-900/50 text-xs space-y-2">
                <h4 className="font-bold text-cyan-300 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Golden Electronics Rules for Beginners</span>
                </h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px] leading-relaxed">
                  <li><strong>Never short 5V directly to GND</strong>: Always ensure a resistor, sensor, or component sits between power and ground.</li>
                  <li><strong>Common Ground is mandatory</strong>: If using an external battery for your motors, the battery negative (-) must connect to Arduino GND.</li>
                  <li><strong>Unplug USB before rewiring</strong>: Always disconnect USB power when inserting or removing wires on your breadboard.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
