import React, { useState } from 'react';
import { X, Star, MessageCircle, Info, Send } from 'lucide-react';
import { Product } from './types';
import { useShop } from './store';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const { questions, addQuestion, currentUser, t } = useShop();
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'questions'>('specs');
  const [newQuestion, setNewQuestion] = useState('');

  if (!isOpen || !product) return null;

  const productQuestions = questions.filter(q => q.productId === product.id);

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    addQuestion(product.id, newQuestion);
    setNewQuestion('');
    alert("Savolingiz yuborildi!");
  };

  const handleAddToCartClick = () => {
      if (!currentUser) {
          alert("Avval ro'yxatdan o'ting");
          return;
      }
      onAddToCart(product);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-fade-in">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 p-2 bg-white text-red-500 rounded-full shadow-lg border hover:bg-gray-100 transition-transform hover:scale-110"
        >
          <X size={20} />
        </button>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 rounded-2xl p-4">
                <img src={product.image} alt={product.name} className="max-w-full max-h-[400px] object-contain mix-blend-multiply" />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-black uppercase text-gray-900 leading-tight mb-2">{product.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                   <div className="flex text-yellow-400"><Star size={16} fill="currentColor" /></div>
                   <span className="font-bold text-gray-500 text-sm">{product.rating} {t('rating')}</span>
                </div>
                <p className="text-3xl font-black text-indigo-600 mb-6">{product.price.toLocaleString()} UZS</p>
                <div className="space-y-2 mb-8">
                  <p className="text-sm font-bold text-gray-500"><span className="text-gray-900">{t('brand')}:</span> {product.brand}</p>
                  <p className="text-sm font-bold text-gray-500"><span className="text-gray-900">{t('category')}:</span> {t(product.category)}</p>
                  <p className="text-sm font-bold text-gray-500"><span className="text-gray-900">{t('stock')}:</span> {product.stock} {t('pieces')}</p>
                </div>
                <button 
                  onClick={handleAddToCartClick}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase hover:bg-indigo-600 transition"
                >
                  {t('addToCart')}
                </button>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex border-b border-gray-200">
                <button 
                  onClick={() => setActiveTab('specs')}
                  className={`px-6 py-3 font-bold text-sm uppercase transition border-b-2 ${activeTab === 'specs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  <div className="flex items-center gap-2"><Info size={16} /> {t('specs')}</div>
                </button>
                <button 
                  onClick={() => setActiveTab('questions')}
                  className={`px-6 py-3 font-bold text-sm uppercase transition border-b-2 ${activeTab === 'questions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  <div className="flex items-center gap-2"><MessageCircle size={16} /> {t('questions')} ({productQuestions.length})</div>
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-3 font-bold text-sm uppercase transition border-b-2 ${activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                   <div className="flex items-center gap-2"><Star size={16} /> {t('reviews')}</div>
                </button>
              </div>

              <div className="py-6">
                {activeTab === 'specs' && (
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-gray-700 leading-relaxed font-medium">{product.specs}</p>
                    <p className="mt-4 text-xs text-gray-400 font-mono">SKU: {product.sku}</p>
                  </div>
                )}

                {activeTab === 'questions' && (
                  <div className="space-y-6">
                     <form onSubmit={handleSubmitQuestion} className="flex gap-2">
                        <input 
                          type="text" 
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder={t('askQuestion')}
                          className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                        />
                        <button type="submit" className="px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"><Send size={18} /></button>
                     </form>
                     
                     <div className="space-y-4">
                        {productQuestions.length === 0 ? (
                          <p className="text-gray-400 text-center py-4">{t('noQuestions')}</p>
                        ) : (
                          productQuestions.map(q => (
                            <div key={q.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                               <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-gray-900">{q.userName}</span>
                                  <span className="text-[10px] text-gray-400">{q.date}</span>
                                </div>
                               <p className="text-gray-700 font-medium mb-3">{q.text}</p>
                               {q.answer ? (
                                 <div className="bg-indigo-50 p-3 rounded-lg ml-4 border-l-2 border-indigo-600">
                                   <p className="text-xs font-black text-indigo-600 uppercase mb-1">{t('adminAnswer')}:</p>
                                   <p className="text-sm text-gray-800">{q.answer}</p>
                                 </div>
                               ) : (
                                 <p className="text-xs text-orange-500 italic">{t('waitAnswer')}</p>
                               )}
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="text-center py-10">
                    <Star size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">{t('nothingFound')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
