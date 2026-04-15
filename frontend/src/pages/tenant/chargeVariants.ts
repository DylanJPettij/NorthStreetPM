import type { ChargeStatus, ChargeType } from "../../types";

// Status string constants
export const CHARGE_STATUS = {
  PAID: "PAID",
  UNPAID: "UNPAID",
  WAIVED: "WAIVED",
  DELETED: "DELETED",
  DISPUTE: "DISPUTE",
} as const;

// Type string constants
export const CHARGE_TYPE = {
  RENT: "RENT",
  LATE_FEE: "LATE FEE",
  UTILITY: "UTILITY",
  DAMAGE: "DAMAGE",
  OTHER: "OTHER",
} as const;

// Variant mappings
export const CHARGE_STATUS_VARIANTS: Record<
  ChargeStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  [CHARGE_STATUS.PAID]: "success",
  [CHARGE_STATUS.UNPAID]: "warning",
  [CHARGE_STATUS.WAIVED]: "neutral",
  [CHARGE_STATUS.DELETED]: "neutral",
  [CHARGE_STATUS.DISPUTE]: "danger",
};

export const CHARGE_TYPE_VARIANTS: Record<
  ChargeType,
  "info" | "danger" | "teal" | "neutral" | "warning"
> = {
  [CHARGE_TYPE.RENT]: "info",
  [CHARGE_TYPE.LATE_FEE]: "danger",
  [CHARGE_TYPE.UTILITY]: "teal",
  [CHARGE_TYPE.DAMAGE]: "warning",
  [CHARGE_TYPE.OTHER]: "neutral",
};

// Helper functions
export function chargeStatusVariant(
  status: ChargeStatus,
): "success" | "warning" | "danger" | "neutral" {
  return CHARGE_STATUS_VARIANTS[status];
}

export function chargeTypeVariant(
  type: ChargeType,
): "info" | "danger" | "teal" | "neutral" | "warning" {
  return CHARGE_TYPE_VARIANTS[type];
}
