import { getInitialMarketResults } from "../services/marketService";
import MarketListClient from "../components/MarketListClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialResults = await getInitialMarketResults();

  return (
    <main style={{ padding: "10px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "15px" }}>Satta Matka Live Results</h1>
      <MarketListClient initialResults={initialResults} />
    </main>
  );
}

