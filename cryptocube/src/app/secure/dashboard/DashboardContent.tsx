"use client"
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';

export default function DashboardContent() {
  return (
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

    
  );
}