import { db } from "../lib/firebase-admin";
import { STATIC_MARKETS } from "../utils/constants";

export { STATIC_MARKETS };

export async function getInitialMarketResults() {
  const resultsMap = {};

  // Default data
  STATIC_MARKETS.forEach((market) => {
    resultsMap[market.name] = {
      name: market.name,
      result: "140-55-140",
      time: market.time,
      message: "",
    };
  });

  try {
    const snapshot = await db.collection("results").get();

    snapshot.forEach((docSnap) => {
      const item = docSnap.data();

      if (item && item.name) {
        resultsMap[item.name] = {
          name: item.name,
          result: item.result || "140-55-140",
          time: item.time || "",
          message: item.message || "",
          updatedAt: item.updatedAt
            ? String(item.updatedAt)
            : null,
        };
      }
    });

    return resultsMap;
  } catch (error) {
    console.error("Error fetching market results:", error);

    return resultsMap;
  }
}
