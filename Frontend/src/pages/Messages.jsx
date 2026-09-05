import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { request } from '../api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Mail, MapPin, Smile, MessageCircle } from 'lucide-react';

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { dbUser: user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if we navigated here with a specific contact to chat with
    if (location.state && location.state.contact) {
        setSelectedContact(location.state.contact);
    }
    
    fetchContacts(user.id);
  }, [navigate, location.state, user]);

  const fetchContacts = async (userId) => {
    try {
      const data = await request(`/chat/contacts/${userId}`);
      setContacts(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    if (!user || !selectedContact) return;
    try {
      const data = await request(`/chat/history/${user.id}/${selectedContact.id}`);
      setMessages(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Polling mechanism
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Fetch every 3s
    return () => clearInterval(interval);
  }, [selectedContact, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setIsSending(true);
    try {
      await request('/chat', {
        method: 'POST',
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedContact.id,
          content: newMessage
        })
      });
      setNewMessage('');
      fetchMessages(); // fetch immediately after sending
      fetchContacts(user.id); // refresh contacts list in case this is a new contact
    } catch (e) {
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-100px)] flex animate-fadeIn max-w-7xl mx-auto w-full pt-4 pb-8">
      <Card className="w-full flex flex-row overflow-hidden border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
        {/* Sidebar Contacts */}
        <div className="w-1/3 md:w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col h-full shrink-0">
          <div className="p-6 bg-white border-b border-gray-100 shadow-sm z-10 relative">
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">Messages <MessageSquare className="w-6 h-6 text-green-600" /></h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {contacts.length === 0 && !selectedContact && (
              <div className="text-center py-10 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 mb-4">
                  <Mail className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No messages yet.</p>
                <p className="text-sm text-gray-400 mt-1">Start a conversation from the marketplace.</p>
              </div>
            )}
            
            {/* If there's a selected contact that isn't in the contacts list yet (e.g. new chat initiated from dashboard) */}
            {selectedContact && !contacts.find(c => c.id === selectedContact.id) && (
              <div 
                className="p-4 rounded-2xl cursor-pointer transition-all bg-green-50 border border-green-100 shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-xl font-bold shadow-sm overflow-hidden shrink-0">
                  {selectedContact.avatarUrl ? (
                    <img src={selectedContact.avatarUrl} alt={selectedContact.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedContact.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{selectedContact.name}</h4>
                  <p className="text-xs font-semibold text-green-600 tracking-wider uppercase mt-0.5">{selectedContact.role}</p>
                </div>
              </div>
            )}

            {contacts.map(c => {
              const isSelected = selectedContact?.id === c.id;
              return (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedContact(c)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${isSelected ? 'bg-green-50 border border-green-100 shadow-sm' : 'bg-white border border-transparent hover:border-gray-200 hover:shadow-sm'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm transition-colors overflow-hidden shrink-0 ${isSelected ? 'bg-white text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      c.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className={`font-bold transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{c.name}</h4>
                    <p className={`text-xs font-semibold tracking-wider uppercase mt-0.5 ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>{c.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white flex flex-col h-full relative">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-6 bg-white border-b border-gray-100 shadow-sm z-10 flex items-center gap-4 sticky top-0">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold shadow-inner overflow-hidden shrink-0">
                  {selectedContact.avatarUrl ? (
                    <img src={selectedContact.avatarUrl} alt={selectedContact.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedContact.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-none mb-1">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3 opacity-60" /> {selectedContact.location}</p>
                </div>
              </div>
              
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Smile className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-medium text-lg text-gray-500">Say hello to {selectedContact.name}!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.sender.id === user.id;
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showAvatar = !prevMsg || prevMsg.sender.id !== msg.sender.id;
                    
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                        {!isMine && showAvatar ? (
                          <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-auto shrink-0 shadow-sm overflow-hidden">
                            {selectedContact.avatarUrl ? (
                              <img src={selectedContact.avatarUrl} alt={selectedContact.name} className="w-full h-full object-cover" />
                            ) : (
                              selectedContact.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        ) : (
                          !isMine && <div className="w-8 mr-2 shrink-0"></div>
                        )}
                        
                        <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm relative group ${isMine ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] font-medium mt-2 flex items-center gap-1 ${isMine ? 'text-green-100 justify-end' : 'text-gray-400 justify-start'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {isMine && <span className="text-[8px]">✓✓</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-5 bg-white border-t border-gray-100 z-10 sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Type a message..." 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-700 shadow-inner"
                  />
                  <Button 
                    type="submit" 
                    className="px-8 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
                    disabled={!newMessage.trim()}
                    isLoading={isSending}
                  >
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h3>
              <p className="text-gray-500 font-medium">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
