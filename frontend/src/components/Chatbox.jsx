import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, ChevronDown, HelpCircle, Layers } from 'lucide-react';
import { sendChatMessage, getChatPrompts } from '../api';

export default function Chatbox({ currentUser, prefillMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào! Tui là Trợ lý AI Nhà May Thúy Diễm 🧵.\nBạn đang cần tư vấn chọn mẫu may, chất liệu vải, báo giá may đo hay gợi ý phom dáng theo vóc dáng ạ?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptCategories, setPromptCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const messagesEndRef = useRef(null);

  // Tải danh mục Prompts từ server khi mở Chatbox
  useEffect(() => {
    getChatPrompts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPromptCategories(data);
        }
      })
      .catch((err) => {
        console.log('Không thể tải prompts từ server, dùng mặc định');
      });
  }, []);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Nếu có prefillMessage từ bên ngoài (nhấp "Tư vấn mẫu"), mở chatbox và gửi ngay
  useEffect(() => {
    if (prefillMessage) {
      setIsOpen(true);
      const query = `Tư vấn cho tôi chi tiết về mẫu '${prefillMessage.name}' (${prefillMessage.category || 'Mẫu may'})`;
      setInputMsg(query);
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

  // Helper hàm format markdown cơ bản (Bold, Italic, Bullet points, Line breaks)
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Xử lý in đậm **text** và nghiêng *text*
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={partIdx} className="italic text-slate-700">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      return (
        <React.Fragment key={lineIdx}>
          {formattedLine}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  // Lấy danh sách prompts theo danh mục được chọn
  const currentCategoryData = promptCategories.find(c => c.category === activeCategory) || promptCategories[0];
  const activePrompts = currentCategoryData?.prompts || [
    'May đầm dạ hội chọn vải gì sang trọng?',
    'Bảng giá may sơ mi và quần tây công sở?',
    'Tư vấn kiểu đầm cho người béo bụng?',
    'Nhà may có nhận may gấp trong 24h không?',
    'Hướng dẫn cách tự lấy số đo tại nhà?'
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end">

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:bottom-full sm:right-0 sm:mb-4 w-full sm:w-[440px] h-full sm:h-[580px] bg-white rounded-none sm:rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slideUp">

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg ring-2 ring-amber-400/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5 text-white">
                  Trợ Lý AI Tư Vấn May Đo
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <p className="text-[11px] text-slate-300">Nhà May Thúy Diễm • Tư vấn 24/7</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Đóng chatbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/70 space-y-3.5">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                      isUser ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-slate-950 font-black'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[84%] group`}>
                    <div
                      className={`p-3.5 rounded-2xl text-[12.5px] leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                      }`}
                    >
                      {isUser ? msg.text : renderFormattedText(msg.text)}
                    </div>
                    <span className={`text-[10px] text-slate-400 mt-1 block px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs p-2.5 bg-white rounded-xl border border-slate-200 max-w-[150px] shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span className="font-medium">AI đang soạn bài...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Category Tabs for Quick Prompts */}
          {promptCategories.length > 0 && (
            <div className="px-3 pt-2 bg-slate-50 border-t border-slate-200/70 overflow-x-auto flex space-x-1.5 scrollbar-none">
              {promptCategories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-t-lg transition-all whitespace-nowrap ${
                    activeCategory === cat.category
                      ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          )}

          {/* Quick Prompts List */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap flex space-x-1.5 scrollbar-none">
            {activePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all flex-shrink-0 shadow-xs"
              >
                💡 {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 pb-5 sm:pb-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Hỏi AI về chọn vải, vóc dáng, bảng giá may đo..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-100 text-xs text-slate-800 px-3.5 py-2.5 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputMsg.trim()}
              className="p-2.5 bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-indigo-900 hover:to-indigo-800 text-white rounded-xl disabled:opacity-40 transition-all shadow-md flex-shrink-0"
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Toggle Button (chỉ hiển thị khi chatbox đang đóng) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-amber-400/50 group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
          </div>
          <span className="text-xs font-bold tracking-wide group-hover:text-amber-300 transition-colors">
            Tư Vấn AI
          </span>
        </button>
      )}

    </div>
  );
}
