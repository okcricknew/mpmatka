// app/guessing-forum/page.js
import GuessingForum from "@/components/GuessingForum";

export const metadata = {
  title: "Guessing Forum - MP Matka",
  description: "Live Guessing Forum for Market Updates",
};

export default function GuessingForumPage() {
  return (
    <main className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#f5f7fb] pb-10 m-0">
    
      <GuessingForum />
    </main>
  );
}

