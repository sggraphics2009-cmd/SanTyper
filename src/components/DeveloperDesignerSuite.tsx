import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { saveAs } from "file-saver";
import { unicodeToDlManel, dlManelToUnicode } from "../lib/converterLogic";
import RegexPlaygroundTab from "./RegexPlaygroundTab";
import DeveloperCodeExportTab from "./DeveloperCodeExportTab";
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  FileText, 
  RefreshCw, 
  FileDown, 
  Cpu, 
  Trash2, 
  HelpCircle, 
  Upload, 
  Sliders, 
  Eye, 
  ArrowLeftRight, 
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  Palette,
  ChevronDown
} from "lucide-react";

interface DeveloperDesignerSuiteProps {
  targetFontName: string;
  mappingProfile: "DL_SERIES" | "FM_SERIES";
  setTargetFontName: (font: string) => void;
  conversionMode: "unicode-to-legacy" | "legacy-to-unicode";
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  triggerToast: (message: string) => void;
  getMergedOverrides: (fontName: string) => Array<{ find: string; replace: string }>;
}

const GLYPH_CATEGORIES = [
  { id: "all", label: "සියල්ල (All)" },
  { id: "vowels", label: "පණකුරු (Vowels)" },
  { id: "consonants", label: "ගතකුරු (Consonants)" },
  { id: "matras", label: "පිලි (Vowel Signs)" },
  { id: "conjuncts", label: "බැඳි අකුරු (Conjuncts)" }
];

const SINHALA_GLYPHS = [
  // Vowels
  { char: "අ", cat: "vowels", name: "Ayanna", unicode: "U+0D85" },
  { char: "ආ", cat: "vowels", name: "Aayanna", unicode: "U+0D86" },
  { char: "ඇ", cat: "vowels", name: "Aeyanna", unicode: "U+0D87" },
  { char: "ඈ", cat: "vowels", name: "Aaeyanna", unicode: "U+0D88" },
  { char: "ඉ", cat: "vowels", name: "Iyanna", unicode: "U+0D89" },
  { char: "ඊ", cat: "vowels", name: "Iiyanna", unicode: "U+0D8A" },
  { char: "උ", cat: "vowels", name: "Uyanna", unicode: "U+0D8B" },
  { char: "ඌ", cat: "vowels", name: "Uuyanna", unicode: "U+0D8C" },
  { char: "එ", cat: "vowels", name: "Eyanna", unicode: "U+0D91" },
  { char: "ඒ", cat: "vowels", name: "Eeyanna", unicode: "U+0D92" },
  { char: "ඓ", cat: "vowels", name: "Aiyanna", unicode: "U+0D93" },
  { char: "ඔ", cat: "vowels", name: "Oyanna", unicode: "U+0D94" },
  { char: "ඕ", cat: "vowels", name: "Ooyanna", unicode: "U+0D95" },
  { char: "ඖ", cat: "vowels", name: "Ouyanna", unicode: "U+0D96" },
  // Consonants
  { char: "ක", cat: "consonants", name: "Kayanna", unicode: "U+0D9A" },
  { char: "ඛ", cat: "consonants", name: "Kahayanna", unicode: "U+0D9B" },
  { char: "ග", cat: "consonants", name: "Gayanna", unicode: "U+0D9C" },
  { char: "ඝ", cat: "consonants", name: "Gahayanna", unicode: "U+0D9D" },
  { char: "ඞ", cat: "consonants", name: "Ngyanna", unicode: "U+0D9E" },
  { char: "ඟ", cat: "consonants", name: "Sanyaka Gayanna", unicode: "U+0D9F" },
  { char: "ච", cat: "consonants", name: "Chayanna", unicode: "U+0DA0" },
  { char: "ඡ", cat: "consonants", name: "Chahayanna", unicode: "U+0DA1" },
  { char: "ජ", cat: "consonants", name: "Jayanna", unicode: "U+0DA2" },
  { char: "ඣ", cat: "consonants", name: "Jahayanna", unicode: "U+0DA3" },
  { char: "ඤ", cat: "consonants", name: "Nyanganna", unicode: "U+0DA4" },
  { char: "ඥ", cat: "consonants", name: "Knyanganna", unicode: "U+0DA5" },
  { char: "ට", cat: "consonants", name: "Tayanna", unicode: "U+0DA6" },
  { char: "ඨ", cat: "consonants", name: "Tahayanna", unicode: "U+0DA7" },
  { char: "ඩ", cat: "consonants", name: "Dayanna", unicode: "U+0DA8" },
  { char: "ඪ", cat: "consonants", name: "Dahayanna", unicode: "U+0DA9" },
  { char: "ණ", cat: "consonants", name: "Nayanna (Murdhaja)", unicode: "U+0DAA" },
  { char: "ඬ", cat: "consonants", name: "Sanyaka Dayanna", unicode: "U+0DAB" },
  { char: "ත", cat: "consonants", name: "Thayanna (Danthaja)", unicode: "U+0DAC" },
  { char: "ථ", cat: "consonants", name: "Thahayanna", unicode: "U+0DAD" },
  { char: "ද", cat: "consonants", name: "Dayanna (Danthaja)", unicode: "U+0DAE" },
  { char: "ධ", cat: "consonants", name: "Dahayanna", unicode: "U+0DAF" },
  { char: "න", cat: "consonants", name: "Nayanna (Danthaja)", unicode: "U+0DB0" },
  { char: "ඳ", cat: "consonants", name: "Sanyaka Dayanna", unicode: "U+0DB1" },
  { char: "ප", cat: "consonants", name: "Payanna", unicode: "U+0DB4" },
  { char: "ඵ", cat: "consonants", name: "Phayanna", unicode: "U+0DB5" },
  { char: "බ", cat: "consonants", name: "Bayanna", unicode: "U+0DB6" },
  { char: "භ", cat: "consonants", name: "Bhayanna", unicode: "U+0DB7" },
  { char: "ම", cat: "consonants", name: "Mayanna", unicode: "U+0DB8" },
  { char: "ඹ", cat: "consonants", name: "Sanyaka Bayanna", unicode: "U+0DB9" },
  { char: "ය", cat: "consonants", name: "Yayanna", unicode: "U+0DBA" },
  { char: "ර", cat: "consonants", name: "Rayanna", unicode: "U+0DBB" },
  { char: "ල", cat: "consonants", name: "Layanna", unicode: "U+0DBD" },
  { char: "ව", cat: "consonants", name: "Wayanna", unicode: "U+0DC0" },
  { char: "ශ", cat: "consonants", name: "Shayanna (Taluja)", unicode: "U+0DC1" },
  { char: "ෂ", cat: "consonants", name: "Shayanna (Murdhaja)", unicode: "U+0DC2" },
  { char: "ස", cat: "consonants", name: "Sayanna", unicode: "U+0DC3" },
  { char: "හ", cat: "consonants", name: "Hayanna", unicode: "U+0DC4" },
  { char: "ළ", cat: "consonants", name: "Layanna (Murdhaja)", unicode: "U+0DC5" },
  { char: "ෆ", cat: "consonants", name: "Fayanna", unicode: "U+0DC6" },
  // Matras
  { char: "කා", cat: "matras", name: "K+Elapilla (ka)", unicode: "U+0DCF" },
  { char: "කැ", cat: "matras", name: "K+Aedapilla (kae)", unicode: "U+0DD0" },
  { char: "කෑ", cat: "matras", name: "K+Diga Aedapilla (kaee)", unicode: "U+0DD1" },
  { char: "කි", cat: "matras", name: "K+Ispilla (ki)", unicode: "U+0DD2" },
  { char: "කී", cat: "matras", name: "K+Diga Ispilla (kii)", unicode: "U+0DD3" },
  { char: "කු", cat: "matras", name: "K+Papilla (ku)", unicode: "U+0DD4" },
  { char: "කූ", cat: "matras", name: "K+Diga Papilla (kuu)", unicode: "U+0DD6" },
  { char: "කෘ", cat: "matras", name: "K+Gaetapilla (kr)", unicode: "U+0DD8" },
  { char: "කෙ", cat: "matras", name: "K+Kombuva (ke)", unicode: "U+0DDA" },
  { char: "කේ", cat: "matras", name: "K+Kombuva+Hal (kee)", unicode: "U+0DDB" },
  { char: "කො", cat: "matras", name: "K+Kombuva+Ela (ko)", unicode: "U+0DDC" },
  { char: "කෝ", cat: "matras", name: "K+Kombuva+Ela+Hal (koo)", unicode: "U+0DDD" },
  { char: "කෞ", cat: "matras", name: "K+Kombuva+Dila (kou)", unicode: "U+0DDE" },
  { char: "ක්", cat: "matras", name: "K+Hal (k)", unicode: "U+0DCA" },
  // Conjuncts
  { char: "ක්‍ර", cat: "conjuncts", name: "Rakaaransaya (kra)", unicode: "ZWJ+R" },
  { char: "ක්‍ය", cat: "conjuncts", name: "Yansaya (kya)", unicode: "ZWJ+Y" },
  { char: "ශ්‍රී", cat: "conjuncts", name: "Sri (sri)", unicode: "S+ZWJ+R+ii" },
  { char: "ර්‍", cat: "conjuncts", name: "Rephaya", unicode: "R+Hal+ZWJ" },
  { char: "න්‍ද", cat: "conjuncts", name: "Nda Conjunct", unicode: "N+Hal+ZWJ+D" },
  { char: "ත්ථ", cat: "conjuncts", name: "Ttha Conjunct", unicode: "T+Hal+ZWJ+Th" }
];

