import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newRequest, setNewRequest] = useState({ quantity: '', offeredPrice: '', message: '', requestType: 'IMMEDIATE', advancePaymentAmount: '' });

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedUser || loggedUser.role !== 'BUYER') {
      navigate('/login');
      return;
    }
    setUser(loggedUser);
    fetchData(loggedUser.id);
  }, [navigate]);

  const fetchData = async (buyerId) => {
    try {
      const prods = await request('/listings');
      setProducts(prods || []);
      const reqs = await request(`/requests/buyer/${buyerId}`);
      setRequests((reqs || []).filter(r => r.status !== 'ACCEPTED'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await request('/requests', {
        method: 'POST',
        body: JSON.stringify({
          listing: { id: selectedProduct.id },
          buyer: { id: user.id },
          quantity: newRequest.quantity,
          offeredPrice: newRequest.offeredPrice,
          message: newRequest.message,
          requestType: newRequest.requestType,
          advancePaymentAmount: newRequest.advancePaymentAmount ? parseFloat(newRequest.advancePaymentAmount) : null
        })
      });
      setShowRequestModal(false);
      setNewRequest({ quantity: '', offeredPrice: '', message: '', requestType: 'IMMEDIATE', advancePaymentAmount: '' });
      fetchData(user.id);
      alert('Purchase request sent successfully!');
    } catch (e) {
      alert('Failed to send request');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName && p.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory && p.status === 'AVAILABLE';
  });

  if (!user) return null;

  return (
    <div className="py-8 space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.name} 🛒</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Marketplace Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold text-gray-800">Marketplace</h3>
            <div className="flex gap-4 w-full md:w-auto">
              <select className="border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Dairy">Dairy</option>
                <option value="Other">Other</option>
              </select>
              <div className="relative flex-1 md:flex-none">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-2.5">🔍</span>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products available in the market.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-xl p-5 hover:border-green-400 transition-colors bg-gray-50 shadow-sm flex flex-col justify-between">
                  <div>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.productName} className="w-full h-40 object-cover rounded-lg mb-4 shadow-sm border border-gray-200" />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-4xl mb-4">🌱</div>
                    )}
                    <h4 className="text-xl font-bold text-gray-800">{p.productName}</h4>
                    <span className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs mt-1 mb-2">{p.category || 'Uncategorized'}</span>
                    <p className="text-sm text-gray-700 italic mb-2 line-clamp-2">{p.description || 'No description provided.'}</p>
                    <p className="text-gray-600 mt-1 text-sm">Farmer: <span className="font-medium">{p.farmer?.name}</span>
                      {p.farmer?.reviewCount > 0 && (
                        <span className="ml-2 text-yellow-600 font-bold">⭐ {p.farmer.averageRating} ({p.farmer.reviewCount})</span>
                      )}
                    </p>
                    <p className="text-gray-600 text-sm">Location: {p.location}</p>
                    {p.availableDate && <span className="mt-2 inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">PRE-BOOKING: Harvest on {p.availableDate}</span>}
                    <div className="mt-4 flex justify-between items-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">₹{p.expectedPrice} / {p.unit}</span>
                      <span className="text-gray-600 font-medium">{p.quantity} {p.unit} available</span>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button 
                      onClick={() => {
                        navigate('/messages', { state: { contact: p.farmer } });
                      }} 
                      className="flex-1 bg-white text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-300 flex items-center justify-center gap-1"
                    >
                      <span>💬</span> Message
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProduct(p);
                        setNewRequest({ 
                          quantity: p.quantity, 
                          offeredPrice: p.expectedPrice, 
                          message: '', 
                          requestType: p.availableDate ? 'PRE_BOOKING' : 'IMMEDIATE', 
                          advancePaymentAmount: '' 
                        });
                        setShowRequestModal(true);
                      }} 
                      className="flex-[2] bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Requests Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">My Requests</h3>
          {requests.length === 0 ? (
            <p className="text-gray-500">You haven't sent any requests yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map(r => (
                <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{r.listing?.productName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : r.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Farmer: {r.listing?.farmer?.name}</p>
                  <p className="text-sm text-gray-600">Requested: {r.quantity} {r.listing?.unit} at ₹{r.offeredPrice}/{r.listing?.unit}</p>
                  {r.requestType === 'PRE_BOOKING' && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold mr-2 mt-1 inline-block">PRE-BOOKING</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showRequestModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-2">Send Purchase Request</h3>
            <p className="text-gray-600 mb-6">For {selectedProduct.productName} by {selectedProduct.farmer?.name}</p>
            
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Request Type</label>
                <select className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={newRequest.requestType} onChange={e => setNewRequest({...newRequest, requestType: e.target.value})}>
                  <option value="IMMEDIATE">Immediate Purchase</option>
                  <option value="PRE_BOOKING">Pre-booking (Reserve)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Quantity you want ({selectedProduct.unit})</label>
                <input type="number" max={selectedProduct.quantity} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" value={newRequest.quantity} onChange={e => setNewRequest({...newRequest, quantity: e.target.value})} required />
                <p className="text-xs text-gray-500 mt-1">Max available: {selectedProduct.quantity}</p>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Your Offer Price (₹/{selectedProduct.unit})</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" value={newRequest.offeredPrice} onChange={e => setNewRequest({...newRequest, offeredPrice: e.target.value})} required />
                <p className="text-xs text-gray-500 mt-1">Farmer asking price: ₹{selectedProduct.expectedPrice}</p>
              </div>

              {newRequest.requestType === 'PRE_BOOKING' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Advance Payment Offer (₹) (Optional)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" value={newRequest.advancePaymentAmount} onChange={e => setNewRequest({...newRequest, advancePaymentAmount: e.target.value})} />
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-1">Message (Optional)</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" rows="2" value={newRequest.message} onChange={e => setNewRequest({...newRequest, message: e.target.value})} placeholder="e.g. Can you deliver tomorrow?"></textarea>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowRequestModal(false)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
