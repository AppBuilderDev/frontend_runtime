# AppBuilderDev Runtime

Frontend React, TypeScript y Vite independiente. Consume por HTTP la API NestJS del repositorio ../backend; no contiene servidor ni acceso directo a SQLite.

Usar Node 24. Instalar con npm ci, copiar .env.example a .env si no existe y ejecutar npm run dev. Disponible en http://localhost:5174. Iniciar tambien el backend (3001) y Design (5173). Mantener el mismo host en ambos frontends para compartir la sesion.

PLATFORM_API_TARGET configura el proxy /api/v1. Las rutas /p/:projectId/* resuelven paginas publicadas por su codigo y requieren sesion/permisos. Un borrador no cambia Runtime.

RestTable utiliza los contratos HTTP capturados en la publicacion: GET lista, POST crea, PUT/PATCH edita y DELETE desactiva registros. Las escrituras requieren permisos y revisiones vigentes. Se conservan los componentes DataForm, DataTable, DataDetail, Inventory, ServiceForm y ApiQuery.

Verificar con npm run build, npm run lint y npm test. Los recorridos conjuntos se ejecutan desde ../frontend_design con npm run test:e2e.
