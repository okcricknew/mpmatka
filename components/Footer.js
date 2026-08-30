export default function Footer() {
  return (
    <div className="bg-[#8b0042] text-white text-center py-3 px-4 border-t-2 border-black">
      <p className="font-sans italic font-bold text-sm tracking-wide m-0 uppercase">
        me.SATTA143.IN
      </p>
      <p className="font-sans italic font-bold text-sm tracking-wide m-0 mt-1 uppercase">
        ALL RIGHTS RESERVED
      </p>
      <p className="font-sans italic font-bold text-sm tracking-wide m-0 mt-1 uppercase">
        (2025-2026)
      </p>
      <p className="font-sans italic font-bold text-sm tracking-wide m-0 mt-1 uppercase underline cursor-pointer">
        CONTACT ADMIN
      </p>

      <div className="flex justify-center items-center gap-3 mt-3">
        <button className="bg-gradient-to-b from-[#fff6a1] to-[#f4d03f] text-black font-serif italic font-bold text-sm px-6 py-1 rounded border border-[#b7950b] shadow-inner active:scale-95 transition-transform">
          Back
        </button>
        <button className="bg-gradient-to-b from-[#f9e79f] to-[#d4ac0d] text-black font-serif italic font-bold text-sm px-6 py-1 rounded border border-[#9a7d0a] shadow-inner active:scale-95 transition-transform">
          Home
        </button>
      </div>
    </div>
  );
}

