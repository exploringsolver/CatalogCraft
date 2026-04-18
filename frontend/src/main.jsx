import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import AuthState from './components/Context/Auth/AuthState';
import './index.css';
import CataState from './components/Context/Catalogue/CataState';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthState>
        <CataState>
          <App />
        </CataState>
      </AuthState>
    </Router>
  </React.StrictMode>
);
