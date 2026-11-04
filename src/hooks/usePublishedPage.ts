import { useEffect, useState } from 'react';
import type { Page } from '../models/contracts';
import { getPublishedPage } from '../services/pagesApi';

interface PageState {
  path: string;
  page?: Page;
  error?: string;
  missing?: boolean;
}

export function usePublishedPage(pathname: string) {
  const [state, setState] = useState<PageState>({ path: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPublishedPage(pathname, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setState(page ? { path: pathname, page } : { path: pathname, missing: true });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({
            path: pathname,
            error: 'No se pudo cargar la página. Comprueba la conexión con la API.',
          });
        }
      });
    return () => controller.abort();
  }, [pathname, attempt]);

  useEffect(() => {
    document.title = state.page?.name ?? 'Frontend Builder Runtime';
  }, [state.page]);

  function retry() {
    setState({ path: '' });
    setAttempt((value) => value + 1);
  }

  return { ...state, loading: state.path !== pathname, retry };
}
