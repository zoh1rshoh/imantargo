import React, { useState, useEffect, useRef } from 'react';
import { useShop } from './store';
import { Send, X, MessageCircle } from 'lucide-react';

interface OrderChatModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
}

const OrderChatModal: React.FC<OrderChatModalProps> = ({ orderId, isOpen, onClose }) => {
  const { messages, sendOrderMessage, t } = useShop();
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const orderMessages = messages.filter(m => m.orderId === orderId);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, orderMessages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendOrderMessage(orderId, text, 'user');
    setText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md h-[600px] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in relative">
         <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-indigo-600 text-white">
            <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <h3 className="font-bold uppercase">{t('orders')} #{orderId}</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-indigo-700 rounded-full"><X size={20}/></button>
         </div>

         <div className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
             {orderMessages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                     <MessageCircle size={48} className="mb-2 opacity-50"/>
                     <p className="text-sm">{t('adminChat')}</p>
                 </div>
             ) : (
                 orderMessages.map(m => (
                     <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-white border dark:border-gray-600 rounded-bl-none shadow-sm'}`}>
                             <p>{m.text}</p>
                             <span className={`text-[9px] block text-right mt-1 ${m.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>{m.timestamp}</span>
                         </div>
                     </div>
                 ))
             )}
             <div ref={chatEndRef}></div>
         </div>

         <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
             <input 
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t('typeMessage')}
                className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none dark:text-white"
             />
             <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                 <Send size={20} />
             </button>
         </div>
      </div>
    </div>
  );
};

export default OrderChatModal;
