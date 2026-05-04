import { useState, useEffect, useCallback } from 'react';
import { getLatestFault, getAllFaults } from '../api/faultApi';

export function useFaultData(intervalMs = 4000) {
  const [latestFault, setLatestFault] = useState(null);
  const [faultHistory, setFaultHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        getLatestFault().catch(() => ({ data: null })),
        getAllFaults(),
      ]);
      setLatestFault(latestRes.data);
      setFaultHistory(historyRes.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [fetchData, intervalMs]);

  return { latestFault, faultHistory, loading, error, refetch: fetchData };
}
