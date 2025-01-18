import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PageProvider } from './context/PageContext';
import { Navigation } from './components/Navigation';
import { PageView } from './components/PageView';
import { HomePage } from './components/HomePage';
import { PublicPageView } from './components/PublicPageView';
import 'bootstrap/dist/css/bootstrap.min.css';

function useIsPublicRoute() {
  const location = window.location.pathname;
  return location.startsWith('/view/');
}

function App() {
  const isPublicRoute = useIsPublicRoute();

  return (
      <PageProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-light">
            {!isPublicRoute && <Navigation />}
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/page/:id" element={<PageView />} />
              <Route path="/view/:id" element={<PublicPageView />} />
            </Routes>
          </div>
        </BrowserRouter>
      </PageProvider>
  );
}

export default App;