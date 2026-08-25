import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, Sparkles, MessageSquare, Phone, Download, ZoomIn, ZoomOut, 
  X, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Ruler, Clock, 
  Share2, Check, Tag, Eye
} from 'lucide-react';
import { formatImageUrl } from '../api';
import ProductCard from './ProductCard';

export default function ProductDetailPage({ product, allProducts = [], onBack, onSelectProduct, onConsult }) {
  if (!product) return null;

  const { 
    id, 
    name, 
    categories = [], 
    target_gender = 'Cả nam lẫn nữ', 
    price_estimate = 'Liên hệ báo giá', 
    description = '', 
    design_details = {}, 
    fabric_recommendations = [], 
    image_urls = [], 
    is_pinned = false 
  } = product;

  const rawImages = image_urls && image_urls.length > 0 
    ? image_urls 
    : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80'];
  const images = rawImages.map(img => formatImageUrl(img));

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  // Gallery swipe tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  // Lightbox touch tracking
  const lbTouchStartX = useRef(0);
  const lbTouchStartY = useRef(0);
  const lbTouchEndX = useRef(0);
  const lbTouchEndY = useRef(0);

  // Lock body scroll when Lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.5, 1));
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

  // Gallery Touch Swipe Handlers (on mobile showcase)
  const handleGalleryTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleGalleryTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleGalleryTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = Math.abs(touchStartY.current - touchEndY.current);
    
    // Swipe left (next) or swipe right (prev) if horizontal movement is significant
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
  };

  // Lightbox Touch Handlers
  const handleLbTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      lbTouchStartX.current = touch.clientX;
      lbTouchStartY.current = touch.clientY;
      lbTouchEndX.current = touch.clientX;
      lbTouchEndY.current = touch.clientY;

      if (zoomScale > 1) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
      }
    }
  };

  const handleLbTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      lbTouchEndX.current = touch.clientX;
      lbTouchEndY.current = touch.clientY;

      if (zoomScale > 1 && isDragging) {
        setPanOffset({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y
        });
      }
    }
  };

  const handleLbTouchEnd = () => {
    if (zoomScale > 1) {
      setIsDragging(false);
    } else {
      const diffX = lbTouchStartX.current - lbTouchEndX.current;
      const diffY = lbTouchStartY.current - lbTouchEndY.current;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          handleNextImage();
        } else {
          handlePrevImage();
        }
      } else if (diffY < -70 && Math.abs(diffY) > Math.abs(diffX)) {
        // Swipe down to close
        setIsLightboxOpen(false);
      }
    }
  };

  // Tải ảnh mẫu thiết kế
  const handleDownloadImage = async (e, url) => {
    if (e) e.stopPropagation();
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
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `${name.replace(/\s+/g, '_')}_mau_anh.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Drag handlers cho chuột trên desktop khi lightbox đã zoom
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

  // Filter valid design details
  const validDetails = design_details
    ? Object.entries(design_details).filter(([_, val]) => val !== null && val !== undefined && String(val).trim() !== '')
    : [];

  const validFabrics = fabric_recommendations
    ? fabric_recommendations.filter(f => f && String(f).trim() !== '')
    : [];

  // Related products
  const relatedProducts = allProducts
    .filter(p => p.id !== id && (
      (p.categories && categories && p.categories.some(c => categories.includes(c))) ||
      p.target_gender === target_gender
    ))
    .slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 font-medium truncate max-w-md">
            <span 
              onClick={onBack} 
              className="hover:text-luxury-navy cursor-pointer transition-colors"
            >
              Bộ Sưu Tập
            </span>
            <span>/</span>
            {categories.length > 0 && (
              <>
                <span className="text-slate-600">{categories[0]}</span>
                <span>/</span>
              </>
            )}
            <span className="text-slate-900 font-bold truncate">{name}</span>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium transition-colors"
            title="Sao chép liên kết"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
          </button>

          <button
            onClick={(e) => handleDownloadImage(e, images[activeImageIndex])}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium transition-colors"
            title="Tải ảnh mẫu thiết kế"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Tải ảnh</span>
          </button>
        </div>
      </div>

      {/* Main Detail Content (2 Columns Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Image Gallery (lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Showcase Image Container */}
          <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-md">
            <div 
              onTouchStart={handleGalleryTouchStart}
              onTouchMove={handleGalleryTouchMove}
              onTouchEnd={handleGalleryTouchEnd}
              className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[4/4.5] flex items-center justify-center group shadow-inner touch-pan-y"
            >
              
              <img
                src={images[activeImageIndex]}
                alt={name}
                onClick={() => {
                  setIsLightboxOpen(true);
                  handleResetZoom();
                }}
                className="w-full h-full object-cover sm:object-contain object-center cursor-zoom-in transition-all duration-300 select-none"
              />

              {/* Prev / Next Image Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-lg z-10 hover:scale-105 active:scale-95"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-lg z-10 hover:scale-105 active:scale-95"
                    title="Ảnh tiếp theo"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Badges on Top-Left */}
              <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 max-w-[90%] z-10 pointer-events-none">
                {is_pinned && (
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[11px] sm:text-xs font-extrabold uppercase rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Nổi Bật</span>
                  </span>
                )}
                {categories.map((cat, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-luxury-navy/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold rounded-full shadow border border-indigo-900/30">
                    {cat}
                  </span>
                ))}
                <span className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 text-[11px] sm:text-xs font-bold rounded-full shadow">
                  {target_gender}
                </span>
              </div>

              {/* Lightbox Trigger Hint */}
              <div 
                onClick={() => {
                  setIsLightboxOpen(true);
                  handleResetZoom();
                }}
                className="absolute bottom-3.5 right-3.5 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs flex items-center space-x-1.5 sm:space-x-2 cursor-pointer hover:bg-slate-900 transition-colors shadow-lg"
              >
                <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span>Phóng to</span>
              </div>

              {/* Pagination Indicator / Swipe Hint on Mobile */}
              {images.length > 1 && (
                <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-10 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-full pointer-events-none">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activeImageIndex ? 'bg-amber-400 w-5' : 'bg-white/50 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip (if multiple images) */}
            {images.length > 1 && (
              <div className="mt-3 sm:mt-4 flex items-center space-x-2.5 sm:space-x-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        isActive 
                          ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-md' 
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Product Specs & Actions (lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-md space-y-5 sm:space-y-6">
            
            {/* Header: Title & Gender */}
            <div className="space-y-2.5 border-b border-slate-100 pb-4 sm:pb-5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {categories.map((c, i) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 text-luxury-navy rounded-md">
                    {c}
                  </span>
                ))}
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-md">
                  Dành cho {target_gender.toLowerCase()}
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-amber-50/30 p-4 sm:p-5 rounded-2xl border border-emerald-200/60 shadow-sm space-y-1.5">
              <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Ước tính giá công may</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                {price_estimate}
              </div>
              <p className="text-[11px] text-slate-500 font-light">
                * Giá công may tham khảo tùy thuộc vào độ phức tạp của kiểu dáng và loại vải yêu cầu.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => onConsult(product)}
                className="w-full py-3.5 sm:py-4 bg-luxury-navy hover:bg-indigo-950 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-indigo-950/20 transition-all flex items-center justify-center space-x-2.5 text-sm group"
              >
                <MessageSquare className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>TƯ VẤN VỚI TRỢ LÝ ẢO</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://zalo.me/0901370622"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-[#0068FF] hover:bg-[#0054cc] text-white font-bold rounded-2xl shadow-md hover:shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm text-center"
                >
                  <Phone className="w-4 h-4 text-white" />
                  <span>LIÊN HỆ ZALO</span>
                </a>

                <a
                  href="tel:0901370622"
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl border border-slate-200 transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm text-center"
                >
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>GỌI HOTLINE</span>
                </a>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-luxury-indigo" />
                  <span>Mô tả kiểu dáng thiết kế</span>
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-light whitespace-pre-line bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {description}
                </p>
              </div>
            )}

            {/* Design Details Table */}
            {validDetails.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Thông số & Chi tiết may đo</span>
                </h3>
                
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                  {validDetails.map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                      <span className="font-medium text-slate-500">{key}</span>
                      <span className="font-semibold text-slate-900 text-right pl-4">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Fabrics */}
            {validFabrics.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chất liệu vải gợi ý phù hợp
                </h3>
                <div className="flex flex-wrap gap-2">
                  {validFabrics.map((fabric, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200/80 text-xs font-medium shadow-sm"
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

      </div>

      {/* Value Commitments Bar (Positioned below Specs on mobile, and full-width below the 2-column grid on desktop) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-indigo-900/50 shadow-md">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3.5 sm:mb-4">Cam kết dịch vụ tại Nhà May Thúy Diễm</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
              <Ruler className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">May Đo Chuẩn Phom</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Theo đúng tỷ lệ và vóc dáng riêng của từng khách hàng</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Bảo Hành Chỉnh Sửa</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Miễn phí sửa lại phom dáng nếu khách hàng chưa vừa vặn</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Giao Đúng Hẹn</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Đảm bảo hoàn thành đúng thời gian thỏa thuận</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related / Similar Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Mẫu Thiết Kế Gợi Ý Khác</h3>
              <p className="text-xs text-slate-500 mt-0.5">Khám phá thêm các thiết kế cùng phong cách và danh mục</p>
            </div>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-luxury-indigo hover:text-indigo-950 underline transition-colors"
            >
              Xem tất cả mẫu →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectForConsult={(selected) => {
                  onSelectProduct(selected);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Full-Screen Lightbox Viewer: Mounted via Portal on document.body to bypass any parent space-y/margins */}
      {isLightboxOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-[100dvh] z-[99999] bg-black flex flex-col select-none overflow-hidden !m-0 !mt-0 !mb-0 !p-0"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0, zIndex: 99999 }}
        >
          
          {/* Lightbox Controls Header (Solid Background, 100% Opaque, 0 Margins) */}
          <div className="flex items-center justify-between px-3 py-2.5 sm:px-5 sm:py-3.5 text-white bg-slate-950 border-b border-slate-800/80 w-full z-20 flex-shrink-0 shadow-md !m-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
                title="Đóng xem ảnh"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <span className="text-xs sm:text-sm font-semibold truncate text-slate-200">{name}</span>
            </div>
            
            {/* Toolbar Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 3.5}
                className="p-1.5 sm:p-2 hover:bg-slate-800 active:bg-slate-700 rounded-full transition-colors flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="p-1.5 sm:p-2 hover:bg-slate-800 active:bg-slate-700 rounded-full transition-colors flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors text-[10px] sm:text-xs font-semibold text-amber-400 flex-shrink-0"
                title="Đặt lại kích thước"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                onClick={(e) => handleDownloadImage(e, images[activeImageIndex])}
                className="p-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-full transition-colors flex items-center justify-center flex-shrink-0 shadow"
                title="Tải ảnh mẫu"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable Image Area with Touch Swipe Support */}
          <div 
            className="flex-1 w-full h-full overflow-hidden relative flex items-center justify-center bg-black cursor-grab active:cursor-grabbing touch-none !m-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleLbTouchStart}
            onTouchMove={handleLbTouchMove}
            onTouchEnd={handleLbTouchEnd}
          >
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              className="w-full h-full flex items-center justify-center p-2 sm:p-4"
            >
              <img
                src={images[activeImageIndex]}
                alt={name}
                draggable="false"
                className="max-w-full max-h-[82vh] object-contain pointer-events-none select-none drop-shadow-2xl"
              />
            </div>

            {/* Next / Prev Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all z-20 shadow-xl"
                  title="Ảnh trước"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all z-20 shadow-xl"
                  title="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </>
            )}
          </div>
          
          {/* Zoom & Swipe Instruction Footer (Solid Dark Background, 0 Margins) */}
          <div className="p-3 sm:p-3.5 text-center text-[11px] sm:text-xs text-slate-300 bg-slate-950 border-t border-slate-800/80 z-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 !m-0">
            <div className="text-amber-400 font-medium">
              {activeImageIndex + 1} / {images.length}
            </div>
            <div>
              {zoomScale > 1 ? (
                <span>Kéo rê để di chuyển chi tiết ảnh</span>
              ) : (
                <span>Lướt ngang để chuyển ảnh • Vuốt xuống để đóng</span>
              )}
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="text-slate-400 hover:text-white underline text-[11px] sm:text-xs"
            >
              Đóng
            </button>
          </div>

        </div>,
        document.body
      )}

    </div>
  );
}
