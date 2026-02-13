import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, User, Order, INITIAL_PRODUCTS, Question, ChatMessage, Review, Language } from './types';
import { supabase } from './supabaseClient';

// --- TARJIMALAR ---
const translations = {
  uz: {
    home: "Bosh Sahifa",
    categories: "Bo'limlar",
    contact: "Aloqa",
    search: "Qidirish...",
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    menu: "Menyu",
    accountLogin: "Hisobga kirish",
    profile: "Profilim",
    cart: "Savatcha",
    myOrders: "Buyurtmalarim",
    returns: "Qaytarishlar",
    wishlist: "Sevimli mahsulotlar",
    promo: "Promokodlarim",
    logout: "Chiqish",
    totalRevenue: "Jami Tushum",
    orders: "Buyurtmalar",
    clients: "Mijozlar",
    products: "Tovarlar",
    finance: "Moliya",
    questions: "Savollar",
    reviews: "Sharhlar",
    chat: "Chat",
    adminPanel: "Admin Panel",
    backToSite: "Saytga qaytish",
    buyNow: "Hozir sotib olish",
    addToCart: "Savatga qo'shish",
    specs: "Xususiyatlar",
    price: "Narx",
    stock: "Ombor",
    rating: "Reyting",
    brand: "Brand",
    category: "Kategoriya",
    pieces: "dona",
    submit: "Yuborish",
    cancel: "Bekor qilish",
    save: "Saqlash",
    edit: "Tahrirlash",
    delete: "O'chirish",
    status: "Holat",
    date: "Sana",
    total: "Jami",
    paymentMethod: "To'lov turi",
    cash: "Naqd pul",
    card: "Karta orqali",
    clickToPay: "To'lovni tasdiqlash",
    smsVerify: "SMS Tasdiqlash",
    enterCode: "Kodni kiriting",
    successOrder: "Buyurtma muvaffaqiyatli qabul qilindi!",
    emptyCart: "Savatcha bo'sh",
    shopping: "Xarid qilish",
    checkout: "Rasmiylashtirish",
    pros: "Afzalliklar",
    cons: "Kamchiliklar",
    comment: "Sharh",
    uploadPhoto: "Rasm yuklash",
    leaveReview: "Sharh qoldirish",
    nextProduct: "Keyingi mahsulot",
    adminAnswer: "Admin javobi",
    waitAnswer: "Javob kutilmoqda...",
    noQuestions: "Hozircha savollar yo'q",
    askQuestion: "Mahsulot haqida savol bering...",
    send: "Yuborish",
    similarProducts: "O'xshash mahsulotlar",
    nothingFound: "Hech narsa topilmadi",
    changeSearch: "Qidiruv so'zini o'zgartirib ko'ring",
    banner1Title: "Yangi Avlod Texnologiyasi",
    banner1Sub: "iPhone 15 Pro Max",
    banner2Title: "O'yin Uchun Yaratilgan",
    banner2Sub: "ASUS ROG Strix",
    banner3Title: "Professional Ijodkorlik",
    banner3Sub: "MacBook Pro M3",
    detail: "Batafsil",
    all: "Barchasi",
    personalData: "Shaxsiy ma'lumotlar",
    name: "Ism",
    phone: "Telefon",
    address: "Manzil",
    passport: "Pasport",
    orderHistory: "Buyurtmalar Tarixi",
    returnHistory: "Qaytarishlar Tarixi",
    soon: "Tez kunda...",
    orderNo: "No",
    cancelOrder: "Buyurtmani bekor qilish",
    reason: "Sabab",
    typeMessage: "Xabar yozing...",
    adminChat: "Admin bilan suhbat",
    info: "Ma'lumot",
    aboutUs: "Biz haqimizda",
    delivery: "Yetkazib berish",
    paymentTypes: "To'lov turlari",
    aboutUsText: "IMANTARGO jamoasi 2025-yildan buyon elektron tijorat va raqamli xizmatlar sohasida oʻz oʻrniga ega boʻlib kelmoqda. Bizning asosiy maqsadimiz — mijozlarimizga nafaqat sifatli mahsulot, balki zamonaviy va qulay xarid imkoniyatlarini taqdim etishdir. Oʻtgan vaqt davomida biz yuzlab mijozlarning ishonchini qozondik va bozordagi eng ishonchli toʻlov tizimlari bilan hamkorlikni yoʻlga qoʻydik. Biz bilan xarid qilish — bu shaffoflik, tezkorlik va kafolatlangan sifat demakdir.",
    deliveryText: "Biz butun O'zbekiston bo'ylab 12ta viloyatga shaxsan o'zimiz yetkazib beramiz buyurtmalarga o'zimiz kafolat beramiz",
    paymentText: "Biz istalgan tolov tizimlarini qabul qilamiz",
    close: "Yopish",
    Noutbuklar: "Noutbuklar",
    Telefonlar: "Telefonlar",
    Monobloklar: "Monobloklar",
    "Sport mahsulotlari": "Sport mahsulotlari",
    Planshetlar: "Planshetlar",
    Kompyuterlar: "Kompyuterlar"
  },
  ru: {
    home: "Главная",
    categories: "Категории",
    contact: "Контакты",
    search: "Поиск...",
    login: "Войти",
    register: "Регистрация",
    menu: "Меню",
    accountLogin: "Вход в аккаунт",
    profile: "Профиль",
    cart: "Корзина",
    myOrders: "Мои заказы",
    returns: "Возвраты",
    wishlist: "Избранное",
    promo: "Промокоды",
    logout: "Выйти",
    totalRevenue: "Общая выручка",
    orders: "Заказы",
    clients: "Клиенты",
    products: "Товары",
    finance: "Финансы",
    questions: "Вопросы",
    reviews: "Отзывы",
    chat: "Чат",
    adminPanel: "Админ Панель",
    backToSite: "Вернуться на сайт",
    buyNow: "Купить сейчас",
    addToCart: "В корзину",
    specs: "Характеристики",
    price: "Цена",
    stock: "Склад",
    rating: "Рейтинг",
    brand: "Бренд",
    category: "Категория",
    pieces: "шт",
    submit: "Отправить",
    cancel: "Отмена",
    save: "Сохранить",
    edit: "Редактировать",
    delete: "Удалить",
    status: "Статус",
    date: "Дата",
    total: "Итого",
    paymentMethod: "Способ оплаты",
    cash: "Наличные",
    card: "Картой",
    clickToPay: "Подтвердить оплату",
    smsVerify: "СМС Подтверждение",
    enterCode: "Введите код",
    successOrder: "Заказ успешно принят!",
    emptyCart: "Корзина пуста",
    shopping: "Перейти к покупкам",
    checkout: "Оформить",
    pros: "Преимущества",
    cons: "Недостатки",
    comment: "Комментарий",
    uploadPhoto: "Загрузить фото",
    leaveReview: "Оставить отзыв",
    nextProduct: "Следующий товар",
    adminAnswer: "Ответ админа",
    waitAnswer: "Ожидается ответ...",
    noQuestions: "Пока нет вопросов",
    askQuestion: "Задать вопрос о товаре...",
    send: "Отправить",
    similarProducts: "Похожие товары",
    nothingFound: "Ничего не найдено",
    changeSearch: "Попробуйте изменить запрос",
    banner1Title: "Технологии Нового Поколения",
    banner1Sub: "iPhone 15 Pro Max",
    banner2Title: "Создано Для Игр",
    banner2Sub: "ASUS ROG Strix",
    banner3Title: "Профессиональное Творчество",
    banner3Sub: "MacBook Pro M3",
    detail: "Подробнее",
    all: "Все",
    personalData: "Личные данные",
    name: "Имя",
    phone: "Телефон",
    address: "Адрес",
    passport: "Паспорт",
    orderHistory: "История Заказов",
    returnHistory: "История Возвратов",
    soon: "Скоро...",
    orderNo: "№",
    cancelOrder: "Отменить заказ",
    reason: "Причина",
    typeMessage: "Напишите сообщение...",
    adminChat: "Чат с админом",
    info: "Информация",
    aboutUs: "О нас",
    delivery: "Доставка",
    paymentTypes: "Способы оплаты",
    aboutUsText: "Команда IMANTARGO занимает свое место в сфере электронной коммерции и цифровых услуг с 2025 года. Наша главная цель — предоставить нашим клиентам не только качественную продукцию, но и современные и удобные возможности для покупок. За прошедшее время мы завоевали доверие сотен клиентов и наладили сотрудничество с самыми надежными платежными системами на рынке. Покупки у нас — это прозрачность, скорость и гарантированное качество.",
    deliveryText: "Мы доставляем сами лично во все 12 областей Узбекистана, и сами гарантируем заказы",
    paymentText: "Мы принимаем любые платежные системы",
    close: "Закрыть",
    Noutbuklar: "Ноутбуки",
    Telefonlar: "Телефоны",
    Monobloklar: "Моноблоки",
    "Sport mahsulotlari": "Спорттовары",
    Planshetlar: "Планшеты",
    Kompyuterlar: "Компьютеры"
  },
  en: {
    home: "Home",
    categories: "Categories",
    contact: "Contact",
    search: "Search...",
    login: "Login",
    register: "Register",
    menu: "Menu",
    accountLogin: "Account Login",
    profile: "Profile",
    cart: "Cart",
    myOrders: "My Orders",
    returns: "Returns",
    wishlist: "Wishlist",
    promo: "Promo Codes",
    logout: "Logout",
    totalRevenue: "Total Revenue",
    orders: "Orders",
    clients: "Customers",
    products: "Products",
    finance: "Finance",
    questions: "Questions",
    reviews: "Reviews",
    chat: "Chat",
    adminPanel: "Admin Panel",
    backToSite: "Back to Site",
    buyNow: "Buy Now",
    addToCart: "Add to Cart",
    specs: "Specs",
    price: "Price",
    stock: "Stock",
    rating: "Rating",
    brand: "Brand",
    category: "Category",
    pieces: "pcs",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    status: "Status",
    date: "Date",
    total: "Total",
    paymentMethod: "Payment Method",
    cash: "Cash",
    card: "Card",
    clickToPay: "Confirm Payment",
    smsVerify: "SMS Verification",
    enterCode: "Enter Code",
    successOrder: "Order placed successfully!",
    emptyCart: "Cart is empty",
    shopping: "Shop Now",
    checkout: "Checkout",
    pros: "Pros",
    cons: "Cons",
    comment: "Comment",
    uploadPhoto: "Upload Photo",
    leaveReview: "Leave Review",
    nextProduct: "Next Product",
    adminAnswer: "Admin Answer",
    waitAnswer: "Waiting for answer...",
    noQuestions: "No questions yet",
    askQuestion: "Ask a question...",
    send: "Send",
    similarProducts: "Similar Products",
    nothingFound: "Nothing found",
    changeSearch: "Try changing the search query",
    banner1Title: "Next Gen Technology",
    banner1Sub: "iPhone 15 Pro Max",
    banner2Title: "Built For Gaming",
    banner2Sub: "ASUS ROG Strix",
    banner3Title: "Professional Creativity",
    banner3Sub: "MacBook Pro M3",
    detail: "Details",
    all: "All",
    personalData: "Personal Data",
    name: "Name",
    phone: "Phone",
    address: "Address",
    passport: "Passport",
    orderHistory: "Order History",
    returnHistory: "Return History",
    soon: "Coming soon...",
    orderNo: "No",
    cancelOrder: "Cancel Order",
    reason: "Reason",
    typeMessage: "Type a message...",
    adminChat: "Chat with Admin",
    info: "Information",
    aboutUs: "About Us",
    delivery: "Delivery",
    paymentTypes: "Payment Methods",
    aboutUsText: "The IMANTARGO team has been holding its place in the field of e-commerce and digital services since 2025. Our main goal is to provide our customers not only with quality products but also with modern and convenient shopping opportunities. Over time, we have gained the trust of hundreds of customers and established cooperation with the most reliable payment systems in the market. Shopping with us means transparency, speed, and guaranteed quality.",
    deliveryText: "We deliver personally to all 12 regions throughout Uzbekistan and guarantee orders ourselves",
    paymentText: "We accept any payment systems",
    close: "Close",
    Noutbuklar: "Laptops",
    Telefonlar: "Phones",
    Monobloklar: "All-in-One",
    "Sport mahsulotlari": "Sport Goods",
    Planshetlar: "Tablets",
    Kompyuterlar: "Computers"
  }
};

