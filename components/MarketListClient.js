"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STATIC_MARKETS } from "../utils/constants";

export default function MarketListClient({
  initialResults,
  initialIsAdmin = false,
}) {
  const router = useRouter();
  const [marketResults, setMarketResults] = useState(
    initialResults || {}
  );

  const [selectedMarket, setSelectedMarket] = useState(null);
  const [updateType, setUpdateType] = useState(null); // 'result' ya 'message' track karne ke liye
  const [newResult, setNewResult] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = initialIsAdmin;

  // SAFE MERGE LOGIC: Router refresh hone par naya state wipe-out nahi hoga
  useEffect(() => {
    if (initialResults && Object.keys(initialResults).length > 0) {
      setMarketResults((prev) => ({
        ...prev,
        ...initialResults,
      }));
    }
  }, [initialResults]);

  const handleNavigation = (marketName, type) => {
    const slug = marketName
      .toLowerCase()
      .replace(/\s+/g, "-");

    router.push(`/${type}-chart/${slug}`);
  };

  const handleOpenModal = (market, type) => {
    const current = marketResults[market.name] || {};

    setSelectedMarket(market);
    setUpdateType(type); // 'result' ya 'message' set hoga
    setNewResult(current.result || "refresh");
    setNewTime(current.time || market.time);
    setNewMessage(current.message || "");
  };

  const handleCloseModal = () => {
    setSelectedMarket(null);
    setUpdateType(null);
    setNewResult("");
    setNewTime("");
    setNewMessage("");
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedMarket) return;

    setLoading(true);

    try {
      const marketName = selectedMarket.name;

      const payload = {
        name: marketName,
        updateType,

        result: updateType === "result"
          ? newResult.trim()
          : undefined,

        time: updateType === "result"
          ? newTime.trim()
          : undefined,

        message: updateType === "message"
          ? newMessage.trim()
          : undefined,
      };

      const response = await fetch(
        "/api/results/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      // Instant UI update
setMarketResults((prev) => ({
  ...prev,
  [marketName]: {
    ...prev[marketName],

    ...(updateType === "result"
      ? {
          result: data.result.result,
          time: data.result.time,
        }
      : {
          message: data.message,
        }),
  },
}));

      handleCloseModal();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error updating: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-[#02577c] text-white text-[20px] font-bold h-[50px] rounded-none text-center border-2 border-[#FFB90C] italic font-['Helvetica_Neue'] mt-[5px] mb-[5px] flex items-center justify-center">
        <h2>
          ❊ MATKA RESULTS LIVE ❊
        </h2>
      </div>
      
      <div className="w-full border-2 border-red-600 bg-white pt-2 pb-2">
        {STATIC_MARKETS.map((item) => {
          const liveData = marketResults[item.name] || {};

          const displayResult =
            liveData.result || "140-55-140";

          const displayTime =
            liveData.time || item.time;

          const isHighlighted = [
            "KALYAN",
            "MAIN BAZAR",
            "RAKHI DAY",
            "RAKHI NIGHT",
          ].includes(item.name);

          return (
            <div
              key={item.id}
              className={`w-full border-b border-gray-300 py-1 px-3 ${
                isHighlighted
                  ? "bg-yellow-300"
                  : "bg-white"
              }`}
            >
              {/* EXACT FLOW: Market Name -> Result -> Message -> Time */}
              <div className="text-center w-full">
                <h3 className="font-bold text-[22px] text-blue-900 tracking-wide uppercase">
                  {item.name}
                </h3>

                <p className="text-red-600 font-extrabold text-[20px] tracking-widest -mt-1 mb-0">
                  {displayResult}
                </p>

                {liveData.message && (
                  <div className="w-full my-2">
                    <p className="w-full text-[22px] sm:text-[26px] text-black italic font-bold leading-snug whitespace-pre-line text-center px-2">
                      {liveData.message}
                    </p>
                  </div>
                )}

                <span className="text-[15px] text-black font-bold block my-1">
                  ({displayTime})
                </span>
              </div>

              {/* BOTTOM ROW: Jodi & Panel Buttons */}
              <div className="w-full flex justify-between items-center -mt-10 px-1">
                <button
                  onClick={() =>
                    handleNavigation(item.name, "jodi")
                  }
                  className="bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold px-3 py-1 rounded shadow-sm"
                >
                  Jodi
                </button>

                <button
                  onClick={() =>
                    handleNavigation(item.name, "panna")
                  }
                  className="bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold px-3 py-1 rounded shadow-sm"
                >
                  Panel
                </button>
              </div>

              {/* ADMIN UPDATE BUTTONS */}
              {isAdmin && ( 
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() => handleOpenModal(item, "result")}
                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded border border-red-800"
                  >
                    ✏️ UPDATE RESULT
                  </button>
                  <button
                    onClick={() => handleOpenModal(item, "message")}
                    className="bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold px-3 py-1 rounded border border-purple-900"
                  >
                    💬 UPDATE MSG
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* MODAL */}
        {selectedMarket && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-sm rounded-lg border-2 border-red-600 p-4 shadow-xl">
              <h3 className="text-sm font-bold text-blue-900 text-center border-b pb-2 mb-3">
                {updateType === "result" ? "Update Result" : "Update Message"}: {selectedMarket.name}
              </h3>

              <form
                onSubmit={handleSaveUpdate}
                className="space-y-3"
              >
                {/* Sirf Result aur Time dikhega agar Result button dabaya hai */}
                {updateType === "result" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">
                        Result
                      </label>
                      <input
                        type="text"
                        value={newResult}
                        onChange={(e) =>
                          setNewResult(e.target.value)
                        }
                        placeholder="140-55-140"
                        required
                        className="w-full border border-gray-400 rounded p-2 text-sm font-bold text-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">
                        Time
                      </label>
                      <input
                        type="text"
                        value={newTime}
                        onChange={(e) =>
                          setNewTime(e.target.value)
                        }
                        required
                        className="w-full border border-gray-400 rounded p-2 text-sm font-bold"
                      />
                    </div>
                  </>
                )}

                {/* Sirf Message dikhega agar Message button dabaya hai */}
                {updateType === "message" && (
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Message
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) =>
                        setNewMessage(e.target.value)
                      }
                      rows={4}
                      placeholder="Enter message"
                      className="w-full border border-gray-400 rounded p-2 text-sm font-bold resize-y"
                    />
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold px-4 py-2 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
                  }
                        
