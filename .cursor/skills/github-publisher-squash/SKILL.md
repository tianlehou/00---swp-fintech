---
name: github-publisher-squash
description: >-
  Cierra un bloque: une agent-work → squash-zone (1 commit), luego squash-zone
  → main (1 commit). agent-work permanece granular. Usar con atajo gpsquash.
---

# GitHub Publisher Squash (`gpsquash`)

Atajo: **`gpsquash`**. Memoria: `.cursor/memory/github-gpsquash.md`.  
Relacionado: `gp` / `github-publisher`.

Sin atribución de Cursor/agente. Identidad Git: `GIT_AUTHOR_*` / `GIT_COMMITTER_*` = `git config user.name` / `user.email`.

## Modelo del grafo (obligatorio)

**Camino por defecto** (agent-work solo adelante de main — caso habitual):

```
main:         ── M0 ───────────── Join_main ── (sigue)
                   \              /
squash-zone:        └── Join_sz ─┘     luego reset a Join_main
                         /
agent-work:         c1··cN ─────────── (tip sigue granular;
                                        luego merge main → agent-work)
```

| Paso | Qué | Resultado |
|------|-----|-----------|
| 1 | `merge --no-ff agent-work` en squash-zone (tip = main) → **`Join_sz`** | **1 commit** une agent-work → squash-zone |
| 2 | `merge --no-ff squash-zone` en main → **`Join_main`** | **1 commit** une squash-zone → main |
| 3 | Reset solo `squash-zone` a `main` | squash-zone al día |
| 4 | En agent-work: **`merge --no-ff origin/main`** (no reset hard) | Tip avanza; línea granular visible |

**Camino alternativo** (solo si el merge del paso 1 falla o hay divergencia de árboles): ver § «Fallback con commit S».

### Reglas de producto

- **`agent-work` siempre se ve granular**: no borrar ni resetear el tip a `main`. Tras publicar, solo **merge** de `main` hacia agent-work.
- **`main` no recibe** merge directo de agent-work; entra vía `Join_sz` → `Join_main`.
- **No crear commit `S`** salvo fallback (§ abajo). Evita nodo redundante en Git Graph cuando el merge es trivial.
- Vista limpia de producción: `git log --first-parent main` → `Join_main`, `M0`, …

## Cuándo ejecutar

- Atajo **`gpsquash`**, o pedido explícito de cerrar bloque agent → squash-zone → main.

## Premisas (abortar si fallan)

1. Working tree limpio.
2. `cursor/agent-work` al día con remoto.
3. `main` / `origin/main` al día (`fetch`).
4. Tip de agent-work incluye todo lo publicable (si falta, `gp` antes).
5. Confirmar rango con el usuario.

## Ramas

| Rama | Rol |
|------|-----|
| `cursor/agent-work` | Commits granulares (`gp`); **permanece** en esa línea |
| `squash-zone` | `Join_sz` (+ `S` solo en fallback); luego reset a `main` |
| `main` | Solo `Join_main` (1 commit de unión por bloque) |

## Flujo

### 0. Confirmación

Mostrar `main..cursor/agent-work`, mensaje propuesto de `Join_sz` / `Join_main`. Pedir «sí» / «adelante».

### 1. Fetch

```powershell
git fetch origin
git checkout main
git pull origin main
```

Si no hay commits de agent por delante de main: abortar.

Comprobar ancestro (opcional, recomendado):

```powershell
git merge-base --is-ancestor origin/main origin/cursor/agent-work
```

Exit 0 → camino por defecto (§2). Exit distinto de 0 → fallback § «Fallback con commit S».

### 2. agent-work → squash-zone (por defecto: solo `Join_sz`)

```powershell
git checkout squash-zone
# Si no existe: git checkout -b squash-zone origin/main
git reset --hard origin/main
```

Mensajes en UTF-8, UTC−5, versión = tip agent-work. **Escribir el mensaje de merge después de cualquier `read-tree`** (el paso fallback puede sobrescribir archivos del working tree).

```
vX.XX.XXX YYYY-MM-DD HHh:MMm merge: agent-work → squash-zone

- Une la línea granular a squash-zone (1 commit)
- Rango: <from>..<to> (N commits)
- Historial c1…cN queda como segundo padre
```

