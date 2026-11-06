# AppBuilderDev · Runtime

Rama `build/inventario`. Ejecuta páginas publicadas y componentes de datos del builder. React, TypeScript y Vite. Usar Node 24 LTS.

```powershell
npm ci
npm run dev
```

Iniciar primero la API del repositorio `frontend_design` (`npm run dev:all`). Runtime utiliza http://localhost:5174 y el proxy `/api/v1` apunta a http://127.0.0.1:3001. Para cambiarlo, definir `PLATFORM_API_TARGET`. En producción configurar un proxy inverso equivalente y HTTPS.

Las páginas nuevas se abren en `/p/{projectId}/{ruta}` desde Design. Requieren sesión y pertenencia al proyecto. Ambos frontends deben usar el mismo host para compartir la cookie. Si no hay sesión se solicita iniciar sesión. La navegación muestra las páginas publicadas, y los lectores no pueden crear ni modificar registros.

`DataForm`, `DataTable` y `DataDetail` consumen los servicios propios del proyecto con validación en servidor y revisión en actualizaciones. Los importes se almacenan como centavos enteros. El contrato publicado conserva una copia de sus definiciones de datos; un borrador no altera la publicación.

- `src/pages/ProjectPage.tsx`: sesión, navegación y páginas del proyecto.
- `src/components/renderer.tsx`: renderizado declarativo y estilos.
- `src/components/dataComponents.tsx`: componentes conectados y selección compartida.
- `src/models`: contratos compartidos con Design.
- `src/services/platformHttp.ts`: solicitudes autenticadas.

Las rutas anteriores fuera de `/p` conservan el lector antiguo, que requiere habilitar expresamente la API legacy en desarrollo. Los JSON anteriores no se migran automáticamente.

Validación: `npm run build`, `npm run lint`, `npm test`, `npm run format:check`. El recorrido conjunto de navegador se ejecuta desde Design con `npm run test:e2e`.

[Decisiones y alcance](docs/build-plan.md). Las mejoras de stock, movimientos, roles operativos y colaboración en tiempo real corresponden a entregas posteriores.
