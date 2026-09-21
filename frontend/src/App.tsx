import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import RequireRole from "./components/RequireRole";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import SupportDashboard from "./pages/SupportDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import Notifications from "./pages/Notifications";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <div className="flex min-h-screen flex-col bg-slate-50">
          <NavBar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<UserDashboard />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<RequireRole role="ADMIN"><AdminDashboard /></RequireRole>} />
              <Route path="/finance" element={<RequireRole role="FINANCE_OFFICER"><FinanceDashboard /></RequireRole>} />
              <Route path="/support" element={<RequireRole role="SUPPORT_STAFF"><SupportDashboard /></RequireRole>} />
              <Route path="/driver" element={<RequireRole role="DRIVER"><DriverDashboard /></RequireRole>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
