import type { ChargeStatus } from "../../types";

export const OWNER_DASHBOARD_COPY = {
  pageTitle: "Dashboard",
  stats: {
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
    expiring90d: "Expiring (90d)",
    monthToMonth: "Month-to-Month",
    ofPrefix: "of",
  },
  cards: {
    paymentsLast12Months: "Payments Collected — Last 12 Months",
    collectionRateThisMonth: "Collection Rate — This Month",
    recentCharges: "Recent Charges",
  },
  collection: {
    collectedLowercase: "collected",
    collected: "Collected",
    outstanding: "Outstanding",
    noCharges: "No charges",
  },
  table: {
    tenant: "Tenant",
    property: "Property",
    type: "Type",
    amount: "Amount",
    dueDate: "Due Date",
    status: "Status",
  },
} as const;

export const OWNER_DASHBOARD_FORMAT = {
  locale: "en-US",
  currency: "USD",
  monthLabel: {
    month: "short",
    year: "2-digit",
  } as const,
  dueDate: "MMM d, yyyy",
  axisCurrencySymbol: "$",
  axisThousandsSuffix: "k",
} as const;

export const OWNER_DASHBOARD_STATUS = {
  unpaid: "UNPAID",
  paid: "PAID",
  waived: "WAIVED",
  dispute: "DISPUTE",
  deleted: "DELETED",
  activeTenancy: "ACTIVE",
  fixedLease: "FIXED",
  monthToMonthLease: "MONTH TO MONTH",
} as const;

export const CHARGE_STATUS_VARIANTS: Record<
  ChargeStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  PAID: "success",
  UNPAID: "warning",
  WAIVED: "neutral",
  DELETED: "neutral",
  DISPUTE: "danger",
};

export const OWNER_DASHBOARD_NUMBERS = {
  date: {
    daysToExpiryWindow: 90,
    hoursPerDay: 24,
    minutesPerHour: 60,
    secondsPerMinute: 60,
    millisecondsPerSecond: 1000,
  },
  payments: {
    monthsToDisplay: 12,
    monthOffsetBase: 11,
    firstDayOfMonth: 1,
    monthPadLength: 2,
    monthPadFill: "0",
  },
  recentCharges: {
    start: 0,
    limit: 8,
  },
  percentage: {
    full: 100,
  },
  charts: {
    bar: {
      height: 220,
      margin: { top: 4, right: 8, left: 0, bottom: 0 },
      tickFontSize: 11,
      yAxisWidth: 40,
      currencyScaleDivisor: 1000,
      decimalPlaces: 0,
      radius: [4, 4, 0, 0] as [number, number, number, number],
    },
    pie: {
      width: 240,
      height: 124,
      cx: 120,
      cy: 120,
      startAngle: 180,
      endAngle: 0,
      outerRadius: 110,
      innerRadius: 62,
      defaultNoChargeValue: 1,
    },
  },
} as const;
