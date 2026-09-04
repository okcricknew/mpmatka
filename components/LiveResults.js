export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { db } from '../lib/firebase-admin';
import { revalidatePath } from 'next/cache';

const STATIC_MARKETS = [
  {
    id: 3,
    name: 'SRIDEVI',
    days: [0, 1, 2, 3, 4, 5, 6],
    slots: [
      { open: '11:30', close: '12:10' },
      { open: '12:30', close: '13:10' }
    ]
  },
  {
    id: 12,
    name: 'RAKHI DAY',
    days: [0, 1, 2, 3, 4, 5, 6],
    slots: [
      { open: '11:35', close: '11:55' },
      { open: '12:35', close: '12:55' }
    ]
  },
  {
    id: 4,
    name: 'TIME BAZAR',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '07:45', close: '07:55' },
      { open: '08:05', close: '08:15' }
    ]
  },
  {
    id: 6,
    name: 'KALYAN',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '15:50', close: '16:30' },
      { open: '18:50', close: '19:30' }
    ]
  },
  {
    id: 7,
    name: 'MILAN DAY',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '14:50', close: '15:30' },
      { open: '16:50', close: '17:30' }
    ]
  },
  {
    id: 8,
    name: 'RAJDHANI DAY',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '15:10', close: '15:35' },
      { open: '17:10', close: '17:35' }
    ]
  },
  {
    id: 9,
    name: 'SUPREME DAY',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '15:35', close: '17:35' }
    ]
  },
  {
    id: 10,
    name: 'SRIDEVI NIGHT',
    days: [0, 1, 2, 3, 4, 5, 6],
    slots: [
      { open: '19:15', close: '20:15' }
    ]
  },
  {
    id: 13,
    name: 'RAKHI NIGHT',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '19:35', close: '19:55' },
      { open: '20:35', close: '20:55' }
    ]
  },
  {
    id: 2,
    name: 'KALYAN NIGHT',
    days: [1, 2, 3, 4, 5],
    slots: [
      { open: '21:45', close: '23:59' }
    ]
  },
  {
    id: 1,
    name: 'RAJDHANI NIGHT',
    days: [1, 2, 3, 4, 5],
    slots: [
      { open: '21:35', close: '23:45' }
    ]
  },
  {
    id: 11,
    name: 'MAIN BAZAR',
    days: [1, 2, 3, 4, 5],
    slots: [
      { open: '22:00', close: '23:59' }
    ]
  }
];

// ======================================================
// HH:MM → MINUTES
// ======================================================
const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// ======================================================
// FETCH DATA FOR SSR (Using Firebase Admin .get())
// ======================================================
async function getLiveResults() {
  try {
    const snapshot = await db.collection('market_results').get();
    const liveMap = {};
    
    snapshot.forEach((docSnap) => {
      const docData = docSnap.data();
      if (!docData || !docData.name) return;

      liveMap[docData.name] = {
        result: docData.result || '',
        time: docData.time || '',
        updatedAt: docData.updatedAt || null
      };
    });
    return liveMap;
  } catch (error) {
    console.error('Firebase Admin SSR fetch error:', error);
    return {};
  }
}

// ======================================================
// CURRENT IST CONTEXT
// ======================================================
const getCurrentISTContext = () => {
  const istDateString = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata'
  });
  const istDate = new Date(istDateString);

  return {
    day: istDate.getDay(),
    currentTimeMins: istDate.getHours() * 60 + istDate.getMinutes(),
    todayYear: istDate.getFullYear(),
    todayMonth: istDate.getMonth(),
    todayDate: istDate.getDate()
  };
};

// ======================================================
// CHECK UPDATED DATE
// ======================================================
const isUpdatedToday = (updatedAt) => {
  if (!updatedAt) return false;

  try {
    const { todayYear, todayMonth, todayDate } = getCurrentISTContext();
    let updatedDate;

    if (typeof updatedAt.toDate === 'function') {
      updatedDate = updatedAt.toDate();
    } else if (
      typeof updatedAt === 'object' &&
      updatedAt !== null &&
      typeof updatedAt.seconds === 'number'
    ) {
      updatedDate = new Date(updatedAt.seconds * 1000);
    } else {
      updatedDate = new Date(updatedAt);
    }

    if (isNaN(updatedDate.getTime())) return false;

    const updatedISTString = updatedDate.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata'
    });
    const updatedISTDate = new Date(updatedISTString);

    return (
      updatedISTDate.getFullYear() === todayYear &&
      updatedISTDate.getMonth() === todayMonth &&
      updatedISTDate.getDate() === todayDate
    );
  } catch (error) {
    console.error('Updated date check error:', error);
    return false;
  }
};

// ======================================================
// CURRENT ACTIVE SLOT
// ======================================================
const getCurrentSlot = (market) => {
  try {
    const { day, currentTimeMins } = getCurrentISTContext();

    if (!market.days || !market.days.includes(day)) {
      return null;
    }

    for (let index = 0; index < market.slots.length; index++) {
      const slot = market.slots[index];
      const openMins = timeToMinutes(slot.open);
      const closeMins = timeToMinutes(slot.close);

      if (currentTimeMins >= openMins && currentTimeMins <= closeMins) {
        return {
          slotIndex: index,
          slot: slot
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Slot check error:', error);
    return null;
  }
};

// ======================================================
// SERVER ACTION (Bina page reload kiye data re-fetch karega)
// ======================================================
async function refreshMarketAction() {
  'use server';
  revalidatePath('/'); // Isse sirf is component ka data background mein update ho jayega
}

// ======================================================
// MAIN SSR COMPONENT
// ======================================================
export default async function LiveResults() {
  const marketLiveMap = await getLiveResults();

  const getDisplayResult = (market) => {
    const currentSlot = getCurrentSlot(market);
    if (!currentSlot) return null;

    const marketData = marketLiveMap[market.name];
    if (!marketData || !marketData.result || !marketData.updatedAt) {
      return 'Loading...';
    }

    if (!isUpdatedToday(marketData.updatedAt)) {
      return 'Loading...';
    }

    return marketData.result;
  };

  const activeMarkets = STATIC_MARKETS.filter(
    (market) => getCurrentSlot(market) !== null
  );

  if (activeMarkets.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-2 border-red-600 bg-white my-2 shadow-md">
      {/* Header */}
      <div className="bg-yellow-400 text-black text-center py-1.5 border-b-2 border-red-600">
        <h2 className="font-extrabold text-[18px] tracking-wider italic">
          * LIVE RESULTS UPDATE *
        </h2>
      </div>

      {/* Content */}
      <div className="bg-white p-3 divide-y divide-black">
        {activeMarkets.map((market) => {
          const displayResult = getDisplayResult(market);

          if (displayResult === null) {
            return null;
          }

          return (
            <div
              key={market.id}
              className="py-3 px-2 flex flex-col items-center text-center bg-white"
            >
              {/* Market Name */}
              <h3 className="text-red-600 font-black text-[20px] italic tracking-wide mb-0.5">
                {market.name}
              </h3>

              {/* Result */}
              <div className="text-black font-extrabold text-[18px] tracking-widest mb-2">
                <span className="text-red-600">{displayResult}</span>
              </div>

              {/* Refresh Button using Server Action */}
              <form action={refreshMarketAction}>
                <button
                  type="submit"
                  className="text-xs bg-red-100 hover:bg-red-200 text-white-700 font-semibold py-1 px-3 rounded-full border border-red-300 transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer mt-1"
                >
                  <span>🔄 Refresh</span>
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
    }
