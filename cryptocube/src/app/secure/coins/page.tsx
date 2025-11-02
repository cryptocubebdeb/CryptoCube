'use client'

<<<<<<< Updated upstream
import { Suspense } from 'react';
import CoinsPageContent from './CoinsPageContent';

export default function CoinsPage() {
    return (
        <Suspense fallback={<div>Loading coins...</div>}>
            <CoinsPageContent />
        </Suspense>
    );
=======
import { useState, useEffect } from "react"
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Button from "@mui/material/Button"; // https://mui.com/material-ui/react-button/
import SearchBar from '../components/SearchBar';
import CoinsTable from '../components/CoinsTable';
import AdvancedFiltersModal from '../components/AdvancedFiltersModal';
import { applyAdvancedFilters, defaultFilters, type FiltersState } from '@/app/lib/filters';
import { CoinData, CategoryData } from '@/app/lib/definitions';
import { getCoinsList } from '../../lib/getCoinsList';
import { getCategories } from '../../lib/getCategories';
import { getFormatPrix, getFormatMarketCap, getFormatPercentage } from '@/app/lib/getFormatData';
import { fetchWatchlistIds, addToWatchlist, removeFromWatchlist } from '@/app/lib/watchlistActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function Page() {
    
>>>>>>> Stashed changes
}