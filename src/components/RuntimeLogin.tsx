import { Eye, EyeOff, Layers, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { PlatformSession } from '../models/data';
import { platformRequest } from '../services/platformHttp';

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
      <aside className="runtime-welcome">
        <span className="runtime-brand">
          <Layers size={24} /> AppBuilder<span>.</span>
        </span>
        <div>
          <span className="runtime-eyebrow">TU APLICACIÓN, EN ACCIÓN</span>
          <h2>
            Todo tu equipo.
            <br />
            Un mismo lugar.
          </h2>
          <p>Accede a tus herramientas, consulta tus datos y sigue avanzando con tu equipo.</p>
        </div>
        <div className="runtime-access-note">
          <ShieldCheck size={22} />
          <span>
            Un espacio de confianza
            <small>Solo las personas invitadas pueden acceder a tu proyecto.</small>
          </span>
        </div>
      </aside>
      <section className="auth-card">
        <span className="runtime-brand">
          <ShieldCheck size={21} /> Acceso al proyecto
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
