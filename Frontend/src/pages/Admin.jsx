import { useEffect, useState } from 'react';
import { api, EP, toList } from '../api.js';
import { Badge } from './Requests.jsx';
import { StockGrid, useInventory } from './Inventory.jsx';
export default function Admin() {
  const [stats, setStats] = useState({});
  const [reqs, setReqs] = useState([]);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const { map } = useInventory();
  const load = () => {
    api(EP.stats)
      .then((d) => setStats(d.data || d))
      .catch((e) => {
        setMsg(e.message);
        setIsError(true);
      });
    api(EP.requests)
      .then((d) => setReqs(toList(d)))
      .catch((e) => {
        setMsg(e.message);
        setIsError(true);
      });
  };
  useEffect(load, []);
  const setStatus = async (id, status) => {
    setMsg('');
    setIsError(false);
    try {
      await api(EP.requestReview(id), { method: 'PATCH', body: { status } });
      setMsg(`Request marked as ${status}.`);
      load();
    } catch (e) {
      setMsg(e.message);
      setIsError(true);
    }
  };

    const statCards = [
    { label: 'Donors Registered', value: stats.donorCount ?? 0 },
    { label: 'Requesters Registered', value: stats.requesterCount ?? 0 },
    { label: 'Total Units in Stock', value: stats.totalUnitsAvailable ?? 0 },
    { label: 'Pending Requests', value: stats.requestsByStatus?.pending ?? 0 },
  ];

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      {msg && <p className={`font-medium ${isError ? 'text-blood' : 'text-green-700'}`}>{msg}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="panel">
            <div className="text-3xl font-extrabold text-blood">{card.value}</div>
            <div className="mt-1 text-sm text-saline">{card.label}</div>
          </div>
        ))}
      </div>

       <div>
        <h2 className="mb-3 text-xl font-semibold">Current Stock</h2>
        <StockGrid map={map} />
      </div>
      <div className="panel overflow-x-auto">
        <h2 className="mb-3 text-xl font-semibold">All Blood Requests</h2>
        <table className="w-full text-left">
          <thead className="text-sm text-saline">
            <tr>
              <th className="py-2">Patient</th>
              <th>Group</th>
              <th>Units</th>
              <th>Hospital</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map((r, i) => (
              <tr key={r._id || i} className="border-t border-saline/20">
                <td className="py-2 font-medium">{r.patientName}</td>
                <td className="font-bold text-blood">{r.bloodGroup}</td>
                <td>{r.unitsRequested || r.units}</td>
                <td>{r.hospitalName || r.hospital}</td>
                <td className="capitalize">{r.urgency}</td>
                <td><Badge status={r.status} /></td>
                <td className="space-x-2 py-2">
                  {r.status === 'pending' && (
                    <>
                      <button className="btn-ghost !py-1 text-xs" onClick={() => setStatus(r._id, 'approved')}>
                        Approve
                      </button>
                      <button className="btn-ghost !py-1 text-xs text-blood" onClick={() => setStatus(r._id, 'rejected')}>
                        Reject
                      </button>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <button className="btn !py-1 text-xs" onClick={() => setStatus(r._id, 'fulfilled')}>
                      Fulfill
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reqs.length === 0 && <p className="py-3 text-saline">No requests to review.</p>}
      </div>
    </section>
  );
}