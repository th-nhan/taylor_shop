import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, MessageSquare, ArrowLeft, ShoppingBag, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onConsult }) {
  if (!product) return null;

  const { name, categories, target_gender, price_estimate, description, design_details, fabric_recommendations, image_urls } = product;
  const images = image_urls && image_urls.length > 0 ? image_urls : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.25, 1));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    handleResetZoom();
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    handleResetZoom();
  };

  // Tải ảnh mẫu thiết kế
  const handleDownloadImage = async (e, url) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${name.replace(/\s+/g, '_')}_mau_anh.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback nếu bị block CORS
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `${name.replace(/\s+/g, '_')}_mau_anh.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Drag handlers cho ảnh khi đã zoom
  const handleMouseDown = (e) => {
    if (zoomScale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomScale === 1) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      {/* Product Detail Modal */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-fadeIn"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-luxury-bg w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-red-950/20"
        >
          
          {/* Header Navigation */}
          <div className="sticky top-0 z-10 bg-luxury-navy text-white px-4 py-3 flex items-center border-b border-red-950/50 shadow-sm">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm tracking-wide">CHI TIẾT MẪU THIẾT KẾ</span>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto">
            
            {/* Main Product Image Section */}
            <div className="relative bg-slate-950 h-80 sm:h-96 flex items-center justify-center overflow-hidden group">
              <img
                src={images[activeImageIndex]}
                alt={name}
                onClick={() => {
                  setIsLightboxOpen(true);
                  handleResetZoom();
                }}
                className="w-full h-full object-cover cursor-zoom-in transition-all duration-300 hover:opacity-90"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center transition-colors shadow-lg z-10"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center transition-colors shadow-lg z-10"
                    title="Ảnh tiếp theo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === activeImageIndex ? 'bg-amber-400 w-6' : 'bg-white/50 hover:bg-white'
                    }`}
                  />
                ))}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-row flex-nowrap items-center gap-1.5 max-w-[90%] overflow-hidden">
                {categories && categories.slice(0, 2).map((cat, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-luxury-navy/90 backdrop-blur-md text-white text-[11px] font-semibold rounded-full shadow border border-red-900/30 whitespace-nowrap">
                    {cat}
                  </span>
                ))}
                <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 text-[11px] font-bold rounded-full shadow whitespace-nowrap">
                  {target_gender}
                </span>
              </div>

              {/* Lightbox Trigger Hint */}
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[10px] sm:text-xs flex items-center space-x-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Nhấn để xem phóng to</span>
              </div>
            </div>

            {/* Product Meta details */}
            <div className="p-5 sm:p-6 space-y-6">
              
              <div className="space-y-2 border-b border-red-900/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-luxury-dark">{name}</h2>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Ước tính giá công may:</span>
                  <span className="text-lg sm:text-xl font-bold text-emerald-600">{price_estimate}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả thiết kế</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-light">{description}</p>
              </div>

              {/* Key Features */}
              {design_details && Object.keys(design_details).length > 0 && (
                <div className="bg-white p-4.5 rounded-2xl border border-red-950/5 shadow-sm space-y-3">
                  <h3 className="pt-4 pl-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Chi tiết thiết kế may đo
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-xs px-4 pb-4">
                    {Object.entries(design_details).map(([key, val]) => (
                      <div key={key} className="flex items-start justify-between border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                        <span className="font-medium text-slate-500">{key}:</span>
                        <span className="font-semibold text-slate-800 text-right pl-4">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Fabrics */}
              {fabric_recommendations && fabric_recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chất liệu khuyên dùng</h3>
                  <div className="flex flex-wrap gap-2">
                    {fabric_recommendations.map((fabric, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/50 text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                        {fabric}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Footer (Only AI Consult button, NO Book Appointment button) */}
          <div className="sticky bottom-0 bg-white p-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onConsult(product);
                onClose();
              }}
              className="w-full py-3.5 bg-luxury-navy hover:bg-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-red-900/20 transition-all flex items-center justify-center space-x-2.5 text-sm"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>TƯ VẤN AI QUA TRỢ LÝ ẢO</span>
            </button>
          </div>

        </div>
      </div>

      {/* Lightbox Viewer (Full Screen Image Zoom & Download) */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fadeIn select-none">
          
          {/* Lightbox Controls Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 text-white z-10 bg-gradient-to-b from-black/80 to-transparent w-full">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-3">
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <span className="text-xs sm:text-sm font-semibold truncate">{name}</span>
            </div>
            
            {/* Toolbar Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 3}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                title="Phóng to"
              >
                <ZoomIn className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-[10px] sm:text-xs font-semibold flex-shrink-0"
                title="Đặt lại"
              >
                100%
              </button>
              <button
                onClick={(e) => handleDownloadImage(e, images[activeImageIndex])}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
                title="Tải ảnh mẫu"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable Image Area */}
          <div 
            className="flex-1 overflow-hidden relative flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              className="max-w-full max-h-full flex items-center justify-center"
            >
              <img
                src={images[activeImageIndex]}
                alt={name}
                draggable="false"
                className="max-w-[90vw] max-h-[80vh] object-contain pointer-events-none select-none shadow-2xl"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20"
                  title="Ảnh trước"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20"
                  title="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
          
          {/* Zoom Instruction Footer */}
          <div className="p-4 text-center text-xs text-slate-400 z-10 bg-gradient-to-t from-black/60 to-transparent">
            {zoomScale > 1 ? (
              <span>Kéo rê chuột hoặc ngón tay để di chuyển ảnh</span>
            ) : (
              <span>Nhấn đúp hoặc dùng nút thu phóng để xem chi tiết mẫu vải</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
