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
    let meData: IInterviewMe | null = null;
    if (isAuthenticated) {
      const meRes = await callInterviewMe();
      meData = unwrapInterviewData(meRes) ?? null;
      setMe(meData);
    } else {
      setMe(null);
    }
    setLoading(false);
    const proActive = meData?.proActive ?? false;
    const freeLeft = meData?.freeSessionsLeft ?? 0;
    return {
      proActive,
      freeLeft,
      canStart: proActive || freeLeft > 0,
    };
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const freeLeft = isAuthenticated
    ? (me?.freeSessionsLeft ?? 0)
    : (config?.freeSessions ?? 5);
  const freeTotal = me?.freeSessionsTotal ?? config?.freeSessions ?? 5;
  const proActive = me?.proActive ?? false;
  const canStart = proActive || freeLeft > 0;

  return { config, me, loading, refresh, freeLeft, freeTotal, proActive, canStart };
}
