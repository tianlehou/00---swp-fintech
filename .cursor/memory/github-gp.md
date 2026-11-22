# GitHub — flujo `gp`

Antes de **cualquier** `git push`: ejecutar el skill **`github-publisher`** (atajo `gp`). Regla unificada: `.cursor/rules/github-gp.mdc`.

## Remoto

Antes de crear rama desde `main`, rebasear o `gp`/push:

- `git fetch origin` (mínimo `main`).
- Si `origin/main` va delante del `main` local, alinear la rama de trabajo **antes** de commit, bump de versión o PR.
- No confiar en snapshots ni en el checkout local sin comparar con remoto.

Regla: `.cursor/rules/github-gp.mdc` («Remoto antes de ramificar o publicar»).

## Obligatorio

1. Leer `.cursor/skills/github-publisher/SKILL.md` y seguir el flujo completo.
2. Rama de destino: **la rama actual del checkout**. Un solo commit + push a esa rama; **no** tocar otras ramas en el mismo `gp`.
3. **Un solo commit** por `gp` (no varios por subtarea).
4. **No** commit/push si las tareas no están completas o hay duda.
5. Commit versionado vía `commit-message.txt`; bump `APP_VERSION` + `public/app-version.json`.
6. Excluir `environment*` de staged si aplica (sin mencionarlo en el mensaje).
7. **Identidad Git:** `GIT_AUTHOR_*` y `GIT_COMMITTER_*` = `git config user.name` / `user.email` en cada commit/amend; verificar que no quede `cursoragent` como author/committer antes del push.
8. Sin coautor / trailers / menciones de Cursor o «el agente» en commit ni al usuario.
9. Push solo a la rama actual; merge a `main` solo si el usuario lo pide (o `gpsquash` cuando corresponda).
10. Dentro de `gp`, el agente **sí** puede `git add` lo necesario para publicar (excepción a `workflow-session.mdc`).

## Fecha y hora del título (UTC−5)

En el título `vX.XX.XXX YYYY-MM-DD HHh:MMm …`:

- Calcular **fecha y hora en zona local UTC−5** (Panamá).
- **Prohibido** usar la hora UTC del servidor/CI sin convertir.
- Linux/macOS: `TZ=America/Panama date '+%Y-%m-%d %Hh:%Mm'` (o `Etc/GMT+5`).
- PowerShell: `(Get-Date).ToUniversalTime().AddHours(-5)` y formatear `yyyy-MM-dd` / `HH'h':mm'm'`.

## Versión inicial

El primer commit del repo (`First Commit`) no trae `vX.XX.XXX`. La base está en `APP_VERSION` = `v0.01.000`. El primer `gp` incrementa el patch desde esa base.

## Prohibido

- Commit + push improvisados sin `gp`.
- Varios commits en un mismo `gp`.
- Cambiar de rama / cherry-pick / segundo push «para alinear» otra rama en el mismo `gp`.
- Publicar trabajo incompleto.
- Atribuir el commit a Cursor / agente en mensajes.
- Dejar en GitHub «cursoragent committed» (committer/author incorrecto).
- Poner en el título la hora UTC del entorno en lugar de UTC−5.
- `gp` cotidiano sobre `main` sin pedido explícito.

## Relación

- Regla: `.cursor/rules/github-gp.mdc`
- Skill: `.cursor/skills/github-publisher/SKILL.md`
- Atajo: `gp`
- Cierre de bloque: atajo **`gpsquash`** · skill `github-publisher-squash` · memoria `github-gpsquash.md` (agent granular → squash-zone → main)
- Limpieza de ramas secundarias: atajo **`cleangit`** · skill `github-cleangit` · memoria `github-cleangit.md`
- Leer reglas antes de actuar: `.cursor/rules/agent-read-rules-first.mdc`
