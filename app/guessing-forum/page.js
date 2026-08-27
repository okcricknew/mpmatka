// app/guessing-forum/page.js
import GuessingForum from "@/components/GuessingForum";

export const metadata = {
  title: "Guessing Forum - MP Matka",
  description: "Live Guessing Forum for Market Updates",
};

export default function GuessingForumPage() {
  return (
    <main className="min-h-screen bg-gray-100 max-w-4xl mx-auto p-2">
      <GuessingForum />
    </main>
  );
}

