import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import { sendChatMessage } from '../api';

export default function Chatbox({ currentUser, prefillMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào! Tui là Trợ lý AI Nhà May Thúy Diễm 🧵. Bạn đang muốn tìm mẫu may hay tư vấn loại vải phù hợp với vóc dáng ạ?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Nếu có prefillMessage từ bên ngoài (nhấp "Tư vấn mẫu"), mở chatbox và điền câu hỏi
  useEffect(() => {
    if (prefillMessage) {
      setIsOpen(true);
      setInputMsg(`Tư vấn cho tui về mẫu '${prefillMessage.name}' (${prefillMessage.category})`);
    }
  }, [prefillMessage]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgObj = { sender: 'user', text, time: timeStr };

    setMessages((prev) => [...prev, userMsgObj]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, currentUser ? currentUser.id : null);
      const aiMsgObj = {
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Xin lỗi, hiện tại kết nối đến trợ lý tư vấn đang gián đoạn. Bạn thử lại sau giây lát nhé!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'May đầm dạ hội chọn vải gì đẹp?',
    'May quần tây công sở bao nhiêu tiền?',
    'Có nhận may gấp theo số đo không?'
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end">

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:bottom-full sm:right-0 sm:mb-4 w-full sm:w-[400px] h-full sm:h-[520px] bg-white rounded-none sm:rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-slideUp">

          {/* Header */}
          <div className="bg-luxury-navy text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  Trợ Lý Tư Vấn AI
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <p className="text-[11px] text-slate-300">Tư vấn kiểu dáng, số đo & loại vải</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/60 space-y-3.5">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                      }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[78%] group`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                        }`}
                    >
                      {msg.text}
                    </div>
                    <span className={`text-[10px] text-slate-400 mt-1 block px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs p-2 bg-white rounded-xl border border-slate-100 max-w-[140px]">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>AI đang gõ...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap flex space-x-1.5 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200/60 transition-colors flex-shrink-0"
              >
                💡 {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Hỏi AI về mẫu may, chất liệu vải..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-100 text-xs text-slate-800 px-3.5 py-2.5 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputMsg.trim()}
              className="p-2.5 bg-luxury-navy hover:bg-indigo-900 text-white rounded-xl disabled:opacity-40 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 bg-gradient-to-r from-luxury-navy via-indigo-900 to-luxury-navy text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-amber-400/40 group"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
        </div>
        <span className="text-xs font-bold tracking-wide group-hover:text-amber-300 transition-colors">
          Tư Vấn
        </span>
      </button>

    </div>
  );
}
