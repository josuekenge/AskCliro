import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import NewSessionPage from './pages/NewSessionPage';
import SessionPage from './pages/SessionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/session/new" element={<NewSessionPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
