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

  // Accurate Match Logic using parseGuessText output structure
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
        matchTypes.push({ type: 'OPEN PANNA', val: openPanna });
      }

      // 2. Open Ank Check
      if (openAnk && parsed.openAnks?.includes(openAnk)) {
        matchTypes.push({ type: 'OPEN SINGLE', val: openAnk });
      }

      // 3. Close Ank Check
      if (closeAnk && parsed.closeAnks?.includes(closeAnk)) {
        matchTypes.push({ type: 'CLOSE SINGLE', val: closeAnk });
      }

      // 4. Close Panna Check
      if (closePanna && (parsed.pannas?.includes(closePanna) || rawText.includes(closePanna))) {
        matchTypes.push({ type: 'CLOSE PANNA', val: closePanna });
      }

      // 5. Jodi Check
      if (fullJodi) {
        const jodiInParsed = parsed.jodi?.includes(fullJodi);
        const jodiRegex = new RegExp(`(?:^|\\D)${fullJodi}(?:\\D|$)`);
        if (jodiInParsed || jodiRegex.test(rawText)) {
          matchTypes.push({ type: 'JODI WINNER', val: fullJodi });
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

    // Latest posts first
    matched.sort((a, b) => b.createdAtDate - a.createdAtDate);
    setWinners(matched);
  };

  const uniqueMarkets = Array.from(
    new Set(posts.map(p => p.parsedData?.market || 'GENERAL'))
  );

  return (
    <div className="w-full max-w-xl mx-auto bg-white font-sans text-xs border border-orange-400 p-2 shadow-md">
      
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
              className="w-full border p-1 uppercase bg-white font-bold rounded text-xs"
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
              className="w-full border p-1 uppercase bg-white font-bold rounded text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 text-center pt-1">
          <div>
            <span className="text-[10px] font-bold block text-gray-600">Open Panna</span>
            <input 
              type="text" 
              maxLength="3" 
              placeholder="450" 
              value={openPanna}
              onChange={(e) => setOpenPanna(e.target.value)}
              className="w-full border p-1 text-center font-bold text-xs bg-yellow-50 rounded"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold block text-gray-600">Open Ank</span>
            <input 
              type="text" 
              maxLength="1" 
              placeholder="9" 
              value={openAnk}
              onChange={(e) => setOpenAnk(e.target.value)}
              className="w-full border p-1 text-center font-bold text-xs bg-yellow-50 rounded"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold block text-gray-600">Close Ank</span>
            <input 
              type="text" 
              maxLength="1" 
              placeholder="5" 
              value={closeAnk}
              onChange={(e) => setCloseAnk(e.target.value)}
              className="w-full border p-1 text-center font-bold text-xs bg-yellow-50 rounded"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold block text-gray-600">Close Panna</span>
            <input 
              type="text" 
              maxLength="3" 
              placeholder="690" 
              value={closePanna}
              onChange={(e) => setClosePanna(e.target.value)}
              className="w-full border p-1 text-center font-bold text-xs bg-yellow-50 rounded"
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
      <div className="mt-3 space-y-2">
        <div className="bg-[#000080] text-yellow-300 py-1.5 px-2 font-bold flex justify-between items-center">
          <span>MATCHED RESULTS</span>
          <span>TOTAL: {winners.length}</span>
        </div>

        {winners.length === 0 ? (
          <div className="text-center py-6 text-gray-500 font-semibold border border-dashed p-4">
            No winners found. Enter result numbers above and click "Find Winners".
          </div>
        ) : (
          <div className="space-y-2">
            {winners.map((win) => (
              <div key={win.id} className="border border-orange-400 bg-white p-2 rounded shadow-sm">
                <div className="flex justify-between font-bold text-gray-700 border-b pb-1 mb-1">
                  <span className="text-green-700">🕒 {win.formattedTime}</span>
                  <span className="text-red-600 uppercase">👤 {win.username}</span>
                </div>

                <div className="flex flex-wrap gap-1 my-1">
                  <span className="bg-blue-900 text-yellow-300 px-1 py-0.5 rounded text-[9px] font-bold">
                    Market: {win.market}
                  </span>
                  {win.matches.map((m, i) => (
                    <span key={i} className="bg-red-600 text-white px-1 py-0.5 rounded text-[9px] font-bold">
                      {m.type}: {m.val}
                    </span>
                  ))}
                </div>

                <div className="bg-yellow-50 p-1.5 text-black font-bold whitespace-pre-wrap mt-1 border">
                  {win.originalGuess}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
                }
                
