export const localizedValue = (item, field, language, fallback = "") => {
  const locale = String(language || "vi").startsWith("en") ? "en" : "vi";
  return item?.[`${field}_${locale}`] || item?.[`${field}_${locale === "vi" ? "en" : "vi"}`] || fallback;
};

export const isExternalUrl = (value = "") => /^https:\/\//i.test(value);
