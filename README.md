# AppBuilderDev Runtime

Frontend React + TypeScript + Vite independiente. No contiene backend, acceso a SQLite ni imports de Design. Consume la API NestJS del repositorio ../backend.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

API: arrancar `npm run dev` en ../backend. Runtime: http://localhost:5174. Design: http://localhost:5173. Mantener el mismo host en ambos frontends para compartir la cookie HttpOnly. PLATFORM_API_TARGET configura el proxy /api/v1 hacia http://127.0.0.1:3001. Para hosting usar un proxy inverso equivalente y HTTPS.

Las rutas /p/:projectId/* resuelven paginas publicadas mediante su codigo, con sesion y permisos del proyecto. Un borrador no cambia la publicacion. Se preservan los componentes DataForm/DataTable/DataDetail, Inventory, ServiceForm y ApiQuery. RestTable interpreta las rutas HTTP capturadas en la publicacion para listar con GET, crear con POST, editar con PUT/PATCH y desactivar con DELETE, con control de revisiones. La interfaz de lector no permite escrituras y el backend aplica permisos independientemente del navegador.

src/builder-components.tsx permite renderizar los archivos Page.tsx exportados desde Design dentro del proyecto; los componentes conectados requieren el DataProvider correspondiente. El Runtime normal sigue interpretando el contrato JSON, no ejecuta TSX del usuario ni depende de Craft o Babel.

```powershell
npm run build
npm run lint
npm test
npm run format:check
```

El recorrido conjunto se ejecuta desde ../frontend_design con `npm run test:e2e`. No hay dependencias locales entre paquetes. Los contratos equivalentes deben evolucionar coordinadamente hasta extraer un paquete privado versionado. Ver docs/contract.md.

### URLs de aplicaciones

Las paginas de un proyecto usan `/:appSlug/:pageCode`, por ejemplo `/test001/productos` o `/test001/reportes/ventas`. El backend asigna un slug global unico a cada proyecto a partir del nombre de la organizacion y conserva ese slug aunque cambie el nombre visible. Las coincidencias reciben sufijos (`test001-2`). La migracion de bases existentes es automatica y conserva los IDs y los datos.

Los enlaces antiguos `/p/:projectId/:pageCode` redirigen a la URL con slug, conservando query y fragmento. Las rutas cortas como `/productos` siguen resolviendo entre los proyectos accesibles; si hay varios resultados se solicita elegir la aplicacion. Cambiar la URL no concede permisos: se mantienen la sesion, el acceso al proyecto y la exigencia de publicar la pagina. Los IDs siguen usandose internamente en la API.

Catalogo ampliado: [45 componentes y sus opciones](docs/components.md).
