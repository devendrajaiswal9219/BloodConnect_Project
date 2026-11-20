import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import api from './api/axios';
import { useAuth } from './context/auth';
import InventoryGrid from './components/InventoryGrid';
import PrivateRoute from './components/PrivateRoute';
import './App.css';
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ICON_PATHS = {
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  droplet: 'M12 22a8 8 0 0 0 8-8c0-4-8-12-8-12S4 10 4 14a8 8 0 0 0 8 8Z',
  chart: 'M3 3v18h18M8 15l4-4 4 3 5-7',
  shield: 'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z',
  arrow: 'M7 17 17 7M7 7h10v10',
  plus: 'M12 5v14m-7-7h14',
  user: 'M20 21a8 8 0 0 0-16 0m8-10a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
};
function Icon({ name, size = 18 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) {
    return 'Could not connect to the server. Make sure the backend is running at localhost:8000.';
  }
  return 'Something went wrong. Please try again.';
}
function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}
function Home() {
     const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}
function Loading() {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      <span>Loading your workspace…</span>
    </div>
  );
}
function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('donor');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    try {
      const signedInUser = isRegister
        ? await register({
            name: String(form.get('name') || '').trim(),
            email,
            password,
            role,
            phone: String(form.get('phone') || '').trim(),
            bloodGroup: role === 'donor' ? form.get('bloodGroup') : undefined,
            organization: role === 'requester' ? String(form.get('organization') || '').trim() : undefined,
          })
        : await login(email, password);
      navigate(signedInUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Link className="brand brand-light" to="/">
          <span className="brand-mark" aria-hidden="true"><Icon name="plus" size={20} /></span>
          <span>BloodConnect</span>
        </Link>
        <div className="auth-message">
          <p className="eyebrow">Care that connects</p>
          <h1>One community. A lifeline when it matters most.</h1>
          <p>Bring donors, care teams and blood-bank inventory together in one trusted place.</p>
          <div className="auth-highlight">
            <span className="highlight-icon"><Icon name="heart" size={22} /></span>
            <span><strong>Every donation counts.</strong><br />Make a meaningful difference in your community.</span>
          </div>
        </div>
        <div className="auth-visual" aria-hidden="true">
          <div className="visual-circle visual-circle-back" />
          <div className="visual-circle visual-circle-front" />
          <div className="blood-bag"><span className="bag-cap" /><span className="bag-label"><Icon name="heart" size={24} /></span><span className="bag-fill" /><span className="bag-line" /></div>
          <div className="visual-caption"><span className="caption-dot" /> A little care goes a long way</div>
        </div>
        <div className="auth-trust"><Icon name="shield" size={16} /><span>Built for safer, more connected care</span></div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">{isRegister ? 'Get started' : 'Welcome back'}</p>
          <h2>{isRegister ? 'Create your account' : 'Sign in to BloodConnect'}</h2>
          <p className="muted">{isRegister ? 'Set up your profile to get started.' : 'Enter your details to continue.'}</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <label className="field">
                  <span>Full name</span>
                  <input name="name" autoComplete="name" required maxLength={80} />
                </label>
                <fieldset className="role-picker">
                  <legend>I’m here as a</legend>
                  <div className="role-options">
                    <label className={role === 'donor' ? 'role-option selected' : 'role-option'}>
                      <input type="radio" name="role-choice" value="donor" checked={role === 'donor'} onChange={() => setRole('donor')} />
                      <span className="role-icon" aria-hidden="true">♥</span>
                      <span><strong>Blood donor</strong><small>Give blood and track donations</small></span>
                    </label>
                    <label className={role === 'requester' ? 'role-option selected' : 'role-option'}>
                      <input type="radio" name="role-choice" value="requester" checked={role === 'requester'} onChange={() => setRole('requester')} />
                      <span className="role-icon requester-icon" aria-hidden="true">+</span>
                      <span><strong>Care team</strong><small>Request blood for a patient</small></span>
                    </label>
                  </div>
                </fieldset>
                {role === 'donor' ? (
                  <label className="field">
                    <span>Blood group</span>
                    <select name="bloodGroup" required defaultValue="">
                      <option value="" disabled>Select your blood group</option>
                      {BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}
                    </select>
                  </label>
                ) : (
                  <label className="field">
                    <span>Hospital or organization</span>
                    <input name="organization" required maxLength={100} />
                  </label>
                )}
                <label className="field">
                  <span>Phone number <small>(optional)</small></span>
                  <input name="phone" type="tel" autoComplete="tel" maxLength={15} />
                </label>
              </>
            )}
            <label className="field">
              <span>Email address</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={6} required />
              {isRegister && <small className="field-hint">Use at least 6 characters.</small>}
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary button-wide" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
              {!busy && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to BloodConnect?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navigation = user?.role === 'admin'
    ? [{ label: 'Admin dashboard', to: '/admin', icon: 'chart', end: true }, { label: 'Blood availability', to: '/blood-availability', icon: 'droplet' }]
    : user?.role === 'donor'
      ? [{ label: 'Overview', to: '/dashboard', icon: 'chart', end: true }, { label: 'Blood availability', to: '/blood-availability', icon: 'droplet' }, { label: 'Schedule donation', to: '/donations/schedule', icon: 'calendar' }, { label: 'Donation history', to: '/donations/history', icon: 'clock' }, { label: 'Donor profile', to: '/profile', icon: 'user' }]
      : [{ label: 'Overview', to: '/dashboard', icon: 'chart', end: true }, { label: 'Blood availability', to: '/blood-availability', icon: 'droplet' }, { label: 'Blood requests', to: '/requests', icon: 'heart' }, { label: 'Profile', to: '/profile', icon: 'user' }];
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
          <span className="brand-mark" aria-hidden="true"><Icon name="plus" size={18} /></span>
          <span>BloodConnect</span>
        </Link>
        <div className="topbar-right">
          <span className="user-chip"><span className="avatar"><Icon name="user" size={16} /></span><span className="user-name">{user?.name}</span></span>
          <button className="button button-quiet" onClick={handleLogout}><span>Sign out</span><Icon name="arrow" size={15} /></button>
        </div>
      </header>
      <div className="workspace-shell">
        <aside className="workspace-sidebar">
          <p className="sidebar-label">WORKSPACE</p>
          <nav className="workspace-nav" aria-label="Main navigation">
            {navigation.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `workspace-nav-link${isActive ? ' active' : ''}`}><Icon name={item.icon} size={17} /><span>{item.label}</span>{item.to === '/admin' && <span className="nav-role-badge">ADMIN</span>}</NavLink>)}
          </nav>
          <div className="sidebar-help"><span className="help-icon"><Icon name="heart" size={16} /></span><strong>Care, connected.</strong><p>Thank you for being part of your community’s care network.</p></div>
          <div className="sidebar-profile"><span className="avatar"><Icon name="user" size={15} /></span><span><strong>{user?.name}</strong><small>{user?.role === 'admin' ? 'Administrator' : user?.role === 'donor' ? 'Blood donor' : 'Care team'}</small></span></div>
        </aside>
        <main className="page-content">{children}</main>
      </div>
      <footer className="footer">BloodConnect <span>•</span> Together, we can save lives.</footer>
    </div>
  );
}
function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="muted heading-description">{description}</p>}
      </div>
      {children}
    </div>
  );
}
function Panel({ title, description, action, children, className = '', id }) {
  return (
    <section className={`panel ${className}`} id={id}>
      {(title || action) && (
        <div className="panel-heading">
          <div>{title && <h2>{title}</h2>}{description && <p className="muted">{description}</p>}</div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
function StatusBadge({ status }) {
  const normalized = String(status || 'pending').toLowerCase();
  return <span className={`status-badge status-${normalized}`}>{normalized}</span>;
}
function ActivityTable({ items, loading, isDonor, onCancel }) {
  if (loading) return <Loading />;
  if (!items.length) return <EmptyState title={isDonor ? 'No donations yet' : 'No requests yet'} description={isDonor ? 'Scheduled donations will appear here.' : 'Requests submitted by your team will appear here.'} />;
  return (
    <div className="table-scroll">
      <table>
        <thead><tr>{isDonor ? <><th>Date</th><th>Location</th><th>Units</th><th>Status</th><th>Action</th></> : <><th>Request</th><th>Patient / hospital</th><th>Group</th><th>Units</th><th>Status</th></>}</tr></thead>
        <tbody>{items.map((item) => <tr key={item._id}>
          {isDonor ? <><td>{formatDate(item.donationDate || item.createdAt)}</td><td>{item.location || 'Main Blood Bank'}</td><td>{item.units ?? item.unitsDonated ?? 1}</td><td><StatusBadge status={item.status} /></td><td>{String(item.status).toLowerCase() === 'scheduled' && <button className="text-button" onClick={() => onCancel(item._id)}>Cancel</button>}</td></>
            : <><td className="request-number">{item.requestNumber || item._id?.slice(-6)}</td><td><strong>{item.patientName}</strong><small className="table-subtext">{item.hospitalName}</small></td><td><span className="table-blood">{item.bloodGroup}</span></td><td>{item.unitsRequested}</td><td><StatusBadge status={item.status} /></td></>}
        </tr>)}</tbody>
      </table>
    </div>
  );
}
function UserDashboard({ view = 'overview' }) {

    const { user } = useAuth();
 const isDonor = user.role === 'donor';
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function loadDashboard() {
    setError('');
    try {
      const [activityResponse, inventoryResponse] = await Promise.all([
        api.get(isDonor ? '/donations/mine' : '/requests/mine'),
        api.get('/inventory'),
      ]);
      setItems(activityResponse.data[isDonor ? 'donations' : 'requests'] || []);
      setInventory(inventoryResponse.data.inventory || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    Promise.all([
      api.get(isDonor ? '/donations/mine' : '/requests/mine'),
      api.get('/inventory'),
    ]).then(([activityResponse, inventoryResponse]) => {
      if (!active) return;
      setItems(activityResponse.data[isDonor ? 'donations' : 'requests'] || []);
      setInventory(inventoryResponse.data.inventory || []);
    }).catch((requestError) => {
      if (active) setError(getErrorMessage(requestError));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [isDonor]);
  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError('');
    setMessage('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = isDonor
      ? {
          donationDate: form.get('donationDate'),
          units: Number(form.get('units')),
          location: String(form.get('location') || '').trim(),
        }
      : {
          patientName: String(form.get('patientName') || '').trim(),
          hospitalName: String(form.get('hospitalName') || '').trim(),
          bloodGroup: form.get('bloodGroup'),
          unitsRequested: Number(form.get('unitsRequested')),
          urgency: form.get('urgency'),
          requiredBy: form.get('requiredBy') || undefined,
          reason: String(form.get('reason') || '').trim(),
        };
    try {
      await api.post(isDonor ? '/donations' : '/requests', payload);
      formElement.reset();
      setMessage(isDonor ? 'Your donation has been scheduled.' : 'Your blood request has been submitted.');
      await loadDashboard();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }
  async function cancelDonation(id) {
    setError('');
    try {
      await api.patch(`/donations/${id}/cancel`);
      setMessage('Donation cancelled.');
      await loadDashboard();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }
  const pendingCount = items.filter((item) => String(item.status).toLowerCase() === 'pending' || String(item.status).toLowerCase() === 'scheduled').length;
  const dateMinimum = new Date().toISOString().slice(0, 10);
  const completedDonations = isDonor ? items.filter((item) => item.status === 'completed') : [];
  const upcomingDonations = isDonor
    ? items.filter((item) => item.status === 'scheduled' && String(item.donationDate).slice(0, 10) >= dateMinimum).sort((a, b) => new Date(a.donationDate).getTime() - new Date(b.donationDate).getTime())
    : [];
  const totalUnitsDonated = completedDonations.reduce((total, item) => total + Number(item.units ?? item.unitsDonated ?? 0), 0);
  const monthlyActivity = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    const count = items.filter((item) => {
      const activityDate = new Date(isDonor ? item.donationDate || item.createdAt : item.createdAt);
      return activityDate.getFullYear() === date.getFullYear() && activityDate.getMonth() === date.getMonth();
    }).length;
    return { label: date.toLocaleDateString(undefined, { month: 'short' }), count };
  });
  const chartMax = Math.max(...monthlyActivity.map((month) => month.count), 1);
  const totalAvailableUnits = inventory.reduce((total, item) => total + Number(item.unitsAvailable || 0), 0);

  if (view === 'inventory') {
    return <AppLayout><PageHeading eyebrow="Live network supply" title="Blood availability" description="Current inventory reported across all eight blood groups." /><div className="inventory-summary"><span className="overview-icon"><Icon name="droplet" size={19} /></span><span><small>Total units available</small><strong>{loading ? '—' : totalAvailableUnits}</strong></span></div>{error && <p className="notice notice-error" role="alert">{error}</p>}<Panel title="Inventory by blood group" description="Stock status reflects the current inventory data.">{loading ? <Loading /> : <InventoryGrid items={inventory} />}</Panel></AppLayout>;
  }

  if (view === 'schedule') {
    return <AppLayout><PageHeading eyebrow="Plan your next visit" title="Schedule a donation" description="Choose a date and share the donation center you plan to visit."><div className="profile-summary"><span className="summary-blood">{user.bloodGroup || '—'}</span><span><strong>Your blood group</strong><small>Donor profile</small></span></div></PageHeading>{error && <p className="notice notice-error" role="alert">{error}</p>}{message && <p className="notice notice-success" role="status">{message}</p>}<Panel title="Donation appointment" description="Donation date must be today or later; units are limited by the donation policy." className="page-form-panel"><form id="donation-form" className="form-grid" onSubmit={handleSubmit}><label className="field"><span>Donation date</span><input type="date" name="donationDate" min={dateMinimum} required /></label><label className="field"><span>Units</span><input type="number" name="units" min="1" max="5" defaultValue="1" required /></label><label className="field field-span"><span>Donation center or location</span><input name="location" maxLength={150} placeholder="e.g. City Blood Bank" /></label><div className="field-span form-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Scheduling…' : 'Schedule donation'}<Icon name="arrow" size={15} /></button></div></form></Panel><p className="page-helper">After scheduling, your visit will appear in <Link to="/donations/history">Donation history</Link>.</p></AppLayout>;
  }

  if (view === 'history') {
    return <AppLayout><PageHeading eyebrow="Your activity" title="Donation history" description="Review the status and details of your scheduled and completed donations."><Link className="button button-primary" to="/donations/schedule"><Icon name="plus" size={16} /> Schedule donation</Link></PageHeading>{error && <p className="notice notice-error" role="alert">{error}</p>}{message && <p className="notice notice-success" role="status">{message}</p>}<Panel title="All donations" description={`${items.length} donation record${items.length === 1 ? '' : 's'} on your account.`}><ActivityTable items={items} loading={loading} isDonor onCancel={cancelDonation} /></Panel></AppLayout>;
  }

  if (view === 'requests') {
    return <AppLayout><PageHeading eyebrow="Care team workspace" title="Blood requests" description="Submit a patient request and track its review status." /><div className="dashboard-main"><Panel title="Create a request" description="Provide the patient and hospital details for review." className="page-form-panel"><form className="form-grid" onSubmit={handleSubmit}><label className="field"><span>Patient name</span><input name="patientName" required maxLength={120} /></label><label className="field"><span>Hospital or clinic</span><input name="hospitalName" required maxLength={150} /></label><label className="field"><span>Blood group</span><select name="bloodGroup" required defaultValue=""><option value="" disabled>Select group</option>{BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}</select></label><label className="field"><span>Units needed</span><input type="number" name="unitsRequested" min="1" max="20" defaultValue="1" required /></label><label className="field"><span>Urgency</span><select name="urgency" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label><label className="field"><span>Required by</span><input type="date" name="requiredBy" min={dateMinimum} /></label><label className="field field-span"><span>Additional details <small>(optional)</small></span><textarea name="reason" rows="3" maxLength={1000} placeholder="Anything our team should know?" /></label><div className="field-span form-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}<Icon name="arrow" size={15} /></button></div></form></Panel>{error && <p className="notice notice-error" role="alert">{error}</p>}{message && <p className="notice notice-success" role="status">{message}</p>}<Panel title="Request history" description="Recent requests and their current status."><ActivityTable items={items} loading={loading} isDonor={false} /></Panel></div></AppLayout>;
  }

  if (view === 'profile') {
    return <AppLayout><PageHeading eyebrow="Account details" title={user.role === 'donor' ? 'Donor profile' : 'Profile'} description="Your registered account information." /><Panel title="Personal information" description="Profile details associated with your account."><div className="profile-details"><div><span>Full name</span><strong>{user.name || '—'}</strong></div><div><span>Email address</span><strong>{user.email || '—'}</strong></div><div><span>Account type</span><strong>{user.role === 'admin' ? 'Administrator' : user.role === 'donor' ? 'Blood donor' : 'Care team'}</strong></div><div><span>Phone number</span><strong>{user.phone || 'Not provided'}</strong></div>{user.role === 'donor' && <div><span>Blood group</span><strong>{user.bloodGroup || 'Not provided'}</strong></div>}{user.role === 'requester' && <div><span>Organization</span><strong>{user.organization || 'Not provided'}</strong></div>}<div><span>Member since</span><strong>{formatDate(user.createdAt)}</strong></div></div></Panel></AppLayout>;
  }

        return (
          <AppLayout>
      <PageHeading
        eyebrow={isDonor ? 'Donor workspace' : 'Care team workspace'}
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user.name.split(' ')[0]}.`}
        description={isDonor ? 'Your generosity makes a difference. Here is your donation overview.' : 'Manage care requests and check current blood availability.'}
      >
        <div className="profile-summary">
          <span className="summary-blood">{isDonor ? user.bloodGroup || '—' : <Icon name="user" size={18} />}</span>
          <span><strong>{isDonor ? 'Blood group' : 'Care team'}</strong><small>{isDonor ? 'Donor profile' : user.organization || 'Organization'}</small></span>
        </div>
      </PageHeading>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {message && <p className="notice notice-success" role="status">{message}</p>}
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-kicker"><Icon name="heart" size={15} /> COMMUNITY CARE</span>
          <h2>{isDonor ? 'Your next act of kindness starts here.' : 'The right support, at the right time.'}</h2>
          <p>{isDonor ? 'Schedule a visit, keep track of your contributions, and stay connected to local availability.' : 'Create a request and follow its status while our team coordinates the next steps.'}</p>
          <Link className="button button-light" to={isDonor ? '/donations/schedule' : '/requests'}>{isDonor ? 'Schedule a donation' : 'Create a blood request'}<Icon name="arrow" size={16} /></Link>
        </div>
        <div className="welcome-art" aria-hidden="true"><span className="art-ring art-ring-one" /><span className="art-ring art-ring-two" /><span className="art-drop"><Icon name="droplet" size={46} /></span><span className="art-orbit orbit-one">A+</span><span className="art-orbit orbit-two">O−</span></div>
      </section>
      <section className="overview-grid" aria-label="Your overview">
        {(isDonor ? [
          { label: 'Completed donations', value: completedDonations.length, icon: 'heart', detail: 'Your giving history' },
          { label: 'Units contributed', value: totalUnitsDonated, icon: 'droplet', detail: 'Across completed visits' },
          { label: 'Upcoming visits', value: upcomingDonations.length, icon: 'calendar', detail: upcomingDonations[0] ? formatDate(upcomingDonations[0].donationDate) : 'No visit scheduled' },
          { label: 'Units available', value: totalAvailableUnits, icon: 'droplet', detail: 'Across all blood groups' },
        ] : [
          { label: 'Requests submitted', value: items.length, icon: 'chart', detail: 'Your team’s activity' },
          { label: 'Awaiting review', value: items.filter((item) => item.status === 'pending').length, icon: 'clock', detail: 'Pending requests' },
          { label: 'Approved requests', value: items.filter((item) => item.status === 'approved').length, icon: 'check', detail: 'Ready for next steps' },
          { label: 'Units available', value: totalAvailableUnits, icon: 'droplet', detail: 'Across all blood groups' },
        ]).map((metric, index) => (
          <article className="overview-card" key={metric.label}>
            <span className={`overview-icon overview-icon-${index}`}><Icon name={metric.icon} size={19} /></span>
            <div><p>{metric.label}</p><strong>{loading ? '—' : metric.value}</strong><small>{metric.detail}</small></div>
          </article>
        ))}
      </section>
      <div className="dashboard-grid overview-content">
        <div className="dashboard-main">
          <Panel title={isDonor ? 'Recent donations' : 'Recent requests'} description="Your latest activity and status." action={<Link className="panel-link" to={isDonor ? '/donations/history' : '/requests'}>View all <Icon name="arrow" size={14} /></Link>}><ActivityTable items={items.slice(0, 5)} loading={loading} isDonor={isDonor} onCancel={cancelDonation} /></Panel>
          {isDonor && <Panel title="Giving over time" description="Your donation activity across recent months.">{loading ? <Loading /> : items.length ? <div className="activity-chart" role="img" aria-label="Donation activity by month for the last six months">{monthlyActivity.map((month) => <div className="chart-column" key={month.label}><span className="chart-count">{month.count || ''}</span><div className="chart-track"><span style={{ height: `${Math.max((month.count / chartMax) * 100, month.count ? 12 : 4)}%` }} /></div><small>{month.label}</small></div>)}</div> : <EmptyState title="Your story starts here" description="Donation activity will appear here when you schedule a visit." />}</Panel>}
        </div>
        <aside className="dashboard-aside">
          <Panel title="Next step" description={isDonor ? 'Keep your donor profile active.' : 'Follow up on the needs you have submitted.'}><div className="dashboard-next-step"><span className="overview-icon"><Icon name={isDonor ? 'calendar' : 'heart'} size={19} /></span><div><strong>{isDonor ? upcomingDonations[0] ? formatDate(upcomingDonations[0].donationDate) : 'Plan your next visit' : `${pendingCount} request${pendingCount === 1 ? '' : 's'} in progress`}</strong><p>{isDonor ? 'Your next scheduled donation' : 'Requests are updated as they are reviewed.'}</p></div></div><Link className="button button-secondary dashboard-action-link" to={isDonor ? '/donations/schedule' : '/requests'}>{isDonor ? 'Schedule donation' : 'View requests'}<Icon name="arrow" size={14} /></Link></Panel>
          <Panel title="Blood availability" description="Current stock across the network."><div className="availability-summary"><span className="overview-icon overview-icon-2"><Icon name="droplet" size={19} /></span><div><strong>{loading ? '—' : totalAvailableUnits}</strong><small>units currently available</small></div></div><Link className="panel-link availability-link" to="/blood-availability">View all blood groups <Icon name="arrow" size={14} /></Link></Panel>
        </aside>
      </div>
    </AppLayout>
        );
    }

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  async function loadAdminData() {
    setError('');
    try {
      const [statsResponse, inventoryResponse, requestResponse, donationResponse] = await Promise.all([
        api.get('/stats'),
        api.get('/inventory'),
        api.get('/requests'),
        api.get('/donations'),
      ]);
      setStats(statsResponse.data);
      setInventory(inventoryResponse.data.inventory || []);
      setRequests(requestResponse.data.requests || []);
      setDonations(donationResponse.data.donations || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
}

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/stats'),
      api.get('/inventory'),
      api.get('/requests'),
      api.get('/donations'),
    ]).then(([statsResponse, inventoryResponse, requestResponse, donationResponse]) => {
      if (!active) return;
      setStats(statsResponse.data);
      setInventory(inventoryResponse.data.inventory || []);
      setRequests(requestResponse.data.requests || []);
      setDonations(donationResponse.data.donations || []);
    }).catch((requestError) => {
      if (active) setError(getErrorMessage(requestError));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);
  async function reviewRequest(id, status) {
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await api.patch(`/requests/${id}/review`, { status });
      setMessage(`Request marked ${status}.`);
      await loadAdminData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyId('');
    }
  }
  async function completeDonation(id) {
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await api.patch(`/donations/${id}/complete`);
      setMessage('Donation marked complete and inventory updated.');
      await loadAdminData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyId('');
    }
  }
  async function updateInventory(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const bloodGroup = form.get('bloodGroup');
    const unitsAvailable = Number(form.get('unitsAvailable'));
    setError('');
    setMessage('');
    setBusyId('inventory');
    try {
      await api.patch(`/inventory/${encodeURIComponent(bloodGroup)}`, { unitsAvailable });
      setMessage(`${bloodGroup} inventory updated.`);
      await loadAdminData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyId('');
    }
  }
  const metricCards = [
    { label: 'Registered donors', value: stats?.donorCount ?? '—', icon: '♥', tone: 'red' },
    { label: 'Care teams', value: stats?.requesterCount ?? '—', icon: '+', tone: 'blue' },
    { label: 'Units in inventory', value: stats?.totalUnitsAvailable ?? '—', icon: '◈', tone: 'green' },
    { label: 'Open requests', value: requests.filter((request) => request.status === 'pending').length, icon: '↗', tone: 'gold' },
  ];
  const adminActivity = [
    { label: 'Donations', statuses: stats?.donationsByStatus || {} },
    { label: 'Blood requests', statuses: stats?.requestsByStatus || {} },
  ];
  const adminActivityTotal = adminActivity.reduce((total, category) => total + Object.values(category.statuses).reduce((sum, count) => sum + count, 0), 0);
  return (
    <AppLayout>
      <PageHeading eyebrow="Operations overview" title="Admin dashboard" description="Monitor supply, review requests, and coordinate donations." />
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {message && <p className="notice notice-success" role="status">{message}</p>}
      <div className="metric-grid">
        {metricCards.map((card) => (
          <div className="metric-card" key={card.label}>
            <span className={`metric-icon metric-${card.tone}`} aria-hidden="true">{card.icon}</span>
            <span><strong className="metric-value">{card.value}</strong><small className="metric-label">{card.label}</small></span>
          </div>
        ))}
      </div>
      <Panel title="Activity analytics" description="Current donation and request status across the system." className="admin-analytics">
        {loading ? <Loading /> : adminActivityTotal ? <div className="analytics-grid">
          {adminActivity.map((category) => {
            const total = Object.values(category.statuses).reduce((sum, count) => sum + count, 0);
            return <div className="analytics-category" key={category.label}>
              <div className="analytics-heading"><strong>{category.label}</strong><span>{total} total</span></div>
              <div className="analytics-bar" aria-label={`${category.label} status distribution`}>
                {Object.entries(category.statuses).map(([status, count]) => <span className={`analytics-segment segment-${status}`} key={status} style={{ width: `${total ? (count / total) * 100 : 0}%` }} title={`${status}: ${count}`} />)}
              </div>
              <div className="analytics-legend">{Object.entries(category.statuses).map(([status, count]) => <span key={status}><i className={`legend-dot segment-${status}`} />{status} <strong>{count}</strong></span>)}</div>
            </div>;
          })}
        </div> : <EmptyState title="No activity recorded yet" description="Donation and request analytics will appear as records are created." />}
      </Panel>
      <div className="admin-grid">
        <Panel title="Blood inventory" description="Review live supply and adjust available units." className="inventory-panel" >
          {loading ? <Loading /> : <InventoryGrid items={inventory} />}
          <form className="inventory-editor" onSubmit={updateInventory}>
            <label className="field"><span>Blood group</span><select name="bloodGroup" defaultValue="O+">{BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}</select></label>
            <label className="field"><span>Available units</span><input type="number" name="unitsAvailable" min="0" required /></label>
            <button className="button button-secondary" disabled={busyId === 'inventory'}>{busyId === 'inventory' ? 'Saving…' : 'Update stock'}</button>
          </form>
        </Panel>
        <Panel title="Requests to review" description="Review patient blood requests and update their status." className="admin-list-panel" id="admin-activity">
          {loading ? <Loading /> : requests.length ? <div className="table-scroll"><table><thead><tr><th>Patient</th><th>Group</th><th>Units</th><th>Urgency</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((request) => (
            <tr key={request._id}><td><strong>{request.patientName}</strong><small className="table-subtext">{request.hospitalName}</small></td><td><span className="table-blood">{request.bloodGroup}</span></td><td>{request.unitsRequested}</td><td><span className={`urgency urgency-${request.urgency}`}>{request.urgency || 'medium'}</span></td><td><StatusBadge status={request.status} /></td><td>{request.status === 'pending' ? <div className="table-actions"><button className="text-button" disabled={busyId === request._id} onClick={() => reviewRequest(request._id, 'approved')}>Approve</button><button className="text-button danger-text" disabled={busyId === request._id} onClick={() => reviewRequest(request._id, 'rejected')}>Decline</button></div> : request.status === 'approved' ? <button className="text-button" disabled={busyId === request._id} onClick={() => reviewRequest(request._id, 'fulfilled')}>Fulfill</button> : '—'}</td></tr>
          ))}</tbody></table></div> : <EmptyState title="No blood requests" description="New requests from care teams will appear here." />}
        </Panel>
        <Panel title="Donations" description="Track incoming donations and add completed units to inventory." className="admin-list-panel">
          {loading ? <Loading /> : donations.length ? <div className="table-scroll"><table><thead><tr><th>Donor</th><th>Group</th><th>Units</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{donations.map((donation) => (
            <tr key={donation._id}><td><strong>{donation.donor?.name || 'Donor'}</strong><small className="table-subtext">{donation.donor?.email || ''}</small></td><td><span className="table-blood">{donation.bloodGroup}</span></td><td>{donation.units ?? donation.unitsDonated ?? 1}</td><td>{formatDate(donation.donationDate || donation.createdAt)}</td><td><StatusBadge status={donation.status} /></td><td>{String(donation.status).toLowerCase() === 'scheduled' && <button className="text-button" disabled={busyId === donation._id} onClick={() => completeDonation(donation._id)}>Mark complete</button>}</td></tr>
          ))}</tbody></table></div> : <EmptyState title="No donations yet" description="Donor activity will appear here." />}
        </Panel>
      </div>
    </AppLayout>
  );
}
function EmptyState({ title, description }) {
  return <div className="empty-state"><span className="empty-icon" aria-hidden="true">＋</span><strong>{title}</strong><p>{description}</p></div>;
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/dashboard" element={<PrivateRoute roleOnly="member"><UserDashboard /></PrivateRoute>} />
        <Route path="/blood-availability" element={<PrivateRoute><UserDashboard view="inventory" /></PrivateRoute>} />
        <Route path="/donations/schedule" element={<PrivateRoute roleOnly="donor"><UserDashboard view="schedule" /></PrivateRoute>} />
        <Route path="/donations/history" element={<PrivateRoute roleOnly="donor"><UserDashboard view="history" /></PrivateRoute>} />
        <Route path="/requests" element={<PrivateRoute roleOnly="requester"><UserDashboard view="requests" /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserDashboard view="profile" /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
    );
}
