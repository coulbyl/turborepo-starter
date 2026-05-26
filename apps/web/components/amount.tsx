"use client";

interface AmountProps {
  value: number | string;
  signed?: boolean;
  className?: string;
  currency?: string;
}

export function Amount({
  value,
  signed = false,
  className,
  currency = "USD",
}: AmountProps) {
  const n = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(n)) {
    return <span className={className}>—</span>;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

  const display = signed && n > 0 ? `+${formatter.format(n)}` : formatter.format(n);

  return <span className={`tabular-nums ${className ?? ""}`}>{display}</span>;
}
