import { memo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "api/axios";
import {
  analyticsAllowed,
  clearAnalyticsSession,
  getAnalyticsSession,
  storeAnalyticsSession,
} from "utils/analytics";

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!analyticsAllowed()) return;

    let cancelled = false;

    const track = async () => {
      let analyticsSession = getAnalyticsSession();
      if (!analyticsSession) {
        const issued = await api({ url: "/analytics/session", method: "POST", timeout: 3000 });
        analyticsSession = storeAnalyticsSession(issued);
      }
      if (cancelled) return;

      let referrer;
      try {
        referrer = document.referrer ? new URL(document.referrer).origin : undefined;
      } catch {
        referrer = undefined;
      }

      await api({
        url: "/analytics/page-view",
        method: "POST",
        data: { path: location.pathname, referrer },
        headers: { "X-Analytics-Token": analyticsSession.token },
        timeout: 3000,
      });
    };

    track().catch((error) => {
      if (error?.response?.status === 401) clearAnalyticsSession();
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  return null;
}

export default memo(AnalyticsTracker);
