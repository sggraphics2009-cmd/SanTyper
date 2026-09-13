import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { unicodeToDlManel, dlManelToUnicode } from "./src/lib/converterLogic";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS so the Word Macro or other environments can call it if needed
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Admin Privacy Shield: Strictly block any web access to local admin hosting tools
  app.use("/admin_host", (req, res) => {
    res.status(403).send("Forbidden: Local admin deployment tools are restricted to offline PC access only.");
  });

  // Middleware for parsing requests
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use(express.text({ type: "text/plain", limit: "10mb" }));

  // API routes FIRST
  app.all("/api/convert", (req: any, res: any) => {
    let text = "";
    if (req.body && typeof req.body === "string") {
      text = req.body;
    } else {
      text = req.body?.text || req.query?.text || "";
    }
    
    const mode = req.body?.mode || req.query?.mode || "unicode-to-legacy";
    const format = req.body?.format || req.query?.format || "json";
    const font = req.body?.font || req.query?.font || "";
    const requestedProfile = req.body?.profile || req.query?.profile;
    const profile: "DL_SERIES" | "FM_SERIES" = requestedProfile === "FM_SERIES" || font.toLowerCase().includes("fm")
      ? "FM_SERIES"
      : "DL_SERIES";

    if (!text) {
      if (format === "plain") {
        return res.status(400).send("Error: Text parameter is required.");
      }
      return res.status(400).json({ error: "Text parameter is required." });
    }

    try {
      let converted = "";
      if (mode === "unicode-to-legacy") {
        converted = unicodeToDlManel(text as string, [], profile);
      } else {
        converted = dlManelToUnicode(text as string, [], profile);
      }

      if (format === "plain") {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.send(converted);
      }

      return res.json({ converted, mode, profile });
    } catch (err: any) {
      if (format === "plain") {
        return res.status(500).send("Error: " + err.message);
      }
      return res.status(500).json({ error: err.message });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Dynamic MS Word Add-in Manifest (XML) endpoint
  app.get("/manifest.xml", (req, res) => {
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.get("host");
    const origin = `${protocol}://${host}`;

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:type="TaskPaneApp">
  <Id>f47ac10b-58cc-4372-a567-0e02b2c3d479</Id>
  <Version>1.1.0.0</Version>
  <ProviderName>Sanchitha Charunya</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Sinhala Word Pro — Sanchitha Charunya" />
  <Description DefaultValue="Directly convert Sinhala Unicode and Legacy fonts (DL-Manel, FM-Abaya) in Microsoft Word. Developed by Sanchitha Charunya. All rights reserved." />
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

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="sinhala-converter-word-addin.xml"');
    res.send(xmlContent);
  });

  // Windows Registry 1-Click Fixer for Word VBA programmatic access
  app.get("/EnableWordMacroAccess.reg", (req, res) => {
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
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", 'attachment; filename="EnableWordMacroAccess.reg"');
    res.send(regContent);
  });

  // Windows Desktop App & SanTyper Offline Package Downloads
  app.get("/download/SanTyper_Setup.exe", (req, res) => {
    const filePath = path.join(process.cwd(), "public", "download", "SanTyper_Setup.exe");
    res.download(filePath, "SanTyper_Setup_v1.0.exe");
  });

  app.get("/download/SanTyper_Portable.exe", (req, res) => {
    const filePath = path.join(process.cwd(), "public", "download", "SanTyper_Portable.exe");
    res.download(filePath, "SanTyper_Portable_v1.0.exe");
  });

  app.get("/download/SanTyper_Offline_Suite.zip", (req, res) => {
    const filePath = path.join(process.cwd(), "public", "download", "SanTyper_Offline_Suite.zip");
    res.download(filePath, "SanTyper_Offline_Suite_v1.0.zip");
  });

  app.get("/download/SanTyper.exe", (req, res) => {
    const filePath = path.join(process.cwd(), "public", "download", "SanTyper.exe");
    res.download(filePath, "SanTyper.exe");
  });

  app.get("/author.png", (req, res) => {
    const filePath = path.join(process.cwd(), "public", "author.png");
    res.sendFile(filePath);
  });

  // Direct Downloadable VBA Module (.bas) file for Microsoft Word
  app.get("/SinhalaWordConverter.bas", (req, res) => {
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.get("host");
    const origin = `${protocol}://${host}`;

    const basContent = `Attribute VB_Name = "SinhalaWordConverter"

' =========================================================================
'  Sinhala Unicode & Legacy Converter Pro for Microsoft Word
'  Developed & Created by: Sanchitha Charunya (All Rights Reserved)
'  Connected to Live API: ${origin}
'  Keybindings:
'    Alt + S : Smart Auto-Detect & Convert (or Unicode -> Legacy)
'    Alt + U : Convert Selection to Unicode (Iskoola Pota)
'    Alt + L : Convert Selection to Legacy (DL-Manel / FMAbhaya)
' =========================================================================

Public Const API_ORIGIN As String = "${origin}"
Public Const DEFAULT_LEGACY_FONT As String = "DL-Manel"
Public Const DEFAULT_PROFILE As String = "DL_SERIES"

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
        StatusBar = "සිංහල පරිවර්තනය සාර්ථකයි (" & targetFont & " ලෙස සකසන ලදී)."
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
           "- Alt + L : Convert to Legacy", vbInformation, "Sinhala Word Pro"
End Sub
`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="SinhalaWordConverter.bas"');
    res.send(basContent);
  });

  // Dynamic 1-Click PowerShell Installer script endpoint
  app.get("/install.ps1", (req, res) => {
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.get("host");
    const origin = `${protocol}://${host}`;

    const psScript = `# Dynamic 1-Click Installer for Sinhala Word Plug-in
# Developed & Created by: Sanchitha Charunya (All Rights Reserved)
# Generated dynamically for: ${origin}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11 -bor [Net.SecurityProtocolType]::Tls

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SINHALA WORD PRO - BY SANCHITHA CHARUNYA (WINDOWS)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Developed by: Sanchitha Charunya" -ForegroundColor White
Write-Host "Connecting Sinhala Engine Live API: ${origin}" -ForegroundColor Gray
Write-Host ""

# 1. Check if Word is running and close it to avoid lock
$wordProcesses = Get-Process -Name "winword" -ErrorAction SilentlyContinue
if ($wordProcesses) {
    Write-Host "Microsoft Word is currently running. Closing it to apply plug-in..." -ForegroundColor Yellow
    Stop-Process -Name "winword" -Force
    Start-Sleep -Seconds 2
}

# 2. Enable programmatic access to VBA Project in registry
Write-Host "Configuring VBA secure access in Windows Registry..." -ForegroundColor Gray
$OfficeVersions = @("16.0", "15.0", "14.0")
foreach ($ver in $OfficeVersions) {
    $paths = @(
        "HKCU:\\Software\\Microsoft\\Office\\$ver\\Word\\Security",
        "HKCU:\\Software\\Policies\\Microsoft\\Office\\$ver\\Word\\Security"
    )
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Set-ItemProperty -Path $path -Name "AccessVBOM" -Value 1 -ErrorAction SilentlyContinue
        } else {
            if ($path.StartsWith("HKCU:\\Software\\Microsoft")) {
                New-Item -Path $path -Force -ErrorAction SilentlyContinue | Out-Null
                Set-ItemProperty -Path $path -Name "AccessVBOM" -Value 1 -ErrorAction SilentlyContinue
            }
        }
    }
}

# 3. Create MS Word Instance and inject Macro
try {
    Write-Host "Loading Microsoft Word Automation Engine..." -ForegroundColor Gray
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    
    $doc = $null
    if ($word.Documents.Count -eq 0) {
        $doc = $word.Documents.Add()
    }
    
    $normal = $word.NormalTemplate
    if ($null -eq $normal) {
        throw "NormalTemplate could not be loaded. Please ensure Microsoft Word is installed."
    }
    
    $project = $null
    try {
        $project = $normal.VBProject
    } catch {
        # Security exception
    }
    
    if ($null -eq $project) {
        Write-Host ""
        Write-Host "==========================================================" -ForegroundColor Yellow
        Write-Host "   SECURITY ACCESS BLOCKED BY MICROSOFT WORD SECURITY     " -ForegroundColor Yellow
        Write-Host "==========================================================" -ForegroundColor Yellow
        Write-Host "Word blocked programmatic macro injection because" -ForegroundColor Gray
        Write-Host "'Trust access to the VBA project object model' is disabled." -ForegroundColor Gray
        Write-Host ""
        Write-Host "QUICK FIX (OPTION A - 10 Seconds in Word):" -ForegroundColor Cyan
        Write-Host "1. Open Microsoft Word" -ForegroundColor White
        Write-Host "2. Go to: File -> Options -> Trust Center -> Trust Center Settings..." -ForegroundColor White
        Write-Host "3. Click 'Macro Settings' on the left" -ForegroundColor White
        Write-Host "4. CHECK: 'Trust access to the VBA project object model'" -ForegroundColor Green
        Write-Host "5. Click OK, close Word, and run this command again!" -ForegroundColor Green
        Write-Host ""
        Write-Host "QUICK FIX (OPTION B - 1-Click Direct .BAS Import):" -ForegroundColor Cyan
        Write-Host "Download '${origin}/SinhalaWordConverter.bas' and import in Word (Alt+F11 -> File -> Import File)." -ForegroundColor White
        Write-Host "==========================================================" -ForegroundColor Yellow
        Write-Host ""
        throw "VBA project programmatic access is disabled in Word."
    }
    
    # Add or get module
    $moduleName = "SinhalaWordConverter"
    $module = $null
    foreach ($comp in $project.VBComponents) {
        if ($comp.Name -eq $moduleName) {
            $module = $comp
            break
        }
    }
    
    if ($module -eq $null) {
        $module = $project.VBComponents.Add(1) # 1 = vbext_ct_StdModule
        $module.Name = $moduleName
    }
    
    # Delete existing lines
    $module.CodeModule.DeleteLines(1, $module.CodeModule.CountOfLines)
    
    # Inject VBA code
    $vbaCode = @"
Public Const API_ORIGIN As String = "${origin}"
Public Const DEFAULT_LEGACY_FONT As String = "DL-Manel"
Public Const DEFAULT_PROFILE As String = "DL_SERIES"

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
        MsgBox "Please select a Sinhala text first.", vbExclamation, "Sinhala Word Pro"
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
        MsgBox "Please select a Sinhala Unicode text first.", vbExclamation, "Sinhala Word Pro"
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
        StatusBar = "Sinhala conversion complete (" & targetFont & ")."
    End If
End Sub

Sub ConvertSelectionToSinhalaUnicode()
    Dim rawText As String, sendText As String, resultText As String
    Dim hasTrailingCr As Boolean
    
    rawText = Selection.Text
    If Len(Trim(rawText)) < 1 Or rawText = vbCr Or rawText = vbCrLf Then
        MsgBox "Please select a Sinhala Legacy text first.", vbExclamation, "Sinhala Word Pro"
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
        StatusBar = "Sinhala Unicode conversion complete (Iskoola Pota)."
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
        CallConverterApi = "Error: Cannot initialize HTTP engine in Word."
        Exit Function
    End If
    
    http.Open "POST", requestUrl, False
    http.setRequestHeader "Content-Type", "text/plain; charset=utf-8"
    http.send payload
    
    If http.Status = 200 Then
        Dim resp As String
        resp = http.responseText
        If Len(Trim(resp)) = 0 Then
            CallConverterApi = "Error: Empty response from server."
        Else
            CallConverterApi = resp
        End If
    Else
        CallConverterApi = "Error: Server returned status " & http.Status & vbNewLine & http.responseText
    End If
    Exit Function

CatchErr:
    CallConverterApi = "Error: VBA Macro error: " & Err.Description
End Function

Sub RegisterSinhalaHotkeys()
    On Error Resume Next
    CustomizationContext = NormalTemplate
    KeyBindings.Add wdKeyCategoryMacro, "ConvertSelectionSinhalaAutoDetect", BuildKeyCode(wdKeyAlt, wdKeyS)
    KeyBindings.Add wdKeyCategoryMacro, "ConvertSelectionToSinhalaUnicode", BuildKeyCode(wdKeyAlt, wdKeyU)
    KeyBindings.Add wdKeyCategoryMacro, "ConvertSelectionToSinhalaLegacy", BuildKeyCode(wdKeyAlt, wdKeyL)
    NormalTemplate.Save
End Sub
"@

    $module.CodeModule.AddFromString($vbaCode)
    
    # 4. Assign Keyboard Shortcuts:
    # Alt + S -> ConvertSelectionSinhalaAutoDetect
    # Alt + U -> ConvertSelectionToSinhalaUnicode
    # Alt + L -> ConvertSelectionToSinhalaLegacy
    Write-Host "Registering Keyboard Shortcuts (Alt + S, Alt + U, Alt + L) in Word..." -ForegroundColor Gray
    $word.CustomizationContext = $normal
    
    try {
        # wdKeyAlt = 1024, wdKeyS = 83, wdKeyU = 85, wdKeyL = 76, wdKeyCategoryMacro = 2
        $word.KeyBindings.Add(2, "ConvertSelectionSinhalaAutoDetect", $word.BuildKeyCode(1024, 83))
        $word.KeyBindings.Add(2, "ConvertSelectionToSinhalaUnicode", $word.BuildKeyCode(1024, 85))
        $word.KeyBindings.Add(2, "ConvertSelectionToSinhalaLegacy", $word.BuildKeyCode(1024, 76))
    } catch {
        Write-Host "Warning: Could not bind hotkeys automatically. You can still run via Alt+F8." -ForegroundColor Yellow
    }
    
    # Save normal template
    $normal.Save()
    
    Write-Host ""
    Write-Host "SUCCESS! SINHALA WORD PRO PLUG-IN INSTALLED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "--------------------------------------------------------" -ForegroundColor Green
    Write-Host "  Registered Keyboard Shortcuts:" -ForegroundColor Green
    Write-Host "  - Alt + S : Smart Auto-Detect & Convert (Both directions!)" -ForegroundColor Green
    Write-Host "  - Alt + U : Force Convert to Unicode (Iskoola Pota)" -ForegroundColor Green
    Write-Host "  - Alt + L : Force Convert to Legacy (DL-Manel)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Open Microsoft Word, select any Sinhala text, and press Alt+S!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "ERROR: Macro installation failed: $_" -ForegroundColor Red
    Write-Host "Alternative: Download '${origin}/SinhalaWordConverter.bas' and import manually." -ForegroundColor Yellow
    Write-Host ""
} finally {
    if ($doc -ne $null) {
        try { $doc.Close(0) } catch {}
    }
    if ($word) {
        try {
            $word.Quit()
            [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
        } catch {}
    }
}
`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(psScript);
  });

  // Serve static assets from public (e.g. /download/*, /keyhelper.html, logo.png)
  const publicDir = path.join(process.cwd(), "public");
  app.use(express.static(publicDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
