import type { Charge, ChargeStatus } from "../types";

const STATUS_PRIORITY: Record<ChargeStatus, number> = {
  PAID: 0,
  DELETED: 1,
  WAIVED: 2,
  UNPAID: 3,
  DISPUTE: 4,
};

function worstStatus(a: ChargeStatus, b: ChargeStatus): ChargeStatus {
  return STATUS_PRIORITY[a] >= STATUS_PRIORITY[b] ? a : b;
}

/**
 * Merges LATE FEE charges into their parent RENT charge (via parentChargeId).
 * Removes the late fee rows from the result. Unlinked late fees are kept as-is.
 */
export function mergeLateFees(charges: Charge[]): Charge[] {
  const mergedInto = new Set<string>(); // IDs of late fee charges that were merged

  const result = charges.map((charge) => {
    if (charge.chargeType !== "RENT") return charge;

    const linkedFees = charges.filter(
      (c) => c.chargeType === "LATE FEE" && c.parentChargeId === charge.id,
    );

    if (linkedFees.length === 0) return charge;

    linkedFees.forEach((fee) => mergedInto.add(fee.id));

    const totalAmount = linkedFees.reduce((sum, f) => sum + f.amount, charge.amount);
    const mergedStatus = linkedFees.reduce(
      (s, f) => worstStatus(s, f.status),
      charge.status,
    );

    return { ...charge, amount: totalAmount, status: mergedStatus };
  });

  return result.filter((c) => !mergedInto.has(c.id));
}
