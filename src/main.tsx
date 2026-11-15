import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Désactivation du menu contextuel par défaut pour une expérience application native fluide
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
}, { capture: true });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

