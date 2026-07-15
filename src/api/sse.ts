import { apiUrl, getToken } from "./client";

// Native EventSource doesn't support custom headers, so the session token
// (when present) is passed as a query param; the mock server and backend
// both accept `?token=` as a fallback to the Authorization header for SSE.
export function connectStream<T>(
  path: string,
  onEvent: (data: T) => void,
  onError?: (err: Event) => void,
): () => void {
  const token = getToken();
  const url = apiUrl(path, token ? { token } : undefined);
  const source = new EventSource(url);

  source.onmessage = (event) => {
    try {
      onEvent(JSON.parse(event.data) as T);
    } catch {
      // ignore malformed event
    }
  };

  if (onError) source.onerror = onError;

  return () => source.close();
}
