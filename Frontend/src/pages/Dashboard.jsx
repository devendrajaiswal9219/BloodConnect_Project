import { useEffect, useState } from 'react';
import { api, EP, toList, BLOOD_GROUPS } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState({
    bloodGroup: user?.bloodGroup || 'O+',
    units: 1,
    date: new Date().toISOString().slice(0, 10)
  });
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const load = () => {
    const endpoint = user?.role === 'admin' ? EP.donations : EP.myDonations;
    api(endpoint)
      .then((d) => setDonations(toList(d)))
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
      await api(EP.donations, {
        method: 'POST',
        body: {
          bloodGroup: form.bloodGroup,
          units: Number(form.units),
          donationDate: form.date,
          date: form.date
        }
      });
      setMsg('Donation scheduled successfully.');
      load();
    } catch (err) {
      setMsg(err.message);
      setIsError(true);
    }
  };

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome, {user?.name || 'User'}</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="panel space-y-4">
          <h2 className="text-xl font-semibold">Record / Schedule a donation</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Blood group</label>
              <select className="input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Units</label>
              <input className="input" type="number" min="1" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} />
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <button className="btn">Save donation</button>
          {msg && <p className={`text-sm ${isError ? 'text-blood' : 'text-green-700'}`}>{msg}</p>}
        </form>

        <div className="panel">
          <h2 className="mb-3 text-xl font-semibold">Your donations</h2>
          {donations.length === 0 ? (
            <p className="text-saline">No donations recorded yet. Schedule your first one on the left.</p>
          ) : (
            <ul className="divide-y divide-saline/20">
              {donations.map((d, i) => (
                <li key={d._id || i} className="flex justify-between py-2">
                  <span className="font-semibold text-blood">{d.bloodGroup}</span>
                  <span>{d.units || d.unitsDonated || 1} unit(s)</span>
                  <span className="capitalize font-medium text-sm text-saline">{d.status}</span>
                  <span className="text-saline">{new Date(d.donationDate || d.date || d.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
