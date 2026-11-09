import { ProjectPathResolver } from './ProjectPathResolver';
import { useLocation } from 'react-router-dom';
import { RenderTree } from '../components/renderer';
import { usePublishedPage } from '../hooks/usePublishedPage';
export function PublishedPage() {
  const { pathname } = useLocation();
  const state = usePublishedPage(pathname);
  if (state.loading)
    return (
      <main className="screen-message" role="status">
        Cargando página…
      </main>
    );
  if (state.missing || state.error) return <ProjectPathResolver />;
  return (
    <main className="public-page">
      <RenderTree nodes={state.page?.components ?? []} />
    </main>
  );
}
