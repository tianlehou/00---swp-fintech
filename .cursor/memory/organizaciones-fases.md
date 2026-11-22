# Organizaciones — fases de implementación

Programas acotados (universidades, hackathons, incubadoras): salas **privadas al ámbito**, entrada por **URL/enlace**, moderación **aprobar / rechazar** y cierre de **altas de salas nuevas**.

Roles globales actuales: usuario normal + `profiles.is_admin` (consola del sitio). Los roles de org son **por organización** (`owner`, `moderator`, `member`).

| Fase | Alcance | Entregable | Estado |
|------|---------|------------|--------|
| **A — Fundación** | Tablas `organizations`, `organization_members`; columnas `startups.organization_id`, `org_review_status`, `org_review_note`; helpers `is_org_member`, `is_org_moderator`, `is_org_owner`; RLS en orgs y lectura/insert de salas org | `supabase/migrations/20261024120000_organizacion.sql` (bloque unificado) | Hecho |
| **B — RPC y servicio** | `organization_join_by_token`, `organization_review_startup`, `organization_set_room_creation_open`, `organization_pending_salas`, `admin_organization_create`, `admin_list_organizations`; `OrganizationService` en Angular | Backend listo para UI | Hecho |
| **C — Consola sitio** | `/admin/organizaciones`: vista **Activas** + filtro **Solicitudes pendientes** (tabla estilo Salas); copiar enlace de unión | Site admin consulta y activa programas | Hecho |
| **D — Entrada participante** | Ruta `/org/unirse/:token`: login si hace falta, unirse, redirigir a `/org/:slug` | Hackathon / curso entra por enlace | Hecho |
| **E — Espacio org** | `/org/:slug`: salas aprobadas + crear sala (si inscripción abierta); `/org/:slug/gestion`: pendientes, aprobar/rechazar, toggle inscripción | Operación del evento | Hecho |
| **F — Pulido** | Archivar org, regenerar token, métricas admin, emails/aviso, reglas auto-aprobación | Producto listo para piloto | Pendiente |
| **G — Integración inicio** | Tab **Programas** en `/inicio` (catálogo `listed_in_programs` + crédito); excluir salas org de «Otras salas»; toggles en Gestión | Descubrimiento coherente | Parcial |
| **H — Solicitudes y precios** | `/organizacion/solicitar`, tabla `organization_applications`, créditos `event_credits`, consola `/admin/organizaciones` → Solicitudes pendientes (pago manual / bonificado) | Cuenta normal pide org; admin confirma pago y activa | Hecho |
| **I — Cobro en línea** | Stripe Checkout (piloto 199 USD + extra 99 USD; regular 399 / 199), webhooks → `payment_status = paid`, compra de créditos extra | Monetización sin intervención manual | Pendiente |
| **J — Consumo de créditos** | Al abrir/cerrar una edición descontar crédito; bloquear nuevo evento sin pago; historial `organization_purchases` | Un pago = un evento operativo | Pendiente |

## Precios de referencia (USD)

Definidos en `src/app/shared/config/org-pricing.ts`:

| Concepto | Regular | Piloto (vigente) |
|----------|---------|------------------|
| Paquete lanzamiento (marca + 1 evento) | 399 | 199 |
| Evento adicional | 199 | 99 |

El copy público ancla el precio regular (tachado) y presenta 199 / 99 como **precio piloto para las primeras organizaciones**. `amount_cents` de solicitudes nuevas = 19900.

Hasta la fase **I**, el pago se marca en consola como **Pago recibido** o **Bonificar**.

## Flujo solicitante (fase H)

1. Usuario en `/organizacion/solicitar` envía slug, nombre, tipo y descripción.
2. Queda `organization_applications.status = submitted`, `payment_status = pending`.
3. Admin en `/admin/organizaciones` (vista Solicitudes pendientes) marca pago (`paid` o `waived`) y pulsa **Activar**.
4. Se crea `organizations` con `event_credits = 1` y el solicitante como **owner**.

## Enlace de unión

Formato app: `https://<dominio>/org/unirse/<join_token>`

## Alta de organizaciones

No hay alta manual en consola. Flujo de producción: **solicitud** (`/organizacion/solicitar`) + misma página **Organizaciones** → filtro **Solicitudes pendientes**. `/admin/solicitudes-organizacion` redirige a `/admin/organizaciones`. El RPC `admin_organization_create` sigue en backend por soporte puntual.

## Flujo de una sala org

1. Miembro crea sala → `organization_id` + `org_review_status = pending`, `hidden = true`.
2. Moderador aprueba → `approved` (visible para miembros de la org) o `rejected`.
3. La sala **no** aparece en el explorador global de `/inicio`.

## Orden de trabajo

Cada fase cerrada = commit versionado (`gp`) en la rama de trabajo antes de abrir la siguiente.

## Relación

- Admin sitio: `.cursor/memory/admin-fases.md`
- Salas base: `supabase/migrations/20261011120100_sala.sql`
