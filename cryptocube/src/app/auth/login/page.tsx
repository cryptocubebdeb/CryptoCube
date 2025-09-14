import Link from "next/link"
import { UserIcon } from '@heroicons/react/24/outline'
import { LockClosedIcon } from '@heroicons/react/24/outline'


export default function Page() 
{
    return ( 
    <>
    <div className="h-screen flex flex-col justify-center items-center font-mono font-semibold fontsize ">
        <h1 className="text-3xl py-10">Login</h1>
      
      <form className="bg-[#15171E] w-[40rem] flex flex-col space-y-6 px-20 py-20 rounded-md justify-center items-center">
        
        {/* Username input */}
        <div className="flex flex-col border-b-2 w-[100%]">
          <h1 className="py-2 text-xl">Username</h1>
          <div className="flex flex-row py-2">
            <UserIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
            <input className="border-none w-full text-base px-6" type="username" name="username" placeholder="Type your username" required />
          </div>
        </div>

        {/* Password input */}
        <div className="flex flex-col border-b-2 w-[100%]">
          <h1 className="py-2">Password</h1>
          <div className="flex flex-row py-2">
            <LockClosedIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
            <input className="border-none w-full text-base px-6" type="password" name="password" placeholder="Type your password" required />
          </div>
        </div>
        <div className="py-8">
          {/* Login button */}
          <Link href="/secure/dashboard">
            <button className="btn-primary" type="submit">Login</button>
          </Link>
        </div>

        {/* Other ways to sign in (have to implement other ways to login but later) */}
        <div>
          <h1>Or Login Using</h1>
        </div>

        {/* Create an account */}
        <div className="text-center">
          <h1>Don't have an account?</h1>
          <Link href="/secure/dashboard">
            <h1>Sign up here</h1>
          </Link>
        </div>
      </form>
    </div> 
  </>
    )
}