---
name: home-inicio-motion
description: Animaciones de la página /inicio (home) al estilo Cliente Plus — hojas escalonadas, cambio de pestaña con salida, toggle guardadas y menú de filtros. Usar al editar home, salas-filters o listas tipo card en inicio.
---

# Movimiento en `/inicio`

Patrón copiado de la página de inicio de Cliente Plus y fijado en Genkidamás. Regla: `.cursor/rules/home-inicio.mdc`.

## Cuándo usar

- Cambios en `src/app/pages/home/**`
- Nuevas listas o paneles en inicio que deban sentirse como «hojas»
- Menús flotantes junto al FAB en Otras salas

## Checklist rápido

1. **Solo transform + opacity**; duración UI &lt; 300ms salvo cajón (`--gk-ease-drawer` 320ms).
2. **Salida más rápida que entrada** (p. ej. 150ms out / 240ms in).
3. **Stagger** 32ms entre ítems, tope ~128ms total de delay.
4. **Dos señales** cuando haga falta: estado inmediato (pestaña, FAB) vs lista visible (`shown`, `othersView`) retrasada tras `sheet-out`.
5. **`prefers-reduced-motion`**: opacidad suave, sin translate.
6. **Montado al cerrar**: filtros y sidebars no se destruyen con `@if` si necesitan animación de salida.

## Archivos de referencia

| Pieza | Archivo |
|-------|---------|
| Lógica pestañas / guardadas | `home.component.ts` |
| Estilos hojas y chrome | `home.component.css` |
| Filtros flotantes | `salas-filters.component.*` |
| Keyframes globales | `src/styles.css` |

## Auditoría más amplia

Para revisar todo el producto: skill `review-animations` (Emil Kowalski) en `.cursor/skills/_agents/skills-for-design-enginners_emil-kowalski/skills/review-animations/SKILL.md`.
