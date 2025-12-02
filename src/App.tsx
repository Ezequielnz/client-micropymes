import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import BusinessUsers from './pages/BusinessUsers';
import Categories from './pages/Categories';
import ConfirmEmail from './pages/ConfirmEmail';

import CreateBusiness from './pages/CreateBusiness';
import Customers from './pages/Customers';
import EmailConfirmation from './pages/EmailConfirmation';
import Finanzas from './pages/Finanzas';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

import POS from './pages/POS';
import PendingApproval from './pages/PendingApproval';
import ProductsAndServices from './pages/ProductsAndServices';
import Profile from './pages/Profile';
import Proveedores from './pages/Proveedores';
import Compras from './pages/Compras';
import Register from './pages/Register';
import SalesReports from './pages/SalesReports';

import Tasks from './pages/Tasks';

import StockTransfers from './pages/StockTransfers';
import BranchPreferences from './pages/BranchPreferences';

const App: React.FC = () => (
  <ErrorBoundary>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/confirm" element={<ConfirmEmail />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          <Route path="/create-business" element={<CreateBusiness />} />
          <Route path="/business-users" element={<BusinessUsers />} />

          {/* Routes that rely on BusinessContext instead of URL params */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/products-and-services" element={<ProductsAndServices />} />
          <Route path="/customers" element={<Customers />} />

          <Route path="/pos" element={<POS />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reports" element={<SalesReports />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/stock-transfers" element={<StockTransfers />} />
          <Route path="/settings/branch-preferences" element={<BranchPreferences />} />

          <Route
            path="/compras"
            element={
              <Layout activeSection="purchases">
                <Compras />
              </Layout>
            }
          />
          <Route
            path="/proveedores"
            element={
              <Layout activeSection="suppliers">
                <Proveedores />
              </Layout>
            }
          />

          {/* Legacy routes with businessId parameter for backward compatibility */}
          <Route path="/business/:businessId/categories" element={<Categories />} />
          <Route
            path="/business/:businessId/products-and-services"
            element={<ProductsAndServices />}
          />
          <Route path="/business/:businessId/customers" element={<Customers />} />

          <Route path="/business/:businessId/pos" element={<POS />} />
          <Route path="/business/:businessId/tasks" element={<Tasks />} />
          <Route path="/business/:businessId/reports" element={<SalesReports />} />
          <Route path="/business/:businessId/users" element={<BusinessUsers />} />
          <Route path="/business/:businessId/finanzas" element={<Finanzas />} />
          <Route
            path="/business/:businessId/compras"
            element={
              <Layout activeSection="purchases">
                <Compras />
              </Layout>
            }
          />
          <Route
            path="/business/:businessId/proveedores"
            element={
              <Layout activeSection="suppliers">
                <Proveedores />
              </Layout>
            }
          />
        </Route>

        {/* Catch-all route: If no other route matches, navigate to the home page. */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </ErrorBoundary>
);

export default App;
