export default function InventoryGrid({ items = [] }) {
    const inventoryByGroup = new Map(items.map((item) => [item.bloodGroup, item]));
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return (
         <div className="inventory-grid">
            {bloodGroups.map((bloodGroup) => {
                const item = inventoryByGroup.get(bloodGroup);
                const outOfStock = item && Number(item.unitsAvailable) === 0;
                return (
                <div
                    key={bloodGroup}
                    className={`inventory-card ${item?.lowStock ? "low-stock" : ""} ${outOfStock ? "out-of-stock" : ""}`}>
                    <span className="inventory-group">{bloodGroup}</span>
                    <span className="inventory-amount">{item ? item.unitsAvailable : '—'}<small>Units available</small><span className={`inventory-status ${!item ? 'status-unknown' : outOfStock ? 'status-empty' : item.lowStock ? 'status-limited' : 'status-ready'}`}>{!item ? 'Not reported' : outOfStock ? 'Out of stock' : item.lowStock ? 'Limited' : 'Available'}</span></span>
                </div>
                );
            })}
        </div>
    );
}
