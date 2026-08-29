// app/guessing-forum/page.js
import GuessingForum from "@/components/GuessingForum";

export const metadata = {
  title: "Guessing Forum - MP Matka",
  description: "Live Guessing Forum for Market Updates",
};

export default function GuessingForumPage() {
  return (
    <main className="w-full max-w-full bg-[#f5f7fb] pb-10 px-1 sm:px-4 m-0 box-border">
      <GuessingForum />
    </main>
  );
}

