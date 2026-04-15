import { useMemo, useState } from "react";
import {
  format,
  subDays,
  startOfMonth,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import { useOwnerData } from "../../hooks/useOwnerData";
import {
  allTenants,
  allTenancies,
  allUnits,
  allProperties,
} from "../../data/stubs";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import DateRangePicker from "../../components/ui/DateRangePicker";
import type { ChargeType, PaymentMethod } from "../../types";
import {
  PAYMENT_COPY,
  PAYMENT_FORMAT,
  PAYMENT_METHOD_VARIANTS,
} from "./constants";

const usd = (n: number) =>
  new Intl.NumberFormat(PAYMENT_FORMAT.locale, {
    style: "currency",
    currency: PAYMENT_FORMAT.currency,
  }).format(n);

function methodVariant(method: PaymentMethod): "info" | "teal" | "neutral" {
  return PAYMENT_METHOD_VARIANTS[method];
}

const CHARGE_TYPE_OPTIONS: ChargeType[] = [
  "RENT",
  "LATE FEE",
  "UTILITY",
  "DAMAGE",
  "OTHER",
];

const SELECT_CLS =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500";

type RangePreset = "week" | "30d" | "mtd" | "ytd" | "365d" | "lastyear" | "custom";

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "week", label: "Past week" },
  { key: "30d", label: "Past 30 days" },
  { key: "mtd", label: "Month to date" },
  { key: "ytd", label: "Year to date" },
  { key: "365d", label: "Past year" },
  { key: "lastyear", label: "Last year" },
  { key: "custom", label: "Custom" },
];

function getPresetDates(preset: RangePreset): { from: Date; to: Date } | null {
  if (preset === "custom") return null;
  const today = new Date();
  switch (preset) {
    case "week":     return { from: subDays(today, 7), to: today };
    case "30d":      return { from: subDays(today, 30), to: today };
    case "mtd":      return { from: startOfMonth(today), to: today };
    case "ytd":      return { from: startOfYear(today), to: today };
    case "365d":     return { from: subDays(today, 365), to: today };
    case "lastyear": return { from: startOfYear(subYears(today, 1)), to: endOfYear(subYears(today, 1)) };
  }
}

