# Build — no de rutina (sin compuerta en `gp`)

## Regla

- **NO** ejecutar `ng build` después de cada cambio.
- **Prohibido** como rutina tras cambios cosméticos (CSS, copy, márgenes, labels).
- **Prohibido** como paso obligatorio de **`gp`** — el publish debe ser rápido; no bloquear el commit/push con un build completo.

`npx ng build` **sí** cuando:

1. **Riesgo real de errores de template/Angular** que `tsc --noEmit` no ve, por ejemplo:
   - varios componentes nuevos o plantillas tocadas
   - shared usados en muchos sitios
   - refactor de inputs/outputs o rutas de imports
2. **El usuario lo pide**, o reporta un error de compile en `ng serve` / app desplegada y conviene revalidar con build.

- Ante la duda de riesgo bajo: **no** correr build; revisar el cambio con cuidado o preguntar.
- Máximo **un** build por tarea, salvo fallo que haya que revalidar tras corregir.

## Verificación rápida

- Preferir primero `npx tsc --noEmit` para TypeScript puro (solo si hay riesgo de TS; no como rutina de `gp`).
- `tsc` no detecta errores de template (solo el compilador de Angular en el build los ve); si el cambio toca HTML/bindings de riesgo, el build discrecional aplica **fuera** del flujo `gp`, o el usuario lo pide.

## Relación

- Regla de sesión: `.cursor/rules/workflow-session.mdc`
- Flujo de commit: `.cursor/memory/github-gp.md` / regla `github-gp.mdc`.
- Regla general de leer memoria antes de actuar: `agent-read-rules-first.mdc`.
