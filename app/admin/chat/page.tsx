"use client";

import { useState, useEffect, useRef } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { useAuth } from "../../../hooks/useAuth";
import { app } from "../../../lib/firebase/config";

export default function AdminChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [filter, setFilter] = useState("Open");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const db = getFirestore(app);
  let typingTimeout: NodeJS.Timeout;

  useEffect(() => {
    const q = query(collection(db, "supportChats"), orderBy("lastMessageAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [db]);

  useEffect(() => {
    if (!selectedChat) return;
    const qMsg = query(collection(db, `supportChats/${selectedChat.id}/messages`), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(qMsg, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    
    // Clear unread count when opening
    updateDoc(doc(db, "supportChats", selectedChat.id), { unreadByAdmin: 0 });
    
    return () => unsub();
  }, [selectedChat?.id, db]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;
    const text = newMessage;
    setNewMessage("");

    await addDoc(collection(db, `supportChats/${selectedChat.id}/messages`), {
      senderId: user.id,
      senderName: user.displayName || "Support Admin",
      senderType: 'admin',
      body: text,
      createdAt: serverTimestamp(),
      isRead: false
    });

    await updateDoc(doc(db, "supportChats", selectedChat.id), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      status: selectedChat.status === 'open' ? 'assigned' : selectedChat.status,
      assignedAdminId: selectedChat.assignedAdminId || user.id,
      isTyping: false
    });
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    updateDoc(doc(db, "supportChats", selectedChat.id), { isTyping: true });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      updateDoc(doc(db, "supportChats", selectedChat.id), { isTyping: false });
    }, 3000);
  };

  const filteredChats = chats.filter(c => {
    if (filter === "All") return true;
    if (filter === "Open") return c.status === "open";
    if (filter === "My Chats") return c.assignedAdminId === user?.id;
    if (filter === "Resolved") return c.status === "resolved";
    return true;
  });

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-8rem)] flex">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-8 border-b border-gray-100 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Customer Support</h1>
          <div className="flex bg-gray-100 p-1.5 rounded-xl shadow-inner">
            {["All", "Open", "My Chats", "Resolved"].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setSelectedChat(chat)}
              className={`p-6 border-b border-gray-100 cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-brand-50/50 border-l-4 border-l-brand-500' : 'border-l-4 border-l-transparent hover:bg-gray-50/80'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1">{chat.userName || chat.userEmail || "Customer"}</h4>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[10px] font-bold text-gray-400">
                    {chat.lastMessageAt ? new Date(chat.lastMessageAt?.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${chat.status === 'open' ? 'bg-green-500' : chat.status === 'assigned' ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 line-clamp-1 pr-6 relative leading-relaxed">
                {chat.lastMessage || "Started a new chat"}
                {chat.unreadByAdmin > 0 && (
                  <span className="absolute right-0 top-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                    {chat.unreadByAdmin}
                  </span>
                )}
              </p>
            </div>
          ))}
          {filteredChats.length === 0 && <div className="p-12 text-center text-gray-400 font-bold text-sm">No chats found.</div>}
        </div>
      </div>

      {/* Main Thread */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10 shrink-0">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">{selectedChat.userName}</h2>
              <p className="text-xs font-bold text-gray-500 mt-1">{selectedChat.userEmail}</p>
            </div>
            <div className="flex items-center gap-4">
              {!selectedChat.assignedAdminId && (
                <button 
                  onClick={() => updateDoc(doc(db, "supportChats", selectedChat.id), { assignedAdminId: user?.id, status: 'assigned' })}
                  className="bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm"
                >
                  Assign to me
                </button>
              )}
              <select 
                value={selectedChat.status}
                onChange={(e) => updateDoc(doc(db, "supportChats", selectedChat.id), { status: e.target.value })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FAFAFA]">
            {messages.map((msg, i) => {
              const isAdmin = msg.senderType === 'admin';
              return (
                <div key={msg.id || i} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-2 mr-2">
                    {msg.senderName} • {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                  </span>
                  <div className={`p-4 px-6 max-w-[75%] text-sm font-medium shadow-sm ${
                    isAdmin 
                      ? 'bg-gray-900 text-white rounded-[20px] rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-[20px] rounded-tl-sm'
                  }`}>
                    {msg.body}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-gray-100 shrink-0">
            <div className="mb-4 flex gap-2">
              <select 
                onChange={e => { if(e.target.value) setNewMessage(e.target.value); }}
                className="bg-brand-50 text-brand-700 border border-brand-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer shadow-sm hover:bg-brand-100 transition-colors"
              >
                <option value="">⚡ Quick Replies</option>
                <option value="Hi there! How can I help you today?">Greeting</option>
                <option value="I'm checking on this right now. Please give me a moment.">Checking status</option>
                <option value="Your order has been shipped and is on the way!">Order shipped</option>
                <option value="Is there anything else I can help you with?">Anything else</option>
              </select>
            </div>
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-4 items-center">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleTyping}
                placeholder="Type your message to customer..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm"
                disabled={selectedChat.status === 'resolved'}
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim() || selectedChat.status === 'resolved'} 
                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                Send
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
          <div className="text-center">
            <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Select a chat</h3>
            <p className="text-sm font-bold text-gray-500 max-w-xs mx-auto">Choose a conversation from the sidebar to start helping customers.</p>
          </div>
        </div>
      )}
    </div>
  );
}
