"use client"
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from "@mui/material/Button";
import Paper from '@mui/material/Paper';

export default function DashboardContent() {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
          width: '100%',
          px: 2
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Explore la cryptomonnaie..."
          sx={{
            width: '70%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
              '& fieldset': {
                borderColor: '#434344ff', // Change border color (default state)
                borderWidth: '2px', // Make border thicker
              },
              '&:hover fieldset': {
                borderColor: '#989898ff', // Border color on hover
                borderWidth: '2px',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#989898ff', // Border color when focused
                borderWidth: '2px',
              },
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color='action' />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <div
          style={{
              borderRadius: '20px',
              padding: '16px',
              backgroundColor: '#15171E',
              textAlign: 'center',
              flexDirection: 'column',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '32px',
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '90%',
              height: '400px'
          }}
      >
          <Typography variant="h4"
              sx={{ mb: '30px', fontWeight: 'bold' }}
        >
              Jouez vos pièces. Dominez le marché.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
              Essayez dès maintenant notre simulateur gratuit de trading crypto.
          </Typography>

          <Typography variant="h6" sx={{ mt: 2, color: '#FFDD00', textDecoration: 'underline' }}>
               Sans portefeuille. Sans risque.
          </Typography>
      </div>

      <div
        style={{
          width: '90%',
          display: 'flex',
          gap: '24px',
          margin: '24px auto 0',
          flexWrap: 'wrap',
        }}
      >
        {/* CÔTÉ GAUCHE */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minWidth: '300px',
          }}
        >
          {/* Market Status */}
          <div
            style={{
              backgroundColor: '#15171E',
              borderRadius: '16px',
              padding: '16px',
              color: '#FFFFFF',
              height: '300px',
            }}
          >
            <Typography variant="h6" gutterBottom>
                Market Status
            </Typography>
          </div>

          {/* Top winning coins */}
          <div
            style={{
              backgroundColor: '#15171E',
              borderRadius: '16px',
              padding: '16px',
              color: '#FFFFFF',
              height: '400px',
            }}
          >
            <Typography variant="h6" gutterBottom>
                Top winning coins of the day
            </Typography>
          </div>
        </div>

        {/* CÔTÉ DROIT */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minWidth: '300px',
          }}
        >
          {/* Daily News */}
          <div
            style={{
              backgroundColor: '#15171E',
              borderRadius: '16px',
              padding: '16px',
              color: '#FFFFFF',
              height: '400px',
            }}
          >
            <Typography variant="h6" gutterBottom>
                Daily News
            </Typography>
          </div>

          {/* Top losing coins */}
          <div
            style={{
              backgroundColor: '#15171E',
              borderRadius: '16px',
              padding: '16px',
              color: '#FFFFFF',
              height: '300px',
            }}
          >
            <Typography variant="h6" gutterBottom>
                Top losing coins of the day
            </Typography>
          </div>
        </div>
      </div>

      <div
        style={{
          width: '90%',
          margin: '24px auto',
        }}>
            {/* Ajout de boutton dans ce div dans le future */}
            <div>
                <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                    Watchlist
                </Typography>
            </div>
            

            <Typography variant="h6" gutterBottom>
                Votre watchlist est vide.
            </Typography>
        </div>
    </>
  );
}