export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCurrentUser } from "../lib/auth-session";
import { isUserAdmin } from "../utils/admins";
import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";
import UserLoginRegister from "../components/UserLoginRegister";
import LiveResults from "../components/LiveResults";
import GamesAndChartsZone from "../components/GamesAndChartsZone";

export default async function HomePage() {
  // Promise.all se dono independent requests ek sath (parallel) run hongi,
  // jisse server response time (TTFB) kafi fast ho jayega.
  const [currentUser, initialResults] = await Promise.all([
    getCurrentUser(),
    getInitialMarketResults(),
  ]);

  const isAdmin = currentUser ? isUserAdmin(currentUser.mobile) : false;

  return (
    <main className="w-full max-w-none min-w-0 bg-[#f5f7fb] pb-10 px-1.5 sm:px-4 m-0">
      {/* Market Results List & User Login Section */}
      <div className="w-full max-w-none min-w-0 m-0 mt-2 p-0">
        <LiveResults />
        <MarketListClient
          initialResults={initialResults}
          initialIsAdmin={isAdmin}
        />
        <UserLoginRegister initialUser={currentUser} />
        <GamesAndChartsZone initialIsAdmin={isAdmin} />
      </div>
    </main>
  );
}
