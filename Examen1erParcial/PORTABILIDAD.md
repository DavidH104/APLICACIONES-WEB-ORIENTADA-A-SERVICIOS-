# INSTRUCCIONES PARA COMPARTIR EL PROYECTO (PORTABILIDAD)

## 📦 OPCIÓN 1: Compartir como Carpeta Comprimida (ZIP)

### Preparar el proyecto para empaquetar:
1. **Elimina `node_modules`** (es muy pesado, se reinstala automáticamente)
   - En Windows: Borra la carpeta `mongo/node_modules`
   - En Mac/Linux: `rm -rf mongo/node_modules`

2. **Crea un ZIP con toda la carpeta**
   - Windows: Click derecho → Enviar a → Carpeta comprimida
   - Mac: Click derecho → Comprimir
   - Linux: `zip -r mundial-2026.zip .`

3. **Comparte el archivo ZIP**
   - Google Drive, OneDrive, USB, Email, etc.

### El que reciba el ZIP:
1. Descomprime el archivo
2. Ejecuta:
   - **Windows**: Haz doble clic en `install.bat`
   - **Mac/Linux**: Abre Terminal, `chmod +x install.sh && ./install.sh`
3. ¡Listo! La app se instala automáticamente

---

## 📂 OPCIÓN 2: Compartir con Git (Mejor para colaboración)

### Antes de hacer push a GitHub:

1. **Crear archivo `.gitignore`** en la raíz del proyecto:
```
node_modules/
*.log
.env
.DS_Store
```

2. **Elimina node_modules si está en git**:
```bash
git rm -r --cached mongo/node_modules/
git commit -m "Remove node_modules"
```

3. **Push a GitHub**:
```bash
git add .
git commit -m "Add installation scripts and MongoDB setup"
git push origin main
```

### El que clona desde GitHub:
```bash
git clone https://github.com/tu-usuario/APLICACIONES-WEB-ORIENTADA-A-SERVICIOS-.git
cd APLICACIONES-WEB-ORIENTADA-A-SERVICIOS-/Examen1erParcial

# Windows:
install.bat

# Mac/Linux:
chmod +x install.sh
./install.sh
```

---

## 🎯 OPCIÓN 3: Crear Instalador Ejecutable (.EXE)

Para crear un ejecutable que se instale solo en Windows:

### Usando NSIS (Nullsoft Installer):

1. **Descarga NSIS**: http://nsis.sourceforge.net/

2. **Crea archivo `installer.nsi`** en la raíz:

```nsis
!include "MUI2.nsh"

Name "MUNDIAL 2026"
OutFile "MUNDIAL2026-Setup.exe"
InstallDir "$PROGRAMFILES\MUNDIAL2026"

!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Spanish"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "*.*"
  
  ExecWait "cmd /c cd mongo && npm install"
  ExecWait "cmd /c cd mongo && npm run setup"
  ExecWait "cmd /c cd mongo && npm run seed"
  
  CreateDirectory "$SMPROGRAMS\MUNDIAL2026"
  CreateShortCut "$SMPROGRAMS\MUNDIAL2026\Iniciar Servidor.lnk" "$INSTDIR\start.bat"
  CreateShortCut "$SMPROGRAMS\MUNDIAL2026\Desinstalar.lnk" "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  RMDir /r "$SMPROGRAMS\MUNDIAL2026"
SectionEnd
```

3. **Compila con NSIS**:
   - Click derecho en `installer.nsi` → Compile NSIS Script
   - Se genera `MUNDIAL2026-Setup.exe`

---

## ✅ CHECKLIST ANTES DE COMPARTIR

- [ ] Elimina `mongo/node_modules`
- [ ] Verifica que `install.bat`, `install.sh`, `start.bat`, `start.sh` existan
- [ ] Verifica que `package.json` en `mongo/` esté bien
- [ ] Prueba el instalador en un equipo limpio
- [ ] Prueba en Windows, Mac y Linux (si es necesario)
- [ ] Crea archivo `README.md` o usa `INSTALACION.md`

---

## 📋 REQUISITOS MÍNIMOS PARA EL USUARIO

El usuario que reciba tu proyecto NECESITA:
- ✓ Windows, Mac o Linux
- ✓ Node.js v16+ (se verifica automáticamente)
- ✓ MongoDB Community (se verifica automáticamente)
- ✓ ~2GB de espacio libre

---

## 🔐 ARCHIVOS IMPORTANTES A INCLUIR

✓ `install.bat` - Instalador para Windows
✓ `install.sh` - Instalador para Mac/Linux
✓ `start.bat` - Ejecutar en Windows
✓ `start.sh` - Ejecutar en Mac/Linux
✓ `INSTALACION.md` - Guía de instalación
✓ `mongo/package.json` - Dependencias
✓ `mongo/*.js` - Scripts de BD
✓ Todos los archivos JSON y HTML

❌ NO incluir: `mongo/node_modules/` (muy pesado)

---

## 📊 COMPARATIVA DE MÉTODOS

| Método | Tamaño | Facilidad | Colaboración |
|--------|--------|-----------|--------------|
| ZIP | 10-50 MB | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| GitHub | 5-10 MB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| EXE | 30-100 MB | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

**Recomendación**: Usa **GitHub** si es para colaborar, **ZIP** si es para una tarea, **EXE** si quieres algo profesional.
