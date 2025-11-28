"use client"
import React, { useEffect, useState } from 'react';
import { Box, Typography, Link, Avatar } from '@mui/material';
import { getCryptoNews } from '../../../lib/getCryptoNews';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface NewsItem {
    id: string;
    title: string;
    url: string;
    description: string;
    created_at: string;
    news_site?: string;
    author?: string;
    thumbnail?: string;
}

export default function DailyNews(): React.JSX.Element {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchNews() {
            try {
                const data = await getCryptoNews();
                console.log('News API Response:', data); // Debug log
                
                // getCryptoNews returns an array directly
                setNews(data.slice(0, 6) || []);
            } catch (error) {
                console.error("Error fetching news:", error);
                // Fallback data on error
                setNews([
                    {
                        id: '1',
                        title: 'Crypto Market Update',
                        url: 'https://coindesk.com',
                        description: 'Latest crypto market trends',
                        created_at: new Date().toISOString(),
                        news_site: 'CoinDesk',
                        thumbnail: ''
                    }
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    // Auto-slide
    useEffect(() => {
        if (news.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
            }, 10000); // Change news every 10 seconds

            return () => clearInterval(interval);
        }
        
    }, [news.length]);

    if (loading) {
        return (
             <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'white' }}>
                Chargement des actualités...
            </Typography>
        );
    }

    if (!news.length) {
        return (
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'error.main' }}>
                Impossible de charger les actualités.
            </Typography>
        );
    }

    const currentNews = news[currentIndex];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, position: 'relative' }}>
            {/* Main Display */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Article Image */}
                <Box
                    sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Link 
                            href={currentNews.url} 
                            target="_blank" 
                            sx={{ textDecoration: 'none', cursor: 'pointer' }}
                        >
                            <Avatar
                                src={currentNews.thumbnail || '/default-news.png'}
                                alt={currentNews.title}
                                variant="rounded"
                                sx={{ 
                                    width: 620, 
                                    height: 210, 
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease, filter 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        filter: 'brightness(1.1)'
                                    }
                                }}
                            />
                        </Link>
                </Box>

                {/* Article Title */}
                <Link 
                    href={currentNews.url} 
                    target="_blank"
                    sx={{ 
                        textDecoration: 'none', 
                        mt: 1.5,
                        mb: 1.5, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, filter 0.2s ease, textDecoration 0.2s ease',
                        transformOrigin: 'center',
                        '&:hover': {
                            transform: 'scale(1.02)',
                            filter: 'brightness(1.1)',
                            textDecoration: 'underline'
                        }
                    }}>

                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginLeft: 8, textAlign: 'start', lineHeight: '1.5', fontWeight: '500', color: 'white' }}>
                        {currentNews.title.length > 60 ?
                            `${currentNews.title.slice(0, 60)}...` :
                            currentNews.title
                        }
                    </Typography>
                </Link>

                {/* Article Outlet */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 8 }}>
                    <Typography variant='body2' sx={{ color: 'gray' }}>
                        {currentNews.news_site || currentNews.author || 'CoinGecko News'}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'gray' }}>
                        •
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'gray' }}>
                        {new Date(currentNews.created_at).toLocaleDateString()}
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Arrows */}
            <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: 0, 
                right: 0,
                transform: 'translateY(-50%)',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                px: 2,
                pointerEvents: 'none' // Allow clicks to pass through the container
            }}>
                <ArrowBackIosIcon
                    onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + news.length) % news.length)}
                    sx={{ 
                        fontSize: 20, 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        cursor: 'pointer', 
                        pointerEvents: 'auto', // Enable clicks on the arrows
                        '&:hover': { color: 'white', fontSize: 24 },
                        transition: 'all 0.2s ease'
                    }}
                />
                <ArrowForwardIosIcon
                    onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length)}
                    sx={{ 
                        fontSize: 20, 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        cursor: 'pointer', 
                        pointerEvents: 'auto', // Enable clicks on the arrows
                        '&:hover': { color: 'white', fontSize: 24 },
                        transition: 'all 0.2s ease'
                    }}
                />
            </Box>

            {/* Navigation Dots */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 2 }}>
                {news.map((_, index) => (
                    <Box
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        sx={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: currentIndex === index ? '#dadadaff' : 'rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                backgroundColor: currentIndex === index ? '#525252ff' : 'rgba(255, 255, 255, 0.5)',
                            },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}