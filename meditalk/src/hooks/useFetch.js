import { useEffect, useState, useCallback } from "react";

// Generic data-loading hook that manages loading / error / data states.
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((res) => {
        if (!active) return;
        const payload = res?.data !== undefined ? res.data : res;
        setData(payload);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Something went wrong.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load, setData };
}
