import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import PrivateRoute from "./PrivateRoute";
import AppLayout from "../components/layout/AppLayout";

// Auth
import Login from "../pages/auth/Login";

// Dashboards
import OwnerDashboard from "../pages/dashboard/OwnerDashboard";
import TenantDashboard from "../pages/dashboard/TenantDashboard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";

// Properties
import PropertiesList from "../pages/properties/PropertiesList";
import PropertyDetail from "../pages/properties/PropertyDetail";

// Tenants
import TenantsList from "../pages/tenants/TenantsList";
import TenantDetail from "../pages/tenants/TenantDetail";

// Contractors
import ContractorsList from "../pages/contractors/ContractorsList";

// Charges
import ChargesList from "../pages/charges/ChargesList";

// Payments
import PaymentsList from "../pages/payments/PaymentsList";

// Tenant-only pages
import PaymentHistory from "../pages/tenant/PaymentHistory";

function RootRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "TENANT") return <Navigate to="/my-dashboard" replace />;
  if (user.role === "SUPER ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Owner / Super Admin routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={["OWNER", "SUPER ADMIN"]}>
            <AppLayout>
              <OwnerDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/properties"
        element={
          <PrivateRoute allowedRoles={["OWNER", "SUPER ADMIN"]}>
            <AppLayout>
              <PropertiesList />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/properties/:id"
        element={
          <PrivateRoute allowedRoles={["OWNER", "SUPER ADMIN"]}>
            <AppLayout>
              <PropertyDetail />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tenants"
        element={
          <PrivateRoute allowedRoles={["OWNER", "SUPER ADMIN"]}>
            <AppLayout>
              <TenantsList />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tenants/:id"
        element={
          <PrivateRoute allowedRoles={["OWNER", "SUPER ADMIN"]}>
            <AppLayout>
              <TenantDetail />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/contractors"
        element={
          <PrivateRoute allowedRoles={["OWNER", "SUPER ADMIN"]}>
            <AppLayout>
              <ContractorsList />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/charges"
        element={
          <PrivateRoute allowedRoles={["OWNER", "SUPER ADMIN"]}>
            <AppLayout>
              <ChargesList />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <PrivateRoute allowedRoles={["OWNER", "SUPER ADMIN"]}>
            <AppLayout>
              <PaymentsList />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Super Admin only */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["SUPER ADMIN"]}>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Tenant only */}
      <Route
        path="/my-dashboard"
        element={
          <PrivateRoute allowedRoles={["TENANT", "SUPER ADMIN"]}>
            <AppLayout>
              <TenantDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/payment-history"
        element={
          <PrivateRoute allowedRoles={["TENANT", "SUPER ADMIN"]}>
            <AppLayout>
              <PaymentHistory />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
