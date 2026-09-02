// app/panna-chart/kalyan/KalyanPannaChartClient.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

function parseDateStr(dateStr) {
  if (!dateStr) return 0;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || 0;
  }
  return 0;
}

function RenderVerticalPanna({ pannaStr }) {
  if (!pannaStr || pannaStr.trim() === '') {
    return (
      <div className="flex flex-col items-center justify-between h-[36px] sm:h-[48px] text-[10px] sm:text-[13px] font-bold text-transparent select-none">
        <span>&nbsp;</span><span>&nbsp;</span><span>&nbsp;</span>
      </div>
    );
  }
  if (pannaStr === '*') {
    return (
      <div className="flex flex-col items-center justify-between h-[36px] sm:h-[48px] text-[11px] sm:text-[14px] font-bold text-red-600">
        <span>*</span><span>*</span><span>*</span>
      </div>
    );
  }
  const digits = pannaStr.split('');
  return (
    <div className="flex flex-col items-center justify-between h-[36px] sm:h-[48px] text-[10px] sm:text-[13px] font-black leading-none font-serif italic">
      {digits.map((d, idx) => (
        <span key={idx}>{d}</span>
      ))}
    </div>
  );
}

function RenderJodi({ jodiStr }) {
  if (!jodiStr || jodiStr.trim() === '') {
    return <span className="text-[22px] sm:text-[28px] font-bold text-transparent select-none">&nbsp;</span>;
  }

  const isRed =
    jodiStr === '**' ||
    (jodiStr.length === 2 && jodiStr[0] === jodiStr[1]) ||
    ['16', '61', '27', '72', '38', '83', '49', '94', '05', '50'].includes(jodiStr);

  return (
    <span className={`text-[18px] sm:text-[26px] font-black tracking-tight italic font-serif ${isRed ? 'text-red-600' : 'text-black'}`}>
      {jodiStr}
    </span>
  );
}

