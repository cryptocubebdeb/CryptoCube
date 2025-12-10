"use client"
import { useState, useEffect } from 'react';
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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';

import type { FiltersState } from '@/app/lib/filters';

interface AdvancedFiltersModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<FiltersState>;
  onApply?: (values: FiltersState) => void;
}

export default function AdvancedFiltersModal({ open, onClose, initialValues, onApply }: AdvancedFiltersModalProps) {
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
  const [volumeMax, setVolumeMax] = useState('');
  const [change24hMin, setChange24hMin] = useState('');
  const [change24hMax, setChange24hMax] = useState('');

  // Options
  const [excludeStablecoins, setExcludeStablecoins] = useState(false);
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);

  // Category
  const [category, setCategory] = useState('all');
  const categories = [
    { value: 'all', label: 'Toutes les Catégories' },
    { value: 'decentralized-finance-defi', label: 'DeFi' },
    { value: 'non-fungible-tokens-nft', label: 'NFTs' },
    { value: 'stablecoins', label: 'Stablecoins' },
    { value: 'meme-token', label: 'Meme Coins' },
    { value: 'artificial-intelligence', label: 'Intelligence Artificielle' },
    { value: 'centralized-exchange-token-cex', label: 'Tokens d\'Exchange (BNB, OKB...)' },
    { value: 'decentralized-exchange', label: 'DEX (Exchanges Décentralisés)' },
    { value: 'layer-1', label: 'Layer 1 (BTC, ETH, SOL...)' },
    { value: 'layer-2', label: 'Layer 2 (Polygon, Arbitrum...)' },
    { value: 'smart-contract-platform', label: 'Plateformes Smart Contracts' },
    { value: 'binance-smart-chain', label: 'Binance Smart Chain (BSC)' },
    { value: 'solana-ecosystem', label: 'Écosystème Solana' },
    { value: 'polygon-ecosystem', label: 'Écosystème Polygon' },
    { value: 'avalanche-ecosystem', label: 'Écosystème Avalanche' },
    { value: 'arbitrum-ecosystem', label: 'Écosystème Arbitrum' },
  ];

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
    setVolumeMax('');
    setChange24hMin('');
    setChange24hMax('');
    setExcludeStablecoins(false);
    setOnlyWatchlist(false);
    setCategory('all');
  };

  // Hydrate depuis initialValues quand on ouvre le modal

  useEffect(() => {
    if (!open || !initialValues) return;
    if (initialValues.topGagnants !== undefined) setTopGainers(initialValues.topGagnants);
    if (initialValues.topPerdants !== undefined) setTopLosers(initialValues.topPerdants);
    if (initialValues.faibleVolatilite !== undefined) setLowVolatility(initialValues.faibleVolatilite);
    if (initialValues.hauteVolatilite !== undefined) setHighVolatility(initialValues.hauteVolatilite);
    if (initialValues.sortKey) setSortKey(initialValues.sortKey as any);
    if (initialValues.sortDirection) setSortDirection(initialValues.sortDirection);
    if (initialValues.priceMin !== undefined) setPriceMin(String(initialValues.priceMin ?? ''));
    if (initialValues.priceMax !== undefined) setPriceMax(String(initialValues.priceMax ?? ''));
    if (initialValues.marketCapMin !== undefined) setMarketCapMin(String(initialValues.marketCapMin ?? ''));
    if (initialValues.marketCapMax !== undefined) setMarketCapMax(String(initialValues.marketCapMax ?? ''));
    if (initialValues.volumeMin !== undefined) setVolumeMin(String(initialValues.volumeMin ?? ''));
    if (initialValues.volumeMax !== undefined) setVolumeMax(String(initialValues.volumeMax ?? ''));
    if (initialValues.change24hMin !== undefined) setChange24hMin(String(initialValues.change24hMin ?? ''));
    if (initialValues.change24hMax !== undefined) setChange24hMax(String(initialValues.change24hMax ?? ''));
    if (initialValues.exclureStablecoins !== undefined) setExcludeStablecoins(initialValues.exclureStablecoins);
    if (initialValues.seulementWatchlist !== undefined) setOnlyWatchlist(initialValues.seulementWatchlist);
    if (initialValues.category) setCategory(initialValues.category);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'var(--background-filter)',
          color: 'var(--foreground)',
          borderRadius: '16px',
          minHeight: '500px',
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--background-filter-fields)',
        color: 'var(--foreground)',
        marginBottom: '8px'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
          Filtres
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'var(--foreground-grey)' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

  <DialogContent sx={{ color: 'var(--foreground)' }}>
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, color: 'var(--foreground)' }}>
          {/* Performance Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon sx={{ color: '#3B82F6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
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
                sx={{ color: 'var(--foreground)' }}
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
                sx={{ color: 'var(--foreground)' }}
              />
            </Box>
          </Box>

          {/* Tri unifié */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SortIcon sx={{ color: '#3B82F6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
                Tri
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Select
                value={sortKey}
                onChange={(e) => setSortKey(String(e.target.value))}
                sx={{
                  backgroundColor: 'var(--background-filter-fields)',
                  color: 'var(--foreground)',
                  borderRadius: '8px',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '.MuiSvgIcon-root': { color: 'var(--foreground-grey)' }
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
                  backgroundColor: 'var(--background-filter-fields)',
                  color: 'var(--foreground)',
                  borderRadius: '8px',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '.MuiSvgIcon-root': { color: 'var(--foreground-grey)' }
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
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
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
                sx={{ color: 'var(--foreground)' }}
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
                sx={{ color: 'var(--foreground)' }}
              />
            </Box>
          </Box>

          {/* Options */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TuneIcon sx={{ color: '#3B82F6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
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
                sx={{ color: 'var(--foreground)' }}
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
                sx={{ color: 'var(--foreground)' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Category Filter */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--foreground)' }}>Catégorie</Typography>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            sx={{
              backgroundColor: 'var(--background-filter-fields)',
              color: 'var(--foreground)',
              borderRadius: '8px',
              '.MuiOutlinedInput-notchedOutline': { border: 'none' },
              '.MuiSvgIcon-root': { color: 'var(--foreground-grey)' }
            }}
          >
            {categories.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
            ))}
          </Select>
        </Box>

        {/* Filtres numériques */}
        <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {/* Prix */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--foreground)' }}>Prix</Typography>
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
                  backgroundColor: 'var(--background-filter-fields)',
                  borderRadius: '8px',
                  input: { color: 'var(--foreground)' }
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
                  backgroundColor: 'var(--background-filter-fields)',
                  borderRadius: '8px',
                  input: { color: 'var(--foreground)' }
                }}
              />
            </Box>
          </Box>

          {/* Market Cap */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--foreground)' }}>Capitalisation</Typography>
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
                sx={{ backgroundColor: 'var(--background-filter-fields)', borderRadius: '8px', input: { color: 'var(--foreground)' } }}
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
                sx={{ backgroundColor: 'var(--background-filter-fields)', borderRadius: '8px', input: { color: 'var(--foreground)' } }}
              />
            </Box>
          </Box>

          {/* Volume 24h */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--foreground)' }}>Volume (24h)</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                value={volumeMin}
                onChange={(e) => setVolumeMin(e.target.value)}
                placeholder="Min"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ backgroundColor: 'var(--background-filter-fields)', borderRadius: '8px', input: { color: 'var(--foreground)' } }}
              />
              <TextField
                value={volumeMax}
                onChange={(e) => setVolumeMax(e.target.value)}
                placeholder="Max"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ backgroundColor: 'var(--background-filter-fields)', borderRadius: '8px', input: { color: 'var(--foreground)' } }}
              />
            </Box>
          </Box>

          {/* Variation (24h) */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--foreground)' }}>Variation (24h)</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                value={change24hMin}
                onChange={(e) => setChange24hMin(e.target.value)}
                placeholder="Min %"
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ backgroundColor: 'var(--background-filter-fields)', borderRadius: '8px', input: { color: 'var(--foreground)' } }}
              />
              <TextField
                value={change24hMax}
                onChange={(e) => setChange24hMax(e.target.value)}
                placeholder="Max %"
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ backgroundColor: 'var(--background-filter-fields)', borderRadius: '8px', input: { color: 'var(--foreground)' } }}
              />
            </Box>
          </Box>
        </Box>


      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #2d3240' }}>
        <Button onClick={handleReset} sx={{ color: '#9CA3AF' }}>Réinitialiser</Button>
        <Button
          variant="contained"
          onClick={() => {
            const values: FiltersState = {
              topGagnants: topGainers,
              topPerdants: topLosers,
              faibleVolatilite: lowVolatility,
              hauteVolatilite: highVolatility,
              sortKey: sortKey as any,
              sortDirection,
              priceMin: priceMin === '' ? '' : Number(priceMin),
              priceMax: priceMax === '' ? '' : Number(priceMax),
              marketCapMin: marketCapMin === '' ? '' : Number(marketCapMin),
              marketCapMax: marketCapMax === '' ? '' : Number(marketCapMax),
              volumeMin: volumeMin === '' ? '' : Number(volumeMin),
              volumeMax: volumeMax === '' ? '' : Number(volumeMax),
              change24hMin: change24hMin === '' ? '' : Number(change24hMin),
              change24hMax: change24hMax === '' ? '' : Number(change24hMax),
              exclureStablecoins: excludeStablecoins,
              seulementWatchlist: onlyWatchlist,
              category,
            };
            onApply?.(values);
            onClose();
          }}
          sx={{ backgroundColor: '#3B82F6', '&:hover': { backgroundColor: '#2563EB' } }}
        >
          Appliquer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
