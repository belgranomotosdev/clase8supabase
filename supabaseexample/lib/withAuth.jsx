"use client";

import { useAuth } from "../../contexts/AuthContext";

export default function withAuth(Component, requiredRole = "user") {
  return function AuthComponent(props) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Uso:
// export default withAuth(MyPage, "admin");
