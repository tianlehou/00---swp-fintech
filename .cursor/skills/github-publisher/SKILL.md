# GitHub Publisher

Regla unificada: `.cursor/rules/github-gp.mdc` · memoria `.cursor/memory/github-gp.md`.

Sin atribucion de Cursor/agente: ni en el commit, ni en PR, ni en el mensaje al usuario (coautor, `Made-with`, trailers, «Cursor hizo…», «el agente publico…», etc.). Limpiar en silencio si hace falta; al publicar, solo version, titulo y resumen.

**Identidad Git:** cada `git commit` / `--amend` debe usar `GIT_AUTHOR_*` y `GIT_COMMITTER_*` iguales a `git config user.name` / `user.email`. Objetivo: que GitHub **no** muestre «cursoragent committed».

## Gates antes de commit (obligatorio)

0. **Completitud:** no hacer `git commit` ni `git push` si las tareas pedidas no estan completas o hay duda razonable de que falte trabajo. Si el usuario pidio `gp` con pendientes claros: avisar y no publicar.
1. **Un solo commit:** cada ejecucion de este skill produce **exactamente un** commit con todo el trabajo pendiente. Prohibido varios commits por subtarea, docs, minimemoria o pasos intermedios dentro del mismo `gp`.
2. **Rama:** publicar **solo en la rama actual** del checkout (ej. `cursor/marketing` o `cursor/agent-work-cc57`). Prohibido cambiar de rama, cherry-pick o segundo push a otra rama en el mismo `gp`. Si la rama es `main` y el usuario no pidio publicar ahi: detener y preguntar.
3. **Identidad:** fijar author/committer desde `git config` (paso 11); verificar post-commit; no pushear si aparece `cursoragent`.

## Flujo

- Revisa si hay archivos en changes (fuera de staged).
- Si hay cambios, pásalos a staged changes **solo porque estás dentro del flujo `gp`** y luego continúa.
- Después revisa todos los archivos staged changes actuales en el proyecto.
- Analiza qué archivos fueron modificados y cuál es la intención de los cambios.
- Con esa información, genera un mensaje de commit claro, conciso y profesional, siguiendo buenas prácticas de Git.
- **No eliminar** `commit-message.txt`: solo **sobrescribirlo** con el mensaje nuevo (paso 9).

El mensaje debe incluir:
- Un título versionado y con fecha en este formato:
  `vX.XX.XXX YYYY-MM-DD HHh:MMm tipo(scope): mensaje`
  Ejemplo: `v1.01.036 2026-02-18 14h:30m feat(auth): ...`
- La versión debe seguir la secuencia del último commit (incrementar +1 en patch).
- La fecha y la hora deben calcularse en cada ejecucion en **hora local UTC−5** (Panamá). No usar fecha fija ni la hora UTC del servidor/CI sin convertir.
- Linux/macOS: `TZ=America/Panama date '+%Y-%m-%d'` y `TZ=America/Panama date '+%Hh:%Mm'`.
- PowerShell: partiendo de UTC, restar 5 h — p. ej. `$local = (Get-Date).ToUniversalTime().AddHours(-5)` y luego `$local.ToString('yyyy-MM-dd')` / `$local.ToString("HH'h':mm'm'")`.
Antes de cualquier acción, ejecuta este flujo de validación y preparación del repositorio:

0. **Remoto (obligatorio)**
- `git fetch origin` (mínimo `main`; también la rama base si aplica).
- Comparar `origin/main` (u otra base) con el checkout local. Si el remoto va adelante, **alinear la rama de trabajo** (merge o rebase según el flujo) **antes** de versionar, commitear o push.
- Regla: `.cursor/rules/github-gp.mdc` («Remoto antes de ramificar o publicar»).

1. Validación de cambios
- Verifica si existen archivos en changes (fuera de staged).
- Si existen:
  - Agrégalos a staged **solo dentro de `gp`** con:
    git add .
  - Confirma que no queden cambios sin staged antes de continuar.

2. Limpieza de archivos sensibles
- Revisa si en staged existen:
  - src/environments/environment.ts
  - src/environments/environment.prod.ts
- Si contienen credenciales o datos sensibles:
  - Remuévelos de staged hacia Changes SIN descartar cambios:
    git reset HEAD <archivo>
- Regla silenciosa (obligatoria): aplicar la exclusion en git, pero **nunca** mencionarla en el titulo ni en el cuerpo del commit (no escribir "environment.ts excluido", "credenciales locales", ni equivalentes).

3. Análisis del contexto
- Obtén el diff completo de staged:
  git diff --cached

- Analiza:
  - Qué archivos fueron modificados
  - Tipo de cambio (feature, fix, refactor, etc.)
  - Impacto funcional
  - Si hay cambios estructurales
  - Si hay posibles breaking changes

