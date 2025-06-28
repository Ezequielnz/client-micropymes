import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import EmailConfirmation from './pages/EmailConfirmation';
import CreateBusiness from './pages/CreateBusiness';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessUsers from './pages/BusinessUsers';
import MyBusinesses from './pages/MyBusinesses';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Customers from './pages/Customers';
import POS from './pages/POS';
import SalesReports from './pages/SalesReports';
import Services from './pages/Services';
import Subscriptions from './pages/Subscriptions';
import ProductsAndServices from './pages/ProductsAndServices';
import Sales from './pages/Sales';
import Tasks from './pages/Tasks';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage.tsx';
import TestPage from './pages/TestPage';
import PendingApproval from './pages/PendingApproval';

/**
 * The main application component.
 * Sets up the application's routing using `react-router-dom`.
 * It defines the primary routes for authentication (Login, Register, ConfirmEmail)
 * and the Home page. It also includes a catch-all route that navigates to Home.
 * @returns {JSX.Element} The rendered application component with routing configured.
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      {/* BrowserRouter (aliased as Router) provides the routing context for the application. */}
      <Router>
        {/* Routes component is a container for all individual Route definitions. */}
        <Routes>
          {/* Each Route maps a URL path to a specific React component. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/my-businesses" element={<MyBusinesses />} />
          <Route path="/create-business" element={<CreateBusiness />} />
          <Route path="/business/:businessId" element={<BusinessDashboard />} />
          <Route path="/business/:businessId/categories" element={<Categories />} />
          <Route path="/business/:businessId/products" element={<Products />} />
          <Route path="/business/:businessId/services" element={<Services />} />
          <Route path="/business/:businessId/products-and-services" element={<ProductsAndServices />} />
          <Route path="/business/:businessId/customers" element={<Customers />} />
          <Route path="/business/:businessId/subscriptions" element={<Subscriptions />} />
          <Route path="/business/:businessId/pos" element={<POS />} />
          <Route path="/business/:businessId/sales" element={<Sales />} />
          <Route path="/business/:businessId/tasks" element={<Tasks />} />
          <Route path="/business/:businessId/reports" element={<SalesReports />} />
          <Route path="/business/:businessId/users" element={<BusinessUsers />} />
          {/* Catch-all route: If no other route matches, navigate to the home page. */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 