"use client";

import { useState, useEffect } from "react";

interface LogEntry {
  message: string;
  timestamp: number;
}

let logQueue: LogEntry[] = [];
let logListeners: ((logs: LogEntry[]) => void)[] = [];

// Fonction globale pour ajouter un log
export function debugLog(message: string) {
  const entry = {
    message,
    timestamp: Date.now(),
  };
  
  logQueue.push(entry);
  
  // Garder seulement les 20 derniers logs
  if (logQueue.length > 20) {
    logQueue = logQueue.slice(-20);
  }
  
  // Notifier tous les listeners
  logListeners.forEach(listener => listener([...logQueue]));
  
  // Aussi logger dans la console normale
  console.log(message);
}

export default function DebugLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Ajouter ce composant comme listener
    const listener = (newLogs: LogEntry[]) => {
      setLogs(newLogs);
    };
    
    logListeners.push(listener);
    setLogs([...logQueue]);
    
    return () => {
      logListeners = logListeners.filter(l => l !== listener);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-red-600 text-white rounded-full shadow-lg z-[9999] flex items-center justify-center text-xs font-bold"
      >
        DEBUG
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 max-h-96 bg-black/95 text-green-400 text-xs font-mono overflow-y-auto z-[9999] border-t-2 border-green-500">
      <div className="sticky top-0 bg-black/95 p-2 border-b border-green-500 flex justify-between items-center">
        <span className="font-bold text-green-300">🐛 DEBUG LOGS</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              logQueue = [];
              setLogs([]);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-3 py-1 bg-gray-700 text-white rounded text-xs font-bold"
          >
            Hide
          </button>
        </div>
      </div>
      <div className="p-2 space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Aucun log...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="border-b border-gray-800 pb-1">
              <span className="text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>{" "}
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

