import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import CreateBusiness from './pages/CreateBusiness';
import Categories from './pages/Categories';
import Products from './pages/Products';
import LandingPage from './pages/LandingPage.tsx';

/**
 * The main application component.
 * Sets up the application's routing using `react-router-dom`.
 * It defines the primary routes for authentication (Login, Register, ConfirmEmail)
 * and the Home page. It also includes a catch-all route that navigates to Home.
 * @returns {JSX.Element} The rendered application component with routing configured.
 */
const App: React.FC = () => {
  return (
    // BrowserRouter (aliased as Router) provides the routing context for the application.
    <Router>
      {/* Routes component is a container for all individual Route definitions. */}
      <Routes>
        {/* Each Route maps a URL path to a specific React component. */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/create-business" element={<CreateBusiness />} />
        <Route path="/businesses/:businessId/categories" element={<Categories />} />
        <Route path="/businesses/:businessId/products" element={<Products />} />
        {/* Catch-all route: If no other route matches, navigate to the home page. */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App; 