import { Route, Routes } from 'react-router-dom';
import { ProjectPage } from './pages/ProjectPage';
import { PublishedPage } from './pages/PublishedPage';
export function App() {
  return (
    <Routes>
      <Route path="/p/:projectId/*" element={<ProjectPage />} />
      <Route path="*" element={<PublishedPage />} />
    </Routes>
  );
}
