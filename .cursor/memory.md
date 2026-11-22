# Memoria de proyecto (Fiado Digital)

Prototipo fintech: landing en `/`, producto descrito en `PRODUCT.md` y `resumen.md`. Reglas y skills heredados de Genkidamás para el mismo flujo de agente.

---

# Memoria heredada (Genkidamás)

## Uso

1. Lee este archivo.
2. Para el detalle, abre el archivo de `.cursor/memory/` indicado en la tabla.

## Índice

| Archivo | Tema |
|---|---|
| [memory/agency-agents.md](memory/agency-agents.md) | Roster de agency-agents: 280 skills en `.cursor/skills/agents-agency/`. No se activan solos. |
| [memory/github-gp.md](memory/github-gp.md) | Flujo `gp`: `fetch origin` y alinear base remota; skill antes de push; rama = checkout actual; un solo commit; identidad Git; título en UTC−5. |
| [memory/github-gpsquash.md](memory/github-gpsquash.md) | Flujo `gpsquash`: Join_sz + Join_main (sin commit S salvo fallback); agent mergea main; sin backup tags. |
| [memory/github-cleangit.md](memory/github-cleangit.md) | Flujo `cleangit`: borrar ramas secundarias en origin; conservar main, squash-zone y cursor/agent-work; confirmación previa. |
| [memory/build-pre-gp.md](memory/build-pre-gp.md) | Build no de rutina ni dentro de `gp`; solo riesgo real de template/Angular o pedido explícito. |
| [skills/extract-child-component/SKILL.md](skills/extract-child-component/SKILL.md) | Extraer un fragmento de un componente a un hijo standalone con `input()` / `output()`. |
| [skills/home-inicio-motion/SKILL.md](skills/home-inicio-motion/SKILL.md) | Animaciones de `/inicio` (hojas, pestañas, filtros) al estilo Cliente Plus. |
| [rules/github-gp.mdc](rules/github-gp.mdc) | Regla alwaysApply del flujo `gp`. |
| [rules/workflow-session.mdc](rules/workflow-session.mdc) | Staging exclusivo del usuario, salvo dentro de `gp`. |
| [rules/agent-read-rules-first.mdc](rules/agent-read-rules-first.mdc) | Leer reglas, memorias y el skill antes de editar o publicar. |
| [memory/admin-fases.md](memory/admin-fases.md) | Consola `/admin`: fases A–D, migraciones y asignación de admins. |
| [memory/organizaciones-fases.md](memory/organizaciones-fases.md) | Organizaciones (hackathon, universidad): fases A–G, enlaces de unión y salas privadas. |
| [rules/page-layout.mdc](rules/page-layout.mdc) | Contenedor `.page`: mismo ancho header/main en desktop (`--gk-page-max-width`, padding). |
| [memory/pitch-deck-layout.md](memory/pitch-deck-layout.md) | Pitch deck: modos split/background, anclas de texto, scrim, modelo JSON en `slides`. |
