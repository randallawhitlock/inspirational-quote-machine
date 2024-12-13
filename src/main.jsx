import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/App.css'; // Adjust the path if necessary

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
