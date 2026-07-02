import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Wrap any route element with this to require login.
 * Pass allowedRoles={["admin"]} etc. to also gate by role.
 *
 * Usage:
 *   <Route path="/admin" element={
 *     <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
