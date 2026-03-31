import { lazy, Suspense } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { CustomerLayout } from './components/CustomerLayout';
import { PublicLayout } from './components/PublicLayout';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { useEffect, useState } from 'react';
import Splash from './components/Splash';

const Dashboard = lazy(() => import('./pages/Dashboard'));

// Customer Pages
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const MachineCatalog = lazy(() => import('./pages/customer/MachineCatalog'));
const MyRentals = lazy(() => import('./pages/customer/MyRentals'));
const CustomerContact = lazy(() => import('./pages/customer/Contact'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

// Admin Pages
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const MachineManagement = lazy(() => import('./pages/admin/MachineManagement'));
const RentalManagement = lazy(() => import('./pages/admin/RentalManagement'));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement'));
const FinanceManagement = lazy(() => import('./pages/admin/FinanceManagement'));
const Settings = lazy(() => import('./pages/admin/Settings'));

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const Machines = lazy(() => import('./pages/public/Machines'));
const Services = lazy(() => import('./pages/public/Services'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));

function RouteManager() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    // Show splash on initial mount (page reload)
    // total visible time = animation delay (300ms) + animation duration (2000ms)
    const t = setTimeout(() => setShowSplash(false), 2300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // If login (or any action) set flag to show splash on next navigation
    const flag = localStorage.getItem('showSplashNext');
    if (flag === 'true') {
      localStorage.removeItem('showSplashNext');
      setShowSplash(true);
      // account for 300ms delay + 2000ms animation
      const t = setTimeout(() => setShowSplash(false), 2300);
      return () => clearTimeout(t);
    }
    // no-op cleanup
    return;
  }, [location.key]);

  return (
    <>
      {showSplash && <Splash />}
      <Suspense fallback={<div className="min-h-screen bg-secondary-50" />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="machines" element={<MachineCatalog />} />
            <Route path="rentals" element={<MyRentals />} />
            <Route path="contact" element={<CustomerContact />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="machines" element={<MachineManagement />} />
            <Route path="rentals" element={<RentalManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="finances" element={<FinanceManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <RouteManager />
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
