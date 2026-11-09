import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../components/Header';
import {
  Bot,
  Send,
  Sparkles,
  Cpu,
  Layers,
  Terminal,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  User,
  Activity
} from 'lucide-react';
import { apiClient } from '../api/client';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  toolsExecuted?: string[];
  timestamp: string;
}

export const AIInvestigator: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: "Hello, I am the **CreditLens AI Investigation Agent**. I analyze borrower profiles, compute calibrated default probabilities, and unpack SHAP game-theoretic risk drivers using deterministic Python tools.\n\nHow can I assist your credit investigation today?",
      toolsExecuted: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/investigator/chat', { message: textToSend });
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: data.response,
        toolsExecuted: data.tools_executed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `Investigation error: ${err.response?.data?.detail || err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Why is customer C1000 classified as high risk?",
    "Compare customer C1000 and C1002",
    "Which customer segment has the highest default rate?",
    "Find customers whose debt and payment patterns are unusual",
    "Summarise the overall credit risk in the uploaded portfolio"
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-50 h-screen overflow-hidden">
      <Header
        title="AI Credit Risk Investigator"
        subtitle="Autonomous credit analyst executing deterministic Python analytical tools"
      />

      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-6 overflow-hidden">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 shrink-0 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            Quick Inquiries:
          </span>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-full shrink-0 transition-colors shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto space-y-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'agent' && (
                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-2xl space-y-2 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Tools executed badge pill */}
                {m.toolsExecuted && m.toolsExecuted.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Terminal className="h-3 w-3 text-emerald-600" />
                      Tools Executed:
                    </span>
                    {m.toolsExecuted.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold"
                      >
                        {tool}()
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-sm rounded-br-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-none shadow-2xs'
                  }`}
                >
                  {m.text}
                </div>

                <div className={`text-[10px] text-slate-400 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500 py-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Activity className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                <span>Agent executing deterministic analytical Python tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-4 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI Investigator (e.g. 'Why is customer C1000 high risk?')..."
              className="flex-1 px-4 py-2.5 text-xs bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-2 text-center text-[10px] text-slate-400">
            CreditLens Agent uses deterministic analytical tools. It cannot make lending approvals or alter risk cutoffs.
          </div>
        </div>
      </div>
    </div>
  );
};
