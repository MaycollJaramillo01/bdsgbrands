# BDSG Store · Guía de diseño web

> **Versión 2.0 (17-11-2026). Manda sobre todo lo que sigue.** La reconstrucción reemplaza la paleta perla/plum por la del brief. Lo demás (idea, voz, fotografía) sigue vigente salvo donde lo contradiga esto.
>
> - **Paleta:**
>   - Tintas ink-950 `#0B0C0B`, ink-900 `#151715`, graphite-800 `#242724`
>   - Grises stone-600 `#74786F`, stone-400 `#A6AAA0`
>   - Fondos bone-100 `#EEECE5`, bone-50 `#F7F5EF` (fondo principal), milk-00 `#FFFDF8`
>   - Acento sage-500 `#778372` (sage-300 `#AAB4A5` en selección/acentos suaves)
>   - earth-500 `#8A604C`, rara vez
>   - Estados: success `#337A4C`, warning `#A56B24`, error `#A64242`
>   - El plum y el orquídea ya no se usan. Logos en versión negro/blanco.
> - **Tipografía:** Archivo variable, autoalojada. Display 34–76px a 112% de ancho. h1 36–64, h2 30–48, cuerpo 17px, nunca menos de 16 en texto corrido.
> - **Espaciado:** escala de 4px (`--s1`…`--s32`). Ancho máximo 1440px, lectura 720px. Grilla de 12/8/4 columnas.
> - **Radios:** sm 6, md 12, lg 20, xl 28, pill. Botones 10px.
> - **Separadores:** sin líneas finas. Separar con espacio o con cambio de tono; las líneas quedan solo en tablas y campos.
> - **Disponibilidad:** el botón lo decide el estado del producto (`src/lib/availability.ts`). No hay "Add to bag" si no hay stock.
> - **Movimiento:** entradas escalonadas con `[data-reveal]`, de 180–650ms, respetando `prefers-reduced-motion`.
> - **Tokens en código:** `src/app/globals.css`.

**Versión 1.0 · 17-11-2026 · Dirección: skincare editorial sobre blanco nacarado** (paleta reemplazada por la v2)

Esta guía rige el diseño de la tienda online de BDSG. Se apoya en el *Manual de Marca BDSG v3* (Novarius), que sigue mandando en logo, voz y paleta original. Aquí se decide cómo se aplica en la web.

Qué cambia respecto al manual: **los fondos dejan de ser morados**. El morado Plum pasa a ser la tinta (texto, logo, botón), no el fondo.

Etiquetas usadas: **REGLA** (obligatorio), **PREFERENCIA** (por defecto, con excepción justificada), **PROHIBIDO**.

---

## 1. Idea y posicionamiento

**Idea de diseño: "la leche y la piedra".** La base de las cuatro fórmulas es leche de cabra; la cabra vive en la roca. La web es blanca y cálida como la leche, y el producto se apoya sobre piedra, tal como lo muestran sus fotos. El color lo aportan las fotografías, no los fondos.

**Tono visual: editorial.** Se lee como una revista de producto. Hay mucho aire, el producto es protagonista, la tipografía es grande y precisa y nada grita.

| Somos | No somos |
|---|---|
| Calmados, precisos, con espacio | Saturados, con banners y badges |
| Producto protagonista, fotografiado de verdad | Mockups genéricos, 3D, stock |
| Blanco cálido, piedra, leche | Fondos morados, degradados, neón |
| Deportivos en la actitud, no en la estética | Estética de suplemento o gimnasio agresivo |
| Cosmética honesta | Lujo, exclusividad, promesas médicas |

Público, misión y voz: ver el manual de marca, secciones 01 y 06.

---

## 2. Logo en la web

- **REGLA:** el logo horizontal va en **Plum** sobre Nácar o Blanco. Nunca en Orchid ni sobre fotos con detalle.
- **REGLA:** va arriba a la izquierda en la navegación, a 40 px de alto en escritorio y 32 px en móvil.
- **REGLA:** en pestañas y favicon se usa la silueta (`favicon.svg`).
- **PROHIBIDO:** recolorear el logo, ponerle sombra o reconstruir "BDSG" con otra fuente.
- Archivos: `web/public/brand/` (copiados de `assets/logo/svg/` del manual).

---

## 3. Color

### 3.1 Paleta web

