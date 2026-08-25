'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot
} from 'firebase/firestore';

import { db } from '../lib/firebase';

// ======================================================
// HH:MM → MINUTES
// ======================================================
const timeToMinutes = (time) => {
  if (!time) return 0;

  const [hours, minutes] = time
    .split(':')
    .map(Number);

  return hours * 60 + minutes;
};

// ======================================================
// CURRENT IST CONTEXT
// ======================================================
const getCurrentISTContext = () => {
  const istDateString = new Date().toLocaleString(
    'en-US',
    {
      timeZone: 'Asia/Kolkata'
    }
  );

  const istDate = new Date(istDateString);

  return {
    day: istDate.getDay(),

    currentTimeMins:
      istDate.getHours() * 60 +
      istDate.getMinutes(),

    todayYear: istDate.getFullYear(),

    todayMonth: istDate.getMonth(),

    todayDate: istDate.getDate()
  };
};

// ======================================================
// CHECK UPDATED DATE
// ======================================================
const isUpdatedToday = (updatedAt) => {
  if (!updatedAt) return false;

  try {
    const {
      todayYear,
      todayMonth,
      todayDate
    } = getCurrentISTContext();

    let updatedDate;

    // Firebase client Timestamp
    if (
      updatedAt &&
      typeof updatedAt.toDate === 'function'
    ) {
      updatedDate = updatedAt.toDate();
    }

    // Timestamp-like object
    else if (
      typeof updatedAt === 'object' &&
      updatedAt !== null &&
      typeof updatedAt.seconds === 'number'
    ) {
      updatedDate = new Date(
        updatedAt.seconds * 1000
      );
    }

    // Normal date/string
    else {
      updatedDate = new Date(updatedAt);
    }

    if (isNaN(updatedDate.getTime())) {
      return false;
    }

    const updatedISTString =
      updatedDate.toLocaleString(
        'en-US',
        {
          timeZone: 'Asia/Kolkata'
        }
      );

    const updatedISTDate =
      new Date(updatedISTString);

    return (
      updatedISTDate.getFullYear() ===
        todayYear &&
      updatedISTDate.getMonth() ===
        todayMonth &&
      updatedISTDate.getDate() ===
        todayDate
    );
  } catch (error) {
    console.error(
      'Updated date check error:',
      error
    );

    return false;
  }
};

// ======================================================
// CURRENT ACTIVE SLOT
// ======================================================
const getCurrentSlot = (market) => {
  try {
    const {
      day,
      currentTimeMins
    } = getCurrentISTContext();

    if (
      !market.days ||
      !market.days.includes(day)
    ) {
      return null;
    }

    for (
      let index = 0;
      index < market.slots.length;
      index++
    ) {
      const slot = market.slots[index];

      const openMins =
        timeToMinutes(slot.open);

      const closeMins =
        timeToMinutes(slot.close);

      if (
        currentTimeMins >= openMins &&
        currentTimeMins <= closeMins
      ) {
        return {
          slotIndex: index,
          slot: slot
        };
      }
    }

    return null;
  } catch (error) {
    console.error(
      'Slot check error:',
      error
    );

    return null;
  }
};

// ======================================================
// REALTIME COMPONENT
// ======================================================
export default function LiveResultsRealtime({
  initialResults,
  staticMarkets
}) {
  const [marketLiveMap, setMarketLiveMap] =
    useState(initialResults || {});

  // ====================================================
  // FIREBASE REALTIME LISTENER
  // ====================================================
  useEffect(() => {
    const resultsRef =
      collection(db, 'results');

    const unsubscribe = onSnapshot(
      resultsRef,
      (snapshot) => {
        const liveMap = {};

        snapshot.forEach((docSnap) => {
          const docData =
            docSnap.data();

          if (
            !docData ||
            !docData.name
          ) {
            return;
          }

          liveMap[docData.name] = {
            result:
              docData.result || '',

            time:
              docData.time || '',

            message:
              docData.message || '',

            updatedAt:
              docData.updatedAt || null
          };
        });

        setMarketLiveMap(liveMap);
      },
      (error) => {
        console.error(
          'Firebase realtime results error:',
          error
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // ====================================================
  // DISPLAY RESULT
  // ====================================================
  const getDisplayResult = (market) => {
    const currentSlot =
      getCurrentSlot(market);

    if (!currentSlot) {
      return null;
    }

    const marketData =
      marketLiveMap[market.name];

    if (
      !marketData ||
      !marketData.result ||
      !marketData.updatedAt
    ) {
      return 'Loading...';
    }

    if (
      !isUpdatedToday(
        marketData.updatedAt
      )
    ) {
      return 'Loading...';
    }

    return marketData.result;
  };

  // ====================================================
  // ACTIVE MARKETS
  // ====================================================
  const activeMarkets =
    staticMarkets.filter(
      (market) =>
        getCurrentSlot(market) !== null
    );

  // ====================================================
  // NO ACTIVE MARKET
  // ====================================================
  if (activeMarkets.length === 0) {
    return null;
  }

  // ====================================================
  // UI
  // ====================================================
  return (
    <div className="w-full border-2 border-red-600 bg-white my-2 shadow-md">

      {/* Header */}
      <div className="bg-yellow-400 text-black text-center py-1.5 border-b-2 border-red-600">
        <h2 className="font-extrabold text-[18px] tracking-wider italic">
          * LIVE UPDATE *
        </h2>
      </div>

      {/* Content */}
      <div className="bg-white p-3 divide-y divide-black">

        {activeMarkets.map((market) => {
          const displayResult =
            getDisplayResult(market);

          if (
            displayResult === null
          ) {
            return null;
          }

          return (
            <div
              key={market.id}
              className="py-3 px-2 flex flex-col items-center text-center bg-white"
            >

              {/* Market Name */}
              <h3 className="text-red-600 font-black text-[20px] italic tracking-wide mb-0.5">
                {market.name}
              </h3>

              {/* Result */}
              <div className="text-black font-extrabold text-[18px] tracking-widest mb-2">
                <span className="text-red-600">
                  {displayResult}
                </span>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
