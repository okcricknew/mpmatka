'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase' // Aapke project ka client firebase path
import { collection, onSnapshot } from 'firebase/firestore'
import { subscribeAdminStatus } from '@/utils/admins'

export default function WinnerListClient({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts || [])
  const [isAdmin, setIsAdmin] = useState(false)
  const [filterMarket, setFilterMarket] = useState('ALL')
  const [customHeading, setCustomHeading] = useState('TIME BAZAR OPEN WINNERS')

  // Result Inputs
  const [openPanna, setOpenPanna] = useState('')
  const [openAnk, setOpenAnk] = useState('')
  const [closeAnk, setCloseAnk] = useState('')
  const [closePanna, setClosePanna] = useState('')

  const [winners, setWinners] = useState([])
  const [selectedWinners, setSelectedWinners] = useState([])

  useEffect(() => {
    return subscribeAdminStatus(setIsAdmin)
  }, [])

  // Realtime updates for posts if admin
  useEffect(() => {
    if (!isAdmin) return

    const unsubscribe = onSnapshot(collection(db, 'guessing_posts'), (snapshot) => {
      const list = []
      snapshot.forEach(docSnap => {
        const data = docSnap.data()
        let createdAtIso = new Date().toISOString()
        if (data.createdAt?.toDate) {
          createdAtIso = data.createdAt.toDate().toISOString()
        } else if (data.cachedTime) {
          createdAtIso = new Date(data.cachedTime).toISOString()
        }
        list.push({ id: docSnap.id, ...data, createdAt: createdAtIso })
      })
      setPosts(list)
    }, (err) => console.error("Winner list fetch error:", err))

    return () => unsubscribe()
  }, [isAdmin])

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

  // Result String Calculations
  const fullJodi = (openAnk && closeAnk) ? `${openAnk}${closeAnk}` : ''
  
  const displayResult = () => {
    if (openPanna && openAnk && closeAnk && closePanna) {
      return `${openPanna}-${openAnk}${closeAnk}-${closePanna}`
    }
    if (openPanna || openAnk) return `${openPanna || '***'}-${openAnk || '*'}`
    if (closeAnk || closePanna) return `${closeAnk || '*'}-${closePanna || '***'}`
    if (fullJodi) return fullJodi
    return '***-*'
  }

  // Filter Winners Logic using your parser's structured data (`parsedData`)
  const calculateWinners = () => {
    if (!openPanna && !openAnk && !closeAnk && !closePanna) {
      alert('Kripya kam se kam ek result field fill karein!')
      return
    }

    const matchedWinners = []

    posts.forEach(post => {
      const parsed = post.parsedData || {}
      const postMarket = parsed.market || 'GENERAL'
      const rawGuessText = post.guess || ''

      if (filterMarket !== 'ALL' && postMarket.toUpperCase() !== filterMarket.toUpperCase()) {
        return
      }

      const matchTypes = []

      // 1. Open Panna Match
      if (openPanna && (parsed.pannas?.includes(openPanna) || rawGuessText.includes(openPanna))) {
        matchTypes.push({ type: 'OPEN PANNA', val: openPanna })
      }

      // 2. Open Single Match
      if (openAnk && (parsed.openAnks?.includes(openAnk))) {
        matchTypes.push({ type: 'OPEN SINGLE', val: openAnk })
      }

      // 3. Close Single Match
      if (closeAnk && (parsed.closeAnks?.includes(closeAnk))) {
        matchTypes.push({ type: 'CLOSE SINGLE', val: closeAnk })
      }

      // 4. Close Panna Match
      if (closePanna && (parsed.pannas?.includes(closePanna) || rawGuessText.includes(closePanna))) {
        matchTypes.push({ type: 'CLOSE PANNA', val: closePanna })
      }

      // 5. Jodi Winner Match
      if (fullJodi) {
        const jodiInParsed = parsed.jodi?.includes(fullJodi)
        const jodiRegex = new RegExp(`(?:^|\\D)${fullJodi}(?:\\D|$)`)
        const jodiInRawText = jodiRegex.test(rawGuessText)

        if (jodiInParsed || jodiInRawText) {
          matchTypes.push({ type: 'JODI WINNER', val: fullJodi })
        }
      }

      if (matchTypes.length > 0) {
        matchedWinners.push({
          id: post.id,
          username: post.username || 'USER',
          market: postMarket,
          matches: matchTypes,
          originalGuess: post.guess,
          formattedTime: formatTimestamp(post.createdAt),
          createdAtDate: new Date(post.createdAt || 0)
        })
      }
    })

    matchedWinners.sort((a, b) => b.createdAtDate - a.createdAtDate)
    setWinners(matchedWinners)
  }

  const handleAddWinner = (winner) => {
    if (!selectedWinners.some(w => w.id === winner.id)) {
      setSelectedWinners([...selectedWinners, winner])
    }
  }

  const handleRemoveWinner = (id) => {
    setSelectedWinners(selectedWinners.filter(w => w.id !== id))
  }

  const handleReset = () => {
    setOpenPanna('')
    setOpenAnk('')
    setCloseAnk('')
    setClosePanna('')
    setWinners([])
    setSelectedWinners([])
  }

  const uniqueMarkets = Array.from(
    new Set(posts.map(p => p.parsedData?.market || 'GENERAL'))
  )

  const openSingleWinnersList = selectedWinners.filter(w => 
    w.matches.some(m => m.type === 'OPEN SINGLE')
  )

  const openPannaWinnersList = selectedWinners.filter(w => 
    w.matches.some(m => m.type === 'OPEN PANNA')
  )

  const closeWinnersList = selectedWinners.filter(w => 
    w.matches.some(m => m.type === 'CLOSE SINGLE')
  )

  const jodiWinnersList = selectedWinners.filter(w => 
    w.matches.some(m => m.type === 'JODI WINNER')
  )

  const closePannaWinnersList = selectedWinners.filter(w => 
    w.matches.some(m => m.type === 'CLOSE PANNA')
  )

  const isFullResultMode = Boolean(openPanna && openAnk && closeAnk && closePanna)

  if (!isAdmin) return null

  return (
    <div className="w-full mt-2 bg-[#F4F4F4] font-sans text-xs border border-orange-400 max-w-xl mx-auto">
      
      {/* Header */}
      <div className="bg-yellow-400 text-black text-center py-1.5 font-black text-xs border-b border-orange-400 uppercase tracking-wider">
        🏆 WINNER LIST FORUM 🏆
      </div>

      {/* Control Panel */}
      <div className="p-2 bg-gray-50 border-b border-orange-400 space-y-2">
        <div className="grid grid-cols-2 gap-1.5 font-bold">
          <div>
            <label className="text-gray-800 block text-[10px] mb-0.5">Select Market:</label>
            <select 
              value={filterMarket}
              onChange={(e) => {
                setFilterMarket(e.target.value)
                if (e.target.value !== 'ALL') setCustomHeading(`${e.target.value} OPEN WINNERS`)
              }}
              className="w-full border border-orange-400 rounded px-1 py-0.5 uppercase bg-white text-black font-bold text-xs"
            >
              <option value="ALL">ALL MARKETS</option>
              {uniqueMarkets.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-800 block text-[10px] mb-0.5">Heading Text:</label>
            <input
              type="text"
              value={customHeading}
              onChange={(e) => setCustomHeading(e.target.value)}
              placeholder="e.g. TIME BAZAR OPEN WINNERS"
              className="w-full border border-orange-400 rounded px-1 py-0.5 uppercase bg-white text-black font-bold text-xs"
            />
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-white p-1.5 border border-gray-300 rounded">
          <div className="text-center font-bold text-[10px] text-red-600 mb-1">
            RESULT INPUT (450 - 9 - 5 - 690)
          </div>

          <div className="grid grid-cols-4 gap-1 text-center">
            <div>
              <span className="text-[9px] font-bold text-gray-500 block">Open Panna</span>
              <input
                type="text"
                maxLength="3"
                placeholder="450"
                value={openPanna}
                onChange={(e) => setOpenPanna(e.target.value)}
                className="w-full border p-1 text-center font-bold text-xs rounded bg-yellow-50 text-black"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-500 block">Open Ank</span>
              <input
                type="text"
                maxLength="1"
                placeholder="9"
                value={openAnk}
                onChange={(e) => setOpenAnk(e.target.value)}
                className="w-full border p-1 text-center font-bold text-xs rounded bg-yellow-50 text-black"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-500 block">Close Ank</span>
              <input
                type="text"
                maxLength="1"
                placeholder="5"
                value={closeAnk}
                onChange={(e) => setCloseAnk(e.target.value)}
                className="w-full border p-1 text-center font-bold text-xs rounded bg-yellow-50 text-black"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-500 block">Close Panna</span>
              <input
                type="text"
                maxLength="3"
                placeholder="690"
                value={closePanna}
                onChange={(e) => setClosePanna(e.target.value)}
                className="w-full border p-1 text-center font-bold text-xs rounded bg-yellow-50 text-black"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-0.5">
          <div className="text-[11px] font-black text-black">
            RESULT: <span className="text-red-600 font-extrabold bg-yellow-200 px-1.5 py-0.5 rounded border border-orange-400">{displayResult()}</span>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={calculateWinners}
              className="bg-green-600 hover:bg-green-700 text-white font-black text-[11px] px-3 py-1 rounded border border-black shadow cursor-pointer"
            >
              FILTER WINNERS
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold text-[11px] px-2.5 py-1 rounded border border-black shadow cursor-pointer"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* 📸 GENERATED SCREENSHOT CARD UI */}
      {selectedWinners.length > 0 && (
        <div className="p-2 bg-gray-200 border-b border-orange-400">
          <div className="text-center font-black text-[10px] mb-1 text-blue-900 uppercase">
            📸 GENERATED SCREENSHOT CARD UI
          </div>
          
          <div className="w-full bg-[#00ffff] border-2 border-orange-500 p-3 text-center font-serif shadow-md my-1">
            
            <h2 className="text-red-600 font-extrabold italic text-base tracking-wider uppercase mb-1">
              {customHeading || 'OPEN WINNERS'}
            </h2>

            <div className="text-red-600 font-bold italic text-sm mb-2">
              {displayResult()}
            </div>

            {/* PHASE 1: OPEN SESSION ONLY */}
            {!isFullResultMode && (
              <>
                {openSingleWinnersList.length > 0 && (
                  <>
                    <div className="text-red-600 font-bold text-xs my-1">-----------------------------------</div>
                    <div className="space-y-1.5 my-2">
                      {openSingleWinnersList.map((win) => (
                        <div key={`open-single-${win.id}`} className="flex items-center justify-center">
                          <div className="text-red-600 font-extrabold italic text-sm tracking-wider uppercase">
                            *_{`_${win.username}_`}_*
                          </div>
                          <button
                            onClick={() => handleRemoveWinner(win.id)}
                            className="ml-1.5 bg-red-600 text-white text-[8px] px-1 rounded font-sans uppercase not-italic cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {openPannaWinnersList.length > 0 && (
                  <>
                    <div className="text-red-600 font-bold text-xs my-1">-----------------------------------</div>
                    <div className="text-red-600 font-extrabold italic text-xs uppercase mb-1">Panna Winner</div>
                    <div className="text-red-600 font-bold text-xs my-1">-----------------------------------</div>
                    <div className="space-y-1.5 my-2">
                      {openPannaWinnersList.map((win) => (
                        <div key={`open-panna-${win.id}`} className="flex items-center justify-center">
                          <div className="text-red-600 font-extrabold italic text-sm tracking-wider uppercase">
                            *_{`_${win.username}_`}_*
                          </div>
                          <button
                            onClick={() => handleRemoveWinner(win.id)}
                            className="ml-1.5 bg-red-600 text-white text-[8px] px-1 rounded font-sans uppercase not-italic cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* PHASE 2: FINAL RESULT MODE */}
            {isFullResultMode && (
              <>
                {closeWinnersList.length > 0 && (
                  <>
                    <div className="text-red-600 font-bold text-xs my-1">-----------------------------------</div>
                    <div className="space-y-1.5 my-2">
                      {closeWinnersList.map((win) => (
                        <div key={`close-${win.id}`} className="flex items-center justify-center">
                          <div className="text-red-600 font-extrabold italic text-sm tracking-wider uppercase">
                            *_{`_${win.username}_`}_*
                          </div>
                          <button
                            onClick={() => handleRemoveWinner(win.id)}
                            className="ml-1.5 bg-red-600 text-white text-[8px] px-1 rounded font-sans uppercase not-italic cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {jodiWinnersList.length > 0 && (
                  <>
                    <div className="text-red-600 font-bold text-xs my-1">-----------------------------------</div>
                    <div className="text-red-600 font-extrabold italic text-xs uppercase mb-1">Jodi Winner</div>
                    <div className="text-red-600 font-bold text-xs my-1">-----------------------------------</div>
                    <div className="space-y-1.5 my-2">
                      {jodiWinnersList.map((win) => (
                        <div key={`jodi-${win.id}`} className="flex items-center justify-center">
                          <div className="text-red-600 font-extrabold italic text-sm tracking-wider uppercase">
                            *_{`_${win.username}_`}_*
                          </div>
                          <button
                            onClick={() => handleRemoveWinner(win.id)}
                            className="ml-1.5 bg-red-600 text-white text-[8px] px-1 rounded font-sans uppercase not-italic cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {closePannaWinnersList.length > 0 && (
                  <>
                    <div className="text-red-600 font-bold text-xs my-1">-----------------------------------</div>
                    <div className="text-red-600 font-extrabold italic text-xs uppercase mb-1">Panna Winner</div>
                    <div className="text-red-600 font-bold text-xs my-1">-----------------------------------</div>
                    <div className="space-y-1.5 my-2">
                      {closePannaWinnersList.map((win) => (
                        <div key={`cpanna-${win.id}`} className="flex items-center justify-center">
                          <div className="text-red-600 font-extrabold italic text-sm tracking-wider uppercase">
                            *_{`_${win.username}_`}_*
                          </div>
                          <button
                            onClick={() => handleRemoveWinner(win.id)}
                            className="ml-1.5 bg-red-600 text-white text-[8px] px-1 rounded font-sans uppercase not-italic cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            <div className="text-red-600 font-bold text-xs mt-2">-----------------------------------</div>
          </div>
        </div>
      )}

      {/* Filtered Posts List */}
      <div className="p-1.5 space-y-2 bg-gray-100 min-h-[150px]">
        {winners.length === 0 ? (
          <div className="text-center py-6 text-xs font-bold text-gray-500 bg-white border border-dashed border-gray-300">
            Result enter karke "FILTER WINNERS" button click karein.
          </div>
        ) : (
          <div>
            <div className="bg-[#000080] text-yellow-300 px-2 py-1 font-black text-[11px] uppercase flex justify-between items-center mb-1.5">
              <span>WINNERS FOUND: {winners.length}</span>
              <span>CLICK "+ ADD" TO BUILD CARD</span>
            </div>

            <div className="space-y-2">
              {winners.map((win) => {
                const isAdded = selectedWinners.some(w => w.id === win.id);
                return (
                  <div key={win.id} className="bg-white border border-orange-400 rounded shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 border-b border-orange-400 text-xs font-bold items-center">
                      <div className="col-span-5 bg-[#00b000] text-white py-0.5 px-1.5 text-[10px] truncate">
                        📅 {win.formattedTime}
                      </div>
                      <div className="col-span-4 bg-white text-[#cc0000] py-0.5 px-1 flex items-center justify-center font-extrabold uppercase gap-1">
                        <span className="truncate">👤 {win.username}</span>
                      </div>
                      <div className="col-span-3 bg-gray-100 py-0.5 px-1 flex justify-end">
                        <button
                          onClick={() => handleAddWinner(win)}
                          disabled={isAdded}
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded border cursor-pointer ${
                            isAdded
                              ? 'bg-gray-400 text-white cursor-not-allowed border-gray-400'
                              : 'bg-red-600 hover:bg-red-700 text-white border-black shadow'
                          }`}
                        >
                          {isAdded ? 'ADDED' : '+ ADD'}
                        </button>
                      </div>
                    </div>

                    <div className="p-1.5 bg-yellow-50 border-b border-gray-200 flex flex-wrap gap-1">
                      <span className="bg-blue-800 text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                        📍 {win.market}
                      </span>
                      {win.matches.map((m, i) => (
                        <span 
                          key={i} 
                          className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase"
                        >
                          🎯 {m.type}: {m.val}
                        </span>
                      ))}
                    </div>

                    <div className="p-1.5 text-center bg-white">
                      <div className="text-black text-xs font-extrabold whitespace-pre-wrap leading-tight">
                        {win.originalGuess}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
