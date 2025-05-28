# Developer Documentation

This document provides an overview of the project structure, key components, and development practices for this SaaS application's frontend.

## 1. Project Structure Overview

The project is a React application built with Vite. Key directories include:

*   **`public/`**: Contains static assets that are directly served (e.g., `vite.svg`).
*   **`src/`**: Contains the main source code for the application.
    *   **`src/assets/`**: Static assets like images or SVGs that are imported into components (e.g., `react.svg`).
    *   **`src/components/`**: (Currently not extensively used, but intended for reusable UI components across multiple pages).
    *   **`src/pages/`**: Contains the main page components, each typically corresponding to a major section or route of the application.
    *   **`src/utils/`**: Contains utility modules, most notably `api.js` for API communication.
    *   **`src/App.tsx`**: The root React component that sets up routing.
    *   **`src/main.tsx`**: The entry point of the application that renders the `App` component.
    *   **`src/index.css`**: Global styles and CSS variables.
*   **`vite.config.ts`**: Vite configuration file.
*   **`package.json`**: Lists project dependencies and scripts.
*   **`tsconfig.json` / `tsconfig.node.json`**: TypeScript configuration.

## 2. Page Component Summaries

The following are the primary page components located in `src/pages/`:

*   **`Home.jsx`**: (`src/pages/Home.jsx`)
    *   Serves as the main dashboard or landing page after a user logs in. Displays user information and a logout button.
*   **`Login.jsx`**: (`src/pages/Login.jsx`)
    *   Provides the user interface for logging into the application. Handles form input, communicates with the login API, and manages authentication state.
*   **`Register.jsx`**: (`src/pages/Register.jsx`)
    *   Provides the user interface for new user registration. Handles form input and communicates with the registration API.
*   **`ConfirmEmail.jsx`**: (`src/pages/ConfirmEmail.jsx`)
    *   Handles the email confirmation process, typically by parsing a token from the URL (e.g., from a link sent to the user's email) and potentially updating the user's status.
*   **`Categories.jsx`**: (`src/pages/Categories.jsx`)
    *   Manages product categories. Allows users to view, add, edit, and delete categories.
*   **`Products.jsx`**: (`src/pages/Products.jsx`)
    *   Manages products. Features include viewing products, filtering by category, adding, editing, deleting products, importing products from Excel, and displaying low stock alerts.
*   **`Customers.jsx`**: (`src/pages/Customers.jsx`)
    *   Manages customer records. Allows users to view, search, add, edit, and delete customers.
*   **`POS.jsx`**: (`src/pages/POS.jsx`)
    *   Provides the Point of Sale interface for creating sales transactions. Includes product selection, cart management, customer association, and sale finalization.
*   **`SalesReports.jsx`**: (`src/pages/SalesReports.jsx`)
    *   Displays sales transaction history. Allows filtering of sales data, primarily by date range.

## 3. API Utility (`src/utils/api.js`) Overview

The `src/utils/api.js` file is central to communication with the backend API.

*   **Axios Instance:** It initializes a global Axios instance (`api`) with a `baseURL` (from `API_URL='http://localhost:8000/api/v1'`) and default headers (`Content-Type: application/json`).
*   **Request Interceptor:** An Axios request interceptor is configured to automatically attach the JWT token (retrieved from `localStorage`) to the `Authorization` header of outgoing requests. This simplifies authenticated API calls.
*   **API Function Groups:** API functions are organized into namespaces for clarity:
    *   `authAPI`: Handles authentication-related calls (login, register, get current user).
    *   `categoryAPI`: Handles CRUD operations for categories.
    *   `productAPI`: Handles CRUD operations for products, including Excel import.
    *   `customerAPI`: Handles CRUD operations for customers.
    *   `salesAPI`: Handles sales recording and fetching sales reports.
*   **Adding New API Interfaces:** To add new API calls, follow the existing pattern: define a new namespace (e.g., `newResourceAPI`) and add async functions that use the global `api` instance.

## 4. State Management Approach

Currently, the application primarily uses component-level state managed by React Hooks:
*   **`useState`**: For managing most component data, form inputs, loading flags, error messages, etc.
*   **`useEffect`**: For handling side effects, such as fetching data when a component mounts or when certain state variables change.
*   **`useCallback`**: Used in some components to memoize functions, preventing unnecessary re-renders of child components or re-creations of functions passed to `useEffect` dependencies.
*   **`useMemo`**: Used in some components (e.g., `POS.jsx` for `cartTotal`) to memoize expensive calculations.

No global state management library (like Redux or Zustand) is currently implemented. Data is typically passed down via props if needed, or fetched directly by components that require it.

## 5. Styling

*   **Global Styles:** `src/index.css` provides global styles, resets, CSS variables, and some utility classes.
*   **Component-Level Styling:** The application primarily uses Bootstrap utility classes for styling within components (e.g., `btn`, `form-control`, `card`, `table`).
    *   *Note: While Bootstrap classes are used, the Bootstrap CSS library itself is not explicitly installed as a dependency in `package.json` or imported globally in `main.tsx`. The styles observed are likely from a pre-existing setup or rely on globally available Bootstrap if the development environment provides it. For consistent styling, formally adding Bootstrap or a React-Bootstrap library would be recommended for future development.*

## 6. Development & Build Scripts

The following scripts are available in `package.json`:

*   **`npm run dev`**:
    *   Starts the Vite development server.
    *   Provides Hot Module Replacement (HMR) for a fast development experience.
    *   Typically accessible at `http://localhost:5173` (or the next available port).
*   **`npm run build`**:
    *   Compiles the TypeScript code (`tsc`) and then builds the application for production using Vite.
    *   The output is placed in the `dist/` directory.
*   **`npm run lint`**:
    *   Runs ESLint to analyze the code for potential errors and style issues based on the configured rules.
*   **`npm run preview`**:
    *   Serves the production build from the `dist/` directory locally. Useful for testing the production build before deployment.

```
