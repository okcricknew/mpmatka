// app/jodi-chart/kalyan/KalyanJodiChartClient.js
'use client';

import { useState, useEffect } from 'react';

function RenderJodi({ jodiStr }) {
  if (!jodiStr || jodiStr.trim() === '') {
    return <span className="text-[18px] sm:text-[26px] font-bold text-transparent select-none">&nbsp;</span>;
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

export default function KalyanJodiChartClient({ initialRows }) {
  const [chartRows, setChartRows] = useState(initialRows || []);
  const daysList = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  useEffect(() => {
    setChartRows(initialRows || []);
  }, [initialRows]);

  return (
    <main className="min-h-screen bg-gray-100 p-1 sm:p-3 font-sans flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto my-1 border-2 border-red-800 bg-yellow-400 p-0.5 shadow-md">
        
        <div className="bg-yellow-400 py-2 border-b-2 border-black flex justify-center items-center px-3">
          <div className="text-center">
            <h1 className="text-red-600 text-xl sm:text-3xl font-black italic tracking-wider uppercase">
              Kalyan Jodi Chart
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
                  className="grid grid-cols-[1.1fr_repeat(6,_1fr)] border-b last:border-b-0 border-gray-400 items-center"
                >
                  <div className="border-r border-black py-1 px-0.5 text-center flex flex-col justify-center items-center leading-tight font-serif italic font-bold">
                    <span className="text-black text-[8px] sm:text-[10px] font-extrabold">{row.startDate}</span>
                    <span className="text-red-600 text-[7px] sm:text-[9px] font-extrabold">to</span>
                    <span className="text-black text-[8px] sm:text-[10px] font-extrabold">{row.endDate}</span>
                  </div>

                  {daysList.map((dayKey, idx) => {
                    const dayObj = row.weekData?.[dayKey] || { jodi: '' };
                    return (
                      <div
                        key={dayKey}
                        className={`flex items-center justify-center px-0.5 py-2 h-full ${
                          idx < 5 ? 'border-r border-gray-300' : ''
                        }`}
                      >
                        <RenderJodi jodiStr={dayObj.jodi} />
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
  
