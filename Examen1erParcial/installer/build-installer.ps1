param(
  [string]$InnoCompiler = "",
  [string]$MongoRoot = "C:\Program Files\MongoDB\Server\7.0",
  [string]$NodeExecutable = "",
  [switch]$StageOnly
)

$ErrorActionPreference = 'Stop'
$installerRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $installerRoot
$buildRoot = Join-Path $installerRoot 'build'
$stage = Join-Path $buildRoot 'stage'
$dist = Join-Path $repoRoot 'dist'

if ((Split-Path -Leaf $repoRoot) -ne 'Examen1erParcial') {
  throw "Ruta de proyecto inesperada: $repoRoot"
}

if (-not $NodeExecutable) {
  $cachedNode = Join-Path $installerRoot 'cache\node-v24.12.0\node-v24.12.0-win-x64\node.exe'
  if (Test-Path -LiteralPath $cachedNode -PathType Leaf) {
    $NodeExecutable = $cachedNode
  } else {
    $NodeExecutable = (Get-Command node.exe -ErrorAction Stop).Source
  }
}
if (-not (Test-Path -LiteralPath $NodeExecutable -PathType Leaf)) {
  throw "No se encontró node.exe: $NodeExecutable"
}
if (-not (Test-Path -LiteralPath (Join-Path $MongoRoot 'bin\mongod.exe') -PathType Leaf)) {
  throw "No se encontró mongod.exe en: $MongoRoot"
}
if (-not (Test-Path -LiteralPath (Join-Path $installerRoot 'snapshot\manifest.json') -PathType Leaf)) {
  throw 'Primero genera installer\snapshot\manifest.json.'
}

if (Test-Path -LiteralPath $stage) {
  $stageFull = [IO.Path]::GetFullPath($stage)
  $buildFull = [IO.Path]::GetFullPath($buildRoot)
  if (-not $stageFull.StartsWith($buildFull, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Se rechazó limpiar una ruta fuera de build: $stageFull"
  }
  Remove-Item -LiteralPath $stageFull -Recurse -Force
}

$null = New-Item -ItemType Directory -Path $stage -Force
$null = New-Item -ItemType Directory -Path $dist -Force
$null = New-Item -ItemType Directory -Path (Join-Path $stage 'mongo') -Force
$null = New-Item -ItemType Directory -Path (Join-Path $stage 'launcher') -Force
$null = New-Item -ItemType Directory -Path (Join-Path $stage 'runtime\node') -Force
$null = New-Item -ItemType Directory -Path (Join-Path $stage 'runtime\mongodb\bin') -Force
$null = New-Item -ItemType Directory -Path (Join-Path $stage 'licenses') -Force
$null = New-Item -ItemType Directory -Path (Join-Path $stage 'prerequisites') -Force

$rootFiles = @(
  'index.html', 'app.js', 'styles.css', 'clasificaciones.json', 'equipos.json',
  'noticias.json', 'partidos.json', 'promociones.json', 'README_INSTALADOR_WINDOWS.md'
)
foreach ($file in $rootFiles) {
  Copy-Item -LiteralPath (Join-Path $repoRoot $file) -Destination (Join-Path $stage $file) -Force
}
Copy-Item -LiteralPath (Join-Path $repoRoot 'assets') -Destination $stage -Recurse -Force

$mongoFiles = @('api-server.js', 'initialize-installer-db.js', 'shutdown-installer-db.js', 'package.json', 'package-lock.json')
foreach ($file in $mongoFiles) {
  Copy-Item -LiteralPath (Join-Path $repoRoot "mongo\$file") -Destination (Join-Path $stage "mongo\$file") -Force
}
Copy-Item -LiteralPath (Join-Path $repoRoot 'mongo\node_modules') -Destination (Join-Path $stage 'mongo') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $installerRoot 'snapshot') -Destination $stage -Recurse -Force

Copy-Item -LiteralPath (Join-Path $installerRoot 'runtime\launcher.mjs') -Destination (Join-Path $stage 'launcher\launcher.mjs') -Force
Copy-Item -LiteralPath (Join-Path $installerRoot 'runtime\start.vbs') -Destination (Join-Path $stage 'start.vbs') -Force
Copy-Item -LiteralPath (Join-Path $installerRoot 'runtime\stop.vbs') -Destination (Join-Path $stage 'stop.vbs') -Force
Copy-Item -LiteralPath (Join-Path $installerRoot 'runtime\start-debug.cmd') -Destination (Join-Path $stage 'start-debug.cmd') -Force

