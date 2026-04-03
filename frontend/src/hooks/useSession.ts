import { useState, useCallback } from 'react';
import { sessionsApi } from '../services';

export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const data = await sessionsApi.get(sessionId);
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
    } finally {
      setLoading(false);
    }
  }, []);

  return { session, loading, error, getSession };
};
