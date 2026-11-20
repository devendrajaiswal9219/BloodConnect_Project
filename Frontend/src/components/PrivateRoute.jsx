import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

export default function PrivateRoute({ children, adminOnly = false, roleOnly }) {
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

    if (roleOnly === "member" && user.role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    if (roleOnly && roleOnly !== "member" && user.role !== roleOnly) {
        return <Navigate to={user.role === "requester" ? "/requests" : "/dashboard"} replace />;
    }

    return children;
}   
