// worker/logger.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// logs folder at project root: /cryptocube/logs
const LOG_DIR = path.join(__dirname, "..", "logs");
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function appendLine(fileName, payload) {
    const fullPath = path.join(LOG_DIR, fileName);
    const line = JSON.stringify({
        ts: new Date().toISOString(),
        ...payload,
    });
    fs.appendFile(fullPath, line + "\n", (err) => {
        if (err) {
            console.error("[LOGGER] Failed writing log:", err);
        }
    });
}

export function logOrderEvent(eventType, data) {
    appendLine("orders.log", { eventType, ...data });
}

export function logWorkerEvent(eventType, data) {
    appendLine("workers.log", { eventType, ...data });
}

export function logErrorEvent(where, error, extra = {}) {
    appendLine("errors.log", {
        where,
        message: error?.message || String(error),
        ...extra,
    });
}
