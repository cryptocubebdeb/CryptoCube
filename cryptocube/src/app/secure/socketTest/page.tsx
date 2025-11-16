"use client";

// Example of connecting to Binance WebSocket for BTCUSDT trades
import { useEffect } from "react";

export default function BinanceTest() {
    useEffect(() => {
        const ws = new WebSocket("wss://stream.binance.com/ws/btcusdt@trade");

        ws.onopen = () => console.log("Binance WS connected");

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            console.log("Trade:", data.p); // price
        };

        ws.onerror = (err) => console.log("WS error", err);
        ws.onclose = () => console.log("Binance WS closed");

        return () => ws.close();
    }, []);

    return <div>Page to run basic binance websocket test connection</div>;
}

/*
    Binance WebSocket documentation:
    https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams
    View Section - Trade Streams

    Example trade message:
    {
        "e": "trade",       // Event type
        "E": 1672515782136, // Event time
        "s": "BNBBTC",      // Symbol
        "t": 12345,         // Trade ID
        "p": "0.001",       // Price
        "q": "100",         // Quantity
        "T": 1672515782136, // Trade time
        "m": true,          // Is the buyer the market maker?
        "M": true           // Ignore
    }
*/


//This is a connection example to our own websocket server

/*"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function SocketTestPage() {
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Connected to socket!", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>Socket test page</div>;
}*/
