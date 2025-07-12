import { useState, useEffect, useRef, useCallback } from "react";
import { Client, type Message, type StompSubscription } from "@stomp/stompjs";
import { type SimulationStateDTO, type SimulationDTO } from "@/lib/api-client";

export function useSimulationWebSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(
    null
  );
  const [simulationState, setSimulationState] =
    useState<SimulationStateDTO | null>(null);
  const [simulationInfo, setSimulationInfo] = useState<SimulationDTO | null>(
    null
  );
  const [availableSimulations, setAvailableSimulations] = useState<
    Record<string, SimulationDTO>
  >({});
  const [error, setError] = useState<string | null>(null);

  const stompClient = useRef<Client | null>(null);
  const subscriptions = useRef<Record<string, StompSubscription>>({});
  
  // Get environment variables
  const WS_URL = import.meta.env.VITE_WS_URL as string || "ws://localhost:8080/ws";

  // Initialize WebSocket connection
  useEffect(() => {
    console.log("Initializing WebSocket connection");

    // Determine WebSocket URL based on environment
    let wsUrl = WS_URL;
    
    // If in production and the URL doesn't start with ws://, construct it
    if (import.meta.env.PROD && !wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      wsUrl = `${protocol}${window.location.host}${wsUrl}`;
    }
    
    console.log("WebSocket URL:", wsUrl);
    
    const client = new Client({
      brokerURL: wsUrl,
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
      try {
        const simulationsSubscription = client.subscribe(
          "/topic/simulations",
          (message: Message) => {
            try {
              console.log("Received simulations list update", message.body);
              const data = JSON.parse(message.body) as Record<
                string,
                SimulationDTO
              >;
              setAvailableSimulations(data);
            } catch (err) {
              console.error("Error parsing simulations message:", err);
            }
          }
        );

        subscriptions.current["simulations"] = simulationsSubscription;

        // Request available simulations immediately after connection
        void client.publish({
          destination: "/app/simulations",
          body: "",
          headers: { "content-type": "application/json" },
        });
      } catch (subscribeErr) {
        console.error("Error subscribing to simulations topic:", subscribeErr);
        setError(`Error subscribing: ${String(subscribeErr)}`);
      }
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

    // Activate the client
    try {
      client.activate();
    } catch (activateErr) {
      console.error("Error activating WebSocket client:", activateErr);
      setError(`Connection error: ${String(activateErr)}`);
    }

    return () => {
      // Unsubscribe from all subscriptions
      Object.values(subscriptions.current).forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing:", err);
        }
      });

      // Clear subscriptions
      subscriptions.current = {};

      if (client.active) {
        try {
          void client.deactivate();
        } catch (deactivateErr) {
          console.error("Error deactivating WebSocket client:", deactivateErr);
        }
      }
    };
  }, []);

  // Subscribe to a specific simulation
  const subscribeToSimulation = useCallback(
    (simulationId: string) => {
      console.log("Subscribing to simulation:", simulationId);

      if (!stompClient.current || !isConnected) {
        setError("WebSocket not connected");
        return;
      }

      // Unsubscribe from current simulation if any
      if (currentSimulationId) {
        unsubscribeFromSimulation();
      }

      try {
        const basePath = `/topic/simulation/${simulationId}`;

        // Subscribe to basic simulation info
        const infoSubscription = stompClient.current.subscribe(
          basePath,
          (message: Message) => {
            try {
              const data = JSON.parse(message.body) as SimulationDTO;
              setSimulationInfo(data);
            } catch (err) {
              console.error("Error parsing simulation info message:", err);
            }
          }
        );

        // Subscribe to simulation state
        const stateSubscription = stompClient.current.subscribe(
          `${basePath}/state`,
          (message: Message) => {
            try {
              const data = JSON.parse(message.body) as SimulationStateDTO;
              setSimulationState(data);
            } catch (err) {
              console.error("Error parsing simulation state message:", err);
            }
          }
        );

        // Store subscription objects
        subscriptions.current[simulationId + "_info"] = infoSubscription;
        subscriptions.current[simulationId + "_state"] = stateSubscription;

        setCurrentSimulationId(simulationId);
      } catch (subscribeErr) {
        console.error("Error subscribing to simulation:", subscribeErr);
        setError(`Error subscribing to simulation: ${String(subscribeErr)}`);
      }
    },
    [currentSimulationId, isConnected]
  );

  // Unsubscribe from the current simulation
  const unsubscribeFromSimulation = useCallback(() => {
    console.log("Unsubscribing from simulation:", currentSimulationId);

    if (!currentSimulationId) {
      return;
    }

    const infoSubscriptionId = currentSimulationId + "_info";
    const stateSubscriptionId = currentSimulationId + "_state";

    try {
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
    } catch (unsubscribeErr) {
      console.error("Error unsubscribing from simulation:", unsubscribeErr);
      setError(`Error unsubscribing: ${String(unsubscribeErr)}`);
      // Still reset the state even if there's an error
      setSimulationState(null);
      setSimulationInfo(null);
      setCurrentSimulationId(null);
    }
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
