"use client";

import React, { useState, useEffect } from "react";
import { STATIC_MARKETS } from "../utils/constants";

export default function MarketListClient({ initialResults }) {
  const [marketResults, setMarketResults] = useState(
    initialResults || {}
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);

  const [newResult, setNewResult] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const admin =
      localStorage.getItem("is_admin") === "true";

    setIsAdmin(admin);
  }, []);

  const handleNavigation = (marketName, type) => {
    const slug = marketName
      .toLowerCase()
      .replace(/\s+/g, "-");

    window.location.href = `/${slug}-${type}-chart`;
  };

  const handleOpenModal = (market) => {
    if (!isAdmin) return;

    const current =
      marketResults[market.name] || {};

    setSelectedMarket(market);

    setNewResult(
      current.result || "140-55-140"
    );

    setNewTime(
      current.time || market.time
    );

    setNewMessage(
      current.message || ""
    );
  };

  const handleCloseModal = () => {
    setSelectedMarket(null);
    setNewResult("");
    setNewTime("");
    setNewMessage("");
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();

    if (!selectedMarket || !isAdmin) {
      return;
    }

    setLoading(true);

    try {
      const marketName =
        selectedMarket.name;

      const response = await fetch(
        "/api/results/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: marketName,
            result: newResult.trim(),
            time: newTime.trim(),
            message: newMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Update failed"
        );
      }

      // Instant UI update
      setMarketResults((prev) => ({
        ...prev,
        [marketName]: data.result,
      }));

      handleCloseModal();

    } catch (error) {
      console.error(error);

      alert(
        "Error updating: " +
        error.message
      );
    } finally {
      setLoading(false);
    }
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

            {/* ADMIN UPDATE */}
            {isAdmin && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() =>
                    handleOpenModal(item)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-4 py-1 rounded border border-red-800"
                >
                  ✏️ UPDATE
                </button>
              </div>
            )}

          </div>
        );
      })}

      {/* MODAL */}

      {selectedMarket && isAdmin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">

          <div className="bg-white w-full max-w-sm rounded-lg border-2 border-red-600 p-4 shadow-xl">

            <h3 className="text-sm font-bold text-blue-900 text-center border-b pb-2 mb-3">
              Update Market:{" "}
              {selectedMarket.name}
            </h3>

            <form
              onSubmit={handleSaveUpdate}
              className="space-y-3"
            >

              {/* RESULT */}

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Result
                </label>

                <input
                  type="text"
                  value={newResult}
                  onChange={(e) =>
                    setNewResult(
                      e.target.value
                    )
                  }
                  placeholder="140-55-140"
                  required
                  className="w-full border border-gray-400 rounded p-2 text-sm font-bold text-red-600"
                />
              </div>

              {/* TIME */}

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Time
                </label>

                <input
                  type="text"
                  value={newTime}
                  onChange={(e) =>
                    setNewTime(
                      e.target.value
                    )
                  }
                  required
                  className="w-full border border-gray-400 rounded p-2 text-sm font-bold"
                />
              </div>

              {/* MESSAGE */}

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Message
                </label>

                <textarea
                  value={newMessage}
                  onChange={(e) =>
                    setNewMessage(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Enter message"
                  className="w-full border border-gray-400 rounded p-2 text-sm font-bold resize-y"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : "Update Results"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
                }
