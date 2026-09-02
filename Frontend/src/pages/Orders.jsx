import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function Orders() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    setUser(loggedUser);
    fetchOrders(loggedUser.id);
  }, [navigate]);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const data = await request(`/orders/user/${userId}`);
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await request(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders(user.id);
    } catch (e) {
      alert('Failed to update order status');
    }
  };

  const handleSubmitReview = async () => {
    try {
      await request('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          farmerId: selectedOrderForReview.farmer.id,
          buyerId: user.id,
          orderId: selectedOrderForReview.id,
          rating,
          comment: reviewComment
        })
      });
      alert('Review submitted successfully!');
      setReviewModalOpen(false);
      setSelectedOrderForReview(null);
      setReviewComment('');
    } catch (e) {
      alert('Failed to submit review. You may have already reviewed this order.');
    }
  };

  if (!user) return null;

  const isBuyer = user.role === 'BUYER';

  return (
    <div className="py-8 space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800">
          {isBuyer ? 'My Purchases 🛒' : 'My Sales 👨‍🌾'}
        </h2>
        <p className="text-gray-500 mt-2">
          {isBuyer 
            ? 'Track the products you have successfully purchased.' 
            : 'Track the products you have sold to buyers.'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const otherParty = isBuyer ? order.farmer : order.buyer;
              
              return (
                <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row bg-gray-50">
                  <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-white md:w-1/4 flex flex-col justify-center items-center">
                    {order.listing?.imageUrl ? (
                      <img src={order.listing.imageUrl} alt={order.listing.productName} className="w-24 h-24 object-cover rounded-lg shadow-sm border border-gray-200 mb-2" />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl mb-2">📦</div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${order.status === 'PLACED' ? 'bg-yellow-100 text-yellow-700' : 
                        order.status === 'PAID' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-2xl font-bold text-gray-800">{order.listing?.productName}</h4>
                        <div className="text-right">
                          <p className="text-2xl font-black text-green-600">₹{order.totalAmount}</p>
                          <p className="text-sm text-gray-500">{order.quantity} {order.listing?.unit} @ ₹{order.agreedPrice}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 rounded-lg p-4 mt-4 inline-block">
                        <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider">{isBuyer ? 'Seller Info' : 'Buyer Info'}</p>
                        <p className="font-bold text-gray-800">{otherParty?.name}</p>
                        <p className="text-sm text-gray-600">📞 {otherParty?.phone}</p>
                        <p className="text-sm text-gray-600">📍 {otherParty?.location}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-400">Order ID: {order.id}</p>
                      
                      <div className="flex gap-2">
                        {isBuyer && order.status === 'DELIVERED' && (
                          <button 
                            onClick={() => {
                              setSelectedOrderForReview(order);
                              setRating(5);
                              setReviewModalOpen(true);
                            }}
                            className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-100 flex items-center gap-1 shadow-sm"
                          >
                            <span>⭐</span> Rate Farmer
                          </button>
                        )}
                        <button 
                          onClick={() => navigate('/messages', { state: { contact: otherParty } })}
                          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm"
                        >
                          <span>💬</span> Message
                        </button>
                        
                        {/* Status update buttons - Farmers can mark as Paid/Delivered */}
                        {!isBuyer && order.status === 'PLACED' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'PAID')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                            Mark Paid
                          </button>
                        )}
                        {!isBuyer && order.status === 'PAID' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Rate your experience</h3>
            <p className="text-gray-600 mb-6">How was your purchase with {selectedOrderForReview?.farmer?.name}?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`text-4xl focus:outline-none transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Comment (Optional)</label>
              <textarea 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                rows="3"
                placeholder="Share your experience..."
              ></textarea>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReview}
                className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 shadow-md transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