| Rol | Nombre | HEX | Uso |
|---|---|---|---|
| Fondo principal | **Nácar** | `#FAF8F5` | Fondo de toda la página |
| Superficie | **Blanco** | `#FFFFFF` | Fichas de producto, carrito, formularios |
| Superficie cálida | **Leche** | `#F3EFE6` | Bloque de foto de producto, una sección de contraste |
| Superficie piedra | **Perla** | `#EFEBE4` | Hover de superficies, etiquetas de ingredientes |
| Tinta | **Plum** | `#462842` | Texto, titulares, logo, botón principal |
| Tinta secundaria | **Slate 500** | `#685C6C` | Notas, precios de miembro, pies de foto |
| Acento | **Orchid** | `#A03A93` | Enlaces en hover, estado activo, un detalle por pantalla |
| Acento fuerte | **Orchid Deep** | `#7D2A72` | Etiquetas de fórmula (01 / 04), hover del botón |
| Indicador | **Lilac** | `#CDB8D6` | Avisos "por confirmar", barra de peldaños vacía |

### 3.2 Proporción

**PREFERENCIA:** 80 % Nácar y Blanco · 12 % fotografía · 6 % Plum (texto y botón) · 2 % Orchid.

### 3.3 Contraste (WCAG 2, calculado)

| Texto sobre | Nácar | Blanco | Leche | Perla |
|---|---|---|---|---|
| Plum | 12,06 | 12,78 | 11,14 | 10,76 |
| Slate 500 | 5,94 | 6,29 | 5,49 | 5,30 |
| Orchid | 5,63 | 5,96 | 5,20 | 5,02 |
| Orchid Deep | 8,10 | 8,58 | 7,48 | 7,23 |

Todas las combinaciones pasan AA (4,5:1) para texto normal. El botón Plum con texto Nácar da 12,06:1.

### 3.4 Reglas

- **REGLA:** ningún fondo de sección en Plum, Orchid o Lilac. El único bloque oscuro permitido es el botón.
- **REGLA:** el texto que se lee va siempre en Plum. El gris (Slate 500) es solo para notas.
- **REGLA:** las superficies se separan con un cambio de tono (Nácar → Blanco → Leche), no con sombras.
- **PROHIBIDO:** degradados, sombras en reposo, Orchid sobre Lilac para texto, blanco puro como fondo de página entera (cansa junto a las fotos rosadas).

---

## 4. Tipografía

**Una sola familia: Archivo** (variable: peso 100–900, ancho 62–125 %). Licencia OFL. Archivo local: `web/public/fonts/Archivo-Variable.ttf`.

El tono editorial sale de usar el eje de ancho con intención:
- **Ancho 125 % + peso 800** solo para el **nombre del producto** y el titular principal. Es la "voz de la marca".
- **Ancho 100 % + peso 500–600** para los titulares de sección. Así se lee calmado, como una revista.

| Nivel | Tamaño escritorio / móvil | Peso | Ancho | Interlínea | Tracking | Uso |
|---|---|---|---|---|---|---|
| Display | 96 / 48 px | 800 | 125 % | 0,95 | −0,02 em | Titular de portada, nombre en ficha |
| Producto | 56 / 36 px | 800 | 125 % | 1,0 | −0,015 em | Nombre de fórmula en listados |
| Sección | 40 / 28 px | 500 | 100 % | 1,1 | −0,02 em | Titulares de sección |
| Entrada | 21 / 18 px | 400 | 100 % | 1,45 | 0 | Frase bajo titular |
| Cuerpo | 17 / 16 px | 400 | 100 % | 1,6 | 0 | Texto corrido |
| Nota | 14 px | 400 | 100 % | 1,5 | 0 | Pies, avisos, legal |
| Etiqueta | 13 px | 600 | 112 % | 1,3 | 0,14 em, versales | Solo "01 / 04 · Repair & Protect" |

- **REGLA:** como máximo cinco tamaños por pantalla.
- **REGLA:** los titulares ocupan dos líneas o menos y van en mayúscula inicial, con punto final según el manual.
- **REGLA:** precios con cifras tabulares y dos decimales: `$33.00`.
- **REGLA:** líneas de lectura de 45 a 75 caracteres (`max-width: 62ch`).
- **PROHIBIDO:** otra familia, cursiva simulada, versales fuera de la etiqueta de fórmula y del botón, y texto de lectura por debajo de 13 px.

Alternativa de sistema: `"Helvetica Neue", Arial, sans-serif`.

---

## 5. Retícula y espacio

- **Retícula:** 12 columnas, con un margen exterior de `clamp(20px, 4vw, 64px)`, igual en los dos lados.
- **Escala de espacio (px):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 160 · 240.
- **Entre secciones:** 160–240 px en escritorio y 96 px en móvil.
- **Esquinas:** radio 0 en todo (botones, fotos, campos).
- **Asimetría:** texto en 5 columnas y foto en 7, o al revés. Nunca centrado salvo un momento por página.
- **PROHIBIDO:** pantallas casi vacías y secciones con todo el contenido pegado a un lado.

---

## 6. Fotografía

**Dos tipos, sin mezclar en el mismo bloque** (manual, sección 05):

