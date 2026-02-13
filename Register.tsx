import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { MapPin, User, Phone, Lock, FileText, X, LocateFixed } from 'lucide-react';

interface RegisterProps {
  onClose?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    passportSeries: '',
    passportNumber: '',
    password: '',
    address: '',
  });
  
  const [location, setLocation] = useState<string>(''); 
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false); // Joylashuvni aniqlash jarayoni

  // 1. Manzil yozganda koordinatani topish
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData({ ...formData, address });

    if (address.length > 4) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setLocation(`${lat}, ${lon}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 2. "MENING JOYIM" (GPS) ni aniqlash funksiyasi
  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = `${latitude}, ${longitude}`;
        setLocation(coords);

        // Koordinatadan Manzilni topish (Reverse Geocoding)
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
            setFormData(prev => ({ ...prev, address: coords }));
          }
        } catch (error) {
          setFormData(prev => ({ ...prev, address: coords }));
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        alert("Joylashuvni aniqlab bo'lmadi. Ruxsat berilganini tekshiring.");
        setLocating(false);
      }
    );
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.phone || !formData.password) {
      alert("Asosiy maydonlarni to'ldiring!");
      return;
    }
    setLoading(true);
    const fullPassport = `${formData.passportSeries}${formData.passportNumber}`.toUpperCase();

    try {
      const { error } = await supabase.from('imantargo').insert([
        {
          name: formData.name,
          phone: formData.phone,
          passport: fullPassport,
          password: formData.password,
          address: formData.address,
          location: location,
          role: 'user',
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString()
        }
      ]);

      if (error) throw error;
      alert("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      if (onClose) onClose();
      window.location.reload();
    } catch (error: any) {
      alert("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-md relative shadow-2xl animate-fade-in">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
      )}
      
      <h2 className="text-2xl font-black text-center text-gray-800 dark:text-white mb-6 uppercase">Ro'yxatdan o'tish</h2>

      <div className="space-y-4">
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
          <User className="text-gray-400 mr-3" size={20} />
          <input type="text" placeholder="Ism Familiya" className="bg-transparent w-full outline-none text-gray-700 dark:text-white font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>

        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
          <Phone className="text-gray-400 mr-3" size={20} />
          <input type="tel" placeholder="99 123 45 67" className="bg-transparent w-full outline-none text-gray-700 dark:text-white font-bold" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600 w-24">
             <span className="text-gray-400 mr-1"><FileText size={18}/></span>
             <input type="text" placeholder="AA" maxLength={2} className="bg-transparent w-full outline-none text-gray-700 dark:text-white font-bold uppercase text-center" value={formData.passportSeries} onChange={(e) => setFormData({...formData, passportSeries: e.target.value.toUpperCase()})} />
          </div>
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600 flex-grow">
             <input type="number" placeholder="1234567" maxLength={7} className="bg-transparent w-full outline-none text-gray-700 dark:text-white font-bold" value={formData.passportNumber} onChange={(e) => setFormData({...formData, passportNumber: e.target.value})} />
          </div>
        </div>

        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
          <Lock className="text-gray-400 mr-3" size={20} />
          <input type="password" placeholder="Parol" className="bg-transparent w-full outline-none text-gray-700 dark:text-white font-bold" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
        </div>

        {/* MANZIL VA GPS TUGMASI */}
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600 relative">
          <MapPin className={`mr-3 transition ${location ? 'text-green-500' : 'text-gray-400'}`} size={20} />
          <input 
            type="text" 
            placeholder="Manzil" 
            className="bg-transparent w-full outline-none text-gray-700 dark:text-white font-bold pr-8"
            value={formData.address}
            onChange={handleAddressChange}
          />
          
          {/* NISHON TUGMASI (GPS) */}
          <button 
            onClick={detectMyLocation}
            disabled={locating}
            className={`absolute right-2 p-1.5 rounded-lg transition ${locating ? 'bg-gray-300 animate-pulse' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
            title="Mening joylashuvim"
          >
            <LocateFixed size={18} />
          </button>
        </div>
        {location && <p className="text-[10px] text-green-500 text-center font-bold">Manzil xaritada belgilandi!</p>}

        <button onClick={handleRegister} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg transition">{loading ? "Kuting..." : "DAVOM ETISH"}</button>
      </div>
    </div>
  );
};

export default Register;
