import React, { useState } from "react";
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Terminal, 
  ExternalLink, 
  Cpu, 
  CheckCircle 
} from "lucide-react";

interface DeveloperCodeExportTabProps {
  mappingProfile: "DL_SERIES" | "FM_SERIES";
  triggerToast: (msg: string) => void;
}

type Language = "typescript" | "python" | "php" | "csharp" | "java";

export default function DeveloperCodeExportTab({
  mappingProfile,
  triggerToast
}: DeveloperCodeExportTabProps) {
  const [selectedLang, setSelectedLang] = useState<Language>("typescript");
  const [selectedProfile, setSelectedProfile] = useState<"DL_SERIES" | "FM_SERIES">(mappingProfile);
  const [includeReverse, setIncludeReverse] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const getGeneratedCode = (): { code: string; filename: string } => {
    const isFm = selectedProfile === "FM_SERIES";
    const lu = isFm ? "¨" : "Æ";
    const luu = isFm ? "¿" : "¨";

    if (selectedLang === "typescript") {
      const code = `/**
 * Sinhala Unicode <=> Legacy (${isFm ? "FM-Abhaya" : "DL-Manel"}) Converter
 * Production TypeScript / JavaScript Module
 */

export function unicodeToLegacy(text: string): string {
  if (!text) return "";

  // 1. Clean zero-width artifacts & BOM
  text = text.replace(/[\\uFEFF\\u200B\\u200C]/g, "");
  text = text.replace(/\\u200D{2,}/g, "\\u200D");

  // 2. Normalize ZWJ for conjuncts (Rakaaransaya, Yansaya, Kshayanna)
  text = text.replace(/\\u0DCA\\u0DBB/g, "\\u0DCA\\u200D\\u0DBB");
  text = text.replace(/\\u0DCA\\u0DBA/g, "\\u0DCA\\u200D\\u0DBA");
  text = text.replace(/\\u0D9A\\u0DCA\\u0DC2/g, "\\u0D9A\\u0DCA\\u200D\\u0DC2");

  // 3. Matra Combinations with Kombuva (Prioritize complex conjuncts first)
  text = text.replace(/ක්‍ෂෝ/g, "fÌda");
  text = text.replace(/ක්‍ෂො/g, "fÌd");
  text = text.replace(/ක්‍ෂේ/g, "fÌa");
  text = text.replace(/ක්‍ෂෙ/g, "fÌ");

  text = text.replace(/ප්‍රෝ/g, "fm%da");
  text = text.replace(/ප්‍රො/g, "fm%d");
  text = text.replace(/ප්‍රේ/g, "fma%");
  text = text.replace(/ප්‍රෙ/g, "fm%");

  text = text.replace(/ශ්‍රී/g, "Y%S");
  text = text.replace(/ද්‍ර/g, "o%");

  // Consonants with Kombuva + Hal + Elapilla (O long)
  text = text.replace(/([\\u0D9A-\\u0DC6])ෝ/g, "f$1da");
  // Consonants with Kombuva + Elapilla (O short)
  text = text.replace(/([\\u0D9A-\\u0DC6])ො/g, "f$1d");
  // Consonants with Kombuva + Hal (E long)
  text = text.replace(/([\\u0D9A-\\u0DC6])ේ/g, "f$1a");
  // Consonants with Kombuva (E short)
  text = text.replace(/([\\u0D9A-\\u0DC6])ෙ/g, "f$1");
  // Consonants with Double Kombuva (Ai)
  text = text.replace(/([\\u0D9A-\\u0DC6])ෛ/g, "ff$1");

  // 4. Special Glyphs
  text = text.replace(/ලූ/g, "${luu}");
  text = text.replace(/ලු/g, "${lu}");
  text = text.replace(/ක්‍ෂ/g, "Ì");

  // 5. Base Consonants & Vowels
  const charMap: Record<string, string> = {
    'ක': 'l', 'ඛ': 'L', 'ග': '.', 'ඝ': '>', 'ඞ': 'x',
    'ච': 'p', 'ඡ': 'P', 'ජ': 'c', 'ඣ': 'CO', 'ඤ': '[', 'ඥ': '{',
    'ට': 'g', 'ඨ': 'G', 'ඩ': 'v', 'ඪ': 'V', 'ණ': 'K',
    'ත': ';', 'ථ': ':', 'ද': 'o', 'ධ': 'O', 'න': 'k',
    'ප': 'm', 'ඵ': 'M', 'බ': 'n', 'භ': 'N', 'ම': 'u',
    'ය': 'h', 'ර': 'r', 'ල': ',', 'ව': 'j',
    'ශ': 'Y', 'ෂ': 'I', 'ස': 'i', 'හ': 'y', 'ළ': '<', 'ෆ': '*',
    'අ': 'w', 'ආ': 'wd', 'ඇ': 'we', 'ඈ': 'wE', 'ඉ': 'b', 'ඊ': 'B',
    'උ': 'W', 'ඌ': 'W!', 'එ': 't', 'ඒ': 'ta', 'ඔ': 'T', 'ඕ': '´',
    'ං': 'x', 'ඃ': '#', '්': 'a', 'ා': 'd', 'ැ': 'e', 'ෑ': 'E',
    'ි': 's', 'ී': 'S', 'ු': 'q', 'ූ': 'Q', 'ෘ': 'D'
  };

  for (const [uni, leg] of Object.entries(charMap)) {
    text = text.replaceAll(uni, leg);
  }

  return text;
}
${includeReverse ? `
export function legacyToUnicode(text: string): string {
  if (!text) return "";

  // Reverse Matra Reorderings (Kombuva)
  text = text.replace(/fÌda/g, "ක්‍ෂෝ");
  text = text.replace(/fÌd/g, "ක්‍ෂො");
  text = text.replace(/fÌa/g, "ක්‍ෂේ");
  text = text.replace(/fÌ/g, "ක්‍ෂෙ");

  text = text.replace(/f([a-zA-Z\\{\\}\\[\\]\\|<\\>])da/g, "$1ෝ");
  text = text.replace(/f([a-zA-Z\\{\\}\\[\\]\\|<\\>])d/g, "$1ො");
  text = text.replace(/f([a-zA-Z\\{\\}\\[\\]\\|<\\>])a/g, "$1ේ");
  text = text.replace(/ff([a-zA-Z\\{\\}\\[\\]\\|<\\>])/g, "$1ෛ");
  text = text.replace(/f([a-zA-Z\\{\\}\\[\\]\\|<\\>])/g, "$1ෙ");

  // Profile-specific glyphs
  text = text.replace(/${luu}/g, "ලූ");
  text = text.replace(/${lu}/g, "ලු");
  text = text.replace(/Ì/g, "ක්‍ෂ");

  return text;
}` : ""}`;
      return { code, filename: `sinhala_converter_${selectedProfile.toLowerCase()}.ts` };
    }

    if (selectedLang === "python") {
      const code = `"""
Sinhala Unicode <=> Legacy (${isFm ? "FM-Abhaya" : "DL-Manel"}) Converter
Production Python 3 Script
"""
import re

def unicode_to_legacy(text: str) -> str:
    if not text:
        return ""

    # Clean zero-width artifacts
    text = re.sub(r'[\\uFEFF\\u200B\\u200C]', '', text)
    text = re.sub(r'\\u200D{2,}', '\\u200D', text)

    # Normalize conjunct ZWJs
    text = re.sub(r'\\u0DCA\\u0DBB', '\\u0DCA\\u200D\\u0DBB', text)
    text = re.sub(r'\\u0DCA\\u0DBA', '\\u0DCA\\u200D\\u0DBA', text)
    text = re.sub(r'\\u0D9A\\u0DCA\\u0DC2', '\\u0D9A\\u0DCA\\u200D\\u0DC2', text)

    # Complex Conjuncts & Kombuva
    text = text.replace('ක්‍ෂෝ', 'fÌda')
    text = text.replace('ක්‍ෂො', 'fÌd')
    text = text.replace('ක්‍ෂේ', 'fÌa')
    text = text.replace('ක්‍ෂෙ', 'fÌ')

    text = text.replace('ශ්‍රී', 'Y%S')
    text = text.replace('ද්‍ර', 'o%')
    text = text.replace('ක්‍ෂ', 'Ì')
    text = text.replace('ලූ', '${luu}')
    text = text.replace('ලු', '${lu}')

    # Kombuva Reordering Patterns
    text = re.sub(r'([\\u0D9A-\\u0DC6])ෝ', r'f\\1da', text)
    text = re.sub(r'([\\u0D9A-\\u0DC6])ො', r'f\\1d', text)
    text = re.sub(r'([\\u0D9A-\\u0DC6])ේ', r'f\\1a', text)
    text = re.sub(r'([\\u0D9A-\\u0DC6])ෙ', r'f\\1', text)
    text = re.sub(r'([\\u0D9A-\\u0DC6])ෛ', r'ff\\1', text)

    char_map = {
        'ක': 'l', 'ඛ': 'L', 'ග': '.', 'ඝ': '>', 'ඞ': 'x',
        'ච': 'p', 'ඡ': 'P', 'ජ': 'c', 'ඣ': 'CO', 'ඤ': '[', 'ඥ': '{',
        'ට': 'g', 'ඨ': 'G', 'ඩ': 'v', 'ඪ': 'V', 'ණ': 'K',
        'ත': ';', 'ථ': ':', 'ද': 'o', 'ධ': 'O', 'න': 'k',
        'ප': 'm', 'ඵ': 'M', 'බ': 'n', 'භ': 'N', 'ම': 'u',
        'ය': 'h', 'ර': 'r', 'ල': ',', 'ව': 'j',
        'ශ': 'Y', 'ෂ': 'I', 'ස': 'i', 'හ': 'y', 'ළ': '<', 'ෆ': '*',
        'අ': 'w', 'ආ': 'wd', 'ඇ': 'we', 'ඈ': 'wE', 'ඉ': 'b', 'ඊ': 'B',
        'ං': 'x', 'ඃ': '#', '්': 'a', 'ා': 'd', 'ැ': 'e', 'ෑ': 'E',
        'ි': 's', 'ී': 'S', 'ු': 'q', 'ූ': 'Q', 'ෘ': 'D'
    }

    for uni, leg in char_map.items():
        text = text.replace(uni, leg)

    return text
${includeReverse ? `
def legacy_to_unicode(text: str) -> str:
    if not text:
        return ""

    # Reverse Kombuva
    text = text.replace('fÌda', 'ක්‍ෂෝ')
    text = text.replace('fÌd', 'ක්‍ෂො')
    text = text.replace('fÌa', 'ක්‍ෂේ')
    text = text.replace('fÌ', 'ක්‍ෂෙ')

    text = re.sub(r'f([a-zA-Z\\{\\}\\[\\]\\|<\\>])da', r'\\1ෝ', text)
    text = re.sub(r'f([a-zA-Z\\{\\}\\[\\]\\|<\\>])d', r'\\1ො', text)
    text = re.sub(r'f([a-zA-Z\\{\\}\\[\\]\\|<\\>])a', r'\\1ේ', text)
    text = re.sub(r'ff([a-zA-Z\\{\\}\\[\\]\\|<\\>])', r'\\1ෛ', text)
    text = re.sub(r'f([a-zA-Z\\{\\}\\[\\]\\|<\\>])', r'\\1ෙ', text)

    text = text.replace('${luu}', 'ලූ')
    text = text.replace('${lu}', 'ලු')
    text = text.replace('Ì', 'ක්‍ෂ')

    return text
` : ""}`;
      return { code, filename: `sinhala_converter_${selectedProfile.toLowerCase()}.py` };
    }

    if (selectedLang === "php") {
      const code = `<?php
/**
 * Sinhala Unicode <=> Legacy (${isFm ? "FM-Abhaya" : "DL-Manel"}) Converter
 * PHP 8+ Class / Utility
 */

class SinhalaConverter {
    public static function unicodeToLegacy(string $text): string {
        if (empty($text)) return "";

        // Clean zero-width artifacts
        $text = preg_replace('/[\\x{FEFF}\\x{200B}\\x{200C}]/u', '', $text);
        $text = preg_replace('/\\x{200D}{2,}/u', "\u{200D}", $text);

        // Normalize ZWJ for conjuncts
        $text = preg_replace('/\\x{0DCA}\\x{0DBB}/u', "\u{0DCA}\u{200D}\u{0DBB}", $text);
        $text = preg_replace('/\\x{0DCA}\\x{0DBA}/u', "\u{0DCA}\u{200D}\u{0DBA}", $text);
        $text = preg_replace('/\\x{0D9A}\\x{0DCA}\\x{0DC2}/u', "\u{0D9A}\u{0DCA}\u{200D}\u{0DC2}", $text);

        // Matra Kombuva
        $text = str_replace('ක්‍ෂෝ', 'fÌda', $text);
        $text = str_replace('ක්‍ෂො', 'fÌd', $text);
        $text = str_replace('ක්‍ෂේ', 'fÌa', $text);
        $text = str_replace('ක්‍ෂෙ', 'fÌ', $text);

        $text = str_replace('ශ්‍රී', 'Y%S', $text);
        $text = str_replace('ක්‍ෂ', 'Ì', $text);
        $text = str_replace('ලූ', '${luu}', $text);
        $text = str_replace('ලු', '${lu}', $text);

        $text = preg_replace('/([\\x{0D9A}-\\x{0DC6}])ෝ/u', 'f$1da', $text);
        $text = preg_replace('/([\\x{0D9A}-\\x{0DC6}])ො/u', 'f$1d', $text);
        $text = preg_replace('/([\\x{0D9A}-\\x{0DC6}])ේ/u', 'f$1a', $text);
        $text = preg_replace('/([\\x{0D9A}-\\x{0DC6}])ෙ/u', 'f$1', $text);

        return $text;
    }
}
?>`;
      return { code, filename: `SinhalaConverter.php` };
    }

    if (selectedLang === "csharp") {
      const code = `using System;
using System.Text.RegularExpressions;

namespace SinhalaTypography
{
    public static class SinhalaConverter
    {
        public static string UnicodeToLegacy(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";

            // Clean Zero Width Non-Joiner & artifacts
            text = Regex.Replace(text, @"[\\uFEFF\\u200B\\u200C]", "");
            text = Regex.Replace(text, @"\\u200D{2,}", "\\u200D");

            // Normalize conjuncts
            text = Regex.Replace(text, @"\\u0DCA\\u0DBB", "\\u0DCA\\u200D\\u0DBB");
            text = Regex.Replace(text, @"\\u0DCA\\u0DBA", "\\u0DCA\\u200D\\u0DBA");

            // Reorder Kombuva
            text = text.Replace("ක්‍ෂෝ", "fÌda")
                       .Replace("ක්‍ෂො", "fÌd")
                       .Replace("ක්‍ෂේ", "fÌa")
                       .Replace("ක්‍ෂෙ", "fÌ")
                       .Replace("ශ්‍රී", "Y%S")
                       .Replace("ක්‍ෂ", "Ì")
                       .Replace("ලූ", "${luu}")
                       .Replace("ලු", "${lu}");

            text = Regex.Replace(text, @"([\\u0D9A-\\u0DC6])ෝ", "f$1da");
            text = Regex.Replace(text, @"([\\u0D9A-\\u0DC6])ො", "f$1d");
            text = Regex.Replace(text, @"([\\u0D9A-\\u0DC6])ේ", "f$1a");
            text = Regex.Replace(text, @"([\\u0D9A-\\u0DC6])ෙ", "f$1");

            return text;
        }
    }
}`;
      return { code, filename: `SinhalaConverter.cs` };
    }

    // Java
    const code = `package com.sinhala.typography;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class SinhalaConverter {
    public static String unicodeToLegacy(String text) {
        if (text == null || text.isEmpty()) return "";

        text = text.replaceAll("[\\uFEFF\\u200B\\u200C]", "");
        text = text.replaceAll("\\u200D{2,}", "\\u200D");

        text = text.replace("ක්‍ෂෝ", "fÌda");
        text = text.replace("ක්‍ෂො", "fÌd");
        text = text.replace("ක්‍ෂේ", "fÌa");
        text = text.replace("ක්‍ෂෙ", "fÌ");
        text = text.replace("ක්‍ෂ", "Ì");
        text = text.replace("ලූ", "${luu}");
        text = text.replace("ලු", "${lu}");

        text = text.replaceAll("([\\u0D9A-\\u0DC6])ෝ", "f$1da");
        text = text.replaceAll("([\\u0D9A-\\u0DC6])ො", "f$1d");
        text = text.replaceAll("([\\u0D9A-\\u0DC6])ේ", "f$1a");
        text = text.replaceAll("([\\u0D9A-\\u0DC6])ෙ", "f$1");

        return text;
    }
}`;
    return { code, filename: `SinhalaConverter.java` };
  };

  const { code, filename } = getGeneratedCode();

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    triggerToast(`Copied ${selectedLang.toUpperCase()} converter code!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded "${filename}"!`);
  };

  return (
    <div id="developer-code-export" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-400" />
            Developer Code & SDK Snippet Generator
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Embed the production Sinhala conversion algorithm directly into your apps, web backends, Node.js microservices, or game engines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? "Copied!" : "Copy Code"}
          </button>
          <button
            onClick={downloadCode}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Download Source
          </button>
        </div>
      </div>

      {/* Control Bar: Language, Profile, and Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Language selector */}
        <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Target Language
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["typescript", "python", "php", "csharp", "java"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedLang === lang
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-white/5"
                }`}
              >
                {lang === "typescript" ? "TS / JS" : lang === "csharp" ? "C#" : lang}
              </button>
            ))}
          </div>
        </div>

        {/* Font Profile selector */}
        <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Font Series Profile
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setSelectedProfile("FM_SERIES")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedProfile === "FM_SERIES"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-950/60 text-slate-400 border border-white/5"
              }`}
            >
              FM-Abhaya Series
            </button>
            <button
              onClick={() => setSelectedProfile("DL_SERIES")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedProfile === "DL_SERIES"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-950/60 text-slate-400 border border-white/5"
              }`}
            >
              DL-Manel Series
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Code Features
          </label>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includeReverse}
                onChange={(e) => setIncludeReverse(e.target.checked)}
                className="rounded accent-purple-600"
              />
              Include Reverse (Legacy ➔ Unicode)
            </label>
          </div>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-5 overflow-hidden relative">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <span className="text-xs font-mono text-purple-300 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            {filename}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Pure Regex Engine • Zero External Dependencies
          </span>
        </div>

        <pre className="text-xs font-mono text-slate-200 overflow-x-auto max-h-[420px] p-2 leading-relaxed selection:bg-purple-500/30">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
