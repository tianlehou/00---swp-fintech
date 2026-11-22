# Pitch deck — diseño de layout (v1)

Diseño acordado para **imagen ajustada al slide (incl. detrás del texto)** y **posición del bloque de texto**, sin convertir la sala en un editor libre tipo Canva. **Implementado (v1)** en `PitchDeckSlide.layout`, `app-pitch-deck-slide-canvas` y modal `app-pitch-deck-slide-design-modal` (botón bajo la preview en `sala-pitch-deck`).

## Objetivos

- Que la foto del usuario pueda **llenar la lámina 16:9** y quedar **detrás** del copy con legibilidad garantizada.
- Que el equipo pueda **colocar el bloque de texto** (kicker + titular + viñetas) en posiciones útiles sin arrastre pixel a pixel en v1.
- Mantener la **plantilla Sequoia 10** (ids, hints, flujo Lean, guardado en `pitch_decks.slides` JSONB).

## Fuera de alcance (v1)

- Rotación, capas múltiples, cajas de texto independientes, fuentes/tamaños custom.
- Export PDF/PPTX con layout exacto (prever el mismo modelo para una fase posterior).
- Edición en móvil con drag fino (solo presets + controles del panel).

## Modelo de datos

No hace falta migración SQL: los campos nuevos viven dentro de cada objeto del array `slides`. `mergeStoredSlides` / `cleanDocument` deben **rellenar defaults** si faltan claves.

### Tipos (`pitch-deck.model.ts`)

```ts
/** Mitad imagen + mitad texto (comportamiento actual). */
export type PitchDeckLayoutMode = 'split' | 'background';

/** Encuadre de la imagen en su área (split o fondo). */
export type PitchDeckImageFit = 'cover' | 'contain';

/**
 * Ancla del bloque de texto dentro del slide (coordenadas lógicas 16:9).
 * Un solo bloque: kicker + titular + lista.
 */
export type PitchDeckTextAnchor =
  | 'top-left'
  | 'top-center'
  | 'center-left'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface PitchDeckSlideLayout {
  mode: PitchDeckLayoutMode;
  textAnchor: PitchDeckTextAnchor;
  imageFit: PitchDeckImageFit;
  /** Intensidad del scrim sobre la imagen (0 = ninguno, 100 = muy oscuro). Solo aplica en `background`. */
  overlay: number;
  /** Punto de encuadre de la imagen, 0–100 (mapea a object-position). */
  imageFocusX: number;
  imageFocusY: number;
}

export interface PitchDeckSlide {
  id: string;
  headline: string;
  bullets: string;
  presenterNotes: string;
  imageSrc?: string | null;
  imageAlt?: string | null;
  layout: PitchDeckSlideLayout;
}
```

### Defaults

| Campo | Valor por defecto | Notas |
|--------|-------------------|--------|
| `layout.mode` | `'split'` | Decks ya guardados sin `layout` → split (paridad visual actual). |
| `layout.textAnchor` | `'center-left'` en split; `'bottom-left'` en background | Al cambiar modo, sugerir ancla recomendada si el usuario no tocó posición. |
| `layout.imageFit` | `'cover'` | |
| `layout.overlay` | `40` en background; `0` en split | Split no pinta scrim full-slide. |
| `layout.imageFocusX/Y` | `50` / `50` | Centro. |

Constante recomendada: `DEFAULT_PITCH_DECK_SLIDE_LAYOUT(mode)` en template o util.

### Límites en `PitchDeckService`

- `overlay`: entero 0–100.
- `imageFocusX/Y`: entero 0–100.
- Enums: rechazar valores desconocidos → default.
- `pitchDeckChanged` / `normalizeForCompare`: incluir `layout` normalizado.

## Render (preview = verdad)

Contenedor único **16:9** (`aspect-ratio: 16/9`), `position: relative`, `overflow: hidden`.

### Modo `split` (actual)

- Grid dos columnas (~52% / 48%) como hoy.
- Columna visual: imagen o ilustración por defecto (`resolvePitchDeckSlideVisual`), `object-fit` según `imageFit`, `object-position` desde focus.
- Columna cuerpo: fondo blanco, texto alineado al inicio verticalmente (ignorar `textAnchor` en v1 o mapear solo a `text-align` horizontal si se desea).

### Modo `background`

Capas (z-index de abajo arriba):

