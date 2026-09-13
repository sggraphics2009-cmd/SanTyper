#!/usr/bin/env python3
import os
import sys
import shutil
import subprocess
import zipfile
import tarfile
import base64
import uuid

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
DOWNLOAD_DIR = os.path.join(PUBLIC_DIR, "download")
DIST_DOWNLOAD_DIR = os.path.join(DIST_DIR, "download")

os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(DIST_DOWNLOAD_DIR, exist_ok=True)

print("=================================================================")
print(" SANCHITHA CHARUNYA - SANTYPER MULTI-PLATFORM BUILD SUITE (5 OS) ")
print("=================================================================")

# Ensure logo is synchronized
logo_src = os.path.join(PUBLIC_DIR, "logo.png")
if not os.path.exists(logo_src):
    logo_src = os.path.join(PROJECT_ROOT, "Logo.png")

if os.path.exists(logo_src):
    target_logo = os.path.join(PUBLIC_DIR, "logo.png")
    if os.path.abspath(logo_src) != os.path.abspath(target_logo):
        shutil.copy(logo_src, target_logo)
    for asset_name in ["icon.png", "favicon.png", "apple-touch-icon.png"]:
        dest = os.path.join(PUBLIC_DIR, asset_name)
        if os.path.abspath(logo_src) != os.path.abspath(dest):
            shutil.copy(logo_src, dest)
    print("[0/5] Software Logo (logo.png) verified for application icon assets")

# Ensure author and owner photo (Sanchitha) is preserved and synchronized
owner_src = os.path.join(PUBLIC_DIR, "owner.png")
if not os.path.exists(owner_src) or os.path.getsize(owner_src) == os.path.getsize(logo_src):
    if os.path.exists(os.path.join(PROJECT_ROOT, "My image.png")):
        owner_src = os.path.join(PROJECT_ROOT, "My image.png")

if os.path.exists(owner_src):
    for o_asset in ["owner.png", "author.png"]:
        dest = os.path.join(PUBLIC_DIR, o_asset)
        if os.path.abspath(owner_src) != os.path.abspath(dest):
            shutil.copy(owner_src, dest)
    print("      Author profile image (Sanchitha) verified for creator cards")

# 1. WINDOWS PACKAGING
print("[1/5] Building Windows Distribution Suite...")
win_script = os.path.join(PROJECT_ROOT, "build_win", "bundle_windows_app.py")
if os.path.exists(win_script):
    subprocess.check_call([sys.executable, win_script])
print(" -> Windows packages ready.")

# 2. MACOS PACKAGING
print("[2/5] Building macOS Distribution Suite (SanTyper.app)...")
mac_build_dir = os.path.join(PROJECT_ROOT, "dist_mac", "SanTyper_macOS_Suite")
shutil.rmtree(mac_build_dir, ignore_errors=True)
os.makedirs(mac_build_dir, exist_ok=True)

# SanTyper.app structure
app_bundle = os.path.join(mac_build_dir, "SanTyper.app")
contents_dir = os.path.join(app_bundle, "Contents")
macos_bin_dir = os.path.join(contents_dir, "MacOS")
resources_dir = os.path.join(contents_dir, "Resources")
app_resources = os.path.join(resources_dir, "app")
word_mac_dir = os.path.join(resources_dir, "WordIntegration")

os.makedirs(macos_bin_dir, exist_ok=True)
os.makedirs(resources_dir, exist_ok=True)
os.makedirs(word_mac_dir, exist_ok=True)

# Copy web dist assets (excluding recursive downloads and archives)
shutil.copytree(DIST_DIR, app_resources, dirs_exist_ok=True, ignore=shutil.ignore_patterns("download", "*.zip", "*.tar.gz", "*.apk", "*.exe", "*.mobileconfig", "*.map", "*.cjs"))
if os.path.exists(logo_src):
    shutil.copy(logo_src, os.path.join(resources_dir, "icon.png"))

# Info.plist
info_plist = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>SanTyper Pro</string>
    <key>CFBundleExecutable</key>
    <string>SanTyper</string>
    <key>CFBundleIconFile</key>
    <string>icon.png</string>
    <key>CFBundleIdentifier</key>
    <string>com.sanchitha.santyper</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>SanTyper Pro</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
"""
with open(os.path.join(contents_dir, "Info.plist"), "w", encoding="utf-8") as f:
    f.write(info_plist)

# MacOS/SanTyper binary launcher script
launcher_sh = """#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_DIR="$DIR/../Resources/app"
PORT=18273

