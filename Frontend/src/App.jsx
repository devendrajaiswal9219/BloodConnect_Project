import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Landing from './pages/Landing.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Requests from './pages/Requests.jsx';
import Inventory from './pages/Inventory.jsx';
import Admin from './pages/Admin.jsx';
import Profile from './pages/Profile.jsx';

function Guard({ children, admin }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function Nav() {
  const { user } = useAuth();
  const link = ({ isActive }) => `px-3 py-1 rounded-md ${isActive ? 'bg-rose text-blood font-semibold' : 'hover:text-blood'}`;
  return (
    <header className="border-b border-saline/20 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 font-display text-xl font-extrabold text-blood">BloodConnect</Link>
        <NavLink to="/inventory" className={link}>Blood stock</NavLink>
        {user && <NavLink to="/dashboard" className={link}>Dashboard</NavLink>}
        {user && <NavLink to="/requests" className={link}>Requests</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" className={link}>Admin</NavLink>}
        <span className="flex-1" />
        {user ? <NavLink to="/profile" className={link}>{user.name || 'Profile'}</NavLink> : (
          <>
            <Link to="/login" className="btn-ghost">Log in</Link>
            <Link to="/register" className="btn">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
          <Route path="/requests" element={<Guard><Requests /></Guard>} />
          <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
          <Route path="/profile" element={<Guard><Profile /></Guard>} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
