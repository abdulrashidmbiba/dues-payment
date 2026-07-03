import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/auth/LoginPage";
import ImpactPage     from "./pages/user/ImpactPage";
import BadgesPage     from "./pages/user/BadgesPage";
import RegisterPage   from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage  from "./pages/auth/ResetPasswordPage";
import UserDashboard  from "./pages/user/UserDashboard";
import PayDues        from "./pages/user/payDues";
import UserSettings   from "./pages/user/SettingsPage";
import BalanceRecords from "./pages/user/balanceRecords";
import AdminDashboard from "./pages/admin/AdminDashboards";
import TreasurerDashboard from "./pages/Treasurer/TreasurerDashboard";
import ProtectedRoute from "./componenets/shared/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><UserDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/pay" element={
        <ProtectedRoute><PayDues /></ProtectedRoute>
      } />
      <Route path="/dashboard/history" element={
        <ProtectedRoute><BalanceRecords /></ProtectedRoute>
      } />
      <Route path="/dashboard/impact" element={
  <ProtectedRoute><ImpactPage /></ProtectedRoute>
} />
<Route path="/dashboard/badges" element={
  <ProtectedRoute><BadgesPage /></ProtectedRoute>
} />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/treasurer" element={
        <ProtectedRoute allowedRoles={["treasurer"]}><TreasurerDashboard /></ProtectedRoute>
      } />
<Route path="/dashboard/settings" element={
  <ProtectedRoute><UserSettings /></ProtectedRoute>
} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}