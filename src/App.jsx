import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import EventBotPage from './pages/EventBotPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/eventbot/:shortcode" element={<EventBotPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
