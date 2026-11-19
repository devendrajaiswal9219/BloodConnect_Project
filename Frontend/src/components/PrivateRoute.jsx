import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

export default function PrivateRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-state" role="status">
                <span className="spinner" />
                <span>Loading your account…</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}   