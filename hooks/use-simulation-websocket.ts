import { useState, useEffect, useRef, useCallback } from "react";
import { Client, Message, StompSubscription } from "@stomp/stompjs";
import { SimulationStateDTO, SimulationDTO } from "@/lib/api-client";

export function useSimulationWebSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(null);
  const [simulationState, setSimulationState] = useState<SimulationStateDTO | null>(null);
  const [simulationInfo, setSimulationInfo] = useState<SimulationDTO | null>(null);
  const [availableSimulations, setAvailableSimulations] = useState<Record<string, SimulationDTO>>({});
  const [error, setError] = useState<string | null>(null);
  
  const stompClient = useRef<Client | null>(null);
  const subscriptions = useRef<Record<string, StompSubscription>>({});
  
  // Initialize WebSocket connection
  useEffect(() => {
    console.log("Initializing WebSocket connection");
    
    const client = new Client({
      brokerURL: `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/^http/, "ws") || "ws://localhost:8080"}/ws`,
      debug: (str) => {
        console.debug(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setError(null);
      
      // Subscribe to the simulations list
      const simulationsSubscription = client.subscribe("/topic/simulations", (message: Message) => {
        try {
          console.log("Received simulations list update", message.body);
          const data = JSON.parse(message.body) as Record<string, SimulationDTO>;
          setAvailableSimulations(data);
        } catch (err) {
          console.error("Error parsing simulations message:", err);
        }
      });
      
      subscriptions.current["simulations"] = simulationsSubscription;
      
      // Request available simulations immediately after connection
      client.publish({
        destination: "/app/simulations",
        body: "",
        headers: { 'content-type': 'application/json' }
      });
    };

    client.onStompError = (frame) => {
      console.error("WebSocket error:", frame);
      setError(`WebSocket error: ${frame.headers.message}`);
      setIsConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log("WebSocket closed");
      setIsConnected(false);
    };

    stompClient.current = client;
    client.activate();

    return () => {
      // Unsubscribe from all subscriptions
      Object.values(subscriptions.current).forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing:", err);
        }
      });
      
      if (client.connected) {
        client.deactivate();
      }
    };
  }, []);

  // Subscribe to a specific simulation
  const subscribeToSimulation = useCallback((simulationId: string) => {
    console.log("Subscribing to simulation:", simulationId);
    
    if (!stompClient.current || !isConnected) {
      setError("WebSocket not connected");
      return;
    }

    // Unsubscribe from current simulation if any
    if (currentSimulationId) {
      unsubscribeFromSimulation();
    }

    const basePath = `/topic/simulation/${simulationId}`;
    
    // Subscribe to basic simulation info
    const infoSubscription = stompClient.current.subscribe(basePath, (message: Message) => {
      try {
        const data = JSON.parse(message.body) as SimulationDTO;
        setSimulationInfo(data);
      } catch (err) {
        console.error("Error parsing simulation info message:", err);
      }
    });

    // Subscribe to simulation state
    const stateSubscription = stompClient.current.subscribe(`${basePath}/state`, (message: Message) => {
      try {
        const data = JSON.parse(message.body) as SimulationStateDTO;
        setSimulationState(data);
      } catch (err) {
        console.error("Error parsing simulation state message:", err);
      }
    });

    // Store subscription objects
    subscriptions.current[simulationId + "_info"] = infoSubscription;
    subscriptions.current[simulationId + "_state"] = stateSubscription;
    
    setCurrentSimulationId(simulationId);
  }, [currentSimulationId, isConnected]);

  // Unsubscribe from the current simulation
  const unsubscribeFromSimulation = useCallback(() => {
    console.log("Unsubscribing from simulation:", currentSimulationId);
    
    if (!currentSimulationId) {
      return;
    }

    const infoSubscriptionId = currentSimulationId + "_info";
    const stateSubscriptionId = currentSimulationId + "_state";
    
    if (subscriptions.current[infoSubscriptionId]) {
      subscriptions.current[infoSubscriptionId].unsubscribe();
      delete subscriptions.current[infoSubscriptionId];
    }
    
    if (subscriptions.current[stateSubscriptionId]) {
      subscriptions.current[stateSubscriptionId].unsubscribe();
      delete subscriptions.current[stateSubscriptionId];
    }

    setSimulationState(null);
    setSimulationInfo(null);
    setCurrentSimulationId(null);
  }, [currentSimulationId]);

  return {
    isConnected,
    currentSimulationId,
    simulationState,
    simulationInfo,
    availableSimulations,
    error,
    subscribeToSimulation,
    unsubscribeFromSimulation,
  };
} 