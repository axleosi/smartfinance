// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-purple-400">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-black">
          SMART FINANCE ANALYZER
        </h1>
        <p className="text-lg sm:text-xl text-gray-800 mb-8">
          Upload and scan your receipts effortlessly, and gain insightful
          financial analytics in no time.
        </p>
        <button
          onClick={() => router.push("/signup")}
          className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:opacity-90"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
