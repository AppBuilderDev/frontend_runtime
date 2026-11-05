import { useLocation } from 'react-router-dom';
import { RenderTree } from '../components/renderer';
import { usePublishedPage } from '../hooks/usePublishedPage';
export function PublishedPage() {
  const { pathname } = useLocation();
  const state = usePublishedPage(pathname);
  if (state.loading)
    return (
      <main className="screen-message" role="status">
        Cargando página...
      </main>
    );
  if (state.missing)
    return (
      <main className="screen-message">
        <small>FRONTEND BUILDER</small>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>Esta ruta no existe o todavía no ha sido publicada.</p>
      </main>
    );
  if (state.error)
    return (
      <main className="screen-message" role="alert">
        <h1>No pudimos conectar</h1>
        <p>{state.error}</p>
        <button onClick={state.retry}>Reintentar</button>
      </main>
    );
  return (
    <main className="public-page">
      <RenderTree nodes={state.page?.components ?? []} />
    </main>
  );
}
