import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/Home.css';
import App from './App';

/**
 * Main entry point for the React application.
 * This file is responsible for:
 * 1. Importing global styles.
 * 2. Importing the root application component (`App`).
 * 3. Finding the root DOM element.
 * 4. Rendering the `App` component into the DOM using React's `createRoot` API,
 *    wrapped in `StrictMode` for development checks.
 */

// Get the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');
// Ensure the root element exists before proceeding.
if (!rootElement) throw new Error('Failed to find the root element');

// Create a root for the React application.
const root = createRoot(rootElement);

// Render the App component into the root.
// StrictMode is a React tool for highlighting potential problems in an application.
// It activates additional checks and warnings for its descendants.
root.render(
  <StrictMode>
    <App />
  </StrictMode>
); 