Reglas estrictas:
- No inventar cambios
- No asumir contexto fuera del diff
- No generalizar sin evidencia

4. Cálculo de versión
- Obtén el último commit:
  git log -1 --pretty=format:"%s"

- Extrae la versión vX.XX.XXX
- Incrementa +1 en patch
  Ejemplo:
  v1.01.254 → v1.01.255
- Actualiza `src/app/shared/config/app-version.ts` (`APP_VERSION`) y `public/app-version.json` (`version`) al mismo `vX.XX.XXX` y stagea ambos (modal «Actualizar app»: versión actual vs última).
- Si el último commit no trae `vX.XX.XXX`, partir de la versión escrita en `APP_VERSION`.

5. Generación de fecha y hora dinámica (**UTC−5**)

Zona fija del título de commit: **UTC−5** (no la TZ del contenedor ni UTC puro).

Linux/macOS:
```bash
TZ=America/Panama date '+%Y-%m-%d'
TZ=America/Panama date '+%Hh:%Mm'
```

PowerShell:
```powershell
$local = (Get-Date).ToUniversalTime().AddHours(-5)
$local.ToString('yyyy-MM-dd')
$local.ToString("HH'h':mm'm'")
```

Memoria: `.cursor/memory/github-gp.md` (sección «Fecha y hora del título»).

6. Clasificación del commit
Determina automáticamente el tipo:

- feat → nueva funcionalidad
- fix → corrección de errores
- refactor → cambios sin alterar funcionalidad
- chore → mantenimiento
- docs → documentación
- style → estilos/UI sin lógica
- perf → mejoras de rendimiento

Scope:
- Determinar según carpeta o módulo afectado
  Ej: auth, ui, customer, scanner, affiliates, etc.

7. Generación del commit

Formato obligatorio:

vX.XX.XXX YYYY-MM-DD HHh:MMm tipo(scope): mensaje corto

Reglas:
- Español con ortografía correcta
- Usar tildes en las palabras que las llevan (ej. módulo, integración, migración)
- Usar «ñ» en las palabras que la requieren (ej. año, diseño, dueño)
- Máxima claridad, sin ruido
- Prohibido incluir trailers de atribucion: `Co-authored-by`, `Made-with`, `cursoragent@cursor.com` o similares de Cursor

8. Cuerpo del commit

Debe incluir:

Lista de cambios:
- Bullet points claros basados en el diff
- Agrupar por intención (no por archivo)

Cambios estructurales (si aplica):
- Nuevos directorios
- Nuevos componentes
- Refactors importantes

Notas adicionales (si aplica):
- Breaking changes
- Migraciones necesarias
- Nuevas dependencias

Prohibido en el cuerpo del commit:
- Mencionar exclusion de `environment.ts` / `environment.prod.ts` o credenciales locales (siempre se excluyen en silencio en el paso 2).

9. Escritura del archivo

- **Sobrescribir** `commit-message.txt` con el mensaje generado (crear solo si no existe).
- **Prohibido** borrar o eliminar el archivo antes de escribir.
- Mantener EXACTAMENTE este formato con saltos de linea reales
- Codificacion obligatoria del archivo: **UTF-8 sin BOM**
- En PowerShell, escribir el archivo con una API que fuerce UTF-8 sin BOM. Usar este patron:

```powershell
$commitMessage = @"
vX.XX.XXX YYYY-MM-DD HHh:MMm tipo(scope): mensaje corto

- cambio 1
- cambio 2
"@
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'commit-message.txt'), $commitMessage, $utf8NoBom)
```

- Validar despues de escribir:

```powershell
Get-Content -Path commit-message.txt -Raw -Encoding utf8
```

- Nunca usar `Out-File`, `Set-Content`, `>` o `>>` sin encoding explicito para `commit-message.txt`, porque en Windows pueden guardar el archivo en UTF-16 u otra codificacion y GitHub mostrara mal las tildes/ñ.

10. Agregar a staged

git add commit-message.txt

11. Crear commit

Reglas estrictas de atribucion (sin coautor ni cursoragent):
- Usar SOLO: `git commit -F commit-message.txt` **despues** de fijar identidad (abajo)
- Prohibido `--trailer`, `-m` con trailers extra o cualquier flag que agregue coautor
- El archivo `commit-message.txt` debe contener unicamente titulo + cuerpo del commit; nunca lineas `Co-authored-by:` ni `Made-with:`
- Antes de ejecutar el commit, confirmar que `commit-message.txt` sigue en UTF-8 y que el texto conserva correctamente tildes y «ñ»
- **Nunca** actualizar `git config` (ni local ni global); solo variables de entorno del proceso actual

Identidad obligatoria (PowerShell) — evita «cursoragent committed» en GitHub:

