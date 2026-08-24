export const dynamic = 'force-dynamic';
export const revalidate = 0;
import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";

export default async function HomePage() {
  const initialResults = await getInitialMarketResults();

  return (
    <main>
      <MarketListClient
        initialResults={initialResults}
      />
    </main>
  );
}
