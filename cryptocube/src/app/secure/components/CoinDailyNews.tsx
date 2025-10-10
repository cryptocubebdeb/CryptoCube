"use client"

import React, { useEffect, useState } from "react"
import { Box, Typography, Link, Avatar, IconButton } from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { getCoinNews } from "../../lib/getCoinNews"

// Simple shape for each news item (kept beginner-friendly)
interface NewsItem {
  id: string
  title: string
  url: string
  description: string
  created_at: string
  news_site?: string
  thumbnail?: string
}

export default function CoinDailyNews({
  coinId,
  pageSize = 3,   // show 3 items per page
  fetchSize = 9,  // fetch up to 9 items total
}: {
  coinId: string
  pageSize?: number
  fetchSize?: number
}) {

  const [news, setNews] = useState<NewsItem[]>([])     // all fetched items
  const [loading, setLoading] = useState(true)         // loading flag
  const [currentIndex, setCurrentIndex] = useState(0)  // page index (0-based)

  // Load news when coin changes
  useEffect(() => {
    async function load() {
      try {
        const items = await getCoinNews(coinId, fetchSize)
        setNews(items || [])
        setCurrentIndex(0) // always start on first page for a new coin
      } catch (err) {
        console.error("Failed to load coin news:", err)
        setNews([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [coinId, fetchSize])

  // Loading + empty states
  if (loading) {
    return (
      <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "white" }}>
        Loading news...
      </Typography>
    )
  }

  if (news.length === 0) {
    return (
      <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "error.main" }}>
        No recent news for this coin.
      </Typography>
    )
  }

  // Paging math (3 per page)
  const totalPages = Math.max(1, Math.ceil(news.length / pageSize))
  const start = currentIndex * pageSize
  const visible = news.slice(start, start + pageSize)

  // Prev/Next handlers 
  const prev = () => setCurrentIndex((i) => (i - 1 + totalPages) % totalPages)
  const next = () => setCurrentIndex((i) => (i + 1) % totalPages)

  // Build an array just to render one dot per page
  const pageArray = Array.from({ length: totalPages })

  return (
    <Box sx={{ position: "relative" }}>
      {/* Header with arrows */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ color: "white" }}>Latest updates</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={prev} size="small" sx={{ color: "white" }}>
            <ArrowBackIosIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {currentIndex + 1} / {totalPages}
          </Typography>
          <IconButton onClick={next} size="small" sx={{ color: "white" }}>
            <ArrowForwardIosIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((item) => (
          <Box
            key={item.id}
            className="bg-[#15171E] rounded-md p-3 border border-white/5 hover:border-white/20 transition-colors"
          >
            {/* Image */}
            <Link href={item.url} target="_blank" sx={{ textDecoration: "none", cursor: "pointer" }}>
              <Avatar
                src={item.thumbnail || "/default-news.png"}
                alt={item.title}
                variant="rounded"
                sx={{
                  width: "100%",
                  height: 160,
                  borderRadius: 2,
                  mb: 1,
                  cursor: "pointer",
                  transition: "transform 0.2s ease, filter 0.2s ease",
                  "&:hover": { transform: "scale(1.02)", filter: "brightness(1.05)" },
                }}
                imgProps={{
                  onError: (e: any) => { e.currentTarget.src = "/default-news.png" },
                }}
              />
            </Link>

            {/* Title */}
            <Link href={item.url} target="_blank" underline="hover" sx={{ textDecoration: "none" }}>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.05rem", lineHeight: 1.4, fontWeight: 500, color: "white" }}
              >
                {item.title.length > 80 ? item.title.slice(0, 80) + "…" : item.title}
              </Typography>
            </Link>

            {/* Source • Date */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Typography variant="body2" sx={{ color: "gray" }}>
                {item.news_site || "CoinGecko"}
              </Typography>
              <Typography variant="body2" sx={{ color: "gray" }}>•</Typography>
              <Typography variant="body2" sx={{ color: "gray" }}>
                {new Date(item.created_at).toLocaleDateString()}
              </Typography>
            </Box>

            {/* Short description */}
            {item.description && (
              <Typography variant="body2" sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>
                {item.description.length > 120 ? item.description.slice(0, 120) + "…" : item.description}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* Navigation Dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 2 }}>
        {pageArray.map((_, index) => (
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
  )
}
