---
name: extract-child-component
description: >-
  Extrae un fragmento de plantilla o lógica de un componente Angular a un componente hijo nuevo (standalone), define entradas y salidas con signals, e integra el selector en el padre. Usar cuando el usuario pida sacar una parte del código a un componente, extraer UI a un hijo, dividir un template grande o refactorizar en subcomponentes.
---

# Extraer a componente hijo (Angular)

## Objetivo

Tomar **una parte acotada** del HTML/TS/CSS del componente actual, moverla a un **nuevo componente standalone** y **usarlo como hijo** en el padre sin cambiar el comportamiento observable.

## Antes de tocar código

1. Leer `.cursor/memory.md` y las reglas de `.cursor/rules/` que apliquen al fragmento (`modal.mdc` si es un modal, `sidebar.mdc` si es un sidebar).
2. Identificar el **corte**: qué bloque HTML y qué métodos/propiedades solo sirven a ese bloque.
3. Elegir **nombre y carpeta**: subcarpeta junto al padre con los tres archivos (ej. `pages/home/create-sala-modal/create-sala-modal.component.ts`). Si lo van a usar varias páginas, va en `src/app/shared/components/`.
4. Listar las **entradas** y **salidas** necesarias (datos que el padre tiene; eventos que el hijo debe emitir).

## Flujo de trabajo

### 1. Crear el hijo

- Crear manualmente los tres archivos: `*.component.ts`, `*.component.html` y `*.component.css` con `styleUrl`.
- `standalone: true`. En `imports` solo lo que use la plantilla (`RouterLink`, otros hijos, componentes de `@shared/components/...`). El control de flujo `@if` / `@for` no necesita `CommonModule`.
- En el `.ts`: usar la API de signals, igual que el resto del proyecto:
  - `readonly dato = input.required<Tipo>()` o `input(valorPorDefecto)`.
  - `readonly cambio = output<Tipo>()`.
  - `model()` si el padre necesita enlace en dos direcciones (`[(valor)]`).
  - `inject()` en lugar de inyección por constructor.
  - Tipos del dominio desde `@shared/models/...`.
- En el `.html`: pegar el fragmento extraído; sustituir variables del padre por las entradas del hijo (`dato()`).
- En el `.css`: mover las reglas que solo afectaban a ese fragmento.

### 2. Mover lógica

- Métodos que **solo** usa el hijo: pasarlos al hijo. Si el padre también los necesita, duplicar un helper mínimo; preferir un **servicio** solo si la duplicación es real.
- Estado que vivía en el padre pero es **propio del hijo**: migrarlo al hijo como `signal()`. Si el padre debe refrescar datos, el hijo emite una salida y el padre recarga.
- `inject()` de servicios: moverlo al hijo **solo** si el hijo es el único dueño; si no, mantenerlo en el padre y pasar los datos por entradas.

### 3. Integrar en el padre

- Añadir el hijo a `imports: [...]` del `@Component` del padre.
- Sustituir el bloque HTML por `<app-selector-del-hijo ... />` con bindings:
  - `[dato]="valorPadre()"`
  - `(cambio)="manejador($event)"`
- Si el padre debe abrir o controlar al hijo (modales, sidebars), usar `viewChild(HijoComponent)` o una referencia de plantilla `#hijo` y llamar a su método público (`open()`).
- Eliminar del padre el código y los estilos ya movidos; limpiar imports sin uso.
- Verificar que el **selector** del hijo sea único (`selector: 'app-...'`).

### 4. Verificar

- Revisar la salida de `ng serve` (si está corriendo) o `ReadLints` en los archivos tocados.
- Las plantillas tienen chequeo estricto: una variable de plantilla sin tipo (`let-x` en `ng-template`) falla al indexar mapas tipados. Preferir entradas tipadas en el hijo.
- `npx ng build` solo si el corte toca varios componentes o piezas compartidas usadas en muchas páginas (ver `.cursor/memory/build-pre-gp.md`). Máximo uno por tarea.
- Probar la vista afectada con un flujo manual breve.

## Convenciones de este repo

- **Modal:** componente hijo de su página según `.cursor/rules/modal.mdc`.
- **Sidebar:** componente hijo según `.cursor/rules/sidebar.mdc`.
- **Botón de cerrar:** `app-ui-close-button` (`src/app/shared/components/ui-close-button/`).
- **Tabs:** `app-ui-tab` (`src/app/shared/components/ui-tab/`).
- Colores y medidas con las variables `--gk-*` de `src/styles.css`.
- No ampliar el refactor a archivos que no hagan falta para la extracción.
- Dejar los cambios sin stagear (`workflow-session.mdc`).

## Checklist rápido

- [ ] Hijo con `.ts`, `.html`, `.css` y `styleUrl`.
- [ ] Entradas y salidas con `input()` / `output()` tipados y nombres claros.
- [ ] El padre importa el hijo standalone.
- [ ] Sin lógica muerta ni estilos duplicados innecesarios.
- [ ] `ng serve` compila sin errores.

## Salida esperada

Resumen de: archivos creados, selector del hijo, entradas/salidas y cambios en el padre.