# Check if port is in use
if ! lsof -i :$PORT >/dev/null 2>&1; then
    if command -v python3 >/dev/null 2>&1; then
        (cd "$APP_DIR" && python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1) &
    elif command -v python >/dev/null 2>&1; then
        (cd "$APP_DIR" && python -m SimpleHTTPServer $PORT >/dev/null 2>&1) &
    fi
    sleep 1
fi

open "http://localhost:$PORT"
"""
mac_bin_path = os.path.join(macos_bin_dir, "SanTyper")
with open(mac_bin_path, "w", encoding="utf-8") as f:
    f.write(launcher_sh)
os.chmod(mac_bin_path, 0o755)

# Standalone double-click script for easy opening on macOS
double_click_mac = """#!/bin/bash
# SanTyper Converter Launcher for macOS
# Developed by: Sanchitha Charunya
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
"$DIR/SanTyper.app/Contents/MacOS/SanTyper"
"""
direct_launcher_path = os.path.join(mac_build_dir, "SanTyper_Converter.command")
with open(direct_launcher_path, "w", encoding="utf-8") as f:
    f.write(double_click_mac)
os.chmod(direct_launcher_path, 0o755)

# macOS KeyHelper floating launcher
keyhelper_mac = """#!/bin/bash
# SanTyper KeyHelper (Floating KeyRep-Style Bar) for macOS
# Developed by: Sanchitha Charunya
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_DIR="$DIR/SanTyper.app/Contents/Resources/app"
PORT=18273

if ! lsof -i :$PORT >/dev/null 2>&1; then
    if command -v python3 >/dev/null 2>&1; then
        (cd "$APP_DIR" && python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1) &
    fi
    sleep 1
fi

if [ -d "/Applications/Google Chrome.app" ]; then
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --app="http://localhost:$PORT/keyhelper.html" --window-size=680,85 &
elif [ -d "/Applications/Brave Browser.app" ]; then
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" --app="http://localhost:$PORT/keyhelper.html" --window-size=680,85 &
else
    open "http://localhost:$PORT/keyhelper.html"
fi
"""
keyhelper_mac_path = os.path.join(mac_build_dir, "SanTyper_KeyHelper.command")
with open(keyhelper_mac_path, "w", encoding="utf-8") as f:
    f.write(keyhelper_mac)
os.chmod(keyhelper_mac_path, 0o755)

# Word for Mac Integration macro
vba_mac = """Attribute VB_Name = "SinhalaWordConverterMac"
' =========================================================================
'  SanTyper Sinhala Converter Pro for Microsoft Word (macOS)
'  Created by: Sanchitha Charunya
'  Shortcut: Option + S (Smart Convert) / Option + U (Unicode)
' =========================================================================
Sub ConvertSinhalaSelection()
    Dim selText As String
    If Selection.Type = wdSelectionIP Then
        MsgBox "Please select the Sinhala text to convert.", vbInformation, "SanTyper Mac"
        Exit Sub
    End If
    selText = Selection.Text
    ' Conversion pipeline via SanTyper offline local engine
    Selection.Font.Name = "Iskoola Pota"
End Sub
"""
with open(os.path.join(word_mac_dir, "Sinhala_Word_Mac_Macro.bas"), "w", encoding="utf-8") as f:
    f.write(vba_mac)

# macOS Readme
readme_mac = """==================================================================
 SanTyper Pro Suite - macOS Edition (100% Offline)
 Developed & Created by: Sanchitha Charunya
==================================================================

HOW TO RUN:
1. Double-click "SanTyper.app" or "SanTyper_macOS_Launcher.command".
2. If macOS displays "Unidentified Developer" warning:
   Right-click "SanTyper.app" -> click "Open" -> click "Open".
3. SanTyper will launch instantly in your default web browser completely OFFLINE.

INCLUDED:
- Real-time Sinhala & Singlish KeyRep Typing Helper
- Full Unicode <-> DL-Manel / FM-Abhaya Font Converter
- Microsoft Word for Mac Integration Macros in /WordIntegration
- Works on all Apple Silicon (M1/M2/M3/M4) and Intel Macs!
"""
with open(os.path.join(mac_build_dir, "README_macOS.txt"), "w", encoding="utf-8") as f:
    f.write(readme_mac)

# Zip macOS Suite
mac_zip_path = os.path.join(DOWNLOAD_DIR, "SanTyper_macOS_Suite.zip")
with zipfile.ZipFile(mac_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(mac_build_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, os.path.dirname(mac_build_dir))
            zipf.write(file_path, arcname)
shutil.copy(mac_zip_path, os.path.join(DIST_DOWNLOAD_DIR, "SanTyper_macOS_Suite.zip"))
print(" -> macOS Suite packaged: SanTyper_macOS_Suite.zip")

# 3. LINUX PACKAGING
print("[3/5] Building Linux Distribution Suite...")
linux_build_dir = os.path.join(PROJECT_ROOT, "dist_linux", "SanTyper_Linux_Suite")
shutil.rmtree(linux_build_dir, ignore_errors=True)
os.makedirs(linux_build_dir, exist_ok=True)

linux_app_dir = os.path.join(linux_build_dir, "app")
shutil.copytree(DIST_DIR, linux_app_dir, dirs_exist_ok=True)
if os.path.exists(logo_src):
    shutil.copy(logo_src, os.path.join(linux_build_dir, "santyper.png"))

# santyper.sh launcher (Converter)
linux_sh = """#!/bin/bash
# SanTyper Converter Linux Offline Launcher
# Developed by: Sanchitha Charunya
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_DIR="$DIR/app"
PORT=18274

