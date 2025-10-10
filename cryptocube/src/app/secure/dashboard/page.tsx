import { auth } from '@/auth'
import styles from './page.module.css'
import DashboardContent from './DashboardContent';

export default async function Page() {
  const session = await auth();
    
  if (!session) {
    return <p>You must be signed in to view this page.</p>;
  } 

  return (
    <div className={styles.headline}>
      <div className="text-center mx-auto space-y-8">
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Navigate the World of Crypto with Ease
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-light opacity-75">
              Simple. Fast. Transparent.
          </p>
      </div>

      <DashboardContent />
    </div>
  );
}
