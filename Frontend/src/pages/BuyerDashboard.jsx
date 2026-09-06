import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { Card, CardBody, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Search, Store, Sprout, Star, MapPin, MessageCircle, FileText, Package, IndianRupee, SlidersHorizontal } from 'lucide-react';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newRequest, setNewRequest] = useState({ quantity: '', offeredPrice: '', message: '', requestType: 'IMMEDIATE', advancePaymentAmount: '' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (dbUser) {
      if (dbUser.role !== 'BUYER') {
        navigate('/login');
      } else {
        setUser(dbUser);
        fetchRequests(dbUser.id);
      }
    }
  }, [dbUser, navigate]);

  useEffect(() => {
    if (user) {
      // Debounce the fetch slightly to avoid spamming the server on every keystroke
      const timer = setTimeout(() => {
        fetchProducts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, searchTerm, filterCategory, page, minPrice, maxPrice, locationFilter]);

  const fetchProducts = async () => {
    try {
      let url = `/listings?page=${page}&limit=10`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (filterCategory !== 'All') url += `&category=${encodeURIComponent(filterCategory)}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (locationFilter) url += `&location=${encodeURIComponent(locationFilter)}`;
      
      const response = await request(url);
      setProducts(response.listings || []);
      setTotalPages(response.totalPages || 1);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRequests = async (buyerId) => {
    try {
      const reqs = await request(`/requests/buyer/${buyerId}`);
      setRequests((reqs || []).filter(r => r.status !== 'ACCEPTED'));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = (buyerId) => {
    fetchProducts();
    fetchRequests(buyerId);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Products are already filtered from the server
  const filteredProducts = products;

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
            Welcome, {user.name} 
            <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </h2>
          <p className="text-gray-500 mt-1">Browse the marketplace and manage your purchase requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Marketplace Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 md:mb-6 gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Marketplace</h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <select className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 font-medium text-gray-700" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                    <option value="All">All Categories</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="relative flex-1 sm:flex-none">
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64 transition-all"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                    <Search className="absolute left-4 top-2.5 opacity-50 w-5 h-5 text-gray-500" />
                  </div>
                  <Button 
                    variant={showFilters ? 'primary' : 'outline'}
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-5 h-5" /> Filters
                  </Button>
                </div>
              </div>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 animate-fadeIn grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Min Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 100" 
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5000" 
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
                    <input 
                      type="text" 
                      placeholder="City or District..." 
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={locationFilter}
                      onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                    />
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Store className="w-12 h-12 mx-auto text-blue-300 mb-3 block" />
                  <p className="text-gray-500 font-medium">No products available in the market.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="border border-gray-100 rounded-2xl p-5 hover:border-green-200 transition-all bg-white shadow-sm hover:shadow-md flex flex-col justify-between group">
                      <div>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.productName} className="w-full h-48 object-cover rounded-xl mb-4 shadow-sm border border-gray-100" />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center text-5xl mb-4 text-green-600 font-bold border border-green-100">
                            {p.productName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <h4 className="text-xl font-bold text-gray-900">{p.productName}</h4>
                        <span className="inline-block bg-green-100 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-xs mt-1.5 mb-3">{p.category || 'Uncategorized'}</span>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description || 'No description provided.'}</p>
                        
                        <div className="bg-gray-50 p-3 rounded-xl mb-4 space-y-2">
                          <p className="text-gray-700 text-sm flex items-center gap-2">
                            <Sprout className="w-4 h-4 opacity-60" /> <span className="font-semibold">{p.farmer?.name}</span>
                            {p.farmer?.reviewCount > 0 && (
                              <span className="text-amber-500 font-bold ml-auto text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500" /> {p.farmer.averageRating}</span>
                            )}
                          </p>
                          <p className="text-gray-700 text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 opacity-60" /> {p.location}
                          </p>
                        </div>

                        {p.availableDate && <span className="mb-4 inline-block bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg text-xs font-bold">PRE-BOOKING: Harvest {p.availableDate}</span>}
                        
                        <div className="flex justify-between items-center bg-green-50/50 p-3 rounded-xl border border-green-100">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium">Price</span>
                            <span className="text-green-700 font-bold text-lg">₹{p.expectedPrice}<span className="text-sm font-medium text-gray-500">/{p.unit}</span></span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-xs text-gray-500 font-medium">Available</span>
                            <span className="text-gray-700 font-bold">{p.quantity} {p.unit}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-5 flex gap-2 w-full">
                        <Button 
                          variant="outline" 
                          className="flex-[1] px-2"
                          onClick={() => { navigate('/messages', { state: { contact: p.farmer } }); }}
                        >
                          <MessageCircle className="w-5 h-5 mx-auto" />
                        </Button>
                        <Button 
                          className="flex-[3]"
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
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-semibold text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* My Requests Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardBody>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">My Requests</h3>
              {requests.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <FileText className="w-10 h-10 mx-auto text-blue-300 mb-2 block" />
                  <p className="text-gray-500 font-medium text-sm">You haven't sent any requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {requests.map(r => (
                    <div key={r.id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900 truncate pr-2">{r.listing?.productName}</h4>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold shrink-0 ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : r.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 mb-3">
                        <p className="text-sm text-gray-600 flex items-center gap-2"><Sprout className="w-4 h-4 opacity-50" /> {r.listing?.farmer?.name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Package className="w-4 h-4 opacity-50" /> {r.quantity} {r.listing?.unit}
                        </p>
                        <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 opacity-50" /> ₹{r.offeredPrice}/{r.listing?.unit}
                        </p>
                      </div>

                      {r.requestType === 'PRE_BOOKING' && (
                        <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-medium">
                          <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">Pre-Booking</span>
                          {r.advancePaymentAmount > 0 && <span>Advance: ₹{r.advancePaymentAmount}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {showRequestModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Send Request</h3>
            <p className="text-gray-500 mb-6 font-medium">For <span className="text-gray-900 font-bold">{selectedProduct.productName}</span> by {selectedProduct.farmer?.name}</p>
            
            <form onSubmit={handleSendRequest} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Request Type</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={newRequest.requestType} onChange={e => setNewRequest({...newRequest, requestType: e.target.value})}>
                  <option value="IMMEDIATE">Immediate Purchase</option>
                  <option value="PRE_BOOKING">Pre-booking (Reserve)</option>
                </select>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label={`Quantity (${selectedProduct.unit})`}
                    id="reqQty"
                    type="number"
                    max={selectedProduct.quantity}
                    value={newRequest.quantity}
                    onChange={e => setNewRequest({...newRequest, quantity: e.target.value})}
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Max available: {selectedProduct.quantity}</p>
                </div>
                
                <div className="flex-1">
                  <Input
                    label={`Offer (₹/${selectedProduct.unit})`}
                    id="reqOffer"
                    type="number"
                    value={newRequest.offeredPrice}
                    onChange={e => setNewRequest({...newRequest, offeredPrice: e.target.value})}
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Asking price: ₹{selectedProduct.expectedPrice}</p>
                </div>
              </div>

              {newRequest.requestType === 'PRE_BOOKING' && (
                <Input
                  label="Advance Payment Offer (₹) (Optional)"
                  id="reqAdv"
                  type="number"
                  value={newRequest.advancePaymentAmount}
                  onChange={e => setNewRequest({...newRequest, advancePaymentAmount: e.target.value})}
                />
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message (Optional)</label>
                <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" rows="3" value={newRequest.message} onChange={e => setNewRequest({...newRequest, message: e.target.value})} placeholder="e.g. Can you deliver tomorrow?"></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" isLoading={loading}>Send Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
