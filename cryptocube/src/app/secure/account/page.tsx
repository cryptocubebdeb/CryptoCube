import Link from "next/link"
import Sidebar from "../components/sidebar";

export default function Page() 
{
    return (
    <><div className="flex h-screen p-10">
        <Sidebar />
    
        {/* Main Content Area */}
        <main className="flex-1 mt-1 rounded-2xl overflow-auto bg-gray-900">
            <h2 className="text-xl font-semibold mt-8 ml-10">My Details</h2>

            <div className="p-6 ml-5 mt-2 shadow-md max-w-md">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <p><span className="font-medium">First Name</span></p>
                <p><span className="font-medium">Last Name</span></p>
                <p><span className="font-medium">Email</span></p>

                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <p><span className="font-medium">Username</span></p>
                <p><span className="font-medium">Password</span></p>
            </div>
        
        </main> 
    </div>
  </>
    )
}