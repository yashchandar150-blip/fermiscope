import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../utils/format";

// Loads data from the API and tracks loading / error state.
// Usage:  const { data, loading, error, reload } = useFetch(() => getObservations(params), [params]);
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0); // ignores old responses when filters change quickly

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const res = await fetcher();
      if (current === requestId.current) setData(res.data);
    } catch (err) {
      if (current === requestId.current) setError(getErrorMessage(err));
    } finally {
      if (current === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
