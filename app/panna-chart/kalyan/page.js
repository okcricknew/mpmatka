// app/panna-chart/kalyan/page.js
import KalyanPannaChartClient from './KalyanPannaChartClient';
import { getCurrentUser } from '@/lib/auth-session';
import { isUserAdmin } from '@/utils/admin'; // utils/admin bina change kiye yahan import kar liya

export default async function KalyanPannaChartPage() {
  const user = await getCurrentUser();

  // Server par hi check kar liya: chahe DB me is_admin true ho ya mobile admin list me ho
  const isAdmin = Boolean(user && (user.is_admin || isUserAdmin(user.mobile)));

  return <KalyanPannaChartClient initialIsAdmin={isAdmin} />;
}
