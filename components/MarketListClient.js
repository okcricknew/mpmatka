'use client';

import React, { useState, useEffect } from 'react';
import { STATIC_MARKETS } from '../services/marketService';

export default function MarketListClient({ initialResults }) {
  const [marketResults, setMarketResults] = useState(initialResults);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [newResult, setNewResult] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Browser par admin status check karna
    const adminStatus = localStorage.getItem('is_admin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  const handleOpenModal = (market) => {
    if (!isAdmin) return;
    setSelectedMarket(market);
    const currentData = marketResults[market.name] || {};
    setNewResult(currentData.result || '140-55-140');
    setNewTime(currentData.time || market.time);
    setNewMessage(currentData.message || '');
  };

  const handleCloseModal = () => {
    setSelectedMarket(null);
    setNewResult('');
    setNewTime('');
    setNewMessage('');
  };

  const handleNavigation = (marketName, type) => {
    const formattedSlug = marketName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/${formattedSlug}-${type}-chart`;
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedMarket || !isAdmin) return;

    setLoading(true);
    const marketName = selectedMarket.name;

    try {
      const response = await fetch('/api/update-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: marketName,
          result: newResult.trim(),
          time: newTime.trim(),
          message: newMessage.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setMarketResults(prev => ({
        ...prev,
        [marketName]: {
          ...prev[marketName],
          result: newResult.trim(),
          time: newTime.trim(),
          message: newMessage.trim(),
        }
      }));

      handleCloseModal();
    } catch (error) {
      alert('Error updating: ' + error.message);
    } finally {
      setLoading(false);
    }
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

              {isAdmin && (
                <div className="mt-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="bg-red-600 text-white text-[10px] font-bold px-3 py-0.5 rounded border border-red-800 shadow-sm"
                  >
                    ✏️ Update {item.name}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedMarket && isAdmin && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 px-4">
          <div className="bg-white border-2 border-red-600 w-full max-w-sm p-4 rounded shadow-xl">
            <h3 className="text-sm font-bold text-blue-900 border-b border-gray-300 pb-2 mb-3 text-center">
              Update Market: {selectedMarket.name}
            </h3>

            <form onSubmit={handleSaveUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1">Result:</label>
                <input
                  type="text"
                  value={newResult}
                  onChange={(e) => setNewResult(e.target.value)}
                  className="w-full border border-gray-400 p-1.5 text-xs font-bold text-red-600 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Time:</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full border border-gray-400 p-1.5 text-xs font-bold text-black rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Message:</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-400 p-2 text-xs font-bold text-black rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white text-xs font-bold px-4 py-1.5 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-700 text-white text-xs font-bold px-4 py-1.5 rounded"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
                    }
        
