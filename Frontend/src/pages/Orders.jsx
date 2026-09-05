import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Sprout, Package, User, MapPin, Star, MessageCircle, FileText } from 'lucide-react';
import { generateInvoice } from '../utils/pdfGenerator';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedOrderForOtp, setSelectedOrderForOtp] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  const { dbUser } = useAuth();

  useEffect(() => {
    if (dbUser) {
      setUser(dbUser);
      fetchOrders(dbUser.id);
    } else {
      navigate('/login');
    }
  }, [dbUser, navigate]);

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

  const handleUpdateStatus = async (orderId, newStatus, otp = null) => {
    setIsUpdatingStatus(true);
    try {
      const payload = { status: newStatus };
      if (otp) payload.otp = otp;
      
      await request(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      if (newStatus === 'DELIVERED') {
        alert('Order marked as Delivered successfully!');
        setOtpModalOpen(false);
        setSelectedOrderForOtp(null);
        setOtpInput('');
      }
      
      fetchOrders(user.id);
    } catch (e) {
      alert(e.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleVerifyDelivery = (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      alert('Please enter a valid 6-digit OTP.');
      return;
    }
    handleUpdateStatus(selectedOrderForOtp.id, 'DELIVERED', otpInput.trim());
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const isBuyer = user.role === 'BUYER';

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            {isBuyer ? 'My Purchases' : 'My Sales'} 
            {isBuyer ? <ShoppingCart className="w-8 h-8 text-blue-600" /> : <Sprout className="w-8 h-8 text-green-600" />}
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            {isBuyer 
              ? 'Track the products you have successfully purchased.' 
              : 'Track the products you have sold to buyers.'}
          </p>
        </div>
      </div>

      <Card>
        <CardBody className="p-2 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading your {isBuyer ? 'purchases' : 'sales'}...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 m-4 sm:m-0">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 block" />
              <p className="text-gray-500 font-medium text-lg">No orders found.</p>
              <p className="text-gray-400 mt-2">When you {isBuyer ? 'buy' : 'sell'} items, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const otherParty = isBuyer ? order.farmer : order.buyer;
                
                return (
                  <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row bg-white group">
                    <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 md:w-1/4 flex flex-col justify-center items-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 z-0"></div>
                      
                      {order.listing?.imageUrl ? (
                        <img src={order.listing.imageUrl} alt={order.listing.productName} className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-white mb-4 z-10 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-32 h-32 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 z-10 group-hover:scale-105 transition-transform duration-300">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest z-10 shadow-sm
                        ${order.status === 'PLACED' ? 'bg-amber-100 text-amber-700' : 
                          order.status === 'PAID' ? 'bg-blue-100 text-blue-700' : 
                          'bg-emerald-100 text-emerald-700'}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                          <div>
                            <h4 className="text-2xl font-extrabold text-gray-900 mb-1">{order.listing?.productName}</h4>
                            <p className="text-gray-500 font-medium">Order #{order.id.substring(0, 8)}...</p>
                          </div>
                          <div className="sm:text-right bg-green-50 p-3 rounded-xl border border-green-100 min-w-[120px]">
                            <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Total</p>
                            <p className="text-2xl font-black text-green-700">₹{order.totalAmount}</p>
                            <p className="text-xs text-green-600 font-medium mt-1">{order.quantity} {order.listing?.unit} @ ₹{order.agreedPrice}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider">{isBuyer ? 'Seller Information' : 'Buyer Information'}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                <User className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{otherParty?.name}</p>
                                <p className="text-sm text-gray-500">{otherParty?.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                <MapPin className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">Location</p>
                                <p className="text-sm text-gray-500 truncate" title={otherParty?.location}>{otherParty?.location}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {isBuyer && order.status !== 'DELIVERED' && order.deliveryOtp && (
                          <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-inner flex items-center justify-between">
                            <div>
                              <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">Delivery OTP</p>
                              <p className="text-sm text-amber-800 font-medium">Share this code with the farmer upon delivery.</p>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                              <span className="text-2xl font-black text-amber-600 tracking-widest">{order.deliveryOtp}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-3">
                        {isBuyer && order.status === 'DELIVERED' && (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedOrderForReview(order);
                              setRating(5);
                              setReviewModalOpen(true);
                            }}
                            className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-1.5"
                          >
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Rate Experience
                          </Button>
                        )}
                        <Button 
                          variant="secondary"
                          onClick={() => navigate('/messages', { state: { contact: otherParty } })}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-4 h-4" /> Message
                        </Button>
                        
                        {(order.status === 'PAID' || order.status === 'DELIVERED') && (
                          <Button 
                            variant="outline"
                            onClick={() => generateInvoice(order, user)}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <FileText className="w-4 h-4" /> Invoice
                          </Button>
                        )}
                        
                        {/* Status update buttons - Farmers can mark as Paid/Delivered */}
                        {!isBuyer && order.status === 'PLACED' && (
                          <Button 
                            onClick={() => handleUpdateStatus(order.id, 'PAID')} 
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                            isLoading={isUpdatingStatus}
                          >
                            Mark as Paid
                          </Button>
                        )}
                        {!isBuyer && order.status === 'PAID' && (
                          <Button 
                            onClick={() => {
                              setSelectedOrderForOtp(order);
                              setOtpModalOpen(true);
                            }} 
                            className="w-full sm:w-auto"
                            isLoading={isUpdatingStatus}
                          >
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
            
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Rate your experience</h3>
            <p className="text-gray-500 mb-8 font-medium">How was your purchase with <span className="text-gray-900 font-bold">{selectedOrderForReview?.farmer?.name}</span>?</p>
            
            <div className="flex justify-center gap-3 mb-8 bg-gray-50 py-6 rounded-2xl border border-gray-100">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`focus:outline-none transition-all hover:scale-110 active:scale-95 ${star <= rating ? 'text-amber-400 drop-shadow-sm' : 'text-gray-200 grayscale opacity-50'}`}
                >
                  <Star className="w-10 h-10 fill-current" />
                </button>
              ))}
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">Comment (Optional)</label>
              <textarea 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 outline-none transition-all resize-none shadow-inner"
                rows="3"
                placeholder="Share your experience..."
              ></textarea>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="ghost"
                onClick={() => setReviewModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview}
                className="flex-1 bg-amber-500 hover:bg-amber-600 focus:ring-amber-500"
                isLoading={isSubmitting}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>
            
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Verify Delivery</h3>
            <p className="text-gray-500 mb-6 font-medium">Ask the buyer (<span className="text-gray-900 font-bold">{selectedOrderForOtp?.buyer?.name}</span>) for their 6-digit delivery OTP to confirm they received the items.</p>
            
            <form onSubmit={handleVerifyDelivery}>
              <div className="mb-8">
                <input 
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} // Only allow digits
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-200/50 outline-none transition-all text-center text-3xl font-black tracking-[0.5em] text-gray-800"
                  placeholder="••••••"
                />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setOtpModalOpen(false);
                    setOtpInput('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  isLoading={isUpdatingStatus}
                >
                  Confirm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
