import React, { useState, useEffect, useRef } from "react";
import { 
  Keyboard, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Sparkles, 
  Power, 
  Settings2, 
  HelpCircle, 
  SlidersHorizontal,
  ChevronDown,
  Pin,
  PinOff
} from "lucide-react";
import { phoneticToUnicode } from "../lib/phoneticLogic";
import { unicodeToDlManel } from "../lib/converterLogic";

interface KeyRepNavigationBarProps {
  typingMode: "standard" | "wijesekera" | "phonetic";
  setTypingMode: (mode: "standard" | "wijesekera" | "phonetic") => void;
  mappingProfile: "DL_SERIES" | "FM_SERIES" | "APEX_SERIES";
  setMappingProfile: (profile: "DL_SERIES" | "FM_SERIES" | "APEX_SERIES") => void;
  conversionMode: "unicode-to-legacy" | "legacy-to-unicode";
  setConversionMode: (mode: "unicode-to-legacy" | "legacy-to-unicode") => void;
  inputText: string;
  setInputText: (text: string | ((prev: string) => string)) => void;
  onTriggerToast: (msg: string) => void;
  onOpenCheatsheet?: () => void;
}

const LIGATURE_CHARS = [
  { char: "ඥ", name: "Gna (ඥ)" },
  { char: "ඤ", name: "Nya (ඤ)" },
  { char: "ඞ", name: "Nga (ඞ)" },
  { char: "ඦ", name: "Nja (ඦ)" },
  { char: "ඬ", name: "Nda (ඬ)" },
  { char: "ඳ", name: "Nndha (ඳ)" },
  { char: "ඟ", name: "Nnga (ඟ)" },
  { char: "ළු", name: "Lu (ළු)" },
  { char: "ෲ", name: "Ruu (ෲ)" },
  { char: "ෟ", name: "Gayanukitta (ෟ)" },
  { char: "්‍ර", name: "Rakaaransaya (්‍ර)" },
  { char: "්‍ය", name: "Yansaya (්‍ය)" },
  { char: "ර්‍", name: "Rephaya (ර්‍)" }
];

