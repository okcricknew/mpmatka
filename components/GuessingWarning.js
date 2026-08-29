// components/GuessingWarning.js
import React from 'react';

export default function GuessingWarning() {
  const rules = [
    "DO NOT USE BAD WORDS OR ABUSIVE LANGUAGE IN FORUM.",
    "DONT POST YOUR PHONE NUMBERS OR SITE LINKS.",
    "DONT POST GUESSING AT RESULT TIME",
    "DONT POST WRONG RESULT",
    "IF YOU DONT FOLLOW SITE RULES THAN, YOUR *IP* WILL BE BLOCKED PERMENTLY.",
    "NOTICE :- GAME PASS HONE PAR GUESSER KO WISH KARE THIS IS LAST WARNING TO ALL MEMBERS"
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-[#4682b4] shadow-md my-2 font-sans">
      {rules.map((rule, index) => (
        <div 
          key={index} 
          className="py-3 px-4 text-center border-b border-gray-300 last:border-b-0"
        >
          <span className="text-red-600 font-bold text-base mr-1">
            {index + 1} »
          </span>
          <span className="text-black font-bold text-sm tracking-wide uppercase">
            {rule}
          </span>
        </div>
      ))}
    </div>
  );
}

