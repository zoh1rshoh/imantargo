import React, { useState, useEffect } from 'react';
import { useShop } from './store';
import { X, CreditCard, Banknote, Smartphone, MessageSquare } from 'lucide-react';
import { Product, CartItem } from './types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  directBuyItem: Product | null;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, directBuyItem }) => {
  const { cart, removeFromCart, clearCart, placeOrder, currentUser, t } = useShop();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });
  
  // Card Details
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '' });
  const [cardName, setCardName] = useState('');
  
  // Payment Method (removed installment)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  const [smsCode, setSmsCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [smsError, setSmsError] = useState(false);
  const [showSmsNotification, setShowSmsNotification] = useState(false);

  // Determine items to checkout
  const checkoutItems: CartItem[] = directBuyItem 
    ? [{ ...directBuyItem, qty: 1 }] 
    : cart;
  
  const total = checkoutItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        phone: currentUser.phone,
        address: currentUser.address
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
         setFormData({
            name: currentUser.name,
            phone: currentUser.phone,
            address: currentUser.address
          });
      }
    } else {
      // Reset state when closed
      setStep(1);
      setSmsCode('');
      setSmsError(false);
      setGeneratedCode(null);
      setCardInfo({ number: '', expiry: '' });
      setCardName('');
      setShowSmsNotification(false);
    }
  }, [isOpen, currentUser]);

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    
    if (val.length === 16) {
        setCardName("ABDULLAYEV ALISHER");
    } else {
        setCardName('');
    }

    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardInfo({ ...cardInfo, number: formatted });
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    
    if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
    }
    
    setCardInfo({ ...cardInfo, expiry: val });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.address) {
        alert("Barcha maydonlarni to'ldiring!");
        return;
      }

      if (currentUser) {
         if (
             formData.name !== currentUser.name ||
             formData.phone !== currentUser.phone ||
             formData.address !== currentUser.address
         ) {
             alert("Ma'lumotlar xato kirilgan");
             return;
         }
      }

      setStep(2);
    } else if (step === 2) {
      if (paymentMethod === 'card') {
          const rawNum = cardInfo.number.replace(/\s/g, '');
          if (rawNum.length !== 16) {
              alert("Karta ma'lumotlari toliq emas");
              return;
          }
          if (cardInfo.expiry.length < 5) {
              alert("Karta muddati to'liq emas");
              return;
          }
      }

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(code);
      setShowSmsNotification(true);
      
      setTimeout(() => {
          setShowSmsNotification(false);
      }, 10000);
      
      setStep(3);
    }
  };

  const handleVerifyCode = () => {
    setSmsError(false);
    if (smsCode === generatedCode) {
      // 1. Place the order
      placeOrder({
        userName: formData.name,
        userPhone: formData.phone,
        address: formData.address,
        items: checkoutItems,
        totalPrice: total,
        paymentMethod,
        cardInfo: paymentMethod === 'card' ? cardInfo : undefined
      });
      
      // 2. Clear cart if needed
      if (!directBuyItem) {
          clearCart();
      }

      // 3. Immediately close the modal
      // We do NOT use alert() here to prevent the modal from getting stuck
      onClose(); 
    } else {
      setSmsError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm">
      {/* SMS Notification Overlay */}
      {showSmsNotification && generatedCode && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-white border-l-4 border-green-500 shadow-2xl rounded-r-xl p-4 flex items-center gap-4 animate-bounce">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <MessageSquare size={24} />
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">{t('smsVerify')}</p>
                  <p className="text-xl font-black text-gray-800 tracking-widest">{generatedCode}</p>
              </div>
              <button onClick={() => setShowSmsNotification(false)} className="ml-4 text-gray-400 hover:text-gray-600"><X size={16}/></button>
          </div>
      )}

      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        {step !== 3 && (
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-10 p-2 bg-white text-red-500 rounded-full shadow-lg border hover:bg-gray-100 transition-transform hover:scale-110"
            >
                <X size={20} />
            </button>
        )}

        {/* Left: Items */}
        <div className="w-full md:w-3/5 p-6 bg-gray-50 border-r border-gray-100 overflow-y-auto">
          <h2 className="text-xl font-black uppercase text-gray-800 mb-6 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-sm ${directBuyItem ? 'bg-orange-500' : 'bg-indigo-600'} text-white`}>
                {directBuyItem ? t('buyNow') : t('cart')}
            </span>
            <span className="text-gray-400 text-sm">{checkoutItems.length} {t('pieces')}</span>
          </h2>
          
          {checkoutItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="font-bold">{t('emptyCart')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkoutItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-gray-50 rounded-xl" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-sm text-gray-800 uppercase">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.qty} x {item.price.toLocaleString()} UZS</p>
                    <p className="text-indigo-600 font-black text-sm">{(item.price * item.qty).toLocaleString()} UZS</p>
                  </div>
                  {!directBuyItem && (
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2">
                        <X size={16} />
                      </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Checkout Flow */}
        <div className="w-full md:w-2/5 p-8 bg-white overflow-y-auto relative">
          
          {step === 3 && smsError && (
              <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-center py-2 font-bold text-xs uppercase animate-pulse">
                  Kod noto'g'ri! Qayta urinib ko'ring.
              </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-black uppercase text-gray-800 mb-4">{t('personalData')}</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">{t('name')}</label>
                        <input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            className="w-full p-3 rounded-xl border focus:border-indigo-600 outline-none font-bold bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
                            disabled={!!currentUser}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">{t('phone')}</label>
                        <input 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})} 
                            className="w-full p-3 rounded-xl border focus:border-indigo-600 outline-none font-bold bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
                            disabled={!!currentUser}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">{t('address')}</label>
                        <textarea 
                            value={formData.address} 
                            onChange={e => setFormData({...formData, address: e.target.value})} 
                            className="w-full p-3 rounded-xl border focus:border-indigo-600 outline-none font-bold bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
                            rows={3}
                            disabled={!!currentUser}
                        />
                    </div>
                </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black uppercase text-gray-800 mb-4">{t('paymentMethod')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                        <Banknote size={24} />
                        <span className="text-xs font-bold uppercase">{t('cash')}</span>
                    </button>
                    <button 
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                        <CreditCard size={24} />
                        <span className="text-xs font-bold uppercase">{t('card')}</span>
                    </button>
                </div>

                {paymentMethod === 'card' && (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard size={64}/></div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-4">Uzcard / Humo</p>
                        <input 
                            value={cardInfo.number}
                            onChange={handleCardNumber}
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-transparent text-xl font-mono mb-4 outline-none placeholder-gray-600"
                            maxLength={19}
                        />
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase">Valid Thru</p>
                                <input 
                                    value={cardInfo.expiry}
                                    onChange={handleExpiry}
                                    placeholder="MM/YY"
                                    className="w-16 bg-transparent font-mono outline-none placeholder-gray-600"
                                    maxLength={5}
                                />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest">{cardName || "CARD HOLDER"}</p>
                        </div>
                    </div>
                )}
            </div>
          )}

          {step === 3 && (
              <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Smartphone size={32} />
                  </div>
                  <h3 className="text-xl font-black uppercase text-gray-800 mb-2">{t('smsVerify')}</h3>
                  <p className="text-sm text-gray-500 mb-6">Tasdiqlash kodi {formData.phone} raqamiga yuborildi</p>
                  
                  <input 
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value)}
                    placeholder="0000"
                    className="text-4xl font-black text-center tracking-[1em] w-full mb-8 outline-none text-indigo-600 placeholder-gray-200"
                    maxLength={4}
                  />

                  <button 
                    onClick={handleVerifyCode}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase shadow-xl hover:bg-indigo-700 transition transform active:scale-95"
                  >
                      Tasdiqlash
                  </button>
                  
                  <button onClick={() => setStep(2)} className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600">
                      Raqamni o'zgartirish
                  </button>
              </div>
          )}

          {/* Action Buttons (Footer) */}
          {step !== 3 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-gray-500 uppercase">{t('total')}:</span>
                    <span className="text-2xl font-black text-indigo-600">{total.toLocaleString()} UZS</span>
                </div>
                <button 
                    onClick={handleNextStep}
                    disabled={checkoutItems.length === 0}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase hover:bg-indigo-600 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {step === 1 ? 'Keyingi bosqich' : t('clickToPay')}
                </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartModal; 
