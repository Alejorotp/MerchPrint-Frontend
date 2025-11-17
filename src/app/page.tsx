import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          Welcome to MerchPrint
        </h1>
        <Link
          href="/login"
          className="inline-block px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
