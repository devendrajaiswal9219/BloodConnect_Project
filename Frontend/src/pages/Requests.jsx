import { useEffect, useState } from 'react';
import { api, EP, toList, BLOOD_GROUPS } from '../api.js';
import { useAuth } from '../auth.jsx';

export const Badge = ({ status = 'pending' }) => {
  const s = String(status).toLowerCase();
  const cls = s === 'approved' || s === 'fulfilled'
    ? 'bg-green-100 text-green-800'
    : s === 'rejected'
      ? 'bg-rose text-blood'
      : 'bg-amber-100 text-amber-800';
  return <span className={`rounded px-2 py-0.5 text-sm font-semibold capitalize ${cls}`}>{status}</span>;
};

export default function Requests() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [f, setF] = useState({
    patientName: '',
    bloodGroup: 'O+',
    units: 1,
    hospital: '',
    city: '',
    urgency: 'medium',
    reason: ''
  });

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = () => {
    const endpoint = user?.role === 'admin' ? EP.requests : EP.myRequests;
    api(endpoint)
      .then((d) => setList(toList(d)))
      .catch((e) => {
        setMsg(e.message);
        setIsError(true);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    try {
      await api(EP.requests, {
        method: 'POST',
        body: {
          patientName: f.patientName,
          bloodGroup: f.bloodGroup,
          unitsRequested: Number(f.units),
          hospitalName: f.city ? `${f.hospital} (${f.city})` : f.hospital,
          urgency: f.urgency,
          reason: f.reason
        }
      });
      setMsg('Blood request submitted successfully.');
      setF({ patientName: '', bloodGroup: 'O+', units: 1, hospital: '', city: '', urgency: 'medium', reason: '' });
      load();
    } catch (err) {
      setMsg(err.message);
      setIsError(true);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="panel space-y-4 self-start">
        <h1 className="text-2xl font-bold">Request blood</h1>
        <div>
          <label className="label">Patient name</label>
          <input className="input" required value={f.patientName} onChange={set('patientName')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Blood group</label>
            <select className="input" value={f.bloodGroup} onChange={set('bloodGroup')}>
              {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Units needed</label>
            <input className="input" type="number" min="1" max="20" value={f.units} onChange={set('units')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Hospital / Clinic</label>
            <input className="input" required value={f.hospital} onChange={set('hospital')} placeholder="Hospital name" />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={f.city} onChange={set('city')} placeholder="City name" />
          </div>
        </div>
        <div>
          <label className="label">Urgency</label>
          <select className="input" value={f.urgency} onChange={set('urgency')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High (Urgent)</option>
            <option value="critical">Critical (Emergency)</option>
          </select>
        </div>
        <button className="btn">Send request</button>
        {msg && <p className={`text-sm ${isError ? 'text-blood' : 'text-green-700'}`}>{msg}</p>}
      </form>

      <div className="panel">
        <h2 className="mb-3 text-xl font-semibold">Your requests</h2>
        {list.length === 0 ? (
          <p className="text-saline">No requests yet.</p>
        ) : (
          <ul className="divide-y divide-saline/20">
            {list.map((r, i) => (
              <li key={r._id || i} className="flex items-center justify-between gap-2 py-3">
                <div>
                  <div className="font-semibold">
                    {r.patientName} <span className="text-blood font-bold">({r.bloodGroup})</span>
                  </div>
                  <div className="text-sm text-saline">
                    {r.unitsRequested || r.units} unit(s) · {r.hospitalName || r.hospital}
                  </div>
                  <div className="text-xs text-saline capitalize">Urgency: {r.urgency}</div>
                </div>
                <Badge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