1. **Fondo**: imagen usuario si `imageSrc`; si no, ilustración por defecto a pantalla completa (misma resolución que hoy).
2. **Scrim**: gradiente + opcional tinte (`overlay` → opacidad máx ~0.65 en el borde opuesto al texto).
   - Regla simple: scrim más fuerte hacia la esquina donde está `textAnchor` (ej. `bottom-left` → gradiente desde abajo-izquierda).
3. **Bloque texto**: posicionado con `absolute` + inset según ancla; `max-width: ~58%` del slide; padding interno 1.1–1.25rem.
4. **Panel legibilidad opcional**: en anclas centrales, fondo `color-mix(white 88%, transparent)` con `border-radius` suave (solo si contraste insuficiente en QA).

Mapa ancla → CSS (conceptual):

| `textAnchor` | Posición |
|--------------|----------|
| `top-left` | `top/left` + align start |
| `top-center` | `top` + horizontal center |
| `center-left` | vertical center + left |
| `center` | center |
| `bottom-left` | bottom + left |
| `bottom-center` | bottom + center |
| `bottom-right` | bottom + right |

Tipografía: sin cambios respecto a clases actuales (`deck-preview__*`).

## UX de edición

Principio: **la preview es el lienzo**; el panel lateral sigue para copy largo (titular, viñetas, notas, imagen, alt).

### Controles nuevos (panel «Diseño de la lámina»)

Debajo del campo imagen, bloque compacto:

1. **Disposición** — segment control: `Mitad y mitad` | `Imagen de fondo`.
2. **Posición del texto** — grid 3×3 de botones (icono/miniaturo), solo habilitado en `background`; en `split` oculto o deshabilitado con hint «En mitad y mitad el texto va en la columna derecha».
3. **Encuadre** — `Recortar (cover)` | `Entera (contain)`.
4. **Legibilidad** — slider «Oscurecer fondo» (0–100), solo `background`.
5. **Enfoque** (v1.1 opcional) — dos sliders X/Y o arrastrar un punto en miniatura; si se pospone, focus queda en 50/50.

Acciones:

- **Restablecer diseño de esta lámina** — vuelve `layout` a defaults de modo `split` (no borra headline/bullets/imagen).
- Al subir imagen por primera vez: toast sugerencia «¿Usar como fondo?» con acción que pone `mode: background` y `overlay: 40`.

### Interacción en preview (v1)

- Clic en el bloque de texto en modo `background`: resalta borde punteado y **sincroniza** el grid de posición en el panel (no drag libre).
- Sin edición inline del titular en v1 (evita duplicar estado); titular/viñetas siguen en inputs.

### Demo / solo lectura

- Preview respeta `layout` guardado en demos cuando exista; si no, split.
- Sin controles de diseño en read-only.

## Ilustraciones por defecto

- **Split**: igual que hoy (columna izquierda).
- **Background**: misma URL, full bleed + scrim; si `contain`, letterboxing con color `--gk-paper` o gradiente de marca existente.

## Accesibilidad

- `imageAlt` obligatorio recomendado cuando hay `imageSrc` (ya existe el campo).
- Contraste: con `overlay < 25` y texto claro sobre foto clara, mostrar aviso no bloqueante en panel: «Sube un poco la legibilidad del fondo».
- Controles de posición: `aria-pressed` en grid; labels «Texto abajo a la izquierda», etc.

## Fase 2 (cuando haga falta)

- **Arrastre del bloque** en preview: al soltar, snap al preset más cercano; opcional guardar `textAnchor` custom con `textX/textY` (0–100) si ningún preset encaja.
- **Recorte interactivo** (pan/zoom) escribiendo solo `imageFocusX/Y`.
- Presets por id de lámina (ej. `product` → default background) — solo si analytics/m feedback lo piden.

## Checklist de implementación

1. Tipos + `DEFAULT_PITCH_DECK_SLIDE_LAYOUT` + `emptyPitchDeckSlides()`.
2. `mergeStoredSlides` / `cleanDocument` / `pitchDeckChanged`.
3. Refactor preview a componente hijo `app-pitch-deck-slide-canvas` (inputs: slide, visual, readOnly).
4. CSS capas background + mapa de anclas.
5. Panel diseño en `sala-pitch-deck`.
6. Demos: opcional enriquecer 1–2 slides con `background` de ejemplo.
7. Guía `/inicio/pitch-deck`: párrafo breve «diseño de lámina» (solo si el usuario lo pide).

## Relación

- Vista actual: `src/app/pages/startup-space/sala-pitch-deck/`
- Modelo: `src/app/shared/models/pitch-deck.model.ts`
- Persistencia: `public.pitch_decks.slides` (JSONB array)
