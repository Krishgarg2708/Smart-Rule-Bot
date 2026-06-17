import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Trash2, 
  Download, 
  Moon, 
  Sun, 
  Terminal, 
  Code2, 
  Sparkles, 
  Check, 
  Copy, 
  FileText, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  Menu, 
  X, 
  Cpu, 
  Activity, 
  Smile, 
  FileCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { detectIntent, generateResponse, INTENT_RULES, MatchResult } from "./utils/nlp";
import { PROJECT_FILES, ProjectFile } from "./data/projectFiles";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  matchResult?: MatchResult;
}

function renderMessageText(text: string) {
  if (!text.includes("```")) {
    return <div className="whitespace-pre-line font-medium leading-relaxed break-words">{text}</div>;
  }

  const parts = text.split("```");
  return (
    <div className="space-y-3 font-sans font-medium text-[14px] leading-relaxed break-words text-left">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          const lines = part.split("\n");
          let language = "code";
          let codeContent = part;
          if (lines.length > 0 && lines[0].trim().length < 15 && !lines[0].includes(" ") && lines[0].trim() !== "") {
            language = lines[0].trim();
            codeContent = lines.slice(1).join("\n");
          }

          return (
            <div key={index} className="my-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-150 font-mono text-[11.5px] shadow-sm select-text text-left">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-850 text-zinc-400 select-none text-[10px] uppercase font-bold tracking-wider">
                <span>{language}</span>
                <span className="text-[9px] lowercase italic text-zinc-500 font-normal">selectable workspace block</span>
              </div>
              <pre className="p-4 overflow-x-auto whitespace-pre scrolling-touch leading-relaxed font-mono select-text text-left max-w-full text-zinc-200">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        return <span key={index} className="whitespace-pre-line inline">{part}</span>;
      })}
    </div>
  );
}

