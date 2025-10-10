"use client"
import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';


export default function SearchBar(): React.JSX.Element {
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
    );
}