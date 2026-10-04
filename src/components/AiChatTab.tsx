import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Zap, 
  Copy, 
  Check, 
  Lightbulb, 
  Code2, 
  ArrowRight,
  FileCode,
  CheckCircle2,
  Globe,
  ExternalLink,
  Sparkles,
  Cpu,
  Trash2,
  BookOpen,
  Sliders,
  Search
} from 'lucide-react';
import { Project, ChatMessage } from '../types';
import { sendChatMessage } from '../services/aiService';

interface AiChatTabProps {
  project: Project;
  onApplyCodeSnippet?: (snippet: string, replaceFull?: boolean) => void;
}

export const AiChatTab: React.FC<AiChatTabProps> = ({ project, onApplyCodeSnippet }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### ⚡ Welcome to VoltStar Gemini AI Architect!
I am your interactive embedded systems C++ and electronics companion powered by **Google Gemini** with real-time **Google Search Grounding**.

**What can I do for you?**
- **Generate full C++ code**: Say *"make a code for..."* or *"write code for..."* and I'll generate a complete, working sketch with a 1-click **Apply to Editor** button!
- **Search real-time hardware data**: Ask about any sensor, IC, or library (e.g. *MPU6050*, *TMC2209*, *VL53L1X*) and I'll ground my answer in Google Search documentation.
- **Beginner tutor**: Ask *"Where do I plug this wire?"* or *"Why do we need a resistor?"* and I'll explain it in simple terms with zero confusing jargon.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      isGrounded: true,
      searchQueries: ['Arduino Uno pinout overview', 'embedded c++ best practices'],
      sources: [
        { title: 'Arduino Official Documentation', uri: 'https://docs.arduino.cc' },
        { title: 'Adafruit Learning System', uri: 'https://learn.adafruit.com' }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedCodeIndex, setAppliedCodeIndex] = useState<string | null>(null);

  // Gemini model and grounding settings
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'coder' | 'architect'>('tutor');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const QUICK_PROMPTS = [
    { label: 'LED & Button', prompt: 'Make a code for LED blinking with button toggle and debounce' },
    { label: 'SG90 Servo Sweep', prompt: 'Make a code for SG90 servo motor sweeping 0 to 180 degrees' },
    { label: 'Ultrasonic Buzzer', prompt: 'Make a code for HC-SR04 ultrasonic distance sensor with buzzer alarm' },
    { label: 'Explain Voltage & Current', prompt: 'Explain voltage, current, and ground to an absolute beginner using simple analogies' },
    { label: 'OLED Display I2C', prompt: 'How do I wire and program an SSD1306 0.96 inch I2C OLED display on Arduino Uno?' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessage({
        messages: [...messages, userMsg],
        currentProject: project,
        model: selectedModel,
        role: selectedRole,
        useSearchGrounding
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        searchQueries: data.searchQueries || [],
        sources: data.sources || [],
        modelUsed: data.modelUsed || selectedModel,
        isGrounded: data.isGrounded || (data.searchQueries && data.searchQueries.length > 0)
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Unable to process request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleApplyToEditor = (codeSnippet: string, blockKey: string) => {
    if (onApplyCodeSnippet) {
      const isFullSketch = codeSnippet.includes('void setup()') && codeSnippet.includes('void loop()');
      onApplyCodeSnippet(codeSnippet, isFullSketch);
      setAppliedCodeIndex(blockKey);
      setTimeout(() => setAppliedCodeIndex(null), 3000);
    }
  };

  // Helper to split message into text chunks and code blocks
  const parseMessageContent = (content: string, msgId: string) => {
    const codeBlockRegex = /```(?:cpp|ino|c\+\+|c)?([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; value: string; key: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let codeBlockIdx = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: content.substring(lastIndex, match.index),
          key: `${msgId}-text-${lastIndex}`
        });
      }
      parts.push({
        type: 'code',
        value: match[1].trim(),
        key: `${msgId}-code-${codeBlockIdx++}`
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex),
        key: `${msgId}-text-${lastIndex}`
      });
    }

    return parts;
  };

  return (
    <div className="flex flex-col h-full bg-[#070b16] text-slate-200">
      {/* Top Controls Bar: Model Selector, Role, and Search Grounding Toggle */}
      <div className="bg-[#050812] border-b border-blue-950/70 px-4 py-2.5 flex items-center justify-between text-xs select-none flex-wrap gap-2">
        {/* Brand & Model */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-white text-xs">Gemini AI Assistant</span>
          </div>

          <div className="h-4 w-px bg-blue-900/60" />

          {/* Model Selector */}
          <div className="flex items-center space-x-1.5 bg-[#0b1324] px-2 py-1 rounded-lg border border-blue-900/50">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-[11px] text-cyan-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash" className="bg-[#0b1324] text-cyan-200">
                gemini-3.5-flash (Fast + Search Grounded)
              </option>
              <option value="gemini-3.1-pro-preview" className="bg-[#0b1324] text-cyan-200">
                gemini-3.1-pro-preview (Complex C++ & STEM)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-[#0b1324] text-cyan-200">
                gemini-3.1-flash-lite (Instant Speed)
              </option>
            </select>
          </div>
        </div>

        {/* Role & Search Grounding Toggle */}
        <div className="flex items-center space-x-3">
          {/* Role selector */}
          <div className="flex items-center bg-[#091020] p-0.5 rounded-lg border border-blue-900/50 text-[11px]">
            <button
              onClick={() => setSelectedRole('tutor')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedRole === 'tutor'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Beginner-friendly tutor explaining electronics simply"
            >
              🧑‍🏫 Tutor
            </button>
            <button
              onClick={() => setSelectedRole('coder')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedRole === 'coder'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Specialized C++ Code generator"
            >
              💻 Coder
            </button>
            <button
              onClick={() => setSelectedRole('architect')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedRole === 'architect'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Circuit Architect & Pinout specialist"
            >
              🛠️ Architect
            </button>
          </div>

          {/* Google Search Grounding Checkbox Toggle */}
          <button
            type="button"
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
              useSearchGrounding
                ? 'bg-blue-950/80 text-cyan-300 border-cyan-400/50 shadow-sm'
                : 'bg-[#0b1324] text-slate-500 border-blue-950'
            }`}
            title="Toggle real-time Google Search data grounding"
          >
            <Globe className={`w-3.5 h-3.5 ${useSearchGrounding ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Search Grounding</span>
            <span className={`w-1.5 h-1.5 rounded-full ${useSearchGrounding ? 'bg-cyan-400' : 'bg-slate-600'}`} />
          </button>

          {/* Clear chat */}
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            title="Reset Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-4xl mx-auto w-full">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const contentParts = isUser ? [] : parseMessageContent(msg.content, msg.id);

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                    : 'bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-md shadow-blue-500/25'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-white" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed max-w-[88%] ${
                  isUser
                    ? 'bg-[#121f38] border border-blue-500/30 text-white rounded-tr-sm'
                    : 'bg-[#0a1224] border border-blue-900/50 text-slate-200 rounded-tl-sm space-y-3'
                }`}
              >
                {/* Bubble Header */}
                <div className="flex items-center justify-between text-[10px] text-blue-300/80 mb-1 border-b border-blue-950/60 pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{isUser ? 'You' : 'VoltStar Gemini AI'}</span>
                    {!isUser && msg.modelUsed && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-cyan-300 border border-blue-800 font-mono">
                        {msg.modelUsed}
                      </span>
                    )}
                    {!isUser && msg.isGrounded && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-mono flex items-center space-x-0.5">
                        <Globe className="w-2.5 h-2.5 inline" />
                        <span>Grounded</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-white"
                        title="Copy entire response"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Render User Message */}
                {isUser && (
                  <div className="whitespace-pre-wrap font-sans select-text">
                    {msg.content}
                  </div>
                )}

                {/* Render Assistant Message with Interactive Code Blocks & Search Sources */}
                {!isUser && (
                  <div className="space-y-3">
                    {contentParts.map((part) => {
                      if (part.type === 'text') {
                        return (
                          <div key={part.key} className="whitespace-pre-wrap font-sans select-text leading-relaxed">
                            {part.value}
                          </div>
                        );
                      }

                      // CODE BLOCK WITH 1-CLICK APPLY BUTTON
                      const isApplied = appliedCodeIndex === part.key;

                      return (
                        <div key={part.key} className="rounded-xl overflow-hidden border border-blue-500/40 bg-[#050813] shadow-lg">
                          {/* Code Block Toolbar */}
                          <div className="h-8 bg-[#080f20] px-3 border-b border-blue-950 flex items-center justify-between select-none">
                            <div className="flex items-center space-x-2 text-[11px] text-cyan-300 font-mono">
                              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="font-bold">Generated C++ Sketch</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">{part.value.split('\n').length} lines</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Copy Code */}
                              <button
                                onClick={() => handleCopy(part.value, part.key)}
                                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#0d172e] hover:bg-[#142345] text-slate-300 text-[10px] transition-colors"
                              >
                                {copiedId === part.key ? (
                                  <>
                                    <Check className="w-3 h-3 text-cyan-400" />
                                    <span className="text-cyan-300">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {/* ⚡ APPLY TO CODE EDITOR BUTTON */}
                              <button
                                onClick={() => handleApplyToEditor(part.value, part.key)}
                                className={`flex items-center space-x-1 px-3 py-1 rounded text-[11px] font-bold transition-all shadow-sm ${
                                  isApplied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white active:scale-95 shadow-blue-500/25'
                                }`}
                                title="Load this code directly into your main C++ editor"
                              >
                                {isApplied ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                    <span>Applied to Editor!</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3 h-3 fill-white" />
                                    <span>Apply to Code Editor</span>
                                    <ArrowRight className="w-3 h-3 ml-0.5" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Code Content */}
                          <pre className="p-3 text-[11px] font-mono-code text-cyan-100 overflow-x-auto select-text leading-relaxed max-h-72">
                            {part.value}
                          </pre>
                        </div>
                      );
                    })}

                    {/* Google Search Grounding Metadata Footer in Bubble */}
                    {msg.isGrounded && ((msg.searchQueries && msg.searchQueries.length > 0) || (msg.sources && msg.sources.length > 0)) && (
                      <div className="pt-2 border-t border-blue-950/80 text-[10.5px] space-y-1.5">
                        {/* Real-Time Queries Executed */}
                        {msg.searchQueries && msg.searchQueries.length > 0 && (
                          <div className="flex items-center space-x-1.5 text-blue-300">
                            <Search className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                            <span className="font-semibold text-slate-400">Google Search Queries:</span>
                            <div className="flex flex-wrap gap-1">
                              {msg.searchQueries.map((q, qIdx) => (
                                <span key={qIdx} className="bg-[#0e172a] px-1.5 py-0.2 rounded border border-blue-900/60 font-mono text-[10px]">
                                  "{q}"
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Verified Grounding Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex items-center space-x-1.5 text-slate-400">
                            <Globe className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="font-semibold text-slate-400">Verified Sources:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.map((src, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={src.uri}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-400 hover:underline flex items-center space-x-0.5 bg-[#0e172a] px-1.5 py-0.2 rounded border border-blue-900/60"
                                >
                                  <span>{src.title}</span>
                                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/25 flex-shrink-0">
              <Zap className="w-4 h-4 animate-spin fill-white" />
            </div>
            <div className="rounded-2xl p-4 bg-[#0a1224] border border-blue-900/50 text-xs text-slate-300 space-y-1.5 rounded-tl-sm">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-200" />
                <span className="text-[11px] text-cyan-300 font-semibold">
                  {useSearchGrounding ? 'Consulting Google Search data & generating C++ code...' : 'Synthesizing with Gemini...'}
                </span>
              </div>
              {useSearchGrounding && (
                <div className="text-[10px] text-slate-400 pl-4">
                  Using <strong>{selectedModel}</strong> with Search Grounding
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts for Beginners */}
      <div className="px-4 py-2 bg-[#050812] border-t border-blue-950/60">
        <div className="max-w-4xl mx-auto flex items-center space-x-2 overflow-x-auto text-[11px] pb-1">
          <Lightbulb className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-slate-400 flex-shrink-0 font-medium">Quick Starters:</span>
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(item.prompt)}
              className="px-2.5 py-1 rounded-full bg-[#0d1629] hover:bg-[#152342] border border-blue-900/50 hover:border-cyan-400 text-slate-300 hover:text-cyan-200 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 bg-[#050812] border-t border-blue-950/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center bg-[#0a1224] border border-blue-900/50 focus-within:border-cyan-400 rounded-xl px-3 py-2 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or say 'make a code for servo', 'explain I2C', 'how to wire ultrasonic'..."
            className="flex-1 bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="ml-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 disabled:opacity-40 shadow-sm"
          >
            <Send className="w-3 h-3 fill-white" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