Identidad + merge:

```powershell
git merge --no-ff origin/cursor/agent-work -F commit-message-join-sz.txt
```

Si el merge **conflictúa** o el árbol resultante no coincide con el tip de agent-work: abortar merge (`git merge --abort`), aplicar § «Fallback con commit S».

Excluir `environment.ts` / `environment.prod.ts` del índice antes del push si aparecieron (silencio).

```powershell
git push --force-with-lease origin squash-zone
```

### 3. squash-zone → main (1 unión)

```powershell
git checkout main
git pull origin main
git merge --no-ff origin/squash-zone -F commit-message-join-main.txt
git push origin main
```

Mensaje `Join_main`:

```
vX.XX.XXX YYYY-MM-DD HHh:MMm merge: squash-zone → main

- Une squash-zone a main (1 commit)
- first-parent: línea limpia de producción
```

**Prohibido:** FF-only, merge directo de agent-work a main, force push a `main`.

### 4. Actualizar ramas de trabajo

**squash-zone** → tip de main:

```powershell
git checkout squash-zone
git reset --hard origin/main
git push --force-with-lease origin squash-zone
```

**agent-work** → **no** `reset --hard origin/main`:

```powershell
git checkout cursor/agent-work
git merge --no-ff origin/main -F commit-message-join-agent.txt
git push origin cursor/agent-work
```

Mensaje merge main → agent-work:

```
vX.XX.XXX YYYY-MM-DD HHh:MMm merge: main → agent-work

- Reengancha agent-work al tip de main tras gpsquash
- Conserva la historia granular como padre
```

Los siguientes `gp` parten de este tip.

### 5. Verificación

```powershell
git log --oneline --graph --decorate -25 origin/main origin/squash-zone origin/cursor/agent-work
git log --oneline --first-parent -5 origin/main
```

Comprobar author/committer (sin `cursoragent`).

## Fallback con commit `S` (solo si hace falta)

Usar cuando:

- `merge --no-ff agent-work` en §2 **conflictúa** y no se resuelve limpio, o
- `main` **no** es ancestro del tip de agent-work (ramas divergentes), o
- Tras merge, el árbol ≠ tip de agent-work y debe forzarse el árbol de agent.

```powershell
git checkout squash-zone
git reset --hard origin/main
git read-tree -u --reset origin/cursor/agent-work
git reset HEAD -- src/environments/environment.ts src/environments/environment.prod.ts 2>$null
```

Commit `S` — **escribir `commit-message-squash.txt` después del `read-tree`**:

```
vX.XX.XXX YYYY-MM-DD HHh:MMm chore(squash): agent-work → squash-zone

- Mismo árbol que cursor/agent-work @ <short-sha>
- Rango: <from>..<to> (N commits)
- Fallback: merge directo no aplicable
```

```powershell
git commit -F commit-message-squash.txt
git merge --no-ff origin/cursor/agent-work -F commit-message-join-sz.txt
git push --force-with-lease origin squash-zone
```

Continuar desde §3. En fallback hay **2 commits** en squash-zone (`S` + `Join_sz`); es aceptable solo en este caso.

## Revert en main

```powershell
git revert -m 1 <sha-de-Join_main>
```

Luego alinear squash-zone a main; en agent-work decidir con el usuario.

## Relación con `gp`

| Atajo | Uso |
|-------|-----|
| `gp` | Commit granular en la **rama actual** del checkout (no duplicar en otra rama) |
| `gpsquash` | Join_sz + Join_main (+ `S` solo fallback); agent-work mergea main |

## Prohibido

- `reset --hard origin/main` en **agent-work** dentro de `gpsquash`.
- Mergear agent-work **directo** a main.
- Commit `S` en el **camino por defecto** (merge trivial).
- `merge --ff-only` de squash-zone a main.
- Force push a `main`.
- Ejecutar sin confirmación del rango.
- Commits o tags de backup (`backup/squash-*`, `backup/agent-block-*`, etc.).

## Comunicación al usuario

- Versión / títulos de `Join_sz`, `Join_main` (y `S` solo si hubo fallback)
- Que agent-work sigue en línea granular
- `git log --first-parent main` = vista limpia
- Revert: `git revert -m 1 <Join_main>`
