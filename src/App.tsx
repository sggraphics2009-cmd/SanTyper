import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { unicodeToDlManel, dlManelToUnicode, getRichTextHTML } from "./lib/converterLogic";
import { phoneticToUnicode, getPhoneticSuggestions } from "./lib/phoneticLogic";
import { KeyRepNavigationBar } from "./components/KeyRepNavigationBar";

const DeveloperDesignerSuite = lazy(() => import("./components/DeveloperDesignerSuite"));
import { 
  Copy, 
  Trash2, 
  ArrowLeftRight, 
  Check, 
  Sparkles, 
  HelpCircle, 
  FileDown, 
  Upload,
  Info, 
  Keyboard, 
  Cpu, 
  Layers, 
  Bookmark, 
  Palette, 
  Sliders,
  CheckSquare,
  Type,
  ToggleLeft,
  ChevronDown,
  Plus,
  Plug,
  ExternalLink,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Key,
  RefreshCw,
  Download,
  Laptop,
  Monitor,
  ShieldCheck,
  HardDrive,
  UserCheck,
  Zap,
  Smartphone,
  Apple
} from "lucide-react";

// Predefined Sinhala Unicode & Legacy templates for instant sandbox testing
const SAMPLE_TEMPLATES = [
  {
    id: "sample-1",
    label: "Democratic Republic",
    category: "Unicode",
    unicode: "ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය",
    legacy: "Y%S ,xld m%cd;dka;%sl iudcjdoS ckrch"
  },
  {
    id: "sample-2",
    label: "Sinhala Proverb",
    category: "Unicode",
    unicode: "ප්‍රඥාව සියල්ලටම වඩා උතුම් වේ.",
    legacy: "m%{dj ish,a,gu jvd W;=ï fõ."
  },
  {
    id: "sample-3",
    label: "Designer Welcomer",
    category: "Legacy (DL-Manel)",
    unicode: "ආයුබෝවන්! මෙම පරිවර්තකය මඟින් ඔබගේ නිර්මාණ කටයුතු පහසු කරයි.",
    legacy: "wdhqfndajka! fuu mßj¾;lh u.ska Tnf.a ks¾udK lghq;= mfyaiq lrhs."
  }
];

// High-fidelity standard list of Sinhala legacy fonts for MS Word matching
const LEGACY_FONT_PRESETS = [
  { name: "DL-Manel-Layout", label: "DL-Manel-Layout (Very Popular)" },
  { name: "DL-Manel", label: "DL-Manel (Standard)" },
  { name: "DL-Manel Layout", label: "DL-Manel Layout (Space-Separated)" },
  { name: "FMAbhaya", label: "FMAbhaya (Classic)" },
  { name: "FMAbhayaLayout", label: "FMAbhayaLayout" },
  { name: "FMBindumathi", label: "FMBindumathi (Thin)" },
  { name: "DL-Abhaya", label: "DL-Abhaya" },
  { name: "Apex-Sinhala", label: "Apex-Sinhala" }
];

// Absolute high-fidelity standard mappings for typing Sinhala Wijesekera layouts
const WIJESEKERA_UNSHIFTED: { [key: string]: string } = {
  'q': 'ු', 'w': 'අ', 'e': 'ඇ', 'r': 'ර', 't': 'එ', 'y': 'හ', 'u': 'ම', 'i': 'ස', 'o': 'ද', 'p': 'ච', '[': 'ඤ', ']': ';',
  'a': '්', 's': 'ි', 'd': 'ා', 'f': 'ෙ', 'g': 'ට', 'h': 'ය', 'j': 'ව', 'k': 'න', 'l': 'ක', ';': 'ත', "'": '.',
  'z': 'ෙ', 'x': 'ං', 'c': 'ජ', 'v': 'ඩ', 'b': 'ඉ', 'n': 'බ', 'm': 'ප', ',': 'ල', '.': 'ග', '/': 'භ',
  '1': 'ැ', '2': 'ු', '3': 'ී', '4': 'ෘ', '5': 'ෙ', '6': '්', '7': 'ෝ', '8': 'ේ', '9': 'ෛ', '0': 'ො',
  '-': 'ඞ', '=': 'ඍ', '`': 'ජ'
};

const WIJESEKERA_SHIFTED: { [key: string]: string } = {
  'Q': 'ූ', 'W': 'උ', 'E': 'ඈ', 'R': 'ඍ', 'T': 'ඔ', 'Y': 'ශ', 'U': 'ඖ', 'I': 'ෂ', 'O': 'ධ', 'P': 'ඡ', '{': 'ඥ', '}': ':',
  'A': '්', 'S': 'ී', 'D': 'ෘ', 'F': 'ෆ', 'G': 'ඨ', 'H': '්‍ය', 'J': 'ළු', 'K': 'ණ', 'L': 'ඛ', ':': 'ථ', '"': ',',
  'Z': 'ෛ', 'X': 'ඃ', 'C': 'ඣ', 'V': 'ඪ', 'B': 'ඊ', 'N': 'භ', 'M': 'ඵ', '<': 'ළ', '>': 'ඝ', '?': 'ළු',
  '!': '්‍ය', '@': 'ෲ', '#': 'ෙ', '$': '්‍ර', '%': 'ර්', '^': '්', '&': 'ෝ', '*': 'ේ', '(': '(', ')': ')',
  '_': 'ඞ', '+': 'ඍ', '~': 'ජ'
};

const WIJESEKERA_ROWS = [
  [
    { raw: "`", shiftRaw: "~", normal: "`", shifted: "~", label: "ජ", shiftLabel: "ජ" },
    { raw: "1", shiftRaw: "!", normal: "1", shifted: "!", label: "ැ", shiftLabel: "්‍ය" },
    { raw: "2", shiftRaw: "@", normal: "2", shifted: "@", label: "ු", shiftLabel: "ෲ" },
    { raw: "3", shiftRaw: "#", normal: "3", shifted: "#", label: "ී", shiftLabel: "ෙ" },
    { raw: "4", shiftRaw: "$", normal: "4", shifted: "$", label: "ෘ", shiftLabel: "්‍ර" },
    { raw: "5", shiftRaw: "%", normal: "5", shifted: "%", label: "ෙ", shiftLabel: "ර්" },
    { raw: "6", shiftRaw: "^", normal: "6", shifted: "^", label: "්", shiftLabel: "්" },
    { raw: "7", shiftRaw: "&", normal: "7", shifted: "&", label: "ෝ", shiftLabel: "ෝ" },
    { raw: "8", shiftRaw: "*", normal: "8", shifted: "*", label: "ේ", shiftLabel: "ේ" },
    { raw: "9", shiftRaw: "(", normal: "9", shifted: "(", label: "ෛ", shiftLabel: "(" },
    { raw: "0", shiftRaw: ")", normal: "0", shifted: ")", label: "ො", shiftLabel: ")" },
    { raw: "-", shiftRaw: "_", normal: "-", shifted: "_", label: "ඞ", shiftLabel: "ඞ" },
    { raw: "=", shiftRaw: "+", normal: "=", shifted: "+", label: "ඍ", shiftLabel: "ඍ" },
  ],
  [
    { raw: "q", shiftRaw: "Q", normal: "q", shifted: "Q", label: "ු", shiftLabel: "ූ" },
    { raw: "w", shiftRaw: "W", normal: "w", shifted: "W", label: "අ", shiftLabel: "උ" },
    { raw: "e", shiftRaw: "E", normal: "e", shifted: "E", label: "ඇ", shiftLabel: "ඈ" },
    { raw: "r", shiftRaw: "R", normal: "r", shifted: "R", label: "ර", shiftLabel: "ඍ" },
    { raw: "t", shiftRaw: "T", normal: "t", shifted: "T", label: "එ", shiftLabel: "ඔ" },
    { raw: "y", shiftRaw: "Y", normal: "y", shifted: "Y", label: "හ", shiftLabel: "ශ" },
    { raw: "u", shiftRaw: "U", normal: "u", shifted: "U", label: "ම", shiftLabel: "ඖ" },
    { raw: "i", shiftRaw: "I", normal: "i", shifted: "I", label: "ස", shiftLabel: "ෂ" },
    { raw: "o", shiftRaw: "O", normal: "o", shifted: "O", label: "ද", shiftLabel: "ධ" },
    { raw: "p", shiftRaw: "P", normal: "p", shifted: "P", label: "ච", shiftLabel: "ඡ" },
    { raw: "[", shiftRaw: "{", normal: "[", shifted: "{", label: "ඤ", shiftLabel: "ඥ" },
    { raw: "]", shiftRaw: "}", normal: "]", shifted: "}", label: ";", shiftLabel: ":" },
  ],
  [
    { raw: "a", shiftRaw: "A", normal: "a", shifted: "A", label: "්", shiftLabel: "්" },
    { raw: "s", shiftRaw: "S", normal: "s", shifted: "S", label: "ි", shiftLabel: "ී" },
    { raw: "d", shiftRaw: "D", normal: "d", shifted: "D", label: "ා", shiftLabel: "ෘ" },
    { raw: "f", shiftRaw: "F", normal: "f", shifted: "F", label: "ෙ", shiftLabel: "ෆ" },
    { raw: "g", shiftRaw: "G", normal: "g", shifted: "G", label: "ට", shiftLabel: "ඨ" },
    { raw: "h", shiftRaw: "H", normal: "h", shifted: "H", label: "ය", shiftLabel: "්‍ය" },
    { raw: "j", shiftRaw: "J", normal: "j", shifted: "J", label: "ව", shiftLabel: "ළු" },
    { raw: "k", shiftRaw: "K", normal: "k", shifted: "K", label: "න", shiftLabel: "ණ" },
    { raw: "l", shiftRaw: "L", normal: "l", shifted: "L", label: "ක", shiftLabel: "ඛ" },
    { raw: ";", shiftRaw: ":", normal: ";", shifted: ":", label: "ත", shiftLabel: "ථ" },
    { raw: "'", shiftRaw: '"', normal: "'", shifted: '"', label: ".", shiftLabel: "," },
  ],
  [
    { raw: "z", shiftRaw: "Z", normal: "z", shifted: "Z", label: "ෙ", shiftLabel: "ෛ" },
    { raw: "x", shiftRaw: "X", normal: "x", shifted: "X", label: "ං", shiftLabel: "ඃ" },
    { raw: "c", shiftRaw: "C", normal: "c", shifted: "C", label: "ජ", shiftLabel: "ඣ" },
    { raw: "v", shiftRaw: "V", normal: "v", shifted: "V", label: "ඩ", shiftLabel: "ඪ" },
    { raw: "b", shiftRaw: "B", normal: "b", shifted: "B", label: "ඉ", shiftLabel: "ඊ" },
    { raw: "n", shiftRaw: "N", normal: "n", shifted: "N", label: "බ", shiftLabel: "භ" },
    { raw: "m", shiftRaw: "M", normal: "m", shifted: "M", label: "ප", shiftLabel: "ඵ" },
    { raw: ",", shiftRaw: "<", normal: ",", shifted: "<", label: "ල", shiftLabel: "ළ" },
    { raw: ".", shiftRaw: ">", normal: ".", shifted: ">", label: "ග", shiftLabel: "ඝ" },
    { raw: "/", shiftRaw: "?", normal: "/", shifted: "?", label: "භ", shiftLabel: "ළු" },
  ]
];

