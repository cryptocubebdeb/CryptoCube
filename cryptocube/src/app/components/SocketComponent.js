// components/SocketClient.js
"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function SocketClient() {
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Connected!", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>Socket Ready</div>;
}


