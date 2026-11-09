import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { Link, useLocation, useParams } from 'react-router-dom';

import { DataProvider } from '../components/dataComponents';

import { RenderTree } from '../components/renderer';

import { pageSchema, type Page } from '../models/contracts';

import type { PlatformSession, ProjectAccess } from '../models/data';

import { ApiError, platformRequest } from '../services/platformHttp';

type Navigation = { project: ProjectAccess; pages: { name: string; code: string }[] };

export function ProjectPage() {
  const { projectId = '', '*': tail = '' } = useParams();
  const location = useLocation();

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

  return (
    <>
      <header className="runtime-header">
        <strong>{navigation?.project.name ?? 'Aplicación'}</strong>
        <nav aria-label="Páginas publicadas">
          {navigation?.pages.map((p) => (
            <Link
              aria-current={
                location.pathname === '/p/' + projectId + '/' + p.code ? 'page' : undefined
              }
              key={p.code}
              to={'/p/' + projectId + '/' + p.code}
              onClick={() => {
                if (tail !== p.code) setLoading(true);
              }}
            >
              {p.name}
            </Link>
          ))}
        </nav>
        <span>{session.user.name}</span>
        <button
          onClick={() =>
            void platformRequest('/auth/logout', { method: 'POST' }).then(() => setSession(null))
          }
        >
          Cerrar sesión
        </button>
      </header>

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

export function RuntimeLogin({ onLogin }: { onLogin: (s: PlatformSession) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      onLogin(
        await platformRequest<PlatformSession>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <span className="runtime-brand">
          <ShieldCheck size={21} /> AppBuilder.
        </span>
        <h1>Accede a tu aplicación</h1>
        <p>
          Tu equipo y tu información, en un solo lugar. Entra con la cuenta que tiene acceso a este
          proyecto.
        </p>
        <form onSubmit={(e) => void login(e)}>
          <label>
            Correo
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Contraseña
            <span className="runtime-password">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>
        <small className="runtime-login-help">
          ¿No tienes acceso? Pide al propietario que te invite con tu correo.
        </small>
      </section>
    </main>
  );
}
