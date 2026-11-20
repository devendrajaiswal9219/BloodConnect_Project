import { useEffect, useState } from 'react';
import { api, EP, toList, BLOOD_GROUPS } from '../api.js';

export function useInventory() {
  const [map, setMap] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(EP.inventory)
      .then((d) => {
        const m = {};
        toList(d).forEach((i) => {
          const group = i.bloodGroup || i.group;
          const units = i.unitsAvailable !== undefined ? i.unitsAvailable : (i.units ?? i.quantity ?? 0);
          if (group) m[group] = units;
        });
        setMap(m);
      })
      .catch((e) => setError(e.message));
  }, []);

  return { map, error };
}

export function StockGrid({ map }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BLOOD_GROUPS.map((g) => {
        const units = map?.[g];
        const low = units !== undefined && units < 10;
        return (
          <div key={g} className={`rounded-lg border p-4 ${low ? 'border-blood bg-rose' : 'border-saline/20 bg-white'}`}>
            <div className="font-display text-3xl font-extrabold text-blood">{g}</div>
            <div className="mt-1 text-sm text-saline">{units === undefined ? 'Loading…' : `${units} units`}</div>
            {low && <div className="mt-1 text-sm font-semibold text-blood">Low stock</div>}
          </div>
        );
      })}
    </div>
  );
}

export default function Inventory() {
  const { map, error } = useInventory();
  return (
    <section>
      <h1 className="mb-1 text-3xl font-bold">Blood stock</h1>
      <p className="mb-6 text-saline">Units currently available by blood group. Groups under 10 units are marked as low stock.</p>
      {error && <p className="mb-4 text-blood">Could not load stock: {error}</p>}
      <StockGrid map={map} />
    </section>
  );
}
