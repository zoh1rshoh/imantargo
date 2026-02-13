import React, { useState } from 'react';
import { useShop } from './store';
import { Star, Camera, Upload, CheckCircle } from 'lucide-react';
import { Order, Review } from './types';

interface ReviewModalProps {
  order: Order;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ order, onClose }) => {
  const { addReview, currentUser, t } = useShop();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [comment, setComment] = useState('');
  const [image, setImage] = useState('');

  const currentProduct = order.items[currentItemIndex];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (!pros || !cons || !comment) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    const review: Review = {
      id: Date.now(),
      productId: currentProduct.id,
      userId: currentUser?.phone || 'unknown',
      userName: currentUser?.name || 'Mijoz',
      rating,
      pros,
      cons,
      comment,
      imageUrl: image || undefined,
      date: new Date().toLocaleDateString()
    };

    addReview(order.id, review);

    if (currentItemIndex < order.items.length - 1) {
      // Clear form for next item
      setCurrentItemIndex(prev => prev + 1);
      setRating(5);
      setPros('');
      setCons('');
      setComment('');
      setImage('');
    } else {
      // All done
      alert("Sharhingiz uchun rahmat!");
      onClose();
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in relative">
        {/* Progress Bar */}
        <div className="bg-gray-200 h-1 w-full">
            <div 
                className="bg-indigo-600 h-full transition-all duration-300" 
                style={{ width: `${((currentItemIndex + 1) / order.items.length) * 100}%` }}
            ></div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-black uppercase text-center mb-2 text-gray-800 dark:text-white">{t('leaveReview')}</h2>
          <p className="text-center text-sm text-gray-500 mb-8">{currentItemIndex + 1} / {order.items.length}</p>

          <div className="flex flex-col items-center mb-6">
            <img src={currentProduct.image} alt={currentProduct.name} className="w-24 h-24 object-contain mb-4" />
            <h3 className="font-bold text-lg dark:text-white">{currentProduct.name}</h3>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                onClick={() => setRating(star)}
                className={`p-1 transition transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-green-600 uppercase mb-1 block">{t('pros')}</label>
              <textarea 
                value={pros} 
                onChange={e => setPros(e.target.value)} 
                className="w-full p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900 rounded-xl text-sm focus:outline-none focus:border-green-500 dark:text-white"
                placeholder={t('pros')}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-red-500 uppercase mb-1 block">{t('cons')}</label>
              <textarea 
                value={cons} 
                onChange={e => setCons(e.target.value)} 
                className="w-full p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-xl text-sm focus:outline-none focus:border-red-500 dark:text-white"
                placeholder={t('cons')}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">{t('comment')}</label>
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-indigo-600 dark:text-white"
                placeholder={t('comment')}
                rows={3}
              />
            </div>

            {/* Photo Upload */}
            <div className="pt-2">
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">{t('uploadPhoto')}</label>
                <div className="flex gap-4">
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition">
                        <Camera size={24} />
                        <span className="text-[10px] font-bold mt-1 uppercase">Kamera</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition">
                        <Upload size={24} />
                        <span className="text-[10px] font-bold mt-1 uppercase">Yuklash</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    {image && (
                        <div className="w-24 h-24 rounded-xl overflow-hidden border border-indigo-200 relative">
                            <img src={image} className="w-full h-full object-cover" />
                            <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5"><CheckCircle size={12}/></div>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <button 
            onClick={handleNext}
            className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase shadow-xl hover:bg-indigo-700 transition"
          >
            {currentItemIndex < order.items.length - 1 ? t('nextProduct') : t('leaveReview')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
