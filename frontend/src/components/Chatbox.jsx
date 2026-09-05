import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, CheckCircle2, Copy, ExternalLink, ChevronRight, Ruler, Tag } from 'lucide-react';
import { sendChatMessage, getChatPrompts, getProducts } from '../api';

export default function Chatbox({ currentUser, prefillMessage, activeDetailProduct }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào! Tui là Trợ lý AI Nhà May Thúy Diễm 🧵.\nBạn đang cần tư vấn chọn mẫu may, chất liệu vải, báo giá may đo hay gửi số đo cơ thể để tiệm duyệt phom ạ?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptCategories, setPromptCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [lastMeasurement, setLastMeasurement] = useState('');
  const [toastText, setToastText] = useState('');
  const [isZaloModalOpen, setIsZaloModalOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const messagesEndRef = useRef(null);

  // Tải danh mục Prompts & Danh sách mẫu sản phẩm từ server khi mở Chatbox
  useEffect(() => {
    getChatPrompts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPromptCategories(data);
        }
      })
      .catch(() => {});

    getProducts()
      .then((data) => {
        if (Array.isArray(data)) {
          setCatalogProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Hàm quét tìm sản phẩm từ văn bản
  const detectProductFromText = (text) => {
    if (!text || catalogProducts.length === 0) return null;
    const lower = text.toLowerCase();
    for (const p of catalogProducts) {
      if (lower.includes(p.name.toLowerCase())) {
        return p;
      }
    }
    return null;
  };

  // Đồng bộ sản phẩm khi ở trang chi tiết sản phẩm
  useEffect(() => {
    if (activeDetailProduct) {
      setCurrentProduct(activeDetailProduct);
    }
  }, [activeDetailProduct]);

  // Nếu có prefillMessage từ bên ngoài (nhấp "Tư vấn mẫu"), mở chatbox và gửi ngay
  useEffect(() => {
    if (prefillMessage) {
      setCurrentProduct(prefillMessage);
      setIsOpen(true);
      const query = `Tư vấn cho tôi chi tiết về mẫu '${prefillMessage.name}' (${prefillMessage.category || 'Mẫu may'})`;
      handleSend(query, prefillMessage);
    }
  }, [prefillMessage]);

  // Hàm phát hiện người dùng có gửi số đo hay không
  const checkIsMeasurement = (text) => {
    const lower = text.toLowerCase();
    const hasKeywords = /\b(ngực|eo|mông|v1|v2|v3|vòng 1|vòng 2|vòng 3|chiều cao|cân nặng|vai|dài áo|dài quần|bắp tay)\b/i.test(lower);
    const hasNumbers = /\d+/.test(lower);
    const hasUnits = /\b\d+\s*(cm|kg|m\d+)\b/i.test(lower);
    const hasPattern = /\b\d{2,3}[-\s/]\d{2,3}[-\s/]\d{2,3}\b/.test(lower);
    return (hasKeywords && hasNumbers) || hasUnits || hasPattern;
  };

  // Lấy sản phẩm mục tiêu (ưu tiên currentProduct, rồi đến activeDetailProduct, rồi quét tin nhắn)
  const getActiveTargetProduct = () => {
    if (currentProduct) return currentProduct;
    if (activeDetailProduct) return activeDetailProduct;
    
    // Quét ngược từ tin nhắn mới nhất
    for (let i = messages.length - 1; i >= 0; i--) {
      const found = detectProductFromText(messages[i].text);
      if (found) return found;
    }
    return null;
  };

  const handleSend = async (textToSend, overrideProduct = null) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || loading) return;

    // Nếu có overrideProduct (ví dụ từ nút bấm tư vấn)
    if (overrideProduct) {
      setCurrentProduct(overrideProduct);
    } else {
      // Quét xem tin nhắn có nhắc đến sản phẩm nào không
      const matched = detectProductFromText(text);
      if (matched) {
        setCurrentProduct(matched);
      }
    }

    // Nếu người dùng gửi số đo, lưu lại ngữ cảnh số đo
    if (checkIsMeasurement(text)) {
      setLastMeasurement(text.trim());
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgObj = { sender: 'user', text, time: timeStr };

    setMessages((prev) => [...prev, userMsgObj]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, currentUser ? currentUser.id : null);
      
      // Quét xem câu trả lời của AI có nói về mẫu nào không
      const aiMatched = detectProductFromText(res.reply);
      if (aiMatched && !currentProduct) {
        setCurrentProduct(aiMatched);
      }

      const aiMsgObj = {
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasZaloAction: res.reply.includes('Zalo') || res.reply.includes('SỐ ĐO') || res.reply.includes('zalo.me')
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

  // Tạo nội dung thông điệp gửi Zalo
  const generateZaloMessage = () => {
    const targetProd = getActiveTargetProduct();
    const prodInfo = targetProd 
      ? `• Mẫu trang phục: ${targetProd.name} ${targetProd.price_estimate ? `(${targetProd.price_estimate})` : ''}`
      : '• Mẫu may: Em cần tiệm tư vấn mẫu may phù hợp';

    const measureInfo = lastMeasurement
      ? `• Số đo khách cung cấp: ${lastMeasurement}`
      : '• Số đo: Em muốn gửi số đo để tiệm tư vấn cắt may chuẩn phom';

    return `🧵 [KHÁCH ĐẶT MAY THEO SỐ ĐO - NHÀ MAY THÚY DIỄM]\n${prodInfo}\n${measureInfo}\n👉 Nhờ tiệm tư vấn phom dáng, chọn chất liệu vải và báo giá trọn gói giúp em ạ!`;
  };

  // Khi bấm nút "Chuyển sang Zalo"
  const handleTransferToZalo = () => {
    const fullMessageToCopy = generateZaloMessage();

    // Copy nội dung vào Clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullMessageToCopy)
        .then(() => {
          setCopiedSuccess(true);
        })
        .catch(() => {
          setCopiedSuccess(false);
        });
    }

    // Mở popup hướng dẫn
    setIsZaloModalOpen(true);
  };

  // Copy lại nội dung trong popup
  const handleCopyAgain = () => {
    const fullMessageToCopy = generateZaloMessage();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullMessageToCopy).then(() => {
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 3000);
      });
    }
  };

  // Mở trang Zalo chính thức của nhà may
  const handleOpenZaloApp = () => {
    window.open('https://zalo.me/0901370622', '_blank');
  };

  // Helper hàm format markdown cơ bản (Bold, Italic, Link, Line breaks)
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Xử lý link [text](url)
      const linkRegex = /\[(.*?)\]\((https?:\/\/.*?)\)/g;
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(https?:\/\/.*?\))/g);
      
      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={partIdx} className="italic text-slate-700">{part.slice(1, -1)}</em>;
        }
        const matchLink = /^\[(.*?)\]\((https?:\/\/.*?)\)$/.exec(part);
        if (matchLink) {
          return (
            <a
              key={partIdx}
              href={matchLink[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0068FF] font-semibold underline hover:text-blue-700 inline-flex items-center gap-0.5"
            >
              {matchLink[1]}
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          );
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
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:bottom-full sm:right-0 sm:mb-4 w-full sm:w-[450px] h-full sm:h-[600px] bg-white rounded-none sm:rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slideUp">

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

          {/* Current Product Badge (Nếu đang tư vấn mẫu cụ thể) */}
          {getActiveTargetProduct() && (
            <div className="bg-amber-50/90 px-3.5 py-1.5 border-b border-amber-200/70 flex items-center justify-between text-xs text-amber-950">
              <span className="truncate font-medium flex items-center gap-1.5">
                👗 Đang tư vấn: <strong className="font-bold text-indigo-950">{getActiveTargetProduct().name}</strong>
              </span>
              <button
                onClick={() => setCurrentProduct(null)}
                className="text-amber-700 hover:text-amber-900 text-[11px] underline flex-shrink-0 ml-2"
                title="Bỏ gắn mẫu này"
              >
                Bỏ chọn
              </button>
            </div>
          )}

          {/* Toast Notification Alert */}
          {toastText && (
            <div className="bg-emerald-600 text-white text-xs px-3.5 py-2 font-medium flex items-center gap-2 shadow-inner animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{toastText}</span>
            </div>
          )}

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

                  <div className={`max-w-[86%] group`}>
                    <div
                      className={`p-3.5 rounded-2xl text-[12.5px] leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                      }`}
                    >
                      {isUser ? msg.text : renderFormattedText(msg.text)}

                      {/* Nút Hành Động Đồng Bộ Sang Zalo Kèm Mẫu & Số Đo (Khi có liên quan Zalo hoặc Số đo) */}
                      {!isUser && msg.hasZaloAction && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                          <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200/70 text-[11.5px] space-y-1">
                            <p className="font-bold text-blue-950 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                              Gói dữ liệu đồng bộ sang Zalo:
                            </p>
                            {getActiveTargetProduct() ? (
                              <p className="text-slate-700">
                                👗 <strong>Mẫu:</strong> {getActiveTargetProduct().name} {getActiveTargetProduct().price_estimate ? `(${getActiveTargetProduct().price_estimate})` : ''}
                              </p>
                            ) : (
                              <p className="text-slate-500 italic">
                                👗 Chưa chọn mẫu cụ thể (tiệm sẽ tư vấn chọn mẫu)
                              </p>
                            )}
                            {lastMeasurement ? (
                              <p className="text-slate-700">
                                📏 <strong>Số đo:</strong> {lastMeasurement}
                              </p>
                            ) : (
                              <p className="text-slate-500 italic">
                                📏 Chưa nhập số đo (hoặc nhắn trực tiếp trên Zalo)
                              </p>
                            )}
                          </div>

                          <button
                            onClick={handleTransferToZalo}
                            className="w-full py-2.5 px-3 bg-[#0068FF] hover:bg-[#0054cc] active:bg-[#004bb8] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all group"
                          >
                            <MessageSquare className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                            <span>CHUYỂN QUA ZALO GỬI THỢ MAY</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                          </button>
                        </div>
                      )}
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

          {/* Quick Measurement & Zalo Bar (Nếu đã có số đo hoặc mẫu) */}
          {(getActiveTargetProduct() || lastMeasurement) && (
            <div className="px-3 py-1.5 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-[11px]">
              <div className="truncate text-blue-900 font-medium">
                {getActiveTargetProduct() && <span>👗 {getActiveTargetProduct().name} </span>}
                {lastMeasurement && <span className="text-slate-600 font-normal">| 📏 {lastMeasurement}</span>}
              </div>
              <button
                onClick={handleTransferToZalo}
                className="text-[#0068FF] hover:text-blue-800 font-bold underline whitespace-nowrap ml-2 flex items-center gap-0.5"
              >
                Gửi Zalo →
              </button>
            </div>
          )}

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
              placeholder="Nhập số đo (V1-V2-V3, chiều cao, cân nặng) hoặc câu hỏi..."
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

      {/* Zalo Visual Guide Modal (Giải pháp 1: Hướng dẫn Dán trực quan) */}
      {isZaloModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-slideUp">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0068FF] text-white flex items-center justify-center shadow-md font-bold text-xs">
                  Zalo
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Gửi Mẫu & Số Đo Qua Zalo</h3>
                  <p className="text-[11px] text-slate-300">Nhà May Thúy Diễm • Hotline 0901.370.622</p>
                </div>
              </div>
              <button
                onClick={() => setIsZaloModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Copy Success Alert */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold text-emerald-950">
                    {copiedSuccess ? 'Đã sao chép nội dung vào bộ nhớ tạm!' : 'Đã chuẩn bị sẵn nội dung của bạn!'}
                  </p>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5">
                    Thông tin mẫu thiết kế & số đo đã được đóng gói sẵn sàng để gửi.
                  </p>
                </div>
              </div>

              {/* Message Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Nội dung đơn may đo:
                  </span>
                  <button
                    onClick={handleCopyAgain}
                    className="text-[11px] text-luxury-indigo hover:text-indigo-950 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSuccess ? 'Đã chép lại ✓' : 'Sao chép lại'}</span>
                  </button>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                  {generateZaloMessage()}
                </div>
              </div>

              {/* Visual Step Guide */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-2.5">
                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  💡 Hướng dẫn gửi cho tiệm (Chỉ mất 3 giây):
                </p>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Bấm nút <strong>"MỞ ỨNG DỤNG ZALO"</strong> màu xanh bên dưới.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Tại khung chat Zalo, bạn <strong>Nhấn giữ màn hình và chọn "Dán" (Paste)</strong> hoặc bấm phím <strong>Ctrl + V</strong> rồi nhấn Gửi!
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    handleOpenZaloApp();
                  }}
                  className="w-full py-3.5 px-4 bg-[#0068FF] hover:bg-[#0054cc] active:bg-[#004bb8] text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25 transition-all group"
                >
                  <MessageSquare className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span>MỞ ỨNG DỤNG ZALO GỬI TIỆM NGAY</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </button>

                <button
                  onClick={() => setIsZaloModalOpen(false)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Đóng lại
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

