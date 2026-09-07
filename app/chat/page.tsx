'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';
import { MessageSquareText, Send, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const shopIdParam = searchParams.get('shop');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      if (shopIdParam) {
        const conv = await DBService.getOrCreateConversation(user.id, shopIdParam);
        setActiveConversation(conv);
      }
      const data = await DBService.getConversations(user.id, false);
      setConversations(data);
      if (!shopIdParam && data.length > 0) {
        setActiveConversation(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    const msgs = await DBService.getMessages(convId);
    setMessages(msgs);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConversation) return;
    
    try {
      const msg = await DBService.sendMessage(activeConversation.id, user.id, newMessage.trim());
      setMessages([...messages, msg]);
      setNewMessage('');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      loadConversations(); // refresh sidebar order
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <MessageSquareText className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connectez-vous</h2>
          <p className="text-gray-500 mb-6">Vous devez être connecté pour discuter avec les boutiques.</p>
          <Link href="/auth/login" className="btn btn-primary">Se connecter</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1 container max-w-6xl py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-4 sm:hidden">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex h-[calc(100vh-200px)] min-h-[500px]">
          
          {/* Sidebar Conversations */}
          <div className={`${activeConversation ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-1/3 border-r border-gray-100 bg-gray-50`}>
            <div className="p-4 border-b border-gray-200 bg-white">
              <h1 className="text-xl font-bold text-gray-900 font-heading">Messages</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">Chargement...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Aucune conversation.
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition border-b border-gray-100 last:border-0 ${
                      activeConversation?.id === conv.id ? 'bg-emerald-50' : 'hover:bg-gray-100 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex flex-shrink-0 items-center justify-center text-emerald-600 border border-emerald-200 overflow-hidden">
                      {conv.shop?.logo_url ? (
                        <img src={conv.shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{conv.shop?.name || 'Boutique'}</h4>
                      <p className="text-xs text-gray-500 truncate">Cliquez pour voir les messages</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Zone de Chat Principale */}
          <div className={`${!activeConversation ? 'hidden sm:flex' : 'flex'} flex-col flex-1 bg-[#faf9f6]`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
                  <button className="sm:hidden p-2 text-gray-500" onClick={() => setActiveConversation(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-200">
                    {activeConversation.shop?.logo_url ? (
                      <img src={activeConversation.shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">{activeConversation.shop?.name || 'Boutique'}</h2>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> En ligne
                    </p>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10 bg-white p-4 rounded-xl shadow-sm border border-gray-100 inline-block mx-auto">
                      Dites bonjour à {activeConversation.shop?.name || 'la boutique'} ! 👋
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isMe 
                              ? 'bg-emerald-600 text-white rounded-tr-sm shadow-sm' 
                              : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200 shadow-sm'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <span className={`text-[9px] mt-1 block ${isMe ? 'text-emerald-200 text-right' : 'text-gray-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez un message..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none text-sm transition"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="p-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition disabled:opacity-50 disabled:bg-gray-400 shadow-sm"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageSquareText className="w-16 h-16 mb-4 text-gray-200" />
                <p>Sélectionnez une conversation</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
