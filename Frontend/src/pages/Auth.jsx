import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { BLOOD_GROUPS } from '../api.js';
function Shell({ title, children, footer }) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="panel">{children}</div>
      <p className="mt-4 text-sm text-saline">{footer}</p>
    </div>
  );
}

const Field = ({ label, ...p }) => (
  <div><label className="label">{label}</label><input className="input" {...p} /></div>
);
function useForm(initial, submit) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await submit(f);
      nav('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return { f, set, onSubmit, error, busy };
}

export function Login() {
  const { login } = useAuth();
  const { f, set, onSubmit, error, busy } = useForm({ email: '', password: '' }, login);
  return (
    <Shell title="Log in" footer={<>New here? <Link className="text-blood underline" to="/register">Create an account</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" type="email" required value={f.email} onChange={set('email')} />
        <Field label="Password" type="password" required value={f.password} onChange={set('password')} />
        {error && <p className="text-sm text-blood">{error}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
    </Shell>
  );
}

export function Register() {
  const { register } = useAuth();
  const { f, set, onSubmit, error, busy } = useForm(
    { name: '', email: '', password: '', phone: '', city: '', bloodGroup: 'O+', role: 'donor', organization: '' },
    (formData) => register({ ...formData, address: formData.city })
  );

  return (
    <Shell title="Create your account" footer={<>Already registered? <Link className="text-blood underline" to="/login">Log in</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" required value={f.name} onChange={set('name')} />
        <Field label="Email" type="email" required value={f.email} onChange={set('email')} />
        <Field label="Password" type="password" minLength={6} required value={f.password} onChange={set('password')} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" value={f.phone} onChange={set('phone')} />
          <Field label="City / Address" value={f.city} onChange={set('city')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Blood group</label>
            <select className="input" value={f.bloodGroup} onChange={set('bloodGroup')}>
              {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">I want to</label>
            <select className="input" value={f.role} onChange={set('role')}>
              <option value="donor">Donate blood</option>
              <option value="requester">Request blood</option>
            </select>
          </div>
        </div>
        {f.role === 'requester' && (
          <Field label="Hospital / Organization name" value={f.organization} onChange={set('organization')} placeholder="e.g. City Hospital or Individual" />
        )}
        {error && <p className="text-sm text-blood">{error}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
    </Shell>
  );
}