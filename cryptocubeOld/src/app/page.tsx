import Link from "next/link";

export default function Page()
{
  return (
  <>
    <div className="h-screen flex flex-col justify-center items-center space-y-6">
      <h1 className="text-6xl font-bold text-center font-mono font-semibold">Crypto<span className="text-yellow-400">Cube</span></h1>
      <h1 className="text-2xl text-center font-mono ">Redefining the future of crypto, one cube at a time</h1>
      <h1 className="text-xl text-center font-mono ">Launching soon</h1>

      <div className="flex justify-center items-center space-x-8">
        <Link href="/auth/login">
          <button className="bg-yellow-400 px-6 py-2 text-white rounded-md hover:bg-yellow-700 font-mono font-semibold">Login</button>
        </Link>
        <Link href="/auth/signup">
          <button className="bg-yellow-400 px-6 py-2 text-white rounded-md hover:bg-yellow-700 font-mono font-semibold">Sign up</button>
        </Link>
      </div>
    </div> 
  </>
  )
}