export default function App() {
  // Application State
  const [inputText, setInputText] = useState(() => {
    return localStorage.getItem("sinhala_converter_input") || "";
  });
  const [outputText, setOutputText] = useState("");
  const [conversionMode, setConversionMode] = useState<"unicode-to-legacy" | "legacy-to-unicode">(() => {
    return (localStorage.getItem("sinhala_converter_mode") as any) || "unicode-to-legacy";
  });
  const [outputViewMode, setOutputViewMode] = useState<"raw" | "visual">("raw");
  const [customFont, setCustomFont] = useState<{name: string, url: string} | null>(null);
  
  // Custom target font and typographical options for the superb design canvas
  const [targetFontName, setTargetFontName] = useState<string>(() => {
    return localStorage.getItem("sinhala_target_font_name") || "DL-Manel";
  });
  const [visualFontSize, setVisualFontSize] = useState<number>(24);
  const [visualLineHeight, setVisualLineHeight] = useState<number>(1.5);
  const [visualLetterSpacing, setVisualLetterSpacing] = useState<number>(0);
  const [visualAlignment, setVisualAlignment] = useState<"left" | "center" | "right" | "justify">("left");
  const [visualBgTheme, setVisualBgTheme] = useState<string>("slate");
  const [showFontSettings, setShowFontSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [copiedState, setCopiedState] = useState<"idle" | "success">("idle");
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [activeGuideStep, setActiveGuideStep] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Word Add-In Live states
  const [isWordAddIn, setIsWordAddIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);
      const isAddInMode = queryParams.get("office-add-in") === "true";
      
      if (isAddInMode) {
        setIsWordAddIn(true);
        
        // Dynamically load the Office JS SDK to prevent interfering with normal site loads
        if (!(window as any).Office) {
          const script = document.createElement("script");
          script.src = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";
          script.async = true;
          script.onload = () => {
            initOfficeSDK();
          };
          script.onerror = () => {
            console.error("Failed to load Office JS SDK.");
          };
          document.head.appendChild(script);
        } else {
          initOfficeSDK();
        }
      }

      // Auto-focus and activate KeyRep Navigation when launched from KeyHelper shortcut
      const isKeyHelperRequested = queryParams.get("keyhelper") === "true" || window.location.hash.includes("keyrep");
      if (isKeyHelperRequested) {
        setTypingMode("phonetic");
        setTimeout(() => {
          const el = document.getElementById("keyrep-master-navigation-bar");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
      }
    }

    function initOfficeSDK() {
      const Office = (window as any).Office;
      if (Office && Office.onReady) {
        Office.onReady((info: any) => {
          if (info && info.host === "Word") {
            setIsWordAddIn(true);
            setTimeout(() => {
              triggerToast("Connected directly inside MS Word Document!");
            }, 500);
          }
        });
      }
    }
  }, []);

  // MS Word Dynamic Integration States
  const [mockWordText, setMockWordText] = useState("ශ්‍රී ලංකා නිදහස් දිනය");
  const [mockWordFont, setMockWordFont] = useState("Iskoola Pota"); // Standard Unicode font
  const [isMacroRunning, setIsMacroRunning] = useState(false);
  const [macroCopied, setMacroCopied] = useState(false);
  const [wordIntegrationTab, setWordIntegrationTab] = useState<"auto" | "vba" | "addin" | "troubleshoot">("auto");

  // Typing Assistant States
  const [typingMode, setTypingMode] = useState<"standard" | "wijesekera" | "phonetic">("standard");
  const [singlishBuffer, setSinglishBuffer] = useState("");
  const [phoneticSubTab, setPhoneticSubTab] = useState<"candidates" | "dictionary" | "cheatsheet">("candidates");
  const [keyboardShift, setKeyboardShift] = useState(false);
  const [activeKeyPressed, setActiveKeyPressed] = useState<string | null>(null);
  const [selectedKeyboardLayout, setSelectedKeyboardLayout] = useState<"wijesekera" | "phonetic">("wijesekera");
  const [activePhoneticWord, setActivePhoneticWord] = useState("");
  const [customWords, setCustomWords] = useState<{ singlish: string; sinhala: string }[]>(() => {
    try {
      const saved = localStorage.getItem("sinhala_custom_lexicon");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newCustomSinglish, setNewCustomSinglish] = useState("");
  const [newCustomSinhala, setNewCustomSinhala] = useState("");
  const [practiceInput, setPracticeInput] = useState("");
  const [selectedOsTab, setSelectedOsTab] = useState<"all" | "windows" | "macos" | "linux" | "android" | "ios">("all");

  // Adaptive Font Learning & Overrides State
  const [fontOverrides, setFontOverrides] = useState<Record<string, Array<{ find: string, replace: string }>>>(() => {
    try {
      const saved = localStorage.getItem("sinhala_font_overrides");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [mappingProfile, setMappingProfile] = useState<"DL_SERIES" | "FM_SERIES">(() => {
    try {
      const saved = localStorage.getItem("sinhala_mapping_profile");
      if (saved === "DL_SERIES" || saved === "FM_SERIES") return saved;
      const initialFont = localStorage.getItem("sinhala_target_font_name") || "DL-Manel";
      return (initialFont.toLowerCase().includes("fm") || initialFont.toLowerCase().includes("bindumathi")) ? "FM_SERIES" : "DL_SERIES";
    } catch (e) {
      return "DL_SERIES";
    }
  });

  const FM_SERIES_DEFAULTS = [
    { find: "ලූ", replace: "¿" },
    { find: "ලු", replace: "¨" },
    { find: "ශ්‍රී", replace: "Y%S" },
    { find: "ද්‍ර", replace: "o%" },
    { find: "ප්‍රැ", replace: "m%E" }
  ];

  const getMergedOverrides = (fontName: string) => {
    const userOverrides = fontOverrides[fontName] || [];
    const fontLower = fontName.toLowerCase();
    const isFm = fontLower.includes("fm") || fontLower.includes("bindumathi") || mappingProfile === "FM_SERIES";
    const profileDefaults = isFm ? FM_SERIES_DEFAULTS : [];
    
    const merged = [...userOverrides];
    for (const d of profileDefaults) {
      if (!merged.some(o => o.find === d.find)) {
        merged.push(d);
      }
    }
    return merged;
  };

  const [lastConvertedText, setLastConvertedText] = useState("");
  const [editedOutputText, setEditedOutputText] = useState("");
  const [showLearningStudio, setShowLearningStudio] = useState(false);
  const [learningUnicode, setLearningUnicode] = useState("");
  const [learningLegacy, setLearningLegacy] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const phoneticBufferRef = useRef("");
  const lastSinhalaLenRef = useRef(0);

  // Character and word counts
  const inputCharCount = inputText.length;
  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const outputCharCount = outputText.length;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  // Perform translation
  const executeConversion = (text: string, mode: typeof conversionMode) => {
    if (!text) {
      setOutputText("");
      setLastConvertedText("");
      setEditedOutputText("");
      return;
    }
    const activeOverrides = getMergedOverrides(targetFontName);
    const result = mode === "unicode-to-legacy" 
      ? unicodeToDlManel(text, activeOverrides, mappingProfile) 
      : dlManelToUnicode(text, activeOverrides, mappingProfile);
    setOutputText(result);
    setLastConvertedText(result);
    setEditedOutputText(result);
  };

  const getAutoLearntSuggestions = () => {
    if (conversionMode !== "unicode-to-legacy") return [];
    if (!inputText || !lastConvertedText || !editedOutputText) return [];
    if (lastConvertedText === editedOutputText) return [];

    const unicodeWords = inputText.trim().split(/\s+/).filter(Boolean);
    const originalWords = lastConvertedText.trim().split(/\s+/).filter(Boolean);
    const editedWords = editedOutputText.trim().split(/\s+/).filter(Boolean);

    // Only align if word counts match exactly
    if (unicodeWords.length !== originalWords.length || originalWords.length !== editedWords.length) {
      return [];
    }

    const suggestions: Array<{ unicode: string, original: string, corrected: string }> = [];
    for (let i = 0; i < originalWords.length; i++) {
      if (originalWords[i] !== editedWords[i]) {
        // Only suggest if we haven't already saved this exact override rule
        const existingOverrides = fontOverrides[targetFontName] || [];
        const alreadyTrained = existingOverrides.some(
          rule => rule.find === unicodeWords[i] && rule.replace === editedWords[i]
        );
        if (!alreadyTrained) {
          suggestions.push({
            unicode: unicodeWords[i],
            original: originalWords[i],
            corrected: editedWords[i]
          });
        }
      }
    }
    return suggestions;
  };

  // Convert on input, mode swap, or override change
  useEffect(() => {
    if (isLiveActive) {
      executeConversion(inputText, conversionMode);
    }
    localStorage.setItem("sinhala_converter_input", inputText);
    localStorage.setItem("sinhala_converter_mode", conversionMode);
  }, [inputText, conversionMode, isLiveActive, fontOverrides, targetFontName, mappingProfile]);

  // Synchronize targetFontName and auto-detect Mapping Profile
  useEffect(() => {
    localStorage.setItem("sinhala_target_font_name", targetFontName);
    
    // Auto-detect profile based on name
    const fontLower = targetFontName.toLowerCase();
    if (fontLower.includes("fm") || fontLower.includes("bindumathi") || fontLower.includes("malithi") || fontLower.includes("abhaya")) {
      if (mappingProfile !== "FM_SERIES") {
        setMappingProfile("FM_SERIES");
        localStorage.setItem("sinhala_mapping_profile", "FM_SERIES");
        triggerToast(`Auto-selected FM-Abaya layout profile for "${targetFontName}"!`);
      }
    } else {
      if (mappingProfile !== "DL_SERIES") {
        setMappingProfile("DL_SERIES");
        localStorage.setItem("sinhala_mapping_profile", "DL_SERIES");
        triggerToast(`Auto-selected DL-Manel layout profile for "${targetFontName}"!`);
      }
    }
  }, [targetFontName]);

  // Keep visual keyboard layout selected matching current typing mode
  useEffect(() => {
    if (typingMode === "wijesekera") {
      setSelectedKeyboardLayout("wijesekera");
    } else if (typingMode === "phonetic") {
      setSelectedKeyboardLayout("phonetic");
    }
  }, [typingMode]);

  // Global hotkey (Ctrl+Space, F12) to toggle KeyRep / SanTyper mode anytime
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.code === "Space") || e.key === "F12") {
        e.preventDefault();
        setTypingMode((prev) => {
          if (prev === "standard") {
            triggerToast("⚡ SanTyper: Singlish Phonetic Active (KeyRep Mode)");
            return "phonetic";
          } else if (prev === "phonetic") {
            triggerToast("⚡ SanTyper: Wijesekera Hardware Map Active");
            return "wijesekera";
          } else {
            triggerToast("⚡ SanTyper: Standard English / Direct Input");
            return "standard";
          }
        });
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const getSuggestionsWithCustom = (buf: string) => {
    if (!buf) return [];
    const cleanInput = buf.toLowerCase().trim();
    
    // Custom words starting with input
    const customMatches = customWords.filter(w => w.singlish.startsWith(cleanInput));
    const generic = getPhoneticSuggestions(cleanInput);
    
    const results = new Set<string>();
    
    // Prioritize user-taught customized phrases!
    customMatches.forEach(item => {
      results.add(item.sinhala);
    });
    
    generic.forEach(item => {
      results.add(item);
    });
    
    return Array.from(results).slice(0, 8);
  };

  const handleAddCustomWord = (singlish: string, sinhala: string) => {
    if (!singlish || !sinhala) return;
    const cleanedSinglish = singlish.toLowerCase().trim();
    const updated = [
      ...customWords.filter(item => item.singlish !== cleanedSinglish),
      { singlish: cleanedSinglish, sinhala: sinhala.trim() }
    ];
    setCustomWords(updated);
    try {
      localStorage.setItem("sinhala_custom_lexicon", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCustomWord = (singlish: string) => {
    const updated = customWords.filter(item => item.singlish !== singlish);
    setCustomWords(updated);
    try {
      localStorage.setItem("sinhala_custom_lexicon", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const resetPhoneticState = () => {
    phoneticBufferRef.current = "";
    lastSinhalaLenRef.current = 0;
    setActivePhoneticWord("");
  };

  // Insert character at cursor helper
  const handleInsertCharacter = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setInputText(prev => prev + char);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalVal = textarea.value;
    const newVal = originalVal.substring(0, start) + char + originalVal.substring(end);
    
    setInputText(newVal);
    
    // Move cursor and regain focus safely
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + char.length;
    }, 0);
  };

  const replaceLastNCharsWith = (n: number, newStr: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalVal = textarea.value;

    const deleteStart = Math.max(0, start - n);
    const newVal = originalVal.substring(0, deleteStart) + newStr + originalVal.substring(end);

    setInputText(newVal);

    setTimeout(() => {
      textarea.focus();
      const nextCursorPos = deleteStart + newStr.length;
      textarea.selectionStart = textarea.selectionEnd = nextCursorPos;
    }, 0);
  };

  const handlePhoneticInput = (key: string) => {
    if (key === "Backspace") {
      if (phoneticBufferRef.current.length > 0) {
        const nextBuffer = phoneticBufferRef.current.slice(0, -1);
        phoneticBufferRef.current = nextBuffer;
        setActivePhoneticWord(nextBuffer);
        
        if (nextBuffer.length === 0) {
          replaceLastNCharsWith(lastSinhalaLenRef.current, "");
          lastSinhalaLenRef.current = 0;
        } else {
          const suggestions = getSuggestionsWithCustom(nextBuffer);
          const translated = suggestions.length > 0 ? suggestions[0] : phoneticToUnicode(nextBuffer);
          replaceLastNCharsWith(lastSinhalaLenRef.current, translated);
          lastSinhalaLenRef.current = translated.length;
        }
      }
      return;
    }

    if (/^[a-zA-Z]$/.test(key)) {
      const nextBuffer = phoneticBufferRef.current + key;
      phoneticBufferRef.current = nextBuffer;
      setActivePhoneticWord(nextBuffer);
      
      const suggestions = getSuggestionsWithCustom(nextBuffer);
      const translated = suggestions.length > 0 ? suggestions[0] : phoneticToUnicode(nextBuffer);
      replaceLastNCharsWith(lastSinhalaLenRef.current, translated);
      lastSinhalaLenRef.current = translated.length;
      return;
    }

    // Space, Enter or other keys commit the buffer status
    resetPhoneticState();
    if (key === " ") {
      handleInsertCharacter(" ");
    } else if (key === "Enter") {
      handleInsertCharacter("\n");
    } else if (key.length === 1) {
      handleInsertCharacter(key);
    }
  };

  const handleSelectPhoneticSuggestion = (suggestion: string) => {
    replaceLastNCharsWith(lastSinhalaLenRef.current, suggestion);
    resetPhoneticState();
  };

  const handleSourceKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Set active key reflection for on-screen highlight
    setActiveKeyPressed(e.key.toLowerCase());

    if (typingMode === "wijesekera") {
      // Ignore keys that are systemic
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return; // avoid Backspace, Arrow keys, etc.

      e.preventDefault();
      const isShift = e.shiftKey;
      const key = e.key;
      const mapped = isShift ? WIJESEKERA_SHIFTED[key] : WIJESEKERA_UNSHIFTED[key];
      const charToInsert = mapped !== undefined ? mapped : key;

      handleInsertCharacter(charToInsert);
    } else if (typingMode === "phonetic") {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const activeLen = phoneticBufferRef.current.length;

      if (e.key === "Backspace") {
        if (activeLen > 0) {
          e.preventDefault();
          handlePhoneticInput("Backspace");
        }
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handlePhoneticInput(e.key);
        return;
      }

      // Spacebar commits top predictive suggestion!
      if (e.key === " ") {
        if (activeLen > 0) {
          e.preventDefault();
          const suggestions = getSuggestionsWithCustom(phoneticBufferRef.current);
          const topSuggestion = suggestions.length > 0 ? suggestions[0] : phoneticToUnicode(phoneticBufferRef.current);
          replaceLastNCharsWith(lastSinhalaLenRef.current, topSuggestion + " ");
          resetPhoneticState();
          return;
        }
        // Let normal space flow if no buffer active
        resetPhoneticState();
        return;
      }

      // Enter key commits top predictive suggestion and proceeds to next line
      if (e.key === "Enter") {
        if (activeLen > 0) {
          e.preventDefault();
          const suggestions = getSuggestionsWithCustom(phoneticBufferRef.current);
          const topSuggestion = suggestions.length > 0 ? suggestions[0] : phoneticToUnicode(phoneticBufferRef.current);
          replaceLastNCharsWith(lastSinhalaLenRef.current, topSuggestion);
          handleInsertCharacter("\n");
          resetPhoneticState();
          return;
        }
        resetPhoneticState();
        return;
      }

      // Number keys 1-8 act as fast hotkeys for committing predictive suggestions
      if (/^[1-8]$/.test(e.key) && activeLen > 0) {
        const numIndex = parseInt(e.key) - 1;
        const suggestions = getSuggestionsWithCustom(phoneticBufferRef.current);
        if (numIndex < suggestions.length) {
          e.preventDefault();
          const selectedCandidate = suggestions[numIndex];
          replaceLastNCharsWith(lastSinhalaLenRef.current, selectedCandidate);
          resetPhoneticState();
          return;
        }
      }

      // Reset on positioning keys
      if (e.key.startsWith("Arrow") || ["Home", "End", "PageUp", "PageDown", "Escape"].includes(e.key)) {
        resetPhoneticState();
        return;
      }

      // Other keys commit current buffer and behave normally
      resetPhoneticState();
    }
  };

  const handleSourceKeyUp = () => {
    // Reset keycap glow with a slight beautiful organic tail fade
    setTimeout(() => {
      setActiveKeyPressed(null);
    }, 150);
  };

  // Convert and Append Phonetic buffer to source
  const handleAppendPhoneticBuffer = () => {
    if (!singlishBuffer) return;
    const translated = phoneticToUnicode(singlishBuffer);
    handleInsertCharacter(translated + " ");
    setSinglishBuffer("");
    triggerToast("Transliterated phrase appended to workspace!");
  };

  // Live phonetic buffer change handler
  const handlePhoneticBufferChange = (val: string) => {
    setSinglishBuffer(val);
  };

  // Handle swap direction trigger
  const handleSwapMode = () => {
    const nextMode = conversionMode === "unicode-to-legacy" ? "legacy-to-unicode" : "unicode-to-legacy";
    setConversionMode(nextMode);
    
    // Swap text blocks
    setInputText(outputText);
    setOutputText(inputText);

    triggerToast(
      nextMode === "unicode-to-legacy" 
        ? "Switched to: Sinhala Unicode ➔ DL-Manel Font" 
        : "Switched to: DL-Manel Font ➔ Sinhala Unicode"
    );
  };

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Copy to clipboard with success animation
  const handleCopyToClipboard = async () => {
    if (!outputText) return;
    try {
      const activeOverrides = getMergedOverrides(targetFontName);
      const htmlContent = getRichTextHTML(inputText, conversionMode, targetFontName, activeOverrides, mappingProfile);
      
      const fullHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
        <meta charset="utf-8">
        <title>Exported Text</title>
        </head>
        <body>
        ${htmlContent}
        </body>
        </html>
      `;
      
      const clipboardItem = new ClipboardItem({
        "text/plain": new Blob([outputText], { type: "text/plain" }),
        "text/html": new Blob([fullHtml], { type: "text/html" })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      setCopiedState("success");
      triggerToast(`Copied! Rich text styled for '${targetFontName}' is ready to paste into Word.`);
      setTimeout(() => {
        setCopiedState("idle");
      }, 2000);
    } catch (err) {
      console.error(err);
      // Fallback to plain text if ClipboardItem API is not supported or fails
      try {
        await navigator.clipboard.writeText(outputText);
        setCopiedState("success");
        triggerToast("Copied to clipboard as plain text.");
        setTimeout(() => {
          setCopiedState("idle");
        }, 2000);
      } catch (fallbackErr) {
        triggerToast("Failed to copy to clipboard.");
      }
    }
  };

  // Clear workspace
  const handleClearWorkspace = () => {
    if (!inputText) return;
    setInputText("");
    setOutputText("");
    triggerToast("Workspace cleared.");
  };

  // Save selected legacy font name to local storage
  useEffect(() => {
    localStorage.setItem("sinhala_target_font_name", targetFontName);
  }, [targetFontName]);

  // Sanitize input text to resolve double modifiers and common typing bugs
  const handleSanitizeInput = () => {
    if (!inputText) {
      triggerToast("Input is empty! Please type or paste some Sinhala text first.");
      return;
    }
    let sanitized = inputText;
    // Remove duplicate vowel signs using literal Sinhala characters
    sanitized = sanitized.replace(/ිි/g, "ි"); // Duplicate Ispilla
    sanitized = sanitized.replace(/ීී/g, "ී"); // Duplicate Eespilla
    sanitized = sanitized.replace(/ුු/g, "ු"); // Duplicate Papilla
    sanitized = sanitized.replace(/ූූ/g, "ූ"); // Duplicate Doopapilla
    sanitized = sanitized.replace(/්්/g, "්"); // Duplicate Al-lakuna
    
    // Fix orphaned ZWJ combinations
    sanitized = sanitized.replace(/්‌්/g, "්");
    
    // Fix detached vowel modifiers with spaces
    sanitized = sanitized.replace(/\s+(\u0DCA|\u0DD2|\u0DD3|\u0DD4|\u0DD6|\u0DDA|\u0DDB|\u0DDC|\u0DDD|\u0DDE|\u0DDF)/g, "$1");

    if (sanitized !== inputText) {
      setInputText(sanitized);
      triggerToast("Auto-Fixed common Sinhala Unicode typing bugs!");
    } else {
      triggerToast("Sinhala text looks clean! No common typing errors detected.");
    }
  };

  // Simple heuristic for Auto-Detect mode when pasting
  const handleAutoDetect = (text: string) => {
    if (!text || text.trim() === "") return;
    const sinhalaRegex = /[\u0D80-\u0DFF]/g;
    const matches = text.match(sinhalaRegex);
    const sinhalaCount = matches ? matches.length : 0;
    
    if (sinhalaCount > 2) {
      if (conversionMode !== "unicode-to-legacy") {
        setConversionMode("unicode-to-legacy");
        triggerToast("Auto-detected: Unicode Mode (Switched to DL-Manel Output)");
      }
    } else {
      if (conversionMode !== "legacy-to-unicode") {
        setConversionMode("legacy-to-unicode");
        triggerToast("Auto-detected: Legacy Mode (Switched to Sinhala Unicode Output)");
      }
    }
  };

  // Handle paste for auto-detection
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("Text");
    if (pastedText) {
      handleAutoDetect(pastedText);
    }
  };

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const opentypeModule = await import("opentype.js");
      const opentype = (opentypeModule as any).default || opentypeModule;
      const arrayBuffer = await file.arrayBuffer();
      const font = opentype.parse(arrayBuffer);
      const fontFamilyObj = font.names && font.names.fontFamily;
      let fontName = "CustomFont";
      if (fontFamilyObj) {
        if (typeof fontFamilyObj === "string") {
          fontName = fontFamilyObj;
        } else {
          fontName = fontFamilyObj.en || Object.values(fontFamilyObj)[0] || "CustomFont";
        }
      }
      
      const fontUrl = URL.createObjectURL(file);
      
      // Inject global font-face
      const styleId = 'custom-uploaded-font-style';
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = `
        @font-face {
          font-family: '${fontName}';
          src: url('${fontUrl}');
        }
      `;

      setCustomFont({ name: fontName, url: fontUrl });
      setTargetFontName(fontName);
      triggerToast(`Custom font '${fontName}' loaded! Conversion matches this font.`);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to parse the uploaded font file.");
    }
  };

  // Download Output as True MS Word Document (.docx)
  const handleDownloadWord = async () => {
    if (!outputText) return;
    try {
      const { exportToDocx } = await import("./lib/docxExport");
      const activeOverrides = getMergedOverrides(targetFontName);
      await exportToDocx(inputText, conversionMode, targetFontName, activeOverrides, mappingProfile);
      triggerToast(`Downloaded MS Word (.docx) formatted for '${targetFontName}'!`);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to generate Word document.");
    }
  };

  // Word Add-In Live Selection Converter Logic
  const handleConvertWordSelection = async (forceMode?: "auto" | "unicode-to-legacy" | "legacy-to-unicode") => {
    if (typeof window === "undefined" || !(window as any).Office || !(window as any).Word) {
      triggerToast("MS Word session API is not active.");
      return;
    }

    setIsMacroRunning(true);
    try {
      await (window as any).Word.run(async (context: any) => {
        const range = context.document.getSelection();
        range.load("text");
        await context.sync();

        const originalText = range.text;
        if (!originalText || originalText.trim() === "") {
          triggerToast("කරුණාකර පළමුව Word ලේඛනයේ සිංහල වාක්‍යයක් සිලෙක්ට් කරන්න.");
          setIsMacroRunning(false);
          return;
        }

        let effectiveMode = forceMode || conversionMode;
        if (effectiveMode === "auto") {
          const hasUnicode = /[\u0D80-\u0DFF]/.test(originalText);
          effectiveMode = hasUnicode ? "unicode-to-legacy" : "legacy-to-unicode";
        }

        let convertedText = "";
        const activeOverrides = getMergedOverrides(targetFontName);
        if (effectiveMode === "unicode-to-legacy") {
          convertedText = unicodeToDlManel(originalText, activeOverrides, mappingProfile);
          range.insertText(convertedText, "Replace");
          range.font.name = targetFontName;
          await context.sync();
          triggerToast(`Converted to "${targetFontName}" in MS Word!`);
        } else {
          convertedText = dlManelToUnicode(originalText, activeOverrides, mappingProfile);
          range.insertText(convertedText, "Replace");
          range.font.name = "Iskoola Pota";
          await context.sync();
          triggerToast("Converted to Sinhala Unicode (Iskoola Pota) in MS Word!");
        }
      });
    } catch (err: any) {
      console.error("Word Add-in Error:", err);
      triggerToast("Word conversion failed: " + err.message);
    } finally {
      setIsMacroRunning(false);
    }
  };

  // Modern Office JS Add-in manifest.xml downloader
  const handleDownloadManifest = () => {
    const origin = typeof window !== "undefined" && window.location.origin.includes("localhost") 
      ? "https://ais-dev-tynosbz2nq3pup4zb5zyun-993606523058.asia-southeast1.run.app"
      : typeof window !== "undefined" ? window.location.origin : "";
      
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:type="TaskPaneApp">
  <Id>f47ac10b-58cc-4372-a567-0e02b2c3d479</Id>
  <Version>1.1.0.0</Version>
  <ProviderName>Sinhala Converter Pro</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Sinhala Word Pro" />
  <Description DefaultValue="Directly convert Sinhala Unicode and Legacy fonts (DL-Manel, FM-Abaya) in Microsoft Word." />
  <IconUrl DefaultValue="${origin}/favicon.ico" />
  <HighResolutionIconUrl DefaultValue="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128" />
  <SupportUrl DefaultValue="${origin}" />
  <AppDomains>
    <AppDomain>${origin}</AppDomain>
  </AppDomains>
  <Hosts>
    <Host Name="Document" />
  </Hosts>
  <DefaultSettings>
    <SourceLocation DefaultValue="${origin}/?office-add-in=true" />
  </DefaultSettings>
  <Permissions>ReadWriteDocument</Permissions>
</OfficeApp>`;

    const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sinhala-converter-word-addin.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("MS Word Add-in Manifest (XML) downloaded!");
  };

  // Direct Downloadable VBA Module (.bas) file for Microsoft Word
  const handleDownloadVbaBas = () => {
    const code = getVbaCodeString();
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SinhalaWordConverter.bas";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("SinhalaWordConverter.bas downloaded! In Word: Alt+F11 -> File -> Import File.");
  };

  // 1-Click Registry Fixer file (.reg)
  const handleDownloadRegFile = () => {
    const regContent = `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\16.0\\Word\\Security]
"AccessVBOM"=dword:00000001

[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\15.0\\Word\\Security]
"AccessVBOM"=dword:00000001

[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\14.0\\Word\\Security]
"AccessVBOM"=dword:00000001

[HKEY_CURRENT_USER\\Software\\Policies\\Microsoft\\Office\\16.0\\Word\\Security]
"AccessVBOM"=dword:00000001
`;
    const blob = new Blob([regContent], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "EnableWordMacroAccess.reg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("EnableWordMacroAccess.reg downloaded! Double-click and click Yes to enable.");
  };

  // Download install.ps1 script
  const handleDownloadPs1Script = () => {
    const origin = typeof window !== "undefined" && window.location.origin.includes("localhost") 
      ? "https://ais-dev-tynosbz2nq3pup4zb5zyun-993606523058.asia-southeast1.run.app"
      : typeof window !== "undefined" ? window.location.origin : "";
    
    window.open(`${origin}/install.ps1`, "_blank");
    triggerToast("Opening install.ps1 script in new tab...");
  };

  // Run MS Word Mock Macro Simulation
  const handleRunMockMacro = (mode: "auto" | "to-legacy" | "to-unicode" = "auto") => {
    if (!mockWordText || mockWordText.trim() === "") {
      triggerToast("Mock Word sheet is empty.");
      return;
    }

    setIsMacroRunning(true);
    setTimeout(() => {
      try {
        const hasUnicode = /[\u0D80-\u0DFF]/.test(mockWordText);
        let runToLegacy = true;

        if (mode === "auto") {
          runToLegacy = hasUnicode;
        } else if (mode === "to-legacy") {
          runToLegacy = true;
        } else if (mode === "to-unicode") {
          runToLegacy = false;
        }

        const activeOverrides = getMergedOverrides(targetFontName);
        if (runToLegacy) {
          const converted = unicodeToDlManel(mockWordText, activeOverrides, mappingProfile);
          setMockWordText(converted);
          setMockWordFont(targetFontName);
          triggerToast(`Word Macro executed! Converted to "${targetFontName}"`);
        } else {
          const converted = dlManelToUnicode(mockWordText, activeOverrides, mappingProfile);
          setMockWordText(converted);
          setMockWordFont("Iskoola Pota");
          triggerToast(`Word Macro executed! Converted to Sinhala Unicode (Iskoola Pota)`);
        }
      } catch (err: any) {
        triggerToast("Mock macro error: " + err.message);
      } finally {
        setIsMacroRunning(false);
      }
    }, 500);
  };

  const getVbaCodeString = () => {
    const origin = typeof window !== "undefined" && window.location.origin.includes("localhost") 
      ? "https://ais-dev-tynosbz2nq3pup4zb5zyun-993606523058.asia-southeast1.run.app"
      : typeof window !== "undefined" ? window.location.origin : "";
    
    return `Attribute VB_Name = "SinhalaWordConverter"

' =========================================================================
'  Sinhala Unicode & Legacy Converter Pro for Microsoft Word
'  Connected to Live API: ${origin}
'  Target Font: ${targetFontName} | Profile: ${mappingProfile}
'  Keybindings:
'    Alt + S : Smart Auto-Detect & Convert
'    Alt + U : Convert Selection to Unicode (Iskoola Pota)
'    Alt + L : Convert Selection to Legacy (${targetFontName})
' =========================================================================

Public Const API_ORIGIN As String = "${origin}"
Public Const DEFAULT_LEGACY_FONT As String = "${targetFontName}"
Public Const DEFAULT_PROFILE As String = "${mappingProfile}"

Private Function HasSinhalaUnicode(ByVal txt As String) As Boolean
    Dim i As Long, code As Long
    For i = 1 To Len(txt)
        code = AscW(Mid$(txt, i, 1))
        If code < 0 Then code = code + 65536
        If code >= &H0D80 And code <= &H0DFF Then
            HasSinhalaUnicode = True
            Exit Function
        End If
    Next i
    HasSinhalaUnicode = False
End Function

Sub ConvertSelectionSinhalaAutoDetect()
    Dim rawText As String
    rawText = Selection.Text
    If Len(Trim(rawText)) < 1 Or rawText = vbCr Or rawText = vbCrLf Then
        MsgBox "කරුණාකර පළමුව Word ලේඛනයෙන් සිංහල ඡේදයක් තෝරන්න (Select text).", vbExclamation, "Sinhala Word Pro"
        Exit Sub
    End If
    
    If HasSinhalaUnicode(rawText) Then
        ConvertSelectionToSinhalaLegacy
    Else
        ConvertSelectionToSinhalaUnicode
    End If
End Sub

Sub ConvertSelectionToSinhalaLegacy()
    Dim rawText As String, sendText As String, resultText As String
    Dim hasTrailingCr As Boolean
    Dim targetFont As String
    
    targetFont = DEFAULT_LEGACY_FONT
    rawText = Selection.Text
    If Len(Trim(rawText)) < 1 Or rawText = vbCr Or rawText = vbCrLf Then
        MsgBox "කරුණාකර පළමුව සිංහල යුනිකෝඩ් (Unicode) ඡේදයක් තෝරන්න.", vbExclamation, "Sinhala Word Pro"
        Exit Sub
    End If
    
    hasTrailingCr = False
    sendText = rawText
    If Right(sendText, 1) = vbCr Then
        hasTrailingCr = True
        sendText = Left(sendText, Len(sendText) - 1)
    End If
    
    resultText = CallConverterApi(sendText, "unicode-to-legacy", targetFont, DEFAULT_PROFILE)
    
    If Left(resultText, 6) = "Error:" Then
        MsgBox resultText, vbCritical, "Sinhala Word Pro"
    Else
        If hasTrailingCr Then resultText = resultText & vbCr
        Selection.Text = resultText
        Selection.Font.Name = targetFont
        StatusBar = "සිංහල පරිවර්තනය සාර්ථකයි (" & targetFont & ")."
    End If
End Sub

Sub ConvertSelectionToSinhalaUnicode()
    Dim rawText As String, sendText As String, resultText As String
    Dim hasTrailingCr As Boolean
    
    rawText = Selection.Text
    If Len(Trim(rawText)) < 1 Or rawText = vbCr Or rawText = vbCrLf Then
        MsgBox "කරුණාකර පළමුව Legacy (DL-Manel/FMAbhaya) ඡේදයක් තෝරන්න.", vbExclamation, "Sinhala Word Pro"
        Exit Sub
    End If
    
    hasTrailingCr = False
    sendText = rawText
    If Right(sendText, 1) = vbCr Then
        hasTrailingCr = True
        sendText = Left(sendText, Len(sendText) - 1)
    End If
    
    resultText = CallConverterApi(sendText, "legacy-to-unicode", "Iskoola Pota", DEFAULT_PROFILE)
    
    If Left(resultText, 6) = "Error:" Then
        MsgBox resultText, vbCritical, "Sinhala Word Pro"
    Else
        If hasTrailingCr Then resultText = resultText & vbCr
        Selection.Text = resultText
        Selection.Font.Name = "Iskoola Pota"
        StatusBar = "සිංහල යුනිකෝඩ් බවට පරිවර්තනය සාර්ථකයි (Iskoola Pota)."
    End If
End Sub

Private Function CallConverterApi(ByVal payload As String, ByVal mode As String, ByVal fontName As String, ByVal profileName As String) As String
    Dim http As Object
    Dim requestUrl As String
    
    requestUrl = API_ORIGIN & "/api/convert?mode=" & mode & "&format=plain&font=" & fontName & "&profile=" & profileName
    
    On Error Resume Next
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    If http Is Nothing Then Set http = CreateObject("MSXML2.ServerXMLHTTP")
    If http Is Nothing Then Set http = CreateObject("MSXML2.XMLHTTP")
    If http Is Nothing Then Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    On Error GoTo CatchErr
    
    If http Is Nothing Then
        CallConverterApi = "Error: Word පරිසරයේ HTTP engine එක ආරම්භ කිරීමට නොහැකි විය."
        Exit Function
    End If
    
    http.Open "POST", requestUrl, False
    http.setRequestHeader "Content-Type", "text/plain; charset=utf-8"
    http.send payload
    
    If http.Status = 200 Then
        Dim resp As String
        resp = http.responseText
        If Len(Trim(resp)) = 0 Then
            CallConverterApi = "Error: සේවාදායකයෙන් හිස් පිළිතුරක් ලැබුණි."
        Else
            CallConverterApi = resp
        End If
    Else
        CallConverterApi = "Error: සේවාදායකය සමඟ සම්බන්ධ විය නොහැක (Status: " & http.Status & ")." & vbNewLine & http.responseText
    End If
    Exit Function

CatchErr:
    CallConverterApi = "Error: මැක්‍රෝ දෝෂයක් සිදුවිය: " & Err.Description
End Function

Sub RegisterSinhalaHotkeys()
    On Error Resume Next
    CustomizationContext = NormalTemplate
    KeyBindings.Add wdKeyCategoryMacro, "ConvertSelectionSinhalaAutoDetect", BuildKeyCode(wdKeyAlt, wdKeyS)
    KeyBindings.Add wdKeyCategoryMacro, "ConvertSelectionToSinhalaUnicode", BuildKeyCode(wdKeyAlt, wdKeyU)
    KeyBindings.Add wdKeyCategoryMacro, "ConvertSelectionToSinhalaLegacy", BuildKeyCode(wdKeyAlt, wdKeyL)
    NormalTemplate.Save
    MsgBox "යතුරුපුවරු කෙටිමං සාර්ථකව ලියාපදිංචි කරන ලදී:" & vbNewLine & _
           "- Alt + S : Auto-Detect & Convert" & vbNewLine & _
           "- Alt + U : Convert to Unicode" & vbNewLine & _
           "- Alt + L : Convert to Legacy (" & DEFAULT_LEGACY_FONT & ")", vbInformation, "Sinhala Word Pro"
End Sub`;
  };

  // Apply Sample Sandbox click
  const applySample = (sample: typeof SAMPLE_TEMPLATES[0]) => {
    if (conversionMode === "unicode-to-legacy") {
      setInputText(sample.unicode);
      executeConversion(sample.unicode, "unicode-to-legacy");
    } else {
      setInputText(sample.legacy);
      executeConversion(sample.legacy, "legacy-to-unicode");
    }
    triggerToast(`Applied sample template: "${sample.label}"`);
  };

  // Designer Guide Steps
  const guideSteps = [
    {
      title: "1. Convert & Copy",
      desc: "Type or paste your Sinhala Unicode text in the left input card. The converted legacy font string instantly outputs in the right card. Simply click 'Copy' to store it in your clipboard."
    },
    {
      title: "2. Paste into Graphic Editor",
      desc: "Open your software of choice: Adobe Photoshop, Canva, Illustrator, CapCut, CorelDraw, or Word. Select the Type/Text tool, create a text box, and press paste (Ctrl+V or Cmd+V). The text will initially appear as random Latin letters—which is perfectly normal!"
    },
    {
      title: "3. Choose DL‑Manel / FM-Abaya Font",
      desc: "Highlight the pasted text and open your font selector drop-down list. Choose 'DL-Manel', 'DL-Manel-Gemi', 'Apex-Sinhala', 'FMAbaya' or any standard Wijesekera-mapped Sinhala font. The random letters will instantly render as beautiful, authentic classical Sinhala typography!"
    }
  ];

  if (isWordAddIn) {
    return (
      <div id="word-addin-pane" className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 flex flex-col justify-between selection:bg-blue-600/40 selection:text-white relative overflow-x-hidden">
        {/* Background Mesh */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-950/20 to-slate-950/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Toast Notification for Word Add-in */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              id="word-toast"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="fixed top-4 left-4 right-4 z-50 bg-slate-900/95 border border-cyan-500/30 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 backdrop-blur-xl"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wide">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex-1 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse" />
              <div>
                <h2 className="font-bold text-xs uppercase tracking-widest text-white">Sinhala Word Pro</h2>
                <p className="text-[9px] text-cyan-400 tracking-wider font-mono">DIRECT MS WORD ADD-IN</p>
              </div>
            </div>
            
            <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-400 font-bold">
              v1.0.0
            </span>
          </div>

          {/* Core Configuration Mode Toggle */}
          <div className="flex flex-col gap-2 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">CONVERSION DIRECTION:</span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setConversionMode("unicode-to-legacy")}
                className={`py-2 px-1 rounded-lg text-center font-bold text-[10px] transition-all cursor-pointer ${
                  conversionMode === "unicode-to-legacy" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Unicode ➔ Legacy
              </button>
              <button
                onClick={() => setConversionMode("legacy-to-unicode")}
                className={`py-2 px-1 rounded-lg text-center font-bold text-[10px] transition-all cursor-pointer ${
                  conversionMode === "legacy-to-unicode" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Legacy ➔ Unicode
              </button>
            </div>
          </div>

          {/* Target Font Configuration */}
          {conversionMode === "unicode-to-legacy" && (
            <div className="flex flex-col gap-2 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">WORD TARGET FONT:</span>
                <span className="text-[9px] text-cyan-300 font-mono font-bold">WIJESEKERA MAPPING</span>
              </div>
              <select
                value={targetFontName}
                onChange={(e) => setTargetFontName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
              >
                {LEGACY_FONT_PRESETS.map(preset => (
                  <option key={preset.name} value={preset.name}>{preset.label}</option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400 leading-normal">
                Word will automatically convert and apply the selected font family to the text selection!
              </p>
            </div>
          )}

          {/* Massive Action Button */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleConvertWordSelection}
              disabled={isMacroRunning}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
            >
              {isMacroRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  CONVERTING SELECTION...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  CONVERT WORD SELECTION
                </>
              )}
            </button>
          </div>

          {/* Dynamic instruction box inside word sidebar */}
          <div className="bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/10 flex flex-col gap-2.5">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              භාවිතා කරන්නේ කෙසේද:
            </span>
            <ol className="list-decimal pl-4 text-[10px] text-slate-400 space-y-2 leading-relaxed">
              <li>ඔබගේ Word ලේඛනයේ (Document) ඇති සිංහල අකුරු සිලෙක්ට් (Select) කරන්න.</li>
              <li>ඉහත <strong className="text-white">CONVERT WORD SELECTION</strong> බටන් එක ක්ලික් කරන්න.</li>
              <li>තත්පරයකින් තේරූ ඡේදය සෘජුවම පරිවර්තනය වී, අකුරු මාදිලියද (Font) වෙනස් වී නිවැරදිව දිස්වනු ඇත!</li>
            </ol>
          </div>
        </div>

        {/* Word Taskpane footer */}
        <div className="pt-4 border-t border-white/10 text-center text-[9px] text-slate-500 font-mono tracking-wide">
          CONNECTED TO SINHALA ENGINE LIVE API
        </div>
      </div>
    );
  }

  return (
    <div id="app-root-container" className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-600/40 selection:text-white relative overflow-x-hidden pb-12 flex flex-col">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Decorative Watermark Elements */}
      <div className="absolute top-12 right-12 text-[150px] font-bold text-white/5 pointer-events-none select-none font-serif leading-none">අ</div>
      <div className="absolute bottom-12 left-12 text-[150px] font-bold text-white/5 pointer-events-none select-none font-serif leading-none">ශ්‍රී</div>

      {/* Floating Compliant Toast Alert - Retrofitted for Frosted Glass Theme */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="global-feedback-toast"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 border border-blue-500/30 text-white px-6 py-3.5 rounded-full shadow-2xl shadow-blue-500/10 flex items-center gap-3 backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm font-medium tracking-wide font-sans">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="content-margin-wrapper" className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10 w-full flex-1 flex flex-col">
        
        {/* ================= HEADER SECTION ================= */}
        <header id="main-header" className="text-center mb-8 md:mb-12">
          {/* Top Author & Architecture Verified Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
            {/* Author Profile Chip */}
            <div id="author-verified-chip" className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/80 border border-cyan-500/30 rounded-full shadow-lg backdrop-blur-md">
              <div className="relative">
                <img 
                  src="/owner.png" 
                  alt="Sanchitha Charunya - Lead Architect & Owner" 
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-cyan-400 shadow-md"
                  onError={(e) => {
                    // Fallback to placeholder if needed
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold text-white flex items-center gap-1">
                  Sanchitha Charunya
                  <UserCheck className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="text-[9px] text-cyan-300 font-mono">Lead Architect & Owner</div>
              </div>
            </div>

            {/* Multi-Platform Suite Shortcut Badge */}
            <a 
              href="#multiplatform-download-hub" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-cyan-400/40 rounded-full text-cyan-300 hover:text-white text-[11px] font-medium transition-all shadow-sm group"
            >
              <Laptop className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>SanTyper 5-OS Apps (Win • Mac • Linux • Android • iOS)</span>
              <span className="bg-emerald-400/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">100% Free</span>
            </a>
          </div>

          {/* Logo & Main Title */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition-opacity" />
              <img 
                src="/logo.png" 
                alt="Sinhala Font Converter & SanTyper Logo" 
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-2xl border border-white/20 transform group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 id="app-heading-title" className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
                Sinhala <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-black font-serif">Font</span> Converter
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-cyan-400/90 mt-1">
                <span>SanTyper Suite Pro v1.0</span>
                <span>•</span>
                <span className="text-slate-400">100% Offline Capable</span>
              </div>
            </div>
          </div>

          <p id="app-subtitle" className="mt-3 text-base md:text-lg text-slate-300 font-sans max-w-2xl mx-auto font-light leading-relaxed">
            Type or paste standard <span className="font-medium text-cyan-400">Unicode Sinhala</span> and instantly output its corresponding legacy non-Unicode <span className="font-medium text-blue-300">DL-Manel / FM-Abaya / Apex</span> encoding for flawless formatting.
          </p>

          {/* Mode Slider Widget - Rounded Pill Glass */}
          <div id="mode-selector-toolbar" className="mt-8 flex flex-wrap items-center justify-center gap-4 bg-white/5 border border-white/10 max-w-xl mx-auto p-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
            <button
              id="mode-btn-unicode-to-legacy"
              onClick={() => {
                if (conversionMode !== "unicode-to-legacy") {
                  setConversionMode("unicode-to-legacy");
                  const temp = inputText;
                  setInputText(outputText);
                  setOutputText(temp);
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                conversionMode === "unicode-to-legacy"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/35"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-300" />
              Unicode ➔ Legacy Font
            </button>
            <button
              id="mode-btn-legacy-to-unicode"
              onClick={() => {
                if (conversionMode !== "legacy-to-unicode") {
                  setConversionMode("legacy-to-unicode");
                  const temp = inputText;
                  setInputText(outputText);
                  setOutputText(temp);
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                conversionMode === "legacy-to-unicode"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/35"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-cyan-300" />
              Legacy Font ➔ Unicode
            </button>
          </div>
        </header>

        {/* ================= KEYREP MASTER NAVIGATION TOOLBAR ================= */}
        <KeyRepNavigationBar
          typingMode={typingMode}
          setTypingMode={setTypingMode}
          mappingProfile={mappingProfile}
          setMappingProfile={setMappingProfile}
          conversionMode={conversionMode}
          setConversionMode={setConversionMode}
          inputText={inputText}
          setInputText={setInputText}
          onTriggerToast={triggerToast}
          onOpenCheatsheet={() => setShowCheatSheet(true)}
        />

        {/* ================= MAIN WORKSPACE BENTO GRID ================= */}
        <main id="bento-workspace-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-8 md:mb-12">
          
          {/* SOURCE WORKSPACE INPUT CARD */}
          <div id="source-workspace-card" className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all hover:border-blue-500/30 relative overflow-hidden shadow-2xl">
            {/* Soft decorative background glow flourish */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full pointer-events-none" />

            {/* Header toolbar */}
            <div id="source-card-header" className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <h2 id="source-panel-label" className="font-sans font-bold text-sm text-[11px] uppercase tracking-widest text-blue-300/90 flex items-center gap-1.5">
                  {conversionMode === "unicode-to-legacy" ? "Source Text (Unicode Sinhala)" : "Source Text (Legacy Font Keys)"}
                </h2>
                <span className="ml-2 text-[9px] text-amber-300/80 uppercase font-mono tracking-wider border border-amber-400/20 px-2 py-0.5 rounded bg-amber-400/10">
                  Tip: Wrap English words in [brackets] to skip translation!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="source-btn-clear"
                  onClick={handleClearWorkspace}
                  disabled={!inputText}
                  className={`p-2 rounded-xl transition-all border border-white/10 ${
                    inputText 
                      ? "text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white cursor-pointer" 
                      : "text-slate-600 bg-transparent cursor-not-allowed"
                  }`}
                  title="Clear source text space"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text input area */}
            <div id="source-text-block-wrapper" className="relative flex-1">
              <textarea
                ref={textareaRef}
                id="source-textarea"
                rows={11}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  resetPhoneticState();
                }}
                onKeyDown={handleSourceKeyDown}
                onKeyUp={handleSourceKeyUp}
                onPaste={handlePaste}
                onClick={resetPhoneticState}
                onBlur={resetPhoneticState}
                placeholder={
                   conversionMode === "unicode-to-legacy"
                    ? "උදා: ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය"
                    : "e.g. Y%S ,xld m%cd;dka;%sl iudcjdoS ckrch"
                }
                className="w-full text-slate-100 bg-transparent border-0 outline-0 ring-0 focus:ring-0 text-lg md:text-xl placeholder:text-slate-600 resize-y font-sans leading-relaxed py-2 md:py-3 cursor-text block"
              />
              
              {/* Document Statistics and Tools */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span title="Characters">{inputText.length} chars</span>
                  <span title="Words">{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words</span>
                  <span title="Lines">{inputText ? inputText.split('\n').length : 0} lines</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      let cleaned = inputText
                        .replace(/\s{2,}/g, ' ')
                        .replace(/([.?!])([^\s"'])/g, '$1 $2')
                        .trim();
                      setInputText(cleaned);
                      triggerToast("Cleaned up typography and spacing");
                    }}
                    disabled={!inputText}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Clean up double spaces and fix punctuation spacing"
                  >
                    Auto-Fix
                  </button>
                  <button
                    onClick={() => {
                      setInputText("");
                      setOutputText("");
                      triggerToast("Cleared");
                    }}
                    disabled={!inputText}
                    className="text-xs text-slate-500 hover:text-red-400 font-semibold px-2 py-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Clear Text
                  </button>
                </div>
              </div>
            </div>

            {/* SanTyper / KeyRep Advanced Activator Control Bar */}
            <div className="mt-4 p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    typingMode === "phonetic" 
                      ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" 
                      : typingMode === "wijesekera"
                      ? "bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse"
                      : "bg-slate-600"
                  }`} />
                  <span className="text-[11px] font-bold tracking-wide uppercase font-mono text-white flex items-center gap-1.5">
                    SanTyper Activator
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">KeyRep Pro</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    {typingMode === "phonetic" && "• Singlish Real-time (KeyRep Active)"}
                    {typingMode === "wijesekera" && "• Wijesekera Physical Map"}
                    {typingMode === "standard" && "• Normal / English (Direct)"}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <span className="text-[10px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-lg font-mono flex items-center gap-1" title="Press Ctrl+Space or F12 anywhere to toggle">
                    <kbd className="font-bold text-cyan-400">Ctrl+Space</kbd> or <kbd className="font-bold text-cyan-400">F12</kbd>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setTypingMode("standard");
                    triggerToast("Standard Input Mode - English / Direct text");
                  }}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-semibold justify-center transition-all flex items-center gap-2 cursor-pointer ${
                    typingMode === "standard"
                      ? "bg-slate-700 text-white shadow-md border border-white/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Standard (Off)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTypingMode("phonetic");
                    triggerToast("⚡ KeyRep Singlish Mode Active - Type 'singlish' to get 'සිංහල'!");
                  }}
                  className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold justify-center transition-all flex items-center gap-2 cursor-pointer ${
                    typingMode === "phonetic"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/40"
                      : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/20"
                  }`}
                >
                  <Type className="w-4 h-4 text-emerald-300" />
                  <div className="text-left leading-none">
                    <div>KeyRep Singlish</div>
                    <div className="text-[9px] font-normal opacity-80 mt-0.5">Phonetic IME</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTypingMode("wijesekera");
                    triggerToast("⚡ Wijesekera Layout Active - Hardware key mapping");
                  }}
                  className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold justify-center transition-all flex items-center gap-2 cursor-pointer ${
                    typingMode === "wijesekera"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/40"
                      : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/20"
                  }`}
                >
                  <Keyboard className="w-4 h-4 text-cyan-300" />
                  <div className="text-left leading-none">
                    <div>Wijesekera</div>
                    <div className="text-[9px] font-normal opacity-80 mt-0.5">Physical Map</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Sub-panel for Phonetic (Singlish) Buffer Writer */}
            <AnimatePresence>
              {typingMode === "phonetic" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-slate-950/75 border border-cyan-500/20 rounded-2xl overflow-hidden scale-100"
                >
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                    <span>✍️ Helakuru-Style Singlish Phonetic Mode</span>
                    <span className="text-[9px] text-[#22c55e] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-mono animate-pulse">IME ENGINE ACTIVATION</span>
                  </label>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Type Singlish phonetics directly into the text container above. Your English keystrokes are instantly converted into Sinhala Unicode in real-time!
                  </p>

                  {/* Sub-Tabs switcher inside panel */}
                  <div className="flex border-b border-white/5 mb-3">
                    <button
                      type="button"
                      onClick={() => setPhoneticSubTab("candidates")}
                      className={`pb-2 px-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative ${
                        phoneticSubTab === "candidates" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      🔮 Prediction Feed
                      {phoneticSubTab === "candidates" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneticSubTab("dictionary")}
                      className={`pb-2 px-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative ${
                        phoneticSubTab === "dictionary" ? "text-violet-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      📖 My Words ({customWords.length})
                      {phoneticSubTab === "dictionary" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneticSubTab("cheatsheet")}
                      className={`pb-2 px-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative ${
                        phoneticSubTab === "cheatsheet" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      💡 Singlish Guide
                      {phoneticSubTab === "cheatsheet" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                      )}
                    </button>
                  </div>

                  {phoneticSubTab === "candidates" && (
                    <div className="bg-slate-900 border border-white/5 rounded-xl p-3">
                      <span className="text-[10px] text-slate-500 font-mono block mb-2 uppercase tracking-wide flex items-center justify-between">
                        <span>Smart Candidates Feed</span>
                        {activePhoneticWord ? (
                          <div className="flex items-center gap-1.5 text-[9px] text-[#22c55e]">
                            <span>⚡ HOTKEYS: [SPACE / ENTER] commits candidate #1</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-mono">Press number keys 1-8 to insert suggestion instantly</span>
                        )}
                      </span>
                      {activePhoneticWord ? (
                        <div className="flex flex-wrap items-center gap-1.5 text-slate-100">
                          <div className="flex items-center gap-1.5 bg-cyan-950/45 border border-cyan-500/30 px-2 py-0.5 rounded-lg text-xs shrink-0 mr-1 animate-pulse">
                            <span className="text-[10px] text-slate-400 font-mono">Keys:</span>
                            <span className="text-xs font-bold text-cyan-400 font-mono">{activePhoneticWord}</span>
                          </div>
                          {getSuggestionsWithCustom(activePhoneticWord).map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectPhoneticSuggestion(suggestion)}
                              className="bg-blue-600/20 hover:bg-cyan-500 hover:text-slate-950 text-white border border-blue-500/35 font-semibold px-2.5 py-1 rounded-lg text-sm transition-all duration-150 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-1 font-serif group"
                            >
                              <span className="text-[9px] text-slate-400 group-hover:text-slate-950 font-sans font-mono mr-0.5">#{index + 1}</span>
                              <span className="font-semibold">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic py-1">
                          Type Singlish keys above. Predictions show up here. Use Space or Enter to insert, or try typing: <span className="text-cyan-400 not-italic font-mono">"amma"</span>, <span className="text-cyan-400 not-italic font-mono">"wisthara"</span>, <span className="text-cyan-400 not-italic font-mono">"sthuthi"</span>.
                        </div>
                      )}
                    </div>
                  )}

                  {phoneticSubTab === "dictionary" && (
                    <div className="space-y-3">
                      <div className="bg-slate-900 border border-white/5 rounded-xl p-3">
                        <span className="text-[10px] text-slate-500 font-mono block mb-2 uppercase tracking-wide">
                          ✍️ Teach Custom Words & Shortcuts
                        </span>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Singlish (e.g. sl)"
                            value={newCustomSinglish}
                            onChange={(e) => setNewCustomSinglish(e.target.value)}
                            className="flex-1 bg-slate-1050/85 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400"
                          />
                          <input
                            type="text"
                            placeholder="Sinhala (e.g. ශ්‍රී ලංකාව)"
                            value={newCustomSinhala}
                            onChange={(e) => setNewCustomSinhala(e.target.value)}
                            className="flex-1 bg-slate-150/85 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400 font-serif"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newCustomSinglish && newCustomSinhala) {
                                handleAddCustomWord(newCustomSinglish, newCustomSinhala);
                                setNewCustomSinglish("");
                                setNewCustomSinhala("");
                                triggerToast("Abbreviation rule saved!");
                              } else {
                                triggerToast("Please enter both Singlish abbreviation and Sinhala value.");
                              }
                            }}
                            className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Teach IME
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          💡 Custom learned phrases take high priority in suggestions, meaning faster, personalized conversions!
                        </p>
                      </div>

                      {customWords.length > 0 ? (
                        <div className="max-h-36 overflow-y-auto bg-slate-900/60 border border-white/5 rounded-xl p-2.5 space-y-1.5">
                          <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wide mb-1">
                            Learned Word Map Rules:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {customWords.map((word) => (
                              <div
                                key={word.singlish}
                                className="flex items-center justify-between bg-slate-950/50 hover:bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-slate-500 font-mono bg-white/5 px-1 rounded">
                                    {word.singlish}
                                  </span>
                                  <span className="text-slate-400">➔</span>
                                  <span className="font-semibold text-violet-300 font-serif">{word.sinhala}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomWord(word.singlish)}
                                  className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                                  title="Delete rule"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-slate-600 text-xs italic">
                          No custom learned words in user dictionary.
                        </div>
                      )}
                    </div>
                  )}

                  {phoneticSubTab === "cheatsheet" && (
                    <div className="bg-slate-900 border border-white/5 rounded-xl p-3.5 space-y-3 max-h-56 overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[10px] text-amber-500 font-bold font-mono tracking-wide uppercase">
                          💡 Joint Consonant & Vowel Rules Cheat Sheet
                        </span>
                        <span className="text-[9px] text-slate-500">Tap to insert helper elements</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-slate-400">🔥 Joint Modifier Modulators</h4>
                          <div className="space-y-1 bg-slate-950/40 p-2 rounded-lg font-mono text-[11px]">
                            <div className="flex justify-between items-center text-slate-300 border-b border-white/5 pb-1">
                              <span>Yansaya (්‍ය):</span>
                              <button
                                type="button"
                                onClick={() => handleInsertCharacter("්‍ය")}
                                className="text-amber-400 hover:underline"
                              >
                                consonant + y (e.g. ky ➔ ක්‍ර)
                              </button>
                            </div>
                            <div className="flex justify-between items-center text-slate-300 border-b border-white/5 pb-1 pt-0.5">
                              <span>Rakaransaya (්‍ර):</span>
                              <button
                                type="button"
                                onClick={() => handleInsertCharacter("්‍ර")}
                                className="text-amber-400 hover:underline"
                              >
                                consonant + r (e.g. kr ➔ ක්‍ර)
                              </button>
                            </div>
                            <div className="flex justify-between items-center text-slate-300 pt-0.5">
                              <span>Gayanukittha (ෘ):</span>
                              <button
                                type="button"
                                onClick={() => handleInsertCharacter("ෘ")}
                                className="text-amber-400 hover:underline"
                              >
                                consonant + R (e.g. kR ➔ කෘ)
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-bold text-slate-400">✨ Common Pronounced Vowel Keys</h4>
                          <div className="grid grid-cols-2 gap-1 font-mono text-[10px] bg-slate-950/40 p-2 rounded-lg">
                            <span className="text-slate-450 text-[9px]">a ➔ අ / (none)</span>
                            <span className="text-slate-450 text-[9px]">aa ➔ ආ / ා</span>
                            <span className="text-slate-450 text-[9px]">ae ➔ ඇ / ැ</span>
                            <span className="text-slate-450 text-[9px]">aae ➔ ඈ / ෑ</span>
                            <span className="text-slate-450 text-[9px]">i ➔ ඉ / ි</span>
                            <span className="text-slate-450 text-[9px]">ii ➔ ඊ / ී</span>
                            <span className="text-slate-450 text-[9px]">u ➔ උ / ු</span>
                            <span className="text-slate-450 text-[9px]">uu ➔ ඌ / ූ</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1.5 text-[10px] text-slate-500">
                        🔑 <strong>Multi-Key Tip:</strong> Type capital letters for heavy/aspirated sounds, e.g., <span className="text-amber-500/90 font-mono">D ➔ ධ</span>, <span className="text-amber-500/90 font-mono">S ➔ ශ</span>, <span className="text-amber-500/90 font-mono">Th ➔ ථ</span>.
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sub-panel for Wijesekera Mode notification */}
            <AnimatePresence>
              {typingMode === "wijesekera" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 bg-blue-950/20 border border-blue-500/20 rounded-2xl text-[11px] text-slate-300 flex gap-2"
                >
                  <Keyboard className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <strong>Wijesekera keystroke mapping is active!</strong> Type on your physical keyboard inside the box above. It automatically remaps your keystrokes. Or click visual keycaps on the <strong>On-Screen mechanical keyboard</strong>.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer panel stats */}
            <div id="source-card-footer" className="flex items-center justify-between pt-4 border-t border-white/10 text-slate-400 mt-4">
              <div id="source-stats" className="font-mono text-[10px] flex items-center gap-4">
                <span className="flex items-center gap-1">
                  CHARACTER: <strong className="font-semibold text-blue-400">{inputCharCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  WORDS: <strong className="font-semibold text-blue-400">{inputWordCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {conversionMode === "unicode-to-legacy" && inputText && (
                  <button
                    onClick={handleSanitizeInput}
                    className="p-1.5 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/35 rounded-lg text-[10px] leading-none flex items-center gap-1.5 font-mono tracking-wider text-cyan-300 transition-colors cursor-pointer"
                    title="Scan and Auto-Fix common double-modifier typing bugs in your Sinhala Unicode text"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    FIX TYPOS
                  </button>
                )}
                <button
                  id="source-btn-mode-info"
                  onClick={() => triggerToast("Continuous real-time translation is active.")}
                  className="p-1.5 px-3 bg-blue-500/10 border border-blue-500/25 rounded-lg text-[10px] leading-none flex items-center gap-1.5 font-mono tracking-wider text-blue-300 transition-colors hover:bg-white/5"
                >
                  <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" />
                  LIVE
                </button>
              </div>
            </div>
          </div>

          {/* TARGET WORKSPACE OUTPUT CARD */}
          <div id="target-workspace-card" className="backdrop-blur-2xl bg-blue-500/5 border border-blue-400/20 rounded-3xl p-6 flex flex-col justify-between transition-all hover:border-blue-400/30 relative overflow-hidden shadow-2xl shadow-blue-950/20">
            
            {/* Flow line accent indicating link */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full pointer-events-none" />

            {/* Header toolbar */}
            <div id="target-card-header" className="flex flex-col gap-4 pb-4 border-b border-blue-400/20 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse" />
                  <h2 id="target-panel-label" className="font-sans font-bold text-xs uppercase tracking-widest text-cyan-300/95 flex items-center gap-1.5">
                    {conversionMode === "unicode-to-legacy" ? `Output Result (${targetFontName})` : "Output Result (Sinhala Unicode)"}
                  </h2>
                </div>
                
                {/* View toggles & Settings */}
                <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setOutputViewMode("raw")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      outputViewMode === "raw" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Raw Text
                  </button>
                  <button
                    onClick={() => setOutputViewMode("visual")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      outputViewMode === "visual" ? "bg-slate-700 text-cyan-300 shadow-sm" : "text-slate-400 hover:text-cyan-300"
                    }`}
                  >
                    Visual Preview
                  </button>
                  
                  {conversionMode === "unicode-to-legacy" && (
                    <button
                      onClick={() => setShowFontSettings(!showFontSettings)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        showFontSettings ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-cyan-300"
                      }`}
                      title="Fine-tune Word font names, layouts, sizes and alignment"
                    >
                      <Palette className="w-4 h-4" />
                    </button>
                  )}

                  {conversionMode === "unicode-to-legacy" && (
                    <button
                      onClick={() => setShowLearningStudio(!showLearningStudio)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        showLearningStudio ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-cyan-300"
                      }`}
                      title="Adaptive Font Calibration Studio & Correction Mapping Lab"
                    >
                      <Sliders className="w-4 h-4" />
                      {(fontOverrides[targetFontName] || []).length > 0 && (
                        <span className="bg-cyan-500 text-slate-950 text-[9px] font-black rounded-full px-1 min-w-[14px] flex items-center justify-center text-center">
                          {(fontOverrides[targetFontName] || []).length}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Subheader action row: Font selectors and DOCX downloads */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {conversionMode === "unicode-to-legacy" ? (
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Word Font:</span>
                      <select
                        value={targetFontName}
                        onChange={(e) => setTargetFontName(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                      >
                        {LEGACY_FONT_PRESETS.map(preset => (
                          <option key={preset.name} value={preset.name}>{preset.label}</option>
                        ))}
                        {!LEGACY_FONT_PRESETS.find(p => p.name === targetFontName) && (
                          <option value={targetFontName}>{targetFontName} (Uploaded)</option>
                        )}
                      </select>
                    </div>
                    
                    <input
                      type="file"
                      accept=".ttf,.otf"
                      ref={fileInputRef}
                      onChange={handleFontUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1 px-2.5 rounded-lg transition-all border border-white/10 flex items-center gap-1 text-[10px] font-semibold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white cursor-pointer"
                      title="Upload custom .ttf/.otf file to auto-detect layout & render visual preview"
                    >
                      <Upload className="w-3 h-3" />
                      {customFont ? `Re-upload (${customFont.name})` : "Import TTF/OTF"}
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    Outputs clean, standard web-friendly Sinhala Unicode.
                  </div>
                )}

                <button
                  id="target-btn-export-text"
                  onClick={handleDownloadWord}
                  disabled={!outputText}
                  className={`px-3 py-1.5 rounded-xl transition-all border flex items-center gap-1.5 text-xs font-bold tracking-wide shadow-lg ${
                    outputText 
                      ? "border-blue-500/50 bg-blue-600/20 text-blue-100 hover:bg-blue-500 hover:text-white cursor-pointer" 
                      : "border-white/5 text-slate-600 bg-transparent cursor-not-allowed"
                  }`}
                  title="Download as True MS Word (.docx) file with smart font handling"
                >
                  <FileDown className="w-4 h-4" />
                  Smart Export .docx
                </button>
              </div>
            </div>

            {/* Expanded Typography & Layout Customizer panel */}
            <AnimatePresence>
              {showFontSettings && conversionMode === "unicode-to-legacy" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 rounded-2xl bg-slate-900/85 border border-cyan-500/20 text-slate-300 text-xs flex flex-col gap-3 shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-bold text-cyan-400 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" />
                      TYPOGRAPHY & PREVIEW ADJUSTMENTS
                    </span>
                    <button
                      onClick={() => setShowFontSettings(false)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  
                  {/* Slider controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400">
                        <span>FONT SIZE:</span>
                        <span className="text-cyan-400 font-bold">{visualFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="14"
                        max="60"
                        value={visualFontSize}
                        onChange={(e) => setVisualFontSize(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400">
                        <span>LINE HEIGHT:</span>
                        <span className="text-cyan-400 font-bold">{visualLineHeight}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.1"
                        value={visualLineHeight}
                        onChange={(e) => setVisualLineHeight(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400">
                        <span>LETTER SPACING:</span>
                        <span className="text-cyan-400 font-bold">{visualLetterSpacing}px</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="8"
                        step="1"
                        value={visualLetterSpacing}
                        onChange={(e) => setVisualLetterSpacing(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[10px] text-slate-400">ALIGNMENT:</span>
                      <div className="flex bg-slate-950 p-1 rounded-lg border border-white/5 self-start">
                        {(["left", "center", "right", "justify"] as const).map(align => (
                          <button
                            key={align}
                            onClick={() => setVisualAlignment(align)}
                            className={`px-2.5 py-1 rounded capitalize text-[10px] font-bold cursor-pointer transition-all ${
                              visualAlignment === align ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Theme controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">CANVAS THEME:</span>
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-white/5">
                        {[
                          { id: "slate", bg: "bg-slate-950 border-slate-700", text: "Slate" },
                          { id: "charcoal", bg: "bg-neutral-900 border-neutral-700", text: "Dark" },
                          { id: "white", bg: "bg-white border-slate-200", text: "Paper" },
                          { id: "ivory", bg: "bg-amber-50 border-amber-200", text: "Ivory" },
                          { id: "royal", bg: "bg-blue-950 border-blue-800", text: "Royal" }
                        ].map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => setVisualBgTheme(theme.id)}
                            className={`w-4 h-4 rounded-full ${theme.bg} border relative transition-all hover:scale-110 cursor-pointer flex items-center justify-center`}
                            title={theme.text}
                          >
                            {visualBgTheme === theme.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Display exact custom family configuration */}
                    <div className="font-mono text-[10px] text-cyan-300/80 bg-cyan-500/5 px-2 py-1 rounded border border-cyan-500/10">
                      Export Family name: <span className="font-bold text-white">"{targetFontName}"</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Output content area */}
            <div id="output-text-block-wrapper" className="relative flex-1">
              {outputViewMode === "raw" ? (
                <textarea
                  id="target-textarea"
                  rows={11}
                  value={editedOutputText}
                  onChange={(e) => {
                    setEditedOutputText(e.target.value);
                    setOutputText(e.target.value);
                  }}
                  placeholder={
                    conversionMode === "unicode-to-legacy"
                      ? "Legacy text output formatted for DL-Manel font will instantly load here..."
                      : "Sinhala Unicode clear text output will instantly load here..."
                  }
                  className="w-full h-full text-blue-100 bg-transparent border-0 outline-0 ring-0 focus:ring-0 text-lg md:text-xl placeholder:text-blue-200/25 resize-none font-sans leading-relaxed py-2 md:py-3 cursor-text selection:bg-blue-600 selection:text-white"
                />
              ) : (
                <div 
                  className={`w-full h-full overflow-y-auto rounded-2xl p-4 transition-all ${
                    visualBgTheme === "charcoal" ? "bg-neutral-900/90 text-neutral-100 border border-neutral-800" :
                    visualBgTheme === "white" ? "bg-white text-slate-900 border border-slate-200 shadow-inner" :
                    visualBgTheme === "ivory" ? "bg-amber-50 text-amber-950 border border-amber-200 shadow-inner" :
                    visualBgTheme === "royal" ? "bg-blue-950/70 text-blue-100 border border-blue-900 shadow-inner" :
                    "bg-slate-950/40 text-blue-100 border border-white/5"
                  }`}
                  style={{ 
                    minHeight: "260px",
                    fontSize: `${visualFontSize}px`,
                    lineHeight: visualLineHeight,
                    letterSpacing: `${visualLetterSpacing}px`,
                    textAlign: visualAlignment
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: getRichTextHTML(inputText, conversionMode, targetFontName, getMergedOverrides(targetFontName), mappingProfile) || 
                    `<span class="text-slate-400/60">Rich visual preview will appear here.<br/><br/>English words are automatically kept in standard fonts while Sinhala parts get the applied legacy font.</span>` 
                  }}
                />
              )}
            </div>

            {/* Manual Correction Detected Alert Banner */}
            {conversionMode === "unicode-to-legacy" && editedOutputText !== lastConvertedText && (
              <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-200 text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-lg">
                <div className="flex gap-2.5 items-start">
                  <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 animate-pulse" />
                  <div>
                    <p className="font-bold text-amber-300">අතින් කළ වෙනස්කම් හඳුනාගන්නා ලදී (Manual Corrections Detected)</p>
                    <p className="text-[11px] text-amber-400/80 mt-0.5">
                      You modified the converted text. Would you like to train the engine and save this mapping rule for font <strong className="text-white">"{targetFontName}"</strong> so it converts perfectly next time?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end self-end md:self-auto shrink-0">
                  <button
                    onClick={() => {
                      setShowLearningStudio(true);
                      triggerToast("Use the Adaptive Calibration Studio below to register your rules!");
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-[11px] flex items-center gap-1 shadow"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Open Calibration Studio
                  </button>
                  <button
                    onClick={() => {
                      setEditedOutputText(lastConvertedText);
                      setOutputText(lastConvertedText);
                      triggerToast("Reverted to automatic conversion.");
                    }}
                    className="text-amber-400 hover:text-white font-semibold px-2.5 py-1.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer text-[11px]"
                  >
                    Revert
                  </button>
                </div>
              </div>
            )}

            {/* Adaptive Font Calibration Studio Panel */}
            <AnimatePresence>
              {showLearningStudio && conversionMode === "unicode-to-legacy" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-2xl bg-slate-900/85 border border-cyan-500/20 text-slate-300 text-xs flex flex-col gap-4 shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="font-bold text-cyan-400 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      ADAPTIVE FONT CALIBRATION STUDIO (අනුවර්තී අකුරු ඉගෙනුම් මැදිරිය)
                    </span>
                    <button
                      onClick={() => setShowLearningStudio(false)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer font-bold text-[11px]"
                    >
                      Close
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Different Sinhala legacy fonts use slightly unique symbol maps. 
                    Use this calibration studio to teach the engine custom translation rules for the selected font <strong className="text-white">"{targetFontName}"</strong>. 
                    Once taught, the system gains experience and applies your rules instantly to all future conversions.
                  </p>

                  {/* Mapping Profile Selector & Auto-Detection Status */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">FONT FAMILY PROFILE / ෆොන්ට් සිතියම්කරණ මාදිලිය:</span>
                      <p className="text-[9px] text-slate-500">Different families require custom keyboard/glyph overrides.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-white/5">
                        <button
                          onClick={() => {
                            setMappingProfile("DL_SERIES");
                            localStorage.setItem("sinhala_mapping_profile", "DL_SERIES");
                            triggerToast("Manually set DL-Manel / DL series profile!");
                          }}
                          className={`py-1 px-3 rounded text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                            mappingProfile === "DL_SERIES"
                              ? "bg-blue-600/25 text-blue-200 border border-blue-500/20"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          DL Series (DL-Manel)
                        </button>
                        <button
                          onClick={() => {
                            setMappingProfile("FM_SERIES");
                            localStorage.setItem("sinhala_mapping_profile", "FM_SERIES");
                            triggerToast("Manually set FM-Abaya / FM series profile!");
                          }}
                          className={`py-1 px-3 rounded text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                            mappingProfile === "FM_SERIES"
                              ? "bg-cyan-600/25 text-cyan-200 border border-cyan-500/20"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          FM Series (FM-Abaya)
                        </button>
                      </div>
                      <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded font-semibold whitespace-nowrap animate-pulse">
                        ⚡ Smart Auto-Detected
                      </span>
                    </div>
                  </div>

                  {/* Interactive experience suggestions learned from edited output */}
                  {getAutoLearntSuggestions().length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/35 p-3.5 rounded-xl text-emerald-200 text-xs flex flex-col gap-2.5 shadow-lg shadow-emerald-500/5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-bold text-emerald-300">💡 REAL-TIME EXPERIENCE LEARNED! (ස්වයංක්‍රීයව හඳුනාගත් රීති)</span>
                          <p className="text-[10px] text-emerald-400/80 mt-0.5">We analyzed your manual edits. Click below to teach these rules to the font <strong>"{targetFontName}"</strong> permanently!</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {getAutoLearntSuggestions().map((sug, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-950/65 px-3 py-2 rounded-lg border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="font-sans text-[11px] text-white bg-slate-900 px-1.5 py-0.5 rounded border border-white/5 whitespace-nowrap">
                                {sug.unicode}
                              </span>
                              <span className="text-slate-500 text-[10px]">➔</span>
                              <span className="font-mono text-[11px] text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-500/5 truncate">
                                {sug.corrected}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const currentOverrides = fontOverrides[targetFontName] || [];
                                const filtered = currentOverrides.filter(r => r.find !== sug.unicode);
                                const updatedRules = [...filtered, { find: sug.unicode, replace: sug.corrected }];
                                
                                const updatedAll = {
                                  ...fontOverrides,
                                  [targetFontName]: updatedRules
                                };
                                setFontOverrides(updatedAll);
                                localStorage.setItem("sinhala_font_overrides", JSON.stringify(updatedAll));
                                triggerToast(`Saved experience: '${sug.unicode}' ➔ '${sug.corrected}'`);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[10px] transition-all cursor-pointer shadow flex items-center gap-1 whitespace-nowrap"
                            >
                              Save Experience
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    {/* Left side: Teach Custom Rule Form */}
                    <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 space-y-3.5">
                      <h4 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Teach New Rule (නව රීතියක් ඇතුලත් කරන්න)
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 block">UNICODE SINHALA (යුනිකෝඩ්):</label>
                          <input
                            type="text"
                            placeholder="e.g. ශ්‍රී"
                            value={learningUnicode}
                            onChange={(e) => setLearningUnicode(e.target.value)}
                            className="w-full bg-slate-900/95 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 block">LEGACY FONT KEYS (ලෙගසි):</label>
                          <input
                            type="text"
                            placeholder="e.g. Y%S"
                            value={learningLegacy}
                            onChange={(e) => setLearningLegacy(e.target.value)}
                            className="w-full bg-slate-900/95 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!learningUnicode.trim() || !learningLegacy.trim()) {
                            triggerToast("කරුණාකර යුනිකෝඩ් සහ ලෙගසි අගයන් දෙකම ඇතුලත් කරන්න.");
                            return;
                          }
                          const currentOverrides = fontOverrides[targetFontName] || [];
                          // Avoid duplicates
                          const filtered = currentOverrides.filter(r => r.find !== learningUnicode);
                          const updatedRules = [...filtered, { find: learningUnicode.trim(), replace: learningLegacy.trim() }];
                          
                          const updatedAll = {
                            ...fontOverrides,
                            [targetFontName]: updatedRules
                          };
                          setFontOverrides(updatedAll);
                          localStorage.setItem("sinhala_font_overrides", JSON.stringify(updatedAll));
                          
                          setLearningUnicode("");
                          setLearningLegacy("");
                          triggerToast(`Successfully trained Rule: '${learningUnicode}' ➔ '${learningLegacy}' for font '${targetFontName}'!`);
                        }}
                        className="w-full py-1.5 rounded-lg text-slate-950 font-bold bg-cyan-400 hover:bg-cyan-300 transition-colors text-[11px] cursor-pointer shadow-lg shadow-cyan-500/10"
                      >
                        Teach & Apply Rule (නීතිය පුහුණු කරන්න)
                      </button>
                    </div>

                    {/* Right side: Active Font Experience & Rules */}
                    <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 flex flex-col h-[180px]">
                      <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider pb-2 border-b border-white/5 shrink-0 flex items-center justify-between">
                        <span>Active Experience for "{targetFontName}"</span>
                        <span className="font-mono text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/15">
                          {(fontOverrides[targetFontName] || []).length} Rules Taught
                        </span>
                      </h4>

                      <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1.5">
                        {(!fontOverrides[targetFontName] || fontOverrides[targetFontName].length === 0) ? (
                          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-[10px] px-2 space-y-1 py-4">
                            <Sliders className="w-5 h-5 text-slate-600" />
                            <p>No custom overrides learned yet.</p>
                            <p className="text-[9px] opacity-75">Use the left panel or manually edit raw output to teach new mappings!</p>
                          </div>
                        ) : (
                          fontOverrides[targetFontName].map((rule, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                              <div className="flex items-center gap-1.5">
                                <span className="font-sans text-[11px] text-white bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 font-semibold">
                                  {rule.find}
                                </span>
                                <span className="text-slate-500">➔</span>
                                <span className="font-mono text-[11px] text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-cyan-500/5">
                                  {rule.replace}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  const updatedRules = fontOverrides[targetFontName].filter((_, i) => i !== idx);
                                  const updatedAll = {
                                    ...fontOverrides,
                                    [targetFontName]: updatedRules
                                  };
                                  setFontOverrides(updatedAll);
                                  localStorage.setItem("sinhala_font_overrides", JSON.stringify(updatedAll));
                                  triggerToast("Rule deleted.");
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500/5 cursor-pointer"
                                title="Delete this mapping rule"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MS Word Paste Troubleshooting Guide */}
            {conversionMode === "unicode-to-legacy" && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <details className="group bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                  <summary className="flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:text-white cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>MS Word & Graphic Design Paste Guide</span>
                    </div>
                    <ChevronDown className="w-4.5 h-4.5 text-slate-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  
                  <div className="p-4 pt-0 text-[11px] text-slate-400 leading-relaxed space-y-3.5 border-t border-white/5 bg-slate-950/25">
                    <p>
                      Because legacy Sinhala fonts (like <strong className="text-slate-300">DL-Manel Layout</strong> and <strong className="text-slate-300">FMAbhaya</strong>) use standard ASCII symbols under the hood, copying and pasting them into Word, Photoshop, or Canva might initially show English gibberish. Follow these steps for perfect mapping:
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">How to Paste Successfully:</h4>
                      <ol className="list-decimal pl-4 space-y-1.5">
                        <li>
                          Choose your exact Font Family from the <strong className="text-cyan-400">Word Font</strong> dropdown above (or upload your file). This matches the embedded family name.
                        </li>
                        <li>
                          Click the <strong className="text-white">COPY</strong> button below. This copies high-fidelity HTML containing the font embedding.
                        </li>
                        <li>
                          Open MS Word, and paste (<kbd className="bg-white/10 px-1 py-0.5 rounded text-[10px]">Ctrl+V</kbd> or <kbd className="bg-white/10 px-1 py-0.5 rounded text-[10px]">Cmd+V</kbd>).
                        </li>
                        <li>
                          <strong className="text-cyan-400">If it displays English:</strong> Select the pasted text in Word, open Word's Font dropdown list, and manually select your installed font (e.g., <code className="bg-white/15 px-1 rounded text-slate-200">DL-Manel-Layout</code> or <code className="bg-white/15 px-1 rounded text-slate-200">FMAbhaya</code>). It will instantly pop into gorgeous Sinhala!
                        </li>
                      </ol>
                    </div>

                    <div className="bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/15 space-y-1">
                      <p className="font-bold text-cyan-300 text-[10px] uppercase tracking-wide">💡 Pro-Tip for Flawless Layouts</p>
                      <p>
                        Our conversion automatically preserves English words, numbers, and punctuation in clean <strong className="text-slate-300">Arial</strong> so they don't get scrambled into legacy symbols!
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Footer panel controls */}
            <div id="target-card-footer" className="flex items-center justify-between pt-4 border-t border-blue-400/20 text-slate-400 mt-4">
              <div id="target-stats" className="font-mono text-[10px] flex items-center gap-4">
                <span className="flex items-center gap-1">
                  CHARACTER: <strong className="font-semibold text-cyan-400">{outputCharCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  WORDS: <strong className="font-semibold text-cyan-400">{outputWordCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="target-btn-copy"
                  onClick={handleCopyToClipboard}
                  disabled={!outputText}
                  className={`flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold tracking-wider text-xs uppercase shadow-sm transition-all ${
                    outputText 
                      ? "bg-blue-600 text-white hover:bg-blue-500 cursor-pointer hover:shadow-lg hover:shadow-blue-600/20 active:scale-95" 
                      : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {copiedState === "success" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-300" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-300" />
                      COPY
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Developer & Designer Suite for Advanced Sinhala Utilities */}
        <Suspense fallback={null}>
          <DeveloperDesignerSuite
            targetFontName={targetFontName}
            mappingProfile={mappingProfile}
            setTargetFontName={setTargetFontName}
            conversionMode={conversionMode}
            inputText={inputText}
            setInputText={setInputText}
            outputText={outputText}
            setOutputText={setOutputText}
            triggerToast={triggerToast}
            getMergedOverrides={getMergedOverrides}
          />
        </Suspense>

        {/* ================= UNIVERSAL MULTI-PLATFORM (5 OS) SANTYPER OFFLINE DOWNLOAD HUB ================= */}
        <section id="multiplatform-download-hub" className="mb-8 md:mb-12">
          <div id="windows-desktop-download-hub" className="backdrop-blur-3xl bg-slate-950/80 border border-blue-500/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden shadow-blue-950/20">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header with Creator Identity */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/30 rounded-full text-cyan-300 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  100% OFFLINE MULTI-PLATFORM SUITE (5 OPERATING SYSTEMS)
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <span>SanTyper Pro Universal Multi-OS Suite</span>
                  <span className="text-xs font-mono font-normal bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">v1.0.0 Release</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  අන්තර්ජාලය රහිතව සම්පූර්ණයෙන්ම <strong className="text-cyan-400">100% Offline</strong> ක්‍රියාත්මක වන SanTyper Converter & KeyRep Typing Helper මෘදුකාංගය <strong className="text-white">Windows, macOS, Linux, Android සහ iOS (Apple)</strong> යන සියලුම Platforms සඳහාම නොමිලේ බාගත කරගන්න.
                </p>
              </div>

              {/* Verified Author Card with Logo */}
              <div className="flex items-center gap-3.5 p-3 bg-white/5 border border-white/10 rounded-2xl shrink-0 backdrop-blur-md">
                <div className="relative">
                  <img 
                    src="/owner.png" 
                    alt="Sanchitha Charunya - Owner & Lead Architect" 
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-cyan-400/80 shadow-md"
                  />
                  <div className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 p-0.5 rounded-full ring-2 ring-slate-900">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Sanchitha Charunya
                    <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-mono">Owner</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Lead Architect & Developer</div>
                  <div className="text-[9px] text-cyan-400 mt-0.5 font-sans">© 2026 All Rights Reserved</div>
                </div>
              </div>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 mt-6 mb-4">
              {[
                { id: "all", label: "All Platforms (5 OS)", icon: Monitor },
                { id: "windows", label: "Windows (.EXE)", icon: Laptop },
                { id: "macos", label: "macOS (Apple Mac)", icon: Apple },
                { id: "linux", label: "Linux (Desktop)", icon: Terminal },
                { id: "android", label: "Android (.APK)", icon: Smartphone },
                { id: "ios", label: "iOS (iPhone / iPad)", icon: Smartphone },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedOsTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedOsTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 font-bold"
                        : "bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Platform Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
              {/* PLATFORM 1: WINDOWS (Setup Installer - Integrated Dual Suite) */}
              {(selectedOsTab === "all" || selectedOsTab === "windows") && (
                <div className="bg-gradient-to-b from-blue-950/40 to-slate-900/60 border border-cyan-500/40 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-400/70 transition-all shadow-xl group relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-cyan-400/20 text-cyan-300 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono border border-cyan-400/30">
                    Dual Suite Installer
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Laptop className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">SanTyper Windows Suite (Inbuilt Dual Tools)</h3>
                    <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
                      1 Unified Windows Installer that integrates <strong>both</strong> software tools. Automatically installs <strong>2 separate Desktop shortcuts</strong>:
                    </p>
                    <div className="space-y-2 text-xs text-slate-300 mb-5 font-sans bg-slate-950/50 p-3 rounded-xl border border-white/5">
                      <div className="flex items-start gap-2 text-cyan-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">1. SanTyper Converter (Shortcut 1):</strong>
                          <span className="text-slate-300 block text-[11px]">Full Unicode ⇄ DL-Manel / FM-Abaya document converter, Word docx export, live font preview.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-emerald-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">2. SanTyper KeyHelper (Shortcut 2):</strong>
                          <span className="text-slate-300 block text-[11px]">KeyRep-style live floating helper bar with Sinhala Voice Typing. Floats over MS Word, Photoshop, Illustrator, Premiere, CorelDRAW & any software.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-cyan-300 pt-1 border-t border-white/5 text-[11px] font-mono">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Auto-Installs 2 Desktop & Start Menu Icons</span>
                      </div>
                    </div>
                  </div>

                  <a 
                    href="/download/SanTyper_Setup.exe"
                    download="SanTyper_Setup_v1.0.exe"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer text-center"
                  >
                    <Download className="w-4 h-4" />
                    Download Windows Setup (.EXE - 941 KB)
                  </a>
                </div>
              )}

              {/* PLATFORM 1B: WINDOWS PORTABLE */}
              {(selectedOsTab === "all" || selectedOsTab === "windows") && (
                <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-400/60 transition-all shadow-xl group relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-purple-400/20 text-purple-300 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono border border-purple-400/30">
                    Portable Dual Suite
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <HardDrive className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">SanTyper Windows Portable Suite</h3>
                    <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
                      Standalone zero-install portable package containing <strong>both Inbuilt Tools</strong> (SanTyper Converter + KeyHelper floating bar). Ideal for USB drives and PCs without admin rights.
                    </p>
                    <div className="space-y-2 text-xs text-slate-300 mb-5 font-sans bg-slate-950/50 p-3 rounded-xl border border-white/5">
                      <div className="flex items-start gap-2 text-purple-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Both Inbuilt Tools in 1 File:</strong>
                          <span className="text-slate-300 block text-[11px]">Run SanTyper Converter and SanTyper KeyHelper instantly with zero installation.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-purple-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">100% Offline & Portable:</strong>
                          <span className="text-slate-300 block text-[11px]">Plug and play from any USB drive or cyber cafe machine without administrator privileges.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <a 
                      href="/download/SanTyper_Portable.exe"
                      download="SanTyper_Portable_v1.0.exe"
                      className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer text-center"
                    >
                      <Download className="w-4 h-4" />
                      Download Portable (.EXE - 918 KB)
                    </a>
                    <a 
                      href="/download/SanTyper_Offline_Suite.zip"
                      download="SanTyper_Offline_Suite.zip"
                      className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-[11px] rounded-lg flex items-center justify-center gap-1.5 border border-white/10 transition-colors text-center"
                    >
                      <span>Download Offline ZIP Suite (1.5 MB)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* PLATFORM 2: MACOS (Apple Mac Suite) */}
              {(selectedOsTab === "all" || selectedOsTab === "macos") && (
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl group relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/10 text-white text-[9px] font-bold rounded-full uppercase tracking-wider font-mono">
                    macOS Edition
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Apple className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">SanTyper macOS Suite (.APP)</h3>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Native macOS Application Bundle (SanTyper.app) with double-clickable launcher and Microsoft Word for Mac integration macros.
                    </p>
                    <div className="space-y-1 text-[11px] text-slate-300 mb-4 font-mono">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Apple Silicon (M1/M2/M3/M4) & Intel
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Standalone SanTyper.app bundle
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline KeyRep Helper
                      </div>
                    </div>
                  </div>

                  <a 
                    href="/download/SanTyper_macOS_Suite.zip"
                    download="SanTyper_macOS_Suite_v1.0.zip"
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-white/10 shadow transition-all cursor-pointer text-center"
                  >
                    <Download className="w-4 h-4 text-slate-200" />
                    Download macOS Suite (.ZIP)
                  </a>
                </div>
              )}

              {/* PLATFORM 3: LINUX SUITE */}
              {(selectedOsTab === "all" || selectedOsTab === "linux") && (
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl group relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded-full uppercase tracking-wider font-mono">
                    Linux Edition
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Terminal className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">SanTyper Linux Suite</h3>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Complete Linux bundle with santyper.sh launcher, santyper.desktop application menu entry, and automatic 1-command installer script.
                    </p>
                    <div className="space-y-1 text-[11px] text-slate-300 mb-4 font-mono">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Ubuntu / Debian / Fedora / Arch
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Desktop Menu Launcher & Icon
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Full Offline Converter & IME
                      </div>
                    </div>
                  </div>

                  <a 
                    href="/download/SanTyper_Linux_Suite.tar.gz"
                    download="SanTyper_Linux_Suite_v1.0.tar.gz"
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-white/10 shadow transition-all cursor-pointer text-center"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    Download Linux Suite (.TAR.GZ)
                  </a>
                </div>
              )}

              {/* PLATFORM 4: ANDROID (.APK & PWA) */}
              {(selectedOsTab === "all" || selectedOsTab === "android") && (
                <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-400/60 transition-all shadow-xl group relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-full uppercase tracking-wider font-mono">
                    Android APK
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">SanTyper Android (.APK)</h3>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Android Package file with offline mobile conversion and KeyRep typing pad. Download and install directly or add via Chrome menu.
                    </p>
                    <div className="space-y-1 text-[11px] text-slate-300 mb-4 font-mono">
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Direct APK installation
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Mobile Touch Screen KeyRep Helper
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline Smartphone App
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a 
                      href="/download/SanTyper_Android.apk"
                      download="SanTyper_Android_v1.0.apk"
                      className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-center"
                    >
                      <Download className="w-4 h-4" />
                      Download Android APK (.APK)
                    </a>
                    <a 
                      href="/download/SanTyper_Android_Suite.zip"
                      download="SanTyper_Android_Suite_v1.0.zip"
                      className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg text-center transition-colors font-mono"
                    >
                      Download APK + Setup Guide (.ZIP)
                    </a>
                  </div>
                </div>
              )}

              {/* PLATFORM 5: APPLE IOS (iPhone & iPad) */}
              {(selectedOsTab === "all" || selectedOsTab === "ios") && (
                <div className="bg-slate-900/60 border border-blue-400/30 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-400/60 transition-all shadow-xl group relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-bold rounded-full uppercase tracking-wider font-mono">
                    Apple iOS
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">SanTyper iOS App (iPhone/iPad)</h3>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Apple MobileConfig Profile & Safari 1-Tap Home Screen WebClip with the official SanTyper icon, full-screen offline mode, and zero App Store delay.
                    </p>
                    <div className="space-y-1 text-[11px] text-slate-300 mb-4 font-mono">
                      <div className="flex items-center gap-1.5 text-blue-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Apple Configuration WebClip (.mobileconfig)
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Full-Screen App Mode without Safari bars
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Works completely offline on iOS
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a 
                      href="/download/SanTyper_iOS_App.mobileconfig"
                      download="SanTyper_iOS_App.mobileconfig"
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer text-center"
                    >
                      <Download className="w-4 h-4" />
                      Download iOS Profile (.mobileconfig)
                    </a>
                    <a 
                      href="/download/SanTyper_iOS_Suite.zip"
                      download="SanTyper_iOS_Suite_v1.0.zip"
                      className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg text-center transition-colors font-mono"
                    >
                      Download iOS Package + 1-Tap Guide (.ZIP)
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Offline Architecture Guarantee Banner */}
            <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <strong className="text-white">100% Offline Safe & Zero Cloud Dependency across all 5 OS:</strong>
                  <span className="text-slate-400 block sm:inline sm:ml-1">
                    සියලුම Sinhala font mapping සහ typing operations ඔබගේ උපාංගය තුළම (Local Client-Side) 100% ආරක්ෂිතව සිදුවේ.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>5-Platform Offline Engine Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MS WORD DIRECT INTEGRATION HUB ================= */}
        <section id="ms-word-integration-hub" className="mb-8 md:mb-12">
          <div className="backdrop-blur-3xl bg-slate-950/70 border border-cyan-500/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden shadow-cyan-950/10">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 pb-6 border-b border-white/10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <Plug className="w-3.5 h-3.5 animate-pulse" />
                  PRO MS WORD PLUG-IN
                </div>
                <h3 className="font-sans font-bold text-xl md:text-2xl tracking-tight text-white mb-2">
                  MS Word සෘජු සම්බන්ධක කේන්ද්‍රය (Word Plug-in Hub)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mb-4">
                  සිංහල යුනිකෝඩ් සහ legacy fonts අතර පරිවර්තනය දැන් සෘජුවම Microsoft Word මෘදුකාංගය තුලදීම සිදු කරගත හැක! වෙබ් අඩවියට පැමිණීමකින් තොරව Word Selection එක ක්ෂණිකව DL-Manel / FM-Abaya බවට පත් කරන ආකාරය පහත දැක්වේ.
                </p>
                
                {/* Visual Tab Buttons */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-900/80 border border-white/10 rounded-2xl self-start">
                  <button
                    onClick={() => setWordIntegrationTab("auto")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      wordIntegrationTab === "auto" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    1-Click Auto-Installer
                  </button>
                  <button
                    onClick={() => setWordIntegrationTab("vba")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      wordIntegrationTab === "vba" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    VBA Macro (.BAS File)
                  </button>
                  <button
                    onClick={() => setWordIntegrationTab("addin")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      wordIntegrationTab === "addin" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Plug className="w-3.5 h-3.5" />
                    Office XML Add-in
                  </button>
                  <button
                    onClick={() => setWordIntegrationTab("troubleshoot")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      wordIntegrationTab === "troubleshoot" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    දෝෂ නිරාකරණය (Troubleshoot)
                  </button>
                </div>
              </div>

              {/* Curated Font Download Bundle */}
              <div className="flex flex-col gap-2 bg-slate-900/80 p-4 rounded-2xl border border-white/10 w-full lg:w-auto min-w-[280px]">
                <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-3 h-3 text-cyan-400" />
                  Required Fonts Download:
                </h4>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://sinhalafont.net/fonts/dl-manel-layout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs font-semibold text-slate-200 transition-all hover:border-cyan-500/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      DL-Manel-Layout (TTF)
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://sinhalafont.net/fonts/fm-abhaya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs font-semibold text-slate-200 transition-all hover:border-cyan-500/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      FM-Abaya Classic (TTF)
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Split UI: Left Side is Step-by-Step setup, Right Side is interactive MS Word simulator */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-8">
              
              {/* Left Column: Installation Steps & Code Block */}
              <div className="xl:col-span-7 flex flex-col gap-6">
                
                {wordIntegrationTab === "auto" ? (
                  /* ================= TAB 1: 1-CLICK AUTO-INSTALLER (RECOMMENDED) ================= */
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-bold">1</span>
                          <h4 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">
                            ස්වයංක්‍රීය 1-Click Auto-Installer (Windows / MS Word)
                          </h4>
                        </div>
                        <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">
                          Word 2013 - 2024 / 365
                        </span>
                      </div>
                      
                      <div className="space-y-3 pl-6 text-xs text-slate-300 leading-relaxed border-l border-white/10">
                        <p>
                          මෙය ඔබගේ පරිගණකයේ ඇති Microsoft Word මෘදුකාංගයට මෙම Converter එක සෘජුවම සම්බන්ධ කරන <strong className="text-white">වේගවත්ම සහ පහසුම ක්‍රමයයි</strong>. කිසිදු කේතයක් අතින් ලිවීමකින් තොරව Word Normal Template එකට කෙටිමං (Shortcuts) ස්වයංක්‍රීයව එක් කරයි.
                        </p>
                        
                        <div className="bg-cyan-950/30 border border-cyan-500/20 p-3.5 rounded-xl space-y-2 text-slate-300">
                          <p className="font-semibold text-cyan-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            ස්ථාපනයෙන් පසු ලැබෙන යතුරුපුවරු කෙටිමං (Word Shortcuts):
                          </p>
                          <ul className="space-y-1.5 text-[11px]">
                            <li className="flex items-center gap-2">
                              <kbd className="bg-slate-800 border border-cyan-500/30 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">Alt + S</kbd>
                              <span><strong>Auto-Detect & Convert:</strong> සිංහල යුනිකෝඩ් නම් Legacy (DL-Manel) බවටද, Legacy නම් යුනිකෝඩ් බවටද හඳුනාගෙන පරිවර්තනය කරයි.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <kbd className="bg-slate-800 border border-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">Alt + L</kbd>
                              <span><strong>Convert to Legacy:</strong> සිලෙක්ට් කරගත් ඡේදය DL-Manel / FM-Abaya බවට පත් කර Font එකද නිවැරදි කරයි.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <kbd className="bg-slate-800 border border-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">Alt + U</kbd>
                              <span><strong>Convert to Unicode:</strong> Legacy අකුරු සම්මත සිංහල යුනිකෝඩ් (Iskoola Pota) බවට හරවයි.</span>
                            </li>
                          </ul>
                        </div>

                        <h5 className="font-bold text-slate-200 text-xs mt-3 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          ස්ථාපනය කිරීමට පියවර (Instructions):
                        </h5>
                        <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300">
                          <li>පහත දැක්වෙන <strong className="text-cyan-400">PowerShell Command එක Copy කරගන්න</strong>.</li>
                          <li>Windows යතුරුපුවරුවේ <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white">Win + R</kbd> ඔබා, <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-[11px]">powershell</code> ලෙස ටයිප් කර Enter ඔබන්න.</li>
                          <li>විවෘත වන නිල් පැහැති PowerShell Window එක මත Right Click කර (Paste කර) <strong className="text-cyan-300">Enter</strong> ඔබන්න.</li>
                          <li>ස්ථාපනය අවසන් වූ පසු Word ලේඛනයක් විවෘත කර ඕනෑම සිංහල වැකියක් සිලෙක්ට් කර <strong className="text-white font-mono">Alt+S</strong> ඔබන්න!</li>
                        </ol>
                      </div>
                    </div>

                    {/* Copy Command Block */}
                    <div className="flex flex-col rounded-2xl border border-cyan-500/30 overflow-hidden bg-slate-950 shadow-xl">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10">
                        <span className="font-mono text-[10px] text-cyan-400 tracking-wider uppercase font-bold flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          WINDOWS POWERSHELL AUTO-INSTALLER
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleDownloadPs1Script}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Download the PowerShell script directly"
                          >
                            <Download className="w-3 h-3" />
                            install.ps1
                          </button>
                          <button
                            onClick={() => {
                              const origin = typeof window !== "undefined" ? window.location.origin : "";
                              const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-Expression (New-Object Net.WebClient).DownloadString('${origin}/install.ps1')"`;
                              navigator.clipboard.writeText(cmd);
                              triggerToast("PowerShell Auto-Installer command copied!");
                            }}
                            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <Copy className="w-3 h-3" />
                            COPY COMMAND
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-950 font-mono text-[11px] text-cyan-200 overflow-x-auto break-all select-all leading-relaxed whitespace-pre-wrap">
                        {`powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-Expression (New-Object Net.WebClient).DownloadString('${typeof window !== "undefined" ? window.location.origin : ""}/install.ps1')"`}
                      </div>
                    </div>

                    {/* Quick Registry Unlock Helper */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          Word VBA Security Unlock (Optional Fix)
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          ස්ථාපනයේදී "Trust access to VBA project object model is disabled" යනුවෙන් පණිවිඩයක් ලැබුනහොත්, පහත 1-Click Registry Fix එක බාගත කර Open කරන්න.
                        </p>
                      </div>
                      <button
                        onClick={handleDownloadRegFile}
                        className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[10px] font-bold uppercase rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3 h-3" />
                        EnableWordMacroAccess.reg
                      </button>
                    </div>
                  </div>
                ) : wordIntegrationTab === "vba" ? (
                  /* ================= TAB 2: VBA MACRO (.BAS FILE) METHOD ================= */
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-bold">1</span>
                          <h4 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">
                            VBA Macro මොඩියුලය Word වෙත එක් කිරීම (.BAS Import)
                          </h4>
                        </div>
                        <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-semibold">
                          Target: {targetFontName}
                        </span>
                      </div>
                      
                      <div className="space-y-3 pl-6 text-xs text-slate-300 leading-relaxed border-l border-white/10">
                        <p>
                          PowerShell භාවිත නොකර Word තුලට සෘජුවම Macro මොඩියුලය ඇතුලත් කරගැනීමට පහත <strong className="text-white">SinhalaWordConverter.bas</strong> ගොනුව බාගත කර තත්පර 5කින් Import කරගත හැක.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-2">
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">පියවර 01</span>
                            <p className="text-[11px] text-slate-200 font-semibold">ගොනුව බාගත කරන්න</p>
                            <p className="text-[10px] text-slate-400">පහත "Download .BAS File" බටන් එක ක්ලික් කරන්න.</p>
                          </div>
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">පියවර 02</span>
                            <p className="text-[11px] text-slate-200 font-semibold">Word හි Alt + F11 ඔබන්න</p>
                            <p className="text-[10px] text-slate-400">Word විවෘත කර Alt+F11 ඔබා VBA Editor එක විවෘත කරන්න.</p>
                          </div>
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">පියවර 03</span>
                            <p className="text-[11px] text-slate-200 font-semibold">File ➔ Import File</p>
                            <p className="text-[10px] text-slate-400">බාගත කළ SinhalaWordConverter.bas තෝරන්න. වැඩේ ඉවරයි!</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          Import කළ පසු, <code className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded">RegisterSinhalaHotkeys</code> මැක්‍රෝව එක් වරක් ධාවනය කිරීමෙන් <strong className="text-white">Alt+S</strong>, <strong className="text-white">Alt+L</strong>, <strong className="text-white">Alt+U</strong> කෙටිමං ස්ථිරවම සක්‍රිය වේ.
                        </p>
                      </div>
                    </div>

                    {/* Action Download Bar */}
                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-bold text-white mb-0.5">SinhalaWordConverter.bas (VBA Module)</h5>
                        <p className="text-[10px] text-slate-400">සම්පූර්ණ Macro කේතය සහ HTTP Engine එක අඩංගු සූදානම් කළ මොඩියුලය.</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleDownloadVbaBas}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          DOWNLOAD .BAS FILE
                        </button>
                        <button
                          onClick={() => {
                            const code = getVbaCodeString();
                            navigator.clipboard.writeText(code);
                            setMacroCopied(true);
                            triggerToast("VBA Macro code copied to clipboard!");
                            setTimeout(() => setMacroCopied(false), 2000);
                          }}
                          className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {macroCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-300" />}
                          {macroCopied ? "COPIED" : "COPY CODE"}
                        </button>
                      </div>
                    </div>

                    {/* Code Preview Frame */}
                    <div className="flex flex-col rounded-2xl border border-white/10 overflow-hidden bg-slate-950 shadow-inner">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-white/10 text-[10px] font-mono text-slate-400 font-bold">
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <Cpu className="w-3.5 h-3.5" />
                          SINHALAWORDCONVERTER.BAS PREVIEW
                        </span>
                        <span>DEFAULT FONT: {targetFontName}</span>
                      </div>
                      <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-normal scrollbar-thin max-h-[240px]">
                        <code>{getVbaCodeString()}</code>
                      </pre>
                    </div>
                  </div>
                ) : wordIntegrationTab === "addin" ? (
                  /* ================= TAB 3: DIRECT OFFICE WORD ADD-IN ================= */
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-bold">1</span>
                          <h4 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">
                            Modern Office Web Add-in (Taskpane App)
                          </h4>
                        </div>
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
                          Office 365 / Desktop / Mac / Web
                        </span>
                      </div>
                      
                      <div className="space-y-3 pl-6 text-xs text-slate-300 leading-relaxed border-l border-white/10">
                        <p>
                          මෙය නවීන Microsoft Office JavaScript API මඟින් ක්‍රියාත්මක වන සම්පූර්ණ Taskpane Add-in එකකි. මැක්‍රෝ අවසර හෝ ආරක්ෂණ බාධක කිසිවක් නොමැතිව Word හි දකුණු පසින් මෙම පරිවර්තක පැනලය විවෘත වේ.
                        </p>
                        
                        <ol className="list-decimal pl-4 space-y-2 text-[11px] text-slate-300">
                          <li>
                            පහත <strong className="text-cyan-400">DOWNLOAD MANIFEST (XML)</strong> බටන් එක ක්ලික් කර <code className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded">sinhala-converter-word-addin.xml</code> ගොනුව බාගත කරගන්න.
                          </li>
                          <li>
                            Microsoft Word (Desktop හෝ Word Online) විවෘත කර <strong className="text-white">Insert ➔ Add-ins ➔ My Add-ins</strong> වෙත යන්න.
                          </li>
                          <li>
                            ජනේලයේ දකුණු පස ඉහළ ඇති <strong className="text-cyan-300">Upload My Add-in</strong> ක්ලික් කර බාගත කරගත් XML ගොනුව තෝරන්න.
                          </li>
                          <li>
                            වහාම ඔබගේ Word ලේඛනයේ දකුණු පසින් <strong className="text-white">Sinhala Word Pro Taskpane</strong> දිස්වනු ඇත!
                          </li>
                        </ol>
                      </div>
                    </div>

                    {/* Download Action Block */}
                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex-1">
                        <h5 className="text-xs font-bold text-white mb-0.5">sinhala-converter-word-addin.xml</h5>
                        <p className="text-[10px] text-slate-400">Office Add-in Sideloading Manifest Schema v1.1</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                          href={`${typeof window !== "undefined" ? window.location.origin : ""}/?office-add-in=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Live Taskpane View
                        </a>
                        <button
                          onClick={handleDownloadManifest}
                          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer whitespace-nowrap"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          DOWNLOAD MANIFEST (XML)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= TAB 4: TROUBLESHOOTING & SOLUTIONS (දෝෂ නිරාකරණය) ================= */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold">!</span>
                        <h4 className="font-bold text-sm text-amber-300 uppercase tracking-wider">
                          නිතර අසන ප්‍රශ්න සහ දෝෂ නිරාකරණය (Word Troubleshooting)
                        </h4>
                      </div>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                        Instant Solutions
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Issue 1: VBOM Trust */}
                      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            1. "Trust access to the VBA project object model is disabled" දෝෂය ලැබේද?
                          </h5>
                          <button
                            onClick={handleDownloadRegFile}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            1-Click .REG Fix
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          <strong>හේතුව:</strong> මයික්‍රොසොෆ්ට් වර්ඩ් හි ආරක්ෂණ සැකසුම් (Security settings) මඟින් පිටස්තර ක්‍රමලේඛ වලට මැක්‍රෝස් ඇතුලත් කිරීම වළක්වා තිබීම.
                        </p>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 text-[11px] text-slate-300 space-y-1">
                          <p className="font-semibold text-cyan-300">විසඳුම A (ස්වයංක්‍රීය):</p>
                          <p>ඉහත ඇති <strong className="text-amber-300">1-Click .REG Fix</strong> බටන් එකෙන් බාගත වන ගොනුව Open කර "Yes" ක්ලික් කරන්න. එවිට Word ආරක්ෂණ අවසරය ක්ෂණිකව සක්‍රිය වේ.</p>
                          <p className="font-semibold text-cyan-300 pt-1">විසඳුම B (Manual Word Settings):</p>
                          <p>Word විවෘත කර <strong>File ➔ Options ➔ Trust Center ➔ Trust Center Settings ➔ Macro Settings</strong> වෙත ගොස් <span className="text-white">"Trust access to the VBA project object model"</span> ටික් (Tick) කරන්න.</p>
                          <p className="font-semibold text-cyan-300 pt-1">විසඳුම C (කිසිදු Registry වෙනසක් නැතිව):</p>
                          <p>ඉහත ඇති <strong>VBA Macro (.BAS File)</strong> ටැබ් එකට ගොස් <code className="text-cyan-300 font-mono">SinhalaWordConverter.bas</code> බාගත කර, Word හි Alt+F11 ඔබා File ➔ Import File මඟින් Import කරන්න!</p>
                        </div>
                      </div>

                      {/* Issue 2: English Characters displayed */}
                      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-2">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                          2. අකුරු සිංහල වෙනුවට ඉංග්‍රීසි අකුරු (උදා: wdhqfndajka) ලෙස පෙනෙන්නේ ඇයි?
                        </h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          <strong>හේතුව:</strong> ඔබගේ පරිගණකයේ අදාළ Legacy Font එක (DL-Manel-Layout හෝ FM-Abaya) Install කර නොතිබීම.
                        </p>
                        <p className="text-[11px] text-slate-300">
                          <strong>විසඳුම:</strong> ඉහළ දකුණු පස ඇති <strong className="text-cyan-300">Required Fonts Download</strong> සබැඳි වලින් DL-Manel හා FM-Abaya බාගත කර, එම Font File එක මත Right-Click කර <strong>"Install"</strong> කරන්න.
                        </p>
                      </div>

                      {/* Issue 3: Auto-detection */}
                      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-2">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          3. දෙපැත්තටම (Unicode ➔ Legacy සහ Legacy ➔ Unicode) පරිවර්තනය කළ හැකිද?
                        </h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          <strong>ඔව්, නියත වශයෙන්ම!</strong> අපගේ Word Plug-in එකෙහි <kbd className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded font-mono text-[10px]">Alt + S</kbd> කෙටිමඟ මඟින් ඔබ තෝරාගත් ඡේදයේ ඇත්තේ යුනිකෝඩ් ද නැතිනම් Legacy අකුරුද යන්න ස්වයංක්‍රීයව හඳුනාගෙන නිවැරදි දිශාවට පරිවර්තනය කරයි. එසේම <kbd className="bg-slate-800 text-purple-300 px-1 py-0.5 rounded font-mono text-[10px]">Alt + U</kbd> මඟින් Legacy අකුරු නැවත යුනිකෝඩ් බවටද පත් කළ හැක!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live MS Word Interactive Simulation Screen */}
              <div className="xl:col-span-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold">2</span>
                    සජීවී Word සිමියුලේටරය (Live Test Drive)
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                    INTERACTIVE SANDBOX
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  පරිගණකයට එක් කිරීමට පෙර, Word Macro එක ක්‍රියා කරන ආකාරය පහතින් සජීවීව අත්හදා බලන්න:
                </p>

                {/* Mock Word Frame */}
                <div className="rounded-2xl border border-slate-400/80 shadow-2xl bg-white overflow-hidden flex flex-col relative" style={{ minHeight: "380px" }}>
                  {/* Word Top Ribbon */}
                  <div className="bg-[#f3f4f6] border-b border-slate-300 p-2.5 flex flex-col gap-2 select-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold font-sans">
                        <span className="w-4 h-4 bg-[#185abd] rounded text-white flex items-center justify-center font-serif text-[11px] font-bold shadow-sm">W</span>
                        Document1 - Microsoft Word
                      </div>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      </div>
                    </div>
                    
                    {/* Formatting bar mimicking Word */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200 text-slate-700 text-[10px]">
                      {/* Font selector */}
                      <select
                        value={mockWordFont}
                        onChange={(e) => setMockWordFont(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-semibold text-[11px] outline-none cursor-pointer"
                      >
                        <option value="Iskoola Pota">Iskoola Pota (Unicode)</option>
                        <option value="DL-Manel">DL-Manel (Legacy)</option>
                        <option value="FMAbhaya">FMAbhaya (Legacy)</option>
                      </select>
                      
                      <div className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-[11px]">
                        14 pt
                      </div>
                      
                      <div className="flex border border-slate-300 rounded bg-white overflow-hidden">
                        <span className="px-1.5 py-0.5 border-r border-slate-200 font-bold">B</span>
                        <span className="px-1.5 py-0.5 border-r border-slate-200 italic">I</span>
                        <span className="px-1.5 py-0.5 underline">U</span>
                      </div>
                    </div>

                    {/* Word Ribbon Shortcut Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/80">
                      <button
                        onClick={() => handleRunMockMacro("auto")}
                        disabled={isMacroRunning}
                        title="Smart Auto-Detect (Alt + S)"
                        className="flex-1 flex items-center justify-center gap-1 bg-[#185abd] hover:bg-[#124694] active:bg-[#0e3674] text-white font-bold py-1.5 px-2 rounded-lg text-[10px] transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3 text-yellow-300" />
                        <span>Alt + S (Auto)</span>
                      </button>

                      <button
                        onClick={() => handleRunMockMacro("to-legacy")}
                        disabled={isMacroRunning}
                        title="Force to Legacy (Alt + L)"
                        className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-800 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <span>Alt + L (Legacy)</span>
                      </button>

                      <button
                        onClick={() => handleRunMockMacro("to-unicode")}
                        disabled={isMacroRunning}
                        title="Force to Unicode (Alt + U)"
                        className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-800 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <span>Alt + U (Unicode)</span>
                      </button>
                    </div>
                  </div>

                  {/* Word Sheet Content Area */}
                  <div className="p-4 flex-1 bg-[#e5e7eb] flex flex-col justify-between">
                    <div className="bg-white shadow-md border border-slate-300 p-5 flex-1 rounded-sm flex flex-col gap-2.5 relative min-h-[170px]">
                      {isMacroRunning && (
                        <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-10 select-none">
                          <div className="w-5 h-5 border-2 border-[#185abd] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] text-[#185abd] font-bold font-mono uppercase tracking-wider animate-pulse">Running Word Macro...</span>
                        </div>
                      )}

                      {/* Quick phrase chips inside document */}
                      <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-slate-100 text-[10px] select-none">
                        <span className="text-slate-400 font-medium">Quick Fill:</span>
                        <button
                          onClick={() => {
                            setMockWordText("ශ්‍රී ලංකා නිදහස් දිනය");
                            setMockWordFont("Iskoola Pota");
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] cursor-pointer"
                        >
                          ශ්‍රී ලංකා නිදහස් දිනය
                        </button>
                        <button
                          onClick={() => {
                            setMockWordText("ආයුබෝවන් ශ්‍රී ලංකා");
                            setMockWordFont("Iskoola Pota");
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] cursor-pointer"
                        >
                          ආයුබෝවන් ශ්‍රී ලංකා
                        </button>
                        <button
                          onClick={() => {
                            setMockWordText("wdhqfndajka Y%S ,xld");
                            setMockWordFont(targetFontName);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] cursor-pointer"
                        >
                          wdhqfndajka Y%S ,xld
                        </button>
                      </div>

                      <textarea
                        value={mockWordText}
                        onChange={(e) => setMockWordText(e.target.value)}
                        rows={4}
                        className={`w-full bg-transparent border-0 outline-0 focus:outline-0 focus:ring-0 text-sm resize-none ${
                          mockWordFont === "Iskoola Pota" 
                            ? "font-sans text-slate-900" 
                            : "text-[#185abd] font-semibold"
                        }`}
                        style={{
                          fontFamily: mockWordFont === "Iskoola Pota" ? "inherit" : `'${mockWordFont}', 'DL-Manel'`
                        }}
                      />

                      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 select-none">
                        <span>PAGE 1 OF 1</span>
                        <span className="font-mono">{mockWordText.length} CHARACTERS</span>
                        <span className="font-semibold text-slate-600 uppercase font-mono">FONT: {mockWordFont}</span>
                      </div>
                    </div>

                    {/* Simulation reset & feedback */}
                    <div className="mt-2.5 flex items-center justify-between px-1">
                      <span className="text-[10px] text-slate-600">
                        {mockWordFont === "Iskoola Pota" ? "📝 Currently in standard Unicode format" : `✨ Converted to ${mockWordFont} format`}
                      </span>
                      <button
                        onClick={() => {
                          setMockWordText("ශ්‍රී ලංකා නිදහස් දිනය");
                          setMockWordFont("Iskoola Pota");
                          triggerToast("Reset mock Word document!");
                        }}
                        className="text-[10px] text-blue-700 hover:underline font-bold cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset Document
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= UTILITY INTERACTIVE SHELF ================= */}
        <section id="sandbox-carousel-panel" className="mb-8 md:mb-12">
          
          {/* Sample Carousels Wrapper */}
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <h3 className="font-sans font-bold text-base tracking-wide text-white">
                Sandbox Quick-Test Templates
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Click any of the high-accuracy Sinhala formulations below to instantly load them into the sandbox workspace for test-drive conversions.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {SAMPLE_TEMPLATES.map((sample) => (
                <button
                  key={sample.id}
                  id={`sample-${sample.id}`}
                  onClick={() => applySample(sample)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 transition-all py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 text-slate-200 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {sample.label}
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/25 rounded-md font-bold">
                    {sample.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE ON-SCREEN MECHANICAL TOUCH KEYBOARD ================= */}
        <section id="onscreen-virtual-keyboard" className="mb-8 md:mb-12">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/15 border border-cyan-400/30 rounded-2xl shadow-inner">
                  <Keyboard className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-lg text-white">SanTyper Typing Helper</h3>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.2 rounded-full font-mono">KeyRep Live</span>
                  </div>
                  <p className="text-xs text-slate-400">Real-time Sinhala typing assistant (Wijesekera & Singlish Phonetics) with 100% offline support</p>
                </div>
              </div>
              
              {/* Keyboard Settings Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* layout selection */}
                <span className="text-xs text-slate-400 mr-1 font-mono">LAYOUT:</span>
                <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKeyboardLayout("wijesekera");
                      triggerToast("Visual Keyboard Layout: Wijesekera");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedKeyboardLayout === "wijesekera"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Wijesekera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKeyboardLayout("phonetic");
                      triggerToast("Visual Keyboard Layout: Phonetic Guide");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedKeyboardLayout === "phonetic"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Phonetic Guide
                  </button>
                </div>

                {/* Toggle Shift State manually */}
                <button
                  type="button"
                  onClick={() => {
                    setKeyboardShift(!keyboardShift);
                    triggerToast(keyboardShift ? "Shift Released" : "Shift Locked");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    keyboardShift
                      ? "bg-cyan-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20 animate-pulse"
                      : "bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${keyboardShift ? 'bg-slate-950 animate-pulse' : 'bg-slate-500'}`} />
                  SHIFT {keyboardShift ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Hint message & KeyRep Activator Toolbar */}
            <div className="mb-6 p-4 bg-slate-950/70 border border-white/10 rounded-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${
                    typingMode === "phonetic"
                      ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-lg shadow-emerald-500/20 animate-pulse"
                      : typingMode === "wijesekera"
                      ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/20 animate-pulse"
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">SanTyper Live Activator (KeyRep Engine)</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        typingMode === "phonetic"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : typingMode === "wijesekera"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-slate-800 text-slate-400 border border-white/10"
                      }`}>
                        {typingMode === "phonetic" ? "ACTIVE • SINGLISH" : typingMode === "wijesekera" ? "ACTIVE • WIJESEKERA" : "STANDBY • ENGLISH"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Toggle modes anywhere using keyboard shortcut <kbd className="text-cyan-400 font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Ctrl + Space</kbd> or <kbd className="text-cyan-400 font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">F12</kbd>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = typingMode === "phonetic" ? "wijesekera" : typingMode === "wijesekera" ? "standard" : "phonetic";
                      setTypingMode(next);
                      triggerToast(next === "phonetic" ? "⚡ KeyRep Singlish Active" : next === "wijesekera" ? "⚡ Wijesekera Active" : "Standard Input");
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Switch Mode (KeyRep)</span>
                  </button>
                </div>
              </div>

              {/* Real-time Practice Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="relative">
                  <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                    <span>Singlish Input (Try Typing Here)</span>
                    <span className="text-emerald-400 text-[10px]">Real-time transliteration</span>
                  </label>
                  <input
                    type="text"
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    placeholder="Type: 'mama lankawata adarei'..."
                    className="w-full bg-slate-900/90 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                  {practiceInput && (
                    <button
                      type="button"
                      onClick={() => setPracticeInput("")}
                      className="absolute right-2.5 bottom-2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                    <span>Converted Sinhala Output</span>
                    <div className="flex items-center gap-1.5">
                      {practiceInput && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const sinhala = phoneticToUnicode(practiceInput);
                              navigator.clipboard.writeText(sinhala);
                              triggerToast("Copied to clipboard!");
                            }}
                            className="text-[10px] text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const sinhala = phoneticToUnicode(practiceInput);
                              setInputText((prev) => prev ? prev + " " + sinhala : sinhala);
                              triggerToast("Added to Main Converter!");
                              const el = document.getElementById("converter-source-input");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="text-[10px] text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            Send to Main
                          </button>
                        </>
                      )}
                    </div>
                  </label>
                  <div className="w-full min-h-[42px] bg-slate-900/90 border border-cyan-500/20 rounded-xl px-3 py-2 text-base text-cyan-300 font-serif flex items-center">
                    {practiceInput ? (
                      <span>{phoneticToUnicode(practiceInput)}</span>
                    ) : (
                      <span className="text-xs text-slate-500 italic font-sans">Sinhala text will appear here automatically...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Singlish phonetic shortcuts pills */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold mr-1">Phonetic Guide:</span>
                {[
                  { k: "ka", s: "ක" },
                  { k: "kaa", s: "කා" },
                  { k: "ki", s: "කි" },
                  { k: "kee", s: "කී" },
                  { k: "ku", s: "කු" },
                  { k: "ko", s: "කො" },
                  { k: "koo", s: "කෝ" },
                  { k: "sh", s: "ෂ" },
                  { k: "th", s: "ත" },
                  { k: "dh", s: "ධ" },
                  { k: "ng", s: "ං" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPracticeInput((prev) => prev + item.k)}
                    className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-md font-mono border border-white/5 cursor-pointer text-[10px]"
                  >
                    <span className="text-cyan-300">{item.k}</span>={item.s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Glyphs & Independent Vowels Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 p-2.5 bg-slate-950/80 border border-white/10 rounded-2xl max-w-5xl mx-auto shadow-inner">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase mr-1 px-1">
                Quick Vowels & Glyphs:
              </span>
              {[
                "අ", "ආ", "ඇ", "ඈ", "ඉ", "ඊ", "උ", "ඌ", "ඍ", "එ", "ඒ", "ඓ", "ඔ", "ඕ", "ඖ",
                "|",
                "්", "‍", "‌", "ං", "ඃ", "ර්‍", "්‍ය", "්‍ර", "ඥ", "ඤ", "ළු", "ඞ"
              ].map((char, cIdx) => (
                char === "|" ? (
                  <span key={cIdx} className="h-5 w-px bg-white/20 mx-1" />
                ) : (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleInsertCharacter(char)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 border border-white/5 text-xs font-serif font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                    title={`Insert '${char}'`}
                  >
                    {char === "‍" ? "ZWJ (බැඳි)" : char === "‌" ? "ZWNJ" : char}
                  </button>
                )
              ))}
            </div>

            {/* The Keyboard Layout Frame */}
            <div className="flex flex-col gap-2 max-w-5xl mx-auto p-4 bg-slate-950/80 border border-white/10 rounded-2xl shadow-inner overflow-x-auto scrollbar-thin">
              {WIJESEKERA_ROWS.map((row, r_idx) => (
                <div key={r_idx} className="flex gap-1.5 justify-center min-w-[850px]">
                  {row.map((keyObj) => {
                    const isActive = activeKeyPressed === keyObj.raw || activeKeyPressed === keyObj.shiftRaw;
                    
                    const latinKey = keyboardShift ? keyObj.shiftRaw : keyObj.raw;
                    const sinhalaChar = keyboardShift ? keyObj.shiftLabel : keyObj.label;
                    
                    return (
                      <button
                        key={keyObj.raw}
                        type="button"
                        onClick={() => {
                          if (typingMode === "phonetic") {
                            handlePhoneticInput(latinKey);
                          } else {
                            handleInsertCharacter(sinhalaChar);
                          }
                        }}
                        className={`group relative h-14 flex-1 rounded-lg border flex flex-col items-center justify-between p-2.5 transition-all outline-none select-none ${
                          isActive
                            ? "bg-cyan-400 border-cyan-400 text-slate-950 scale-95 shadow-lg shadow-cyan-400/30"
                            : "bg-slate-900/95 border-white/10 text-slate-200 hover:bg-slate-800 hover:border-cyan-500/50 hover:shadow-md cursor-pointer"
                        }`}
                        title={`${latinKey} Key ➔ ${sinhalaChar}`}
                      >
                        {/* Latin key reference (Top Left) */}
                        <span className={`text-[10px] uppercase font-mono absolute top-1 left-2 transition-colors ${isActive ? 'text-slate-950 font-bold' : 'text-slate-500 group-hover:text-cyan-400/80'}`}>
                          {latinKey}
                        </span>
                        
                        {/* Main visual label (Center display) */}
                        <span className={`text-base font-serif font-semibold mt-auto ${isActive ? 'text-slate-950 scale-110' : 'text-slate-200 group-hover:text-white'}`}>
                          {sinhalaChar}
                        </span>

                        {/* Interactive glow border on hover */}
                        <div className={`absolute bottom-0 left-0 right-0 h-[2px] transition-colors ${isActive ? 'bg-white' : 'bg-transparent group-hover:bg-cyan-400/30'}`} />
                      </button>
                    );
                  })}
                </div>
              ))}
              
              {/* Spacebar row and helper keys */}
              <div className="flex gap-1.5 justify-center mt-2 min-w-[850px]">
                <button
                  type="button"
                  onClick={() => {
                    setKeyboardShift(!keyboardShift);
                  }}
                  className={`w-28 h-12 rounded-lg border font-bold text-xs flex items-center justify-center transition-all ${
                    keyboardShift
                      ? "bg-cyan-500 border-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 animate-pulse"
                      : "bg-slate-900/90 border-white/10 text-slate-400 hover:text-white cursor-pointer"
                  }`}
                >
                  SHIFT KEY
                </button>

                <button
                  type="button"
                  onClick={() => handleInsertCharacter(" ")}
                  className="flex-1 h-12 rounded-lg border border-white/10 bg-slate-900/80 text-xs hover:border-cyan-500/50 transition-all flex items-center justify-center text-slate-400 font-bold cursor-pointer"
                >
                  SPACEBAR
                </button>

                <button
                  type="button"
                  onClick={() => handleInsertCharacter("।")}
                  className="w-24 h-12 rounded-lg border border-white/10 bg-slate-900/90 text-sm hover:border-cyan-500/50 transition-all flex items-center justify-center text-slate-300 font-bold cursor-pointer"
                >
                   Kunddaliya (।)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DESIGNERS WORKFLOW GUIDE SECTION ================= */}
        <section id="designers-workflow" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12">
          {guideSteps.map((step, index) => (
            <div
              key={index}
              id={`guide-step-${index + 1}`}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-blue-500/20 transition-all shadow-xl"
            >
              <h4 className="font-sans font-bold text-blue-300 text-base mb-2">
                {step.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </section>

        {/* ================= INTERACTIVE KEYBOARD CHEET SHEETS ================= */}
        <section id="cheat-sheet-dock" className="mb-8 md:mb-12 text-center">
          <button
            id="btn-toggle-cheatsheet"
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className="inline-flex items-center gap-2 py-3 px-6 bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 font-semibold text-xs tracking-wider rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-cyan-300" />
            {showCheatSheet ? "HIDE CONVERSION GUIDE & KEY CHEAT SHEET" : "VIEW CHARACTER & KEY CHEAT SHEET"}
          </button>

          {showCheatSheet && (
            <motion.div
              id="converters-cheatsheet-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-left max-w-4xl mx-auto backdrop-blur-3xl bg-slate-950/80 border border-white/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden shadow-blue-950/40"
            >
              <h3 className="font-sans font-bold text-xl text-white mb-3 flex items-center gap-2">
                <Palette className="w-5 h-5 text-cyan-400 animate-pulse" />
                Sinhala Legacy Keymaps Guide (Wijesekera / DL‑Manel Layout)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Legacy software fonts work by swapping the characters typed. For example, typing English letter <strong className="text-blue-300">'l'</strong> displays the character <strong className="text-cyan-300">'ක'</strong> in the design canvas itself. Below is an essential reference table:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Section 1 */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-slate-300">
                  <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">Vowels & Modifiers</h4>
                  <ul className="text-xs space-y-1.5 text-slate-300 font-mono">
                    <li>අ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">w</strong></li>
                    <li>ආ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">wd</strong></li>
                    <li>ඇ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">we</strong></li>
                    <li>ඈ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">wE</strong></li>
                    <li>ලා ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">,d</strong></li>
                    <li>ක් ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">la</strong></li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-slate-300">
                  <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">Consonants K-C</h4>
                  <ul className="text-xs space-y-1.5 text-slate-300 font-mono">
                    <li>ක ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">l</strong></li>
                    <li>ඛ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">L</strong></li>
                    <li>ග ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">.</strong></li>
                    <li>ඝ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">&gt;</strong></li>
                    <li>ච ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">p</strong></li>
                    <li>ඡ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">P</strong></li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-slate-300">
                  <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">Consonants T-N</h4>
                  <ul className="text-xs space-y-1.5 text-slate-300 font-mono">
                    <li>ජ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">c</strong></li>
                    <li>ට ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">g</strong></li>
                    <li>ඩ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">v</strong></li>
                    <li>ත ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">;</strong></li>
                    <li>ද ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">o</strong></li>
                    <li>න ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">k</strong></li>
                  </ul>
                </div>

                {/* Section 4 */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-slate-300">
                  <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">Common Modifiers</h4>
                  <ul className="text-xs space-y-1.5 text-slate-300 font-mono">
                    <li>ෙ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">f</strong></li>
                    <li>ු ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">q</strong></li>
                    <li>ූ ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">Q</strong></li>
                    <li>ි ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">s</strong></li>
                    <li>ී ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">S</strong></li>
                    <li>ර් ➔ <strong className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/10">¾</strong></li>
                  </ul>
                </div>

              </div>

              {/* Notice info banner */}
              <div className="mt-4 flex gap-2.5 p-3.5 bg-blue-500/10 border-l-4 border-blue-400 rounded-r-xl">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  <strong>Developer Note:</strong> The DL-Manel / FM-Abaya / Apex families are highly equivalent legacies. This client-side converter performs live, precise mappings based on regular expressions compiled directly from standard Sri Lankan publications database layouts.
                </p>
              </div>
            </motion.div>
          )}
        </section>

        {/* ================= FOOTER COPYRIGHT BANNER ================= */}
        <footer id="global-footer" className="pt-12 border-t border-white/10 text-xs text-slate-400 tracking-wider leading-relaxed pb-12 mt-auto">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-950/60 border border-white/5 rounded-3xl backdrop-blur-xl mb-6">
            {/* Author details with official logo */}
            <div className="flex items-center gap-4 text-left">
              <div className="relative shrink-0">
                <img 
                  src="/owner.png" 
                  alt="Sanchitha Charunya - Owner & Lead Architect" 
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400 shadow-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-slate-950 p-1 rounded-full ring-2 ring-slate-900">
                  <UserCheck className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white tracking-normal">Sanchitha Charunya</h4>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">Owner & Creator</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Software Engineer & Lead Architect of SanTyper Pro Suite</p>
                <div className="flex items-center gap-3 text-[11px] text-cyan-400/90 mt-1.5 font-mono">
                  <span>© 2026 Sanchitha Charunya</span>
                  <span>•</span>
                  <span>All Rights Reserved</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a 
                href="/download/SanTyper_Setup.exe"
                download="SanTyper_Setup_v1.0.exe"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Windows App (.EXE)
              </a>
              <a 
                href="#windows-desktop-download-hub"
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                View All Editions
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-2.5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-cyan-500/30 rounded-full shadow-md mb-1">
              <img 
                src="/owner.png" 
                alt="Sanchitha Charunya" 
                className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-400"
              />
              <span className="text-[11px] font-bold text-white">Sanchitha Charunya</span>
              <span className="text-[10px] text-cyan-300 font-mono">• Owner & Lead Architect</span>
            </div>
            <p id="copyright-notice" className="text-slate-300 font-semibold text-sm">
              © {new Date().getFullYear()} Sinhala Font Converter & SanTyper Suite. Developed & Engineered by <span className="text-cyan-400 font-bold">Sanchitha Charunya</span>. All rights reserved.
            </p>
            <p id="author-rights-notice" className="text-[11px] text-slate-400 leading-normal">
              Official Sinhala Unicode ↔ Legacy Font Translation Platform & SanTyper Typing Helper. All intellectual property, software architecture, algorithm designs, and source code belong exclusively to <strong className="text-white">Sanchitha Charunya</strong>.
            </p>
            <p id="compliance-notice" className="text-[10px] text-slate-500 pt-1">
              Engineered with high-accuracy algorithmic glyph mapping for Sri Lankan publications, design studios, and native Microsoft Word integration.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
