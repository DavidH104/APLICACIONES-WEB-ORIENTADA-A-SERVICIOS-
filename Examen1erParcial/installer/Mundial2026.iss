#define MyAppName "Mundial 2026"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Proyecto escolar"
#define MyAppExeName "start.vbs"

[Setup]
AppId={{8C42CB66-8DA8-4EC3-9516-CFB1E16C41F2}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={localappdata}\Programs\Mundial2026
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
MinVersion=10.0.17763
OutputDir=..\dist
OutputBaseFilename=Mundial2026-Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
SetupLogging=yes
UninstallDisplayName={#MyAppName}
CreateUninstallRegKey=yes
CloseApplications=no
RestartApplications=no

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear acceso directo en el escritorio"; GroupDescription: "Accesos directos:"; Flags: unchecked

[Files]
Source: "build\stage\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\start.vbs"""; WorkingDir: "{app}"
Name: "{autoprograms}\Detener {#MyAppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\stop.vbs"""; WorkingDir: "{app}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\start.vbs"""; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\prerequisites\VC_redist.x64.exe"; Parameters: "/install /quiet /norestart"; StatusMsg: "Preparando componentes de Windows..."; Flags: waituntilterminated runhidden; Check: VCRuntimeNeedsInstall
Filename: "{sys}\wscript.exe"; Parameters: """{app}\start.vbs"""; Description: "Abrir {#MyAppName}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "{app}\runtime\node\node.exe"; Parameters: """{app}\launcher\launcher.mjs"" --stop"; Flags: runhidden waituntilterminated skipifdoesntexist; RunOnceId: "StopMundial2026"

[Code]
function VCRuntimeNeedsInstall(): Boolean;
var
  Installed: Cardinal;
begin
  Result := not RegQueryDWordValue(HKLM64, 'SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64', 'Installed', Installed)
    or (Installed <> 1);
end;
