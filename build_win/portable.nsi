; =========================================================================
;  SanTyper Pro Suite - Portable Edition NSIS Script
;  Lead Architect, Developer & Owner: Sanchitha Charunya
;  Copyright (C) 2026 Sanchitha Charunya. All Rights Reserved.
;  100% Safe, Legal, Authentic & Verified Portable Application
; =========================================================================

!define APP_NAME "SanTyper Portable"
Name "SanTyper Portable - Sanchitha Charunya"
OutFile "../dist_win/SanTyper_Portable.exe"
RequestExecutionLevel user
SilentInstall silent
SetCompressor /SOLID lzma

; Version Information for Windows Properties
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "SanTyper Pro Portable"
VIAddVersionKey "Comments" "SanTyper & Sinhala Font Converter Pro - Portable Suite by Sanchitha Charunya"
VIAddVersionKey "CompanyName" "Sanchitha Charunya"
VIAddVersionKey "LegalCopyright" "Copyright (C) 2026 Sanchitha Charunya. All Rights Reserved."
VIAddVersionKey "FileDescription" "SanTyper Pro Portable - Developed by Sanchitha Charunya"
VIAddVersionKey "FileVersion" "1.0.0.0"
VIAddVersionKey "OriginalFilename" "SanTyper_Portable.exe"

Icon "logo.ico"

Section "Portable"
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
  File /r "payload\*.*"
  ExecWait '"$PLUGINSDIR\SanTyper.exe"'
SectionEnd
