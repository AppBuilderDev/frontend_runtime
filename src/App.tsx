import { Route, Routes } from 'react-router-dom';
import { PublishedPage } from './pages/PublishedPage';
export function App() {
  return (
    <Routes>
      <Route path="*" element={<PublishedPage />} />
    </Routes>
  );
}
