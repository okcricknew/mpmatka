// app/panna-chart/sridevi/page.js
import SrideviPannaChartClient from './SrideviPannaChartClient';
import { getCurrentUser } from '@/lib/auth-session';
import { isUserAdmin } from '@/utils/admins';
import { db as adminDb } from '@/lib/firebase-admin'; // Server-side firebase admin instance

// Helper function to sort dates server-side
function parseDateStr(dateStr) {
  if (!dateStr) return 0;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || 0;
  }
  return 0;
}

export default async function SrideviPannaChartPage() {
  const user = await getCurrentUser();
  const isAdmin = Boolean(user && (user.is_admin || isUserAdmin(user.mobile)));

  // Server par hi data fetch kar liya taaki refresh par data hide na ho
  let initialRows = [];
  try {
    const snapshot = await adminDb.collection('kalyan_panna_chart').get();
    const rows = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      rows.push({ 
        id: docSnap.id, 
        ...data,
        // Firebase Timestamp ko plain value me convert karna zaroori hai taaki Next.js client error na de
        updatedAt: data.updatedAt && typeof data.updatedAt.toMillis === 'function' 
          ? data.updatedAt.toMillis() 
          : null
      });
    });
    initialRows = rows.sort((a, b) => parseDateStr(a.startDate) - parseDateStr(b.startDate));
  } catch (error) {
    console.error("Error fetching initial chart data:", error);
  }

  return <SrideviPannaChartClient initialIsAdmin={isAdmin} initialRows={initialRows} />;
}
