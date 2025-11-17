"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-200 via-blue-300 to-cyan-400 animate-gradient">
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-lg">
          Welcome to MerchPrint
        </h1>
        <Link
          href="/login"
          className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
