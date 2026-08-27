export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth-session";

import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";
import UserLoginRegister from "../components/UserLoginRegister";
import LiveResults from "../components/LiveResults";
import GamesAndChartsZone from "../components/GamesAndChartsZone";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const initialResults = await getInitialMarketResults();

  return (
    <main className="w-full max-w-none min-w-0 bg-[#f5f7fb] pb-10 px-1.5 sm:px-4 m-0">
      {/* Market Results List & User Login Section */}
      <div className="w-full max-w-none min-w-0 m-0 mt-2 p-0">
        <LiveResults />
        <MarketListClient initialResults={initialResults} />
        <UserLoginRegister />
        <GamesAndChartsZone />
      </div>
    </main>
  );
}
