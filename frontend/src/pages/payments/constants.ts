import type { PaymentMethod } from "../../types";

export const PAYMENT_COPY = {
  pageTitle: "Payments",
  collectedThisMonth: "Collected This Month",
  emptyState: "No payments found.",
  fallbackValue: "—",
  tableHeaders: [
    "Tenant",
    "Property",
    "Charge Type",
    "Amount",
    "Method",
    "Paid At",
  ],
} as const;

export const PAYMENT_FORMAT = {
  locale: "en-US",
  currency: "USD",
  dateTime: "MMM d, yyyy h:mm a",
} as const;

export const PAYMENT_METHOD_VARIANTS: Record<
  PaymentMethod,
  "info" | "teal" | "neutral"
> = {
  ACH: "info",
  CARD: "teal",
  MANUAL: "neutral",
};
