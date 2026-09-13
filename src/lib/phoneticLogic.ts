// High-accuracy Singlish (Phonetic Latin) to Sinhala Unicode transliterator
// Compiled based on standard phonetic guidelines for typing Sinhala online

const PHONETIC_DIFFERENCES = [
  // Special combinations
  { key: "nndh", value: "ඳ" },
  { key: "nnd", value: "ඬ" },
  { key: "nng", value: "ඟ" },
  { key: "mmb", value: "ඹ" },
  
  // Aspirated/Special consonants (dual character representations)
  { key: "shh", value: "ෂ" },
  { key: "zh", value: "ළ" },
  { key: "sh", value: "ශ" },
  { key: "ch", value: "ච" },
  { key: "Ch", value: "ඡ" },
  { key: "kh", value: "ඛ" },
  { key: "Kh", value: "ඛ" },
  { key: "gh", value: "ඝ" },
  { key: "Gh", value: "ඝ" },
  { key: "th", value: "ත" },
  { key: "Th", value: "ථ" },
  { key: "dh", value: "ද" },
  { key: "Dh", value: "ධ" },
  { key: "ph", value: "ඵ" },
  { key: "Ph", value: "ඵ" },
  { key: "bh", value: "භ" },
  { key: "Bh", value: "භ" },
  { key: "Jh", value: "ඣ" },
  { key: "jh", value: "ඣ" },
  { key: "gn", value: "ඥ" },
  { key: "kn", value: "ඥ" },
  
  // Standard consonants
  { key: "k", value: "ක" },
  { key: "K", value: "ඛ" },
  { key: "g", value: "ග" },
  { key: "G", value: "ඝ" },
  { key: "j", value: "ජ" },
  { key: "J", value: "ඣ" },
  { key: "t", value: "ත" },
  { key: "T", value: "ට" },
  { key: "d", value: "ද" },
  { key: "D", value: "ඩ" },
  { key: "n", value: "න" },
  { key: "N", value: "ණ" },
  { key: "p", value: "ප" },
  { key: "P", value: "ඵ" },
  { key: "b", value: "බ" },
  { key: "B", value: "භ" },
  { key: "m", value: "ම" },
  { key: "M", value: "ම" },
  { key: "y", value: "ය" },
  { key: "Y", value: "ය" },
  { key: "r", value: "ර" },
  { key: "R", value: "ඍ" },
  { key: "l", value: "ල" },
  { key: "L", value: "ළ" },
  { key: "v", value: "ව" },
  { key: "V", value: "ව" },
  { key: "w", value: "ව" },
  { key: "W", value: "ව" },
  { key: "s", value: "ස" },
  { key: "S", value: "ශ" },
  { key: "h", value: "හ" },
  { key: "H", value: "හ" },
  { key: "f", value: "ෆ" },
  { key: "F", value: "ෆ" },
  { key: "x", value: "ඞ" }, // rare nasal sound
];

const VOWEL_MODIFIERS: { [key: string]: string } = {
  "aae": "ෑ",
  "ae": "ැ",
  "aa": "ා",
  "a": "", // default inherent vowel
  "ii": "ී",
  "i": "ි",
  "uu": "ූ",
  "u": "ු",
  "ee": "ේ",
  "e": "ෙ",
  "oo": "ෝ",
  "o": "ො",
  "ai": "ෛ",
  "au": "ෞ",
  "E": "ේ",
  "O": "ෝ",
  "I": "ී",
  "U": "ූ",
  "A": "ා",
  "R": "ෘ",
};

const INDEPENDENT_VOWELS: { [key: string]: string } = {
  "aae": "ඈ",
  "ae": "ඇ",
  "aa": "ආ",
  "a": "අ",
  "ii": "ඊ",
  "i": "ඉ",
  "uu": "ඌ",
  "u": "උ",
  "ee": "ඒ",
  "e": "එ",
  "oo": "ඕ",
  "o": "ඔ",
  "ai": "ඓ",
  "au": "ඖ",
  "E": "ඒ",
  "O": "ඔ",
  "I": "ඉ",
  "U": "උ",
  "A": "ආ",
  "R": "ඍ"
};

