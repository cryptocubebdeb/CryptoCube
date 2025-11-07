"use client"
import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ searchTerm, onSearchChange, placeholder = "Explore la cryptomonnaie..." }: SearchBarProps): React.JSX.Element {
    return (
        <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
          width: '100%',
          maxWidth: '1050px',
          mx: 'auto',
          px: 2
        }}
      >
        <TextField
          variant="outlined"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            width: '100%',
            maxWidth: '1050px',
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