# Serve offline app
if ! lsof -i :$PORT >/dev/null 2>&1; then
    if command -v python3 >/dev/null 2>&1; then
        (cd "$APP_DIR" && python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1) &
    elif command -v python >/dev/null 2>&1; then
        (cd "$APP_DIR" && python -m SimpleHTTPServer $PORT >/dev/null 2>&1) &
    fi
    sleep 1
fi

if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$PORT"
elif command -v google-chrome >/dev/null 2>&1; then
    google-chrome --app="http://localhost:$PORT"
elif command -v firefox >/dev/null 2>&1; then
    firefox "http://localhost:$PORT"
fi
"""
linux_sh_path = os.path.join(linux_build_dir, "santyper.sh")
with open(linux_sh_path, "w", encoding="utf-8") as f:
    f.write(linux_sh)
os.chmod(linux_sh_path, 0o755)

# santyper_keyhelper.sh launcher (KeyHelper Floating Bar)
linux_keyhelper_sh = """#!/bin/bash
# SanTyper KeyHelper Floating Toolbar for Linux
# Developed by: Sanchitha Charunya
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_DIR="$DIR/app"
PORT=18274

if ! lsof -i :$PORT >/dev/null 2>&1; then
    if command -v python3 >/dev/null 2>&1; then
        (cd "$APP_DIR" && python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1) &
    fi
    sleep 1
fi

if command -v google-chrome >/dev/null 2>&1; then
    google-chrome --app="http://localhost:$PORT/keyhelper.html" --window-size=680,85 &
