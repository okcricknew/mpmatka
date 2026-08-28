'use client'

import React, { useState } from 'react'

export default function WinnerListClient({ initialPosts }) {
  const [posts] = useState(initialPosts || [])
  const [filterMarket, setFilterMarket] = useState('ALL')
  const [customHeading, setCustomHeading] = useState('WINNER LIST')

  // Result Inputs
  const [openPanna, setOpenPanna] = useState('')
  const [openAnk, setOpenAnk] = useState('')
  const [closeAnk, setCloseAnk] = useState('')
  const [closePanna, setClosePanna] = useState('')

  const [winners, setWinners] = useState([])
  const [addedUsers, setAddedUsers] = useState({}) // Tracks added state per user/category

  // Timestamp Formatter
  const formatTimestamp = (dateIsoStr) => {
    if (!dateIsoStr) return "Just now";
    const date = new Date(dateIsoStr);
    if (isNaN(date.getTime())) return "Just now";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }

  const fullJodi = (openAnk && closeAnk) ? `${openAnk}${closeAnk}` : ''

  // Accurate Match Logic
  const handleCalculateWinners = (e) => {
    e.preventDefault();

    if (!openPanna && !openAnk && !closeAnk && !closePanna) {
      alert('Kripya kam se kam ek result field bharein!')
      return;
    }

    const matched = [];

    posts.forEach(post => {
      const parsed = post.parsedData || {};
      const postMarket = parsed.market || 'GENERAL';
      const rawText = post.guess || '';

      // Market Filter
      if (filterMarket !== 'ALL' && postMarket.toUpperCase() !== filterMarket.toUpperCase()) {
        return;
      }

      const matchTypes = [];

      // 1. Open Panna Check
      if (openPanna && (parsed.pannas?.includes(openPanna) || rawText.includes(openPanna))) {
        matchTypes.push({ type: 'OPEN PANNA', val: openPanna, category: 'panna' });
      }

      // 2. Open Ank Check
      if (openAnk && parsed.openAnks?.includes(openAnk)) {
        matchTypes.push({ type: 'OPEN SINGLE', val: openAnk, category: 'open' });
      }

      // 3. Close Ank Check
      if (closeAnk && parsed.closeAnks?.includes(closeAnk)) {
        matchTypes.push({ type: 'CLOSE SINGLE', val: closeAnk, category: 'close' });
      }

      // 4. Close Panna Check
      if (closePanna && (parsed.pannas?.includes(closePanna) || rawText.includes(closePanna))) {
        matchTypes.push({ type: 'CLOSE PANNA', val: closePanna, category: 'panna' });
      }

      // 5. Jodi Check
      if (fullJodi) {
        const jodiInParsed = parsed.jodi?.includes(fullJodi);
        const jodiRegex = new RegExp(`(?:^|\\D)${fullJodi}(?:\\D|$)`);
        if (jodiInParsed || jodiRegex.test(rawText)) {
          matchTypes.push({ type: 'JODI WINNER', val: fullJodi, category: 'jodi' });
        }
      }

      if (matchTypes.length > 0) {
        matched.push({
          id: post.id,
          username: post.username || 'USER',
          market: postMarket,
          matches: matchTypes,
          originalGuess: rawText,
          formattedTime: formatTimestamp(post.createdAt),
          createdAtDate: new Date(post.createdAt || 0)
        });
      }
    });

    matched.sort((a, b) => b.createdAtDate - a.createdAtDate);
    setWinners(matched);
    setAddedUsers({}); // Reset additions on new calculation
  };

  const toggleAddUser = (userId, category) => {
    const key = `${userId}-${category}`;
    setAddedUsers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const uniqueMarkets = Array.from(
    new Set(posts.map(p => p.parsedData?.market || 'GENERAL'))
  );

  // Group winners by category type ('open', 'close', 'panna', 'jodi')
  const categorizedWinners = {
    open: winners.filter(w => w.matches.some(m => m.category === 'open')),
    close: winners.filter(w => w.matches.some(m => m.category === 'close')),
    panna: winners.filter(w => w.matches.some(m => m.category === 'panna')),
    jodi: winners.filter(w => w.matches.some(m => m.category === 'jodi')),
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white font-sans text-xs border border-orange-400 p-2 shadow-md my-4">
      
      <div className="bg-yellow-400 text-black text-center py-2 font-black text-sm border-b border-orange-400 uppercase tracking-wider mb-2">
        🎯 WINNER FILTER TOOL
      </div>

      <form onSubmit={handleCalculateWinners} className="bg-gray-100 p-2 border border-orange-400 space-y-2 rounded">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold block text-[10px] mb-1">Market Filter:</label>
            <select 
              value={filterMarket}
              onChange={(e) => setFilterMarket(e.target.value)}
              className="w-full border p-1 uppercase bg-white font-bold rounded text-xs text-black"
            >
              <option value="ALL">ALL MARKETS</option>
              {uniqueMarkets.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold block text-[10px] mb-1">Card Heading:</label>
            <input 
              type="text" 
              value={customHeading}
              onChange={(e) => setCustomHeading(e.target.value)}
              className="w-full border p-1 uppercase bg-white font-bold rounded text-xs text-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 text-center pt-1">
          <div>
            <span className="text-[10px] font-bold block text-gray-600">Open Panna</span>
            <input 
              type="text" maxLength="3" placeholder="450" 
              value={openPanna} onChange={(e) => setOpenPanna(e.target.value)}
              className="w-full border p-1 text-center font-bold text-xs bg-yellow-50 rounded text-black"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold block text-gray-600">Open Ank</span>
            <input 
              type="text" maxLength="1" placeholder="9" 
              value={openAnk} onChange={(e) => setOpenAnk(e.target.value)}
              className="w-full border p-1 text-center font-bold text-xs bg-yellow-50 rounded text-black"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold block text-gray-600">Close Ank</span>
            <input 
              type="text" maxLength="1" placeholder="5" 
              value={closeAnk} onChange={(e) => setCloseAnk(e.target.value)}
              className="w-full border p-1 text-center font-bold text-xs bg-yellow-50 rounded text-black"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold block text-gray-600">Close Panna</span>
            <input 
              type="text" maxLength="3" placeholder="690" 
              value={closePanna} onChange={(e) => setClosePanna(e.target.value)}
              className="w-full border p-1 text-center font-bold text-xs bg-yellow-50 rounded text-black"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2 rounded text-xs uppercase shadow cursor-pointer mt-2"
        >
          Find Winners
        </button>
      </form>

      {/* Results Section */}
      <div className="mt-3 space-y-4">
        <div className="bg-[#000080] text-yellow-300 py-1.5 px-2 font-bold flex justify-between items-center">
          <span>{customHeading}</span>
          <span>TOTAL MATCHES: {winners.length}</span>
        </div>

        {winners.length === 0 ? (
          <div className="text-center py-6 text-gray-500 font-semibold border border-dashed p-4">
            No winners found. Enter result numbers above and click "Find Winners".
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* 1. OPEN WINNERS SECTION */}
            {openAnk && categorizedWinners.open.length > 0 && (
              <div className="border border-orange-300 rounded p-2 bg-yellow-50/50">
                <div className="font-extrabold text-black text-center border-b border-orange-300 pb-1 mb-2 uppercase">
                  {filterMarket !== 'ALL' ? filterMarket : 'MARKET'} OPEN WINNERS ({openAnk})
                </div>
                <div className="space-y-2">
                  {categorizedWinners.open.map(win => {
                    const isAdded = addedUsers[`${win.id}-open`];
                    return (
                      <div key={`open-${win.id}`} className="bg-white border p-2 rounded flex justify-between items-center shadow-xs">
                        <div>
                          <div className="font-bold text-red-600">👤 {win.username}</div>
                          <div className="text-[10px] text-gray-500">{win.formattedTime} | Market: {win.market}</div>
                          <div className="text-gray-800 font-semibold mt-1">Guess: {win.originalGuess}</div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => toggleAddUser(win.id, 'open')}
                          className={`px-3 py-1 font-bold text-xs rounded cursor-pointer ${isAdded ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
                        >
                          {isAdded ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. CLOSE WINNERS SECTION */}
            {closeAnk && categorizedWinners.close.length > 0 && (
              <div className="border border-orange-300 rounded p-2 bg-yellow-50/50">
                <div className="font-extrabold text-black text-center border-b border-orange-300 pb-1 mb-2 uppercase">
                  {filterMarket !== 'ALL' ? filterMarket : 'MARKET'} CLOSE WINNERS ({closeAnk})
                </div>
                <div className="space-y-2">
                  {categorizedWinners.close.map(win => {
                    const isAdded = addedUsers[`${win.id}-close`];
                    return (
                      <div key={`close-${win.id}`} className="bg-white border p-2 rounded flex justify-between items-center shadow-xs">
                        <div>
                          <div className="font-bold text-red-600">👤 {win.username}</div>
                          <div className="text-[10px] text-gray-500">{win.formattedTime} | Market: {win.market}</div>
                          <div className="text-gray-800 font-semibold mt-1">Guess: {win.originalGuess}</div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => toggleAddUser(win.id, 'close')}
                          className={`px-3 py-1 font-bold text-xs rounded cursor-pointer ${isAdded ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
                        >
                          {isAdded ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. PANNA WINNERS SECTION */}
            {(openPanna || closePanna) && categorizedWinners.panna.length > 0 && (
              <div className="border border-orange-300 rounded p-2 bg-yellow-50/50">
                <div className="font-extrabold text-black text-center border-b border-orange-300 pb-1 mb-2 uppercase">
                  PANNA WINNERS
                </div>
                <div className="space-y-2">
                  {categorizedWinners.panna.map(win => {
                    const isAdded = addedUsers[`${win.id}-panna`];
                    return (
                      <div key={`panna-${win.id}`} className="bg-white border p-2 rounded flex justify-between items-center shadow-xs">
                        <div>
                          <div className="font-bold text-red-600">👤 {win.username}</div>
                          <div className="text-[10px] text-gray-500">{win.formattedTime} | Market: {win.market}</div>
                          <div className="text-gray-800 font-semibold mt-1">Guess: {win.originalGuess}</div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => toggleAddUser(win.id, 'panna')}
                          className={`px-3 py-1 font-bold text-xs rounded cursor-pointer ${isAdded ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
                        >
                          {isAdded ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. JODI WINNERS SECTION */}
            {fullJodi && categorizedWinners.jodi.length > 0 && (
              <div className="border border-orange-300 rounded p-2 bg-yellow-50/50">
                <div className="font-extrabold text-black text-center border-b border-orange-300 pb-1 mb-2 uppercase">
                  JODI WINNERS ({fullJodi})
                </div>
                <div className="space-y-2">
                  {categorizedWinners.jodi.map(win => {
                    const isAdded = addedUsers[`${win.id}-jodi`];
                    return (
                      <div key={`jodi-${win.id}`} className="bg-white border p-2 rounded flex justify-between items-center shadow-xs">
                        <div>
                          <div className="font-bold text-red-600">👤 {win.username}</div>
                          <div className="text-[10px] text-gray-500">{win.formattedTime} | Market: {win.market}</div>
                          <div className="text-gray-800 font-semibold mt-1">Guess: {win.originalGuess}</div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => toggleAddUser(win.id, 'jodi')}
                          className={`px-3 py-1 font-bold text-xs rounded cursor-pointer ${isAdded ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
                        >
                          {isAdded ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-center font-black text-red-600 pt-2 tracking-widest text-sm">
              ✨ CONGRATULATIONS TO ALL WINNERS ✨
            </div>

          </div>
        )}
      </div>

    </div>
  )
                }
                