export const KeyRepNavigationBar: React.FC<KeyRepNavigationBarProps> = ({
  typingMode,
  setTypingMode,
  mappingProfile,
  setMappingProfile,
  conversionMode,
  setConversionMode,
  inputText,
  setInputText,
  onTriggerToast,
  onOpenCheatsheet
}) => {
  const [isPowerOn, setIsPowerOn] = useState<boolean>(typingMode !== "standard");
  const [quickInput, setQuickInput] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Synchronize power toggle with typing mode
  useEffect(() => {
    setIsPowerOn(typingMode !== "standard");
  }, [typingMode]);

  // Global Hotkey (Ctrl + Space or F12) to toggle KeyRep Power
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.code === "Space") || e.key === "F12") {
        e.preventDefault();
        togglePower();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isPowerOn, typingMode]);

  const togglePower = () => {
    if (isPowerOn) {
      setTypingMode("standard");
      setIsPowerOn(false);
      onTriggerToast("⏸️ KeyRep Navigation: PAUSED (English Standard Mode)");
    } else {
      setTypingMode("phonetic");
      setIsPowerOn(true);
      onTriggerToast("⚡ KeyRep Navigation: ACTIVE (Singlish Phonetic Mode)");
    }
  };

  // Convert quick input text live
  const getConvertedQuickText = (raw: string): string => {
    if (!raw) return "";
    let unicode = raw;
    if (typingMode === "phonetic") {
      unicode = phoneticToUnicode(raw);
    }
    if (conversionMode === "unicode-to-legacy") {
      const profile = mappingProfile === "FM_SERIES" ? "FM_SERIES" : "DL_SERIES";
      return unicodeToDlManel(unicode, undefined, profile);
    }
    return unicode;
  };

  const handleQuickInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuickInput(val);
    if (val.trim()) {
      const converted = getConvertedQuickText(val);
      // Also automatically send to main input area if user wants live syncing
      setInputText((prev) => {
        // If main editor is empty, set it; otherwise append with space if needed
        return prev ? `${prev} ${converted}` : converted;
      });
    }
  };

  const handleQuickCopy = () => {
    if (!quickInput) return;
    const textToCopy = getConvertedQuickText(quickInput);
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    onTriggerToast("✓ KeyRep: Copied directly to Clipboard!");
    setTimeout(() => setIsCopied(false), 1800);
  };

  // Voice Typing using Web Speech API (si-LK)
  const toggleVoiceTyping = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onTriggerToast("Speech Recognition requires Microsoft Edge or Google Chrome.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      onTriggerToast("🎙️ Voice Typing stopped");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "si-LK";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        onTriggerToast("🎙️ KeyRep Voice: Listening in Sinhala... Speak now!");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setQuickInput(transcript);
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        onTriggerToast("Microphone paused");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      onTriggerToast("Could not start Voice Typing.");
    }
  };

  const insertLigature = (char: string) => {
    setInputText((prev) => prev + char);
    setQuickInput((prev) => prev + char);
    onTriggerToast(`Inserted: ${char}`);
  };

  return (
    <nav
      id="keyrep-master-navigation-bar"
      className={`w-full transition-all duration-300 z-40 mb-6 ${
        isSticky
          ? "sticky top-2 shadow-2xl backdrop-blur-2xl bg-slate-950/95 border-b border-cyan-500/40 rounded-2xl py-2 px-3"
          : "relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-xl"
      }`}
      aria-label="SanTyper KeyRep Master Navigation Toolbar"
    >
      {/* Top Main Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        
        {/* LEFT: KeyRep Brand, Power Activator & Hotkey Badge */}
        <div className="flex items-center gap-2">
          {/* Brand Icon & Title */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1 shadow-inner">
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.png"
                alt="KeyRep Logo"
                className="w-5 h-5 rounded-md object-cover ring-1 ring-cyan-400"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${
                  isPowerOn
                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
                    : "bg-slate-500"
                }`}
              />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-black tracking-wider uppercase text-white font-mono flex items-center gap-1">
                KeyRep
                <span className="text-[9px] text-cyan-400 font-bold">PRO</span>
              </div>
            </div>
          </div>

          {/* Master ON/OFF Power Toggle */}
          <button
            type="button"
            id="keyrep-power-toggle"
            onClick={togglePower}
            title="Toggle KeyRep Engine (Shortcut: Ctrl + Space or F12)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isPowerOn
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-emerald-500/20"
                : "bg-slate-800 text-slate-400 border border-white/10 hover:text-white"
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${isPowerOn ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
            <span>{isPowerOn ? "ON" : "OFF"}</span>
          </button>

          {/* Hotkey Hint Chip */}
          <span 
            className="hidden lg:inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-400"
            title="Global Hotkey to toggle KeyRep ON/OFF anytime"
          >
            <kbd className="text-cyan-400 font-bold">Ctrl+Space</kbd> / <kbd className="text-cyan-400 font-bold">F12</kbd>
          </span>
        </div>

        {/* CENTER: Mode Selection (Singlish / Wijesekera / English) & Font Profile */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Typing Mode Segmented Controls */}
          <div className="flex items-center bg-slate-950/90 border border-white/10 rounded-xl p-1 gap-1 shadow-inner">
            <button
              type="button"
              id="keyrep-mode-singlish"
              onClick={() => {
                setTypingMode("phonetic");
                setIsPowerOn(true);
                onTriggerToast("⚡ Singlish (Phonetic) Active • Type 'mama' for 'මම'");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typingMode === "phonetic"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Singlish</span>
            </button>

            <button
              type="button"
              id="keyrep-mode-wijesekera"
              onClick={() => {
                setTypingMode("wijesekera");
                setIsPowerOn(true);
                onTriggerToast("⚡ Wijesekera Layout Active • Hardware keyboard mapping");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typingMode === "wijesekera"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Wijesekera</span>
            </button>

            <button
              type="button"
              id="keyrep-mode-standard"
              onClick={() => {
                setTypingMode("standard");
                setIsPowerOn(false);
                onTriggerToast("English / Standard Input Mode");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                typingMode === "standard"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>English</span>
            </button>
          </div>

          {/* Target Font Segmented Controls */}
          <div className="flex items-center bg-slate-950/90 border border-white/10 rounded-xl p-1 gap-1 shadow-inner">
            <button
              type="button"
              id="keyrep-font-dl"
              onClick={() => {
                setMappingProfile("DL_SERIES");
                setConversionMode("unicode-to-legacy");
                onTriggerToast("Target Font: DL-Manel (Standard Print)");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mappingProfile === "DL_SERIES" && conversionMode === "unicode-to-legacy"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
              }`}
            >
              DL-Manel
            </button>

            <button
              type="button"
              id="keyrep-font-fm"
              onClick={() => {
                setMappingProfile("FM_SERIES");
                setConversionMode("unicode-to-legacy");
                onTriggerToast("Target Font: FM-Abaya (Publishing Standard)");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mappingProfile === "FM_SERIES" && conversionMode === "unicode-to-legacy"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
              }`}
            >
              FM-Abaya
            </button>

            <button
              type="button"
              id="keyrep-font-unicode"
              onClick={() => {
                setConversionMode("legacy-to-unicode");
                onTriggerToast("Target Format: Standard Sinhala Unicode");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                conversionMode === "legacy-to-unicode"
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Unicode
            </button>
          </div>
        </div>

        {/* RIGHT: Voice Typing, Quick Ligatures, Cheatsheet & Pin */}
        <div className="flex items-center gap-1.5">
          {/* Sinhala Voice Typing Button */}
          <button
            type="button"
            id="keyrep-voice-btn"
            onClick={toggleVoiceTyping}
            title="Sinhala Voice Typing (Speech-to-Text in si-LK)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isListening
                ? "bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse"
                : "bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-cyan-400/30"
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isListening ? "Listening..." : "Voice"}</span>
          </button>

          {/* Special Characters Drawer Toggle */}
          <button
            type="button"
            id="keyrep-palette-btn"
            onClick={() => setShowPalette(!showPalette)}
            title="Special Characters / Ligatures (ඥ, ඤ, ඞ, ර්‍, ්‍ර...)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showPalette
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
                : "bg-slate-900 border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <span className="font-serif font-bold text-cyan-300">Aa</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showPalette ? "rotate-180" : ""}`} />
          </button>

          {/* Visual Keyboard Map Button */}
          {onOpenCheatsheet && (
            <button
              type="button"
              onClick={onOpenCheatsheet}
              title="View Wijesekera & Singlish Layout Cheatsheet"
              className="p-1.5 bg-slate-900 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Sticky Bar Pin Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsSticky(!isSticky);
              onTriggerToast(isSticky ? "KeyRep Navigation: Unpinned" : "KeyRep Navigation: Pinned to Top");
            }}
            title={isSticky ? "Unpin KeyRep Toolbar" : "Pin KeyRep Toolbar to Top"}
            className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              isSticky
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
                : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {isSticky ? <Pin className="w-3.5 h-3.5 text-cyan-400" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* BOTTOM DRAWER: KeyRep Special Characters Palette */}
      {showPalette && (
        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 animate-fadeIn">
          <span className="text-[10px] text-slate-400 font-mono mr-1">Special Ligatures:</span>
          {LIGATURE_CHARS.map(({ char, name }) => (
            <button
              key={char}
              type="button"
              onClick={() => insertLigature(char)}
              title={`Insert ${name}`}
              className="px-2 py-0.5 bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-white/10 hover:border-cyan-400/50 rounded-lg text-xs font-medium transition-all transform hover:scale-110 cursor-pointer"
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
