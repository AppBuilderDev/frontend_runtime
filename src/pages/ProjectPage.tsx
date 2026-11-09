import { RuntimeLogin } from '../components/RuntimeLogin';
import { RuntimeHeader } from '../components/RuntimeHeader';
import { useEffect, useState } from 'react';

import { Navigate, useLocation, useParams } from 'react-router-dom';

import { DataProvider } from '../components/dataComponents';

import { RenderTree } from '../components/renderer';

import { pageSchema, type Page } from '../models/contracts';

import type { PlatformSession, ProjectAccess } from '../models/data';

import { ApiError, platformRequest } from '../services/platformHttp';

type Navigation = { project: ProjectAccess; pages: { name: string; code: string }[] };

export function ProjectPage({
  resolvedProjectId,
  resolvedCode,
}: { resolvedProjectId?: string; resolvedCode?: string } = {}) {
  const params = useParams();
  const location = useLocation();
  const projectId = resolvedProjectId ?? params.projectId ?? '';
  const tail = resolvedCode ?? params['*'] ?? '';

  const [session, setSession] = useState<PlatformSession | null>();
  const [navigation, setNavigation] = useState<Navigation>();

  const [page, setPage] = useState<Page>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    platformRequest<PlatformSession>('/auth/session', { signal: controller.signal })
      .then(setSession)
      .catch((e: Error) => {
        if (!controller.signal.aborted) {
          if (e instanceof ApiError && e.status === 401) setSession(null);
          else setError(e.message);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();

    platformRequest<Navigation>('/runtime/projects/' + projectId + '/navigation', {
      signal: controller.signal,
    })
      .then(async (nav) => {
        const route = tail || nav.pages[0]?.code || '';
        const value = await platformRequest(
          '/runtime/projects/' +
            projectId +
            '/pages/by-path?path=' +
            encodeURIComponent('/' + route),
          { signal: controller.signal },
        );
        return [nav, pageSchema.parse(value)] as const;
      })
      .then(([nav, p]) => {
        setNavigation(nav);
        setPage(p);
        setError('');
        setLoading(false);
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) {
          setError(e.message);
          setLoading(false);
          if (e instanceof ApiError && e.status === 401) setSession(null);
        }
      });

    return () => controller.abort();
  }, [session, projectId, tail, attempt]);

  if (session === null) return <RuntimeLogin onLogin={setSession} />;

  if (!session) return <main className="screen-message">{error || 'Comprobando acceso…'}</main>;

  const applicationPath = navigation?.project.slug
    ? '/' + navigation.project.slug
    : '/p/' + projectId;
  if (!resolvedProjectId && navigation?.project.slug && page && !loading && !error) {
    return (
      <Navigate replace to={applicationPath + '/' + page.code + location.search + location.hash} />
    );
  }

  return (
    <>
      <RuntimeHeader
        projectName={navigation?.project.name ?? 'Aplicación'}
        applicationPath={applicationPath}
        pages={navigation?.pages ?? []}
        currentCode={page?.code ?? tail}
        userName={session.user.name}
        onNavigate={(code) => {
          if (tail !== code) setLoading(true);
        }}
        onLogout={() =>
          void platformRequest('/auth/logout', { method: 'POST' }).then(() => setSession(null))
        }
      />

      {loading ? (
        <main className="screen-message" role="status">
          Cargando página…
        </main>
      ) : error ? (
        <main className="screen-message" role="alert">
          <h1>No se pudo abrir esta página</h1>
          <p>{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setAttempt((v) => v + 1);
            }}
          >
            Reintentar
          </button>
        </main>
      ) : (
        page &&
        navigation && (
          <DataProvider
            key={page.id + ':' + page.publicationVersion}
            applicationPath={applicationPath}
            projectId={projectId}
            entities={page.entities ?? []}
            operations={page.operations ?? []}
            endpoints={page.endpoints ?? []}
            connections={page.connections ?? []}
            canWrite={navigation.project.role !== 'reader'}
          >
            <main className="public-page">
              <RenderTree nodes={page.components} />
            </main>
          </DataProvider>
        )
      )}
    </>
  );
}
