// Simulated network delay so the UI behaves like a real API call.
// Replace the body of each function with `fetch('/api/...')` later.
export function simulateDelay(data, ms = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
