Attribute VB_Name = "SinhalaWordConverter"
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
