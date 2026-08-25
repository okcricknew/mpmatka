export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";
import UserLoginRegister from "../components/UserLoginRegister";

export default async function HomePage() {
  const initialResults = await getInitialMarketResults();

  return (
    <main className="w-full bg-[#f5f7fb] pb-10 px-1 overflow-x-hidden">
      {/* Market Results List & User Login Section */}
      <div className="w-full px-0 mt-2">
        <MarketListClient initialResults={initialResults} />
        <UserLoginRegister />
      </div>
    </main>
  );
}
