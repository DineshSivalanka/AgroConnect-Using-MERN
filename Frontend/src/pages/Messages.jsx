import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { request } from '../api';

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    setUser(loggedUser);
    fetchContacts(loggedUser.id);
    
    if (location.state?.contact) {
        setSelectedContact(location.state.contact);
    }
  }, [navigate, location.state]);

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
    }
  };

  if (!user) return null;

  return (
    <div className="py-4 h-[calc(100vh-100px)] flex">
      <div className="w-1/3 bg-white border border-gray-200 rounded-l-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 && !selectedContact && (
            <p className="p-6 text-gray-500 text-center">No messages yet.</p>
          )}
          
          {/* If there's a selected contact that isn't in the contacts list yet (e.g. new chat initiated from dashboard) */}
          {selectedContact && !contacts.find(c => c.id === selectedContact.id) && (
            <div 
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors bg-green-50`}
            >
              <h4 className="font-bold text-gray-800">{selectedContact.name}</h4>
              <p className="text-sm text-gray-500">{selectedContact.role}</p>
            </div>
          )}

          {contacts.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedContact(c)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedContact?.id === c.id ? 'bg-green-50' : 'hover:bg-gray-50'}`}
            >
              <h4 className="font-bold text-gray-800">{c.name}</h4>
              <p className="text-sm text-gray-500">{c.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-2/3 bg-gray-50 border-y border-r border-gray-200 rounded-r-2xl shadow-sm flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 rounded-tr-2xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-800">{selectedContact.name}</h3>
              <p className="text-sm text-gray-500">{selectedContact.location}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isMine = msg.sender.id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${isMine ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 text-right ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200 rounded-br-2xl">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)} 
                  placeholder="Type a message..." 
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors shadow-sm">
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="text-6xl mb-4">💬</span>
            <p className="text-xl">Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
