# Tracker de Hábitos

Aplicación web para trackear hábitos diarios, moods y notas. Se sincroniza automáticamente con Google Sheets.

## Características

- 📅 Navegación por fechas (anterior, siguiente, seleccionar fecha específica)
- 📝 Título del día
- 📔 Notas con soporte Markdown
- 😊 Tracking de mood (5 niveles)
- ✅ 6 hábitos booleanos: Trabajo, Amor, Escritura, Lectura, Ajedrez, Gimnasio
- ☁️ Sincronización automática con Google Sheets
- 💾 Backup local con localStorage
- 📱 Diseño responsive

## Uso

Simplemente abre `index.html` en tu navegador o accede a la versión publicada.

## Sincronización con Google Sheets

Los datos se sincronizan automáticamente con tu spreadsheet de Google Sheets cada vez que realizas un cambio.

## Tecnologías

- Vue.js 3
- Marked.js (renderizado de Markdown)
- Google Apps Script (backend)
- LocalStorage (backup local)
