import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import type { PlatformSession } from '../models/data';
import { ApiError, platformRequest } from '../services/platformHttp';
import { RuntimeLogin } from './ProjectPage';

type Match = {
  projectId: string;
  project: string;
  organization: string;
  name: string;
  code: string;
};
type Resolution = { path: string; matches: Match[]; error?: string };

/** Short URLs are resolved only against projects visible to the signed-in user. */
export function ProjectPathResolver() {
  const location = useLocation();
  const [session, setSession] = useState<PlatformSession | null>();
  const [authError, setAuthError] = useState('');
  const [resolution, setResolution] = useState<Resolution>();
  const [attempt, setAttempt] = useState(0);
  const path = location.pathname;
  const code = (() => {
    try {
      return decodeURIComponent(path).replace(/^\/+|\/+$/g, '');
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const controller = new AbortController();
    platformRequest<PlatformSession>('/auth/session', { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) {
          setSession(value);
          setAuthError('');
        }
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) setSession(null);
        else setAuthError('No pudimos conectar con tu aplicación. Intenta de nuevo.');
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    if (!session || code === null) return;
    const controller = new AbortController();
    const projects = [
      ...new Map(
        [...session.projects, ...(session.applications ?? [])]
          .filter((project) => !project.archived)
          .map((project) => [project.id, project]),
      ).values(),
    ];
    Promise.all(
      projects.map(async (project): Promise<Match[]> => {
        try {
          const navigation = await platformRequest<{ pages: { name: string; code: string }[] }>(
            '/runtime/projects/' + encodeURIComponent(project.id) + '/navigation',
            { signal: controller.signal },
          );
          return navigation.pages
            .filter((page) => page.code === code)
            .map((page) => ({
              ...page,
              projectId: project.id,
              project: project.name,
              organization: project.organization,
            }));
        } catch (error) {
          // A revoked or archived project must never become a route candidate.
          if (error instanceof ApiError && [403, 404].includes(error.status)) return [];
          throw error;
        }
      }),
    )
      .then((matches) => {
        if (!controller.signal.aborted) setResolution({ path, matches: matches.flat() });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) setSession(null);
        else
          setResolution({
            path,
            matches: [],
            error: 'No pudimos consultar tus páginas. Intenta de nuevo.',
          });
      });
    return () => controller.abort();
  }, [session, path, code, attempt]);

  if (code === null)
    return (
      <main className="screen-message">
        <h1>Dirección inválida</h1>
        <p>Comprueba la dirección de la página e intenta de nuevo.</p>
      </main>
    );
  if (session === null) return <RuntimeLogin onLogin={setSession} />;
  const error = authError || (resolution?.path === path ? resolution.error : '');
  if (error)
    return (
      <main className="screen-message" role="alert">
        <h1>No pudimos abrir la página</h1>
        <p>{error}</p>
        <button onClick={() => setAttempt((value) => value + 1)}>Reintentar</button>
      </main>
    );
  if (!session || resolution?.path !== path)
    return (
      <main className="screen-message" role="status">
        Buscando tu página…
      </main>
    );
  const to = (match: Match) =>
    '/p/' +
    encodeURIComponent(match.projectId) +
    '/' +
    match.code +
    location.search +
    location.hash;
  if (resolution.matches.length === 1) return <Navigate replace to={to(resolution.matches[0])} />;
  if (!resolution.matches.length)
    return (
      <main className="screen-message">
        <h1>Página no encontrada</h1>
        <p>No hay una página publicada en esta dirección dentro de tus aplicaciones.</p>
        <p>
          Si acabas de crearla, usa Publicar en el editor. Si pertenece a otro equipo, pide una
          invitación.
        </p>
      </main>
    );
  return (
    <main className="screen-message">
      <h1>¿Qué aplicación quieres abrir?</h1>
      <p>Esta dirección existe en varios proyectos a los que tienes acceso.</p>
      <nav aria-label="Elegir aplicación">
        {resolution.matches.map((match) => (
          <p key={match.projectId}>
            <Link className="runtime-project-choice" to={to(match)}>
              {match.organization} / {match.project} — {match.name}
            </Link>
          </p>
        ))}
      </nav>
    </main>
  );
}
