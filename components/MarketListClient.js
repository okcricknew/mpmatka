'use client';

import React, { useState, useEffect } from 'react';
import { STATIC_MARKETS } from '../utils/constants';

export default function MarketListClient({ initialResults }) {
  const [marketResults, setMarketResults] = useState(initialResults);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('is_admin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  const handleNavigation = (marketName, type) => {
    const formattedSlug = marketName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/${formattedSlug}-${type}-chart`;
  };

  return (
    <div className="w-full border-2 border-red-600 bg-white pt-2 pb-2">
      <div className="w-full space-y-0">
        {STATIC_MARKETS.map((item) => {
          const liveData = marketResults[item.name] || {};
          const displayResult = liveData.result || '140-55-140';
          const displayTime = liveData.time || item.time;
          const isHighlighted = ['KALYAN', 'MAIN BAZAR', 'SRIDEVI', 'SRIDEVI NIGHT'].includes(item.name);

          return (
            <div
              key={item.id}
              className={`w-full border-b border-gray-300 py-2.5 px-3 flex flex-col items-center box-border ${isHighlighted ? 'bg-yellow-300' : 'bg-white'}`}
            >
              <div className="w-full flex justify-between items-end">
                <button 
                  onClick={() => handleNavigation(item.name, 'jodi')}
                  className="bg-blue-900 text-white text-[10px] font-bold px-3.5 py-1 rounded-full border border-blue-950 shadow-sm cursor-pointer"
                >
                  JODI
                </button>

                <div className="text-center flex-1 mx-1">
                  <h3 className="w-full font-bold text-[25px] text-black tracking-wide">{item.name}</h3>
                  <p className="w-full text-red-600 font-extrabold text-[22px] tracking-widest my-0.5">{displayResult}</p>
                  {liveData.message && (
                    <p className="w-full text-[15px] text-black font-bold leading-tight whitespace-pre-line mb-1">
                      {liveData.message}
                    </p>
                  )}
                  <span className="w-full text-[16px] text-black font-semibold">({displayTime})</span>
                </div>

                <button 
                  onClick={() => handleNavigation(item.name, 'panel')}
                  className="bg-blue-900 text-white text-[10px] font-bold px-3.5 py-1 rounded-full border border-blue-950 shadow-sm cursor-pointer"
                >
                  PANEL
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