// Transliterate function that converts phonetic typing into modern Sinhala Unicode
export function phoneticToUnicode(input: string): string {
  if (!input) return "";

  let result = "";
  let i = 0;
  const n = input.length;

  while (i < n) {
    let matched = false;

    // Check for special standalone vowel sounds or at word starts
    if (i === 0 || /\s/.test(input[i - 1])) {
      // Find longest matching standalone vowel
      const possibleVowels = ["aae", "ae", "aa", "ii", "uu", "ee", "oo", "ai", "au", "a", "i", "u", "e", "o", "R"];
      for (const v of possibleVowels) {
        if (input.startsWith(v, i)) {
          result += INDEPENDENT_VOWELS[v];
          i += v.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }

    // Try starting match with a consonant
    let matchedConsonantLength = 0;
    let matchedConsonantValue = "";
    
    for (const entry of PHONETIC_DIFFERENCES) {
      if (input.startsWith(entry.key, i)) {
        matchedConsonantLength = entry.key.length;
        matchedConsonantValue = entry.value;
        break;
      }
    }

    if (matchedConsonantLength > 0) {
      let idx = i + matchedConsonantLength;
      
      // Look ahead for vowel modifier
      let matchedVowel = "";
      const possibleVowelModifiers = ["aae", "ae", "aa", "ii", "uu", "ee", "oo", "ai", "au", "a", "i", "u", "e", "o", "E", "O", "I", "U", "A", "R"];
      
      for (const v of possibleVowelModifiers) {
        if (input.startsWith(v, idx)) {
          matchedVowel = v;
          break;
        }
      }

      if (matchedVowel !== "") {
        // Consonant + Vowel combo
        result += matchedConsonantValue + VOWEL_MODIFIERS[matchedVowel];
        i += matchedConsonantLength + matchedVowel.length;
      } else {
        // Consonant alone -> needs Hal Kirima (ක්/න්/ප් etc)
        // If next char is y/r, we might have joint words like 'py', 'ky' (al-lakunu with yansaya/ra-akaransaya)
        if (input[idx] === "y" && matchedConsonantValue !== "ය") {
          let yVowel = "";
          for (const v of possibleVowelModifiers) {
            if (input.startsWith(v, idx + 1)) {
              yVowel = v;
              break;
            }
          }
          if (yVowel !== "") {
            result += matchedConsonantValue + "්\u200Dය" + VOWEL_MODIFIERS[yVowel];
            i += matchedConsonantLength + 1 + yVowel.length;
          } else {
            result += matchedConsonantValue + "්‍ය"; // yansaya modifier
            i += matchedConsonantLength + 1;
          }
        } else if (input[idx] === "r" && matchedConsonantValue !== "ර") {
          let rVowel = "";
          for (const v of possibleVowelModifiers) {
            if (input.startsWith(v, idx + 1)) {
              rVowel = v;
              break;
            }
          }
          if (rVowel !== "") {
            const modifier = (rVowel === "ee" && matchedConsonantValue === "ශ") ? "ී" : VOWEL_MODIFIERS[rVowel];
            result += matchedConsonantValue + "්\u200Dර" + modifier;
            i += matchedConsonantLength + 1 + rVowel.length;
          } else {
            result += matchedConsonantValue + "්‍ර"; // ra-akaransaya modifier
            i += matchedConsonantLength + 1;
          }
        } else {
          // If followed by nothing or another consonant, add the hal-kirima (al-lakuna)
          // except if it is a space, symbol or number
          const nextChar = input[idx];
          const isWordBoundaryOrSymbol = !nextChar || /\s|[0-9]|[.,!@#%^&*()_+-=\[\]{};':"\\|,.<>\/?~`]/.test(nextChar);
          
          if (isWordBoundaryOrSymbol) {
            result += matchedConsonantValue + "්";
          } else {
            result += matchedConsonantValue + "්";
          }
          i += matchedConsonantLength;
        }
      }
      continue;
    }

    // Standalone vowel combinations that did not match at the start of a word
    const standaloneVowelModifiers = ["aae", "ae", "aa", "ii", "uu", "ee", "oo", "ai", "au", "a", "i", "u", "e", "o", "R"];
    for (const v of standaloneVowelModifiers) {
      if (input.startsWith(v, i)) {
        result += INDEPENDENT_VOWELS[v] || VOWEL_MODIFIERS[v] || "";
        i += v.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Default: append char unchanged (spaces, punctuation, digits)
    result += input[i];
    i++;
  }

  // Final cleanup of redundant hal-kirimas or spaces
  return result;
}

const SINHALA_LEXICON: { singlish: string; sinhala: string }[] = [
  { singlish: "amma", sinhala: "අම්මා" },
  { singlish: "ammathe", sinhala: "අම්මාට" },
  { singlish: "thaththa", sinhala: "තාත්තා" },
  { singlish: "ayubowan", sinhala: "ආයුබෝවන්" },
  { singlish: "api", sinhala: "අපි" },
  { singlish: "oba", sinhala: "ඔබ" },
  { singlish: "oyata", sinhala: "ඔයාට" },
  { singlish: "oyaa", sinhala: "ඔයා" },
  { singlish: "oya", sinhala: "ඔයා" },
  { singlish: "singhala", sinhala: "සිංහල" },
  { singlish: "sinhala", sinhala: "සිංහල" },
  { singlish: "lanka", sinhala: "ලංකා" },
  { singlish: "sri lanka", sinhala: "ශ්‍රී ලංකා" },
  { singlish: "sthuthi", sinhala: "ස්තූතියි" },
  { singlish: "isthuthi", sinhala: "ස්තූතියි" },
  { singlish: "puluwan", sinhala: "පුළුවන්" },
  { singlish: "karanna", sinhala: "කරන්න" },
  { singlish: "weda", sinhala: "වැඩ" },
  { singlish: "hoda", sinhala: "හොඳ" },
  { singlish: "lassana", sinhala: "ලස්සන" },
  { singlish: "godak", sinhala: "ගොඩක්" },
  { singlish: "wisthara", sinhala: "විස්තර" },
  { singlish: "subha", sinhala: "සුභ" },
  { singlish: "mithraya", sinhala: "මිත්‍රයා" },
  { singlish: "sathutu", sinhala: "සතුටු" },
  { singlish: "adara", sinhala: "ආදරය" },
  { singlish: "awurudu", sinhala: "අවුරුද්ද" },
  { singlish: "rata", sinhala: "රට" },
  { singlish: "kathawa", sinhala: "කතාව" },
  { singlish: "denna", sinhala: "දෙන්න" },
  { singlish: "ganna", sinhala: "ගන්න" },
  { singlish: "salli", sinhala: "සල්ලි" },
  { singlish: "mokakda", sinhala: "මොකක්ද" },
  { singlish: "kama", sinhala: "කෑම" },
  { singlish: "wathura", sinhala: "වතුර" },
  { singlish: "mal", sinhala: "මල්" },
  { singlish: "gamana", sinhala: "ගමන" },
  { singlish: "subha dawsak", sinhala: "සුභ දවසක්" },
  { singlish: "moka", sinhala: "මොකක්ද" },
  { singlish: "oyalage", sinhala: "ඔයාලගේ" },
  { singlish: "ape", sinhala: "අපේ" },
  { singlish: "mage", sinhala: "මගේ" },
  { singlish: "janaraja", sinhala: "ජනරජය" },
  { singlish: "sri", sinhala: "ශ්‍රී" },
  { singlish: "shri", sinhala: "ශ්‍රී" },
  { singlish: "prabhu", sinhala: "ප්‍රභූ" },
  { singlish: "dharma", sinhala: "ධර්ම" },
  { singlish: "budu", sinhala: "බුදු" },
  { singlish: "sadhu", sinhala: "සාදු" },
  { singlish: "katharagama", sinhala: "කතරගම" },
  { singlish: "colombo", sinhala: "කොළඹ" },
  { singlish: "kandy", sinhala: "මහනුවර" },
  { singlish: "kohomada", sinhala: "කොහොමද" },
  { singlish: "machan", sinhala: "මචන්" },
  { singlish: "ne", sinhala: "නෑ" },
  { singlish: "nae", sinhala: "නෑ" },
  { singlish: "naa", sinhala: "නා" },
  { singlish: "halo", sinhala: "හෙලෝ" },
  { singlish: "hello", sinhala: "හෙලෝ" },
  { singlish: "subha rathriyak", sinhala: "සුභ රාත්‍රියක්" },
  { singlish: "kauda", sinhala: "කවුද" },
  { singlish: "elakiri", sinhala: "එළකිරි" },
  { singlish: "naha", sinhala: "නැහැ" },
  { singlish: "nahe", sinhala: "නැහැ" },
  { singlish: "kiyanna", sinhala: "කියන්න" },
  { singlish: "liyanna", sinhala: "ලියන්න" },
];

export function getPhoneticSuggestions(input: string): string[] {
  if (!input) return [];
  
  const cleanInput = input.toLowerCase().trim();
  const directTransliteration = phoneticToUnicode(cleanInput);
  
  const suggestionsSet = new Set<string>();
  
  // 1. Look for exact matches in our common dictionary first to prioritize natural spelling
  const exactMatch = SINHALA_LEXICON.find(item => item.singlish === cleanInput);
  if (exactMatch) {
    suggestionsSet.add(exactMatch.sinhala);
  }

  // 2. Add direct phonetic transliteration
  if (directTransliteration) {
    suggestionsSet.add(directTransliteration);
  }
  
  // 3. Look for prefixes starting with the typed keys
  const prefixMatches = SINHALA_LEXICON.filter(item => 
    item.singlish.startsWith(cleanInput) && 
    item.singlish !== cleanInput
  );
  
  for (const match of prefixMatches) {
    suggestionsSet.add(match.sinhala);
  }
  
  // 4. Generate some logical vocal adjustments (e.g. adding 'aa', 'a', 'ya', etc.)
  const modifiers = ["a", "aa", "ya", "la"];
  for (const mod of modifiers) {
    if (suggestionsSet.size >= 8) break;
    const adjusted = phoneticToUnicode(cleanInput + mod);
    if (adjusted && adjusted !== directTransliteration) {
      suggestionsSet.add(adjusted);
    }
  }

  // 5. Look for matching substrings if we still have space
  if (suggestionsSet.size < 6) {
    const substringMatches = SINHALA_LEXICON.filter(item => 
      item.singlish.includes(cleanInput) && 
      !item.singlish.startsWith(cleanInput)
    );
    for (const match of substringMatches) {
      suggestionsSet.add(match.sinhala);
      if (suggestionsSet.size >= 8) break;
    }
  }
  
  return Array.from(suggestionsSet).slice(0, 8);
}
