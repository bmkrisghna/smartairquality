import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { generateChatResponse, buildChatContext } from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import { getCityAqi } from '@/lib/aqi';
import type { ChatMessageRow } from '@/lib/types';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot = () => {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hi! I'm AirGuide, your air quality assistant. Ask me about AQI, health advice, travel, or safety." },
  ]);
  const [history, setHistory] = useState<ChatMessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentAqi = getCityAqi('New Delhi', 28.61, 77.21);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg]);
    const text = input;
    setInput('');
    setLoading(true);

    const ctx = buildChatContext(currentAqi, 'New Delhi', profile);
    const response = generateChatResponse(text, ctx);

    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: response }]);
      setLoading(false);
      if (user) {
        supabase.from('chat_messages').insert([
          { user_id: user.id, role: 'user', content: text },
          { user_id: user.id, role: 'assistant', content: response },
        ]).then(() => {
          setHistory((h) => [...h, { role: 'user', content: text } as ChatMessageRow, { role: 'assistant', content: response } as ChatMessageRow]);
        });
      }
    }, 600);
  };

  const quickPrompts = ['What is the AQI?', 'Should I wear a mask?', 'Is it safe to exercise?', 'Travel advice?'];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 brand-gradient rounded-full shadow-xl shadow-brand-500/30 flex items-center justify-center hover:scale-105 transition-transform"
        title="AirGuide Assistant"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] sm:w-96 glass-strong rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="brand-gradient p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">AirGuide Assistant</p>
                <p className="text-xs text-white/80">AI-powered air quality advisor</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                      m.role === 'user'
                        ? 'brand-gradient text-white rounded-br-sm'
                        : 'bg-[rgb(var(--surface-2))] text-[rgb(var(--text))] rounded-bl-sm border border-app'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[rgb(var(--surface-2))] border border-app px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setInput(p)}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-[rgb(var(--surface-2))] border border-app text-soft hover:border-brand-500 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-app flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about air quality..."
                className="flex-1 px-3 py-2 rounded-xl bg-[rgb(var(--surface-2))] border border-app text-sm text-[rgb(var(--text))] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
              <Button size="sm" onClick={send} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
