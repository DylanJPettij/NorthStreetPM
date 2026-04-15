import { useMemo } from "react";
import { format } from "date-fns";
import { useAuthStore } from "../../store/authStore";
import { allTenancies, allCharges } from "../../data/stubs";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { mergeLateFees } from "../../utils/charges";
import {
  MY_CHARGES_COPY,
  MY_CHARGES_FORMAT,
  MY_CHARGES_STYLES,
} from "./constants";
import { chargeStatusVariant, chargeTypeVariant } from "./chargeVariants";
import type { ChargeStatus, ChargeType } from "../../types";

const usd = (n: number) =>
  new Intl.NumberFormat(MY_CHARGES_FORMAT.locale, {
    style: "currency",
    currency: MY_CHARGES_FORMAT.currency,
  }).format(n);

export default function PaymentHistory() {
  const { user } = useAuthStore();

  const myTenancies = useMemo(
    () => allTenancies.filter((t) => t.tenantId === user?.id),
    [user],
  );

  const myCharges = useMemo(() => {
    const tenancyIds = myTenancies.map((t) => t.id);
    return mergeLateFees(
      allCharges.filter((c) => tenancyIds.includes(c.tenancyId)),
    ).sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
    );
  }, [myTenancies]);

  const pendingCharges = myCharges.filter((c) => c.status === "UNPAID");
  const totalOwed = pendingCharges.reduce((sum, c) => sum + c.amount, 0);
  const today = new Date();
  const overdueAmount = pendingCharges
    .filter((c) => new Date(c.dueDate) < today)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className={MY_CHARGES_STYLES.layout.container}>
      <h1 className={MY_CHARGES_STYLES.layout.pageTitle}>
        {MY_CHARGES_COPY.pageTitle}
      </h1>

      {/* Summary */}
      <div className={MY_CHARGES_STYLES.layout.summaryGrid}>
        <div
          className={`${MY_CHARGES_STYLES.summary.cardBase} ${
            overdueAmount > 0
              ? MY_CHARGES_STYLES.summary.cardOverdue
              : totalOwed > 0
                ? MY_CHARGES_STYLES.summary.cardOwed
                : MY_CHARGES_STYLES.summary.cardPaid
          }`}
        >
          <p className={MY_CHARGES_STYLES.summary.labelText}>
            {overdueAmount > 0
              ? MY_CHARGES_COPY.summarySection.overdueAmount
              : MY_CHARGES_COPY.summarySection.totalAmountOwed}
          </p>
          <p
            className={`${MY_CHARGES_STYLES.summary.amountTextBase} ${
              overdueAmount > 0
                ? MY_CHARGES_STYLES.summary.amountOverdue
                : totalOwed > 0
                  ? MY_CHARGES_STYLES.summary.amountOwed
                  : MY_CHARGES_STYLES.summary.amountPaid
            }`}
          >
            {usd(overdueAmount > 0 ? overdueAmount : totalOwed)}
          </p>
        </div>
      </div>

      {/* Charges table */}
      <Card title={MY_CHARGES_COPY.cardTitle}>
        <div className={MY_CHARGES_STYLES.table.container}>
          <table className={MY_CHARGES_STYLES.table.table}>
            <thead className={MY_CHARGES_STYLES.table.thead}>
              <tr>
                {MY_CHARGES_COPY.tableHeaders.map((h) => (
                  <th key={h} className={MY_CHARGES_STYLES.table.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={MY_CHARGES_STYLES.table.tbody}>
              {myCharges.length === 0 ? (
                <tr>
                  <td colSpan={5} className={MY_CHARGES_STYLES.table.emptyRow}>
                    {MY_CHARGES_COPY.emptyState}
                  </td>
                </tr>
              ) : (
                myCharges.map((charge) => {
                  const isOverdue =
                    charge.status === "UNPAID" &&
                    new Date(charge.dueDate) < today;
                  return (
                    <tr
                      key={charge.id}
                      className={`${
                        MY_CHARGES_STYLES.table.rowBase
                      } ${isOverdue ? MY_CHARGES_STYLES.table.rowOverdue : ""}`}
                    >
                      <td className={MY_CHARGES_STYLES.table.td}>
                        <Badge variant={chargeTypeVariant(charge.chargeType)}>
                          {charge.chargeType}
                        </Badge>
                      </td>
                      <td className={MY_CHARGES_STYLES.table.tdGray}>
                        {charge.description}
                      </td>
                      <td className={MY_CHARGES_STYLES.table.tdBold}>
                        {usd(charge.amount)}
                      </td>
                      <td
                        className={`${MY_CHARGES_STYLES.table.tdDateBase} ${
                          isOverdue
                            ? MY_CHARGES_STYLES.table.tdDateOverdue
                            : MY_CHARGES_STYLES.table.tdDateNormal
                        }`}
                      >
                        {format(
                          new Date(charge.dueDate),
                          MY_CHARGES_FORMAT.dateFormat,
                        )}
                        {isOverdue && (
                          <span
                            className={MY_CHARGES_STYLES.table.overdueIndicator}
                          >
                            {MY_CHARGES_COPY.overdueLabel}
                          </span>
                        )}
                      </td>
                      <td className={MY_CHARGES_STYLES.table.td}>
                        <Badge variant={chargeStatusVariant(charge.status)}>
                          {charge.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
