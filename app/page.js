export const dynamic = "force-dynamic";
export const revalidate = 0;

import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";
import UserLoginRegister from "../components/UserLoginRegister";
import LiveResult from "../components/LiveResult";

export default async function HomePage() {
  const initialResults = await getInitialMarketResults();

  return (
    <main className="w-full max-w-none min-w-0 bg-[#f5f7fb] pb-10 px-1 m-0">
      {/* Market Results List & User Login Section */}
      <div className="w-full max-w-none min-w-0 m-0 mt-2 p-0">
    <LiveResult />
        <MarketListClient initialResults={initialResults} />
        <UserLoginRegister />
      </div>
    </main>
  );
}
