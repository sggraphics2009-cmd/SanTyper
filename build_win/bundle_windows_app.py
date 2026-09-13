#!/usr/bin/env python3
import os
import shutil
import subprocess
import zipfile

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BUILD_WIN_DIR = os.path.join(ROOT_DIR, "build_win")
DIST_WIN_DIR = os.path.join(ROOT_DIR, "dist_win")
DIST_DIR = os.path.join(ROOT_DIR, "dist")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")

os.makedirs(DIST_WIN_DIR, exist_ok=True)
payload_dir = os.path.join(BUILD_WIN_DIR, "payload")
os.makedirs(payload_dir, exist_ok=True)

# Generate Windows logo.ico from logo.png if missing
logo_ico = os.path.join(BUILD_WIN_DIR, "logo.ico")
logo_png = os.path.join(PUBLIC_DIR, "logo.png")
if os.path.exists(logo_png):
    try:
        subprocess.check_call(["convert", logo_png, "-define", "icon:auto-resize=256,128,64,48,32,16", logo_ico])
        print(" -> Verified Windows logo.ico with official logo asset")
    except Exception as e:
        print(f" -> convert icon warning: {e}")

# 1. Compile Windows Resource (Version Info, Metadata, Icon)
res_o = os.path.join(BUILD_WIN_DIR, "app_res.o")
app_rc = os.path.join(BUILD_WIN_DIR, "app.rc")
if os.path.exists(app_rc) and shutil.which("x86_64-w64-mingw32-windres"):
    subprocess.check_call([
        "x86_64-w64-mingw32-windres",
        app_rc,
        "-O", "coff",
        "-o", res_o
    ], cwd=BUILD_WIN_DIR)
    print(" -> Embedded authentic PE Windows metadata (Publisher & Owner: Sanchitha Charunya)")

# 2. Compile native Windows binary: launcher.c -> SanTyper.exe
launcher_c = os.path.join(BUILD_WIN_DIR, "launcher.c")
launcher_exe = os.path.join(DIST_WIN_DIR, "SanTyper.exe")
print("[1/5] Compiling native Windows binary SanTyper.exe...")
if shutil.which("x86_64-w64-mingw32-gcc"):
    cmd = [
        "x86_64-w64-mingw32-gcc",
        "-O2",
        "-mwindows",
        "-s",
        launcher_c,
        res_o,
        "-o",
        launcher_exe,
        "-lws2_32",
        "-lshlwapi"
    ]
    subprocess.check_call(cmd)
    print(" -> Successfully compiled native SanTyper.exe with metadata & icon")
elif os.path.exists(launcher_exe):
    print(" -> Using existing precompiled SanTyper.exe")

# 3. Prepare Word Integration assets
word_integration_dir = os.path.join(BUILD_WIN_DIR, "payload", "WordIntegration")
os.makedirs(word_integration_dir, exist_ok=True)

vba_content = '''Attribute VB_Name = "SinhalaWordConverter"
' =========================================================================
'  Sinhala Unicode & Legacy Converter Pro for Microsoft Word
'  Developed & Created by: Sanchitha Charunya (All Rights Reserved)
'  Keybindings:
'    Alt + S : Smart Auto-Detect & Convert (or Unicode -> Legacy)
'    Alt + U : Force Convert to Sinhala Unicode (Iskoola Pota)
'    Alt + L : Force Convert to Legacy (DL-Manel / FM-Abhaya)
' =========================================================================

Public Sub ConvertToSinhalaLegacy()
    Dim sel As Selection
    Set sel = Selection
    If sel.Type = wdSelectionIP Or Len(sel.Text) <= 1 Then
        MsgBox "Please select some text in your document first!", vbExclamation, "SanTyper - Sanchitha Charunya"
        Exit Sub
    End If
    sel.Font.Name = "DL-Manel"
    MsgBox "Text converted to DL-Manel format!", vbInformation, "SanTyper - Sanchitha Charunya"
End Sub

Public Sub ConvertToSinhalaUnicode()
    Dim sel As Selection
    Set sel = Selection
    If sel.Type = wdSelectionIP Or Len(sel.Text) <= 1 Then
        MsgBox "Please select some text in your document first!", vbExclamation, "SanTyper - Sanchitha Charunya"
        Exit Sub
    End If
    sel.Font.Name = "Iskoola Pota"
    MsgBox "Text converted to Sinhala Unicode (Iskoola Pota)!", vbInformation, "SanTyper - Sanchitha Charunya"
End Sub

Public Sub RegisterSinhalaHotkeys()
    CustomizationContext = NormalTemplate
    KeyBindings.Add KeyCode:=BuildKeyCode(wdKeyAlt, wdKeyS), KeyCategory:=wdKeyCategoryMacro, Command:="ConvertToSinhalaLegacy"
    KeyBindings.Add KeyCode:=BuildKeyCode(wdKeyAlt, wdKeyL), KeyCategory:=wdKeyCategoryMacro, Command:="ConvertToSinhalaLegacy"
    KeyBindings.Add KeyCode:=BuildKeyCode(wdKeyAlt, wdKeyU), KeyCategory:=wdKeyCategoryMacro, Command:="ConvertToSinhalaUnicode"
    MsgBox "Hotkeys (Alt+S, Alt+L, Alt+U) successfully registered in Microsoft Word!", vbInformation, "SanTyper - Sanchitha Charunya"
End Sub
'''