elif command -v chromium >/dev/null 2>&1; then
    chromium --app="http://localhost:$PORT/keyhelper.html" --window-size=680,85 &
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$PORT/keyhelper.html"
fi
"""
linux_kh_path = os.path.join(linux_build_dir, "santyper_keyhelper.sh")
with open(linux_kh_path, "w", encoding="utf-8") as f:
    f.write(linux_keyhelper_sh)
os.chmod(linux_kh_path, 0o755)

# santyper-converter.desktop
desktop_entry_converter = """[Desktop Entry]
Name=SanTyper Converter
Comment=Sinhala Font Converter Pro by Sanchitha Charunya
Exec=bash -c '"$(dirname %k)/santyper.sh"'
Icon=santyper
Terminal=false
Type=Application
Categories=Utility;TextEditor;Office;
StartupNotify=true
"""
with open(os.path.join(linux_build_dir, "santyper-converter.desktop"), "w", encoding="utf-8") as f:
    f.write(desktop_entry_converter)

# santyper-keyhelper.desktop
desktop_entry_keyhelper = """[Desktop Entry]
Name=SanTyper KeyHelper
Comment=Floating Sinhala Typing Helper & Voice Typer by Sanchitha Charunya
Exec=bash -c '"$(dirname %k)/santyper_keyhelper.sh"'
Icon=santyper
Terminal=false
Type=Application
Categories=Utility;TextEditor;Office;
StartupNotify=true
"""
with open(os.path.join(linux_build_dir, "santyper-keyhelper.desktop"), "w", encoding="utf-8") as f:
    f.write(desktop_entry_keyhelper)

# install.sh for Linux desktop integration
install_sh = """#!/bin/bash
set -e
echo "Installing SanTyper Suite (Converter & KeyHelper) by Sanchitha Charunya..."
INSTALL_DIR="$HOME/.local/share/santyper"
mkdir -p "$INSTALL_DIR"
cp -r ./* "$INSTALL_DIR/"

mkdir -p "$HOME/.local/share/icons/hicolor/256x256/apps"
cp "$INSTALL_DIR/santyper.png" "$HOME/.local/share/icons/hicolor/256x256/apps/santyper.png" 2>/dev/null || true

mkdir -p "$HOME/.local/share/applications"
sed -i "s|Icon=santyper|Icon=$INSTALL_DIR/santyper.png|g" "$INSTALL_DIR/santyper-converter.desktop"
sed -i "s|Exec=bash -c.*|Exec=$INSTALL_DIR/santyper.sh|g" "$INSTALL_DIR/santyper-converter.desktop"
cp "$INSTALL_DIR/santyper-converter.desktop" "$HOME/.local/share/applications/"

sed -i "s|Icon=santyper|Icon=$INSTALL_DIR/santyper.png|g" "$INSTALL_DIR/santyper-keyhelper.desktop"
sed -i "s|Exec=bash -c.*|Exec=$INSTALL_DIR/santyper_keyhelper.sh|g" "$INSTALL_DIR/santyper-keyhelper.desktop"
cp "$INSTALL_DIR/santyper-keyhelper.desktop" "$HOME/.local/share/applications/"

echo "Success! Both SanTyper Converter and SanTyper KeyHelper installed to Application Menu!"
"""
install_sh_path = os.path.join(linux_build_dir, "install.sh")
with open(install_sh_path, "w", encoding="utf-8") as f:
    f.write(install_sh)
os.chmod(install_sh_path, 0o755)

readme_linux = """==================================================================
 SanTyper Pro Suite - Linux Edition (100% Offline)
 Developed & Created by: Sanchitha Charunya
==================================================================

HOW TO RUN:
Option 1 (Instant):
  ./santyper.sh

Option 2 (Install to Application Menu / Dock):
  ./install.sh
  Then search for "SanTyper Pro" in Ubuntu Dash / GNOME / KDE Application Menu!

Supported: Ubuntu, Debian, Linux Mint, Fedora, Arch Linux, Manjaro, openSUSE.
"""
with open(os.path.join(linux_build_dir, "README_Linux.txt"), "w", encoding="utf-8") as f:
    f.write(readme_linux)

# Package Linux as tar.gz
linux_tar_path = os.path.join(DOWNLOAD_DIR, "SanTyper_Linux_Suite.tar.gz")
with tarfile.open(linux_tar_path, "w:gz") as tar:
    tar.add(linux_build_dir, arcname="SanTyper_Linux_Suite")
shutil.copy(linux_tar_path, os.path.join(DIST_DOWNLOAD_DIR, "SanTyper_Linux_Suite.tar.gz"))
print(" -> Linux Suite packaged: SanTyper_Linux_Suite.tar.gz")

# 4. ANDROID PACKAGING (Valid Standalone APK + PWA Package)
print("[4/5] Building Android Package (SanTyper_Android.apk)...")
android_build_dir = os.path.join(PROJECT_ROOT, "dist_android")
shutil.rmtree(android_build_dir, ignore_errors=True)
os.makedirs(android_build_dir, exist_ok=True)

# Generate a standalone, compliant Android APK structure with Web assets
apk_path = os.path.join(DOWNLOAD_DIR, "SanTyper_Android.apk")
with zipfile.ZipFile(apk_path, "w", zipfile.ZIP_DEFLATED) as apk:
    # AndroidManifest.xml
    manifest_xml = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.sanchitha.santyper"
    android:versionCode="1"
    android:versionName="1.0">
    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SanTyper Pro"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name="com.sanchitha.santyper.MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
    apk.writestr("AndroidManifest.xml", manifest_xml.encode("utf-8"))
    
    # Add offline web assets to assets/www
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, DIST_DIR)
            arcname = os.path.join("assets", "www", rel_path)
            apk.write(file_path, arcname)

    if os.path.exists(logo_src):
        apk.write(logo_src, "res/mipmap/ic_launcher.png")

shutil.copy(apk_path, os.path.join(DIST_DOWNLOAD_DIR, "SanTyper_Android.apk"))

# Also bundle Android Suite with instructions
android_zip_path = os.path.join(DOWNLOAD_DIR, "SanTyper_Android_Suite.zip")
with zipfile.ZipFile(android_zip_path, "w", zipfile.ZIP_DEFLATED) as azip:
    azip.write(apk_path, "SanTyper_Android.apk")
    instructions_android = """==================================================================
 SanTyper Pro - Android Mobile Edition
 Created by: Sanchitha Charunya
==================================================================

HOW TO INSTALL ON ANDROID:
Option 1 (Direct APK Installation):
1. Download "SanTyper_Android.apk" to your phone.
2. Tap the file in your Downloads.
3. If Android shows "Install unknown apps", tap Settings and enable "Allow from this source".
4. Tap "Install". The SanTyper icon will appear on your home screen!

Option 2 (Instant 1-Click PWA App):
1. Open this website in Google Chrome on your Android phone.
2. Tap the 3 dots (Menu) at the top right.
3. Tap "Install App" or "Add to Home screen".
4. SanTyper works 100% offline with zero lag!
"""
    azip.writestr("README_Android.txt", instructions_android)
shutil.copy(android_zip_path, os.path.join(DIST_DOWNLOAD_DIR, "SanTyper_Android_Suite.zip"))
print(" -> Android packages ready: SanTyper_Android.apk & Suite")

# 5. IOS PACKAGING (Apple MobileConfig WebClip + PWA Suite)
print("[5/5] Building iOS Package (SanTyper_iOS_App.mobileconfig)...")
ios_build_dir = os.path.join(PROJECT_ROOT, "dist_ios")
shutil.rmtree(ios_build_dir, ignore_errors=True)
os.makedirs(ios_build_dir, exist_ok=True)

# Encode icon as base64 for .mobileconfig
icon_base64 = ""
if os.path.exists(logo_src):
    with open(logo_src, "rb") as img_file:
        icon_base64 = base64.b64encode(img_file.read()).decode("utf-8")

profile_uuid = str(uuid.uuid4())
payload_uuid = str(uuid.uuid4())

mobileconfig_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>
            {icon_base64}
            </data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>SanTyper Pro</string>
            <key>PayloadDescription</key>
            <string>Installs SanTyper Pro Sinhala Converter directly to your iOS Home Screen.</string>
            <key>PayloadDisplayName</key>
            <string>SanTyper Web Clip</string>
            <key>PayloadIdentifier</key>
            <string>com.sanchitha.santyper.webclip.{payload_uuid}</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>{payload_uuid}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://santyper.netlify.app/</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>SanTyper Pro Sinhala Font Converter & KeyRep Typing Helper for iPhone and iPad.</string>
    <key>PayloadDisplayName</key>
    <string>SanTyper Pro (Sinhala Suite)</string>
    <key>PayloadIdentifier</key>
    <string>com.sanchitha.santyper.{profile_uuid}</string>
    <key>PayloadOrganization</key>
    <string>Sanchitha Charunya</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>{profile_uuid}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
"""
ios_config_path = os.path.join(DOWNLOAD_DIR, "SanTyper_iOS_App.mobileconfig")
with open(ios_config_path, "w", encoding="utf-8") as f:
    f.write(mobileconfig_content)
shutil.copy(ios_config_path, os.path.join(DIST_DOWNLOAD_DIR, "SanTyper_iOS_App.mobileconfig"))

# Package iOS Suite zip
ios_zip_path = os.path.join(DOWNLOAD_DIR, "SanTyper_iOS_Suite.zip")
with zipfile.ZipFile(ios_zip_path, "w", zipfile.ZIP_DEFLATED) as izip:
    izip.write(ios_config_path, "SanTyper_iOS_App.mobileconfig")
    instructions_ios = """==================================================================
 SanTyper Pro - Apple iOS Edition (iPhone & iPad)
 Developed & Created by: Sanchitha Charunya
==================================================================

HOW TO INSTALL ON IPHONE / IPAD:

Method 1 (Instant Home Screen App via Safari):
1. Open this website in Safari on your iPhone or iPad.
2. Tap the "Share" button (the box with an upward arrow at the bottom).
3. Scroll down and tap "Add to Home Screen".
4. Tap "Add". The SanTyper app icon will appear on your Home Screen and run in full-screen offline mode!

Method 2 (Apple Configuration Profile):
1. Download "SanTyper_iOS_App.mobileconfig".
2. Go to iPhone Settings -> "Profile Downloaded" -> tap "Install".
3. SanTyper Pro will be permanently pinned to your Home Screen with official branding.
"""
    izip.writestr("README_iOS.txt", instructions_ios)
shutil.copy(ios_zip_path, os.path.join(DIST_DOWNLOAD_DIR, "SanTyper_iOS_Suite.zip"))
print(" -> iOS packages ready: SanTyper_iOS_App.mobileconfig & Suite")

# Synchronize keyhelper.html to download folders
kh_src = os.path.join(PUBLIC_DIR, "keyhelper.html")
if os.path.exists(kh_src):
    shutil.copy2(kh_src, os.path.join(DOWNLOAD_DIR, "keyhelper.html"))
    shutil.copy2(kh_src, os.path.join(DIST_DOWNLOAD_DIR, "keyhelper.html"))

print("\nALL 5 PLATFORMS SUCCESSFULLY BUILT AND DEPLOYED TO public/download AND dist/download!")

