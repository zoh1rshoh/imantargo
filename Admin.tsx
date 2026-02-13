import React, { useState, useEffect } from 'react';
import { useShop } from './store';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, Box, ShoppingCart, Users, LogOut, 
  Trash2, Edit, Plus, CheckCircle, MessageCircle, 
  MoreVertical, Percent, Map,RefreshCcw,Phone, Calendar, Clock, AlertTriangle,
  FileSpreadsheet, Download, UploadCloud, X, AlertCircle,
  ChevronLeft, ChevronRight, Wallet, Star, Send, MapPin, 
  Lock, Check, Image as ImageIcon
} from 'lucide-react';
import { CATEGORIES, Product, Order } from './types';
import { supabase } from './supabaseClient';

const Admin = () => {
  const [supabaseUsers, setSupabaseUsers] = useState<any[]>([]);
  const [tashkentTime, setTashkentTime] = useState(new Date());

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('imantargo').select('*').order('created_at', { ascending: false });
      if (data) setSupabaseUsers(data);
    };
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    const clock = setInterval(() => setTashkentTime(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  const { products, orders, questions, messages, deleteProduct, updateProduct, addProduct, updateOrderStatus, answerQuestion, sendOrderMessage, transferFunds, t } = useShop();
  
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'orders' | 'users' | 'finance' | 'questions' | 'reviews' | 'chat'>('home');
  const [orderFilter, setOrderFilter] = useState<Order['status'] | 'Barchasi'>('Barchasi');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredTab, setHoveredTab] = useState<{ name: string, top: number } | null>(null);

  // --- MODAL STATE ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productFormStep, setProductFormStep] = useState(1);
  
  // Mahsulot State
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [specsUz, setSpecsUz] = useState('');
  const [specsRu, setSpecsRu] = useState('');

  // --- IMAGE MANAGEMENT STATE ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageProduct, setSelectedImageProduct] = useState<Product | null>(null);
  const [tempImages, setTempImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // --- XATOLIKLARNI BOSHQARISH ---
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
  };

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [discountDays, setDiscountDays] = useState<string>('');
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [activeChatOrderId, setActiveChatOrderId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'Bekor qilindi' ? sum + o.totalPrice : sum, 0);
  const handleLogout = () => navigate('/');
  const frozenFunds = orders.filter(o => o.paymentMethod === 'card' && o.status !== 'Bekor qilindi' && !o.fundsTransferred).reduce((sum, o) => sum + o.totalPrice, 0);
  const availableFunds = orders.filter(o => (o.paymentMethod === 'card' && o.fundsTransferred) || (o.paymentMethod === 'cash' && o.status === 'Yetkazildi')).reduce((sum, o) => sum + o.totalPrice, 0);

  // --- Functions ---
  const formatDate = (dateString: string) => { if (!dateString) return "Ma'lumot yo'q"; return new Date(dateString).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  const getUserStatus = (lastSeenString: string) => { if (!lastSeenString) return { status: 'Faol emas', color: 'text-red-500', isOnline: false }; const lastSeen = new Date(lastSeenString).getTime(); const now = new Date().getTime(); const diffMinutes = (now - lastSeen) / 1000 / 60; if (diffMinutes < 5) return { status: 'Faol', color: 'text-green-500', isOnline: true }; return { status: 'Faol emas', color: 'text-red-500', isOnline: false }; };
  const handleEmergencyTransfer = async (orderId: number) => { if(window.confirm("DIQQAT: Pulni favqulodda yechib olmoqchimisiz?")) { await transferFunds(orderId); showNotification("Mablag' hisobingizga o'tkazildi!"); } };
  const handleRefund = async (orderId: number) => { if(window.confirm("Buyurtmani bekor qilib, mablag'ni mijozga qaytarmoqchimisiz?")) { await updateOrderStatus(orderId, 'Bekor qilindi'); showNotification("Buyurtma bekor qilindi va mablag' qaytarildi."); } };

  const ORDER_STATUS_FLOW: Order['status'][] = ['Yangi', 'Qadoqlanmoqda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi'];

  const canChangeStatus = (current: Order['status'], target: Order['status']) => {
    if (current === target) return false;
    
    // Agar buyurtma yakuniy bosqichda bo'lsa, uni o'zgartirib bo'lmaydi
    if (current === 'Yetkazildi' || current === 'Bekor qilindi') return false;

    // Agar maqsad 'Bekor qilindi' bo'lsa va yuqoridagi tekshiruvdan o'tgan bo'lsa, demak ruxsat beriladi
    if (target === 'Bekor qilindi') {
        return true; 
    }

    const currentIndex = ORDER_STATUS_FLOW.indexOf(current);
    const targetIndex = ORDER_STATUS_FLOW.indexOf(target);

    // 99-qatordagi `&& target !== 'Bekor qilindi'` ham ortiqcha, 
    // chunki 94-qatordagi if bloki 'Bekor qilindi' holatini ushlab qoladi.
    return targetIndex > currentIndex;
};

  const handleStatusChange = async (order: Order, target: Order['status']) => {
      if (!canChangeStatus(order.status, target)) return;

      if (target === 'Bekor qilindi') {
          if (!window.confirm("Bu buyurtmani bekor qilasizmi?")) return;
          await updateOrderStatus(order.id, 'Bekor qilindi', "Admin tomonidan bekor qilindi");
          showNotification("Buyurtma bekor qilindi");
          return;
      }

      await updateOrderStatus(order.id, target);
      showNotification(`Status: ${target}`);
  };

  // --- MAHSULOT LOGIKASI ---
  const openAddModal = () => {
      setIsEditing(false);
      setCurrentProduct({ category: CATEGORIES[0], price: 0, oldPrice: undefined, stock: 0, image: '', gallery: [] });
      setNameUz(''); setNameRu(''); setSpecsUz(''); setSpecsRu('');
      setFormErrors({}); setProductFormStep(1); setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
      setIsEditing(true); setCurrentProduct(p);
      setNameUz(p.name); setNameRu(p.name); setSpecsUz(p.specs); setSpecsRu(p.specs);
      setFormErrors({}); setProductFormStep(1); setIsProductModalOpen(true); setOpenActionId(null);
  };

  const handleInlineEdit = (id: number, field: 'price' | 'stock', value: string) => {
      const numValue = parseInt(value) || 0;
      const product = products.find(p => p.id === id);
      if (product) updateProduct({ ...product, [field]: numValue });
  };

  const handleProductSubmit = () => {
      let errors: Record<string, string> = {};
      if (productFormStep === 1) {
          if (!nameUz.trim()) errors.nameUz = "Nomi (UZ) kiritilishi shart!";
          if (!nameRu.trim()) errors.nameRu = "Nomi (RU) kiritilishi shart!";
          if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
          setFormErrors({}); setCurrentProduct({ ...currentProduct, name: nameUz }); setProductFormStep(2);
      } else if (productFormStep === 2) {
          if (!specsUz.trim()) errors.specsUz = "Xususiyatlar (UZ) kiritilishi shart!";
          if (!specsRu.trim()) errors.specsRu = "Xususiyatlar (RU) kiritilishi shart!";
          if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
          setFormErrors({}); setCurrentProduct({ ...currentProduct, specs: specsUz }); setProductFormStep(3);
      } else if (productFormStep === 3) {
          if (!currentProduct.price || currentProduct.price <= 0) errors.price = "Narx noto'g'ri!";
          if (currentProduct.stock === undefined || currentProduct.stock < 0) errors.stock = "Ombor soni noto'g'ri!";
          if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
          
          const finalProduct = { ...currentProduct, name: nameUz, specs: specsUz, brand: 'Imported', image: '' };
          if (isEditing && currentProduct.id) { updateProduct(finalProduct as Product); showNotification("Yangilandi!"); }
          else { addProduct({ ...finalProduct, id: Date.now(), rating: 5, brand: 'IMANTARGO', sku: `IM-${Math.floor(Math.random()*1000)}`, gallery: currentProduct.gallery || [] } as Product); showNotification("Qo'shildi!"); }
          setIsProductModalOpen(false);
      }
  };

  // --- IMAGE MANAGEMENT LOGIC ---
  const openImageModal = (p: Product) => { 
      setSelectedImageProduct(p); 
      const allImages = [p.image, ...(p.gallery || [])].filter(img => img && img.length > 0);
      setTempImages(allImages);
      setImagesToDelete([]); 
      setIsImageModalOpen(true); 
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          if (tempImages.length + files.length > 20) {
              return showNotification("Maksimal 20 ta rasm yuklash mumkin!", 'error');
          }
          Array.from(files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  const newUrl = reader.result as string;
                  setTempImages(prev => [...prev, newUrl]);
              };
              reader.readAsDataURL(file);
          });
      }
  };

  const toggleImageDelete = (url: string) => {
      if (imagesToDelete.includes(url)) {
          setImagesToDelete(prev => prev.filter(item => item !== url));
      } else {
          setImagesToDelete(prev => [...prev, url]);
      }
  };

  const saveImageChanges = () => {
      if (!selectedImageProduct) return;
      const finalImages = tempImages.filter(img => !imagesToDelete.includes(img));
      if (finalImages.length === 0) {
          return showNotification("Kamida 1 ta rasm qolishi kerak!", 'error');
      }
      const updatedProduct = { ...selectedImageProduct, image: finalImages[0], gallery: finalImages.slice(1) };
      updateProduct(updatedProduct);
      showNotification("Rasmlar saqlandi!");
      setIsImageModalOpen(false);
  };

  const openDiscountModal = (p:Product) => { setDiscountProduct(p); setDiscountPercent(''); setDiscountDays(''); setIsDiscountModalOpen(true); setOpenActionId(null); };
  const applyDiscount = () => { const per = parseFloat(discountPercent); if(!discountProduct || per<=0) return showNotification("Xato", 'error'); const old = discountProduct.price; updateProduct({...discountProduct, price: Math.round(old - (old*(per/100))), oldPrice: old}); showNotification("Chegirma qo'yildi!"); setIsDiscountModalOpen(false); };
  const removeDiscount = (p:Product) => { if(window.confirm("O'chirasizmi?")) { updateProduct({...p, price: p.oldPrice||p.price, oldPrice: undefined}); setOpenActionId(null); }};
  
  // --- EXCEL LOGIC (UZUM MARKET SHABLONI UCHUN) ---
  const downloadTemplate = () => { const ws = XLSX.utils.json_to_sheet([{ name: "Iphone 15", category: "Telefon", price: 1200, stock: 10, specs: "256GB" }]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Template"); XLSX.writeFile(wb, "template.xlsx"); };
  
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        // "Mahsulotlar ro'yxati" varag'ini qidirish
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes("mahsulot")) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 2-qatordan (index 1) o'qish (Siz yuborgan faylga mos)
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { range: 1 });

        if(json.length > 0) { 
            let count = 0;
            json.forEach((item: any) => {
                // Fayldagi aniq ustun nomlari
                const nameUz = item["O'zbek tilidagi nomi lotin *"];
                const nameRu = item["Mahsulot nomi *"];
                const name = nameUz || nameRu || "Nomsiz mahsulot";

                const specsUz = item["Lotin tilida o'zbek tilidagi tavsif *"];
                const specsRu = item["Mahsulot tavsifi *"];
                const specs = specsUz || specsRu || "";

                const priceRaw = item["Narxi *"];
                const price = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw).replace(/\s/g, '')) || 0;

                const oldPriceRaw = item["Chizilgan narx"];
                const oldPrice = oldPriceRaw ? (typeof oldPriceRaw === 'number' ? oldPriceRaw : parseFloat(String(oldPriceRaw).replace(/\s/g, ''))) : undefined;

                const imagesRaw = item["Rasmga havola *"] || "";
                const gallery = imagesRaw.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
                const image = gallery.length > 0 ? gallery[0] : "";

                const category = item["Bozordagi kategoriya *"] || "Boshqa";
                const brand = item["Brend *"] || "No Brand";
                const sku = item["Sizning SKU *"] || `SKU-${Date.now()}-${Math.floor(Math.random()*1000)}`;

                if(name && price > 0) {
                    addProduct({
                        id: Date.now() + Math.random(), 
                        name: name, 
                        category: category, 
                        price: price, 
                        oldPrice: oldPrice,
                        stock: 50, // Default ombor
                        specs: specs, 
                        rating: 5, 
                        sku: sku, 
                        gallery: gallery, 
                        brand: brand, 
                        image: image 
                    } as Product);
                    count++;
                }
            }); 
            showNotification(`${count} ta mahsulot muvaffaqiyatli yuklandi!`); 
            setIsExcelModalOpen(false); 
        } else {
            showNotification("Fayl bo'sh yoki noto'g'ri formatda", 'error');
        }
      } catch (err) {
          console.error(err);
          showNotification("Faylni o'qishda xatolik", 'error');
      }
    }; 
    reader.readAsArrayBuffer(file);
  };

  const sendChat = (id:number) => { if(chatInput.trim()){ sendOrderMessage(id, chatInput, 'admin'); setChatInput(''); }};
  const submitReply = (id:number) => { if(replyText.trim()){ answerQuestion(id, replyText); setReplyText(''); setReplyingTo(null); showNotification("Javob yuborildi"); }};
  const filteredOrders = orders.filter(o => orderFilter === 'Barchasi' ? true : o.status === orderFilter);
  const TAB_NAMES: Record<string, string> = { home: t('home'), products: t('products'), orders: t('orders'), users: t('clients'), finance: t('finance'), questions: t('questions'), reviews: t('reviews'), chat: t('chat') };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300 relative">
      
      {/* TOAST XABARLAR */}
      {notification && (
          <div className={`fixed top-5 right-5 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {notification.type === 'success' ? <CheckCircle size={24}/> : <AlertTriangle size={24}/>}
              <span className="font-bold">{notification.message}</span>
          </div>
      )}

      {/* Sidebar */}
      <aside className={`relative h-screen bg-[#111827] text-gray-300 transition-all duration-300 ease-in-out border-r border-gray-700 flex flex-col z-50 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-8 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-500 z-50 transition-colors">{isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button>
        <div className="flex flex-col h-full overflow-hidden">
            <div className={`flex items-center gap-3 p-6 transition-all duration-300 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic flex-shrink-0 shadow-lg">IM</div><div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}><h1 className="text-xl font-black text-white italic whitespace-nowrap">IMANTARGO</h1><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin UI</p></div></div>
            <nav className="flex-grow px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">{Object.keys(TAB_NAMES).map((tab) => (<button key={tab} onClick={() => setActiveTab(tab as any)} onMouseEnter={(e) => !isSidebarOpen && setHoveredTab({ name: TAB_NAMES[tab], top: e.currentTarget.getBoundingClientRect().top })} onMouseLeave={() => setHoveredTab(null)} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all duration-200 group relative ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><div className={`flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${!isSidebarOpen && 'mx-auto'}`}>{tab==='home' && <LayoutDashboard size={20}/>}{tab==='products' && <Box size={20}/>}{tab==='orders' && <ShoppingCart size={20}/>}{tab==='users' && <Users size={20}/>}{tab==='finance' && <Wallet size={20}/>}{tab==='questions' && <MessageCircle size={20}/>}{tab==='reviews' && <Star size={20}/>}{tab==='chat' && <Send size={20}/>}</div><span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{TAB_NAMES[tab]}</span></button>))}</nav>
            <div className="p-4 border-t border-gray-800"><button onClick={handleLogout} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-xs uppercase transition-all duration-200 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white ${!isSidebarOpen && 'justify-center'}`}><LogOut size={20} /><span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('logout')}</span></button></div>
        </div>
        {!isSidebarOpen && hoveredTab && <div className="fixed left-20 ml-3 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl border border-gray-700 z-[60] animate-fade-in pointer-events-none" style={{ top: hoveredTab.top + 8 }}>{hoveredTab.name}</div>}
      </aside>

      <main className="flex-grow overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900" onClick={() => setOpenActionId(null)}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-black uppercase text-gray-800 dark:text-white">{TAB_NAMES[activeTab]}</h1><div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3"><Clock className="text-indigo-600 animate-pulse" size={20} /><div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Toshkent vaqti</p><p className="text-xl font-black font-mono text-gray-800 dark:text-white">{tashkentTime.toLocaleTimeString('uz-UZ', { timeZone: 'Asia/Tashkent' })}</p></div></div></div>

        {activeTab === 'home' && (<div className="animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t('totalRevenue')}</p><h3 className="text-3xl font-black text-green-600 dark:text-green-400">{totalRevenue.toLocaleString()} UZS</h3></div><div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t('orders')}</p><h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{orders.length} ta</h3></div><div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t('clients')}</p><h3 className="text-3xl font-black text-orange-500 dark:text-orange-400">{supabaseUsers.length} ta</h3></div></div></div>)}
        {activeTab === 'users' && (<div className="animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{supabaseUsers.map((u, i) => { const { status, color, isOnline } = getUserStatus(u.last_seen); return (<div key={i} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden group hover:shadow-md transition"><div className="h-32 bg-gray-200 dark:bg-gray-700 relative"><div className="absolute inset-0 opacity-50 bg-cover bg-center" style={{backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/69.2401,41.2995,12,0/400x200?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsIn0.1')"}}></div><div className="absolute top-3 right-3 z-10"><a href={`https://www.google.com/maps?q=${u.location || '41.2995,69.2401'}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 shadow-sm hover:scale-105 transition border border-white/20"><Map size={12} /> {u.location ? "Xaritada" : "Yo'q"}</a></div><div className="absolute bottom-3 left-4 right-4"><div className="bg-black/60 backdrop-blur-sm rounded-xl p-2 text-white inline-block"><p className="text-[10px] font-bold flex items-center gap-1"><MapPin size={10} className="text-red-400"/> {u.address || "Manzil kiritilmagan"}</p></div></div></div><div className="p-6 relative pt-10"><div className="w-16 h-16 bg-indigo-600 rounded-full border-4 border-white dark:border-gray-800 absolute -top-8 left-6 flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden">{u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt={u.name} /> : u.name?.charAt(0)}</div><div><h4 className="font-bold text-lg dark:text-white flex items-center gap-2">{u.name} <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">USER</span></h4><p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono">{u.phone}</p><div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700"><div className="flex justify-between items-center pb-2 border-b dark:border-gray-600 border-gray-200"><span className="flex items-center gap-1 text-gray-400 font-bold"><Calendar size={12}/> Ro'yxatdan o'tdi:</span><span className="font-mono font-bold">{formatDate(u.created_at)}</span></div><div className="flex justify-between items-center pt-2"><span className="flex items-center gap-1 text-gray-400 font-bold"><Clock size={12}/> Holati:</span><span className={`font-mono font-black ${color}`}>{status} {isOnline ? '' : `(${formatDate(u.last_seen).split(',')[1]})`}</span></div></div></div></div></div>)})}</div></div>)}
        {activeTab === 'finance' && (<div className="animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg"><div className="flex items-center gap-3 mb-2 opacity-80"><Lock size={20} /><span className="text-xs font-bold uppercase">Muzlatilgan</span></div><h3 className="text-4xl font-black">{frozenFunds.toLocaleString()} UZS</h3></div><div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-2 text-green-500"><CheckCircle size={20} /><span className="text-xs font-bold uppercase">Hisobda</span></div><h3 className="text-4xl font-black text-gray-800 dark:text-white">{availableFunds.toLocaleString()} UZS</h3></div><div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-2 text-gray-400"><Wallet size={20} /><span className="text-xs font-bold uppercase">{t('totalRevenue')}</span></div><h3 className="text-4xl font-black text-gray-800 dark:text-white">{totalRevenue.toLocaleString()} UZS</h3></div></div><div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden"><div className="p-6 border-b dark:border-gray-700"><h3 className="font-black text-gray-800 dark:text-white uppercase">Karta tranzaksiyalari</h3></div><table className="w-full text-left text-sm"><thead className="bg-gray-50 dark:bg-gray-700/50"><tr><th className="p-4 font-black text-gray-400 uppercase text-xs">Buyurtma</th><th className="p-4 font-black text-gray-400 uppercase text-xs">Summa</th><th className="p-4 font-black text-gray-400 uppercase text-xs">Karta</th><th className="p-4 font-black text-gray-400 uppercase text-xs">Holat</th><th className="p-4 font-black text-gray-400 uppercase text-xs text-right">Amal</th></tr></thead><tbody className="divide-y dark:divide-gray-700">{orders.filter(o => o.paymentMethod === 'card').map(o => (<tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30"><td className="p-4 font-bold text-indigo-600">#{o.id}</td><td className="p-4 font-bold dark:text-white">{o.totalPrice.toLocaleString()}</td><td className="p-4 text-gray-500 font-mono text-xs">{o.cardInfo?.number}</td><td className="p-4">{o.fundsTransferred ? (<span className={`bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit`}><CheckCircle size={12} /> {o.status === 'Yetkazildi' ? "Avtomatik o'tkazildi" : "Favqulodda o'tkazildi"}</span>) : (<span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Lock size={12} /> Muzlatilgan (2 kun)</span>)}</td><td className="p-4 text-right flex justify-end gap-2">{!o.fundsTransferred && o.status !== 'Bekor qilindi' && (<><button onClick={() => handleEmergencyTransfer(o.id)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase shadow-lg transition" title="Favqulodda yechish"><AlertTriangle size={14} /> </button><button onClick={() => handleRefund(o.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase shadow-lg transition" title="Mablag'ni qaytarish"><RefreshCcw size={14} /> </button></>)}{o.status === 'Bekor qilindi' && <span className="text-red-500 font-bold text-xs uppercase">Qaytarilgan</span>}</td></tr>))}</tbody></table></div></div>)}

        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-black uppercase text-gray-800 dark:text-white">{t('products')}</h2><div className="flex gap-2"><button onClick={() => setIsExcelModalOpen(true)} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-green-700 flex items-center gap-2"><FileSpreadsheet size={16} /> Excel</button><button onClick={openAddModal} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-indigo-700 flex items-center gap-2"><Plus size={16} /> Qo'lda qo'shish</button></div></div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-visible pb-20">
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700"><tr><th className="p-4 font-black text-gray-400 uppercase text-xs">{t('name')}</th><th className="p-4 font-black text-gray-400 uppercase text-xs">{t('price')}</th><th className="p-4 font-black text-gray-400 uppercase text-xs">{t('stock')}</th><th className="p-4 text-right">Amal</th></tr></thead>
                  <tbody className="divide-y dark:divide-gray-700">{products.map(p=>(<tr key={p.id}>
                      <td className="p-4 font-bold flex gap-2 items-center">
                          {/* RASMNI BOSISH - Rasmlarni boshqarish modali ochiladi */}
                          <div onClick={() => openImageModal(p)} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer overflow-hidden border border-gray-300 dark:border-gray-600 hover:opacity-80 transition relative group">
                              {p.image ? <img src={p.image} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={16}/></div>}
                              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><Edit size={12}/></div>
                          </div>
                          {p.name}
                      </td>
                      <td className="p-4"><input type="number" value={p.price} onChange={e=>handleInlineEdit(p.id,'price',e.target.value)} className="w-24 bg-transparent font-bold text-indigo-600"/></td>
                      <td className="p-4"><input type="number" value={p.stock} onChange={e=>handleInlineEdit(p.id,'stock',e.target.value)} className="w-12 bg-transparent font-bold"/></td>
                      <td className="p-4 text-right relative"><button onClick={(e)=>{e.stopPropagation();setOpenActionId(openActionId===p.id?null:p.id)}}><MoreVertical size={16}/></button>{openActionId===p.id && <div className="absolute right-8 top-2 bg-white dark:bg-gray-800 shadow-xl border rounded-xl z-50 overflow-hidden w-40"><button onClick={()=>openDiscountModal(p)} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex gap-2 items-center text-xs font-bold"><Percent size={14}/>Chegirma</button><button onClick={()=>openEditModal(p)} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex gap-2 items-center text-xs font-bold text-blue-500"><Edit size={14}/>Tahrirlash</button><button onClick={()=>deleteProduct(p.id)} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex gap-2 items-center text-xs font-bold text-red-500"><Trash2 size={14}/>O'chirish</button></div>}</td>
                  </tr>))}</tbody>
               </table>
            </div>
          </div>
        )}

        {/* ... Orders, Questions, Chat tabs are same ... */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <div className="flex flex-wrap gap-2 mb-6">
              {['Barchasi', 'Yangi', 'Qadoqlanmoqda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi'].map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderFilter(s as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                    orderFilter === s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-visible pb-32">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                  <tr>
                    <th className="p-4">No</th>
                    <th className="p-4">Mijoz</th>
                    <th className="p-4">Aloqa</th>
                    <th className="p-4">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {filteredOrders.map(o => {
                    const canToPack = canChangeStatus(o.status, 'Qadoqlanmoqda');
                    const canToDelivering = canChangeStatus(o.status, 'Yetkazilmoqda');
                    const canToDelivered = canChangeStatus(o.status, 'Yetkazildi');
                    const canToCanceled = canChangeStatus(o.status, 'Bekor qilindi');
                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <td className="p-4 font-mono font-bold text-indigo-600">
                          #{o.id}
                          <br />
                          <span className="text-[10px] text-gray-400 font-sans">{o.date}</span>
                        </td>
                        <td className="p-4 font-bold dark:text-white">{o.userName}</td>
                        <td className="p-4 flex gap-2">
                          <a href={`tel:${o.userPhone}`} className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <Phone size={16} />
                          </a>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveChatOrderId(o.id); }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                          >
                            <MessageCircle size={16} />
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {/* Qadoqlanmoqda */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(o, 'Qadoqlanmoqda'); }}
                              disabled={!canToPack}
                              title="Qadoqlanmoqda"
                              className={`p-2 rounded-full border text-[10px] font-black uppercase flex items-center justify-center gap-1 ${
                                o.status === 'Qadoqlanmoqda'
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  : canToPack
                                  ? 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-yellow-50'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <Box size={14} />
                            </button>

                            {/* Yetkazilmoqda */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(o, 'Yetkazilmoqda'); }}
                              disabled={!canToDelivering}
                              title="Yetkazilmoqda"
                              className={`p-2 rounded-full border text-[10px] font-black uppercase flex items-center justify-center gap-1 ${
                                o.status === 'Yetkazilmoqda'
                                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                                  : canToDelivering
                                  ? 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-blue-50'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <Send size={14} />
                            </button>

                            {/* Yetkazildi */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(o, 'Yetkazildi'); }}
                              disabled={!canToDelivered}
                              title="Yetkazildi"
                              className={`p-2 rounded-full border text-[10px] font-black uppercase flex items-center justify-center gap-1 ${
                                o.status === 'Yetkazildi'
                                  ? 'bg-green-100 text-green-700 border-green-300'
                                  : canToDelivered
                                  ? 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-green-50'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <CheckCircle size={14} />
                            </button>

                            {/* Bekor qilindi */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(o, 'Bekor qilindi'); }}
                              disabled={!canToCanceled}
                              title="Bekor qilindi"
                              className={`p-2 rounded-full border text-[10px] font-black uppercase flex items-center justify-center gap-1 ${
                                o.status === 'Bekor qilindi'
                                  ? 'bg-red-100 text-red-700 border-red-300'
                                  : canToCanceled
                                  ? 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-red-50'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'questions' && questions.map(q=><div key={q.id} className="bg-white dark:bg-gray-800 p-4 mb-4 rounded-xl border dark:border-gray-700"><div className="flex justify-between font-bold dark:text-white"><span>{q.userName}</span><span className="text-gray-400 text-xs">{q.date}</span></div><p className="text-sm my-2">{q.text}</p>{!q.answer && <div className="flex gap-2"><input className="border p-2 rounded w-full dark:bg-gray-700" placeholder="Javob..." value={replyingTo===q.id?replyText:''} onChange={e=>{setReplyingTo(q.id);setReplyText(e.target.value)}} /><button onClick={()=>submitReply(q.id)} className="bg-indigo-600 text-white px-4 rounded font-bold">Yuborish</button></div>}</div>)}
        {activeTab === 'chat' && <div className="h-[70vh] bg-white dark:bg-gray-800 rounded-xl flex border dark:border-gray-700"><div className="w-1/3 border-r p-4 overflow-y-auto">{orders.map(o=><div key={o.id} onClick={()=>setActiveChatOrderId(o.id)} className="p-3 hover:bg-gray-50 cursor-pointer border-b"><span className="font-bold">#{o.id}</span> {o.userName}</div>)}</div><div className="w-2/3 p-4 flex flex-col">{messages.filter(m=>m.orderId===activeChatOrderId).map(m=><div key={m.id} className={`p-2 my-1 rounded w-fit ${m.sender==='admin'?'bg-indigo-600 text-white ml-auto':'bg-gray-100 text-black'}`}>{m.text}</div>)}<div className="mt-auto flex gap-2"><input className="border p-2 w-full rounded" value={chatInput} onChange={e=>setChatInput(e.target.value)}/><button onClick={()=>sendChat(activeChatOrderId||0)} className="bg-indigo-600 text-white p-2 rounded"><Send/></button></div></div></div>}

      </main>

      {/* --- YANGI: RASMLARNI BOSHQARISH MODALI --- */}
      {isImageModalOpen && selectedImageProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative border dark:border-gray-700">
                <button onClick={() => setIsImageModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black uppercase text-gray-800 dark:text-white">Rasmlar ({tempImages.length}/20)</h3>
                    <button onClick={saveImageChanges} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold uppercase text-sm shadow-lg transition">Saqlash</button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {/* Mavjud Rasmlar */}
                    {tempImages.map((img, idx) => (
                        <div key={idx} onClick={() => toggleImageDelete(img)} className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${imagesToDelete.includes(img) ? 'border-red-500 opacity-50 scale-95' : 'border-transparent hover:border-indigo-500'}`}>
                            <img src={img} className="w-full h-full object-cover"/>
                            {imagesToDelete.includes(img) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 text-white font-bold"><Trash2 size={24}/></div>
                            )}
                            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{idx === 0 ? 'Asosiy' : `#${idx+1}`}</div>
                        </div>
                    ))}

                    {/* Rasm Qo'shish Tugmasi */}
                    {tempImages.length < 20 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-500 transition group">
                            <Plus size={32} className="text-gray-400 group-hover:text-indigo-500 mb-2"/>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-indigo-500 uppercase">Qo'shish</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload}/>
                        </label>
                    )}
                </div>
                <p className="text-center text-xs text-gray-400 mt-4">O'chirmoqchi bo'lgan rasmingiz ustiga bosing. O'zgarishlarni saqlash uchun "Saqlash" tugmasini bosing.</p>
            </div>
        </div>
      )}

      {/* --- EXCEL MODAL --- */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md relative border dark:border-gray-700">
                <button onClick={() => setIsExcelModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={20}/></button>
                <h3 className="text-xl font-black uppercase text-gray-800 dark:text-white mb-4">Excel yuklash</h3>
                <button onClick={downloadTemplate} className="w-full mb-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Download size={16}/> Namuna yuklab olish</button>
                <label className="w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"><UploadCloud size={32} className="text-gray-400"/><span className="text-xs text-gray-500 mt-2">Faylni tanlang</span><input type="file" className="hidden" accept=".xlsx" onChange={handleExcelUpload}/></label>
            </div>
        </div>
      )}

      {/* --- YANGILANGAN 3 BOSQICHLI MAHSULOT MODALI --- */}
      {isProductModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative border dark:border-gray-700 animate-fade-in">
                <button onClick={() => setIsProductModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={20}/></button>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase text-gray-800 dark:text-white">{isEditing ? 'Tahrirlash' : 'Mahsulot'}</h3>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{productFormStep}/3</span>
                </div>
                
                {/* 1-BOSQICH: NOM (UZ/RU) */}
                {productFormStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nomi (UZ)</label>
                            <input 
                                className={`w-full p-3 border rounded-xl font-bold dark:bg-gray-700 dark:text-white ${formErrors.nameUz ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} 
                                value={nameUz} 
                                onChange={e => setNameUz(e.target.value)} 
                                placeholder="Mahsulot nomi UZ" 
                            />
                            {formErrors.nameUz && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {formErrors.nameUz}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nomi (RUS)</label>
                            <input 
                                className={`w-full p-3 border rounded-xl font-bold dark:bg-gray-700 dark:text-white ${formErrors.nameRu ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} 
                                value={nameRu} 
                                onChange={e => setNameRu(e.target.value)} 
                                placeholder="Mahsulot nomi RU" 
                            />
                            {formErrors.nameRu && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {formErrors.nameRu}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Kategoriya</label>
                            <select className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl font-bold" value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* 2-BOSQICH: XUSUSIYATLAR (UZ/RU) */}
                {productFormStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Xususiyatlari (UZ)</label>
                            <textarea 
                                className={`w-full h-24 p-3 border rounded-xl font-medium resize-none dark:bg-gray-700 dark:text-white ${formErrors.specsUz ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} 
                                value={specsUz} 
                                onChange={e => setSpecsUz(e.target.value)} 
                                placeholder="Rang, Xotira, Chip..." 
                            />
                            {formErrors.specsUz && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {formErrors.specsUz}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Xususiyatlari (RUS)</label>
                            <textarea 
                                className={`w-full h-24 p-3 border rounded-xl font-medium resize-none dark:bg-gray-700 dark:text-white ${formErrors.specsRu ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} 
                                value={specsRu} 
                                onChange={e => setSpecsRu(e.target.value)} 
                                placeholder="Цвет, Память, Чип..." 
                            />
                            {formErrors.specsRu && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {formErrors.specsRu}</p>}
                        </div>
                    </div>
                )}

                {/* 3-BOSQICH: NARX, CHIZILGAN NARX, OMBOR */}
                {productFormStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex gap-4">
                            <div className="w-full">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Narxi (UZS)</label>
                                <input 
                                    type="number" 
                                    className={`w-full p-3 border rounded-xl font-black text-indigo-600 text-lg dark:bg-gray-700 dark:text-white ${formErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} 
                                    value={currentProduct.price === 0 ? '' : currentProduct.price} 
                                    onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} 
                                    placeholder="0" 
                                />
                                {formErrors.price && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {formErrors.price}</p>}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="text-xs font-bold text-red-400 uppercase mb-1 block">Chizilgan narx (Old)</label>
                                <input type="number" className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl font-bold text-gray-500" value={currentProduct.oldPrice || ''} onChange={e => setCurrentProduct({...currentProduct, oldPrice: Number(e.target.value)})} placeholder="Chegirma uchun" />
                            </div>
                            <div className="w-1/2">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Omborda</label>
                                <input 
                                    type="number" 
                                    className={`w-full p-3 border rounded-xl font-bold dark:bg-gray-700 dark:text-white ${formErrors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} 
                                    value={currentProduct.stock === 0 ? '' : currentProduct.stock} 
                                    onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} 
                                    placeholder="Soni" 
                                />
                                {formErrors.stock && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {formErrors.stock}</p>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-2">
                    {productFormStep > 1 && <button onClick={() => setProductFormStep(productFormStep - 1)} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold uppercase text-xs">Ortga</button>}
                    <button onClick={handleProductSubmit} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold uppercase text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-600/30">
                        {productFormStep === 3 ? (isEditing ? 'Saqlash' : 'Yakunlash') : 'Keyingi'}
                    </button>
                </div>
             </div>
         </div>
      )}

      {/* --- Discount Modal --- */}
      {isDiscountModalOpen && discountProduct && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative border dark:border-gray-700">
                <button onClick={() => setIsDiscountModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={20}/></button>
                <h3 className="text-xl font-black uppercase mb-6 text-gray-800 dark:text-white">Chegirma qo'shish</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Chegirma foizi (%)</label>
                        <input className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl font-bold" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} placeholder="Masalan: 20" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Davomiyligi (Kun)</label>
                        <input className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl font-bold" value={discountDays} onChange={e => setDiscountDays(e.target.value)} placeholder="Masalan: 3" />
                    </div>
                    <button onClick={applyDiscount} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-green-600 mt-4">Qo'llash</button>
                </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default Admin;