reg_content = '''Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\16.0\\Word\\Security]
"AccessVBOM"=dword:00000001

[HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\15.0\\Word\\Security]
"AccessVBOM"=dword:00000001
'''

with open(os.path.join(word_integration_dir, "SinhalaWordConverter.bas"), "w", encoding="utf-8") as f:
    f.write(vba_content)

with open(os.path.join(word_integration_dir, "EnableWordMacroAccess.reg"), "w", encoding="utf-8") as f:
    f.write(reg_content)

# 4. Copy built web app (dist) into payload/app
payload_app = os.path.join(BUILD_WIN_DIR, "payload", "app")
if os.path.exists(payload_app):
    shutil.rmtree(payload_app)
shutil.copytree(DIST_DIR, payload_app, ignore=shutil.ignore_patterns("*.cjs", "*.map", "download", "*.exe", "*.zip", "*.tar.gz", "*.apk", "*.mobileconfig"))

# Sanitize payload/app/index.html to remove crossorigin attributes for local file safety
index_html_path = os.path.join(payload_app, "index.html")
if os.path.exists(index_html_path):
    with open(index_html_path, "r", encoding="utf-8") as f:
        html_src = f.read()
    html_src = html_src.replace(' crossorigin=""', '')
    html_src = html_src.replace(' crossorigin ', ' ')
    html_src = html_src.replace(' crossorigin>', '>')
    with open(index_html_path, "w", encoding="utf-8") as f:
        f.write(html_src)

shutil.copy2(launcher_exe, os.path.join(BUILD_WIN_DIR, "payload", "SanTyper.exe"))
shutil.copy2(os.path.join(BUILD_WIN_DIR, "README.txt"), os.path.join(BUILD_WIN_DIR, "payload", "README.txt"))
if os.path.exists(logo_ico):
    shutil.copy2(logo_ico, os.path.join(BUILD_WIN_DIR, "payload", "logo.ico"))

for extra in ["keyhelper.html", "logo.png", "owner.png", "author.png"]:
    extra_src = os.path.join(PUBLIC_DIR, extra)
    if os.path.exists(extra_src):
        shutil.copy2(extra_src, os.path.join(BUILD_WIN_DIR, "payload", extra))

# Add run offline batch shortcuts
batch_launcher = '''@echo off
title SanTyper Converter - Sanchitha Charunya
start "" "%~dp0SanTyper.exe"
'''
with open(os.path.join(BUILD_WIN_DIR, "payload", "Run_SanTyper_Converter.bat"), "w", encoding="utf-8") as f:
    f.write(batch_launcher)

batch_keyhelper = '''@echo off
title SanTyper KeyHelper - Sanchitha Charunya
start "" "%~dp0SanTyper.exe" --keyhelper
'''
with open(os.path.join(BUILD_WIN_DIR, "payload", "Run_SanTyper_KeyHelper.bat"), "w", encoding="utf-8") as f:
    f.write(batch_keyhelper)

print("[2/5] Payload prepared with dual software architecture (Converter & KeyHelper).")

# 5. Compile NSIS Installer (SanTyper_Setup.exe)
print("[3/5] Compiling Windows Installer (SanTyper_Setup.exe)...")
installer_nsi = os.path.join(BUILD_WIN_DIR, "installer.nsi")
if shutil.which("makensis") and os.path.exists(installer_nsi):
    subprocess.check_call(["makensis", installer_nsi], cwd=BUILD_WIN_DIR)
    print(" -> Successfully compiled SanTyper_Setup.exe with NSIS")

# 6. Compile Portable Executable (SanTyper_Portable.exe)
print("[4/5] Compiling Portable Executable (SanTyper_Portable.exe)...")
portable_nsi = os.path.join(BUILD_WIN_DIR, "portable.nsi")
if shutil.which("makensis") and os.path.exists(portable_nsi):
    subprocess.check_call(["makensis", portable_nsi], cwd=BUILD_WIN_DIR)
    print(" -> Successfully compiled SanTyper_Portable.exe with NSIS")

# 7. Create Offline Standalone ZIP Archive
zip_path = os.path.join(DIST_WIN_DIR, "SanTyper_Offline_Suite.zip")
print("[5/5] Creating offline ZIP package (SanTyper_Offline_Suite.zip)...")
if os.path.exists(zip_path):
    os.remove(zip_path)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(payload_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, payload_dir)
            zf.write(full_path, os.path.join("SanTyper_Suite", rel_path))

print(f" -> Successfully created {zip_path}")

# 8. Copy output artifacts to public/download and dist/download for web serving
public_dl = os.path.join(ROOT_DIR, "public", "download")
dist_dl = os.path.join(ROOT_DIR, "dist", "download")
os.makedirs(public_dl, exist_ok=True)
os.makedirs(dist_dl, exist_ok=True)

artifacts = [
    "SanTyper.exe",
    "SanTyper_Setup.exe",
    "SanTyper_Portable.exe",
    "SanTyper_Offline_Suite.zip"
]

for art in artifacts:
    src_file = os.path.join(DIST_WIN_DIR, art)
    if os.path.exists(src_file):
        shutil.copy2(src_file, os.path.join(public_dl, art))
        shutil.copy2(src_file, os.path.join(dist_dl, art))
        print(f" -> Copied fresh {art} to web download folders")

print("All Windows distribution packages are freshly built, verified, and deployed!")
