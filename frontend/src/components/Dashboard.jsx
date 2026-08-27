import React, { useState, useEffect, useMemo } from 'react';
import { 
  getUsers, deleteUser, 
  getProducts, createProduct, updateProduct, deleteProduct,
  uploadImages, formatImageUrl, getCategories
} from '../api';
import { 
  User, Package, Plus, Trash2, Edit2, X, Check, 
  RefreshCw, AlertCircle, Phone, Calendar, Shirt, Info, DollarSign, Image as ImageIcon, Pin,
  Sparkles, Search, ChevronDown, ChevronUp, Users, Eye, PhoneCall
} from 'lucide-react';

export const DESIGN_GROUPS = [
  {
    id: 'form_silhouette',
    title: '1. Phom dáng & Độ dài (Silhouette & Length)',
    subtitle: 'Đặc điểm dáng áo/đầm/quần, độ ôm và độ dài mẫu',
    icon: Sparkles,
    fields: [
      { key: 'Phom dáng (Form/Fit)', placeholder: 'VD: Suông rộng (Oversize), Ôm nhẹ tôn dáng, Dáng chữ A, Dáng suông đứng, Dáng bút chì...' },
      { key: 'Độ dài trang phục', placeholder: 'VD: Ngang hông, Qua gối, Dài bắp chân (Midi), Dài chạm mắt cá (Maxi), Chạm gót...' },
      { key: 'Tùng váy / Độ xòe (nếu có)', placeholder: 'VD: Xòe xếp ly bồng, Xòe chữ A nhẹ, Tùng rủ mềm mại, Đuôi cá xẻ tà, Dáng ôm suông...' },
      { key: 'Ống quần (đối với quần/đồ bộ)', placeholder: 'VD: Ống suông rộng (Wide leg), Ống đứng (Straight), Ống loe nhẹ, Ống côn (Slim)...' }
    ]
  },
  {
    id: 'collar_shoulder',
    title: '2. Chi tiết Cổ áo, Ve áo & Vai',
    subtitle: 'Kiểu cổ, ve áo, độ khoét và phom vai',
    icon: Shirt,
    fields: [
      { key: 'Kiểu cổ áo', placeholder: 'VD: Cổ tròn basic, Cổ tim / Cổ V khoét nhẹ, Cổ vuông Pháp, Cổ bẻ Danton, Cổ Tàu, Cổ thắt nơ...' },
      { key: 'Đặc điểm vai', placeholder: 'VD: Vai thường, Vai bồng nhẹ, Có đệm mút đứng phom, Vai rớt / Trễ vai, Vai raglan...' },
      { key: 'Đường nẹp / Ve áo', placeholder: 'VD: Nẹp giấu nút, Ve lật cổ vest chữ K, Nẹp bọc vải viền lé, Cổ phối viền ren...' }
    ]
  },
  {
    id: 'sleeves_cuffs',
    title: '3. Chi tiết Tay áo & Cửa tay',
    subtitle: 'Dáng tay, độ dài tay và kiểu bo gấu',
    icon: Shirt,
    fields: [
      { key: 'Kiểu tay áo', placeholder: 'VD: Tay lỡ thanh lịch, Tay ngắn, Tay dài, Tay bồng/phồng, Tay cánh tiên, Sát nách / Ba lỗ, Tay loe...' },
      { key: 'Cửa tay (Cổ tay)', placeholder: 'VD: Măng sét cài nút, Bo thun nhún co giãn, Cửa tay xẻ giọt nước, Gấu lật viền lai...' }
    ]
  },
  {
    id: 'closure_waist_pockets',
    title: '4. Khóa kéo, Cài nút, Cạp lưng & Túi',
    subtitle: 'Vị trí tra khóa, nút áo, chi tiết lưng và túi',
    icon: Info,
    fields: [
      { key: 'Khóa kéo / Cài nút', placeholder: 'VD: Khóa kéo giọt nước ẩn sau lưng, Khóa kéo hông, Hàng nút bọc vải thủ công, Nút xà cừ...' },
      { key: 'Lưng / Cạp quần & váy', placeholder: 'VD: Cạp cao bản 4cm tôn eo, Lưng trước phẳng - sau luồn thun co giãn, Lưng liền phối đai...' },
      { key: 'Kiểu túi', placeholder: 'VD: 2 túi xéo sườn ẩn tiện lợi, Túi mổ có nắp giả, Túi ốp nổi trước ngực, Không túi...' }
    ]
  },
  {
    id: 'craft_accents',
    title: '5. Kỹ thuật May, Lớp lót & Điểm nhấn Thủ công',
    subtitle: 'Đường may lộn giấu chỉ, lót trong, xếp ly, đính kết...',
    icon: Sparkles,
    fields: [
      { key: 'Lớp lót & Kỹ thuật may', placeholder: 'VD: May 2 lớp lót lụa Habutai mềm mát, May 1 lớp nhẹ mát, Kỹ thuật cuốn biên giấu chỉ cao cấp...' },
      { key: 'Đường may & Điểm nhấn trang trí', placeholder: 'VD: Xếp ly ngực tinh xảo, Dập ly thân áo/chân váy, Bèo nhún tiểu thư, Rút nhún hạ eo, Xẻ tà hông...' },
      { key: 'Chi tiết thủ công (nếu có)', placeholder: 'VD: Đính cúc bọc thủ công cùng màu, Thêu hoa thủ công, Kết cườm viền cổ, Nơ thắt trang trí...' }
    ]
  }
];

