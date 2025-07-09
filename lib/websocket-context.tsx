"use client";

import { createContext, ReactNode, useContext } from "react";
import { useSimulationWebSocket } from "@/hooks/use-simulation-websocket";

type WebSocketContextType = ReturnType<typeof useSimulationWebSocket>;

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const websocketValue = useSimulationWebSocket();

  return (
    <WebSocketContext.Provider value={websocketValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }

  return context;
}
