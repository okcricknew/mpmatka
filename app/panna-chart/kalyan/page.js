// app/panna-chart/kalyan/page.js
import KalyanPannaChartClient from './KalyanPannaChartClient';
import { getCurrentUser } from '@/lib/auth-session';
import { isUserAdmin } from '@/utils/admin';
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

export default async function KalyanPannaChartPage() {
  const user = await getCurrentUser();
  const isAdmin = Boolean(user && (user.is_admin || isUserAdmin(user.mobile)));

  // 🚀 Server par hi data fetch kar liya taaki refresh par data hide na ho
  let initialRows = [];
  try {
    const snapshot = await adminDb.collection('kalyan_panna_chart').get();
    const rows = [];
    snapshot.forEach((docSnap) => {
      rows.push({ id: docSnap.id, ...docSnap.data() });
    });
    initialRows = rows.sort((a, b) => parseDateStr(a.startDate) - parseDateStr(b.startDate));
  } catch (error) {
    console.error("Error fetching initial chart data:", error);
  }

  return <KalyanPannaChartClient initialIsAdmin={isAdmin} initialRows={initialRows} />;
}
