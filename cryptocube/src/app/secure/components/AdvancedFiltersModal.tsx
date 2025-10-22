"use client"
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';

interface AdvancedFiltersModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdvancedFiltersModal({ open, onClose }: AdvancedFiltersModalProps) {
  // Performance
  const [topGainers, setTopGainers] = useState(false);
  const [topLosers, setTopLosers] = useState(false);

  // Volatilité
  const [lowVolatility, setLowVolatility] = useState(false);
  const [highVolatility, setHighVolatility] = useState(false);

  // Tri unifié
  const sortOptions = [
    { value: 'market_cap', label: 'Capitalisation boursière' },
    { value: 'volume_24h', label: 'Volume (24h)' },
    { value: 'price', label: 'Prix' },
    { value: 'change_24h', label: '% 24h' },
    { value: 'change_7d', label: '% 7j' },
    { value: 'volatility', label: 'Volatilité' },
    { value: 'name', label: 'Nom' },
  ];
  const [sortKey, setSortKey] = useState('market_cap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filtres numériques
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [marketCapMin, setMarketCapMin] = useState('');
  const [marketCapMax, setMarketCapMax] = useState('');
  const [volumeMin, setVolumeMin] = useState('');

  // Options
  const [excludeStablecoins, setExcludeStablecoins] = useState(false);
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);

  // Category and Blockchain
  const [category, setCategory] = useState('all');
  const [blockchain, setBlockchain] = useState('all');

  // Selected tags
  const [categoryTags, setCategoryTags] = useState<string[]>([]);
  const [blockchainTags, setBlockchainTags] = useState<string[]>([]);

  const categories = ['NFTs', 'DeFi', 'Stablecoins', 'Meme Coins', 'Jetons IA'];
  const blockchains = ['Bitcoin', 'Ethereum', 'BNB Chain', 'Solana', 'Polygon', 'Avalanche'];

