export const dynamic = 'force-dynamic';
export const revalidate = 0;
import MarketListClient from "../components/MarketListClient";
import { getInitialMarketResults } from "../services/marketService";
import PhoneLoginClient from "../components/PhoneLoginClient";

export default async function HomePage() {
  const initialResults = await getInitialMarketResults();

  return (
    <main>
    <PhoneLoginClient />
      <MarketListClient
        initialResults={initialResults}
      />
    </main>
  );
}
