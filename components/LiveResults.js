import { db } from '../lib/firebase-admin';
import LiveResultsRealtime from './LiveResultsRealtime';

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
    id: 4,
    name: 'TIME BAZAR',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '12:45', close: '13:20' },
      { open: '13:45', close: '14:20' }
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
    id: 2,
    name: 'KALYAN NIGHT',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '21:45', close: '23:59' }
    ]
  },
  {
    id: 1,
    name: 'RAJDHANI NIGHT',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '21:35', close: '23:45' }
    ]
  },
  {
    id: 11,
    name: 'MAIN BAZAR',
    days: [1, 2, 3, 4, 5, 6],
    slots: [
      { open: '22:00', close: '23:59' }
    ]
  }
];

// ======================================================
// FETCH DATA FOR SSR
// ======================================================
async function getLiveResults() {
  try {
    const snapshot = await db.collection('results').get();

    const liveMap = {};

    snapshot.forEach((docSnap) => {
      const docData = docSnap.data();

      if (!docData || !docData.name) return;

      liveMap[docData.name] = {
        result: docData.result || '',
        time: docData.time || '',
        message: docData.message || '',
        updatedAt: docData.updatedAt || null
      };
    });

    return liveMap;
  } catch (error) {
    console.error(
      'Firebase Admin SSR fetch error:',
      error
    );

    return {};
  }
}

// ======================================================
// MAIN SSR COMPONENT
// ======================================================
export default async function LiveResults() {
  const initialResults = await getLiveResults();

  return (
    <LiveResultsRealtime
      initialResults={initialResults}
      staticMarkets={STATIC_MARKETS}
    />
  );
}
