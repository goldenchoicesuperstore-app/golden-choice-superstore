"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getFirestore, doc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc } from "firebase/firestore";
import { app } from "../../lib/firebase/config";

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminTyping, setAdminTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const db = getFirestore(app);
  
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2340000000000";

  useEffect(() => {
    if (!user) return;
    
    // Bind directly to the user's UID as the chat document ID
    const userChatRef = doc(db, "supportChats", user.id);

    const unsubChat = onSnapshot(userChatRef, (docSnap) => {
      if (docSnap.exists()) {
        setAdminTyping(docSnap.data()?.isTyping || false);
      }
    });

    const messagesRef = collection(db, `supportChats/${user.id}/messages`);
    const qMsg = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubMessages = onSnapshot(qMsg, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [user, db]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user) return;

    const msgBody = text.trim();
    setNewMessage("");

    const chatRef = doc(db, "supportChats", user.id);
    const messagesRef = collection(db, `supportChats/${user.id}/messages`);

    // Create chat doc if not exists or update last message
    await setDoc(chatRef, {
      userId: user.id,
      userName: user.displayName || "Customer",
      userEmail: user.email,
      status: 'open',
      lastMessage: msgBody,
      lastMessageAt: serverTimestamp(),
      unreadByAdmin: 1 // Trigger alert on admin side
    }, { merge: true });

    // Add message
    await addDoc(messagesRef, {
      senderId: user.id,
      senderName: user.displayName || "Customer",
      senderType: 'user',
      body: msgBody,
      createdAt: serverTimestamp(),
      isRead: false
    });
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  if (!user) return null; // Hide if unauthenticated

  return (
    <div className="fixed bottom-[88px] right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white w-[340px] md:w-[380px] h-[480px] rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden origin-bottom-right transition-all">
          {/* Header */}
          <div className="bg-[#1A1A1A] p-5 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-xl shadow-inner">⭐</div>
                <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-[#1A1A1A]"></div>
              </div>
              <div>
                <h3 className="text-white font-extrabold text-sm">Golden Choice Support</h3>
                <p className="text-green-400 text-[10px] font-black tracking-widest uppercase">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#FAFAFA] flex flex-col">
            {messages.length === 0 && (
              <div className="space-y-4 mt-auto">
                <div className="bg-white border border-gray-100 p-5 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] self-start">
                  <p className="text-sm font-bold text-gray-800 leading-relaxed">Hi {user.displayName?.split(' ')[0] || 'there'}! 👋<br/><br/>How can we help you today?</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Track my order", "Return or refund", "Payment issue", "Other"].map((chip) => (
                    <button key={chip} onClick={() => handleQuickReply(chip)} className="bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 hover:shadow-sm px-4 py-2 rounded-xl text-xs font-bold transition-all">
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.senderType === 'user';
              return (
                <div key={msg.id || i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 px-5 max-w-[85%] text-sm font-medium shadow-sm ${
                    isUser 
                      ? 'bg-brand-500 text-gray-900 rounded-[20px] rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-[20px] rounded-tl-sm'
                  }`}>
                    {msg.body}
                  </div>
                </div>
              );
            })}
            
            {adminTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-5 py-4 rounded-[20px] rounded-tl-sm shadow-sm flex gap-1.5 items-center h-10">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & WhatsApp Link */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={e => { e.preventDefault(); sendMessage(newMessage); }} className="flex items-center gap-2 relative">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <button type="submit" disabled={!newMessage.trim()} className="absolute right-2 p-2 bg-brand-500 text-gray-900 rounded-lg disabled:opacity-50 hover:bg-brand-600 hover:shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
              </button>
            </form>
            <div className="text-center mt-4">
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#25D366] transition-colors flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" /></svg>
                Chat on WhatsApp instead
              </a>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-brand-500 rounded-full shadow-xl shadow-brand-500/30 flex items-center justify-center text-white hover:scale-105 hover:bg-brand-600 transition-all duration-300 border-4 border-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-900"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" /></svg>
        </button>
      )}
    </div>
  );
}