export default function App() {
  // Theme state synced with documentElement class and local storage
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("smartrulebot-theme");
    return (saved as "light" | "dark") || "light";
  });

  // Active workspace tab: "chat" (Live Playground) or "editor" (Python/Flask project viewer)
  const [activeTab, setActiveTab] = useState<"chat" | "editor">("chat");

  // Active processing engine engine: "hybrid" (Gemini 3.5-flash with traceability) or "rule-only" (standard deterministic)
  const [processingMode, setProcessingMode] = useState<"hybrid" | "rule-only">("hybrid");

  // Chat message array state
  const [messages, setMessages] = useState<Message[]>([]);

  // Messages count stats (tracked locally)
  const [totalMessages, setTotalMessages] = useState(0);
  const [userMessagesCount, setUserMessagesCount] = useState(0);
  const [botMessagesCount, setBotMessagesCount] = useState(0);

  // Field input string
  const [inputText, setInputText] = useState("");

  // Typing animation loader trigger
  const [isTyping, setIsTyping] = useState(false);

  // File selected in Code Explorer
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  // Copy code check notifier state
  const [copiedFile, setCopiedFile] = useState(false);

  // Mobile drawer controls
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Latest selected message for detailed NLP inspection (Telemetry)
  const [inspectedMatch, setInspectedMatch] = useState<MatchResult | null>(null);

  // Auto-scrolled refs
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Mount logic for dark theme setup and introductory greeting message
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("smartrulebot-theme", theme);
  }, [theme]);

  // Initial welcome message
  useEffect(() => {
    const introMessage: Message = {
      id: "intro-main",
      sender: "bot",
      text: "Hello! I am SmartRuleBot, an intelligent agent operating entirely on strict NLP match rules, keyword matrices, and regex. Try asking about 'BTech' or type 'help' to see what rules I can process!",
      timestamp: new Date()
    };
    setMessages([introMessage]);
    setTotalMessages(1);
    setBotMessagesCount(1);
  }, []);

  // Sync scroll on chat updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Preprocesses user query, matches intents, outputs delay, and computes outputs
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text) return;

    // Clear main input field
    if (textToSend === undefined) {
      setInputText("");
    }

    // 1. Log user message bubble
    const userMsg: Message = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: "user",
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setTotalMessages(prev => prev + 1);
    setUserMessagesCount(prev => prev + 1);

    // 2. Perform strict NLP evaluation
    const analysis = detectIntent(text);
    
    // Set current analysis as focus telemetry
    setInspectedMatch(analysis);

    // 3. Trigger typing simulation
    setIsTyping(true);

    if (processingMode === "rule-only") {
      // Deterministic flow with standard 750ms typing delays
      setTimeout(() => {
        const botReply = generateResponse(analysis.intent);

        const botMsg: Message = {
          id: `bot-${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: botReply,
          timestamp: new Date(),
          matchResult: analysis
        };

        setMessages(prev => [...prev, botMsg]);
        setTotalMessages(prev => prev + 1);
        setBotMessagesCount(prev => prev + 1);
        setIsTyping(false);
      }, 750);
    } else {
      // Intelligent full-service Gemini 3.5-flash flow with trace logging integration
      try {
        const chatHistory = messages
          .filter(m => m.id !== "intro-main")
          .map(m => ({
            sender: m.sender,
            text: m.text
          }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: text,
            history: chatHistory,
            intentInfo: {
              intent: analysis.intent,
              matchedBy: analysis.matchedBy,
              matchedPattern: analysis.matchedPattern,
              processedText: analysis.processedText
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.reply;

        const botMsg: Message = {
          id: `bot-${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: botReply,
          timestamp: new Date(),
          matchResult: analysis
        };

        setMessages(prev => [...prev, botMsg]);
        setTotalMessages(prev => prev + 1);
        setBotMessagesCount(prev => prev + 1);
      } catch (err: any) {
        console.error("Failed to query Gemini API endpoint route:", err);
        // Clean fallback to local pre-defined answers
        const staticReply = generateResponse(analysis.intent);
        const disclaimer = "\n\n*(Note: Hybrid AI service is offline. Directing query to local rule-based fallback response engine)*";

        const botMsg: Message = {
          id: `bot-${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: `${staticReply}${disclaimer}`,
          timestamp: new Date(),
          matchResult: analysis
        };

        setMessages(prev => [...prev, botMsg]);
        setTotalMessages(prev => prev + 1);
        setBotMessagesCount(prev => prev + 1);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to completely clear this conversation?")) {
      const resetMsg: Message = {
        id: `reset-${Date.now()}`,
        sender: "bot",
        text: "Conversation cleared. How else can I assist your technical lookup today?",
        timestamp: new Date()
      };
      setMessages([resetMsg]);
      setTotalMessages(1);
      setUserMessagesCount(0);
      setBotMessagesCount(1);
      setInspectedMatch(null);
    }
  };

  const handleExportTxtFile = () => {
    if (messages.length === 0) {
      alert("No transcripts to export yet!");
      return;
    }

    let rawLogStr = "=== SMARTRULEBOT CHATLOG EXPORT ===\n";
    rawLogStr += `Generated At: ${new Date().toUTCString()}\n`;
    rawLogStr += "====================================\n\n";

    messages.forEach((msg) => {
      const stamp = msg.timestamp.toISOString();
      const senderLabel = msg.sender.toUpperCase();
      rawLogStr += `[${stamp}] ${senderLabel}: ${msg.text}\n`;
      if (msg.matchResult) {
        rawLogStr += `  ├─ Recognized Intent: [${msg.matchResult.intent}]\n`;
        rawLogStr += `  └─ Matching Rule Trace: ${msg.matchResult.matchedPattern}\n`;
      }
      rawLogStr += "\n";
    });

    const blob = new Blob([rawLogStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `SmartRuleBot_Log_${Date.now()}.txt`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = (file: ProjectFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadFile = (file: ProjectFile) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Triggers one of the quick test presets to help users demo the NLP rules
  const handleQuickTestPreset = (text: string) => {
    handleSendMessage(text);
  };

  const quickPresets = [
    { label: "Give dynamic Date", query: "What is today's date?" },
    { label: "Give current Time", query: "Current time please" },
    { label: "Describe BTech info", query: "What is BTech?" },
    { label: "Tell coder joke", query: "Tell me a programmer joke!" },
    { label: "Show Help commands", query: "features lists" },
    { label: "Check dynamic Weather", query: "climate temp forecast" },
    { label: "Trigger fallback state", query: "Blahblah gibberish syntax check" },
  ];

  const activeFile = PROJECT_FILES[selectedFileIdx];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F7] dark:bg-[#121214] font-sans text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-300">
      
      {/* SIDEBAR MAIN MENU (Desktop Rail layout) */}
      <aside className="hidden md:flex flex-col w-[280px] bg-white dark:bg-[#1D1D1F] border-r border-[#E5E5E7] dark:border-zinc-800 z-20 shrink-0">
        <div className="p-6 border-b border-[#E5E5E7] dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 bg-[#007AFF] dark:bg-[#0A84FF] rounded-sm shrink-0" />
            <div>
              <h1 className="font-bold text-[17px] tracking-tight text-[#1D1D1F] dark:text-white leading-tight">SmartRuleBot</h1>
              <p className="text-[11px] font-medium text-[#86868B] dark:text-zinc-400 mt-0.5">Pattern Engine Sandbox</p>
            </div>
          </div>
        </div>

        {/* Workspace Selector Segment */}
        <div className="px-4 pt-5 pb-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#86868B] dark:text-[#86868B]">Workspace Navigation</label>
          <div className="mt-2 space-y-1">
            <button 
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition duration-150 cursor-pointer ${
                activeTab === "chat" 
                  ? "bg-[#F5F5F7] dark:bg-zinc-800 text-[#007AFF] dark:text-[#0A84FF]" 
                  : "text-[#424245] dark:text-zinc-350 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800"
              }`}
            >
              <Smile className="w-4 h-4 text-zinc-400" />
              <span>Live Chat Sandbox</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            </button>
            <button 
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition duration-150 cursor-pointer ${
                activeTab === "editor" 
                  ? "bg-[#F5F5F7] dark:bg-zinc-800 text-[#007AFF] dark:text-[#0A84FF]" 
                  : "text-[#424245] dark:text-zinc-300 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800"
              }`}
            >
              <Code2 className="w-4 h-4 text-zinc-400" />
              <span>Python / Flask Files</span>
              <span className="ml-auto px-1.5 py-0.5 text-[9px] rounded font-semibold bg-[#E8E8ED] dark:bg-zinc-800 text-[#424245] dark:text-zinc-400 uppercase">Flask</span>
            </button>
          </div>
        </div>

        {/* Processing Brain Mode Toggle */}
        <div className="px-4 py-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#86868B] dark:text-zinc-550">Processing Engine</label>
          <div className="mt-2 p-1.5 bg-[#F5F5F7] dark:bg-zinc-800/40 rounded-xl border border-[#E5E5E7] dark:border-zinc-800/50 space-y-1">
            <button
              onClick={() => setProcessingMode("hybrid")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                processingMode === "hybrid"
                  ? "bg-white dark:bg-zinc-700 text-[#007AFF] dark:text-white shadow-sm"
                  : "text-[#424245] dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Smart Hybrid (AI)</span>
              </span>
              {processingMode === "hybrid" && <Check className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />}
            </button>
            <button
              onClick={() => setProcessingMode("rule-only")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                processingMode === "rule-only"
                  ? "bg-white dark:bg-zinc-700 text-[#007AFF] dark:text-white shadow-sm"
                  : "text-[#424245] dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-500" />
                <span>Deterministic Rules</span>
              </span>
              {processingMode === "rule-only" && <Check className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />}
            </button>
          </div>
        </div>

        {/* Live Analytics Stack */}
        <div className="px-4 py-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#86868B] dark:text-[#86868B]">Live Analytics</label>
          <div className="mt-2.5 space-y-3">
            <div className="bg-[#F5F5F7] dark:bg-zinc-800/40 rounded-xl p-4 border border-[#E5E5E7] dark:border-zinc-800/50">
              <div className="text-[11px] uppercase tracking-[0.5px] font-semibold text-[#86868B] dark:text-zinc-500">Messages Handled</div>
              <div className="text-2xl font-light text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">{totalMessages}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#F5F5F7] dark:bg-zinc-800/40 rounded-xl p-3 border border-[#E5E5E7] dark:border-zinc-800/50">
                <div className="text-[10px] uppercase tracking-[0.5px] font-semibold text-[#86868B] dark:text-zinc-500">User prompts</div>
                <div className="text-lg font-light text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">{userMessagesCount}</div>
              </div>
              <div className="bg-[#F5F5F7] dark:bg-zinc-800/40 rounded-xl p-3 border border-[#E5E5E7] dark:border-zinc-800/50">
                <div className="text-[10px] uppercase tracking-[0.5px] font-semibold text-[#86868B] dark:text-zinc-500">Bot iterations</div>
                <div className="text-lg font-light text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">{botMessagesCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Supported Intents tags list */}
        <div className="px-4 py-3 flex-grow overflow-y-auto max-h-[30%]">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#86868B] dark:text-zinc-500">Supported Intents</label>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.keys(INTENT_RULES).map(key => {
              const rule = INTENT_RULES[key];
              return (
                <span 
                  key={key} 
                  title={rule.description}
                  className="inline-block px-2.5 py-1.5 bg-[#E8E8ED] dark:bg-zinc-800 rounded-md text-[11px] font-medium text-[#424245] dark:text-zinc-300 m-0.5"
                >
                  {rule.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Global Control Deck (Buttons matching action-btn class) */}
        <div className="p-4 border-t border-[#E5E5E7] dark:border-zinc-800 space-y-2 mt-auto">
          <button 
            onClick={handleClearHistory}
            className="w-full text-left bg-none border border-[#E5E5E7] dark:border-zinc-700/80 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800/50 p-2.5 rounded-lg text-[13px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer transition duration-150"
          >
            <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Clear Conversation</span>
          </button>
          
          <button 
            onClick={handleExportTxtFile}
            className="w-full text-left bg-none border border-[#E5E5E7] dark:border-zinc-700 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800/50 p-2.5 rounded-lg text-[13px] font-medium text-[#424245] dark:text-zinc-300 flex items-center gap-2 cursor-pointer transition duration-150"
          >
            <Download className="w-4 h-4 text-[#86868B] shrink-0" />
            <span>Export Chat History</span>
          </button>

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-[#86868B] dark:text-zinc-500 tracking-wider">Appearance</span>
            <button 
              onClick={handleToggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E5E7] dark:border-zinc-700 text-[12px] font-medium text-[#424245] dark:text-zinc-300 hover:bg-[#F5F5F7] dark:hover:bg-[#1D1D1F] transition duration-150 cursor-pointer"
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            {/* Mobile Sidebar */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-white dark:bg-[#1D1D1F] z-50 md:hidden flex flex-col shadow-2xl border-r border-[#E5E5E7] dark:border-zinc-800"
            >
              <div className="p-6 border-b border-[#E5E5E7] dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 bg-[#007AFF] dark:bg-[#0A84FF] rounded-sm shrink-0" />
                  <div>
                    <h1 className="font-bold text-[17px] tracking-tight text-[#1D1D1F] dark:text-white leading-tight">SmartRuleBot</h1>
                    <p className="text-[11px] font-medium text-[#86868B] dark:text-zinc-400 mt-0.5">Mobile Panel Navigation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-[#F5F5F7] dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation list */}
              <div className="p-4 space-y-1">
                <button 
                  onClick={() => { setActiveTab("chat"); setMobileSidebarOpen(false); }}
                  className={`flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                    activeTab === "chat" 
                      ? "bg-[#F5F5F7] dark:bg-zinc-800 text-[#007AFF] dark:text-[#0A84FF]" 
                      : "text-[#424245] dark:text-zinc-300 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800"
                  }`}
                >
                  <Smile className="w-4 h-4 text-zinc-400" />
                  <span>Interactive Chat Sandbox</span>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                </button>
                <button 
                  onClick={() => { setActiveTab("editor"); setMobileSidebarOpen(false); }}
                  className={`flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                    activeTab === "editor" 
                      ? "bg-[#F5F5F7] dark:bg-zinc-800 text-[#007AFF] dark:text-[#0A84FF]" 
                      : "text-[#424245] dark:text-zinc-350 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800"
                  }`}
                >
                  <Code2 className="w-4 h-4 text-zinc-400" />
                  <span>Python / Flask Files</span>
                </button>
              </div>

              {/* Stats & Rules */}
              <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                {/* Mobile processing toggle */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86868B] dark:text-zinc-500 uppercase tracking-wider">Processing Engine</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#F5F5F7] dark:bg-zinc-800/60 p-1 rounded-xl">
                    <button
                      onClick={() => setProcessingMode("hybrid")}
                      className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition ${
                        processingMode === "hybrid"
                          ? "bg-white dark:bg-zinc-700 text-[#007AFF] dark:text-white shadow-sm"
                          : "text-[#424245] dark:text-zinc-400"
                      }`}
                    >
                      Smart AI
                    </button>
                    <button
                      onClick={() => setProcessingMode("rule-only")}
                      className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition ${
                        processingMode === "rule-only"
                          ? "bg-white dark:bg-zinc-700 text-[#007AFF] dark:text-white shadow-sm"
                          : "text-[#424245] dark:text-zinc-400"
                      }`}
                    >
                      Rule-Only
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#F5F5F7] dark:bg-zinc-800/35 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#86868B] font-medium">Total Triggers:</span>
                    <strong className="font-semibold text-[#1D1D1F] dark:text-zinc-200">{totalMessages}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#86868B] font-medium">User Prompts:</span>
                    <strong className="font-semibold text-[#1D1D1F] dark:text-zinc-200">{userMessagesCount}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#86868B] font-medium">Bot Iterations:</span>
                    <strong className="font-semibold text-[#1D1D1F] dark:text-zinc-200">{botMessagesCount}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86868B] dark:text-zinc-500 uppercase tracking-wider">Dynamic Rules</label>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(INTENT_RULES).map(key => (
                      <span key={key} className="inline-block px-2.5 py-1.5 bg-[#E8E8ED] dark:bg-zinc-800 rounded-md text-[11px] text-[#424245] dark:text-zinc-300">
                        {INTENT_RULES[key].name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile controls */}
              <div className="p-4 border-t border-[#E5E5E7] dark:border-zinc-800 space-y-2 mt-auto">
                <button 
                  onClick={() => { handleClearHistory(); setMobileSidebarOpen(false); }}
                  className="w-full text-left bg-none border border-[#E5E5E7] dark:border-zinc-700 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800 p-2.5 rounded-lg text-[13px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Clear Conversation</span>
                </button>
                <button 
                  onClick={() => { handleExportTxtFile(); setMobileSidebarOpen(false); }}
                  className="w-full text-left bg-none border border-[#E5E5E7] dark:border-zinc-700 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800 p-2.5 rounded-lg text-[13px] font-medium text-[#424245] dark:text-zinc-300 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Export Chat History</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* WORKSPACE MAIN CONTAINER */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        {/* TOP COMPATIBLE HEADER */}
        <header className="h-16 bg-white/80 dark:bg-[#1D1D1F]/80 backdrop-blur-md border-b border-[#E5E5E7] dark:border-[#2C2C2E] px-6 flex items-center justify-between shrink-0 z-10 select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-[#F5F5F7] dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              <Menu className="w-4 h-4 text-[#424245] dark:text-zinc-300" />
            </button>
            <div>
              <span className="font-semibold text-[#1D1D1F] dark:text-[#FFFFFF] text-[15px]">Active Session</span>
              <span className="text-[#86868B] dark:text-zinc-400 text-[13px] ml-2.5 font-mono">ID: SRB-9921</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick tab switcher styled minimalist */}
            <div className="flex items-center bg-[#F5F5F7] dark:bg-zinc-800 p-0.5 rounded-lg border border-transparent dark:border-zinc-700">
              <button 
                onClick={() => setActiveTab("chat")}
                className={`px-3.5 py-1 rounded-md text-[12px] font-semibold transition cursor-pointer ${
                  activeTab === "chat" 
                    ? "bg-white dark:bg-zinc-700 text-[#007AFF] dark:text-zinc-50 shadow-sm"
                    : "text-[#86868B] dark:text-zinc-400 hover:text-[#1D1D1F]"
                }`}
              >
                Sandbox
              </button>
              <button 
                onClick={() => setActiveTab("editor")}
                className={`px-3.5 py-1 rounded-md text-[12px] font-semibold transition cursor-pointer ${
                  activeTab === "editor" 
                    ? "bg-white dark:bg-zinc-700 text-[#007AFF] dark:text-zinc-50 shadow-sm"
                    : "text-[#86868B] dark:text-zinc-400 hover:text-[#1D1D1F]"
                }`}
              >
                Source Files
              </button>
            </div>

            {/* Live Online Badge */}
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#34C759]">
              <div className="w-2 h-2 bg-[#34C759] rounded-full animate-pulse" />
              <span className="hidden sm:inline">System Online</span>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
          
          {/* TAB 1: DYNAMIC PLAYGROUND */}
          <div className={`flex-grow flex flex-col h-full overflow-hidden ${activeTab === "chat" ? "flex" : "hidden"}`}>
            
            {/* Quick-test Presets drawer styled in beautiful pills */}
            <div className="px-6 py-3 bg-white dark:bg-[#1D1D1F] border-b border-[#E5E5E7] dark:border-[#2C2C2E] overflow-x-auto shrink-0 select-none">
              <div className="flex items-center gap-2 min-w-max">
                <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#86868B] mr-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" /> Presets:
                </span>
                {quickPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickTestPreset(preset.query)}
                    className="px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[11px] font-semibold text-[#424245] dark:text-zinc-300 border border-transparent dark:border-zinc-700 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat viewport following 'chat-viewport' theme instructions */}
            <div className="flex-grow overflow-y-auto px-6 py-8 space-y-6 bg-[#F5F5F7] dark:bg-[#121214]">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div key={msg.id} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
                        
                        {/* Subtitle name stamp */}
                        <span className={`text-[11px] text-[#86868B] dark:text-zinc-500 font-medium mb-1 px-1.5 flex items-center gap-1.5 ${isUser ? "justify-end text-right" : "justify-start"}`}>
                          {isUser ? "You" : "SmartRuleBot"}
                          <span>•</span>
                          <span>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </span>

                        {/* Content Bubble exactly styled based on instructions */}
                        <div className={`p-3.5 px-4 rounded-[18px] text-[14px] leading-relaxed relative w-full ${
                          isUser 
                            ? "bg-[#007AFF] dark:bg-[#0A84FF] text-white rounded-br-sm self-end font-sans transition-all" 
                            : "bg-white dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-zinc-100 border border-[#E5E5E7] dark:border-zinc-800 rounded-bl-sm self-start shadow-[0_2px_4px_rgba(0,0,0,0.05)] font-sans"
                        }`}>
                          {renderMessageText(msg.text)}

                          {/* Telemetry trigger badge below bot responses */}
                          {!isUser && msg.matchResult && (
                            <div 
                              onClick={() => setInspectedMatch(msg.matchResult || null)}
                              className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-[#86868B] dark:text-zinc-400 cursor-pointer hover:text-[#007AFF] dark:hover:text-[#0A84FF] transition"
                            >
                              <span className="flex items-center gap-1 px-0.5">
                                <Terminal className="w-3.5 h-3.5" />
                                Trace: {msg.matchResult.intent}
                              </span>
                              <span className="font-bold flex items-center gap-0.5 text-[#007AFF] dark:text-[#0A84FF] hover:underline">
                                Inspect Logs <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Bot typing simulation */}
                {isTyping && (
                  <div className="flex w-full justify-start">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#86868B] dark:text-zinc-500 mb-1 px-1.5 font-mono">Parsing pattern triggers...</span>
                      <div className="px-4 py-2.5 rounded-[18px] bg-white dark:bg-[#1D1D1F] border border-[#E5E5E7] dark:border-zinc-800 rounded-bl-sm flex items-center gap-1.5 max-w-max shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                        <span className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>
            </div>

            {/* In-app Developer NLP Telemetry / Diagnostic Dashboard Drawer */}
            <div className="px-6 py-4 bg-[#F5F5F7] dark:bg-[#1D1D1F] border-t border-[#E5E5E7] dark:border-[#2C2C2E] shrink-0">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-[#E5E5E7] dark:border-zinc-700 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center font-mono shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F1F1F4] flex items-center gap-1.5">
                      NLP Diagnostic Inspector
                      <span className="text-[9px] uppercase tracking-wider font-mono font-medium px-1.5 py-0.2 bg-[#E8E8ED] dark:bg-zinc-800 text-[#424245] dark:text-zinc-400 rounded">
                        Live Feed
                      </span>
                    </h3>
                    <p className="text-[#86868B] dark:text-zinc-400 mt-0.5 leading-normal">
                      {inspectedMatch 
                        ? `Normalized input: "${inspectedMatch.processedText}"`
                        : "Type any message to see intent, normalization matrix, and priority routes."
                      }
                    </p>
                  </div>
                </div>

                {inspectedMatch ? (
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] bg-white dark:bg-zinc-800 p-2 rounded-lg border border-[#E5E5E7] dark:border-[#2C2C2E] shadow-sm">
                    <div className="px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                      Intent: <strong className="text-[#007AFF] dark:text-[#0A84FF] uppercase">{inspectedMatch.intent}</strong>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                      Type: <strong className="capitalize">{inspectedMatch.matchedBy}</strong>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400">
                      Target: <code className="text-zinc-500 font-semibold">{inspectedMatch.matchedPattern}</code>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#86868B] italic font-medium">Waiting for prompt query trace...</span>
                )}
              </div>
            </div>

            {/* Input Container styled strictly based on requested theme */}
            <div className="p-6 bg-[#F5F5F7] dark:bg-[#121214] border-t border-[#E5E5E7] dark:border-[#2C2C2E]">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 border border-[#D2D2D7] dark:border-zinc-700 rounded-xl px-4 py-2 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:ring-1 focus-within:ring-[#007AFF] focus-within:border-[#007AFF] transition">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about the time, date, education, or tell me a joke..."
                    className="flex-grow bg-transparent border-none outline-none text-[15px] text-[#1D1D1F] dark:text-white placeholder-zinc-450 py-2.5"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isTyping}
                    className={`px-4 py-2 rounded-lg font-bold text-[13px] transition cursor-pointer shrink-0 ${
                      inputText.trim() && !isTyping 
                        ? "bg-[#007AFF] hover:bg-[#0063CC] text-white" 
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    Send
                  </button>
                </div>
                <div className="text-center text-[11px] text-[#86868B] dark:text-zinc-500 mt-3 font-semibold">
                  Press <strong>Enter</strong> to send &bull; Pattern-based intent recognition active
                </div>
              </div>
            </div>
            
          </div>

          {/* TAB 2: PORTFOLIO SOURCE CODE EXPLORER */}
          <div className={`flex-grow h-full w-full flex flex-col md:flex-row overflow-hidden ${activeTab === "editor" ? "flex" : "hidden"}`}>
            
            {/* File explorer sidebar */}
            <div className="w-full md:w-[260px] bg-white dark:bg-[#1D1D1F] border-b md:border-b-0 md:border-r border-[#E5E5E7] dark:border-[#2C2C2E] flex flex-col shrink-0 select-none">
              
              {/* Directory summary details */}
              <div className="p-4 border-b border-[#E5E5E7] dark:border-zinc-800 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold uppercase tracking-[0.5px] text-[#86868B] flex items-center gap-1.5 leading-none">
                  <FileCode className="w-4 h-4 text-[#86868B]" />
                  College App Files
                </span>
                <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-[#E8E8ED] dark:bg-zinc-800 text-[#424245] dark:text-zinc-350">
                  7 Files
                </span>
              </div>

              {/* Explorer list */}
              <div className="p-3 space-y-1 overflow-y-auto flex-grow max-h-48 md:max-h-none">
                {PROJECT_FILES.map((file, idx) => {
                  const isSelected = selectedFileIdx === idx;
                  const nameParts = file.path.split("/");
                  const cleanName = nameParts[nameParts.length - 1];
                  const folder = nameParts.length > 1 ? nameParts[0] + "/" : "";
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => { setSelectedFileIdx(idx); setInspectedMatch(null); }}
                      className={`w-full text-left p-2.5 rounded-lg flex flex-col transition border cursor-pointer ${
                        isSelected 
                          ? "bg-[#F5F5F7] border border-[#E5E5E7] dark:bg-zinc-800 text-[#007AFF] dark:text-zinc-50 dark:border-zinc-700" 
                          : "border-transparent hover:bg-[#F5F5F7]/70 dark:hover:bg-zinc-800/40 text-[#424245] dark:text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Terminal className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#007AFF] dark:text-[#0A84FF]" : "text-zinc-400"}`} />
                        <span className="text-xs font-bold font-mono truncate">{cleanName}</span>
                      </div>
                      {folder && (
                        <span className="text-[10px] font-mono text-[#86868B] ml-5.5 mt-0.5">
                          static/
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Developer info notice bubble */}
              <div className="p-4 bg-[#F5F5F7] dark:bg-zinc-800/40 border border-[#E5E5E7] dark:border-zinc-800 m-3.5 rounded-xl text-xs flex items-start gap-2.5 select-none text-[#424245] dark:text-zinc-300">
                <Info className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Mini-Project Assets</p>
                  <p className="text-[11px] leading-relaxed text-[#86868B] dark:text-zinc-400">
                    Review or copy raw source codes. You can submit these directly for academia lab exams.
                  </p>
                </div>
              </div>
            </div>

            {/* Code presentation workspace */}
            <div className="flex-grow flex flex-col overflow-hidden bg-white dark:bg-[#121214]">
              
              {/* Interactive File controls bar matches theme layout */}
              <div className="px-6 py-4 bg-white dark:bg-[#1D1D1F] border-b border-[#E5E5E7] dark:border-[#2C2C2E] flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-[#E8E8ED] dark:bg-zinc-800 text-[#424245] dark:text-zinc-350 tracking-wider">
                      {activeFile.language}
                    </span>
                    <h2 className="text-sm font-bold font-mono text-[#1D1D1F] dark:text-[#FFFFFF]">{activeFile.path}</h2>
                  </div>
                  <p className="text-xs text-[#86868B] dark:text-zinc-400 mt-1">{activeFile.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(activeFile)}
                    className="px-3.5 py-1.8 rounded-lg group text-[11px] font-bold bg-white hover:bg-[#F5F5F7] dark:bg-zinc-800 dark:hover:bg-[#2C2C2E] text-[#424245] dark:text-zinc-200 border border-[#E5E5E7] dark:border-zinc-700 cursor-pointer flex items-center gap-1.5 transition select-none"
                  >
                    {copiedFile ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />}
                    <span>{copiedFile ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadFile(activeFile)}
                    className="px-3.5 py-1.8 rounded-lg text-[11px] font-bold bg-[#007AFF] hover:bg-[#0063CC] text-white cursor-pointer flex items-center gap-1.5 transition select-none"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Code viewer viewport with macOS system aesthetic styling */}
              <div className="flex-grow overflow-auto p-6 font-mono text-xs leading-relaxed bg-[#1D1D1F] text-zinc-300 relative border-t border-zinc-800/20">
                <div className="flex select-text selection:bg-[#007AFF]/35 selection:text-white">
                  
                  {/* Mock line numbers */}
                  <div className="text-zinc-500 pr-4 text-right select-none border-r border-[#2C2C2E] w-8 shrink-0">
                    {activeFile.content.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Clean code space */}
                  <pre className="pl-4 overflow-x-auto text-[11px] text-zinc-200 font-mono tracking-wide leading-6 whitespace-pre">
                    <code>{activeFile.content}</code>
                  </pre>
                </div>
              </div>

              {/* Bottom footer guide */}
              <div className="p-4 bg-[#F5F5F7] dark:bg-[#1D1D1F] border-t border-[#E5E5E7] dark:border-[#2C2C2E] shrink-0 text-center text-xs text-[#86868B] select-none">
                Python file assets correspond to local match engine criteria. Read <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">README.md</strong> details to run locally.
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
