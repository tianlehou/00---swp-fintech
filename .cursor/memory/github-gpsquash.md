# GitHub — flujo `gpsquash`

Skill: `.cursor/skills/github-publisher-squash/SKILL.md` · Atajo: **`gpsquash`**.

## Modelo (por defecto)

1. **`agent-work`**: historial **granular** (`gp`). No `reset --hard` a main.
2. **agent-work → squash-zone**: solo **`merge --no-ff` agent-work** → **`Join_sz`** (1 commit; sin commit `S` intermedio).
3. **squash-zone → main**: **`merge --no-ff` squash-zone** → **`Join_main`**.
4. `squash-zone` ← reset a `main`.
5. `agent-work` ← **`merge --no-ff` main**.

**Fallback:** commit `S` (`read-tree` + squash) + `Join_sz` solo si el merge directo falla o hay divergencia de árboles.

Vista limpia: `git log --first-parent main`.

## Prohibido

- Merge directo agent-work → main  
- FF-only squash-zone → main  
- Reset hard de agent-work a main  
- Commit `S` en el camino habitual (merge trivial)  
- Commits o tags backup (`backup/squash-*`, etc.)

## Identidad / fechas

Igual que `gp` (UTC−5, author = `git config`).

## Relación

- Cotidiano: `gp`  
- Cierre de bloque: skill `github-publisher-squash`
