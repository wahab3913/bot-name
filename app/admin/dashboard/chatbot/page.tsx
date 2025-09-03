'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import AI_CONFIG from '@/lib/config';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/profile', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setUserId(data?.user?.id ?? null))
      .catch(() => setUserId(null));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  const handleSend = async () => {
    if (!canSend) return;
    const content = input.trim();
    setInput('');
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const conversation_history = messages
      .filter((m) => m.role !== 'system')
      .reduce<{ question: string; answer: string }[]>((acc, m, idx, arr) => {
        if (m.role === 'user') {
          const next = arr[idx + 1];
          if (next?.role === 'assistant') {
            acc.push({ question: m.content, answer: next.content });
          }
        }
        return acc;
      }, []);

    try {
      const res = await fetch(`${AI_CONFIG.PYTHON_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversation_history,
          agent_id: userId ? `admin_${userId}` : undefined,
        }),
      });

      const data = await res.json();
      const text =
        data?.response || "I'm sorry, I couldn't generate a response.";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: text },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#101238] text-white flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chatbot</h2>
            <p className="text-xs text-gray-500">
              Ask anything. Powered by your knowledge base.
            </p>
          </div>
        </div>

        <div
          ref={listRef}
          className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-white/60"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-16">
              Start the conversation by asking a question.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm border ${
                  m.role === 'user'
                    ? 'bg-[#101238] text-white border-transparent'
                    : 'bg-white text-gray-800 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {m.role === 'user' ? (
                    <User className="w-4 h-4 mt-0.5 opacity-80" />
                  ) : (
                    <Bot className="w-4 h-4 mt-0.5 opacity-80" />
                  )}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200/60 bg-white/70">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-white/60 border border-gray-200 text-black rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#101238]"
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="bg-[#101238] text-white rounded-2xl px-4 py-3 text-sm font-medium hover:bg-[#0f1135] disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
