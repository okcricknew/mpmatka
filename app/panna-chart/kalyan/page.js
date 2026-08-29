// app/panna-chart/kalyan/page.js
import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

// Helper: Date ko timestamp me convert karke sort karne ke liye
function parseDateStr(dateStr) {
  if (!dateStr) return 0;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || 0;
  }
  return 0;
}

// Server Action: Admin form se row save/update karne ke liye
async function saveChartRow(formData) {
  'use server';
  
  const startDate = formData.get('startDate');
  const endDate = formData.get('endDate');
  const docId = `${startDate}_to_${endDate}`.replace(/\//g, '-');

  const daysList = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const weekData = {};

  daysList.forEach((day) => {
    weekData[day] = {
      openPanna: formData.get(`${day}_openPanna`) || '',
      jodi: formData.get(`${day}_jodi`) || '',
      closePanna: formData.get(`${day}_closePanna`) || '',
    };
  });

  const rowPayload = {
    startDate,
    endDate,
    weekData,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = db.collection('kalyan_panna_chart').doc(docId);
    await docRef.set(rowPayload, { merge: true });

    revalidatePath('/panna-chart/kalyan');
  } catch (error) {
    console.error("Error saving chart row via Admin:", error);
  }
}

// Helper: Vertical Panna Rendering
function RenderVerticalPanna({ pannaStr }) {
  if (!pannaStr || pannaStr.trim() === '') {
    return (
      <div className="flex flex-col items-center justify-between h-[36px] sm:h-[42px] text-[9px] sm:text-[11px] font-bold text-transparent select-none">
        <span>&nbsp;</span><span>&nbsp;</span><span>&nbsp;</span>
      </div>
    );
  }
  if (pannaStr === '*') {
    return (
      <div className="flex flex-col items-center justify-between h-[36px] sm:h-[42px] text-[10px] sm:text-[12px] font-bold text-red-600">
        <span>*</span><span>*</span><span>*</span>
      </div>
    );
  }
  const digits = pannaStr.split('');
  return (
    <div className="flex flex-col items-center justify-between h-[36px] sm:h-[42px] text-[9px] sm:text-[11px] font-black leading-none font-serif italic">
      {digits.map((d, idx) => (
        <span key={idx}>{d}</span>
      ))}
    </div>
  );
}

// Helper: Jodi Rendering
function RenderJodi({ jodiStr }) {
  if (!jodiStr || jodiStr.trim() === '') {
    return <span className="text-[15px] sm:text-[18px] font-bold text-transparent select-none">&nbsp;</span>;
  }

  const isRed =
    jodiStr === '**' ||
    (jodiStr.length === 2 && jodiStr[0] === jodiStr[1]) ||
    ['16', '61', '27', '72', '38', '83', '49', '94', '05', '50'].includes(jodiStr);

  return (
    <span className={`text-[15px] sm:text-[18px] font-black tracking-tight italic font-serif ${isRed ? 'text-red-600' : 'text-black'}`}>
      {jodiStr}
    </span>
  );
}

export default async function KalyanPannaChartPage() {
  let chartRows = [];
  const daysList = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  // Firebase Admin SSR Data Fetching
  try {
    const snapshot = await db.collection('kalyan_panna_chart').get();
    const rows = [];
    snapshot.forEach((docSnap) => {
      rows.push({ id: docSnap.id, ...docSnap.data() });
    });

    chartRows = rows.sort((a, b) => parseDateStr(a.startDate) - parseDateStr(b.startDate));
  } catch (error) {
    console.error("Error fetching Kalyan Panna Chart from Firebase:", error);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-2 sm:p-4 font-sans flex flex-col items-center">
      
      <div className="w-full max-w-4xl mx-auto my-2 border-2 border-red-800 bg-yellow-400 p-0.5 shadow-md">
        
        {/* Header Banner */}
        <div className="bg-yellow-400 py-2 border-b-2 border-black text-center">
          <h1 className="text-red-600 text-2xl sm:text-3xl font-black italic tracking-wider uppercase">
            Kalyan Panna Chart
          </h1>
        </div>

        {/* Main Table */}
        <div className="w-full bg-white border border-black overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header Row */}
            <div className="grid grid-cols-[1.1fr_repeat(6,_1fr)] text-center font-black italic border-b border-black bg-white text-[11px] sm:text-sm py-1.5 uppercase">
              <div className="border-r border-black flex items-center justify-center">DATE</div>
              <div className="border-r border-black">MON</div>
              <div className="border-r border-black">TUE</div>
              <div className="border-r border-black">WED</div>
              <div className="border-r border-black">THU</div>
              <div className="border-r border-black">FRI</div>
              <div>SAT</div>
            </div>

            {/* Data Rows */}
            {chartRows.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 font-bold italic">
                No chart data available. Add rows using the admin form below.
              </div>
            ) : (
              chartRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1.1fr_repeat(6,_1fr)] border-b last:border-b-0 border-gray-400 items-center"
                >
                  {/* Date Column */}
                  <div className="border-r border-black py-1 px-0.5 text-center flex flex-col justify-center items-center leading-tight font-serif italic font-bold">
                    <span className="text-black text-[9px] sm:text-[11px] font-extrabold">{row.startDate}</span>
                    <span className="text-red-600 text-[8px] sm:text-[10px] font-extrabold">to</span>
                    <span className="text-black text-[9px] sm:text-[11px] font-extrabold">{row.endDate}</span>
                  </div>

                  {/* Days Data (Mon to Sat) */}
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

        {/* Admin Form Section (Server Action) */}
        <div className="bg-gray-50 border-t-2 border-black p-4 mt-2">
          <h3 className="text-xs font-bold text-red-600 mb-3 uppercase">
            Admin Panel: Add / Update Weekly Row
          </h3>

          <form action={saveChartRow} className="flex flex-col gap-3">
            {/* Dates Input */}
            <div className="flex gap-2 bg-white p-3 rounded border border-gray-300">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">START DATE (DD/MM/YYYY):</label>
                <input
                  type="text"
                  name="startDate"
                  placeholder="10/08/2026"
                  required
                  className="w-full border p-1.5 text-xs font-bold rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">END DATE (DD/MM/YYYY):</label>
                <input
                  type="text"
                  name="endDate"
                  placeholder="15/08/2026"
                  required
                  className="w-full border p-1.5 text-xs font-bold rounded"
                />
              </div>
            </div>

            {/* Days Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 rounded border border-gray-300">
              {daysList.map((day) => (
                <div key={day} className="border p-2 rounded bg-gray-50 flex flex-col gap-1">
                  <span className="uppercase font-black text-red-700 text-xs">{day}</span>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      name={`${day}_openPanna`}
                      maxLength={3}
                      placeholder="Open"
                      className="w-1/3 border p-1 text-center font-bold text-xs rounded"
                    />
                    <input
                      type="text"
                      name={`${day}_jodi`}
                      maxLength={2}
                      placeholder="Jodi"
                      className="w-1/3 border p-1 text-center font-bold text-xs text-red-600 rounded"
                    />
                    <input
                      type="text"
                      name={`${day}_closePanna`}
                      maxLength={3}
                      placeholder="Close"
                      className="w-1/3 border p-1 text-center font-bold text-xs rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded shadow transition"
            >
              Save / Update Weekly Row
            </button>
          </form>
        </div>

      </div>
    </main>
  );
          }
