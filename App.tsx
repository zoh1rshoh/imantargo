import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShopProvider, useShop } from './store';
import { ShoppingBag, User as UserIcon, LogIn, Search, Star, Phone, Instagram, Send, Menu, X, ArrowRight, Zap, Lock, Facebook, MapPin, Camera, Image as ImageIcon, Heart, Ticket, RotateCcw, Package, ChevronRight, LogOut, Banknote, CreditCard, Smartphone, MessageCircle, ChevronLeft, ScanFace, Filter, Moon, Sun, Trash2, Youtube, VideoOff, XCircle, Globe } from 'lucide-react';
import CartModal from './CartModal';
import ProductDetailModal from './ProductDetailModal';
import Admin from './Admin';
import OrderChatModal from './OrderChatModal';
import ReviewModal from './ReviewModal';
import { Product, CATEGORIES, CATEGORY_BRANDS, Review, Order } from './types';
import { supabase } from './supabaseClient';
import GlowingSearch from './GlowingSearch';
import Register from './Register';
// --- Helper Component for Animation ---
const FlyingIcon: React.FC<{ startX: number, startY: number, destX: number, destY: number, onComplete: () => void }> = ({ startX, startY, destX, destY, onComplete }) => {
    const [style, setStyle] = useState<React.CSSProperties>({ 
        left: startX, 
        top: startY, 
        opacity: 1, 
        transform: 'scale(1)',
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
    });

    useEffect(() => {
        // Trigger animation in next frame
        const frame = requestAnimationFrame(() => {
            setStyle(prev => ({
                ...prev,
                left: destX,
                top: destY,
                opacity: 0,
                transform: 'scale(0.2)'
            }));
        });
        
        const timer = setTimeout(onComplete, 800);
        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
        };
    }, [destX, destY, onComplete]);

    return (
        <div style={style} className="text-indigo-600 dark:text-indigo-400 p-2 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-indigo-100 dark:border-indigo-900">
            <ShoppingBag size={24} fill="currentColor" />
        </div>
    );
};

// --- Components ---

const InfoModal = ({ isOpen, onClose, title, content }: { isOpen: boolean, onClose: () => void, title: string, content: string }) => {
  const { t } = useShop();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-8 relative animate-fade-in shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-600 dark:text-gray-300">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-black uppercase mb-6 text-indigo-600 dark:text-indigo-400">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify text-sm font-medium whitespace-pre-line">
          {content}
        </p>
        <button onClick={onClose} className="w-full mt-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-indigo-700 transition">
          {t('close')}
        </button>
      </div>
    </div>
  );
};

