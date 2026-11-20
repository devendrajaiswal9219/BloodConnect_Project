import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const rows = [
    ['Name', user?.name],
    ['Email', user?.email],
    ['Phone', user?.phone],
    ['City / Address', user?.address || user?.city],
    ['Blood group', user?.bloodGroup],
    ['Role', user?.role],
    ['Organization', user?.organization]
  ];

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>
      <dl className="panel space-y-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-saline">{k}</dt>
            <dd className="font-semibold">{v || '—'}</dd>
          </div>
        ))}
      </dl>
      <button className="btn-ghost mt-6" onClick={() => { logout(); nav('/'); }}>
        Log out
      </button>
    </section>
  );
}
