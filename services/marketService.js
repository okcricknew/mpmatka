import { db } from "../lib/firebase-admin";
import { STATIC_MARKETS } from "../utils/constants";

export { STATIC_MARKETS };

export async function getInitialMarketResults() {
  try {
    const snapshot = await db.collection("results").get();

    const resultsMap = {};

    // Default data
    STATIC_MARKETS.forEach((market) => {
      resultsMap[market.name] = {
        name: market.name,
        result: "140-55-140",
        time: market.time,
      };
    });

    // Firebase data
    snapshot.forEach((docSnap) => {
      const item = docSnap.data();

      if (item && item.name) {
        resultsMap[item.name] = {
          ...item,
          updatedAt: item.updatedAt
            ? String(item.updatedAt)
            : null,
        };
      }
    });

    return resultsMap;
  } catch (error) {
    console.error("Error fetching market results:", error);

    const fallbackMap = {};

    STATIC_MARKETS.forEach((market) => {
      fallbackMap[market.name] = {
        name: market.name,
        result: "140-55-140",
        time: market.time,
      };
    });

    return fallbackMap;
  }
}
