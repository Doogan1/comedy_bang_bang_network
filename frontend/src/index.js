import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';  // Assuming you have an App component

const container = document.getElementById('root'); // Assuming there's a div with id='root' in your index.html
const root = createRoot(container); // Create a root.
root.render(<App />); // Initial render
