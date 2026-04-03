import { useState, useCallback } from 'react';
import { Session } from '../types';
import { apiService } from '../services';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.post('/api/sessions', {});
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const data = await apiService.get(`/api/sessions/${sessionId}`);
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
    } finally {
      setLoading(false);
    }
  }, []);

  return { session, loading, error, createSession, getSession };
};
