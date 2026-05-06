import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './LandingPage';
import LoginPage   from './LoginPage';
import App         from './App';
import './index.css';

// page: 'landing' | 'login' | 'app'
function Root() {
  const [page, setPage] = useState('landing');

  if (page === 'app')    return <App />;
  if (page === 'login')  return (
    <LoginPage
      onLogin={()         => setPage('app')}
      onBack={()          => setPage('landing')}
      onRequestAccess={()  => setPage('app')}
    />
  );
  // landing
  return (
    <LandingPage
      onLogin={()     => setPage('login')}
      onEnterApp={()  => setPage('app')}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);