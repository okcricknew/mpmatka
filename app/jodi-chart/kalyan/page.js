// app/jodi-chart/kalyan/page.js

import { db } from '@/lib/firebase-admin';
import KalyanJodiChartClient from './KalyanJodiChartClient';

export const dynamic = 'force-dynamic';

function cleanValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

export default async function KalyanJodiChartPage() {
  // 1. Firebase se Kalyan Panna Chart ke saare weekly documents fetch karna
  const snapshot = await db
    .collection('kalyan_panna_chart')
    .get();

  // 2. Firebase data me se SIRF JODI nikalna aur Old to New sort karna
  const initialRows = snapshot.docs
    .map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        startDate: cleanValue(data.startDate),
        endDate: cleanValue(data.endDate),

        weekData: {
          mon: {
            jodi: cleanValue(data.weekData?.mon?.jodi),
          },
          tue: {
            jodi: cleanValue(data.weekData?.tue?.jodi),
          },
          wed: {
            jodi: cleanValue(data.weekData?.wed?.jodi),
          },
          thu: {
            jodi: cleanValue(data.weekData?.thu?.jodi),
          },
          fri: {
            jodi: cleanValue(data.weekData?.fri?.jodi),
          },
          sat: {
            jodi: cleanValue(data.weekData?.sat?.jodi),
          },
        },
      };
    })
    .sort((a, b) => {
      const parseDate = (value) => {
        if (!value) return 0;

        const [day, month, year] = value.split('/');

        if (!day || !month || !year) return 0;

        return new Date(
          `${year}-${month}-${day}`
        ).getTime();
      };

      // Old to New sorting (Ascending order)
      return parseDate(a.startDate) - parseDate(b.startDate);
    });

  // 3. Client component ko sorted data bhejna
  return (
    <KalyanJodiChartClient
      initialRows={initialRows}
    />
  );
}
