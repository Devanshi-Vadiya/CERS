import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { getMedicalAdviceStream } from '../services/geminiService';
import { ChatMessage } from '../types

const ChatAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'I am the CERS+ Assistant. I provide first-aid advice. For emergencies, use SOS immediately.',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', timestamp: new Date() }]);

    let fullText = '';
    await getMedicalAdviceStream(userMsg.text, (chunk) => {
      fullText += chunk;
      setMessages(prev => prev.map(msg => msg.id === modelMsgId ? { ...msg, text: fullText } : msg));
    });
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-charcoal">
      <div className="bg-[#2f3640] p-4 shadow-md z-10 border-b border-gray-700">
        <h2 className="text-lg font-bold flex items-center gap-2 text-trust">
          <Bot size={24} /> CERS+ Assistant
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] rounded-2xl p-4 shadow-md text-sm leading-relaxed
              ${msg.role === 'user' ? 'bg-trust text-white rounded-br-none' : 'bg-[#2f3640] text-gray-200 border border-gray-700 rounded-bl-none'}
            `}>
              {msg.text ? (
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
              ) : (
                <Loader2 className="animate-spin text-gray-400" size={16} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#2f3640] border-t border-gray-700 fixed bottom-[72px] left-0 right-0 md:static md:bottom-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe situation..."
            className="flex-1 bg-[#1E272E] border-gray-600 border rounded-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-trust"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-trust text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