export default function KalyanPannaChartClient({ initialIsAdmin, initialRows }) {
  const [chartRows, setChartRows] = useState(initialRows || []);
  const [isAdmin] = useState(initialIsAdmin);
  const [loading, setLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const daysList = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weekData, setWeekData] = useState({
    mon: { openPanna: '', jodi: '', closePanna: '' },
    tue: { openPanna: '', jodi: '', closePanna: '' },
    wed: { openPanna: '', jodi: '', closePanna: '' },
    thu: { openPanna: '', jodi: '', closePanna: '' },
    fri: { openPanna: '', jodi: '', closePanna: '' },
    sat: { openPanna: '', jodi: '', closePanna: '' },
  });

  const router = useRouter();

    // Scroll reference aur functions
  const topRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  

  useEffect(() => {
    setChartRows(initialRows || []);
  }, [initialRows]);
  

  const handleDayChange = (day, field, value) => {
    setWeekData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleRowClick = (row) => {
    if (!isAdmin) return;
    setStartDate(row.startDate || '');
    setEndDate(row.endDate || '');
    if (row.weekData) {
      setWeekData({
        mon: row.weekData.mon || { openPanna: '', jodi: '', closePanna: '' },
        tue: row.weekData.tue || { openPanna: '', jodi: '', closePanna: '' },
        wed: row.weekData.wed || { openPanna: '', jodi: '', closePanna: '' },
        thu: row.weekData.thu || { openPanna: '', jodi: '', closePanna: '' },
        fri: row.weekData.fri || { openPanna: '', jodi: '', closePanna: '' },
        sat: row.weekData.sat || { openPanna: '', jodi: '', closePanna: '' },
      });
    }
    setShowAdminForm(true);
  };

  const handleSeedImport = async () => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      'Are you sure you want to import ALL Kalyan seed data into Firebase?'
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/panna-chart/kalyan/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Failed to import seed data'
        );
      }

      alert(
        `Seed data imported successfully!\n\nRows saved: ${result.savedCount}`
      );
      router.refresh();
    } catch (error) {
      console.error('Seed import error:', error);

      alert(
        `Seed Import Error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!startDate || !endDate) {
      alert("Please enter both Start Date and End Date.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/panna-chart/kalyan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          weekData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save chart data');
      }

      alert('Row saved/updated successfully!');
      router.refresh();
      setStartDate('');
      setEndDate('');
      setWeekData({
        mon: { openPanna: '', jodi: '', closePanna: '' },
        tue: { openPanna: '', jodi: '', closePanna: '' },
        wed: { openPanna: '', jodi: '', closePanna: '' },
        thu: { openPanna: '', jodi: '', closePanna: '' },
        fri: { openPanna: '', jodi: '', closePanna: '' },
        sat: { openPanna: '', jodi: '', closePanna: '' },
      });
      setShowAdminForm(false);
    } catch (error) {
      console.error('Error saving row to Firestore:', error);
      alert(`Firebase Error: ${error.message} (Code: ${error.code || 'unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-1 sm:p-3 font-sans flex flex-col items-center">
    <div ref={topRef} />
    {/* GO TO BOTTOM BUTTON */}
        <div className="w-full py-1 px-2 flex justify-center items-center">
          <button
            onClick={scrollToBottom}
            className="bg-yellow-400 hover:bg-yellow-500 text-red-600 border-2 border-red-600 px-4 py-1 text-sm sm:text-base font-black italic uppercase tracking-wider shadow rounded transition"
          >
            Go to Bottom
          </button>
        </div>
      <div className="w-full max-w-4xl mx-auto my-1 border-2 border-red-800 bg-yellow-400 p-0.5 shadow-md">    
        
        <div className="bg-yellow-400 py-2 border-b-2 border-black flex justify-center items-center px-3">
          <div className="text-center">
            <h1 className="text-red-600 text-xl sm:text-3xl font-black italic tracking-wider uppercase">
              Kalyan Panna Chart
            </h1>
          </div>
        </div>

        <div className="w-full bg-white border border-black overflow-hidden">
          <div>
            <div className="grid grid-cols-[1.1fr_repeat(6,_1fr)] text-center font-black italic border-b border-black bg-white text-[10px] sm:text-sm py-1.5 uppercase">
              <div className="border-r border-black flex items-center justify-center">DATE</div>
              <div className="border-r border-black">MON</div>
              <div className="border-r border-black">TUE</div>
              <div className="border-r border-black">WED</div>
              <div className="border-r border-black">THU</div>
              <div className="border-r border-black">FRI</div>
              <div>SAT</div>
            </div>

            {chartRows.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 font-bold italic">
                No chart data available.
              </div>
            ) : (
              chartRows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className={`grid grid-cols-[1.1fr_repeat(6,_1fr)] border-b last:border-b-0 border-gray-400 items-center ${
                    isAdmin ? 'cursor-pointer hover:bg-yellow-100 transition' : ''
                  }`}
                  title={isAdmin ? "Click to edit this row" : ""}
                >
                  <div className="border-r border-black py-1 px-0.5 text-center flex flex-col justify-center items-center leading-tight font-serif italic font-bold">
                    <span className="text-black text-[8px] sm:text-[10px] font-extrabold">{row.startDate}</span>
                    <span className="text-red-600 text-[7px] sm:text-[9px] font-extrabold">to</span>
                    <span className="text-black text-[8px] sm:text-[10px] font-extrabold">{row.endDate}</span>
                    {isAdmin && <span className="text-[6px] bg-red-600 text-white px-0.5 rounded mt-0.5">Edit ✏️</span>}
                  </div>

                  {daysList.map((dayKey, idx) => {
                    const dayObj = row.weekData?.[dayKey] || { openPanna: '', jodi: '', closePanna: '' };
                    return (
                      <div
                        key={dayKey}
                        className={`flex items-center justify-between px-0.5 py-1 h-full ${
                          idx < 5 ? 'border-r border-gray-300' : ''
                        }`}
                      >
                        <RenderVerticalPanna pannaStr={dayObj.openPanna} />
                        <div className="px-0.5"><RenderJodi jodiStr={dayObj.jodi} /></div>
                        <RenderVerticalPanna pannaStr={dayObj.closePanna} />
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
  
        {/* Admin Controls Moved to the Bottom */}
        {isAdmin && (
          <div className="bg-yellow-500 border-t-2 border-black p-2 mt-2 flex justify-center items-center gap-2">
            <button
              onClick={handleSeedImport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold py-2 px-3 rounded shadow transition uppercase italic disabled:opacity-50"
            >
              {loading ? 'Importing...' : '⬇️ Import Seed'}
            </button>

            <button
              onClick={() => setShowAdminForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold py-2 px-3 rounded shadow transition uppercase italic"
            >
              ⚙️ Admin Panel
            </button>
          </div>
        )}

        {/* Modal Admin Form */}
        {isAdmin && showAdminForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
            <div className="bg-white border-2 border-black rounded shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 relative">
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h3 className="text-sm font-bold text-red-600 uppercase">
                  Admin Panel: Add / Edit Weekly Row
                </h3>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setWeekData({
                        mon: { openPanna: '', jodi: '', closePanna: '' },
                        tue: { openPanna: '', jodi: '', closePanna: '' },
                        wed: { openPanna: '', jodi: '', closePanna: '' },
                        thu: { openPanna: '', jodi: '', closePanna: '' },
                        fri: { openPanna: '', jodi: '', closePanna: '' },
                        sat: { openPanna: '', jodi: '', closePanna: '' },
                      });
                    }}
                    className="text-[10px] bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    Clear Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminForm(false)}
                    className="text-xs bg-red-600 text-white px-2.5 py-1 font-bold rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-3">
                <div className="flex gap-2 bg-gray-50 p-2 rounded border border-gray-300">
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold text-gray-700 mb-0.5">START DATE (DD/MM/YYYY):</label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="10/08/2026"
                      required
                      className="w-full border p-1.5 text-xs font-bold rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold text-gray-700 mb-0.5">END DATE (DD/MM/YYYY):</label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="15/08/2026"
                      required
                      className="w-full border p-1.5 text-xs font-bold rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 p-2 rounded border border-gray-300">
                  {daysList.map((day) => (
                    <div key={day} className="border p-2 rounded bg-white flex flex-col gap-1 shadow-sm">
                      <span className="uppercase font-black text-red-700 text-[10px]">{day}</span>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          maxLength={3}
                          value={weekData[day].openPanna}
                          onChange={(e) => handleDayChange(day, 'openPanna', e.target.value)}
                          placeholder="Open"
                          className="w-1/3 border p-1 text-center font-bold text-xs rounded"
                        />
                        <input
                          type="text"
                          maxLength={2}
                          value={weekData[day].jodi}
                          onChange={(e) => handleDayChange(day, 'jodi', e.target.value)}
                          placeholder="Jodi"
                          className="w-1/3 border p-1 text-center font-bold text-xs text-red-600 rounded"
                        />
                        <input
                          type="text"
                          maxLength={3}
                          value={weekData[day].closePanna}
                          onChange={(e) => handleDayChange(day, 'closePanna', e.target.value)}
                          placeholder="Close"
                          className="w-1/3 border p-1 text-center font-bold text-xs rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAdminForm(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold py-2 px-4 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded shadow transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save / Update Weekly Row'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
          {/* GO TO TOP BUTTON */}
        <div className="py-1 px-2 flex justify-center items-center">
          <button
            onClick={scrollToTop}
            className="bg-yellow-400 hover:bg-yellow-500 text-red-600 border-2 border-red-600 px-4 py-1 text-sm sm:text-base font-black italic uppercase tracking-wider shadow rounded transition"
          >
            Go to Top
          </button>
        </div>
          <div ref={bottomRef} />
          
    </main>
  );
}
