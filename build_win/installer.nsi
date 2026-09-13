; =========================================================================
;  SanTyper Pro Suite - NSIS Modern Installer Script
;  Lead Architect, Developer & Owner: Sanchitha Charunya
;  Copyright (C) 2026 Sanchitha Charunya. All Rights Reserved.
;  100% Safe, Legal, Authentic & Verified Desktop Application
; =========================================================================

!define APP_NAME "SanTyper Suite"
!define APP_FULL_NAME "SanTyper Pro & Sinhala Font Converter Suite"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "Sanchitha Charunya"
!define APP_COPYRIGHT "Copyright (C) 2026 Sanchitha Charunya. All Rights Reserved."

Name "${APP_FULL_NAME}"
OutFile "../dist_win/SanTyper_Setup.exe"
InstallDir "$LOCALAPPDATA\SanTyper"
InstallDirRegKey HKCU "Software\SanTyper" "Install_Dir"
RequestExecutionLevel user
SetCompressor /SOLID lzma

; Version Information for Windows Properties
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "SanTyper Pro Suite"
VIAddVersionKey "Comments" "SanTyper & Sinhala Font Converter Pro - Offline Suite by Sanchitha Charunya"
VIAddVersionKey "CompanyName" "Sanchitha Charunya"
VIAddVersionKey "LegalCopyright" "Copyright (C) 2026 Sanchitha Charunya. All Rights Reserved."
VIAddVersionKey "FileDescription" "SanTyper Pro Suite Setup - Developed by Sanchitha Charunya"
VIAddVersionKey "FileVersion" "1.0.0.0"
VIAddVersionKey "LegalTrademarks" "SanTyper is an authentic software developed by Sanchitha Charunya"
VIAddVersionKey "OriginalFilename" "SanTyper_Setup.exe"

; Interface Settings
!include "MUI2.nsh"

!define MUI_ICON "logo.ico"
!define MUI_UNICON "logo.ico"
!define MUI_ABORTWARNING
!define MUI_UNABORTWARNING

; Welcome page
!define MUI_WELCOMEPAGE_TITLE "Welcome to ${APP_FULL_NAME}"
!define MUI_WELCOMEPAGE_TEXT "Setup will install SanTyper Converter and SanTyper KeyHelper on your computer.\r\n\r\nLead Architect & Owner: Sanchitha Charunya\r\n\r\n100% Safe & Verified Software Suite.\r\nClick Next to continue."
!insertmacro MUI_PAGE_WELCOME

; Directory page
!insertmacro MUI_PAGE_DIRECTORY

; Instfiles page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\SanTyper.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch SanTyper Converter Now"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language
!insertmacro MUI_LANGUAGE "English"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite try

  ; Copy Core Native Launcher & KeyHelper Suite
  File "../dist_win/SanTyper.exe"
  File "logo.ico"
  File "README.txt"
  File "payload\keyhelper.html"
  File "payload\logo.png"
  File "payload\Run_SanTyper_Converter.bat"
  File "payload\Run_SanTyper_KeyHelper.bat"

  ; Copy Web App Assets
  SetOutPath "$INSTDIR\app"
  File /r "payload\app\*.*"

  ; Copy Word Integrations
  SetOutPath "$INSTDIR\WordIntegration"
  File "payload/WordIntegration/SinhalaWordConverter.bas"
  File "payload/WordIntegration/EnableWordMacroAccess.reg"

  ; Write Registry values
  WriteRegStr HKCU "Software\SanTyper" "Install_Dir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SanTyper" "DisplayName" "${APP_FULL_NAME} by ${APP_PUBLISHER}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SanTyper" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SanTyper" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SanTyper" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SanTyper" "DisplayIcon" '"$INSTDIR\SanTyper.exe",0'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SanTyper" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SanTyper" "NoRepair" 1

  ; Create Uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"

  ; Create Shortcuts (Dual: Converter & KeyHelper)
  CreateDirectory "$SMPROGRAMS\SanTyper Suite"
  CreateShortcut "$SMPROGRAMS\SanTyper Suite\SanTyper Converter.lnk" "$INSTDIR\SanTyper.exe" "" "$INSTDIR\SanTyper.exe" 0
  CreateShortcut "$SMPROGRAMS\SanTyper Suite\SanTyper KeyHelper.lnk" "$INSTDIR\SanTyper.exe" "--keyhelper" "$INSTDIR\SanTyper.exe" 0
  CreateShortcut "$SMPROGRAMS\SanTyper Suite\Word Integration Guide.lnk" "$INSTDIR\WordIntegration"
  CreateShortcut "$SMPROGRAMS\SanTyper Suite\Uninstall SanTyper.lnk" "$INSTDIR\uninstall.exe"

  ; Desktop Shortcuts
  CreateShortcut "$DESKTOP\SanTyper Converter.lnk" "$INSTDIR\SanTyper.exe" "" "$INSTDIR\SanTyper.exe" 0
  CreateShortcut "$DESKTOP\SanTyper KeyHelper.lnk" "$INSTDIR\SanTyper.exe" "--keyhelper" "$INSTDIR\SanTyper.exe" 0
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\SanTyper Converter.lnk"
  Delete "$DESKTOP\SanTyper KeyHelper.lnk"
  Delete "$SMPROGRAMS\SanTyper Suite\*.*"
  RMDir "$SMPROGRAMS\SanTyper Suite"

  RMDir /r "$INSTDIR\app"
  RMDir /r "$INSTDIR\WordIntegration"
  Delete "$INSTDIR\SanTyper.exe"
  Delete "$INSTDIR\logo.ico"
  Delete "$INSTDIR\README.txt"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"

  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SanTyper"
  DeleteRegKey HKCU "Software\SanTyper"
SectionEnd