  const toggleCategoryTag = (tag: string) => {
    setCategoryTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleBlockchainTag = (tag: string) => {
    setBlockchainTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleReset = () => {
    setTopGainers(false);
    setTopLosers(false);
    setLowVolatility(false);
    setHighVolatility(false);
    setSortKey('market_cap');
    setSortDirection('desc');
    setPriceMin('');
    setPriceMax('');
    setMarketCapMin('');
    setMarketCapMax('');
    setVolumeMin('');
    setExcludeStablecoins(false);
    setOnlyWatchlist(false);
    setCategory('all');
    setBlockchain('all');
    setCategoryTags([]);
    setBlockchainTags([]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1d29',
          color: '#FFFFFF',
          borderRadius: '16px',
          minHeight: '500px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid #2d3240'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Filtres
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: '#9CA3AF' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {/* Performance Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon sx={{ color: '#3B82F6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Performance
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={topGainers}
                    onChange={(e) => setTopGainers(e.target.checked)}
                    sx={{
                      color: '#4B5563',
                      '&.Mui-checked': { color: '#3B82F6' }
                    }}
                  />
                }
                label="Top Gagnants"
                sx={{ color: '#D1D5DB' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={topLosers}
                    onChange={(e) => setTopLosers(e.target.checked)}
                    sx={{
                      color: '#4B5563',
                      '&.Mui-checked': { color: '#3B82F6' }
                    }}
                  />
                }
                label="Top Perdants"
                sx={{ color: '#D1D5DB' }}
              />
            </Box>
          </Box>

          {/* Tri unifié */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SortIcon sx={{ color: '#3B82F6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tri
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Select
                value={sortKey}
                onChange={(e) => setSortKey(String(e.target.value))}
                sx={{
                  backgroundColor: '#2d3240',
                  color: '#D1D5DB',
                  borderRadius: '8px',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '.MuiSvgIcon-root': { color: '#9CA3AF' }
                }}
              >
                {sortOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>

              <Select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                sx={{
                  backgroundColor: '#2d3240',
                  color: '#D1D5DB',
                  borderRadius: '8px',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '.MuiSvgIcon-root': { color: '#9CA3AF' }
                }}
              >
                <MenuItem value={'asc'}>Ascendant</MenuItem>
                <MenuItem value={'desc'}>Descendant</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Volatility Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FlashOnIcon sx={{ color: '#3B82F6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Volatilité
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={lowVolatility}
                    onChange={(e) => setLowVolatility(e.target.checked)}
                    sx={{
                      color: '#4B5563',
                      '&.Mui-checked': { color: '#3B82F6' }
                    }}
                  />
                }
                label="Faible Volatilité en Premier"
                sx={{ color: '#D1D5DB' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={highVolatility}
                    onChange={(e) => setHighVolatility(e.target.checked)}
                    sx={{
                      color: '#4B5563',
                      '&.Mui-checked': { color: '#3B82F6' }
                    }}
                  />
                }
                label="Haute Volatilité en Premier"
                sx={{ color: '#D1D5DB' }}
              />
            </Box>
          </Box>

          {/* Options */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TuneIcon sx={{ color: '#3B82F6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Options
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={excludeStablecoins}
                    onChange={(e) => setExcludeStablecoins(e.target.checked)}
                    sx={{ color: '#4B5563', '&.Mui-checked': { color: '#3B82F6' } }}
                  />
                }
                label="Exclure les stablecoins"
                sx={{ color: '#D1D5DB' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={onlyWatchlist}
                    onChange={(e) => setOnlyWatchlist(e.target.checked)}
                    sx={{ color: '#4B5563', '&.Mui-checked': { color: '#3B82F6' } }}
                  />
                }
                label="Seulement ma watchlist"
                sx={{ color: '#D1D5DB' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Filtres numériques */}
        <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {/* Prix */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Prix</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="Min"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{
                  backgroundColor: '#2d3240',
                  borderRadius: '8px',
                  input: { color: '#D1D5DB' }
                }}
              />
              <TextField
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="Max"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{
                  backgroundColor: '#2d3240',
                  borderRadius: '8px',
                  input: { color: '#D1D5DB' }
                }}
              />
            </Box>
          </Box>

          {/* Market Cap */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Market Cap</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                value={marketCapMin}
                onChange={(e) => setMarketCapMin(e.target.value)}
                placeholder="Min"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ backgroundColor: '#2d3240', borderRadius: '8px', input: { color: '#D1D5DB' } }}
              />
              <TextField
                value={marketCapMax}
                onChange={(e) => setMarketCapMax(e.target.value)}
                placeholder="Max"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ backgroundColor: '#2d3240', borderRadius: '8px', input: { color: '#D1D5DB' } }}
              />
            </Box>
          </Box>

          {/* Volume 24h */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Volume (24h)</Typography>
            <TextField
              value={volumeMin}
              onChange={(e) => setVolumeMin(e.target.value)}
              placeholder="Min"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ backgroundColor: '#2d3240', borderRadius: '8px', input: { color: '#D1D5DB' } }}
            />
          </Box>
        </Box>

        {/* Category and Blockchain Section */}
        <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {/* Category */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                Catégorie :
              </Typography>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{
                  flex: 1,
                  backgroundColor: '#2d3240',
                  color: '#D1D5DB',
                  borderRadius: '8px',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '.MuiSvgIcon-root': { color: '#9CA3AF' }
                }}
              >
                <MenuItem value="all">Toutes les Catégories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat.toLowerCase()}>{cat}</MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {categories.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => toggleCategoryTag(tag)}
                  onDelete={categoryTags.includes(tag) ? () => toggleCategoryTag(tag) : undefined}
                  sx={{
                    backgroundColor: categoryTags.includes(tag) ? '#3B82F6' : '#4B5563',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: categoryTags.includes(tag) ? '#2563EB' : '#6B7280',
                    },
                    '.MuiChip-deleteIcon': {
                      color: '#FFFFFF'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Blockchain */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                Blockchain :
              </Typography>
              <Select
                value={blockchain}
                onChange={(e) => setBlockchain(e.target.value)}
                sx={{
                  flex: 1,
                  backgroundColor: '#2d3240',
                  color: '#D1D5DB',
                  borderRadius: '8px',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '.MuiSvgIcon-root': { color: '#9CA3AF' }
                }}
              >
                <MenuItem value="all">Toutes les Blockchains</MenuItem>
                {blockchains.map(chain => (
                  <MenuItem key={chain} value={chain.toLowerCase()}>{chain}</MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {blockchains.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => toggleBlockchainTag(tag)}
                  onDelete={blockchainTags.includes(tag) ? () => toggleBlockchainTag(tag) : undefined}
                  sx={{
                    backgroundColor: blockchainTags.includes(tag) ? '#3B82F6' : '#4B5563',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: blockchainTags.includes(tag) ? '#2563EB' : '#6B7280',
                    },
                    '.MuiChip-deleteIcon': {
                      color: '#FFFFFF'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #2d3240' }}>
        <Button onClick={handleReset} sx={{ color: '#9CA3AF' }}>Réinitialiser</Button>
        <Button variant="contained" onClick={onClose} sx={{ backgroundColor: '#3B82F6', '&:hover': { backgroundColor: '#2563EB' } }}>
          Appliquer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
