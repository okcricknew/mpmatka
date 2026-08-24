"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { STATIC_MARKETS } from "../utils/constants";

export default function MarketListClient({ initialResults }) {
  const router = useRouter();
  const [marketResults, setMarketResults] = useState(
    initialResults || {}
  );

  const handleNavigation = (marketName, type) => {
    const slug = marketName
      .toLowerCase()
      .replace(/\s+/g, "-");

    router.push(`/${slug}-${type}-chart`);
  };

  return (
    <div className="w-full border-2 border-red-600 bg-white pt-2 pb-2">
      {STATIC_MARKETS.map((item) => {
        const liveData =
          marketResults[item.name] || {};

        const displayResult =
          liveData.result ||
          "140-55-140";

        const displayTime =
          liveData.time ||
          item.time;

        const isHighlighted = [
          "KALYAN",
          "MAIN BAZAR",
          "SRIDEVI",
          "SRIDEVI NIGHT",
        ].includes(item.name);

        return (
          <div
            key={item.id}
            className={`w-full border-b border-gray-300 py-2.5 px-3 ${
              isHighlighted
                ? "bg-yellow-300"
                : "bg-white"
            }`}
          >
            <div className="w-full flex justify-between items-end">
              {/* JODI */}
              <button
                onClick={() =>
                  handleNavigation(
                    item.name,
                    "jodi"
                  )
                }
                className="bg-blue-900 hover:bg-blue-800 text-white text-[10px] font-bold px-3.5 py-1 rounded-full border border-blue-950 shadow-sm"
              >
                JODI
              </button>

              {/* CENTER */}
              <div className="text-center flex-1 mx-1">
                <h3 className="font-bold text-[25px] text-black tracking-wide">
                  {item.name}
                </h3>

                <p className="text-red-600 font-extrabold text-[22px] tracking-widest my-0.5">
                  {displayResult}
                </p>

                {liveData.message && (
                  <p className="text-[15px] text-black font-bold leading-tight whitespace-pre-line mb-1">
                    {liveData.message}
                  </p>
                )}

                <span className="text-[16px] text-black font-semibold">
                  ({displayTime})
                </span>
              </div>

              {/* PANEL */}
              <button
                onClick={() =>
                  handleNavigation(
                    item.name,
                    "panel"
                  )
                }
                className="bg-blue-900 hover:bg-blue-800 text-white text-[10px] font-bold px-3.5 py-1 rounded-full border border-blue-950 shadow-sm"
              >
                PANEL
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
