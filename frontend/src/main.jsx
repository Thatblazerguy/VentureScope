import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './LandingPage';
import LoginPage   from './LoginPage';
import SignupPage  from './SignupPage';
import App         from './App';
import './index.css';

// page: 'landing' | 'login' | 'signup' | 'app'
function Root() {
  const [page, setPage] = useState('landing');

  if (page === 'app') return <App onLogout={() => setPage('landing')} />;

  if (page === 'login') return (
    <LoginPage
      onLogin={()          => setPage('app')}
      onBack={()           => setPage('landing')}
      onRequestAccess={()  => setPage('signup')}
    />
  );

  if (page === 'signup') return (
    <SignupPage
      onSignup={()  => setPage('app')}
      onBack={()    => setPage('landing')}
      onLogin={()   => setPage('login')}
    />
  );

  // landing (default)
  return (
    <LandingPage
      onLogin={()    => setPage('login')}
      onSignup={()   => setPage('signup')}
      onEnterApp={() => setPage('app')}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);