import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ productName: '', quantity: '', unit: 'KG', expectedPrice: '', location: '', availableDate: '', category: 'Vegetables', imageUrl: '', description: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedUser || loggedUser.role !== 'FARMER') {
      navigate('/login');
      return;
    }
    setUser(loggedUser);
    fetchData(loggedUser.id);
  }, [navigate]);

  const fetchData = async (farmerId) => {
    try {
      const prods = await request(`/listings/farmer/${farmerId}`);
      setProducts(prods || []);
      const reqs = await request(`/requests/farmer/${farmerId}`);
      setRequests((reqs || []).filter(r => r.status !== 'ACCEPTED'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProduct,
        quantity: parseFloat(newProduct.quantity),
        expectedPrice: parseFloat(newProduct.expectedPrice),
        availableDate: newProduct.availableDate === '' ? null : newProduct.availableDate,
        farmer: user.id
      };
      await request(`/listings`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setShowAddModal(false);
      setNewProduct({ productName: '', quantity: '', unit: 'KG', expectedPrice: '', location: user.location, availableDate: '', category: 'Vegetables', imageUrl: '', description: '' });
      fetchData(user.id);
    } catch (e) {
      console.error(e);
      alert('Failed to add product: ' + e.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await request(`/listings/${id}`, { method: 'DELETE' });
      fetchData(user.id);
    } catch (e) {
      console.error(e);
      alert('Failed to delete product: ' + e.message);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productName: editingProduct.productName,
        quantity: parseFloat(editingProduct.quantity),
        unit: editingProduct.unit,
        expectedPrice: parseFloat(editingProduct.expectedPrice),
        category: editingProduct.category,
        imageUrl: editingProduct.imageUrl,
        description: editingProduct.description,
        availableDate: editingProduct.availableDate === '' ? null : editingProduct.availableDate,
        status: editingProduct.status,
        location: editingProduct.location
      };
      await request(`/listings/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setShowEditModal(false);
      setEditingProduct(null);
      fetchData(user.id);
    } catch (e) {
      console.error(e);
      alert('Failed to edit product: ' + e.message);
    }
  };

  const handleRequestStatus = async (reqId, action) => {
    try {
      await request(`/requests/${reqId}/${action}`, { method: 'PUT' });
      fetchData(user.id);
    } catch (e) {
      alert('Failed to update request');
    }
  };

  if (!user) return null;

  return (
    <div className="py-8 space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.name} 👨‍🌾</h2>
        <button onClick={() => {
           setNewProduct({...newProduct, location: user.location});
           setShowAddModal(true);
        }} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-green-700 transition-colors">
          + Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">My Products</h3>
          {products.length === 0 ? (
            <p className="text-gray-500">No products added yet.</p>
          ) : (
            <div className="space-y-4">
              {products.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-4">
                  <div className="flex items-start gap-4">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.productName} className="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">🌱</div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{p.productName} <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded ml-2">{p.category || 'Uncategorized'}</span></h4>
                      <p className="text-gray-600">{p.quantity} {p.unit} • ₹{p.expectedPrice}/{p.unit}</p>
                      {p.availableDate && <p className="text-blue-600 font-medium text-sm">Harvest Date: {p.availableDate}</p>}
                      <p className="text-sm text-gray-500 mt-1">Status: <span className="font-semibold text-green-600">{p.status}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button onClick={() => { setEditingProduct(p); setShowEditModal(true); }} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors flex-1 md:flex-none">Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors flex-1 md:flex-none">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Buyer Requests</h3>
          {requests.length === 0 ? (
            <p className="text-gray-500">No requests yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map(r => (
                <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{r.buyer.name}</h4>
                      <p className="text-gray-600">Wants: {r.listing.productName}</p>
                      <p className="text-gray-600">Qty: {r.quantity} {r.listing.unit} at ₹{r.offeredPrice}/{r.listing.unit}</p>
                      {r.requestType === 'PRE_BOOKING' && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold mr-2 mt-1 inline-block">PRE-BOOKING</span>
                      )}
                      {r.advancePaymentAmount > 0 && (
                        <p className="text-sm text-green-700 mt-1 font-semibold">Advance Payment: ₹{r.advancePaymentAmount}</p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : r.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.status}
                      </span>
                      <button 
                        onClick={() => navigate('/messages', { state: { contact: r.buyer } })}
                        className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm"
                      >
                        <span>💬</span> Message
                      </button>
                    </div>
                  </div>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRequestStatus(r.id, 'accept')} className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors">Accept</button>
                      <button onClick={() => handleRequestStatus(r.id, 'reject')} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Product Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-3" value={newProduct.productName} onChange={e => setNewProduct({...newProduct, productName: e.target.value})} required />
              </div>
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <label className="block text-gray-700 font-medium mb-1">Quantity</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-3" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} required />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Unit</label>
                  <select className="w-full border border-gray-300 rounded-lg p-3 bg-white" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                    <option>KG</option>
                    <option>TON</option>
                    <option>PIECE</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Expected Price (₹)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-3" value={newProduct.expectedPrice} onChange={e => setNewProduct({...newProduct, expectedPrice: e.target.value})} required />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Category</label>
                  <select className="w-full border border-gray-300 rounded-lg p-3 bg-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Grains</option>
                    <option>Dairy</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Image URL (Optional)</label>
                <input type="text" placeholder="https://..." className="w-full border border-gray-300 rounded-lg p-3" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-3" rows="2" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Harvest / Available Date (Optional)</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg p-3" value={newProduct.availableDate} onChange={e => setNewProduct({...newProduct, availableDate: e.target.value})} />
                <p className="text-xs text-gray-500 mt-1">Leave empty if available immediately.</p>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Edit Product</h3>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Product Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-3" value={editingProduct.productName} onChange={e => setEditingProduct({...editingProduct, productName: e.target.value})} required />
              </div>
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <label className="block text-gray-700 font-medium mb-1">Quantity</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-3" value={editingProduct.quantity} onChange={e => setEditingProduct({...editingProduct, quantity: e.target.value})} required />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Unit</label>
                  <select className="w-full border border-gray-300 rounded-lg p-3 bg-white" value={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})}>
                    <option>KG</option>
                    <option>TON</option>
                    <option>PIECE</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Expected Price (₹)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-3" value={editingProduct.expectedPrice} onChange={e => setEditingProduct({...editingProduct, expectedPrice: e.target.value})} required />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Category</label>
                  <select className="w-full border border-gray-300 rounded-lg p-3 bg-white" value={editingProduct.category || 'Vegetables'} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Grains</option>
                    <option>Dairy</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Image URL (Optional)</label>
                <input type="text" placeholder="https://..." className="w-full border border-gray-300 rounded-lg p-3" value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-3" rows="2" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Harvest / Available Date (Optional)</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg p-3" value={editingProduct.availableDate || ''} onChange={e => setEditingProduct({...editingProduct, availableDate: e.target.value})} />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
