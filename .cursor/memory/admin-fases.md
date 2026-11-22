# Admin — fases de implementación

Ruta base: `/admin`. Backend: Supabase (flag `profiles.is_admin`, RPC `security definer`, RLS con bypass de lectura/edición moderada).

| Fase | Alcance | Entregable |
|------|---------|------------|
| **A — Fundación** | SQL unificado en `supabase/migrations/20261019120000_admin.sql` (`is_admin`, `is_site_admin`, RLS admin, `admin_dashboard_stats`, `admin_recent_activity`); guard, shell, **Resumen**, `AdminService` + `isAdmin` | Acceso protegido y vista general operativa |
| **B — Operación** | Listado **Usuarios** (paginación, búsqueda), listado **Salas** (filtros stage/ocultas, búsqueda), acción **ocultar/mostrar** sala, RPC `admin_list_*` y `admin_set_startup_hidden` | Moderación diaria de cuentas y espacios |
| **C — Profundidad** | Gráficos semanales en resumen, **Postulaciones** global, formulario **Avisos**, export CSV, `admin_audit_log` y pantalla **Auditoría** | Análisis y comunicación |
| **D — Pulido** | Nav móvil sticky, accesos rápidos en resumen, columna ID en usuarios, estados vacíos con icono, enlace **Consola** en menú lateral si `isAdmin` | Listo para revisión del dueño del producto |

## Asignar administradores

Tras aplicar la migración en Supabase:

```sql
update public.profiles set is_admin = true where id = '<uuid-del-usuario>';
```

No hay UI para promover admins (solo SQL / service role).

## Orden de publicación

Cada fase termina con un commit versionado (`gp`) en la rama `cursor/admin-dashboard-d755` antes de iniciar la siguiente.
