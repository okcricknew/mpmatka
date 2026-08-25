export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";
import UserLoginRegister from "../components/UserLoginRegister";

export default async function HomePage() {
  const initialResults = await getInitialMarketResults();

  return (
    <main className="w-full min-h-screen bg-[#f5f7fb] pb-10 overflow-x-hidden">
      {/* Market Results List & User Login Section */}
      <div className="w-full px-2 sm:px-4 mt-2">
        <MarketListClient initialResults={initialResults} />
        <UserLoginRegister />
      </div>
    </main>
  );
}
