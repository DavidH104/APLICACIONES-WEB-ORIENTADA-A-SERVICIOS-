Option Explicit
Dim shell, fso, base, command, result
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
base = fso.GetParentFolderName(WScript.ScriptFullName)
command = Chr(34) & base & "\runtime\node\node.exe" & Chr(34) & " " & Chr(34) & base & "\launcher\launcher.mjs" & Chr(34)
result = shell.Run(command, 0, True)
If result <> 0 Then
  MsgBox "No se pudo iniciar Mundial 2026." & vbCrLf & "Revisa los registros en:" & vbCrLf & shell.ExpandEnvironmentStrings("%LOCALAPPDATA%\Mundial2026\logs"), vbCritical, "Mundial 2026"
End If
