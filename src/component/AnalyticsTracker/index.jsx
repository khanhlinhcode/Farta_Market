import { memo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "api/axios";
import { analyticsAllowed, getAnalyticsIdentifiers } from "utils/analytics";

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!analyticsAllowed()) return;

    const { visitorId, sessionId } = getAnalyticsIdentifiers();
    let referrer;
    try {
      referrer = document.referrer ? new URL(document.referrer).origin : undefined;
    } catch {
      referrer = undefined;
    }

    api({
      url: "/analytics/page-view",
      method: "POST",
      data: {
        visitor_id: visitorId,
        session_id: sessionId,
        path: location.pathname,
        referrer,
      },
      timeout: 3000,
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}

export default memo(AnalyticsTracker);
