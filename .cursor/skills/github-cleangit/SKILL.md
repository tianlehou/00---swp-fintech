---
name: github-cleangit
description: >-
  Elimina ramas secundarias en origin (y locales huérfanas), conservando main,
  cursor/agent-work y squash-zone. Usar con atajo cleangit.
---

# GitHub Clean Branches (`cleangit`)

Atajo: **`cleangit`**. Memoria: `.cursor/memory/github-cleangit.md`.  
Relacionado: `gp` / `gpsquash` (no sustituyen este flujo).

Sin atribución de Cursor/agente en mensajes al usuario.

## Objetivo

Borrar **ramas remotas secundarias** en `origin` que ya no hacen falta (p. ej. `cursor/feature-abc-80b0` tras merge), y alinear ramas **locales** que quedaron huérfanas (`[gone]`).

## Ramas protegidas (nunca borrar)

Coincidencia **exacta** del nombre corto (sin `origin/`):

| Rama | Motivo |
|------|--------|
| `main` | Producción |
| `squash-zone` | Cola de `gpsquash` |
| `cursor/agent-work` | Trabajo granular (`gp`) |

**Prohibido** borrar cualquier otra cosa fuera de la lista explícita que el usuario confirme en el paso de preview.

## Cuándo ejecutar

- Atajo **`cleangit`**, o pedido explícito de limpiar ramas secundarias en GitHub.

## Premisas (abortar o avisar)

1. **Confirmación humana obligatoria** tras mostrar la lista (paso 2). Sin «sí» / «adelante» / equivalente claro: **no borrar**.
2. Si el checkout actual está en una rama que aparecería en la lista de borrado: **detener** y pedir cambiar de rama (p. ej. `main` o `cursor/agent-work`) antes de continuar.
3. Working tree con cambios sin commit: **avisar**; no es bloqueante si el usuario confirma, pero no hacer checkout destructivo.

## Flujo

### 0. Remoto al día

```bash
git fetch origin --prune
```

### 1. Calcular candidatas remotas

Listar ramas en `origin` y excluir protegidas:

```bash
git for-each-ref refs/remotes/origin --format='%(refname:short)' \
  | sed 's|^origin/||' \
  | grep -v '^HEAD$' \
  | grep -vx 'main' \
  | grep -vx 'squash-zone' \
  | grep -vx 'cursor/agent-work' \
  | sort
```

Equivalente legible:

```bash
git branch -r --format='%(refname:short)' | sed 's|^origin/||' | sort -u
```

Filtrar manualmente las tres protegidas y `HEAD`.

### 2. Preview y confirmación

Mostrar al usuario:

- Número de ramas a borrar en **origin**.
- Lista completa (una por línea).
- Recordatorio de las **tres** ramas que **no** se tocan.

Preguntar confirmación explícita. Si la lista está vacía: informar «no hay ramas secundarias que borrar» y terminar.

### 3. Borrar en origin

Por cada rama confirmada:

```bash
git push origin --delete <nombre-rama>
```

Reglas:

- Usar el nombre **sin** prefijo `origin/` (p. ej. `cursor/demo-salas-ejemplos-cea2`).
- Si un push falla (permisos, rama protegida en GitHub, red): **registrar** el error, seguir con las demás si el usuario lo pidió, y resumir al final las que fallaron.
- Reintentos de red: hasta 4 veces con backoff 4s, 8s, 16s, 32s (solo errores de red).

**Prohibido:**

- `git push --delete` sobre `main`, `squash-zone` o `cursor/agent-work` (doble comprobación antes de cada delete).
- Force-push a `main` o reescritura de historial de ramas protegidas.

### 4. Limpiar ramas locales huérfanas

Tras borrar en remoto, actualizar refs y listar locales cuyo upstream desapareció:

```bash
git fetch origin --prune
git branch -vv | grep ': gone]' || true
```

Para cada rama local con `[gone]`:

- **No borrar** si es `main`, `squash-zone` o `cursor/agent-work` (por nombre local).
- **No borrar** la rama del checkout actual.
- Borrar el resto:

```bash
git branch -d <rama-local>
```

Si `-d` rechaza por commits no fusionados, **no** usar `-D` salvo confirmación explícita del usuario para esa rama.

### 5. Resumen al usuario

Informar:

- Ramas remotas eliminadas (conteo + nombres).
- Ramas locales eliminadas (si hubo).
- Errores o ramas omitidas (checkout, protegidas, `-d` rechazado).
- Que siguen intactas: `main`, `squash-zone`, `cursor/agent-work`.

**Prohibido** en la respuesta: mencionar Cursor, agente o que «el agente borró»; describir solo el resultado en GitHub/Git local.

## Casos especiales

| Caso | Acción |
|------|--------|
| Rama protegida en GitHub (rulesets) | Reportar error del push; no insistir con force |
| Solo limpieza local, sin tocar remoto | Fuera de alcance de `cleangit` salvo pedido explícito distinto |
| Borrar también `main` / agent-work / squash-zone | **Rechazar**; no es parte de este skill |
| Usuario pide excluir una rama de la lista | Respetar exclusiones antes del paso 3 |

## Relación con otros flujos

- **`gp`**: publica en la rama actual; no elimina ramas.
- **`gpsquash`**: usa `squash-zone` y `cursor/agent-work`; por eso están protegidas.
- Tras limpiar, un nuevo `git fetch origin --prune` deja el entorno consistente para ramificar desde `main`.