export default function PaymentsList() {
  const { payments, charges } = useOwnerData();

  const [tenantFilter, setTenantFilter] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [chargeTypeFilter, setChargeTypeFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [rangePreset, setRangePreset] = useState<RangePreset>("30d");
  const [customFrom, setCustomFrom] = useState<Date>(() => subDays(new Date(), 30));
  const [customTo, setCustomTo] = useState<Date>(() => new Date());
  const [pickerOpen, setPickerOpen] = useState(false);

  function handlePresetChange(value: RangePreset) {
    setRangePreset(value);
    if (value === "custom") setPickerOpen(true);
  }

  const activeDates = useMemo(() => {
    const preset = getPresetDates(rangePreset);
    return preset ?? { from: customFrom, to: customTo };
  }, [rangePreset, customFrom, customTo]);

  const enrichedPayments = useMemo(() => {
    return payments.map((payment) => {
      const charge = charges.find((c) => c.id === payment.chargeId);
      const tenancy = charge
        ? allTenancies.find((t) => t.id === charge.tenancyId)
        : null;
      const tenant = tenancy
        ? allTenants.find((t) => t.id === tenancy.tenantId)
        : null;
      const unit = tenancy
        ? allUnits.find((u) => u.id === tenancy.unitId)
        : null;
      const property = unit
        ? allProperties.find((p) => p.id === unit.propertyId)
        : null;
      return {
        ...payment,
        tenantName: tenant
          ? `${tenant.firstName} ${tenant.lastName}`
          : PAYMENT_COPY.fallbackValue,
        propertyName: property?.name ?? PAYMENT_COPY.fallbackValue,
        chargeType: charge?.chargeType ?? PAYMENT_COPY.fallbackValue,
      };
    });
  }, [payments, charges]);

  const tenantOptions = useMemo(
    () =>
      [...new Set(enrichedPayments.map((p) => p.tenantName))]
        .filter((n) => n !== PAYMENT_COPY.fallbackValue)
        .sort(),
    [enrichedPayments],
  );

  const propertyOptions = useMemo(
    () =>
      [...new Set(enrichedPayments.map((p) => p.propertyName))]
        .filter((n) => n !== PAYMENT_COPY.fallbackValue)
        .sort(),
    [enrichedPayments],
  );

  const filteredPayments = useMemo(() => {
    const from = new Date(activeDates.from); from.setHours(0, 0, 0, 0);
    const to = new Date(activeDates.to); to.setHours(23, 59, 59, 999);
    return enrichedPayments.filter((p) => {
      if (tenantFilter && p.tenantName !== tenantFilter) return false;
      if (propertyFilter && p.propertyName !== propertyFilter) return false;
      if (chargeTypeFilter && p.chargeType !== chargeTypeFilter) return false;
      if (minAmount && p.amountPaid < parseFloat(minAmount)) return false;
      if (maxAmount && p.amountPaid > parseFloat(maxAmount)) return false;
      const paidAt = new Date(p.paidAt);
      if (paidAt < from || paidAt > to) return false;
      return true;
    });
  }, [enrichedPayments, tenantFilter, propertyFilter, chargeTypeFilter, minAmount, maxAmount, activeDates]);

  const hasFilters =
    !!(tenantFilter || propertyFilter || chargeTypeFilter || minAmount || maxAmount);

  const clearFilters = () => {
    setTenantFilter("");
    setPropertyFilter("");
    setChargeTypeFilter("");
    setMinAmount("");
    setMaxAmount("");
    setRangePreset("30d");
  };

  const collectedTotal = filteredPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const collectedLabel = `Collected ${format(activeDates.from, "MMM d, yyyy")} – ${format(activeDates.to, "MMM d, yyyy")}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {PAYMENT_COPY.pageTitle}
      </h1>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 inline-block min-w-56">
        <p className="text-sm text-gray-500">{collectedLabel}</p>
        <p className="text-2xl font-bold text-green-700 mt-1">
          {usd(collectedTotal)}
        </p>
      </div>

      {/* Table */}
      <Card>
        {/* Filters */}
        <div className="-mx-6 -mt-6 px-6 pt-4 pb-4 border-b border-gray-100 mb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date Range
              </label>
              <select
                value={rangePreset}
                onChange={(e) => handlePresetChange(e.target.value as RangePreset)}
                className={SELECT_CLS}
              >
                {PRESETS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            {rangePreset === "custom" && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="self-end mb-0.5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit custom date range"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            {/* Tenant */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tenant
              </label>
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className={SELECT_CLS}
              >
                <option value="">All tenants</option>
                {tenantOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Property */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Property
              </label>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className={SELECT_CLS}
              >
                <option value="">All properties</option>
                {propertyOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Charge Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Charge Type
              </label>
              <select
                value={chargeTypeFilter}
                onChange={(e) => setChargeTypeFilter(e.target.value)}
                className={SELECT_CLS}
              >
                <option value="">All types</option>
                {CHARGE_TYPE_OPTIONS.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Amount range */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Amount
              </label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-24 border border-gray-300 rounded-lg pl-6 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <span className="text-gray-400 text-sm">–</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-24 border border-gray-300 rounded-lg pl-6 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear filters
              </button>
            )}

            {/* Result count */}
            <span className="text-sm text-gray-400 ml-auto self-center">
              {filteredPayments.length} of {enrichedPayments.length} payments
            </span>
          </div>
        </div>
        {rangePreset === "custom" && (
          <DateRangePicker
            from={customFrom}
            to={customTo}
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onChange={(from, to) => { setCustomFrom(from); setCustomTo(to); }}
          />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {PAYMENT_COPY.tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    {hasFilters ? "No payments match the current filters." : PAYMENT_COPY.emptyState}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {payment.tenantName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {payment.propertyName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {payment.chargeType}
                    </td>
                    <td className="px-4 py-3 font-medium text-green-700">
                      {usd(payment.amountPaid)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={methodVariant(payment.method)}>
                        {payment.method}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(
                        new Date(payment.paidAt),
                        PAYMENT_FORMAT.dateTime,
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
