# Sinhala Font Converter & Word Pro Suite

**Author & Lead Architect:** Sanchitha Charunya  
**Copyright:** © 2026 Sanchitha Charunya. All Rights Reserved.  
**Version:** 1.0.0  
**License:** Proprietary — Created & Maintained Exclusively by Sanchitha Charunya.

---

## 📖 Overview

**Sinhala Font Converter & Word Pro Suite** is a state-of-the-art, high-performance Sinhala typography engine and conversion platform developed by **Sanchitha Charunya**. Designed specifically for Sri Lankan graphic designers, authors, typographers, legal professionals, and digital publishing studios, this platform provides bidirectional conversion between modern Sinhala Unicode (such as *Iskoola Pota*, *Nirmala UI*) and legacy non-Unicode ANSI typography formats (including *DL-Manel*, *FM-Abhaya*, *Apex*, *Thibus*, and *Singlish* phonetics).

---

## 🌟 Key Features

### 1. High-Accuracy Bidirectional Font Converter
- **Unicode ↔ Legacy (DL-Series, FM-Abhaya, Apex, Thibus):** Flawless glyph reordering handling complex character clusters (e.g., *combining kombuwa*, *al-lakuna*, *repaya*, *kombu-hawa*, and *yansaya* conjuncts).
- **Phonetic Singlish Input:** Real-time transliteration engine converting Latin phonetic phonemes directly into rich Sinhala script.
- **Bi-directional Live Preview:** Interactive real-time canvas rendering both Unicode typography and legacy font representations simultaneously.
- **Smart Font Adaptive Calibration Studio:** Allows users to teach custom character overrides and glyph combinations directly into persistent local storage.

### 2. Microsoft Word Plug-in Hub (Word Pro Suite)
Directly integrates the conversion engine into Microsoft Word on Windows with native keyboard shortcuts (`Alt + S`, `Alt + U`, `Alt + L`):
- **1-Click Windows Auto-Installer:** PowerShell automated script supporting TLS 1.2, COM automation, and automated Normal.dotm template integration.
- **Downloadable VBA Module (`.bas`):** Standalone `SinhalaWordConverter.bas` file ready to be imported into the Word VBA Developer editor.
- **Office XML Web Add-in Manifest:** Standard Office 365 manifest (`manifest.xml`) for enterprise TaskPane deployment.
- **One-Click Security Registry Fixer:** `EnableWordMacroAccess.reg` automated patch to enable developer macro object model trust.
- **Live Word Simulator:** In-browser sandbox mimicking Word document selection, font swapping, and keystroke triggering.

### 3. Developer & Designer Suite
- **Interactive Glyph Matrix Inspector:** Search and inspect any Sinhala Unicode glyph, unicode codepoints, categories, hex values, and legacy font mappings.
- **Subtitle & Bulk File Processor:** Drag-and-drop converter for `.srt` subtitle files, preserving timecodes, line numbers, and subtitle blocks, as well as `.txt`, `.csv`, and `.json`.
- **Typographic Diagnostic Scanner:** Automated heuristic scanner that detects fragmented matras, disconnected kombuwas, and misplaced diacritics with 1-click auto-repair.
- **Regex & Rule Playground:** Test custom regular expressions against Sinhala text and export rules as portable JSON.
- **Multi-Language Code & SDK Generator:** Generates production-ready copy-paste integration snippets in JavaScript/TypeScript, Python, PHP, C# (.NET), Go, and Java.
- **High-Resolution Vector Banner Designer:** Export styled typographic graphics as SVG vector files or 1200×630 high-definition social sharing PNGs with custom themes.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Installation & Local Run
```bash
# Clone or navigate to the project directory
cd sinhala-font-converter

# Install dependencies
npm install

# Start development server (boots full-stack server on http://localhost:3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```

---

## 🛠️ Architecture & Tech Stack

- **Frontend Core:** React 19, TypeScript, Tailwind CSS, Motion
- **Backend Service:** Express.js with custom REST endpoints for text conversion, `.bas` macro serving, and automated `.ps1` installers
- **Typographic Engine:** Algorithmic regex substitution maps, state-machine cluster parser, and dynamic OpenType metrics
- **Export Engines:** Docx.js (native Microsoft Word document generation), FileSaver.js, and HTML5 Canvas

---

## 📋 Microsoft Word Keyboard Shortcuts

When installed using the Word Plug-in Hub:
- **`Alt + S`**: Smart Auto-Detect & Convert (automatically determines whether selection is Unicode or Legacy and converts to the opposite layout).
- **`Alt + U`**: Force convert selected text to Sinhala Unicode (*Iskoola Pota*).
- **`Alt + L`**: Force convert selected text to Legacy Non-Unicode (*DL-Manel* / *FM-Abhaya*).

---

## 📄 Intellectual Property & Rights

**All rights reserved.**  
This software, its design, conversion algorithms, mappings, and integration scripts were engineered by and are the exclusive intellectual property of **Sanchitha Charunya**.

No part of this software may be claimed, redistributed, or sublicensed without explicit prior written permission from the copyright holder.

**Author:** Sanchitha Charunya  
**Project:** Sinhala Font Converter & Word Pro Suite  
**Year:** 2026