const Navbar = ({ onOpenLogin, onOpenRegister, setSearchQuery, isSearchOpen, setIsSearchOpen, onOpenCart }: any) => {
  const { cart, currentUser, isDarkMode, toggleTheme, language, setLanguage, t } = useShop();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <nav className="bg-white dark:bg-gray-900 sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black text-indigo-600 dark:text-indigo-400 italic uppercase tracking-tighter z-50">IMANTARGO</Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">{t('home')}</Link>
          <a href="/#categories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">{t('categories')}</a>
          <a href="/#contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">{t('contact')}</a>
        </div>

        {/* Right Side Icons & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
           
           {/* Language Switcher */}
           <div className="relative">
               <button 
                  onClick={() => setIsLangOpen(!isLangOpen)} 
                  className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
               >
                   <Globe size={14} /> {language}
               </button>
               {isLangOpen && (
                   <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col min-w-[80px]">
                       {['uz', 'ru', 'en'].map((lang) => (
                           <button 
                                key={lang} 
                                onClick={() => { setLanguage(lang as any); setIsLangOpen(false); }}
                                className={`px-4 py-2 text-xs font-bold uppercase text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${language === lang ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}
                           >
                               {lang}
                           </button>
                       ))}
                   </div>
               )}
           </div>

           {/* Theme Toggle */}
           <button 
              onClick={toggleTheme} 
              className="relative p-1 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center transition-colors duration-300 w-14 h-8"
              aria-label="Toggle Theme"
           >
              <div className={`absolute w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}>
                  {isDarkMode ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-orange-400" />}
              </div>
           </button>
        
          {currentUser ? (
             <div className="relative group z-40">
                <Link to="/profile?tab=profile" className="flex items-center gap-2 p-1 pl-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800 transition hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                   <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            {currentUser.name.charAt(0)}
                        </div>
                      )}
                   </div>
                   {totalItems > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">{totalItems}</span>}
                </Link>
                
                {/* Dropdown Menu (Desktop) - Added padding-top (bridge) to prevent disappearing on hover */}
                <div className="absolute right-0 top-full pt-4 w-72 hidden group-hover:block animate-fade-in z-50">
                   <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-xl p-2">
                       <div className="px-4 py-3 border-b dark:border-gray-700 mb-2">
                          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{currentUser.phone}</p>
                       </div>
                       <div className="grid grid-cols-1 gap-1">
                           <Link to="/profile?tab=profile" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition">
                              <UserIcon size={16} /> {t('profile')}
                           </Link>
                           <Link to="/profile?tab=cart" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition">
                              <div className="relative">
                                <ShoppingBag size={16} />
                                {totalItems > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                              </div>
                              {t('cart')}
                           </Link>
                           <Link to="/profile?tab=orders" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition">
                              <Package size={16} /> {t('myOrders')}
                           </Link>
                           <Link to="/profile?tab=returns" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition">
                              <RotateCcw size={16} /> {t('returns')}
                           </Link>
                           <Link to="/profile?tab=wishlist" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition">
                              <Heart size={16} /> {t('wishlist')}
                           </Link>
                           <Link to="/profile?tab=promo" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition">
                              <Ticket size={16} /> {t('promo')}
                           </Link>
                       </div>
                   </div>
                </div>
             </div>
          ) : (
             <div className="hidden md:flex gap-2">
               <button onClick={onOpenLogin} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition">
                 <LogIn size={14} /> {t('login')}
               </button>
               <button onClick={onOpenRegister} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                 {t('register')}
               </button>
             </div>
          )}

          {/* Cart Button (Always visible) - Added ID for animation target */}
          {currentUser && (
              <button 
                id="navbar-cart-btn"
                onClick={onOpenCart} 
                className="md:hidden relative p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                  <ShoppingBag size={20} />
                  {totalItems > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white dark:border-gray-900">{totalItems}</span>}
              </button>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-gray-800 dark:text-gray-200">
             <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 animate-fade-in flex flex-col md:hidden">
            <div className="p-4 flex justify-between items-center border-b dark:border-gray-800">
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase">{t('menu')}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white text-red-500 rounded-full shadow-lg border hover:bg-red-50"><X size={20}/></button>
            </div>
            
            <div className="flex-grow p-6 flex flex-col gap-6 overflow-y-auto">
                <div className="space-y-4">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-bold text-gray-800 dark:text-white hover:text-indigo-600">{t('home')}</Link>
                    <a href="/#categories" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-bold text-gray-800 dark:text-white hover:text-indigo-600">{t('categories')}</a>
                    <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-bold text-gray-800 dark:text-white hover:text-indigo-600">{t('contact')}</a>
                </div>

                {!currentUser && (
                    <div className="mt-auto border-t dark:border-gray-800 pt-6 space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase">{t('accountLogin')}</p>
                        <button 
                            onClick={() => { onOpenLogin(); setIsMobileMenuOpen(false); }} 
                            className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-black uppercase flex items-center justify-center gap-2"
                        >
                            <LogIn size={18} /> {t('login')}
                        </button>
                        <button 
                            onClick={() => { onOpenRegister(); setIsMobileMenuOpen(false); }} 
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase shadow-lg shadow-indigo-200"
                        >
                            {t('register')}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};

// --- Modals (Auth, Admin, Map) ---

const AuthModal = ({ isOpen, onClose, type, onOpenMap, onForgotPassword }: { isOpen: boolean, onClose: () => void, type: 'login' | 'register', onOpenMap: (cb: (addr: string) => void) => void, onForgotPassword: () => void }) => {
  const { loginUser, registerUser, checkUserExists, t } = useShop();
  
  // Steps: 1 = Form, 2 = SMS, 3 = Face ID
  const [step, setStep] = useState(1);
  
  // Form Data
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', address: '', passportSeries: '', passportNumber: '' });
  
  // SMS Logic
  const [smsCode, setSmsCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showSmsNotification, setShowSmsNotification] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
        // Reset everything on close
        setStep(1);
        setFormData({ name: '', phone: '', password: '', address: '', passportSeries: '', passportNumber: '' });
        setSmsCode('');
        setGeneratedCode(null);
        setShowSmsNotification(false);
        setCameraError(null);
        setLoginError(null);
        stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
  };

  const startCamera = async () => {
      setCameraError(null);
      try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              streamRef.current = stream;
              if(videoRef.current) {
                  videoRef.current.srcObject = stream;
              }
          } else {
              setCameraError("Kamera qurilmasi topilmadi yoki ruxsat yo'q.");
          }
      } catch (err: any) {
          console.error("Camera error:", err);
          if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
             setCameraError("Kamera topilmadi. Iltimos qurilmani tekshiring.");
          } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             setCameraError("Kameraga ruxsat berilmadi.");
          } else {
             setCameraError("Kamerani ishga tushirishda xatolik.");
          }
      }
  };

  // Start camera when step becomes 3
  useEffect(() => {
      if (isOpen && type === 'register' && step === 3) {
          startCamera();
      } else {
          stopCamera();
      }
  }, [step, isOpen, type]);

  const handleNext = () => {
    if (type === 'login') {
      setLoginError(null);

      if (!formData.phone || !formData.password) {
        setLoginError("Telefon raqami va parolni kiriting");
        return;
      }

      const exists = checkUserExists(formData.phone);
      if (!exists) {
        setLoginError("Avval ro'yxatdan o'ting");
        return;
      }

      if (loginUser(formData.phone, formData.password)) {
        onClose();
      } else {
        setLoginError("Parol xato");
      }
    } else {
      // Registration Step 1: Validate & Generate SMS
      if (step === 1) {
          if (!formData.name || !formData.phone || !formData.password || !formData.address || !formData.passportSeries || !formData.passportNumber) {
            alert("Barcha maydonlarni to'ldiring!");
            return;
          }
          if (formData.passportSeries.length !== 2) return alert("Pasport seriyasi 2 ta harf bo'lishi kerak");
          if (formData.passportNumber.length !== 7) return alert("Pasport raqami 7 ta raqam bo'lishi kerak");
          
          // Check Duplicate
          if (checkUserExists(formData.phone)) {
              alert("Bu raqam avval ro'yxatdan o'tgan! Iltimos, boshqa raqam kiriting yoki tizimga kiring.");
              return;
          }

          // Generate SMS
          const code = Math.floor(1000 + Math.random() * 9000).toString();
          setGeneratedCode(code);
          setShowSmsNotification(true);
          setTimeout(() => setShowSmsNotification(false), 10000); // Hide after 10s
          setStep(2);
      } 
      // Registration Step 2: Verify SMS
      else if (step === 2) {
          if (smsCode === generatedCode) {
              setShowSmsNotification(false);
              setStep(3); // Go to FaceID
          } else {
              alert("Kod xato!");
          }
      }
    }
  };

  const handleFaceVerify = async () => {
    try {
        // "users" emas, "imantargo" jadvaliga yozamiz
        const { error } = await supabase
            .from('imantargo') 
            .insert([
                { 
                    name: formData.name,
                    phone: formData.phone,
                    password: formData.password,
                    address: formData.address,
                    passport: `${formData.passportSeries.toUpperCase()} ${formData.passportNumber}`,
                    role: 'user'
                }
            ]);

        if (error) {
            alert("Xatolik: " + error.message);
        } else {
            // Do'kon (Store) ga ham saqlaymiz (tez ishlashi uchun)
            registerUser({
                name: formData.name,
                phone: formData.phone,
                password: formData.password,
                address: formData.address,
                passport: `${formData.passportSeries.toUpperCase()} ${formData.passportNumber}`,
                regTime: new Date().toLocaleString(),
            });
            
            alert("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
            onClose();
        }
    } catch (err) {
        alert("Internet yo'q yoki server xatosi!");
    }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      
      {/* SMS Notification Toast */}
      {showSmsNotification && generatedCode && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-white border-l-4 border-green-500 shadow-2xl rounded-r-xl p-4 flex items-center gap-4 animate-bounce">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <MessageCircle size={24} />
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">{t('smsVerify')}</p>
                  <p className="text-xl font-black text-gray-800 tracking-widest">{generatedCode}</p>
              </div>
          </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-md relative animate-fade-in">
        <button 
            onClick={onClose} 
            className="absolute -top-4 -right-4 p-2 bg-white text-red-500 rounded-full shadow-lg border hover:bg-gray-100 z-50 transition-transform hover:scale-110"
        >
            <X size={20} />
        </button>
        
        {/* Step 3: Face ID (Register Only) */}
        {type === 'register' && step === 3 ? (
             <div className="text-center animate-fade-in">
                 <h2 className="text-xl font-black uppercase mb-4 dark:text-white">Face ID Tasdiqlash</h2>
                 <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-4 overflow-hidden relative flex items-center justify-center">
                     {cameraError ? (
                         <div className="text-center px-4">
                             <VideoOff size={48} className="mx-auto text-gray-400 mb-2" />
                             <p className="text-red-500 font-bold text-sm mb-2">{cameraError}</p>
                             <p className="text-xs text-gray-400">Tasdiqlash tugmasini bosib davom etishingiz mumkin (Simulyatsiya).</p>
                         </div>
                     ) : (
                        <>
                           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                           <div className="absolute inset-0 border-4 border-indigo-500/50 rounded-2xl pointer-events-none"></div>
                           <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </>
                     )}
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Yuzingizni kameraga to'g'rilang va tasdiqlash tugmasini bosing.</p>
                 <button onClick={handleFaceVerify} className="w-full py-4 bg-green-500 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                     <ScanFace size={18} /> Tasdiqlash
                 </button>
             </div>
        ) : (
            // Form & SMS Steps
            <>
                <h2 className="text-2xl font-black uppercase text-center mb-6 text-gray-800 dark:text-white">{type === 'login' ? t('login') : t('register')}</h2>
                
                {/* Step 2: SMS Input (Register Only) */}
                {type === 'register' && step === 2 ? (
                    <div className="space-y-4 animate-fade-in text-center">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600 dark:text-indigo-400">
                             <Smartphone size={32} />
                        </div>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('enterCode')}</p>
                        <input 
                            value={smsCode} 
                            onChange={e => setSmsCode(e.target.value)} 
                            placeholder="0000" 
                            maxLength={4}
                            className="w-32 mx-auto p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-black text-2xl text-center dark:text-white outline-none focus:border-indigo-600 tracking-widest" 
                        />
                         <button onClick={handleNext} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase shadow-lg hover:bg-indigo-700 transition">
                            Tasdiqlash
                        </button>
                    </div>
                ) : (
                    // Step 1: Data Entry (Login & Register)
                    <div className="space-y-4 animate-fade-in">
                        {type === 'login' && loginError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-xs font-bold text-red-600 dark:text-red-300 text-center">
                                {loginError}
                            </div>
                        )}

                        {/* 1. ISM (Faqat ro'yxatdan o'tishda) */}
                        {type === 'register' && (
                            <input 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value.replace(/[0-9]/g, '')})} 
                                placeholder={t('name')} 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold dark:text-white outline-none focus:border-indigo-600" 
                            />
                        )}

                        {/* 2. YANGI TELEFON INPUTI (+998 qotirilgan) */}
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden focus-within:ring-2 ring-indigo-500 transition-all">
                            <div className="px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold border-r border-gray-300 dark:border-gray-500 select-none">
                                +998
                            </div>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                    const raqam = e.target.value.replace(/\D/g, '');
                                    if (raqam.length <= 9) {
                                        setFormData({ ...formData, phone: raqam });
                                        setLoginError(null);
                                    }
                                }}
                                placeholder="901234567"
                                className="flex-grow p-3 bg-transparent font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400"
                            />
                        </div>

                        {/* 3. PASPORT SERIYA VA RAQAM */}
                        {type === 'register' && (
                            <div className="flex gap-2">
                                <input 
                                    className="w-24 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-600 uppercase text-center placeholder:normal-case focus:border-indigo-600 outline-none dark:text-white" 
                                    placeholder="AA" 
                                    maxLength={2}
                                    value={formData.passportSeries} 
                                    onChange={(e) => setFormData({...formData, passportSeries: e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase()})}
                                />
                                <input 
                                    className="flex-grow p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-600 focus:border-indigo-600 outline-none dark:text-white" 
                                    placeholder="1234567" 
                                    maxLength={7}
                                    inputMode="numeric"
                                    value={formData.passportNumber} 
                                    onChange={(e) => setFormData({...formData, passportNumber: e.target.value.replace(/\D/g, '')})}
                                />
                            </div>
                        )}

                        {/* 4. PAROL */}
                        <input 
                            type="password" 
                            value={formData.password} 
                            onChange={e => {
                                setFormData({...formData, password: e.target.value});
                                setLoginError(null);
                            }} 
                            placeholder="Parol" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold dark:text-white outline-none focus:border-indigo-600" 
                        />

                        {type === 'login' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={onForgotPassword}
                                    className="text-xs font-bold text-blue-500 hover:underline mt-1"
                                >
                                    Parolni unutdingizmi?
                                </button>
                            </div>
                        )}
                        
                        {/* 5. MANZIL */}
                        {type === 'register' && (
                            <div className="flex gap-2">
                                <input 
                                    value={formData.address} 
                                    onChange={e => setFormData({...formData, address: e.target.value})} 
                                    placeholder={t('address')} 
                                    className="flex-grow p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold dark:text-white outline-none focus:border-indigo-600" 
                                />
                                <button 
                                    onClick={() => onOpenMap((addr) => setFormData(prev => ({ ...prev, address: addr })))} 
                                    className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 transition"
                                >
                                    <MapPin size={20} />
                                </button>
                            </div>
                        )}

                        {/* 6. TUGMA */}
                        <button onClick={handleNext} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase shadow-lg hover:bg-indigo-700 transition">
                            {type === 'login' ? t('login') : "Davom etish"}
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

const ForgotPasswordModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { checkUserExists } = useShop();
  const [phone, setPhone] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSmsNotification, setShowSmsNotification] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setSmsSent(false);
      setGeneratedCode(null);
      setSmsCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setIsSubmitting(false);
      setShowSmsNotification(false);
      setIsCodeVerified(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendSms = () => {
    setError(null);
    setIsCodeVerified(false);
    setSmsCode('');

    if (phone.length !== 9) {
      setError("Telefon raqamini to'liq kiriting");
      return;
    }
    if (!checkUserExists(phone)) {
      setError("Bu raqam bo'yicha foydalanuvchi topilmadi. Avval ro'yxatdan o'ting.");
      return;
    }
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setGeneratedCode(code);
    setSmsSent(true);
    setShowSmsNotification(true);
    setTimeout(() => setShowSmsNotification(false), 10000);
  };

  const handleVerifyCode = () => {
    setError(null);
    if (!generatedCode) {
      setError("Avval SMS yuboring");
      return;
    }
    if (smsCode.length !== 5 || smsCode !== generatedCode) {
      setError("SMS kodi noto'g'ri");
      setIsCodeVerified(false);
      return;
    }
    setIsCodeVerified(true);
  };

  const handleResetPassword = async () => {
    setError(null);

    if (!isCodeVerified) {
      setError("Avval SMS kodini tasdiqlang");
      return;
    }
    if (!newPassword) {
      setError("Yangi parolni kiriting");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Parollar mos emas");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: dbError } = await supabase
        .from('imantargo')
        .update({ password: newPassword })
        .eq('phone', phone);

      if (dbError) {
        setError("Server xatosi: " + dbError.message);
      } else {
        alert("Parol muvaffaqiyatli tiklandi. Endi qaytadan tizimga kiring.");
        onClose();
      }
    } catch (e) {
      setError("Internet yo'q yoki server xatosi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      {/* SMS vizual xabarnoma (ro'yxatdan o'tishdagi kabi) */}
      {showSmsNotification && generatedCode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-white border-l-4 border-green-500 shadow-2xl rounded-r-xl p-4 flex items-center gap-4 animate-bounce">
          <div className="bg-green-100 p-2 rounded-full text-green-600">
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">SMS Tasdiqlash</p>
            <p className="text-xl font-black text-gray-800 tracking-widest">{generatedCode}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 p-2 bg-white text-red-500 rounded-full shadow-lg border hover:bg-gray-100 z-50 transition-transform hover:scale-110"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-black uppercase text-center mb-6 text-gray-800 dark:text-white">
          Parolni tiklash
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-xs font-bold text-red-600 dark:text-red-300 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-400 uppercase">{`Telefon raqamni kiriting`}</label>
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold border-r border-gray-300 dark:border-gray-500 select-none">
              +998
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, '');
                if (onlyDigits.length <= 9) {
                  setPhone(onlyDigits);
                }
              }}
              placeholder="901234567"
              className="flex-grow p-3 bg-transparent font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleSendSms}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase shadow-lg hover:bg-indigo-700 transition text-xs"
          >
            SMS yuborish
          </button>

          {smsSent && generatedCode && (
            <div className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">SMS kod (5 xonali)</label>
                <div className="flex gap-2">
                  <input
                    value={smsCode}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setSmsCode(digits);
                    }}
                    maxLength={5}
                    inputMode="numeric"
                    placeholder="12345"
                    className="flex-grow p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-black text-center tracking-[0.5em] text-lg dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-indigo-700"
                  >
                    Tasdiqlash
                  </button>
                </div>
              </div>

              {isCodeVerified && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Yangi parol</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold dark:text-white outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Parolni tasdiqlang</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold dark:text-white outline-none focus:border-indigo-600"
                    />
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase shadow-lg hover:bg-green-600 transition text-xs"
                  >
                    Parolni yangilash
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminLoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const navigate = useNavigate();
  const [key, setKey] = useState('');

  const handleLogin = () => {
    if (key === 'zohirshohdyou') {
      onClose();
      navigate('/admin');
    } else {
      alert("Parol noto'g'ri!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      {/* FORCE LIGHT THEME (bg-white) to match user's Picture 1 requirement */}
      <div className="bg-white p-8 rounded-3xl w-full max-w-xs relative animate-fade-in text-center shadow-2xl">
        <button 
            onClick={onClose} 
            className="absolute -top-4 -right-4 p-2 bg-white text-red-500 rounded-full shadow-lg border hover:bg-gray-100 transition-transform hover:scale-110"
        >
            <X size={20} />
        </button>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <Lock size={24} />
        </div>
        <h2 className="text-xl font-black uppercase mb-6 text-gray-800">Admin Kirish</h2>
        <input 
          type="password" 
          value={key} 
          onChange={e => setKey(e.target.value)} 
          placeholder="Parol" 
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-center mb-4 text-gray-800 outline-none focus:border-red-500 transition-colors" 
        />
        <button onClick={handleLogin} className="w-full py-3 bg-red-500 text-white rounded-xl font-black uppercase hover:bg-red-600 transition shadow-lg shadow-red-200">
          Kirish
        </button>
      </div>
    </div>
  );
};

const MapModal = ({ isOpen, onClose, onSelectAddress }: { isOpen: boolean, onClose: () => void, onSelectAddress?: (addr: string) => void }) => {
  if (!isOpen) return null;

  const handleSelect = () => {
    if (onSelectAddress) {
      onSelectAddress("Toshkent shahri, Chilonzor tumani, Muqimiy ko'chasi 15-uy (Xarita)");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl h-[60vh] rounded-3xl overflow-hidden relative flex flex-col shadow-2xl animate-fade-in">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase flex items-center gap-2"><MapPin size={18} /> Manzilni tanlang</h3>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full"><X size={20} /></button>
        </div>
        <div className="flex-grow relative group bg-gray-100">
          {/* Iframe for Google Map */}
          <iframe 
            width="100%" 
            height="100%" 
            id="gmap_canvas" 
            src="https://maps.google.com/maps?q=Toshkent&t=&z=13&ie=UTF8&iwloc=&output=embed" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight={0} 
            marginWidth={0} 
            title="Google Map"
            className="w-full h-full"
          ></iframe>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
             <button onClick={handleSelect} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-indigo-700 shadow-xl">
                 Shu manzilni tanlash
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... ProductCard, HeroSlider, Footer, Home, ProfilePage, MainLayout, App ...

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onDirectBuy: (product: Product) => void;
  onAddToCart: (product: Product, qty: number, e?: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail, onDirectBuy, onAddToCart }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const images = [product.image, ...(product.gallery || [])];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border dark:border-gray-700 p-6 flex flex-col group hover:shadow-xl dark:hover:shadow-gray-900/50 transition duration-300 relative">
            <div className="h-48 flex items-center justify-center mb-6 relative cursor-pointer" onClick={() => onOpenDetail(product)}>
                <img src={images[currentImgIndex]} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500" />
                
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center z-10">
                        <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Tugagan</span>
                    </div>
                )}

                {images.length > 1 && (
                    <>
                        <button 
                            onClick={prevImage}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-1 rounded-full shadow hover:bg-indigo-600 hover:text-white opacity-0 group-hover:opacity-100 transition z-20"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={nextImage}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-1 rounded-full shadow hover:bg-indigo-600 hover:text-white opacity-0 group-hover:opacity-100 transition z-20"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </>
                )}
            </div>
            
            <div className="mb-2 cursor-pointer" onClick={() => onOpenDetail(product)}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.brand}</p>
                <h3 className="font-bold text-gray-900 dark:text-white leading-tight h-10 overflow-hidden hover:text-indigo-600 dark:hover:text-indigo-400 transition">{product.name}</h3>
            </div>

            <div className="flex items-center gap-1 mb-4 text-yellow-400 text-xs">
                <Star size={12} fill="currentColor" /> <span className="text-gray-400 font-bold ml-1">{product.rating}</span>
            </div>

            <div className="mt-auto pt-4 border-t dark:border-gray-700 flex justify-between items-center gap-2">
                <div>
                {product.oldPrice && <p className="text-xs text-gray-400 line-through decoration-red-400">{product.oldPrice.toLocaleString()}</p>}
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{product.price.toLocaleString()} <span className="text-[10px] align-top">UZS</span></p>
                </div>
                
                <div className="flex gap-2">
                <button
                    onClick={() => onDirectBuy(product)}
                    disabled={product.stock === 0}
                    title="Hozir sotib olish"
                    className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap size={18} fill="currentColor" />
                </button>
                <button 
                    onClick={(e) => onAddToCart(product, 1, e)}
                    disabled={product.stock === 0}
                    title="Savatga qo'shish"
                    className="bg-gray-900 dark:bg-gray-700 text-white p-3 rounded-xl hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingBag size={18} />
                </button>
                </div>
            </div>
        </div>
    );
}

const Footer = ({ onOpenAdmin, onOpenMap, onOpenInfo }: { onOpenAdmin: () => void, onOpenMap: () => void, onOpenInfo: (type: 'about' | 'delivery' | 'payment' | 'privacy') => void }) => {
  const { t } = useShop();
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800" id="contact">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-black italic mb-6 text-indigo-500">IMANTARGO</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Texnologiya olamidagi eng so'nggi yangiliklar va eng sifatli mahsulotlar markazi. 
              Biz bilan kelajakni kashf eting.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/imantargo/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-indigo-600 transition"><Instagram size={20} /></a>
              <a href="https://t.me/imantargo" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-indigo-600 transition"><Send size={20} /></a>
              <a href="https://www.facebook.com/profile.php?id=61584530310790" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-indigo-600 transition"><Facebook size={20} /></a>
              <a href="https://www.youtube.com/@IMANTARGO" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-indigo-600 transition"><Youtube size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold uppercase mb-6 tracking-widest">{t('categories')}</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Noutbuklar</a></li>
              <li><a href="#" className="hover:text-white transition">Telefonlar</a></li>
              <li><a href="#" className="hover:text-white transition">Aksessuarlar</a></li>
              <li><a href="#" className="hover:text-white transition">Chegirmalar</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase mb-6 tracking-widest">{t('info')}</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><button onClick={() => onOpenInfo('about')} className="hover:text-white transition text-left">{t('aboutUs')}</button></li>
              <li><button onClick={() => onOpenInfo('delivery')} className="hover:text-white transition text-left">{t('delivery')}</button></li>
              <li><button onClick={() => onOpenInfo('payment')} className="hover:text-white transition text-left">{t('paymentTypes')}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase mb-6 tracking-widest">{t('contact')}</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3"><Phone size={16} className="text-indigo-500"/> +998 99 378 16 10</li>
              <li className="flex items-center gap-3 cursor-pointer hover:text-white transition" onClick={onOpenMap}>
                <MapPin size={16} className="text-indigo-500"/> Toshkent sh, Chilonzor
              </li>
              <li className="flex items-center gap-3"><Send size={16} className="text-indigo-500"/> info@imantargo.uz</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
              <button onClick={onOpenAdmin} className="p-2 text-gray-700 hover:text-gray-500 transition opacity-50 hover:opacity-100" title="Admin Kirish">
                  <Lock size={16} />
              </button>
              <p className="text-gray-500 text-xs">© 2024 IMANTARGO. Barcha huquqlar himoyalangan.</p>
          </div>
          <div className="flex gap-6 text-xs text-gray-500 font-bold uppercase">
            <button onClick={() => onOpenInfo('privacy')} className="hover:text-white transition uppercase">{t('privacy')}</button>
            <a href="#" className="hover:text-white">{t('terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const HeroSlider = () => {
    const { t } = useShop();
    const slides = [
        { id: 1, title: t('banner1Title'), subtitle: t('banner1Sub'), image: "https://picsum.photos/seed/hero1/1600/600", color: "from-purple-900 to-indigo-900" },
        { id: 2, title: t('banner2Title'), subtitle: t('banner2Sub'), image: "https://picsum.photos/seed/hero2/1600/600", color: "from-red-900 to-orange-900" },
        { id: 3, title: t('banner3Title'), subtitle: t('banner3Sub'), image: "https://picsum.photos/seed/hero3/1600/600", color: "from-blue-900 to-cyan-900" },
    ];
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 5000);
        return () => clearInterval(timer);
    }, [slides.length]); // Added slides.length dependency

    return (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl my-6">
            {slides.map((slide, index) => (
                <div 
                    key={slide.id} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-90 mix-blend-multiply z-10`}></div>
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 md:px-24 text-white">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] mb-4 text-white/70 animate-fade-in">{slide.subtitle}</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-8 max-w-2xl animate-slide-up">{slide.title}</h2>
                        <button className="w-fit px-8 py-4 bg-white text-gray-900 font-black uppercase text-xs rounded-xl hover:bg-gray-100 transition animate-bounce">{t('detail')}</button>
                    </div>
                </div>
            ))}
            <div className="absolute bottom-8 left-12 md:left-24 z-30 flex gap-2">
                {slides.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCurrent(i)} 
                        className={`h-1 rounded-full transition-all ${i === current ? 'w-8 bg-white' : 'w-4 bg-white/30'}`} 
                    />
                ))}
            </div>
        </div>
    );
};

// setSearchQuery ni qavs ichiga qo'shdik
const Home = ({ searchQuery, setSearchQuery, onDirectBuy, onOpenProductDetail, onAddToCartAnim }: { searchQuery: string, setSearchQuery: (q: string) => void, onDirectBuy: (p: Product) => void, onOpenProductDetail: (p: Product) => void, onAddToCartAnim: (p: Product, qty: number, e?: React.MouseEvent) => void }) => {    
    const { products, t } = useShop();
    const [selectedCategory, setSelectedCategory] = useState("Barchasi");
    const [pageSize, setPageSize] = useState<number>(40);

    const allCategories = useMemo(() => {
        const base = [...CATEGORIES];
        const baseSet = new Set(base);
        const extra = Array.from(
            new Set(products.map(p => (p.category || '').trim()))
        ).filter(c => c && !baseSet.has(c));
        return [...base, ...extra];
    }, [products]);

    const filteredProducts = products.filter(p => {
        const name = (p.name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const specs = (p.specs || '').toLowerCase();
        const query = searchQuery.trim().toLowerCase();
        const terms = query.split(/\s+/).filter(Boolean);

        const matchesSearch =
            terms.length === 0 ||
            terms.every(term =>
                name.includes(term) || brand.includes(term) || specs.includes(term)
            );

        const productCategory = (p.category || '').trim();
        const matchesCategory =
            selectedCategory === "Barchasi" ||
            productCategory === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const visibleProducts = filteredProducts.slice(0, pageSize);

    return (
        <div className="container mx-auto px-4 pb-20">
            <HeroSlider />

            {/* Qidiruv va sahifadagi tovar soni tanlash */}
            <div className="my-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <GlowingSearch 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>
                <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-gray-500 dark:text-gray-400">
                    <span>Bir sahifada:</span>
                    {[40, 50, 60, 80, 100].map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => setPageSize(size)}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] md:text-xs ${
                                pageSize === size 
                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto pb-4 mb-8 custom-scrollbar" id="categories">
                <button 
                    onClick={() => setSelectedCategory("Barchasi")}
                    className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold uppercase text-xs transition ${selectedCategory === "Barchasi" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    {t('all')}
                </button>
                {allCategories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold uppercase text-xs transition ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        {t(cat)}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleProducts.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onOpenDetail={onOpenProductDetail}
                        onDirectBuy={onDirectBuy}
                        onAddToCart={onAddToCartAnim}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-block p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <Search size={48} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('nothingFound')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('changeSearch')}</p>
                </div>
            )}
        </div>
    );
};

const ProfilePage = ({ onOpenCart }: { onOpenCart: () => void }) => {
    const { currentUser, orders, logoutUser, updateUserAvatar, cart, removeFromCart, cancelOrder, t } = useShop();
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const activeTab = query.get('tab') || 'profile';

    // Chat Modal State
    const [chatOrderId, setChatOrderId] = useState<number | null>(null);
// --- 933-qatordan keyin shu yerni qo'shing ---
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    updateUserAvatar(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    // ----------------------------------------------
    if (!currentUser) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-black uppercase mb-4 dark:text-white">Kirish talab etiladi</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Profilni ko'rish uchun avval tizimga kiring</p>
                <Link to="/" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase">{t('backToSite')}</Link>
            </div>
        );
    }

    const myOrders = orders.filter(o => o.userPhone === currentUser.phone);
    const myReturns = myOrders.filter(o => o.status === 'Bekor qilindi' || o.status === 'Qaytarildi');
    const myActiveOrders = myOrders.filter(o => o.status !== 'Bekor qilindi' && o.status !== 'Qaytarildi');

    const handleCancelOrder = (id: number) => {
        if(window.confirm("Buyurtmani bekor qilsangiz, to'lov kartangizga qaytariladi (agar karta orqali bo'lsa). Tasdiqlaysizmi?")) {
            cancelOrder(id, "Foydalanuvchi tomonidan bekor qilindi");
            alert("Buyurtma bekor qilindi va pul qaytarildi.");
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Order Chat Modal */}
            {chatOrderId && (
                <OrderChatModal 
                    orderId={chatOrderId} 
                    isOpen={!!chatOrderId} 
                    onClose={() => setChatOrderId(null)} 
                />
            )}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-1/4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border dark:border-gray-700 sticky top-24">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-4 overflow-hidden relative group">
                                {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition" onClick={() => {
                                    const url = prompt("Rasm URL manzilini kiriting:");
                                    if(url) updateUserAvatar(url);
                                }}>
                                    <Camera size={24} className="text-white"/>
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white text-center">{currentUser.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.phone}</p>
                        </div>
                        
                        <nav className="space-y-2">
                            <Link to="/profile?tab=profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <UserIcon size={18} /> {t('personalData')}
                            </Link>
                            <Link to="/profile?tab=cart" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'cart' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <div className="relative">
                                    <ShoppingBag size={18} />
                                    {cart.length > 0 && <span className={`absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ${activeTab === 'cart' ? 'border-indigo-600' : 'border-white dark:border-gray-800'} border`}></span>}
                                </div>
                                {t('cart')}
                            </Link>
                            <Link to="/profile?tab=orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <Package size={18} /> {t('myOrders')}
                            </Link>
                            <Link to="/profile?tab=returns" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'returns' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <RotateCcw size={18} /> {t('returns')}
                            </Link>
                            <Link to="/profile?tab=wishlist" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'wishlist' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <Heart size={18} /> {t('wishlist')}
                            </Link>
                            <Link to="/profile?tab=promo" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'promo' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <Ticket size={18} /> {t('promo')}
                            </Link>
                            <button onClick={() => { logoutUser(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                <LogOut size={18} /> {t('logout')}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-3/4">
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border dark:border-gray-700 animate-fade-in">
                            <h3 className="text-2xl font-black uppercase text-gray-900 dark:text-white mb-8">{t('personalData')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t('name')}</label>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 py-2">{currentUser.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t('phone')}</label>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 py-2">{currentUser.phone}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t('passport')}</label>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 py-2">{currentUser.passport}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">{t('address')}</label>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 py-2">{currentUser.address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cart' && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border dark:border-gray-700 animate-fade-in">
                            <h3 className="text-2xl font-black uppercase text-gray-900 dark:text-white mb-8">{t('cart')}</h3>
                            {cart.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50"/>
                                    <p>{t('emptyCart')}</p>
                                    <Link to="/" className="inline-block mt-4 text-indigo-600 hover:underline text-sm font-bold uppercase">{t('shopping')}</Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 border-b dark:border-gray-700 pb-4 last:border-0">
                                            <img src={item.image} alt={item.name} className="w-20 h-20 object-contain bg-gray-50 rounded-xl" />
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase">{item.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.price.toLocaleString()} UZS x {item.qty}</p>
                                                <p className="text-indigo-600 dark:text-indigo-400 font-black">{(item.price * item.qty).toLocaleString()} UZS</p>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={20} /></button>
                                        </div>
                                    ))}
                                    <div className="pt-6 border-t dark:border-gray-700 flex justify-between items-center">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('total')}:</span>
                                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{cart.reduce((sum, i) => sum + (i.price * i.qty), 0).toLocaleString()} UZS</p>
                                        </div>
                                        <button onClick={onOpenCart} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition">
                                            {t('checkout')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border dark:border-gray-700 animate-fade-in">
                            <h3 className="text-2xl font-black uppercase text-gray-900 dark:text-white mb-8">{t('orderHistory')}</h3>
                            {myActiveOrders.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Package size={48} className="mx-auto mb-4 opacity-50"/>
                                    <p>{t('nothingFound')}</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {myActiveOrders.map(order => (
                                        <div key={order.id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-md transition bg-gray-50 dark:bg-gray-800/50 relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{t('orderNo')}_{order.id}</span>
                                                    <p className="text-xs text-gray-400 mt-2">{order.date}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                    order.status === 'Yetkazildi' ? 'bg-green-100 text-green-600' :
                                                    order.status === 'Bekor qilindi' ? 'bg-red-100 text-red-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name} <span className="text-gray-400">x{item.qty}</span></span>
                                                        <span className="font-bold dark:text-white">{(item.price * item.qty).toLocaleString()} UZS</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t dark:border-gray-700 pt-4 flex justify-between items-center">
                                                <div>
                                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">{t('total')}:</span>
                                                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{order.totalPrice.toLocaleString()} UZS</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setChatOrderId(order.id)}
                                                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 transition"
                                                        title="Admin bilan suhbat"
                                                    >
                                                        <MessageCircle size={20} />
                                                    </button>
                                                    {(order.status === 'Yangi' || order.status === 'Qadoqlanmoqda') && !order.fundsTransferred && (
                                                        <button 
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 transition"
                                                            title="Buyurtmani bekor qilish"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'returns' && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border dark:border-gray-700 animate-fade-in">
                            <h3 className="text-2xl font-black uppercase text-gray-900 dark:text-white mb-8">{t('returnHistory')}</h3>
                            {myReturns.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <RotateCcw size={48} className="mx-auto mb-4 opacity-50"/>
                                    <p>{t('nothingFound')}</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {myReturns.map(order => (
                                        <div key={order.id} className="border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-2xl p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs font-black text-red-600 uppercase bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">{t('orderNo')}_{order.id}</span>
                                                    <p className="text-xs text-red-400 mt-2">{order.date}</p>
                                                </div>
                                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white dark:bg-gray-800 text-red-500">
                                                    Bekor qilingan
                                                </span>
                                            </div>
                                            <div className="space-y-2 mb-4 opacity-50">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name} <span className="text-gray-400">x{item.qty}</span></span>
                                                        <span className="font-bold dark:text-white">{(item.price * item.qty).toLocaleString()} UZS</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-red-200 dark:border-red-900/30 pt-4">
                                                 <p className="text-xs font-bold text-red-500 uppercase">{t('reason')}:</p>
                                                 <p className="text-sm text-gray-700 dark:text-gray-300">{order.cancelReason || "Sabab ko'rsatilmagan"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(activeTab === 'wishlist' || activeTab === 'promo') && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border dark:border-gray-700 animate-fade-in text-center py-20 text-gray-400">
                            <p className="font-bold uppercase">{t('soon')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MainLayout = () => {
  const [isCartOpen, setCartOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{isOpen: boolean, type: 'login'|'register'}>({isOpen: false, type: 'login'});
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [isMapOpen, setMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [directBuyItem, setDirectBuyItem] = useState<Product | null>(null);
  const [mapSelectionCallback, setMapSelectionCallback] = useState<((addr: string) => void) | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  // Info Modal State
  const [infoModal, setInfoModal] = useState<{isOpen: boolean, title: string, content: string}>({isOpen: false, title: '', content: ''});

  // Animation State
  const [flyingIcons, setFlyingIcons] = useState<{id: number, x: number, y: number, destX: number, destY: number}[]>([]);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const { addToCart, orders, currentUser, t, logoutUser } = useShop();
  // Check for unreviewed delivered orders on mount/update
  useEffect(() => {
    const checkUserInDb = async () => {
      if (currentUser) {
        const { data } = await supabase
          .from('imantargo')
          .select('phone')
          .eq('phone', currentUser.phone)
          .maybeSingle();

        if (!data) {
          // Agar bazada topilmasa, demak o'chirilgan -> Tizimdan chiqarib yuboramiz
          logoutUser(); 
          window.location.reload();
        }
      }
    };
    checkUserInDb();
  }, [currentUser]); 
  // -------------------------------------------------------------------

  const handleAddToCartWithAnimation = (product: Product, qty: number, e?: React.MouseEvent) => {
      if (!currentUser) {
          setAuthModal({ isOpen: true, type: 'login' });
          return;
      }
      // Trigger Animation if event exists
      if (e) {
          const startX = e.clientX;
          const startY = e.clientY;
          
          // Target: Navbar Cart Icon (Desktop) or Mobile Menu Icon (Mobile)
          // Ideally target the navbar cart button
          const target = document.getElementById('navbar-cart-btn') || document.querySelector('.fa-shopping-bag'); 
          
          // Fallback destination if target not found (e.g. top right)
          let destX = window.innerWidth - 50;
          let destY = 30;

          if (target) {
              const rect = target.getBoundingClientRect();
              destX = rect.left + rect.width / 2;
              destY = rect.top + rect.height / 2;
          }

          const id = Date.now();
          setFlyingIcons(prev => [...prev, { id, x: startX, y: startY, destX, destY }]);
      }

      // Add to Cart Logic
      addToCart(product, qty);
  };

  const removeFlyingIcon = (id: number) => {
      setFlyingIcons(prev => prev.filter(item => item.id !== id));
  }

  const handleDirectBuy = (product: Product) => {
    if (!currentUser) {
      setAuthModal({ isOpen: true, type: 'login' });
      return;
    }
    setDirectBuyItem(product);
    setCartOpen(true);
  };

  const handleCloseCart = () => {
      setCartOpen(false);
      setDirectBuyItem(null); 
  }

  const handleAddToCartFromDetail = (product: Product) => {
    addToCart(product, 1);
    setSelectedProduct(null); 
  }

  const handleOpenMapForRegistration = (callback: (addr: string) => void) => {
      setMapSelectionCallback(() => callback);
      setMapOpen(true);
  }

  const handleOpenInfo = (type: 'about' | 'delivery' | 'payment' | 'privacy') => {
      let title = '';
      let content = '';
      switch(type) {
          case 'about':
              title = t('aboutUs');
              content = t('aboutUsText');
              break;
          case 'delivery':
              title = t('delivery');
              content = t('deliveryText');
              break;
          case 'payment':
              title = t('paymentTypes');
              content = t('paymentText');
              break;
          case 'privacy':
              title = t('privacy');
              content = t('privacyText');
              break;
      }
      setInfoModal({ isOpen: true, title, content });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-100 dark:bg-gray-900 transition-colors duration-300 relative">
      <Navbar 
        onOpenCart={() => setCartOpen(true)} 
        onOpenLogin={() => setAuthModal({isOpen: true, type: 'login'})} 
        onOpenRegister={() => setAuthModal({isOpen: true, type: 'register'})} 
        setSearchQuery={setSearchQuery} 
        isSearchOpen={isSearchOpen} 
        setIsSearchOpen={setIsSearchOpen} 
      />
      
      {/* Flying Icons Layer */}
      {flyingIcons.map(icon => (
          <FlyingIcon 
            key={icon.id} 
            startX={icon.x} 
            startY={icon.y} 
            destX={icon.destX} 
            destY={icon.destY} 
            onComplete={() => removeFlyingIcon(icon.id)} 
          />
      ))}

      <main className="flex-grow">
        <Routes>
           <Route path="/" element={<Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} onDirectBuy={handleDirectBuy} onOpenProductDetail={setSelectedProduct} onAddToCartAnim={handleAddToCartWithAnimation} />} />
           <Route path="/profile" element={<ProfilePage onOpenCart={() => setCartOpen(true)} />} />
        </Routes>
      </main>
      <Footer 
        onOpenAdmin={() => setAdminLoginOpen(true)} 
        onOpenMap={() => { setMapSelectionCallback(null); setMapOpen(true); }} 
        onOpenInfo={handleOpenInfo}
      />
      <CartModal isOpen={isCartOpen} onClose={handleCloseCart} directBuyItem={directBuyItem} />
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({...authModal, isOpen: false})} 
        type={authModal.type} 
        onOpenMap={handleOpenMapForRegistration} 
        onForgotPassword={() => setIsForgotOpen(true)}
      />
      <ForgotPasswordModal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
      />
      <AdminLoginModal isOpen={adminLoginOpen} onClose={() => setAdminLoginOpen(false)} />
      <MapModal isOpen={isMapOpen} onClose={() => setMapOpen(false)} onSelectAddress={mapSelectionCallback || undefined} />
      <ProductDetailModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCartFromDetail} />
      <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({...infoModal, isOpen: false})} title={infoModal.title} content={infoModal.content} />
      
      {/* Review Modal - Auto opens for unreviewed delivered orders */}
      {reviewOrder && (
          <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} />
      )}
    </div>
  );
}

const App = () => {
  return (
    <ShopProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<MainLayout />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </ShopProvider>
  );
};
export default App;
