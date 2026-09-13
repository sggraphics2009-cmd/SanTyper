import React, { useState, useMemo } from "react";
import { 
  Sliders, 
  Play, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  FileCode, 
  Download, 
  Upload,
  RefreshCw,
  Info
} from "lucide-react";

interface RegexPlaygroundTabProps {
  inputText: string;
  setInputText: (text: string) => void;
  triggerToast: (msg: string) => void;
}

interface CustomRule {
  id: string;
  name: string;
  find: string;
  replace: string;
  flags: string;
  enabled: boolean;
}

const PRESET_RULES: Array<Omit<CustomRule, "id">> = [
  {
    name: "Clean Ghost ZWJ/ZWNJ/BOM",
    find: "[\\u200B\\u200C\\uFEFF]",
    replace: "",
    flags: "g",
    enabled: true
  },
  {
    name: "Fix Double Hal Lakuna (්්)",
    find: "්+",
    replace: "්",
    flags: "g",
    enabled: true
  },
  {
    name: "Fix Double Ispilla (ිි)",
    find: "ි+",
    replace: "ි",
    flags: "g",
    enabled: true
  },
  {
    name: "Fix Double Elapilla (ාා)",
    find: "ා+",
    replace: "ා",
    flags: "g",
    enabled: true
  },
  {
    name: "Heal Broken Rakaaransaya",
    find: "([\\u0D9A-\\u0DC6])\\u0DCA\\u0DBB",
    replace: "$1්\u200Dර",
    flags: "g",
    enabled: true
  },
  {
    name: "Heal Broken Yansaya",
    find: "([\\u0D9A-\\u0DC6])\\u0DCA\\u0DBA",
    replace: "$1්\u200Dය",
    flags: "g",
    enabled: true
  },
  {
    name: "Heal Broken Kshayanna",
    find: "\\u0D9A\\u0DCA\\u0DC2",
    replace: "ක්‍ෂ",
    flags: "g",
    enabled: true
  },
  {
    name: "Trim Space Before Pili",
    find: "\\s+([\\u0DCA\\u0DD2\\u0DD3\\u0DD4\\u0DD6\\u0DDA\\u0DDC\\u0DDD\\u0DCF])",
    replace: "$1",
    flags: "g",
    enabled: true
  }
];

