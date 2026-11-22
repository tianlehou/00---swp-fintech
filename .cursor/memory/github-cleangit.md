# GitHub — flujo `cleangit`

Skill: `.cursor/skills/github-cleangit/SKILL.md` · Atajo: **`cleangit`**.

## Qué hace

1. `git fetch origin --prune`
2. Lista ramas en `origin` **excepto** `main`, `squash-zone`, `cursor/agent-work`
3. Muestra preview → **confirmación obligatoria**
4. `git push origin --delete <rama>` por cada candidata
5. Opcional: borrar ramas locales con upstream `[gone]` (`git branch -d`, sin `-D` salvo OK explícito)

## Protegidas (nunca borrar)

- `main`
- `squash-zone`
- `cursor/agent-work`

## Prohibido

- Borrar las tres ramas protegidas
- Borrar sin confirmación del usuario
- Borrar la rama del checkout actual sin cambiar antes de rama
- `git branch -D` masivo sin confirmación por rama

## Relación

- Publicar trabajo: `gp`
- Cierre de bloque: `gpsquash`
- Limpieza de ramas feature/`cursor/*` obsoletas: **`cleangit`**
