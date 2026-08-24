import { db } from "../lib/firebase-admin";

// Static markets ki list jo hamesha dikhengi
export const STATIC_MARKETS = [
  { id: 3, name: 'SRIDEVI', time: '11:35 AM - 12:35 PM' },
  { id: 4, name: 'TIME BAZAR', time: '01:00 PM - 02:00 PM' },
  { id: 7, name: 'MILAN DAY', time: '03:00 PM - 05:00 PM' },
  { id: 8, name: 'RAJDHANI DAY', time: '03:00 PM - 05:00 PM' },
  { id: 9, name: 'SUPREME DAY', time: '03:35 PM - 05:35 PM' },
  { id: 6, name: 'KALYAN', time: '03:45 PM - 05:45 PM' },
  { id: 10, name: 'SRIDEVI NIGHT', time: '07:15 PM - 08:15 PM' },
  { id: 5, name: 'MILAN NIGHT', time: '09:10 PM - 11:10 PM' },
  { id: 2, name: 'KALYAN NIGHT', time: '9:45 PM - 11:45 PM' },
  { id: 1, name: 'RAJDHANI NIGHT', time: '09:30 PM - 11:45 PM' },
  { id: 11, name: 'MAIN BAZAR', time: '09:35 PM - 12:05 AM' },
];

export async function getInitialMarketResults() {
  try {
    const snapshot = await db.collection('results').get();
    const resultsMap = {};

    // Default values set karein
    STATIC_MARKETS.forEach(m => {
      resultsMap[m.name] = { name: m.name, result: '140-55-140', time: m.time };
    });

    // Firebase ka data merge karein
    snapshot.forEach(docSnap => {
      const item = docSnap.data();
      if (item && item.name) {
        resultsMap[item.name] = {
          ...item,
          // Agar timestamp hai toh usko string bana dein taaki SSR mein error na aaye
          updatedAt: item.updatedAt ? String(item.updatedAt) : null,
        };
      }
    });

    return resultsMap;
  } catch (error) {
    console.error("Error fetching market results:", error);
    // Error aane par default map bhej dein taaki site crash na ho
    const fallbackMap = {};
    STATIC_MARKETS.forEach(m => {
      fallbackMap[m.name] = { name: m.name, result: '140-55-140', time: m.time };
    });
    return fallbackMap;
  }
}
