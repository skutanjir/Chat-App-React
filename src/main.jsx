import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for React 18
import './index.css';  // Ensures TailwindCSS is available globally
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Correct usage of createRoot

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
