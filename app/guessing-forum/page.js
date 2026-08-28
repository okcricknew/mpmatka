// app/guessing-forum/page.js
import GuessingForum from "@/components/GuessingForum";

export const metadata = {
  title: "Guessing Forum - MP Matka",
  description: "Live Guessing Forum for Market Updates",
};

export default function GuessingForumPage() {
  return (
    <main className="w-full max-w-none min-w-0 bg-[#f5f7fb] pb-10 px-1 sm:px-4 m-0">
      <GuessingForum />
    </main>
  );
}

