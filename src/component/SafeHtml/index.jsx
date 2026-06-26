import DOMPurify from "dompurify";
import { memo, useMemo } from "react";

const SafeHtml = ({ html = "", className }) => {
  const sanitizedHtml = useMemo(
    () =>
      DOMPurify.sanitize(String(html), {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
        FORBID_ATTR: ["style"],
      }),
    [html]
  );

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default memo(SafeHtml);