1. **Producto:** tubo de frente, vertical, sobre piedra, con uno o dos ingredientes reales y fondo cálido. Formato 2:3 o 4:5.
2. **Personas:** el momento antes o después del esfuerzo, con la mirada fuera de cámara. Formato 3:2 o 16:9.

- **REGLA:** en la página de producto, la foto ocupa al menos el 50 % del ancho y la altura de la pantalla.
- **REGLA:** se mantiene la misma proporción dentro de una fila, con esquinas rectas y sin marcos ni sombras.
- **REGLA:** tratamiento de saturación 80 % y contraste 108 %, el mismo en todas.
- **PROHIBIDO:** antes y después, trofeos, sonrisas a cámara con el producto, fondos de estudio de color y fotos de stock genéricas.
- **Pendiente:** foto de Renewal. Hasta que exista, se usa el tubo dibujado (componente `Tube`).

---

## 7. Componentes

| Componente | Especificación |
|---|---|
| **Botón principal** | Fondo Plum, texto Nácar, 52 px de alto, 28 px de padding lateral, 15 px / 600 / ancho 112 %, sin versales. Hover: Orchid Deep. Al pulsar: escala 0,98. |
| **Botón secundario** | Sin fondo, texto Plum subrayado a 6 px. Hover: Orchid. |
| **Campo de texto** | Fondo Blanco, borde de 1,5 px Plum, 52 px de alto. Foco: anillo Orchid de 3 px. |
| **Navegación** | Fondo Nácar fijo, logo a la izquierda, 3–4 enlaces y "Bag (n)". Sin barra de color. |
| **Ficha de fórmula** | Foto sobre Leche, etiqueta 01 / 04, nombre en Producto, línea de función, precio, botón. |
| **Etiqueta de ingrediente** | Fondo Perla, 8 × 14 px de padding, 15 px / 500. |
| **Peldaños** | Cuatro barras de 25, 50, 75 y 100 % de alto. Llenas en Plum y vacías en Lilac. Es el indicador de fórmula, nunca un logo. |
| **Carrito** | Panel lateral Blanco de 440 px, líneas sobre Perla y total en Plum. |
| **Aviso "por confirmar"** | Fondo Lilac, texto Plum. Solo en borradores legales. |

---

## 8. Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--ease` | `cubic-bezier(.2,.7,.1,1)` | Todo |
| Rápido | 150–200 ms | Hover y pulsado |
| Medio | 350–450 ms | Carrito, menús |
| Lento | 700–1100 ms | Entrada de fotos, cambio de foto fija |

- **Firma:** la foto de producto se abre de abajo arriba con `clip-path` y pasa de escala 1,12 a 1 (1,1 s). Una vez por página.
- **Entradas:** titular, texto y foto suben 24 px con opacidad, escalonados 75 ms.
- **REGLA:** solo `transform` y `opacity`. Con `prefers-reduced-motion` no hay desplazamiento.

---

## 9. Voz en la web (resumen del manual)

- Segunda persona, frases cortas, verbo primero y sin signos de exclamación.
- **Usamos:** work, climb, show up, recover, daily, formula, base, hold, reset.
- **Evitamos:** miracle, flawless, anti-aging, glow up, luxury, cure, heal, clinically proven.
- Declaración cosmética siempre visible en el pie de página.

---

## 10. Sí y no

| ✅ Sí | ❌ No |
|---|---|
| Fondo Nácar con foto grande de producto | Fondo morado o Lilac en una sección |
| Un botón Plum por pantalla | Varios botones de colores |
| Nombre de fórmula ancho y pesado | Todos los titulares anchos y pesados |
| Titular de sección a 500 / 100 % | Versales para titulares |
| Cambio de tono entre superficies | Líneas, sombras o tarjetas con borde |
| "Holds the line against moisture loss." | "Unlock flawless skin!" |
| Etiqueta "01 / 04" solo en fórmulas | Numerar cualquier otra lista |
| Foto real de producto sobre piedra | Mockup 3D o render genérico |

---

## 11. Tokens CSS

```css
:root {
  --nacar: #FAF8F5;  --blanco: #FFFFFF; --leche: #F3EFE6; --perla: #EFEBE4;
  --plum: #462842;   --slate-500: #685C6C; --slate-300: #BDB3C0;
  --orchid: #A03A93; --orchid-deep: #7D2A72; --lilac: #CDB8D6;
  --font: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --m: clamp(20px, 4vw, 64px);
  --gap: clamp(96px, 14vw, 220px);
  --ease: cubic-bezier(.2, .7, .1, 1);
  --radius: 0;
}
```

Implementación: `web/src/app/globals.css`.

---

## 12. Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 17-11-2026 | Primera guía web. Fondos de Plum a Nácar, botón en Plum y titulares de sección a 500 / 100 %. |

**Pendiente de validar con BDSG:** fondo Nácar en lugar de Mist, botón Plum en lugar de Orchid y foto de Renewal.
