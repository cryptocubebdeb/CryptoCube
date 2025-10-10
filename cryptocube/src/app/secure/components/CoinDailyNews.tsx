"use client"

import React, { useEffect, useState } from "react"
import { Box, Typography, Link, Avatar, IconButton } from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { getCoinNews } from "../../lib/getCoinNews"

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
  pageSize = 3,   // show 3 at a time
  fetchSize = 9,  // fetch 9 total
}: {
  coinId: string
  pageSize?: number
  fetchSize?: number
}) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0) // 0-based page index

  useEffect(() => {
    async function load() {
      try {
        const items = await getCoinNews(coinId, fetchSize)
        setNews(items)
        setPage(0) // reset to first page on coin change
      } catch (err) {
        console.error("Failed to load coin news:", err)
        setNews([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [coinId, fetchSize])

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

  // Paging math
  const totalPages = Math.max(1, Math.ceil(news.length / pageSize))
  const start = page * pageSize
  const visible = news.slice(start, start + pageSize)

  const prev = () => setPage((page) => (page - 1 + totalPages) % totalPages)
  const next = () => setPage((page) => (page + 1) % totalPages)

  return (
    <Box sx={{ position: "relative" }}>
      {/* Header row with arrows */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ color: "white" }}>Latest updates</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={prev} size="small" sx={{ color: "white" }}>
            <ArrowBackIosIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {page + 1} / {totalPages}
          </Typography>
          <IconButton onClick={next} size="small" sx={{ color: "white" }}>
            <ArrowForwardIosIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>

      {/* 3-up grid */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((item) => (
          <Box
            key={item.id}
            className="bg-[#15171E] rounded-md p-3 border border-white/5 hover:border-white/20 transition-colors"
          >
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

            <Link href={item.url} target="_blank" underline="hover" sx={{ textDecoration: "none" }}>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.05rem", lineHeight: 1.4, fontWeight: 500, color: "white" }}
              >
                {item.title.length > 80 ? item.title.slice(0, 80) + "…" : item.title}
              </Typography>
            </Link>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Typography variant="body2" sx={{ color: "gray" }}>
                {item.news_site || "CoinGecko"}
              </Typography>
              <Typography variant="body2" sx={{ color: "gray" }}>•</Typography>
              <Typography variant="body2" sx={{ color: "gray" }}>
                {new Date(item.created_at).toLocaleDateString()}
              </Typography>
            </Box>

            {item.description && (
              <Typography variant="body2" sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>
                {item.description.length > 120 ? item.description.slice(0, 120) + "…" : item.description}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* Optional dots under grid */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Box
              key={i}
              onClick={() => setPage(i)}
              sx={{
                width: 8, height: 8, borderRadius: "50%",
                backgroundColor: i === page ? "#dadadaff" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                "&:hover": { backgroundColor: i === page ? "#bcbcbc" : "rgba(255,255,255,0.5)" },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