Copy-Item -LiteralPath $NodeExecutable -Destination (Join-Path $stage 'runtime\node\node.exe') -Force
$nodeLicense = Join-Path (Split-Path -Parent $NodeExecutable) 'LICENSE'
if (Test-Path -LiteralPath $nodeLicense -PathType Leaf) {
  Copy-Item -LiteralPath $nodeLicense -Destination (Join-Path $stage 'licenses\Node.js-LICENSE.txt') -Force
}
Copy-Item -LiteralPath (Join-Path $MongoRoot 'bin\mongod.exe') -Destination (Join-Path $stage 'runtime\mongodb\bin\mongod.exe') -Force
foreach ($license in @('LICENSE-Community.txt', 'MPL-2', 'README', 'THIRD-PARTY-NOTICES')) {
  $source = Join-Path $MongoRoot $license
  if (Test-Path -LiteralPath $source) {
    Copy-Item -LiteralPath $source -Destination (Join-Path $stage "licenses\MongoDB-$license") -Force
  }
}
if (Test-Path -LiteralPath (Join-Path $installerRoot 'licenses')) {
  Copy-Item -Path (Join-Path $installerRoot 'licenses\*') -Destination (Join-Path $stage 'licenses') -Force
}
$vcRedist = Join-Path $installerRoot 'cache\VC_redist.x64.exe'
if (-not (Test-Path -LiteralPath $vcRedist -PathType Leaf)) {
  throw 'Falta installer\cache\VC_redist.x64.exe. Descarga el redistribuible oficial de Microsoft antes de compilar.'
}
Copy-Item -LiteralPath $vcRedist -Destination (Join-Path $stage 'prerequisites\VC_redist.x64.exe') -Force

$nodeVersion = & $NodeExecutable --version
$mongoVersion = & (Join-Path $MongoRoot 'bin\mongod.exe') --version | Select-Object -First 1
$buildInfo = @(
  'Mundial 2026 - paquete offline',
  "Generado: $([DateTime]::UtcNow.ToString('o'))",
  "Node.js: $nodeVersion",
  "MongoDB: $mongoVersion",
  'Datos de usuario: %LOCALAPPDATA%\Mundial2026',
  'API: http://127.0.0.1:18080',
  'MongoDB local: 127.0.0.1:27127'
)
Set-Content -LiteralPath (Join-Path $stage 'BUILD-INFO.txt') -Value $buildInfo -Encoding UTF8

& (Join-Path $stage 'runtime\node\node.exe') --check (Join-Path $stage 'mongo\api-server.js')
if ($LASTEXITCODE -ne 0) { throw 'api-server.js no pasó la validación de sintaxis.' }
& (Join-Path $stage 'runtime\node\node.exe') --check (Join-Path $stage 'mongo\initialize-installer-db.js')
if ($LASTEXITCODE -ne 0) { throw 'initialize-installer-db.js no pasó la validación de sintaxis.' }
& (Join-Path $stage 'runtime\node\node.exe') --check (Join-Path $stage 'mongo\shutdown-installer-db.js')
if ($LASTEXITCODE -ne 0) { throw 'shutdown-installer-db.js no pasó la validación de sintaxis.' }
& (Join-Path $stage 'runtime\node\node.exe') --check (Join-Path $stage 'launcher\launcher.mjs')
if ($LASTEXITCODE -ne 0) { throw 'launcher.mjs no pasó la validación de sintaxis.' }

if ($StageOnly) {
  Write-Host "Distribución preparada y validada en: $stage"
  exit 0
}

if (-not $InnoCompiler) {
  $candidates = @(
    (Join-Path $installerRoot 'tools\Inno Setup 6\ISCC.exe'),
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
    "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
  )
  $InnoCompiler = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
}
if (-not $InnoCompiler) {
  throw 'No se encontró ISCC.exe. Instala Inno Setup 6 o pásalo con -InnoCompiler.'
}

& $InnoCompiler (Join-Path $installerRoot 'Mundial2026.iss')
if ($LASTEXITCODE -ne 0) { throw "Inno Setup terminó con código $LASTEXITCODE." }

$installer = Join-Path $dist 'Mundial2026-Setup.exe'
if (-not (Test-Path -LiteralPath $installer)) { throw 'El compilador no generó Mundial2026-Setup.exe.' }
$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $installer
Write-Host "Instalador creado: $installer"
Write-Host "SHA-256: $($hash.Hash)"
