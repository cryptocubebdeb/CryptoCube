"use client";

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
}
