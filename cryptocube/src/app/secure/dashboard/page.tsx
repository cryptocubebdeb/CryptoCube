import { auth } from '@/auth'

export default async function Page() {
  const session = await auth();
    
  if (!session) {
    return <p>You must be signed in to view this page.</p>;
  } 

  return (
    <div className="h-screen flex flex-col justify-center items-center space-y-6">
      <h1 className="text-2xl text-center font-mono">
        Hi, {session.user?.name || session.user?.email}!
      </h1>
      <h1 className="text-xl text-center font-mono ">
        This should be your dashboard. It is for now still under construction</h1>
    </div> 
  );
}
