import { useCallback, useEffect, useState } from 'react';
import type { IInterviewConfig, IInterviewMe } from '@/types/interview';
import { callInterviewConfig, callInterviewMe, unwrapInterviewData } from '@/utils/interview-api';

export function useInterviewProfile(isAuthenticated: boolean) {
  const [config, setConfig] = useState<IInterviewConfig | null>(null);
  const [me, setMe] = useState<IInterviewMe | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const cfgRes = await callInterviewConfig();
    const cfg = unwrapInterviewData(cfgRes);
    setConfig(cfg ?? null);
    if (isAuthenticated) {
      const meRes = await callInterviewMe();
      setMe(unwrapInterviewData(meRes) ?? null);
    } else {
      setMe(null);
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const freeLeft = me?.freeSessionsLeft ?? config?.freeSessions ?? 5;
  const freeTotal = me?.freeSessionsTotal ?? config?.freeSessions ?? 5;
  const proActive = me?.proActive ?? false;
  const canStart = proActive || freeLeft > 0;

  return { config, me, loading, refresh, freeLeft, freeTotal, proActive, canStart };
}
