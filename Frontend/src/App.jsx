function Home() {
    const { user } = useAuth();

    if (user) {
        return (
            <Navigate
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                replace
            />
        );
    }

    return <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <div className="min-h-screen bg-canvas">
            <Home />
        </div>
    );
}