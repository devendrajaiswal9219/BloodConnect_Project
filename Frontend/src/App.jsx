import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Link,
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
function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) {
    return 'Could not connect to the server. Make sure the backend is running at localhost:5100.';
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
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>BloodConnect</span>
        </Link>
        <div className="auth-message">
          <p className="eyebrow">Every donation matters</p>
          <h1>Help make blood available when it matters most.</h1>
          <p>Connect donors, care teams, and blood-bank inventory in one place.</p>
          <div className="auth-highlight">
            <span className="highlight-icon" aria-hidden="true">♥</span>
            <span><strong>One community.</strong><br />A lifeline for every patient.</span>
          </div>
        </div>
        <p className="auth-footnote">A little of your time can mean everything to someone else.</p>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">{isRegister ? 'Join the community' : 'Welcome back'}</p>
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
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>BloodConnect</span>
        </Link>
        <div className="topbar-right">
          <span className="user-chip"><span className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</span><span className="user-name">{user?.name}</span></span>
          <button className="button button-quiet" onClick={handleLogout}>Sign out</button>
        </div>
      </header>
      <main className="page-content">{children}</main>
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
function Panel({ title, description, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
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
function UserDashboard() {

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
   
        return (
          <AppLayout>
      <PageHeading
        eyebrow={isDonor ? 'Donor dashboard' : 'Care team dashboard'}
        title={`Good to see you, ${user.name.split(' ')[0]}.`}
        description={isDonor ? 'Manage your donation schedule and see current blood availability.' : 'Submit and track blood requests for the people in your care.'}
      >
        <div className="profile-summary">
          <span className="summary-blood">{isDonor ? user.bloodGroup || '—' : '＋'}</span>
          <span><strong>{isDonor ? 'Your blood group' : 'Your organization'}</strong><small>{isDonor ? 'Donor profile' : user.organization || 'Care team'}</small></span>
        </div>
      </PageHeading>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {message && <p className="notice notice-success" role="status">{message}</p>}
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <Panel title={isDonor ? 'Schedule a donation' : 'Request blood'} description={isDonor ? 'Choose a convenient date and location.' : 'Share the details so our team can review your request.'}>
            <form className="form-grid" onSubmit={handleSubmit}>
              {isDonor ? (
                <>
                  <label className="field"><span>Donation date</span><input type="date" name="donationDate" min={dateMinimum} required /></label>
                  <label className="field"><span>Units</span><input type="number" name="units" min="1" max="5" defaultValue="1" required /></label>
                  <label className="field field-span"><span>Donation center or location</span><input name="location" maxLength={150} placeholder="e.g. City Blood Bank" /></label>
                </>
              ) : (
                <>
                  <label className="field"><span>Patient name</span><input name="patientName" required maxLength={120} /></label>
                  <label className="field"><span>Hospital or clinic</span><input name="hospitalName" required maxLength={150} /></label>
                  <label className="field"><span>Blood group</span><select name="bloodGroup" required defaultValue=""><option value="" disabled>Select group</option>{BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}</select></label>
                  <label className="field"><span>Units needed</span><input type="number" name="unitsRequested" min="1" max="20" defaultValue="1" required /></label>
                  <label className="field"><span>Urgency</span><select name="urgency" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
                  <label className="field"><span>Required by</span><input type="date" name="requiredBy" min={dateMinimum} /></label>
                  <label className="field field-span"><span>Additional details <small>(optional)</small></span><textarea name="reason" rows="3" maxLength={1000} placeholder="Anything our team should know?" /></label>
                </>
              )}
              <div className="field-span form-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Submitting…' : isDonor ? 'Schedule donation' : 'Submit request'}<span aria-hidden="true">→</span></button></div>
            </form>
          </Panel>
          <Panel title={isDonor ? 'Your donations' : 'Your requests'} description="Your recent activity and current status." className="activity-panel">
            {loading ? <Loading /> : items.length ? (
              <div className="table-scroll">
                <table>
                  <thead><tr>{isDonor ? <><th>Date</th><th>Location</th><th>Units</th><th>Status</th><th /></> : <><th>Request</th><th>Patient / hospital</th><th>Group</th><th>Units</th><th>Status</th></>}</tr></thead>
                  <tbody>{items.map((item) => (
                    <tr key={item._id}>
                      {isDonor ? (
                        <>
                          <td>{formatDate(item.donationDate || item.createdAt)}</td>
                          <td>{item.location || 'Main Blood Bank'}</td>
                          <td>{item.units ?? item.unitsDonated ?? 1}</td>
                          <td><StatusBadge status={item.status} /></td>
                          <td>{String(item.status).toLowerCase() === 'scheduled' && <button className="text-button" onClick={() => cancelDonation(item._id)}>Cancel</button>}</td>
                        </>
                      ) : (
                        <>
                          <td className="request-number">{item.requestNumber || item._id?.slice(-6)}</td>
                          <td><strong>{item.patientName}</strong><small className="table-subtext">{item.hospitalName}</small></td>
                          <td><span className="table-blood">{item.bloodGroup}</span></td>
                          <td>{item.unitsRequested}</td>
                          <td><StatusBadge status={item.status} /></td>
                        </>
                      )}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <EmptyState title={isDonor ? 'No donations yet' : 'No requests yet'} description={isDonor ? 'Your scheduled donations will show up here.' : 'Requests submitted by your team will show up here.'} />}
          </Panel>
        </div>
        <aside className="dashboard-aside">
          <Panel title="Blood availability" description="Current units available across the network.">
            {loading ? <Loading /> : <InventoryGrid items={inventory} />}
            <p className="panel-footnote"><span className="availability-dot" /> Availability updates as donations are processed.</p>
          </Panel>
          <div className="side-note">
            <span className="side-note-icon" aria-hidden="true">♥</span>
            <div><strong>{pendingCount} item{pendingCount === 1 ? '' : 's'} awaiting action</strong><p>{isDonor ? 'Your donation activity is always available here.' : 'Our team will review your request as soon as possible.'}</p></div>
          </div>
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
    return (
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
        </div>
          <div className="admin-grid">
        <Panel title="Blood inventory" description="Set the currently available units by blood group." className="inventory-panel">
          {loading ? <Loading /> : <InventoryGrid items={inventory} />}
          <form className="inventory-editor" onSubmit={updateInventory}>
            <label className="field"><span>Blood group</span><select name="bloodGroup" defaultValue="O+">{BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}</select></label>
            <label className="field"><span>Available units</span><input type="number" name="unitsAvailable" min="0" required /></label>
            <button className="button button-secondary" disabled={busyId === 'inventory'}>{busyId === 'inventory' ? 'Saving…' : 'Update stock'}</button>
          </form>
        </Panel>
        <Panel title="Requests to review" description="Review patient blood requests and update their status." className="admin-list-panel">
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
        <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
    );
}