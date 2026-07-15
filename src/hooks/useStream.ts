import { useEffect, useState } from "react";
import { connectStream } from "@/api";
import type { AlertEvent, SpendEvent } from "@/types";

const MAX_BUFFER = 200;

function useEventBuffer<T>(path: string) {
  const [events, setEvents] = useState<T[]>([]);

  useEffect(() => {
    const disconnect = connectStream<T>(path, (event) => {
      setEvents((prev) => [event, ...prev].slice(0, MAX_BUFFER));
    });
    return disconnect;
  }, [path]);

  return events;
}

export function useSpendStream() {
  return useEventBuffer<SpendEvent>("/v1/stream/spend");
}

export function useAlertStream() {
  return useEventBuffer<AlertEvent>("/v1/stream/alerts");
}
