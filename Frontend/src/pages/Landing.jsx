import { Link } from 'react-router-dom';
import { StockGrid, useInventory } from './Inventory.jsx';
import { useAuth } from '../auth.jsx';

export default function Landing() {
  const { map } = useInventory();
  const { user } = useAuth();
  return (
    <section className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-5xl font-extrabold leading-tight">One donation can reach three patients.</h1>
        <p className="mt-4 max-w-md text-lg text-saline">Register as a donor, request blood for a patient, and see what the blood bank has right now.</p>
        <div className="mt-6 flex gap-3">
          {user ? <Link to="/requests" className="btn">Request blood</Link> : <Link to="/register" className="btn">Become a donor</Link>}
          <Link to="/inventory" className="btn-ghost">View blood stock</Link>
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">Available now</h2>
        <StockGrid map={map} />
      </div>
    </section>
  );
}
