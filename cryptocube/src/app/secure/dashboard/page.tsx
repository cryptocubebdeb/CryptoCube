import { auth } from '@/auth'
import styles from './page.module.css'
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';

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
      <h3 className={styles.titreSubHeadline}>
        Simple. Rapide. Transparent.
      </h3>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Explore la cryptomonnaie..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color='action' />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </div>
  );
}
