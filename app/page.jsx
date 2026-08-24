import { getInitialMarketResults } from "../services/marketService";
import MarketListClient from "../components/MarketListClient";

// Yeh line ensure karti hai ki yeh page strictly Server-Side Rendered (SSR) ho
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Server par data fetch ho raha hai (1st render mein hi load hoga)
  const initialResults = await getInitialMarketResults();

  return (
    <main style={{ padding: "10px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "15px" }}>Satta Matka Live Results</h1>
      {/* Data ko client component mein pass kar rahe hain */}
      <MarketListClient initialResults={initialResults} />
    </main>
  );
}