export default function RegexPlaygroundTab({
  inputText,
  setInputText,
  triggerToast
}: RegexPlaygroundTabProps) {
  const [sandboxText, setSandboxText] = useState(
    inputText || "ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය. විද්‍යාව සහ තාක්ෂණය දියුණු විය යුතුයි."
  );

  const [activeFind, setActiveFind] = useState("([\\u0D9A-\\u0DC6])\\u0DCA\\u0DBB");
  const [activeReplace, setActiveReplace] = useState("$1්\u200Dර");
  const [activeFlags, setActiveFlags] = useState("g");
  const [copiedResult, setCopiedResult] = useState(false);

  const [ruleList, setRuleList] = useState<CustomRule[]>([
    {
      id: "rule-1",
      name: "Heal Rakaaransaya ZWJ",
      find: "([\\u0D9A-\\u0DC6])\\u0DCA\\u0DBB",
      replace: "$1්\u200Dර",
      flags: "g",
      enabled: true
    },
    {
      id: "rule-2",
      name: "Clean Double Pili",
      find: "([ි්ුා])\\1+",
      replace: "$1",
      flags: "g",
      enabled: true
    }
  ]);

  // Real-time calculation of single regex results
  const singleRegexResult = useMemo(() => {
    if (!sandboxText || !activeFind) return { output: sandboxText, matches: 0, error: null };
    try {
      const re = new RegExp(activeFind, activeFlags);
      const matches = (sandboxText.match(re) || []).length;
      const output = sandboxText.replace(re, activeReplace);
      return { output, matches, error: null };
    } catch (err: any) {
      return { output: sandboxText, matches: 0, error: err.message };
    }
  }, [sandboxText, activeFind, activeReplace, activeFlags]);

  // Multi-rule cascade execution
  const multiRuleResult = useMemo(() => {
    let current = sandboxText;
    let totalReplacements = 0;

    for (const rule of ruleList) {
      if (!rule.enabled || !rule.find) continue;
      try {
        const re = new RegExp(rule.find, rule.flags || "g");
        const count = (current.match(re) || []).length;
        if (count > 0) {
          totalReplacements += count;
          current = current.replace(re, rule.replace);
        }
      } catch {
        // Skip invalid rule
      }
    }
    return { output: current, totalReplacements };
  }, [sandboxText, ruleList]);

  const loadPreset = (preset: typeof PRESET_RULES[0]) => {
    setActiveFind(preset.find);
    setActiveReplace(preset.replace);
    setActiveFlags(preset.flags);
    triggerToast(`Loaded preset: "${preset.name}"`);
  };

  const addCurrentRuleToList = () => {
    if (!activeFind) return;
    const newRule: CustomRule = {
      id: `rule-${Date.now()}`,
      name: `Rule ${ruleList.length + 1}`,
      find: activeFind,
      replace: activeReplace,
      flags: activeFlags,
      enabled: true
    };
    setRuleList([...ruleList, newRule]);
    triggerToast("Rule added to batch list!");
  };

  const toggleRule = (id: string) => {
    setRuleList(ruleList.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const removeRule = (id: string) => {
    setRuleList(ruleList.filter(r => r.id !== id));
    triggerToast("Rule removed.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    triggerToast("Copied result to clipboard!");
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const applyToMainEditor = (text: string) => {
    setInputText(text);
    triggerToast("Applied output text directly to main editor!");
  };

  const exportRulesJson = () => {
    const jsonStr = JSON.stringify(ruleList, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sinhala_regex_rules.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("Exported custom rules as JSON file!");
  };

  return (
    <div id="regex-rule-playground" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Sinhala Regex & Batch Rule Sandbox
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Test advanced regex patterns, heal Unicode anomalies, and build custom multi-step Sinhala transformation pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSandboxText(inputText)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            Sync Main Input
          </button>
          <button
            onClick={exportRulesJson}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Rules
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Regex Editor & Presets */}
        <div className="lg:col-span-6 space-y-5">
          {/* Active Regex Tool */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Pattern Matcher
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                {singleRegexResult.matches} match{singleRegexResult.matches === 1 ? "" : "es"}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Search Regex Pattern (Find)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">/</span>
                    <input
                      type="text"
                      value={activeFind}
                      onChange={(e) => setActiveFind(e.target.value)}
                      placeholder="e.g. ([\\u0D9A-\\u0DC6])\\u0DCA\\u0DBB"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="w-20 relative">
                    <span className="absolute left-2.5 top-2.5 text-xs text-slate-500 font-mono">/</span>
                    <input
                      type="text"
                      value={activeFlags}
                      onChange={(e) => setActiveFlags(e.target.value)}
                      placeholder="g"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-6 pr-2 py-2 text-xs font-mono text-yellow-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                {singleRegexResult.error && (
                  <p className="text-[10px] text-rose-400 mt-1 font-mono">
                    ⚠️ {singleRegexResult.error}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Replacement String (Supports $1, $2 capture groups)
                </label>
                <input
                  type="text"
                  value={activeReplace}
                  onChange={(e) => setActiveReplace(e.target.value)}
                  placeholder="e.g. $1්‍ර"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={addCurrentRuleToList}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Batch Pipeline
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Sinhala Typography Quick Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_RULES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(preset)}
                  className="text-left p-2.5 rounded-xl bg-slate-950/50 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 block">
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block truncate mt-0.5">
                    /{preset.find}/ → "{preset.replace}"
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Multi-step Pipeline List */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Stacked Pipeline Rules ({ruleList.length})
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {multiRuleResult.totalReplacements} total transformations
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {ruleList.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    rule.enabled
                      ? "bg-slate-950/70 border-white/10"
                      : "bg-slate-950/30 border-white/5 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="rounded accent-blue-600 cursor-pointer"
                    />
                    <div className="truncate">
                      <span className="text-xs font-medium text-slate-200 block truncate">
                        {rule.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate block">
                        /{rule.find}/ → "{rule.replace}"
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Testing Input & Output Preview */}
        <div className="lg:col-span-6 space-y-5">
          {/* Sandbox Text Input */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Sandbox Test Input
              </label>
              <button
                onClick={() => setSandboxText("")}
                className="text-[10px] text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
            <textarea
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              rows={4}
              placeholder="Paste Sinhala text to test pattern transformations..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs font-sans text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Active Single Regex Output */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Single Pattern Output
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyToClipboard(singleRegexResult.output)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  Copy
                </button>
                <button
                  onClick={() => applyToMainEditor(singleRegexResult.output)}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  Use in App
                </button>
              </div>
            </div>
            <div className="bg-slate-950/90 border border-white/10 rounded-xl p-3.5 min-h-[70px] text-xs font-sans text-slate-200 whitespace-pre-wrap leading-relaxed">
              {singleRegexResult.output || <span className="opacity-40 italic">Output will appear here...</span>}
            </div>
          </div>

          {/* Multi-Rule Cascade Output */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Pipeline Cascade Output (All Stacked Rules)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyToClipboard(multiRuleResult.output)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-emerald-400" />
                  Copy
                </button>
                <button
                  onClick={() => applyToMainEditor(multiRuleResult.output)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  Use in App
                </button>
              </div>
            </div>
            <div className="bg-slate-950/90 border border-emerald-500/20 rounded-xl p-3.5 min-h-[90px] text-xs font-sans text-emerald-100 whitespace-pre-wrap leading-relaxed">
              {multiRuleResult.output || <span className="opacity-40 italic">Pipeline output will appear here...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