export const INITIAL_DESIGN_DETAILS = {};
DESIGN_GROUPS.forEach(group => {
  group.fields.forEach(field => {
    INITIAL_DESIGN_DETAILS[field.key] = '';
  });
});

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('products'); // 'users' or 'products'
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('ALL'); // 'ALL', 'PINNED', or category string

  // Product Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categories: [],
    target_gender: 'Nữ',
    price_estimate: '',
    description: '',
    design_details: { ...INITIAL_DESIGN_DETAILS },
    fabric_recommendations: '',
    image_urls: '',
    is_pinned: false
  });

  // Modal Accordion State for Design Groups
  const [expandedGroups, setExpandedGroups] = useState({
    form_silhouette: true,
    collar_shoulder: false,
    sleeves_cuffs: false,
    closure_waist_pockets: false,
    craft_accents: false
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all key data in parallel for comprehensive overview metrics
      const [userData, productData, catData] = await Promise.all([
        getUsers().catch(() => []),
        getProducts().catch(() => []),
        getCategories().catch(() => [])
      ]);
      setUsers(userData);
      setProducts(productData);
      setCategories(catData);
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsFormOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isFormOpen]);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName || 'khách hàng'}" không?`)) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Không thể xóa tài khoản!');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mẫu sản phẩm "${productName || 'này'}" không?`)) return;
    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert('Không thể xóa mẫu sản phẩm!');
    }
  };

  const handleTogglePin = async (product) => {
    try {
      const updatedProduct = {
        ...product,
        is_pinned: !product.is_pinned
      };
      await updateProduct(product.id, updatedProduct);
      setProducts(products.map(p => p.id === product.id ? { ...p, is_pinned: !p.is_pinned } : p));
    } catch (err) {
      alert('Không thể cập nhật trạng thái ghim!');
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setNewCategoryName('');
    setFormData({
      name: '',
      categories: categories.length > 0 ? [categories[0]] : ['Đầm'],
      target_gender: 'Nữ',
      price_estimate: '',
      description: '',
      design_details: { ...INITIAL_DESIGN_DETAILS },
      fabric_recommendations: '',
      image_urls: '',
      is_pinned: false
    });
    setExpandedGroups({
      form_silhouette: true,
      collar_shoulder: false,
      sleeves_cuffs: false,
      closure_waist_pockets: false,
      craft_accents: false
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setNewCategoryName('');

    const mergedDetails = { ...INITIAL_DESIGN_DETAILS };
    if (product.design_details) {
      if (product.design_details['Phom dáng'] && !product.design_details['Phom dáng (Fit)']) {
        mergedDetails['Phom dáng (Fit)'] = product.design_details['Phom dáng'];
      }
      if (product.design_details['Kiểu cổ'] && !product.design_details['Kiểu cổ áo']) {
        mergedDetails['Kiểu cổ áo'] = product.design_details['Kiểu cổ'];
      }
      if (product.design_details['Tay áo'] && !product.design_details['Kiểu tay áo']) {
        mergedDetails['Kiểu tay áo'] = product.design_details['Tay áo'];
      }
      if (product.design_details['Khóa kéo'] && !product.design_details['Khóa / Nút cài']) {
        mergedDetails['Khóa / Nút cài'] = product.design_details['Khóa kéo'];
      }
      Object.assign(mergedDetails, product.design_details);
    }

    setFormData({
      name: product.name || '',
      categories: product.categories || [],
      target_gender: product.target_gender || 'Nữ',
      price_estimate: product.price_estimate || '',
      description: product.description || '',
      design_details: mergedDetails,
      fabric_recommendations: product.fabric_recommendations ? product.fabric_recommendations.join(', ') : '',
      image_urls: product.image_urls ? product.image_urls.join(', ') : '',
      is_pinned: product.is_pinned || false
    });
    setExpandedGroups({
      form_silhouette: true,
      collar_shoulder: true,
      sleeves_cuffs: false,
      closure_waist_pockets: false,
      craft_accents: false
    });
    setIsFormOpen(true);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const result = await uploadImages(files);
      const newUrls = (result && result.urls) ? result.urls : (result && result.url ? [result.url] : []);
      if (newUrls.length > 0) {
        const currentUrls = formData.image_urls 
          ? formData.image_urls.split(',').map(item => item.trim()).filter(Boolean) 
          : [];
        const combinedUrls = [...currentUrls, ...newUrls];
        setFormData({ ...formData, image_urls: combinedUrls.join(', ') });
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tải ảnh lên. Vui lòng kiểm tra lại backend!');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
    }
    if (!formData.categories.includes(trimmed)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, trimmed]
      });
    }
    setNewCategoryName('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categories || formData.categories.length === 0) {
      alert('Vui lòng chọn ít nhất một danh mục!');
      return;
    }
    try {
      const processedData = {
        ...formData,
        fabric_recommendations: formData.fabric_recommendations
          ? formData.fabric_recommendations.split(',').map(item => item.trim()).filter(Boolean)
          : [],
        image_urls: formData.image_urls
          ? formData.image_urls.split(',').map(item => item.trim()).filter(Boolean)
          : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80']
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, processedData);
      } else {
        await createProduct(processedData);
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      alert('Đã xảy ra lỗi khi lưu thông tin sản phẩm!');
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedFilterCategory === 'PINNED' && !p.is_pinned) return false;
      if (selectedFilterCategory !== 'ALL' && selectedFilterCategory !== 'PINNED') {
        if (!p.categories || !p.categories.includes(selectedFilterCategory)) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchPrice = (p.price_estimate || '').toLowerCase().includes(q);
        const matchGender = (p.target_gender || '').toLowerCase().includes(q);
        const matchCat = (p.categories || []).some(c => c.toLowerCase().includes(q));
        return matchName || matchPrice || matchGender || matchCat;
      }
      return true;
    });
  }, [products, selectedFilterCategory, searchQuery]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.full_name || '').toLowerCase().includes(q);
        const matchPhone = (u.phone || '').toLowerCase().includes(q);
        return matchName || matchPhone;
      }
      return true;
    });
  }, [users, searchQuery]);

  const pinnedCount = useMemo(() => products.filter(p => p.is_pinned).length, [products]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      
      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION (Desktop) & TOP BAR (Mobile) */}
      {/* ========================================================================= */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-3 sm:p-5 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-3 sm:space-y-6">
          
          {/* Admin Header Info */}
          <div className="flex items-center justify-between md:block px-1">
            <div>
              <h4 className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest">
                Quản Trị Hệ Thống
              </h4>
              <p className="text-[10px] text-slate-400 hidden md:block mt-0.5">Nhà May Thúy Diễm Admin Panel</p>
            </div>
            <span className="md:hidden text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              Admin v1.0
            </span>
          </div>

          {/* Navigation Tabs (Segmented bar on mobile, vertical list on desktop) */}
          <nav className="grid grid-cols-2 md:grid-cols-1 gap-1.5 p-1 bg-slate-950/60 md:bg-transparent rounded-xl border border-slate-800 md:border-none">
            <button
              onClick={() => {
                setActiveTab('products');
                setSearchQuery('');
              }}
              className={`flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'products' 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Mẫu May</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-auto hidden md:inline-block ${
                activeTab === 'products' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('users');
                setSearchQuery('');
              }}
              className={`flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'users' 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Khách Hàng</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-auto hidden md:inline-block ${
                activeTab === 'users' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {users.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer info (Desktop only) */}
        <div className="hidden md:block pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          Nhà May Thúy Diễm Admin Panel v1.0
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 flex flex-col bg-slate-50 min-w-0">
        
        {/* Top Header Row & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900">
                {activeTab === 'users' ? 'Quản lý Tài Khoản' : 'Danh Sách Mẫu May'}
              </h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-full">
                {activeTab === 'users' ? filteredUsers.length : filteredProducts.length}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {activeTab === 'users' 
                ? 'Xem danh sách và quản lý thông tin khách hàng đã đăng ký.'
                : 'Thêm mới, chỉnh sửa chi tiết may đo hoặc xóa các mẫu thiết kế.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-150 shadow-sm flex items-center gap-1.5 text-xs font-semibold"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {activeTab === 'products' && (
              <button
                onClick={handleOpenCreate}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all duration-200"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Thêm Mẫu Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Cards (Mobile & Desktop) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Tổng Mẫu</span>
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-900 mt-1">{products.length}</p>
          </div>

          <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Ghim Nổi Bật</span>
              <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-base sm:text-2xl font-black text-amber-600 mt-1">{pinnedCount}</p>
          </div>

          <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Khách Hàng</span>
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-900 mt-1">{users.length}</p>
          </div>
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="space-y-2.5 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'products' ? 'Tìm theo tên mẫu, phân loại, giá...' : 'Tìm khách hàng theo tên, số điện thoại...'}
              className="w-full pl-9 pr-8 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 shadow-xs placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills (Only for Products Tab) */}
          {activeTab === 'products' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedFilterCategory('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap text-xs ${
                  selectedFilterCategory === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất cả ({products.length})
              </button>

              <button
                onClick={() => setSelectedFilterCategory('PINNED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap text-xs flex items-center gap-1 ${
                  selectedFilterCategory === 'PINNED'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <Pin className="w-3 h-3 fill-current" />
                <span>Đã ghim ({pinnedCount})</span>
              </button>

              {categories.map((cat) => {
                const count = products.filter(p => p.categories && p.categories.includes(cat)).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilterCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap text-xs ${
                      selectedFilterCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <p className="text-xs sm:text-sm font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="flex-1">

            {/* ========================================================================= */}
            {/* USERS MANAGEMENT TAB */}
            {/* ========================================================================= */}
            {activeTab === 'users' && (
              <div>
                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Khách hàng</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Số điện thoại</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Ngày tham gia</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-slate-700 text-sm">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-12 text-slate-400">
                            Không tìm thấy tài khoản nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 font-bold flex items-center justify-center text-xs">
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="font-semibold text-slate-900">{user.full_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <a href={`tel:${user.phone}`} className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-amber-600 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{user.phone}</span>
                              </a>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                              <div className="flex items-center space-x-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Touch Cards */}
                <div className="md:hidden space-y-2.5">
                  {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                      Không tìm thấy tài khoản nào phù hợp.
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">{user.full_name}</h4>
                              <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>Tham gia: {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Phone action bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <a
                            href={`tel:${user.phone}`}
                            className="inline-flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Gọi {user.phone}</span>
                          </a>

                          <span className="text-[10px] text-slate-400 font-medium">Khách hàng thành viên</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PRODUCTS MANAGEMENT TAB */}
            {/* ========================================================================= */}
            {activeTab === 'products' && (
              <div>
                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Hình ảnh</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Tên mẫu thiết kế</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Phân loại</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Ước tính giá</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-slate-700 text-sm">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-slate-400">
                            Không tìm thấy mẫu sản phẩm nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <img 
                                src={formatImageUrl(product.image_urls?.[0]) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&auto=format&fit=crop&q=80'} 
                                alt={product.name} 
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&auto=format&fit=crop&q=80';
                                }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <div>
                                  <p className="font-semibold text-slate-900">{product.name}</p>
                                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-[10px] text-slate-600 rounded-full font-medium">
                                    Dành cho: {product.target_gender}
                                  </span>
                                </div>
                                {product.is_pinned && (
                                  <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-md flex items-center space-x-0.5 shadow-sm">
                                    <Pin className="w-2.5 h-2.5 fill-current" />
                                    <span>Đã ghim</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {product.categories && product.categories.map((cat, idx) => (
                                  <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100 uppercase">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-amber-600 font-bold">{product.price_estimate}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => handleTogglePin(product)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    product.is_pinned 
                                      ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 hover:text-amber-600' 
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                  }`}
                                  title={product.is_pinned ? "Bỏ ghim sản phẩm" : "Ghim lên đầu trang chủ"}
                                >
                                  <Pin className={`w-4 h-4 ${product.is_pinned ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(product)}
                                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Chỉnh sửa mẫu"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Xóa mẫu"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Tactile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                      Không tìm thấy mẫu sản phẩm nào phù hợp.
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
                          product.is_pinned ? 'border-amber-300 ring-1 ring-amber-400/30' : 'border-slate-200/90'
                        }`}
                      >
                        <div className="p-3.5 flex gap-3">
                          {/* Product Thumbnail */}
                          <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/80">
                            <img 
                              src={formatImageUrl(product.image_urls?.[0]) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80'} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80';
                              }}
                            />
                            {product.is_pinned && (
                              <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 p-1 rounded-md shadow-md">
                                <Pin className="w-3 h-3 fill-current" />
                              </div>
                            )}
                          </div>

                          {/* Info Column */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="font-bold text-slate-900 text-sm line-clamp-1 leading-snug">
                                  {product.name}
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">
                                  {product.target_gender}
                                </span>
                                {product.categories && product.categories.map((cat, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold border border-indigo-100/60 uppercase">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="mt-2">
                              <p className="text-xs text-slate-400 font-medium">Ước tính giá may:</p>
                              <p className="text-sm font-extrabold text-amber-600 leading-tight">
                                {product.price_estimate || 'Liên hệ báo giá'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Bar (Mobile Touch Friendly) */}
                        <div className="bg-slate-50/90 border-t border-slate-100 px-3 py-2 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleTogglePin(product)}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                              product.is_pinned
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Pin className={`w-3.5 h-3.5 ${product.is_pinned ? 'fill-current' : ''}`} />
                            <span>{product.is_pinned ? 'Đã ghim' : 'Ghim'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="flex-1 py-1.5 px-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="py-1.5 px-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/80 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
                            title="Xóa mẫu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* FORM MODAL (ADD / EDIT PRODUCT) - MOBILE & DESKTOP OPTIMIZED */}
      {/* ========================================================================= */}
      {isFormOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200"
          onClick={() => setIsFormOpen(false)}
        >
          <div 
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] border border-slate-800/20 flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-slate-900 text-white flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800">
              <h3 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="truncate">{editingProduct ? 'Chỉnh Sửa Mẫu Thiết Kế' : 'Thêm Mẫu May Mới'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Scrollable Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  
                  {/* Name */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Tên Mẫu May Thiết Kế <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="VD: Đầm Xòe Hoa Nhí Cổ V, Áo Dài Cách Tân..."
                    />
                  </div>

                  {/* Categories selection */}
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Danh mục sản phẩm <span className="text-red-500">*</span> (Chọn một hoặc nhiều)
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
                      {categories.map((cat) => {
                        const isChecked = formData.categories && formData.categories.includes(cat);
                        return (
                          <label key={cat} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors text-xs font-semibold ${
                            isChecked 
                              ? 'bg-amber-500/15 border-amber-500 text-amber-950 shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={isChecked}
                              onChange={() => {
                                const currentCats = formData.categories || [];
                                if (currentCats.includes(cat)) {
                                  setFormData({ ...formData, categories: currentCats.filter(c => c !== cat) });
                                } else {
                                  setFormData({ ...formData, categories: [...currentCats, cat] });
                                }
                              }}
                            />
                            {isChecked && <Check className="w-3 h-3 text-amber-600 stroke-[3]" />}
                            <span>{cat}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Add New Category Box */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                        placeholder="Nhập tên danh mục mới..."
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors whitespace-nowrap active:scale-95"
                      >
                        + Thêm
                      </button>
                    </div>
                  </div>

                  {/* Target Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Giới tính may đo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.target_gender}
                      onChange={(e) => setFormData({ ...formData, target_gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="Nữ">Nữ</option>
                      <option value="Nam">Nam</option>
                      <option value="Cả nam lẫn nữ">Cả nam lẫn nữ</option>
                    </select>
                  </div>

                  {/* Price Estimate */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Ước tính giá may <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.price_estimate}
                        onChange={(e) => setFormData({ ...formData, price_estimate: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                        placeholder="VD: 350.000đ - 450.000đ"
                      />
                    </div>
                  </div>

                  {/* Pinned toggle */}
                  <div className="col-span-1 sm:col-span-2 flex items-center space-x-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
                    <input
                      type="checkbox"
                      id="is_pinned"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="is_pinned" className="text-xs font-bold text-slate-800 uppercase cursor-pointer select-none">
                      Ghim mẫu may nổi bật lên đầu trang chủ
                    </label>
                  </div>

                  {/* Image Upload & Link */}
                  <div className="col-span-1 sm:col-span-2 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* File Upload */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tải ảnh từ điện thoại / máy tính</label>
                        <div className="relative flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-xl p-4 transition-colors bg-slate-50 cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-center space-y-1">
                            <Plus className="w-5 h-5 mx-auto text-amber-600" />
                            <span className="text-xs font-semibold text-slate-700 block">
                              {uploading ? 'Đang tải ảnh...' : 'Chọn một hoặc nhiều ảnh'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Image Link Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Hoặc nhập Link ảnh web</label>
                        <div className="relative">
                          <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={formData.image_urls}
                            onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
                            className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                            placeholder="VD: http://anh1.jpg, http://anh2.jpg"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Nhiều link cách nhau bằng dấu phẩy</p>
                      </div>
                    </div>

                    {/* Previews */}
                    {formData.image_urls && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">
                          Ảnh đã chọn ({formData.image_urls.split(',').map(u => u.trim()).filter(Boolean).length})
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {formData.image_urls.split(',').map((url, index) => {
                            const trimmedUrl = url.trim();
                            if (!trimmedUrl) return null;
                            return (
                              <div key={index} className="relative group w-16 h-16 sm:w-20 sm:h-20 border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                <img 
                                  src={formatImageUrl(trimmedUrl)} 
                                  alt={`Preview ${index}`} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = formData.image_urls.split(',').map(u => u.trim()).filter(Boolean);
                                    list.splice(index, 1);
                                    setFormData({ ...formData, image_urls: list.join(', ') });
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Mô tả kiểu dáng & Điểm nổi bật <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none"
                      placeholder="Mô tả phong cách, dịp phù hợp, phom dáng nổi bật..."
                    />
                  </div>

                  {/* Garment Design Characteristics Accordion */}
                  <div className="col-span-1 sm:col-span-2 border-t border-slate-200/80 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Thông Số & Đặc Điểm Thiết Kế May Đo
                        </span>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                          Chạm vào từng nhóm để điền chi tiết phom dáng, cổ, tay, khóa và kỹ thuật may.
                        </p>
                      </div>
                    </div>

                    {/* Accordion Groups */}
                    <div className="space-y-2 pt-1">
                      {DESIGN_GROUPS.map((group) => {
                        const GroupIcon = group.icon;
                        const isExpanded = !!expandedGroups[group.id];
                        
                        // Count filled fields in this group
                        const filledCount = group.fields.filter(f => (formData.design_details[f.key] || '').trim()).length;

                        return (
                          <div 
                            key={group.id} 
                            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                              isExpanded ? 'bg-white border-amber-300 shadow-xs' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleGroup(group.id)}
                              className="w-full px-3.5 py-3 flex items-center justify-between text-left gap-2"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isExpanded ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  <GroupIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-slate-900 truncate">{group.title}</h5>
                                  {group.subtitle && (
                                    <p className="text-[10px] text-slate-500 truncate hidden sm:block">{group.subtitle}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 flex-shrink-0">
                                {filledCount > 0 && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                                    {filledCount}/{group.fields.length}
                                  </span>
                                )}
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {group.fields.map((field) => (
                                  <div key={field.key}>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      {field.key}
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.design_details[field.key] || ''}
                                      onChange={(e) => {
                                        const newDetails = { ...formData.design_details };
                                        newDetails[field.key] = e.target.value;
                                        setFormData({ ...formData, design_details: newDetails });
                                      }}
                                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                                      placeholder={field.placeholder}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fabric Recommendations */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Loại vải đề xuất (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={formData.fabric_recommendations}
                      onChange={(e) => setFormData({ ...formData, fabric_recommendations: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      placeholder="VD: Lụa Satin, Lụa Mango, Tuyết mưa, Linen tưng..."
                    />
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex-shrink-0 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-end space-x-2.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3.5 sm:px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 sm:px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl font-extrabold text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all duration-200"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingProduct ? 'Lưu Thay Đổi' : 'Thêm Mẫu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
