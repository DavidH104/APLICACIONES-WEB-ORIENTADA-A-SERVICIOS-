# Instalador de Mundial 2026 para Windows

## Archivo para compartir

Entrega únicamente:

`dist\Mundial2026-Setup.exe`

El compañero no necesita instalar Node.js, npm ni MongoDB. Todo está incluido.

## Instalación y uso

1. Ejecutar `Mundial2026-Setup.exe`.
2. Mantener la carpeta de instalación sugerida.
3. Al terminar, abrir **Mundial 2026** desde el menú Inicio.
4. La aplicación se abre en `http://127.0.0.1:18080`.

La primera apertura tarda más porque prepara la base de datos. Las siguientes aperturas conservan todos los cambios.

## Administración

- Usuario: `admin@mundial.local`
- Contraseña: `admin123`

## Datos y desinstalación

Los datos se guardan en `%LOCALAPPDATA%\Mundial2026` y no se borran al desinstalar, para evitar pérdidas accidentales.

La aplicación y MongoDB sólo escuchan en la computadora local. Los puertos usados son:

- Aplicación: `18080`
- MongoDB privado: `27127`

## Internet

La aplicación, la API y la base de datos funcionan localmente. El mapa, las rutas, las banderas y los botones para compartir necesitan internet. Si Leaflet no puede descargarse, se muestra un aviso en el área del mapa y las demás secciones continúan funcionando.

## Diagnóstico

Si el acceso directo no abre la aplicación, ejecutar `start-debug.cmd` dentro de la carpeta de instalación. Los registros están en:

`%LOCALAPPDATA%\Mundial2026\logs`

## Volver a generar el instalador

En la computadora de desarrollo, ejecutar `create-installer.bat`. El resultado se guarda en `dist`.
