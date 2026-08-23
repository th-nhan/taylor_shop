import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Chatbox from './components/Chatbox';
import AuthModal from './components/AuthModal';
import ProductDetailModal from './components/ProductDetailModal';
import Dashboard from './components/Dashboard';
import { getProducts, getCategories } from './api';
import { Sparkles, ShieldCheck, Ruler, Clock, Filter, RefreshCw } from 'lucide-react';

const GENDERS = ['Cả nam lẫn nữ', 'Nam', 'Nữ'];

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tất cả', 'Đầm', 'Quần tây', 'Đồ bộ', 'Sơ mi']);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [prefillProduct, setPrefillProduct] = useState(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [selectedGender, setSelectedGender] = useState('Cả nam lẫn nữ');
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('currentView');
    return savedView || 'home';
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  const filteredProducts = products
    .filter((product) => {
      if (selectedGender === 'Cả nam lẫn nữ') return true;
      return product.target_gender === selectedGender;
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });

  const loadProducts = async (cat) => {
    setLoading(true);
    try {
      const data = await getProducts(cat);
      setProducts(data);
      const cats = await getCategories();
      setCategories(['Tất cả', ...cats]);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'home') {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory, currentView]);

  useEffect(() => {
    if (currentView === 'dashboard' && (!currentUser || currentUser.role !== 'admin')) {
      setCurrentView('home');
    }
  }, [currentUser, currentView]);

  const handleSelectForConsult = (product) => {
    setPrefillProduct(product);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentView');
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-10">

        {currentView === 'dashboard' ? (
          <Dashboard />
        ) : (
          <>
            {/* Banner Hero Section */}
            <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-luxury-navy via-indigo-950 to-slate-900 text-white p-6 sm:p-12 shadow-2xl border border-indigo-900/40">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Tiệm May Đo Thiết Kế Tận Tâm</span>
            </div>

            <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Tôn Vinh Vóc Dáng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                Qua Mỗi Đường Kim
              </span>
            </h2>

            <p className="text-xs sm:text-base text-slate-300 font-light leading-relaxed">
              Nhà May Thúy Diễm chuyên tư vấn kiểu dáng, chọn vải chuẩn phom và may đo theo số đo độc quyền cho từng khách hàng. Hỗ trợ trợ lý ảo gợi ý mẫu mã phù hợp 24/7.
            </p>

            {/* Commitments Bar */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs border-t border-indigo-800/60 text-slate-300">
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Chuẩn số đo 100%</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Bảo hành may lại</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Đồ may hoàn thành đúng hẹn</span>
              </div>
            </div>
          </div>

          {/* Subtle Background Glow */}
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Catalog Section */}
        <section className="space-y-6">

          {/* Section Header & Category Filters */}
          <div className="flex flex-col space-y-4 border-b border-slate-200 pb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Bộ Sưu Tập Mẫu Đồ
                  <span className="text-xs font-normal text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                    {filteredProducts.length} mẫu
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Chọn danh mục và giới tính để xem chi tiết kiểu dáng & báo giá may ước tính
                </p>
              </div>

              {/* Gender Filter Buttons */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
                {GENDERS.map((gender) => {
                  const isActive = selectedGender === gender;
                  return (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap border ${
                        isActive
                          ? 'bg-luxury-navy text-white border-transparent shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {gender}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1" />
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${isActive
                        ? 'bg-luxury-navy text-white shadow-md shadow-red-950/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-luxury-indigo" />
              <p className="text-sm font-medium">Đang tải danh sách mẫu may...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <p className="text-base font-semibold text-slate-700">Chưa có mẫu nào trong danh mục này</p>
              <p className="text-xs text-slate-500">Bạn có thể nhắn tin cho Trợ lý AI ở góc phải để yêu cầu thiết kế riêng!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectForConsult={(prod) => setSelectedDetailProduct(prod)}
                />
              ))}
            </div>
          )}

        </section>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-slate-300">NHÀ MAY THÚY DIỄM © 2026 - May Đo & Tư Vấn Kiểu Dáng Chuyên Nghiệp</p>
          <p className="text-slate-500">Địa chỉ: 676, đường 3 bông, xã Phước Lý, tỉnh Tây Ninh • Hotline: 0901.370.622</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          } else {
            localStorage.removeItem('currentUser');
          }
          if (user && user.role === 'admin') {
            setCurrentView('dashboard');
          }
        }}
      />

      {/* AI Chatbox Widget */}
      <Chatbox
        currentUser={currentUser}
        prefillMessage={prefillProduct}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onConsult={handleSelectForConsult}
      />

    </div>
  );
}
