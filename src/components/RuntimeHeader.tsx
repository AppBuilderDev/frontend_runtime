import { Layers, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RuntimeHeaderProps {
  projectName: string;
  applicationPath: string;
  pages: { name: string; code: string }[];
  currentCode: string;
  userName: string;
  onNavigate: (code: string) => void;
  onLogout: () => void;
}

export function RuntimeHeader({
  projectName,
  applicationPath,
  pages,
  currentCode,
  userName,
  onNavigate,
  onLogout,
}: RuntimeHeaderProps) {
  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <header className="runtime-header">
      <div className="runtime-project-brand">
        <span className="runtime-project-mark" aria-hidden="true">
          <Layers size={21} />
        </span>
        <div>
          <small>MI APLICACIÓN</small>
          <strong>{projectName}</strong>
        </div>
      </div>
      <nav aria-label="Páginas publicadas">
        {pages.map((page) => (
          <Link
            key={page.code}
            to={applicationPath + '/' + page.code}
            aria-current={currentCode === page.code ? 'page' : undefined}
            onClick={() => onNavigate(page.code)}
          >
            {page.name}
          </Link>
        ))}
      </nav>
      <div className="runtime-user">
        <span className="runtime-avatar" aria-hidden="true">
          {initials}
        </span>
        <span>{userName}</span>
      </div>
      <button onClick={onLogout}>
        <LogOut size={16} aria-hidden="true" /> Cerrar sesión
      </button>
    </header>
  );
}
