// src/app/page.tsx
import Link from "next/link";

export default function Page() {
  return (
    <div className="h-screen flex flex-col justify-center items-center space-y-6">
      <h1 className="text-6xl font-bold text-center">
        Crypto<span className="text-yellow-400">Cube</span>
      </h1>

      <h2 className="text-2xl text-center">
        Redefining the future of crypto, one cube at a time
      </h2>

      <h3 className="text-xl text-center">Launching soon</h3>

      <div className="flex justify-center items-center space-x-8">
        <Link href="/auth/signin">
          <button className="bg-yellow-400 px-6 py-2 text-white rounded-md hover:bg-yellow-700 font-semibold">
            Login
          </button>
        </Link>

        <Link href="/auth/signup">
          <button className="bg-yellow-400 px-6 py-2 text-white rounded-md hover:bg-yellow-700 font-semibold">
            Sign up
          </button>
        </Link>
      </div>
    </div>
  );
}
