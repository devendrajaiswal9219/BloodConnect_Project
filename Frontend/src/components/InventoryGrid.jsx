export default function InventoryGrid({ Inventory }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Inventory.map((item) => (
                <div
                    key={item.bloodGroup}
                    className={`card p-4 text-center ${item.lowStock? "border-crimson/40 bg-crimson/5": ""}`}>
                    <div className="font-display text-xl font-bold text-crimson">{item.bloodGroup}</div>
                    <div className="mt-1 text-2xl font-semibold">{item.unitsAvailable}</div>
                    <div className="text-xs text-ink/50">Units</div>
                    {item.lowStock && <div className="mt-1 text-[11px] font-semibold text-crimson">Low Stock</div>}
            </div>
            ))}
        </div>
    );
}