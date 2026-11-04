import { pageSchema, type Page } from '../models/contracts';

const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

export async function getPublishedPage(path: string, signal: AbortSignal): Promise<Page | null> {
  const response = await fetch(
    `${base}/api/public/pages/by-path?path=${encodeURIComponent(path)}`,
    { signal },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('El servicio no está disponible.');
  return pageSchema.parse(await response.json());
}