export default function DeveloperDesignerSuite({
  targetFontName,
  mappingProfile,
  setTargetFontName,
  conversionMode,
  inputText,
  setInputText,
  outputText,
  setOutputText,
  triggerToast,
  getMergedOverrides
}: DeveloperDesignerSuiteProps) {
  // Main Suite tabs
  const [activeSuiteTab, setActiveSuiteTab] = useState<"glyph" | "subtitle" | "diagnostics" | "regex" | "code" | "banner">("glyph");

  // ================= 1. GLYPH INSPECTOR STATE =================
  const [glyphSearch, setGlyphSearch] = useState("");
  const [selectedGlyphCat, setSelectedGlyphCat] = useState("all");
  const [selectedInspectorGlyph, setSelectedInspectorGlyph] = useState<typeof SINHALA_GLYPHS[0] | null>(SINHALA_GLYPHS[0]);
  const [copiedGlyphKey, setCopiedGlyphKey] = useState<"none" | "unicode" | "legacy">("none");

  // ================= 2. FILE CONVERTER STATE =================
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);
  const [convertedFileContent, setConvertedFileContent] = useState<string>("");
  const [fileConversionMode, setFileConversionMode] = useState<"unicode-to-legacy" | "legacy-to-unicode">("unicode-to-legacy");
  const [fileProfile, setFileProfile] = useState<"DL_SERIES" | "FM_SERIES">("DL_SERIES");
  const [filePreviewLines, setFilePreviewLines] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= 3. DIAGNOSTICS STATE =================
  const [diagnosticScore, setDiagnosticScore] = useState(100);
  const [detectedIssues, setDetectedIssues] = useState<Array<{
    id: string;
    type: "critical" | "warning" | "info";
    title: string;
    desc: string;
    count: number;
    fixable: boolean;
    snippet: string;
  }>>([]);

  // ================= 4. BANNER CREATOR STATE =================
  const [bannerText, setBannerText] = useState("ආයුබෝවන් ශ්‍රී ලංකා!");
  const [bannerPreset, setBannerPreset] = useState("midnight");
  const [bannerFontSize, setBannerFontSize] = useState(38);
  const [bannerLetterSpacing, setBannerLetterSpacing] = useState(2);
  const [bannerShadow, setBannerShadow] = useState<"none" | "soft" | "glowing">("glowing");
  const [bannerAlignment, setBannerAlignment] = useState<"left" | "center" | "right">("center");
  const [bannerProfile, setBannerProfile] = useState<"DL_SERIES" | "FM_SERIES">("DL_SERIES");
  const [bannerFont, setBannerFont] = useState("DL-Manel-Layout");

  // Run diagnostics whenever input changes
  useEffect(() => {
    runTextDiagnostics();
  }, [inputText]);

  // Diagnostics logic
  const runTextDiagnostics = () => {
    if (!inputText) {
      setDiagnosticScore(100);
      setDetectedIssues([]);
      return;
    }

    const issues: typeof detectedIssues = [];

    // Check 1: Double Ispilla (ිි)
    const dIspilla = (inputText.match(/ිි/g) || []).length;
    if (dIspilla > 0) {
      issues.push({
        id: "double-ispilla",
        type: "critical",
        title: "Double Ispilla Modifier (පිලි ද්විත්ව වැරදි)",
        desc: "You typed Ispilla (ි) twice on the same consonant, causing rendering glitches or weird spacing in graphic design files.",
        count: dIspilla,
        fixable: true,
        snippet: "ිි ➔ ි"
      });
    }

    // Check 2: Double Hal-lakuna (්්)
    const dHal = (inputText.match(/්්/g) || []).length;
    if (dHal > 0) {
      issues.push({
        id: "double-hal",
        type: "critical",
        title: "Double Hal Lakuna (හල් කිරීම් ද්විත්ව වැරදි)",
        desc: "Hal lakuna (්) typed twice consecutively on a character. This scrambles legacy character mapping layouts.",
        count: dHal,
        fixable: true,
        snippet: "්් ➔ ්"
      });
    }

    // Check 3: Double Elapilla (ාා)
    const dEla = (inputText.match(/ාා/g) || []).length;
    if (dEla > 0) {
      issues.push({
        id: "double-ela",
        type: "critical",
        title: "Double Elapilla (ඇලපිලි ද්විත්ව වැරදි)",
        desc: "Elapilla (ා) typed twice consecutively, causing unwanted extra spacing symbols in legacy formats.",
        count: dEla,
        fixable: true,
        snippet: "ාා ➔ ා"
      });
    }

    // Check 4: Broken Rakaaransaya (ක්ර, ප්ර, ශ්ර etc - without ZWJ)
    // Sinhala Unicode Rakaaransaya should contain ZWJ (\u200D). If it misses, it is e.g. "ක්" + "ර" -> "ක්ර" instead of "ක්‍ර"
    const brokenRakaMatches = inputText.match(/[\u0D9A-\u0DC6]\u0DCA\u0DBB/g) || [];
    const brokenRakaCount = brokenRakaMatches.length;
    if (brokenRakaCount > 0) {
      issues.push({
        id: "broken-raka",
        type: "warning",
        title: "Broken Rakaaransaya (රකාරාංශ දෝෂ)",
        desc: "Missing the Zero Width Joiner (ZWJ) before the 'Ra' character. Standard web rendering displays 'ක්ර' instead of elegant 'ක්‍ර'. We will auto-heal this for legacy fonts, but you should fix it for Unicode.",
        count: brokenRakaCount,
        fixable: true,
        snippet: "ක්ර ➔ ක්‍ර"
      });
    }

    // Check 5: Broken Yansaya (ක්ය, ම්ය etc - without ZWJ)
    const brokenYanMatches = inputText.match(/[\u0D9A-\u0DC6]\u0DCA\u0DBA/g) || [];
    const brokenYanCount = brokenYanMatches.length;
    if (brokenYanCount > 0) {
      issues.push({
        id: "broken-yan",
        type: "warning",
        title: "Broken Yansaya (යංශ දෝෂ)",
        desc: "Missing the Zero Width Joiner (ZWJ) before 'Ya' modifier. Shows as 'ක්ය' instead of correct conjunct 'ක්‍ය'.",
        count: brokenYanCount,
        fixable: true,
        snippet: "ක්ය ➔ ක්‍ය"
      });
    }

    // Check 6: Orphaned Vowel Modifier spacing
    const spacingModifierCount = (inputText.match(/\s+(\u0DCA|\u0DD2|\u0DD3|\u0DD4|\u0DD6|\u0DDA|\u0DDB|\u0DDC|\u0DDD|\u0DDE|\u0DDF)/g) || []).length;
    if (spacingModifierCount > 0) {
      issues.push({
        id: "spacing-modifier",
        type: "info",
        title: "Orphaned Vowel spacing",
        desc: "Detected spacing characters preceding vowel modifiers or Hal-lakuna. This separates pili from the letters, rendering floating symbols.",
        count: spacingModifierCount,
        fixable: true,
        snippet: "[Space][Modifier] ➔ [Modifier]"
      });
    }

    // Compute health score
    let score = 100;
    issues.forEach(iss => {
      if (iss.type === "critical") score -= iss.count * 15;
      if (iss.type === "warning") score -= iss.count * 8;
      if (iss.type === "info") score -= iss.count * 3;
    });

    setDiagnosticScore(Math.max(5, score));
    setDetectedIssues(issues);
  };

  const executeAutoRepair = () => {
    if (!inputText) return;
    let repaired = inputText;
    
    // Replace duplicate modifiers
    repaired = repaired.replace(/ිි/g, "ි");
    repaired = repaired.replace(/ීී/g, "ී");
    repaired = repaired.replace(/ුු/g, "ු");
    repaired = repaired.replace(/ූූ/g, "ූ");
    repaired = repaired.replace(/්්/g, "්");
    repaired = repaired.replace(/ාා/g, "ා");
    repaired = repaired.replace(/්‌්/g, "්");

    // Clean zero-width artifacts and BOM
    repaired = repaired.replace(/[\uFEFF\u200B\u200C]/g, "");

    // Fix missing ZWJ for Rakaaransaya, Yansaya & Kshayanna
    repaired = repaired.replace(/([\u0D9A-\u0DC6])\u0DCA\u0DBB/g, "$1\u0DCA\u200D\u0DBB");
    repaired = repaired.replace(/([\u0D9A-\u0DC6])\u0DCA\u0DBA/g, "$1\u0DCA\u200D\u0DBA");
    repaired = repaired.replace(/\u0D9A\u0DCA\u0DC2/g, "\u0D9A\u0DCA\u200D\u0DC2");

    // Remove space before modifiers
    repaired = repaired.replace(/\s+(\u0DCA|\u0DD2|\u0DD3|\u0DD4|\u0DD6|\u0DDA|\u0DDB|\u0DDC|\u0DDD|\u0DDE|\u0DDF)/g, "$1");

    if (repaired !== inputText) {
      setInputText(repaired);
      triggerToast("🚀 Complete text repair successful! All bugs resolved.");
    } else {
      triggerToast("Text is already in pristine shape! No edits needed.");
    }
  };

  // ================= FILE HANDLERS =================
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const loadFile = (file: File) => {
    const validExtensions = [".txt", ".srt", ".csv", ".json"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      triggerToast("❌ Invalid file format. Please upload .srt, .txt, .csv, or .json files.");
      return;
    }

    setUploadedFile(file);
    setConvertedFileContent("");
    setFilePreviewLines([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      
      // Grab first few lines for visual preview
      const preview = text.split("\n").slice(0, 5);
      setFilePreviewLines(preview);
      triggerToast(`Loaded "${file.name}" successfully!`);
    };
    reader.onerror = () => {
      triggerToast("❌ Error reading file content.");
    };
    reader.readAsText(file);
  };

  const processFileConversion = () => {
    if (!fileContent || !uploadedFile) return;

    setIsProcessingFile(true);
    setFileProgress(15);

    setTimeout(() => {
      try {
        const lines = fileContent.split("\n");
        const convertedLines: string[] = [];
        const activeOverrides = getMergedOverrides(targetFontName);
        const isSrt = uploadedFile.name.toLowerCase().endsWith(".srt");

        setFileProgress(45);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // For subtitles, preserve metadata lines intact
          if (isSrt) {
            const trimmed = line.trim();
            const isIndex = /^\d+$/.test(trimmed);
            const isTime = trimmed.includes("-->");

            if (isIndex || isTime || !trimmed) {
              convertedLines.push(line);
              continue;
            }
          }

          // Convert text content lines
          let converted = "";
          if (fileConversionMode === "unicode-to-legacy") {
            converted = unicodeToDlManel(line, activeOverrides, fileProfile);
          } else {
            converted = dlManelToUnicode(line, activeOverrides, fileProfile);
          }
          convertedLines.push(converted);
        }

        setFileProgress(80);
        const joined = convertedLines.join("\n");
        setConvertedFileContent(joined);
        
        // Refresh converted preview
        setFilePreviewLines(convertedLines.slice(0, 5));
        setFileProgress(100);
        setIsProcessingFile(false);
        triggerToast("🎉 File conversion complete! Click download below.");
      } catch (err) {
        setIsProcessingFile(false);
        setFileProgress(0);
        triggerToast("❌ File conversion failed. Check console for details.");
        console.error(err);
      }
    }, 600);
  };

  const downloadConvertedFile = () => {
    if (!convertedFileContent || !uploadedFile) return;
    
    const extIdx = uploadedFile.name.lastIndexOf(".");
    const baseName = uploadedFile.name.substring(0, extIdx);
    const ext = uploadedFile.name.substring(extIdx);
    const outName = `${baseName}_converted_${fileConversionMode === "unicode-to-legacy" ? "legacy" : "unicode"}${ext}`;

    const blob = new Blob([convertedFileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded: "${outName}"`);
  };

  const clearFileState = () => {
    setUploadedFile(null);
    setFileContent("");
    setConvertedFileContent("");
    setFilePreviewLines([]);
    setFileProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ================= BANNER PRESETS AND SVG CONVERT =================
  const BANNER_THEMES: Record<string, { bg: string; text: string; shadow: string; grad: string }> = {
    midnight: {
      bg: "linear-gradient(135deg, #020617 0%, #1e1b4b 100%)",
      text: "#22d3ee",
      shadow: "0 0 15px rgba(34, 211, 238, 0.4)",
      grad: "url(#midnight-grad)"
    },
    sunset: {
      bg: "linear-gradient(135deg, #ea580c 0%, #be123c 100%)",
      text: "#ffffff",
      shadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
      grad: "url(#sunset-grad)"
    },
    forest: {
      bg: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
      text: "#4ade80",
      shadow: "0 0 12px rgba(74, 222, 128, 0.3)",
      grad: "url(#forest-grad)"
    },
    corporate: {
      bg: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
      text: "#f8fafc",
      shadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      grad: "url(#corporate-grad)"
    },
    royal: {
      bg: "linear-gradient(135deg, #1e3a8a 0%, #311042 100%)",
      text: "#fbbf24",
      shadow: "0 0 15px rgba(251, 191, 36, 0.4)",
      grad: "url(#royal-grad)"
    }
  };

  const getConvertedBannerText = () => {
    if (!bannerText) return "";
    const activeOverrides = getMergedOverrides(bannerFont);
    return unicodeToDlManel(bannerText, activeOverrides, bannerProfile);
  };

  const copyBannerCSS = () => {
    const theme = BANNER_THEMES[bannerPreset];
    const css = `background: ${theme.bg};\ncolor: ${theme.text};\nfont-family: '${bannerFont}', sans-serif;\nfont-size: ${bannerFontSize}px;\nletter-spacing: ${bannerLetterSpacing}px;\ntext-shadow: ${bannerShadow === "glowing" ? theme.shadow : bannerShadow === "soft" ? "2px 2px 4px rgba(0,0,0,0.4)" : "none"};`;
    navigator.clipboard.writeText(css);
    triggerToast("📋 Graphic Banner CSS Styles copied to clipboard!");
  };

  const downloadBannerSVG = () => {
    const theme = BANNER_THEMES[bannerPreset];
    const textLegacy = getConvertedBannerText();
    const shadowFilter = bannerShadow === "glowing" 
      ? `<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
         </filter>` 
      : bannerShadow === "soft"
      ? `<filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" flood-opacity="0.5"/>
         </filter>`
      : "";

    const textAnchor = bannerAlignment === "center" ? "middle" : bannerAlignment === "right" ? "end" : "start";
    const textX = bannerAlignment === "center" ? "50%" : bannerAlignment === "right" ? "90%" : "10%";

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="midnight-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="sunset-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
    <linearGradient id="forest-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
    <linearGradient id="corporate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="royal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#311042"/>
    </linearGradient>
    ${shadowFilter}
  </defs>

  <!-- Background Rect -->
  <rect width="100%" height="100%" fill="${theme.grad}" rx="24"/>
  
  <!-- Overlay Decor -->
  <circle cx="80%" cy="10%" r="150" fill="white" opacity="0.02" />
  <circle cx="10%" cy="90%" r="200" fill="white" opacity="0.015" />

  <!-- Sinhala Converted Typography text -->
  <text 
    x="${textX}" 
    y="55%" 
    font-family="'${bannerFont}', sans-serif" 
    font-size="${bannerFontSize}" 
    fill="${theme.text}" 
    letter-spacing="${bannerLetterSpacing}"
    text-anchor="${textAnchor}"
    ${bannerShadow === "glowing" ? 'filter="url(#glow)"' : bannerShadow === "soft" ? 'filter="url(#shadow)"' : ""}
  >${textLegacy}</text>
  
  <!-- Small Brand Badge -->
  <text x="50%" y="90%" font-family="sans-serif" font-size="10" fill="white" opacity="0.4" text-anchor="middle" letter-spacing="2">DEVELOPED BY SANCHITHA CHARUNYA</text>
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sinhala_designer_banner_${bannerPreset}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("🎨 Scalable Vector Graphic (SVG) downloaded successfully!");
  };

  const downloadBannerPNG = () => {
    const theme = BANNER_THEMES[bannerPreset];
    const textLegacy = getConvertedBannerText();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    if (bannerPreset === "midnight") {
      grad.addColorStop(0, "#020617");
      grad.addColorStop(1, "#1e1b4b");
    } else if (bannerPreset === "sunset") {
      grad.addColorStop(0, "#ea580c");
      grad.addColorStop(1, "#be123c");
    } else if (bannerPreset === "forest") {
      grad.addColorStop(0, "#064e3b");
      grad.addColorStop(1, "#022c22");
    } else if (bannerPreset === "corporate") {
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#334155");
    } else {
      grad.addColorStop(0, "#1e3a8a");
      grad.addColorStop(1, "#311042");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative vector frame
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 1128, 558);

    // Glow / shadow
    if (bannerShadow === "glowing") {
      ctx.shadowColor = theme.text;
      ctx.shadowBlur = 24;
    } else if (bannerShadow === "soft") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
    }

    // Text rendering
    ctx.fillStyle = theme.text;
    ctx.font = `bold ${Math.round(bannerFontSize * 1.6)}px "${bannerFont}", "DL-Manel", "FMAbhaya", sans-serif`;
    ctx.textAlign = bannerAlignment as CanvasTextAlign;
    ctx.textBaseline = "middle";

    const x = bannerAlignment === "center" ? 600 : bannerAlignment === "right" ? 1060 : 140;
    ctx.fillText(textLegacy, x, 315);

    // Watermark footer
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("DEVELOPED BY SANCHITHA CHARUNYA", 600, 560);

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `sinhala-banner-${bannerPreset}-${Date.now()}.png`);
        triggerToast("🎨 High-Resolution PNG Banner exported successfully!");
      }
    }, "image/png");
  };

  // Inspect specific glyph
  const selectGlyphToInspect = (glyph: typeof SINHALA_GLYPHS[0]) => {
    setSelectedInspectorGlyph(glyph);
    triggerToast(`Inspecting character: "${glyph.char}"`);
  };

  // Filtered glyph list based on search and category
  const filteredGlyphs = SINHALA_GLYPHS.filter(g => {
    const matchesCat = selectedGlyphCat === "all" || g.cat === selectedGlyphCat;
    const matchesSearch = g.char.includes(glyphSearch) || g.name.toLowerCase().includes(glyphSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="dev-designer-toolkit-hub" className="mb-8 md:mb-12">
      <div className="backdrop-blur-3xl bg-slate-950/50 border border-blue-500/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Soft background decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/5 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-3 animate-pulse">
              <Sliders className="w-3.5 h-3.5" />
              Advanced Suite
            </div>
            <h3 className="font-sans font-bold text-2xl tracking-tight text-white mb-1.5 flex items-center gap-2">
              Sinhala Developer & Designer Toolkit
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              A comprehensive set of professional tools for advanced Sinhala content creators, subtitle editors, designers, and developers.
            </p>
          </div>

          {/* Tab switches */}
          <div className="flex bg-slate-900/85 p-1 rounded-2xl border border-white/5 self-start shrink-0 flex-wrap gap-1">
            {[
              { id: "glyph", label: "Glyph Inspector", icon: Eye },
              { id: "subtitle", label: "Subtitle & Bulk File", icon: FileText },
              { id: "diagnostics", label: "Smart Diagnostics", icon: AlertTriangle },
              { id: "regex", label: "Regex & Rules", icon: Sliders },
              { id: "code", label: "Code & SDK", icon: Cpu },
              { id: "banner", label: "Banner Designer", icon: Palette }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSuiteTab(tab.id as any);
                    triggerToast(`Switched to: ${tab.label}`);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSuiteTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= TAB CONTENTS ================= */}
        <div className="pt-6">
          <AnimatePresence mode="wait">
            {/* 1. GLYPH INSPECTOR TAB */}
            {activeSuiteTab === "glyph" && (
              <motion.div
                key="glyph-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left side: Search & Grid */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  {/* Grid control bar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    {/* Search field */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by Sinhala character or name (e.g. ක, Ayanna)..."
                        value={glyphSearch}
                        onChange={(e) => setGlyphSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50"
                      />
                    </div>
                    {/* Cat selector */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 self-start overflow-x-auto max-w-full scrollbar-thin">
                      {GLYPH_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedGlyphCat(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide whitespace-nowrap cursor-pointer transition-all ${
                            selectedGlyphCat === cat.id ? "bg-blue-600/20 text-blue-300" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Character matrix board */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 max-h-[360px] overflow-y-auto grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-11 gap-2.5 scrollbar-thin">
                    {filteredGlyphs.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-xs text-slate-500 italic">
                        No characters found matching search.
                      </div>
                    ) : (
                      filteredGlyphs.map((glyph, idx) => {
                        const isSelected = selectedInspectorGlyph?.char === glyph.char;
                        return (
                          <button
                            key={idx}
                            onClick={() => selectGlyphToInspect(glyph)}
                            className={`group h-12 flex flex-col items-center justify-center rounded-xl border transition-all text-base font-serif relative overflow-hidden cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 border-blue-500 text-white scale-[1.04] shadow-md shadow-blue-600/10"
                                : "bg-slate-900/60 border-white/5 text-slate-200 hover:bg-slate-800 hover:border-blue-500/30"
                            }`}
                          >
                            <span className="font-semibold">{glyph.char}</span>
                            <span className={`text-[8px] font-sans opacity-50 absolute bottom-1 ${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                              {glyph.unicode.replace("U+", "")}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono italic">
                    💡 Click on any character in the matrix to view its live legacy key representations and detailed visual diagnostics.
                  </span>
                </div>

                {/* Right side: Inspector Sidebar Detail panel */}
                <div className="lg:col-span-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                  {selectedInspectorGlyph ? (
                    <div className="flex flex-col h-full justify-between gap-5">
                      {/* Top info */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span className="text-xs text-blue-400 font-mono uppercase tracking-widest">Glyph Inspector</span>
                          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-400 font-bold capitalize">
                            {selectedInspectorGlyph.cat}
                          </span>
                        </div>

                        {/* Huge character preview box */}
                        <div className="flex items-center justify-center bg-slate-950/70 border border-white/10 rounded-2xl p-6 relative">
                          <span className="text-6xl text-white font-serif font-light">{selectedInspectorGlyph.char}</span>
                          <div className="absolute top-2 right-2 flex flex-col text-right font-mono text-[9px] text-slate-500">
                            <span>HEX: {selectedInspectorGlyph.unicode}</span>
                            <span>NAME: {selectedInspectorGlyph.name}</span>
                          </div>
                        </div>

                        {/* Dynamic calculated values */}
                        <div className="space-y-2.5 text-xs">
                          {/* DL Series */}
                          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-mono">DL-Manel mapping</span>
                              <span className="font-mono text-cyan-300 text-sm font-bold bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">
                                {unicodeToDlManel(selectedInspectorGlyph.char, undefined, "DL_SERIES") || "N/A"}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const key = unicodeToDlManel(selectedInspectorGlyph.char, undefined, "DL_SERIES");
                                navigator.clipboard.writeText(key);
                                setCopiedGlyphKey("legacy");
                                triggerToast(`Copied DL-Manel keys: "${key}"`);
                                setTimeout(() => setCopiedGlyphKey("none"), 1500);
                              }}
                              className="text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg border border-white/5 transition-all cursor-pointer"
                              title="Copy mapping"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* FM Series */}
                          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-mono">FM-Abaya mapping</span>
                              <span className="font-mono text-amber-300 text-sm font-bold bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">
                                {unicodeToDlManel(selectedInspectorGlyph.char, undefined, "FM_SERIES") || "N/A"}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const key = unicodeToDlManel(selectedInspectorGlyph.char, undefined, "FM_SERIES");
                                navigator.clipboard.writeText(key);
                                setCopiedGlyphKey("legacy");
                                triggerToast(`Copied FM-Abaya keys: "${key}"`);
                                setTimeout(() => setCopiedGlyphKey("none"), 1500);
                              }}
                              className="text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg border border-white/5 transition-all cursor-pointer"
                              title="Copy mapping"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bottom action bar */}
                      <div className="flex gap-2.5 mt-4 pt-4 border-t border-white/5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedInspectorGlyph.char);
                            setCopiedGlyphKey("unicode");
                            triggerToast(`Copied Unicode character: "${selectedInspectorGlyph.char}"`);
                            setTimeout(() => setCopiedGlyphKey("none"), 1500);
                          }}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedGlyphKey === "unicode" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Unicode
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setInputText(inputText + selectedInspectorGlyph.char);
                            triggerToast(`Typed "${selectedInspectorGlyph.char}" into editor`);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/10"
                        >
                          Type into Editor
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12 space-y-1.5">
                      <Eye className="w-8 h-8 text-slate-600 animate-pulse" />
                      <p className="text-xs">Select any character on the left grid matrix to inspect details.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. SUBTITLE & BULK FILE CONVERTER */}
            {activeSuiteTab === "subtitle" && (
              <motion.div
                key="subtitle-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Drag-and-drop file container */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-3xl p-8 bg-slate-950/30 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".srt,.txt,.csv,.json"
                  />
                  <div className="w-14 h-14 bg-blue-500/10 group-hover:bg-blue-500/15 border border-blue-500/20 group-hover:border-blue-500/30 rounded-2xl flex items-center justify-center transition-all duration-300">
                    <Upload className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white mb-1">
                      Drag & Drop Subtitles or Bulk Text files
                    </h4>
                    <p className="text-xs text-slate-400 leading-normal max-w-md mx-auto">
                      Supports <strong className="text-slate-300">.srt</strong> (Subtitle formats), <strong className="text-slate-300">.txt</strong>, <strong className="text-slate-300">.csv</strong> and <strong className="text-slate-300">.json</strong> plain text. 
                      Timing tags and line indices in SRT subtitles are preserved perfectly!
                    </p>
                  </div>
                </div>

                {/* File controls & Preview block */}
                {uploadedFile && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/40 border border-white/5 rounded-3xl p-5">
                    {/* Left details & conversion controls */}
                    <div className="lg:col-span-5 flex flex-col justify-between gap-5 border-b lg:border-b-0 lg:border-r border-white/5 pb-5 lg:pb-0 lg:pr-5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-mono uppercase">Target File Info</span>
                          <button
                            onClick={clearFileState}
                            className="text-slate-500 hover:text-red-400 text-[10px] font-bold uppercase transition-colors"
                          >
                            Remove File
                          </button>
                        </div>
                        
                        {/* File detail bubble */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                          <FileText className="w-8 h-8 text-cyan-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-xs text-slate-200 truncate">{uploadedFile.name}</h5>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Size: {(uploadedFile.size / 1024).toFixed(2)} KB | Type: {uploadedFile.name.substring(uploadedFile.name.lastIndexOf(".") + 1).toUpperCase()}
                            </p>
                          </div>
                        </div>

                        {/* Direction toggle */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Conversion Mode:</span>
                          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-white/5">
                            <button
                              onClick={() => setFileConversionMode("unicode-to-legacy")}
                              className={`py-1.5 px-1 rounded-lg text-center font-bold text-[10px] transition-all cursor-pointer ${
                                fileConversionMode === "unicode-to-legacy" ? "bg-blue-600/20 text-blue-300 border border-blue-500/20" : "text-slate-500"
                              }`}
                            >
                              Unicode ➔ Legacy
                            </button>
                            <button
                              onClick={() => setFileConversionMode("legacy-to-unicode")}
                              className={`py-1.5 px-1 rounded-lg text-center font-bold text-[10px] transition-all cursor-pointer ${
                                fileConversionMode === "legacy-to-unicode" ? "bg-blue-600/20 text-blue-300 border border-blue-500/20" : "text-slate-500"
                              }`}
                            >
                              Legacy ➔ Unicode
                            </button>
                          </div>
                        </div>

                        {/* Mapping profile toggle */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Mapping Profile:</span>
                          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-white/5">
                            <button
                              onClick={() => setFileProfile("DL_SERIES")}
                              className={`py-1.5 px-1 rounded-lg text-center font-bold text-[10px] transition-all cursor-pointer ${
                                fileProfile === "DL_SERIES" ? "bg-blue-600/20 text-blue-300 border border-blue-500/20" : "text-slate-500"
                              }`}
                            >
                              DL Series (Manel)
                            </button>
                            <button
                              onClick={() => setFileProfile("FM_SERIES")}
                              className={`py-1.5 px-1 rounded-lg text-center font-bold text-[10px] transition-all cursor-pointer ${
                                fileProfile === "FM_SERIES" ? "bg-blue-600/20 text-blue-300 border border-blue-500/20" : "text-slate-500"
                              }`}
                            >
                              FM Series (Abhaya)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Convert action button / progress */}
                      <div className="space-y-3">
                        {isProcessingFile ? (
                          <div className="space-y-2">
                            <div className="flex justify-between font-mono text-[9px] text-slate-500">
                              <span>PROCESSING DATA SEGMENTS...</span>
                              <span>{fileProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${fileProgress}%` }} />
                            </div>
                          </div>
                        ) : convertedFileContent ? (
                          <button
                            onClick={downloadConvertedFile}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
                          >
                            <Download className="w-4 h-4" />
                            Download Converted File
                          </button>
                        ) : (
                          <button
                            onClick={processFileConversion}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/10"
                          >
                            <RefreshCw className="w-4 h-4 animate-spin-slow" />
                            Convert File Text
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Preview Window */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <span className="text-xs text-slate-400 font-mono uppercase block mb-3">Live File Terminal Preview</span>
                      <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 flex-1 h-[240px] font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1.5 scrollbar-thin">
                        <div className="text-[10px] text-slate-500 pb-1 border-b border-white/5 mb-2 uppercase flex justify-between">
                          <span>{convertedFileContent ? "Converted content sample" : "Original content sample"}</span>
                          <span>First 5 lines</span>
                        </div>
                        {filePreviewLines.map((line, idx) => (
                          <div key={idx} className="truncate">
                            <span className="text-slate-600 mr-2 select-none">[{idx+1}]</span>
                            {line || <span className="text-slate-700 italic">empty</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. DIAGNOSTICS TAB */}
            {activeSuiteTab === "diagnostics" && (
              <motion.div
                key="diagnostics-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Left side: Circular Gauge representation */}
                <div className="md:col-span-4 bg-slate-900/60 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-5 text-center">
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Text Diagnostics Health</span>
                  
                  {/* Gauge representation */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="#0f172a"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke={diagnosticScore >= 80 ? "#22c55e" : diagnosticScore >= 50 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - diagnosticScore / 100)}
                        className="transition-all duration-700 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-extrabold text-white tracking-tight">{diagnosticScore}%</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Score</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-slate-200">
                      {diagnosticScore === 100 ? "Pristine Shape!" : diagnosticScore >= 80 ? "Good Quality" : "Needs Optimization"}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 leading-normal max-w-[200px]">
                      {diagnosticScore === 100 
                        ? "Your Sinhala Unicode spelling and modifier sequence are absolutely perfect!" 
                        : "Detected some minor rendering sequence conflicts. Clean them below for absolute design accuracy."}
                    </p>
                  </div>

                  {detectedIssues.length > 0 && (
                    <button
                      onClick={executeAutoRepair}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/15"
                    >
                      1-Click Auto-Repair text
                    </button>
                  )}
                </div>

                {/* Right side: Detailed Warnings list */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Warnings & Structural Conflicts ({detectedIssues.length})</span>
                  
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 max-h-[300px] overflow-y-auto space-y-3 scrollbar-thin">
                    {detectedIssues.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500 space-y-2">
                        <CheckCircle className="w-10 h-10 text-green-500/80 animate-pulse" />
                        <p className="text-xs font-bold text-green-400">Perfect Layout Health! No errors detected.</p>
                        <p className="text-[10px] opacity-75">Spelling sequences, ZWJs and vowel signs conform to standard SLSI rules.</p>
                      </div>
                    ) : (
                      detectedIssues.map(issue => (
                        <div
                          key={issue.id}
                          className={`border rounded-xl p-4 flex gap-4 items-start ${
                            issue.type === "critical"
                              ? "bg-red-500/5 border-red-500/20"
                              : issue.type === "warning"
                              ? "bg-amber-500/5 border-amber-500/20"
                              : "bg-blue-500/5 border-blue-500/20"
                          }`}
                        >
                          {issue.type === "critical" ? (
                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          ) : issue.type === "warning" ? (
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-slate-200">{issue.title}</h5>
                              <span className="text-[10px] bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded font-mono font-semibold text-slate-400">
                                {issue.count} occurrences
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{issue.desc}</p>
                            <div className="pt-2 flex items-center gap-2">
                              <span className="text-[9px] text-slate-500 font-mono font-semibold uppercase">Correction rule:</span>
                              <code className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-white/5 text-blue-300 font-mono">
                                {issue.snippet}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. GRAPHIC BANNER CREATOR */}
            {activeSuiteTab === "banner" && (
              <motion.div
                key="banner-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left controls side */}
                <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-xs text-blue-400 font-mono uppercase tracking-widest block">Banner Controls</span>
                  </div>

                  {/* Text Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase">Banner Text (සිංහල යුනිකෝඩ්):</label>
                    <input
                      type="text"
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      placeholder="e.g. ආයුබෝවන් ශ්‍රී ලංකා!"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-500/50"
                    />
                  </div>

                  {/* Preset styling themes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase">Canvas Background Theme:</label>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
                      {Object.keys(BANNER_THEMES).map(themeKey => (
                        <button
                          key={themeKey}
                          onClick={() => {
                            setBannerPreset(themeKey);
                            triggerToast(`Applied theme: ${themeKey.toUpperCase()}`);
                          }}
                          className={`py-1.5 rounded-lg text-center font-bold text-[9px] capitalize transition-all cursor-pointer ${
                            bannerPreset === themeKey ? "bg-blue-600/20 text-blue-300 border border-blue-500/20" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {themeKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fonts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">Target Font:</label>
                      <select
                        value={bannerFont}
                        onChange={(e) => setBannerFont(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-200 outline-none"
                      >
                        <option value="DL-Manel-Layout">DL-Manel-Layout</option>
                        <option value="DL-Manel">DL-Manel</option>
                        <option value="FMAbhaya">FMAbhaya (Classic)</option>
                        <option value="FMBindumathi">FMBindumathi</option>
                        <option value="Apex-Sinhala">Apex-Sinhala</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">Font Profile:</label>
                      <select
                        value={bannerProfile}
                        onChange={(e) => setBannerProfile(e.target.value as any)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-200 outline-none"
                      >
                        <option value="DL_SERIES">DL Series (Manel)</option>
                        <option value="FM_SERIES">FM Series (Abhaya)</option>
                      </select>
                    </div>
                  </div>

                  {/* Adjustments */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>FONT SIZE:</span>
                        <span className="text-blue-400 font-bold">{bannerFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="70"
                        value={bannerFontSize}
                        onChange={(e) => setBannerFontSize(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>LETTER SPACING:</span>
                        <span className="text-blue-400 font-bold">{bannerLetterSpacing}px</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="12"
                        value={bannerLetterSpacing}
                        onChange={(e) => setBannerLetterSpacing(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Shadow and Alignment */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">Text Shadow:</label>
                      <select
                        value={bannerShadow}
                        onChange={(e) => setBannerShadow(e.target.value as any)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-200 outline-none"
                      >
                        <option value="none">No Glow</option>
                        <option value="soft">Subtle shadow</option>
                        <option value="glowing">Neon Backlight</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">Alignment:</label>
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                        {(["left", "center", "right"] as const).map(align => (
                          <button
                            key={align}
                            onClick={() => setBannerAlignment(align)}
                            className={`flex-1 py-1 rounded capitalize text-[9px] font-bold cursor-pointer transition-all ${
                              bannerAlignment === align ? "bg-blue-600/20 text-blue-300" : "text-slate-500"
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Visual preview canvas and actions */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-5">
                  <div className="space-y-2 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Design Canvas Stage</span>
                      <span className="text-[9px] text-[#22c55e] bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full font-mono animate-pulse">VECTOR PREVIEW</span>
                    </div>

                    {/* Styled Canvas box displaying legacy text styled dynamically */}
                    <div
                      className="flex-1 min-h-[220px] rounded-3xl p-8 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-2xl border border-white/10"
                      style={{
                        background: BANNER_THEMES[bannerPreset].bg,
                        transition: "all 0.3s ease-in-out"
                      }}
                    >
                      {/* Grid background effect */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                      {/* Accent circles */}
                      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                      {/* Render text with custom styling */}
                      <div
                        className="my-auto w-full break-all font-serif leading-normal relative z-10"
                        style={{
                          color: BANNER_THEMES[bannerPreset].text,
                          fontSize: `${bannerFontSize}px`,
                          letterSpacing: `${bannerLetterSpacing}px`,
                          textAlign: bannerAlignment,
                          textShadow: bannerShadow === "glowing" 
                            ? BANNER_THEMES[bannerPreset].shadow 
                            : bannerShadow === "soft"
                            ? "2px 3px 5px rgba(0,0,0,0.5)"
                            : "none"
                        }}
                      >
                        {getConvertedBannerText() || <span className="opacity-35 italic font-sans text-xs">Enter text to render banner...</span>}
                      </div>

                      {/* Watermark brand */}
                      <span className="text-[8px] tracking-[4px] uppercase font-sans text-white/20 select-none">
                        Power-Grid Typography Sandbox
                      </span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={copyBannerCSS}
                      className="flex-1 min-w-[120px] bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-cyan-400" />
                      Copy CSS
                    </button>
                    <button
                      onClick={downloadBannerSVG}
                      className="flex-1 min-w-[140px] bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/10"
                    >
                      <Download className="w-4 h-4 text-white" />
                      Export Vector (.svg)
                    </button>
                    <button
                      onClick={downloadBannerPNG}
                      className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/10"
                    >
                      <Download className="w-4 h-4 text-amber-300" />
                      Export High-Res (.png)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. REGEX & RULES PLAYGROUND TAB */}
            {activeSuiteTab === "regex" && (
              <motion.div
                key="regex-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <RegexPlaygroundTab
                  inputText={inputText}
                  setInputText={setInputText}
                  triggerToast={triggerToast}
                />
              </motion.div>
            )}

            {/* 6. DEVELOPER CODE & SDK TAB */}
            {activeSuiteTab === "code" && (
              <motion.div
                key="code-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DeveloperCodeExportTab
                  mappingProfile={mappingProfile}
                  triggerToast={triggerToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
