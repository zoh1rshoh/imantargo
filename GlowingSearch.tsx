import React from 'react';

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GlowingSearch: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="p-4 w-full max-w-md mx-auto relative z-10">
      {/* Kamalak (Rainbow) animatsiyasi */}
      <style>{`
        @keyframes rainbow-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-rainbow {
          background: linear-gradient(
            270deg, 
            #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000
          );
          background-size: 400% 400%;
          animation: rainbow-move 6s ease infinite;
        }
      `}</style>

      <div className="relative group">
        {/* Orqa fon (Glowing Effect) - Bu o'sha rangli effekt */}
        <div className="absolute -inset-1 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200 animate-rainbow"></div>
        
        {/* Asosiy Input qismi - OQ RANGDA */}
        <div className="relative flex items-center bg-white rounded-lg leading-none border border-gray-200 shadow-sm">
          <span className="pl-4 text-gray-500">
            {/* Qidiruv ikonkachasi - Kulrang */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full p-4 bg-white text-gray-900 rounded-lg focus:outline-none placeholder-gray-400 font-bold"
            placeholder="Mahsulotlarni qidirish..."
          />
        </div>
      </div>
    </div>
  );
};

export default GlowingSearch;
