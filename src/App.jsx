import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Camera from './pages/Camera';
import Profile from './pages/Profile';
import GeminiTestPage from './pages/GeminiTestPage';
import SignalMatrixTestPage from './pages/SignalMatrixTestPage';
import EmotionalDubbingTestPage from './pages/EmotionalDubbingTestPage';
import VideoPreview from './pages/VideoPreview';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gemini-test" element={<GeminiTestPage />} />
          <Route path="/signal-matrix-test" element={<SignalMatrixTestPage />} />
          <Route path="/emotional-dubbing-test" element={<EmotionalDubbingTestPage />} />
          <Route path="/video/:videoId" element={<VideoPreview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
