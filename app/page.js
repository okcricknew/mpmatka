export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";

export default async function HomePage() {
  const initialResults = await getInitialMarketResults();

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* Top Header with Navigation Buttons */}
      <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-extrabold text-blue-900 text-lg">MP Matka</h1>
        <div className="flex gap-2">
          <Link 
            href="/login" 
            className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded text-xs font-bold"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Market Results List */}
      <div className="mt-4">
        <MarketListClient initialResults={initialResults} />
      </div>
    </main>
  );
}
