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
      <h1 className={styles.titreHeadline}>
        Naviguez dans le monde de la cryptomonnaie en toute simplicité
      </h1>
      <h1 className={styles.titreSubHeadline}>
        Simple. Rapide. Transparent.
      </h1>

      <DashboardContent />
    </div>
  );
}
