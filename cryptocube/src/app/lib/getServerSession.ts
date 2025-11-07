// lib/get-server-session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export function getAuthSession() {
  return getServerSession(authOptions);
}
