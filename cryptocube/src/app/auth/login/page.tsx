import Link from "next/link"
export default function Page() 
{
    return ( 
    <>
    <div className="h-screen flex flex-col justify-center items-center space-y-6">
      <h1 className="text-6xl text-center font-mono ">Oups...</h1>
      <h1 className="text-2xl text-center font-mono ">Seems like you can't login quite yet... </h1>
      <h1 className="text-xl text-center font-mono "> This page is under construction</h1>

      <div className="flex justify-center items-center space-x-8">
        <Link href="/dashboard">
          <button className="bg-yellow-400 px-6 py-2 text-white rounded-md hover:bg-yellow-700 font-mono font-semibold">Still wana travel this website ? </button>
        </Link>
      </div>
    </div> 
  </>
    )
}