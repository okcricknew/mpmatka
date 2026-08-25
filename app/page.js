export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";
import UserLoginRegister from "../components/UserLoginRegister";

export default async function HomePage() {
  const initialResults = await getInitialMarketResults();

  return (
    <main>
      {/* Top Header with Navigation Buttons */}

      {/* Market Results List */}
      <div className="mt-4">
        <MarketListClient initialResults={initialResults} />
        <UserLoginRegister />
      </div>
    </main>
  );
}
