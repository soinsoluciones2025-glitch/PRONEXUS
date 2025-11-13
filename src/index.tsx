import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // Import the main App component
import { TTSProvider } from './contexts/TTSContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TTSProvider>
      <App />
    </TTSProvider>
  </React.StrictMode>
);