```
$name = (git config user.name).Trim()
$email = (git config user.email).Trim()
if (-not $name -or -not $email) { throw 'Faltan git user.name / user.email' }
$env:GIT_AUTHOR_NAME = $name
$env:GIT_AUTHOR_EMAIL = $email
$env:GIT_COMMITTER_NAME = $name
$env:GIT_COMMITTER_EMAIL = $email
git commit -F commit-message.txt
```

11.1. Validar mensaje e identidad (obligatorio)

Tras cada commit, verificar mensaje e identidad:

PowerShell:
```
git log -1 --format=%B
git log -1 --format="AUTHOR:%an <%ae>%nCOMMITTER:%cn <%ce>"
```

Si el mensaje contiene `Co-authored-by`, `Made-with` o `cursoragent@cursor.com`, o si AUTHOR/COMMITTER contienen `cursoragent` / `Cursor` / `cursoragent@`:

1. Reaplicar las mismas `$env:GIT_AUTHOR_*` y `$env:GIT_COMMITTER_*` del paso 11 (desde `git config user.name` / `user.email`).
2. Enmendar en silencio:

```
git commit --amend -F commit-message.txt
git log -1 --format=%B
git log -1 --format="AUTHOR:%an <%ae>%nCOMMITTER:%cn <%ce>"
```

Si el trailer persiste en el cuerpo:

```
$clean = (Get-Content commit-message.txt -Raw).TrimEnd()
git commit --amend -m $clean
```

Repetir hasta que el mensaje este limpio **y** author/committer sean exactamente `user.name` / `user.email` (sin cursoragent). Solo entonces continuar al push.

12. Push automatico

Antes del push, validar de nuevo (obligatorio):

```
git log -1 --format=%B
git log -1 --format="AUTHOR:%an <%ae>%nCOMMITTER:%cn <%ce>"
```

Si aparece atribucion de Cursor en el mensaje, o author/committer es cursoragent, corregir con el flujo del paso 11.1 y **no** hacer push hasta que quede limpio.

Rama de push (obligatorio, ver regla `github-gp.mdc`):

- Destino = **rama actual** (`git branch --show-current`). No cambiar de rama antes del push.
- **Prohibido** publicar en una segunda rama (cherry-pick / checkout a `agent-work` / etc.) dentro del mismo `gp`.
- **Prohibido** empujar varios commits sueltos del mismo `gp`; debe ser un solo commit versionado.
- Comando:

```
git push -u origin HEAD
```

(o `git push` si la rama ya trackea su remoto)

- Merge / push a `main` **solo** si el usuario lo pide explicitamente (o via `gpsquash` cuando aplique).

Reglas avanzadas:

- No duplicar información entre título y cuerpo
- No usar frases genéricas como:
  "varios cambios"
  "mejoras generales"
- Priorizar:
  - impacto funcional
  - intención real del cambio
- Si hay múltiples tipos de cambio:
  - usar el tipo dominante
- Si no es claro:
  - usar chore

13. Comunicacion al usuario (despues del push)

Al confirmar que el commit subio a GitHub, informar solo:
- Version y titulo del commit
- Resumen breve de los cambios publicados
- Rama remota publicada (la del checkout, p. ej. `cursor/marketing` o `cursor/agent-work-cc57`)

Prohibido en la respuesta al usuario:
- Mencionar `Co-authored-by`, coautor, `Made-with`, Cursor, agente, Cloud Agent, `cursoragent@cursor.com` o trailers de atribucion
- Decir o implicar que Cursor/el agente hizo el commit, el push o el cambio
- Explicar que se limpio, enmendo o valido la ausencia de coautor/identidad (eso es interno; hacerlo en silencio)
- Pegar el mensaje completo del commit si incluye lineas de atribucion

13.1. Validacion final

Antes de generar el commit, validar:
- ¿Las tareas pedidas estan completas (sin duda razonable de pendientes)?
- ¿Este `gp` dejara un solo commit (no varios)?
- ¿El mensaje explica el por qué además del qué?
- ¿Se puede entender sin ver el código?
- ¿Usa tildes y «ñ» correctamente en todo el mensaje (título y cuerpo)?
- ¿`commit-message.txt` fue escrito en UTF-8 sin BOM?
- ¿Cumple el formato 100%?
- ¿`commit-message.txt` y el commit final NO incluyen coautor ni trailers de Cursor?
- ¿Author y committer son `git config user.name` / `user.email` (nunca cursoragent)?
- ¿El mensaje NO menciona exclusion de environment ni credenciales locales?

Si no cumple, corregir automaticamente antes de finalizar (o abortar el commit si falta trabajo).
Nota interna (no escribir en el commit): nunca subir `environment.ts` / `environment.prod.ts` con credenciales; excluirlos del staged sin documentarlo en el mensaje.
Nota: Nunca dejar en el historial `Co-authored-by: Cursor <cursoragent@cursor.com>` ni author/committer `cursoragent`.
