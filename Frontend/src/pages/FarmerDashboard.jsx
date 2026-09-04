import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { Card, CardBody, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ productName: '', quantity: '', unit: 'KG', expectedPrice: '', location: '', availableDate: '', category: 'Vegetables', imageUrl: '', description: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {user.name} <span className="text-2xl">👨‍🌾</span></h2>
          <p className="text-gray-500 mt-1">Manage your agricultural produce and buyer requests</p>
        </div>
        <Button onClick={() => {
           setNewProduct({...newProduct, location: user.location});
           setShowAddModal(true);
        }}>
          + Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card>
          <CardBody>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">My Products</h3>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <span className="text-4xl mb-3 block">🌾</span>
                <p className="text-gray-500 font-medium">No products added yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map(p => (
                  <div key={p.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:border-green-200 hover:shadow-md transition-all gap-4 group">
                    <div className="flex items-start gap-4">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.productName} className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-100" />
                      ) : (
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                          {p.productName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          {p.productName} 
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">{p.category || 'Uncategorized'}</span>
                        </h4>
                        <p className="text-gray-600 mt-1 font-medium">{p.quantity} {p.unit} <span className="text-gray-300 mx-1">•</span> ₹{p.expectedPrice}/{p.unit}</p>
                        {p.availableDate && <p className="text-emerald-600 font-semibold text-xs mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">Harvest: {p.availableDate}</p>}
                        <div className="mt-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${p.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" onClick={() => { setEditingProduct(p); setShowEditModal(true); }} className="flex-1 sm:flex-none">Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(p.id)} className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Buyer Requests</h3>
            {requests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <span className="text-4xl mb-3 block">📫</span>
                <p className="text-gray-500 font-medium">No requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(r => (
                  <div key={r.id} className="border border-gray-100 rounded-2xl p-5 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{r.buyer.name}</h4>
                        <p className="text-gray-600 mt-1 font-medium">Requested: <span className="text-gray-900">{r.listing.productName}</span></p>
                        <p className="text-gray-600 font-medium">Quantity: {r.quantity} {r.listing.unit} <span className="text-gray-300 mx-1">•</span> Offer: <span className="text-green-700 font-bold">₹{r.offeredPrice}/{r.listing.unit}</span></p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {r.requestType === 'PRE_BOOKING' && (
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">PRE-BOOKING</span>
                          )}
                          {r.advancePaymentAmount > 0 && (
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">Advance: ₹{r.advancePaymentAmount}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : r.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.status}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/messages', { state: { contact: r.buyer } })}
                          className="flex items-center gap-1.5"
                        >
                          <span>💬</span> Message
                        </Button>
                      </div>
                    </div>
                    {r.status === 'PENDING' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-50">
                        <Button className="flex-1" onClick={() => handleRequestStatus(r.id, 'accept')}>Accept Offer</Button>
                        <Button variant="danger" className="flex-1" onClick={() => handleRequestStatus(r.id, 'reject')}>Decline</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-5">
              <Input
                label="Product Name"
                id="productName"
                value={newProduct.productName}
                onChange={e => setNewProduct({...newProduct, productName: e.target.value})}
                required
              />
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <Input
                    label="Quantity"
                    id="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={e => setNewProduct({...newProduct, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                    <option>KG</option>
                    <option>TON</option>
                    <option>PIECE</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label="Expected Price (₹)"
                    id="expectedPrice"
                    type="number"
                    value={newProduct.expectedPrice}
                    onChange={e => setNewProduct({...newProduct, expectedPrice: e.target.value})}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Grains</option>
                    <option>Dairy</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <Input
                label="Image URL (Optional)"
                id="imageUrl"
                placeholder="https://..."
                value={newProduct.imageUrl}
                onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" rows="2" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
              </div>
              <div>
                <Input
                  label="Harvest / Available Date (Optional)"
                  id="availableDate"
                  type="date"
                  value={newProduct.availableDate}
                  onChange={e => setNewProduct({...newProduct, availableDate: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1.5 font-medium">Leave empty if available immediately.</p>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={loading}>Save Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Edit Product</h3>
            <form onSubmit={handleEditProduct} className="space-y-5">
              <Input
                label="Product Name"
                id="editProductName"
                value={editingProduct.productName}
                onChange={e => setEditingProduct({...editingProduct, productName: e.target.value})}
                required
              />
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <Input
                    label="Quantity"
                    id="editQuantity"
                    type="number"
                    value={editingProduct.quantity}
                    onChange={e => setEditingProduct({...editingProduct, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" value={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})}>
                    <option>KG</option>
                    <option>TON</option>
                    <option>PIECE</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label="Expected Price (₹)"
                    id="editExpectedPrice"
                    type="number"
                    value={editingProduct.expectedPrice}
                    onChange={e => setEditingProduct({...editingProduct, expectedPrice: e.target.value})}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" value={editingProduct.category || 'Vegetables'} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Grains</option>
                    <option>Dairy</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <Input
                label="Image URL (Optional)"
                id="editImageUrl"
                value={editingProduct.imageUrl || ''}
                onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" rows="2" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}></textarea>
              </div>
              <Input
                label="Harvest / Available Date (Optional)"
                id="editAvailableDate"
                type="date"
                value={editingProduct.availableDate || ''}
                onChange={e => setEditingProduct({...editingProduct, availableDate: e.target.value})}
              />
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={loading}>Update Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