interface ShopContextType {
  products: Product[];
  orders: Order[];
  users: User[];
  cart: CartItem[];
  questions: Question[];
  messages: ChatMessage[];
  currentUser: User | null;
  isDarkMode: boolean;
  language: Language;
  resetPassword: (phone: string, newPass: string) => Promise<boolean>;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  addToCart: (product: Product, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  registerUser: (user: User) => void;
  checkUserExists: (phone: string) => boolean;
  loginUser: (phone: string, pass: string) => boolean;
  logoutUser: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'date' | 'deliveryDate' | 'isReviewed' | 'fundsTransferred' | 'deliveryTimestamp'>) => void;
  cancelOrder: (orderId: number, reason?: string) => void; // Ixtiyoriy sabab qo'shildi
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  updateOrderStatus: (id: number, status: Order['status'], cancelReason?: string) => void;
  addQuestion: (productId: number, text: string) => void;
  answerQuestion: (questionId: number, answer: string) => void;
  sendOrderMessage: (orderId: number, text: string, sender: 'admin' | 'user') => void;
  addReview: (orderId: number, review: Review) => void;
  transferFunds: (orderId: number) => void;
  toggleTheme: () => void;
}


const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children?: ReactNode }) => {
  // --- STATE LAR ---
  // Mahsulotlar (Local Storage)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // --- SUPABASE STATE LARI ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // --- LOCAL STATE LAR ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Theme & Language
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'uz');

  // --- DATA FETCHING ---
  const fetchData = async () => {
      // 1. Buyurtmalar (Mapping snake_case -> camelCase)
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordersData) {
          const formattedOrders = ordersData.map(o => ({
              ...o,
              items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
              cardInfo: o.card_info ? (typeof o.card_info === 'string' ? JSON.parse(o.card_info) : o.card_info) : undefined,
              userName: o.user_name,
              userPhone: o.user_phone,
              totalPrice: o.total_price,
              paymentMethod: o.payment_method,
              deliveryDate: o.delivery_date || '',
              deliveryTimestamp: o.created_at ? new Date(o.created_at).getTime() + 172800000 : 0, 
              fundsTransferred: o.funds_transferred,
              isReviewed: o.is_reviewed,
              cancelReason: o.cancel_reason
          }));
          setOrders(formattedOrders);
      }

      // 2. Savollar
      const { data: qData } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
      if (qData) {
          const formattedQ = qData.map(q => ({
              ...q,
              userName: q.user_name,
              productId: q.product_id || 0,
              isReadByUser: false 
          }));
          setQuestions(formattedQ);
      }

      // 3. Xabarlar
      const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (msgData) {
          const formattedMsg = msgData.map(m => ({ ...m, orderId: m.order_id }));
          setMessages(formattedMsg);
      }

      // 4. Foydalanuvchilar
      const { data: usersData } = await supabase.from('imantargo').select('*');
      if (usersData) setUsers(usersData);
  };

  useEffect(() => {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
  }, []);

  // Persistence
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('language', language), [language]);
  useEffect(() => { if(currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser)); else localStorage.removeItem('currentUser'); }, [currentUser]);
  useEffect(() => { if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); } }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const t = (key: string) => translations[language][key as keyof typeof translations['uz']] || key;

  // --- CART & USER ACTIONS ---
  const addToCart = (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      return existing ? prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item) : [...prev, { ...product, qty }];
    });
  };
  const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id !== id));
  const clearCart = () => setCart([]);

  const registerUser = async (user: User) => {
    // Supabase registeri Login/Register modalida, bu yerda state yangilanadi
    const newUser = { ...user, lastLocation: "41.311081, 69.240562", lastSeen: new Date().toLocaleTimeString(), avatar: '' };
    setCurrentUser(newUser);
  };
  const checkUserExists = (phone: string) => users.some(u => u.phone === phone);
  const loginUser = (phone: string, pass: string) => {
    const user = users.find(u => u.phone === phone && u.password === pass);
    if (user) { setCurrentUser(user); return true; }
    return false;
  };
  const logoutUser = () => setCurrentUser(null);
  const updateUserAvatar = (avatarUrl: string) => { if (currentUser) setCurrentUser({ ...currentUser, avatar: avatarUrl }); };
  const resetPassword = async (phone: string, newPass: string) => {
    const user = users.find(u => u.phone === phone);
    if (!user) return false;
    const { error } = await supabase.from('imantargo').update({ password: newPass }).eq('phone', phone);
    if (!error) { fetchData(); return true; }
    return false;
  };

  // --- SUPABASE & ORDER ACTIONS ---

  const placeOrder = async (orderData: any) => {
    const { error } = await supabase.from('orders').insert([{
        user_name: orderData.userName,
        user_phone: orderData.userPhone,
        address: orderData.address,
        items: JSON.stringify(orderData.items),
        total_price: orderData.totalPrice,
        status: 'Yangi',
        payment_method: orderData.paymentMethod,
        card_info: orderData.cardInfo ? JSON.stringify(orderData.cardInfo) : null,
        created_at: new Date().toISOString(),
        funds_transferred: false
    }]);
    if (!error) { alert("Buyurtma qabul qilindi!"); setCart([]); fetchData(); }
    else alert("Xatolik: " + error.message);
  };

  // --- ESCROW: STATUS YANGILASH ---
  const updateOrderStatus = async (id: number, status: Order['status'], cancelReason?: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    let updateData: any = { status };

    // Agar bekor qilish sababi berilgan bo'lsa, bazaga yozamiz
    if (cancelReason) {
        updateData.cancel_reason = cancelReason;
    }

    // 1. Agar 'Yetkazildi' va to'lov 'Karta' bo'lsa -> Pulni o'tkazish (Escrow release)
    if (status === 'Yetkazildi' && order.paymentMethod === 'card') {
        updateData.funds_transferred = true;
    }

    // 2. Agar 'Bekor qilindi' bo'lsa -> Pulni admin shotiga o'tkazmaslik
    if (status === 'Bekor qilindi') {
        updateData.funds_transferred = false;
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', id);
    if (!error) fetchData();
  };

  const cancelOrder = async (orderId: number, reason?: string) => {
      // Bekor qilishda ham updateOrderStatus ni chaqiramiz
      await updateOrderStatus(orderId, 'Bekor qilindi', reason);
  };

  const transferFunds = async (orderId: number) => {
      await supabase.from('orders').update({ funds_transferred: true }).eq('id', orderId);
      fetchData();
  };

  // --- QUESTIONS & MESSAGES ---
  const addQuestion = async (productId: number, text: string) => {
    if(!currentUser) return alert("Avval tizimga kiring!");
    const { error } = await supabase.from('questions').insert([{ user_name: currentUser.name, product_id: productId, text, date: new Date().toLocaleDateString() }]);
    if (!error) { alert("Savol yuborildi!"); fetchData(); }
  };
  const answerQuestion = async (questionId: number, answer: string) => {
    await supabase.from('questions').update({ answer }).eq('id', questionId);
    fetchData();
  };
  const sendOrderMessage = async (orderId: number, text: string, sender: 'admin' | 'user') => {
    await supabase.from('messages').insert([{ order_id: orderId, text, sender, timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }]);
    fetchData();
  };

  const addReview = async (orderId: number, review: Review) => {
      setProducts(prev => prev.map(p => {
          if (p.id === review.productId) {
              const newReviews = [...(p.reviews || []), review];
              const avg = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
              return { ...p, reviews: newReviews, rating: parseFloat(avg.toFixed(1)) };
          }
          return p;
      }));
      await supabase.from('orders').update({ is_reviewed: true }).eq('id', orderId);
      fetchData();
  };

  // Local products
  const addProduct = (product: Product) => setProducts(prev => [...prev, product]);
  const updateProduct = (updatedProduct: Product) => setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  const deleteProduct = (id: number) => setProducts(prev => prev.filter(p => p.id !== id));

  return (
    <ShopContext.Provider value={{
      products, orders, users, cart, questions, messages, currentUser, isDarkMode, language, setLanguage, t,
      addToCart, removeFromCart, clearCart, registerUser, checkUserExists,
      loginUser, logoutUser, resetPassword, placeOrder, cancelOrder, updateUserAvatar, 
      addProduct, updateProduct, deleteProduct, updateOrderStatus,
      addQuestion, answerQuestion, sendOrderMessage, addReview, transferFunds, toggleTheme
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};
