import React, { useState, useEffect } from 'react';
import { 
  getUsers, deleteUser, 
  getProducts, createProduct, updateProduct, deleteProduct,
  uploadImage, getCategories
} from '../api';
import { 
  User, Package, Plus, Trash2, Edit2, X, Check, 
  RefreshCw, AlertCircle, Phone, Calendar, Shirt, Info, DollarSign, Image, Pin,
  Sparkles, Ruler
} from 'lucide-react';

export const DESIGN_GROUPS = [
  {
    id: 'style',
    title: '1. Chi tiết Kiểu dáng Thiết kế (Mẫu Catalog)',
    subtitle: 'Các đặc điểm form dáng, kiểu cổ, tay áo, cạp khóa...',
    icon: Sparkles,
    fields: [
      { key: 'Phom dáng (Fit)', placeholder: 'VD: Suông rộng (Oversize), Ôm vừa (Regular), Slimfit, Dáng chữ A...' },
      { key: 'Kiểu cổ áo', placeholder: 'VD: Cổ tròn, Cổ V, Cổ tim, Cổ vuông, Cổ bẻ Danton, Cổ Tàu, Cổ sen...' },
      { key: 'Kiểu tay áo', placeholder: 'VD: Tay ngắn, Tay lỡ, Tay dài, Tay bồng/phồng, Raglan, Cánh tiên, Sát nách...' },
      { key: 'Khóa / Nút cài', placeholder: 'VD: Khóa kéo giọt nước sau, Khóa kéo hông, Nút cài bọc vải trước ngực...' },
      { key: 'Túi áo / Túi quần', placeholder: 'VD: 2 túi xéo hông, Túi mổ có nắp, Túi ngực ốp ngoài, Không túi...' },
      { key: 'Lưng quần / Cạp váy', placeholder: 'VD: Lưng thun toàn bộ, Lưng trước phẳng - sau thun, Cạp cao bản 4cm...' },
      { key: 'Tùng váy / Độ dài', placeholder: 'VD: Xòe ly xếp, Xòe 360 độ, Bút chì xẻ sau, Đuôi cá, Midi, Maxi...' },
      { key: 'Đường nhấn & Trang trí', placeholder: 'VD: Xếp ly ngực, Bèo nhún vai, Đường chỉ diễu viền, Xẻ tà bên hông...' },
    ]
  },
  {
    id: 'upper',
    title: '2. Thông số Đo May Thân Trên (Áo, Sơ mi, Áo dài, Áo khoác)',
    subtitle: 'Vòng cổ, vai, ngực, eo, nách, bắp tay, dài áo...',
    icon: Ruler,
    fields: [
      { key: 'Vòng cổ', placeholder: 'Chu vi quanh chân cổ (VD: 36 - 38 cm)' },
      { key: 'Rộng vai (Ngang vai)', placeholder: 'Đo từ đầu vai trái sang phải (VD: 36 - 38 cm)' },
      { key: 'Vòng ngực', placeholder: 'Đo quanh điểm nở nhất ngực (VD: 84 - 88 cm)' },
      { key: 'Hạ ngực', placeholder: 'Từ chân cổ/đầu vai xuống đỉnh ngực (VD: 23 - 25 cm)' },
      { key: 'Khoảng cách 2 đầu ngực (Chồi ngực)', placeholder: 'Khoảng cách giữa 2 đỉnh ngực (VD: 16 - 18 cm)' },
      { key: 'Vòng eo', placeholder: 'Đo chỗ nhỏ nhất của eo trên rốn (VD: 66 - 70 cm)' },
      { key: 'Hạ eo', placeholder: 'Từ đầu vai xuống vị trí đo eo (VD: 36 - 38 cm)' },
      { key: 'Dài áo', placeholder: 'Từ đỉnh vai xuống độ dài áo (VD: 55 - 60 cm)' },
      { key: 'Dài tay', placeholder: 'Từ mút vai xuống cổ tay (VD: 52 - 55 cm)' },
      { key: 'Vòng bắp tay', placeholder: 'Quanh vị trí bắp tay nở nhất (VD: 26 - 28 cm)' },
      { key: 'Cửa tay (Cổ tay)', placeholder: 'Chu vi cổ tay hoặc ống tay (VD: 20 - 22 cm)' },
      { key: 'Vòng nách', placeholder: 'Chu vi quanh nách khi thả lỏng (VD: 38 - 40 cm)' },
    ]
  },
  {
    id: 'lower',
    title: '3. Thông số Đo May Thân Dưới (Quần tây, Quần short, Váy/Chân váy)',
    subtitle: 'Vòng bụng, mông, đáy, dài quần, đùi, gối, ống...',
    icon: Ruler,
    fields: [
      { key: 'Vòng bụng (Vòng cạp/lưng)', placeholder: 'Vị trí cạp cao/vừa/trễ (VD: 68 - 72 cm)' },
      { key: 'Vòng mông', placeholder: 'Quanh điểm nở nhất của mông (VD: 90 - 94 cm)' },
      { key: 'Hạ mông / Hạ đáy (Đũng quần)', placeholder: 'Độ sâu đáy quần (VD: 26 - 28 cm)' },
      { key: 'Dài quần', placeholder: 'Từ cạp quần xuống mắt cá/gót (VD: 92 - 96 cm)' },
      { key: 'Vòng đùi', placeholder: 'Chu vi đùi to nhất (VD: 50 - 54 cm)' },
      { key: 'Vòng gối', placeholder: 'Quanh khớp gối (VD: 36 - 38 cm)' },
      { key: 'Rộng ống (Cửa ống)', placeholder: 'Độ rộng ống quần dưới cùng (VD: 18 - 22 cm)' },
    ]
  },
  {
    id: 'dress',
    title: '4. Thông số Đo May Đầm Liền / Váy Liền Thân',
    subtitle: 'Dài đầm, hạ eo, vòng tùng váy...',
    icon: Ruler,
    fields: [
      { key: 'Dài đầm (Dài váy)', placeholder: 'Từ đỉnh vai qua ngực xuống gấu váy (VD: 95 - 110 cm)' },
      { key: 'Hạ ngực / Hạ eo / Hạ mông', placeholder: 'Định vị form thắt eo & điểm xòe/ôm' },
      { key: 'Vòng tùng váy', placeholder: 'Độ rộng chân váy xòe (VD: 120 - 180 cm)' },
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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') {
        const data = await getUsers();
        setUsers(data);
      } else {
        const data = await getProducts();
        setProducts(data);
        const cats = await getCategories();
        setCategories(cats);
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Không thể xóa tài khoản!');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mẫu sản phẩm này không?')) return;
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
      categories: [categories[0] || 'Đầm'],
      target_gender: 'Nữ',
      price_estimate: '',
      description: '',
      design_details: { ...INITIAL_DESIGN_DETAILS },
      fabric_recommendations: '',
      image_urls: '',
      is_pinned: false
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setNewCategoryName('');

    const mergedDetails = { ...INITIAL_DESIGN_DETAILS };
    if (product.design_details) {
      // Map legacy/alias keys if necessary
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
      // Merge all keys from product
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
    setIsFormOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await uploadImage(file);
      if (result && result.url) {
        const currentUrls = formData.image_urls 
          ? formData.image_urls.split(',').map(item => item.trim()).filter(Boolean) 
          : [];
        currentUrls.push(result.url);
        setFormData({ ...formData, image_urls: currentUrls.join(', ') });
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest px-3 mb-4">Danh mục Quản lý</h4>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'products' 
                    ? 'bg-amber-505 bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Quản lý Mẫu Sản Phẩm</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'users' 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Quản lý Tài Khoản</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          Nhà May Thúy Diễm Admin Panel v1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 flex flex-col bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              {activeTab === 'users' ? 'Quản lý Tài Khoản Khách Hàng' : 'Danh Sách Mẫu May Thiết Kế'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'users' 
                ? 'Xem danh sách và xóa các tài khoản khách hàng đã đăng ký trên hệ thống.'
                : 'Thêm, sửa đổi thông tin chi tiết hoặc xóa các mẫu thiết kế của nhà may.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="p-2 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-all duration-150 shadow-sm"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'products' && (
              <button
                onClick={handleOpenCreate}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-amber-500/10 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mẫu Mới</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <p className="text-sm font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="flex-1">
            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Tên khách hàng</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Số điện thoại</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Ngày tham gia</th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-slate-700 text-xs sm:text-sm">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-10 text-slate-400">Không tìm thấy tài khoản nào.</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-900">{user.full_name}</td>
                            <td className="px-6 py-4 flex items-center space-x-1.5 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{user.phone}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              <div className="flex items-center space-x-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
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
              </div>
            )}

            {/* PRODUCTS MANAGEMENT TAB */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
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
                    <tbody className="divide-y divide-slate-200 bg-white text-slate-700 text-xs sm:text-sm">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-10 text-slate-400">Chưa có mẫu sản phẩm nào được tạo.</td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <img 
                                src={product.image_urls?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&auto=format&fit=crop&q=80'} 
                                alt={product.name} 
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                              />
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-900">
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
                            <td className="px-6 py-4 text-amber-600 font-semibold">{product.price_estimate}</td>
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
                                  <Pin className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(product)}
                                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Chỉnh sửa mẫu"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
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
              </div>
            )}
          </div>
        )}
      </main>

      {/* FORM MODAL (ADD / EDIT) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-amber-500" />
                {editingProduct ? 'Chỉnh Sửa Mẫu Thiết Kế' : 'Thêm Mẫu Thiết Kế Mới'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tên Mẫu Sản Phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                    placeholder="VD: Đầm Xòe Hoa Nhí Cổ V"
                  />
                </div>

                {/* Categories selection */}
                <div className="col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Danh mục sản phẩm * (Chọn nhiều)</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {categories.map((cat) => {
                      const isChecked = formData.categories && formData.categories.includes(cat);
                      return (
                        <label key={cat} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors text-xs font-semibold ${
                          isChecked 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm' 
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
                      className="flex-1 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                      placeholder="Nhập tên danh mục mới..."
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>

                {/* Target Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Giới tính *</label>
                  <select
                    value={formData.target_gender}
                    onChange={(e) => setFormData({ ...formData, target_gender: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                    <option value="Cả nam lẫn nữ">Cả nam lẫn nữ</option>
                  </select>
                </div>

                {/* Price Estimate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ước tính giá *</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={formData.price_estimate}
                      onChange={(e) => setFormData({ ...formData, price_estimate: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                      placeholder="VD: 350.000đ - 450.000đ"
                    />
                  </div>
                </div>

                {/* Pinned toggle */}
                <div className="col-span-2 flex items-center space-x-2 bg-amber-50/50 border border-amber-200/60 rounded-xl p-3">
                  <input
                    type="checkbox"
                    id="is_pinned"
                    checked={formData.is_pinned}
                    onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="is_pinned" className="text-xs font-bold text-slate-700 uppercase cursor-pointer select-none">
                    Ghim sản phẩm nổi bật lên đầu trang chủ
                  </label>
                </div>

                {/* Image Upload & Link */}
                <div className="col-span-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* File Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tải ảnh từ thiết bị</label>
                      <div className="relative flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-xl p-4 transition-colors bg-slate-50 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={uploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-center space-y-1">
                          <Plus className="w-6 h-6 mx-auto text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 block">
                            {uploading ? 'Đang tải lên...' : 'Chọn tệp ảnh'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Image Link Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hoặc nhập Link ảnh</label>
                      <div className="relative">
                        <Image className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={formData.image_urls}
                          onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                          placeholder="VD: http://image.link/1.jpg, http://image.link/2.jpg"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Nhiều link phân cách bằng dấu phẩy</p>
                    </div>
                  </div>

                  {/* Previews */}
                  {formData.image_urls && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase">Danh sách ảnh đã chọn ({formData.image_urls.split(',').map(u => u.trim()).filter(Boolean).length})</label>
                      <div className="flex flex-wrap gap-2">
                        {formData.image_urls.split(',').map((url, index) => {
                          const trimmedUrl = url.trim();
                          if (!trimmedUrl) return null;
                          return (
                            <div key={index} className="relative group w-20 h-20 border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                              <img src={trimmedUrl} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const list = formData.image_urls.split(',').map(u => u.trim()).filter(Boolean);
                                  list.splice(index, 1);
                                  setFormData({ ...formData, image_urls: list.join(', ') });
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
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
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mô tả sản phẩm *</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Mô tả phong cách, sự kiện phù hợp..."
                  />
                </div>

                {/* Design Details & Body Measurements */}
                <div className="col-span-2 border-t border-slate-100 pt-4 space-y-5">
                  <div>
                    <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Chi tiết Kiểu dáng Thiết kế & Thông số Đo may
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Điền các thông số kiểu dáng và số đo tiêu chuẩn của mẫu. Trường nào để trống sẽ tự động được ẩn khi hiển thị trên web.
                    </p>
                  </div>

                  {DESIGN_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    return (
                      <div key={group.id} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-2">
                          <GroupIcon className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="text-xs font-bold text-slate-800">{group.title}</h5>
                            {group.subtitle && (
                              <p className="text-[10px] text-slate-500">{group.subtitle}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {group.fields.map((field) => (
                            <div key={field.key}>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                placeholder={field.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fabric Recommendations */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Loại vải đề xuất (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.fabric_recommendations}
                    onChange={(e) => setFormData({ ...formData, fabric_recommendations: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                    placeholder="VD: Lụa Satin, Lụa Mango, Tuyết mưa"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-md transition-all duration-200"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
