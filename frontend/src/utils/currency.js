export function formatINR(value) {
  const num =
    typeof value === "number"
      ? value
      : value === null || value === undefined || value === ""
        ? NaN
        : Number(String(value).replace(/[,₹\s]/g, ""));

  if (!Number.isFinite(num)) return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

