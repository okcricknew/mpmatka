export default function UserLoginSection() {
  return (
    <div className="w-full bg-white border-2 border-[#5c245c] rounded-[4px] overflow-hidden my-3 shadow-sm">
      {/* Header Title */}
      <div className="bg-[#5c245c] text-white text-center font-bold text-base py-2 tracking-wider font-sans">
        ✻ USER LOGIN ✻
      </div>

      {/* Buttons Container */}
      <div className="flex items-center justify-center gap-3 py-2.5 bg-white">
        <a 
          href="/login" 
          className="bg-[#1a73e8] text-white px-6 py-1.5 rounded-[6px] font-bold text-sm shadow-md inline-block text-center hover:opacity-95 transition-opacity"
        >
          Login
        </a>
        <span className="text-[#666666] font-bold text-base select-none">
          //
        </span>
        <a 
          href="/register" 
          className="bg-[#ff0055] text-white px-6 py-1.5 rounded-[6px] font-bold text-sm shadow-md inline-block text-center hover:opacity-95 transition-opacity"
        >
          Register
        </a>
      </div>
    </div>
  );
}

