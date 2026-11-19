export default function InventoryGrid({ items = [] }) {
    if (!items.length) {
        return <p className="muted">Inventory data is not available yet.</p>;
    }
    return (
         <div className="inventory-grid">
            {items.map((item) => (
                <div
                    key={item.bloodGroup}
                    className={`inventory-card ${item.lowStock ? "low-stock" : ""}`}>
                    <span className="inventory-group">{item.bloodGroup}</span>
                    <span className="inventory-amount">{item.unitsAvailable}<small>Units</small>{item.lowStock && <span className="low-stock-label">Low stock</span>}</span>
            </div>
            ))}
        </div>
    );
}
