import { useState } from 'react';
import { Package, Trash2, CreditCard as Edit2, Plus, Search, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { PantryCategory } from '../types';

export function PantryView() {
  const { pantryItems, updatePantryItem, deletePantryItem, addPantryItem } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PantryCategory | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const categories: (PantryCategory | 'all')[] = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'spices', 'meat', 'other'];

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<PantryCategory, typeof pantryItems>);

  const isLowStock = (item: typeof pantryItems[0]) => {
    return item.quantity <= item.lowStockThreshold;
  };

  const isExpiringSoon = (item: typeof pantryItems[0]) => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
  };

  const isExpired = (item: typeof pantryItems[0]) => {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Smart Pantry</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {showAddForm && <AddItemForm onClose={() => setShowAddForm(false)} />}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PantryCategory | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No items in pantry</p>
          <p className="text-sm text-gray-500 mt-1">Add items using voice input or the form above</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 capitalize">{category}</h3>
              <div className="grid gap-3">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all hover:shadow-md
                      ${isExpired(item) ? 'bg-red-50 border-red-300' :
                        isExpiringSoon(item) ? 'bg-yellow-50 border-yellow-300' :
                        isLowStock(item) ? 'bg-orange-50 border-orange-300' :
                        'bg-white border-gray-200'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-medium text-gray-800">{item.itemName}</h4>
                          {(isLowStock(item) || isExpiringSoon(item) || isExpired(item)) && (
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="font-semibold text-gray-700">
                            {item.quantity} {item.unit}
                          </span>
                          {item.expiryDate && (
                            <span className={`
                              ${isExpired(item) ? 'text-red-600' :
                                isExpiringSoon(item) ? 'text-yellow-700' :
                                'text-gray-600'}
                            `}>
                              Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {isLowStock(item) && !isExpired(item) && (
                          <p className="mt-2 text-sm text-orange-700">Low stock - consider restocking</p>
                        )}
                        {isExpired(item) && (
                          <p className="mt-2 text-sm text-red-700 font-medium">Item has expired</p>
                        )}
                        {isExpiringSoon(item) && !isExpired(item) && (
                          <p className="mt-2 text-sm text-yellow-700">Expiring soon - use soon!</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newQty = prompt(`Update quantity for ${item.itemName}:`, item.quantity.toString());
                            if (newQty) {
                              updatePantryItem(item.id, { quantity: parseFloat(newQty) });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deletePantryItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddItemForm({ onClose }: { onClose: () => void }) {
  const { addPantryItem } = useData();
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '0',
    unit: 'pieces',
    category: 'other' as PantryCategory,
    expiryDate: '',
    lowStockThreshold: '0',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPantryItem({
      itemName: formData.itemName,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      category: formData.category,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      lowStockThreshold: parseFloat(formData.lowStockThreshold),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border-2 border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Add Pantry Item</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
          <input
            type="text"
            required
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as PantryCategory })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
            <option value="dairy">Dairy</option>
            <option value="spices">Spices</option>
            <option value="meat">Meat</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
          <input
            type="number"
            step="0.1"
            required
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="kg, liter, pieces..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
          <input
            type="number"
            step="0.1"
            value={formData.lowStockThreshold}
            onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
        >
          Add Item
        </button>
      </div>
    </form>
  );
}
