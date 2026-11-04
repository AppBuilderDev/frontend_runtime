# Frontend Builder · Runtime

Aplicación independiente React, TypeScript estricto, Vite, React Router y Tailwind CSS 4. Node 22.13+.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Abrir http://localhost:5174/inicio después de crear y guardar esa página en el editor de Design. Guardar también publica, sin una acción adicional. Iniciar la API desde frontend_design con `npm run api` (puerto 3001). `VITE_API_URL` configura la URL HTTP del backend; por defecto http://localhost:3001. Reiniciar Vite al cambiar .env. Las variables VITE_* son públicas.

Una única ruta comodín resuelve cualquier pathname mediante GET /api/public/pages/by-path?path=…. Admite rutas anidadas. Solo obtiene copias publicadas; devuelve una vista 404 para páginas inexistentes o sin un primer guardado en el editor. Incluye carga, reintento por errores HTTP/conexión y aviso para componentes desconocidos. Las actualizaciones aparecen al recargar después de guardar en Design. La ruta raíz no redirige automáticamente a inicio.

```powershell
npm run build
npm run lint
npm test
npm run preview
```

Build en dist/. Configurar fallback a index.html para rutas SPA en el hosting. Las pruebas de integración de navegador que abarcan ambas aplicaciones se ejecutan desde frontend_design (`npm run test:e2e`).

src/models define el contrato validado con Zod; src/components contiene el registro y renderizador extensible, con tipos iniciales Container, Heading, Paragraph, Button, Input y Card. `registerComponent` permite añadir componentes en el arranque. No se ejecuta JSX ni HTML almacenado. No hay imports del repositorio Design. Ver [contrato y estrategia de paquete compartido](docs/contract.md).

La API actual es exclusivamente de desarrollo. Antes de desplegar el servicio se requiere autenticación y autorización administrativas y una persistencia de producción. Runtime solo consume el endpoint público.

## Formato y estructura

`npm run format` aplica Prettier y `npm run format:check` verifica la indentación (dos espacios), comillas simples y finales de línea LF. .editorconfig fija UTF-8. App.tsx contiene solo rutas; las páginas, componentes, hooks, modelos y servicios se mantienen separados.
