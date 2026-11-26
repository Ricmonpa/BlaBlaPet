import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Camera from './pages/Camera';
import Profile from './pages/Profile';
import GeminiTestPage from './pages/GeminiTestPage';
import EmotionalDubbingTestPage from './pages/EmotionalDubbingTestPage';
import VideoPreview from './pages/VideoPreview';

// Modo en vivo: carga diferida para no sumar el SDK de Gemini al bundle principal.
const Live = lazy(() => import('./pages/Live'));

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gemini-test" element={<GeminiTestPage />} />
          <Route path="/emotional-dubbing-test" element={<EmotionalDubbingTestPage />} />
          <Route path="/video/:videoId" element={<VideoPreview />} />
          <Route
            path="/live"
            element={
              <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
                <Live />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
