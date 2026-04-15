import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useOwnerData } from "../../hooks/useOwnerData";
import { allTenants, allUnits, allProperties } from "../../data/stubs";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import type { ChargeStatus } from "../../types";
import {
  CHARGE_STATUS_VARIANTS,
  OWNER_DASHBOARD_COPY,
  OWNER_DASHBOARD_FORMAT,
  OWNER_DASHBOARD_NUMBERS,
  OWNER_DASHBOARD_STATUS,
} from "./constants";

const usd = (n: number) =>
  new Intl.NumberFormat(OWNER_DASHBOARD_FORMAT.locale, {
    style: "currency",
    currency: OWNER_DASHBOARD_FORMAT.currency,
  }).format(n);

function chargeStatusVariant(
  status: ChargeStatus,
): "success" | "warning" | "danger" | "neutral" {
  return CHARGE_STATUS_VARIANTS[status];
}

type BarPayload = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

function BarTooltip({ active, payload, label }: BarPayload) {
  if (active && payload?.length) {
    return (
      <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-sm border border-gray-100">
        <p className="font-medium text-gray-700 mb-0.5">{label}</p>
        <p className="text-blue-600 font-semibold">{usd(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function OwnerDashboard() {
  const { properties, units, tenants, tenancies, charges, payments } =
    useOwnerData();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const pendingCharges = charges.filter(
      (c) => c.status === OWNER_DASHBOARD_STATUS.unpaid,
    );
    const pendingTotal = pendingCharges.reduce((sum, c) => sum + c.amount, 0);
    const paidTotal = charges
      .filter((c) => c.status === OWNER_DASHBOARD_STATUS.paid)
      .reduce((sum, c) => sum + c.amount, 0);

    const today = new Date();
    const overdueAmount = pendingCharges
      .filter((c) => new Date(c.dueDate) < today)
      .reduce((sum, c) => sum + c.amount, 0);

    const in90 = new Date(
      today.getTime() +
        OWNER_DASHBOARD_NUMBERS.date.daysToExpiryWindow *
          OWNER_DASHBOARD_NUMBERS.date.hoursPerDay *
          OWNER_DASHBOARD_NUMBERS.date.minutesPerHour *
          OWNER_DASHBOARD_NUMBERS.date.secondsPerMinute *
          OWNER_DASHBOARD_NUMBERS.date.millisecondsPerSecond,
    );
    const activeTenancies = tenancies.filter(
      (t) => t.status === OWNER_DASHBOARD_STATUS.activeTenancy,
    );
    const expiringSoon = activeTenancies.filter(
      (t) =>
        t.leaseType === OWNER_DASHBOARD_STATUS.fixedLease &&
        t.endDate &&
        new Date(t.endDate) <= in90 &&
        new Date(t.endDate) >= today,
    ).length;

    return {
      paidTotal,
      pendingTotal,
      overdueAmount,
      expiringSoon,
    };
  }, [units, tenants, charges, tenancies]);

  // Bar chart — payments collected per month over past 12 months
  const paymentsByMonth = useMemo(() => {
    const now = new Date();
    return Array.from(
      { length: OWNER_DASHBOARD_NUMBERS.payments.monthsToDisplay },
      (_, i) => {
        const d = new Date(
          now.getFullYear(),
          now.getMonth() -
            (OWNER_DASHBOARD_NUMBERS.payments.monthOffsetBase - i),
          OWNER_DASHBOARD_NUMBERS.payments.firstDayOfMonth,
        );
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(OWNER_DASHBOARD_NUMBERS.payments.monthPadLength, OWNER_DASHBOARD_NUMBERS.payments.monthPadFill)}`;
        const label = d.toLocaleString(
          OWNER_DASHBOARD_FORMAT.locale,
          OWNER_DASHBOARD_FORMAT.monthLabel,
        );
        const total = payments
          .filter((p) => p.paidAt.startsWith(key))
          .reduce((sum, p) => sum + p.amountPaid, 0);
        return { month: label, total };
      },
    );
  }, [payments]);

  // Half-pie chart — current month charges: paid vs outstanding
  const currentMonthPie = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(OWNER_DASHBOARD_NUMBERS.payments.monthPadLength, OWNER_DASHBOARD_NUMBERS.payments.monthPadFill)}`;
    const monthCharges = charges.filter((c) => c.dueDate.startsWith(prefix));
    const paid = monthCharges
      .filter((c) => c.status === OWNER_DASHBOARD_STATUS.paid)
      .reduce((s, c) => s + c.amount, 0);
    const outstanding = monthCharges
      .filter(
        (c) =>
          c.status !== OWNER_DASHBOARD_STATUS.paid &&
          c.status !== OWNER_DASHBOARD_STATUS.waived,
      )
      .reduce((s, c) => s + c.amount, 0);
    const total = paid + outstanding;
    const rate =
      total > 0
        ? Math.round((paid / total) * OWNER_DASHBOARD_NUMBERS.percentage.full)
        : 0;
    return {
      paid,
      outstanding,
      total,
      rate,
      data:
        total === 0
          ? [
              {
                name: OWNER_DASHBOARD_COPY.collection.noCharges,
                value: OWNER_DASHBOARD_NUMBERS.charts.pie.defaultNoChargeValue,
              },
            ]
          : [
              { name: OWNER_DASHBOARD_COPY.collection.collected, value: paid },
              {
                name: OWNER_DASHBOARD_COPY.collection.outstanding,
                value: outstanding,
              },
            ],
      colors: total === 0 ? ["#e5e7eb"] : ["#22c55e", "#f97316"],
    };
  }, [charges]);

  // Recent charges (last 8)
  const recentCharges = useMemo(() => {
    return [...charges]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(
        OWNER_DASHBOARD_NUMBERS.recentCharges.start,
        OWNER_DASHBOARD_NUMBERS.recentCharges.limit,
      )
      .map((charge) => {
        const tenancy = tenancies.find((t) => t.id === charge.tenancyId);
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
          id: charge.id,
          tenantId: tenant?.id ?? null,
          tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : "—",
          propertyName: property?.name ?? "—",
          amount: charge.amount,
          dueDate: charge.dueDate,
          status: charge.status,
          chargeType: charge.chargeType,
        };
      });
  }, [charges, tenancies]);

  type ChargeRow = {
    id: string;
    tenantId: string | null;
    tenantName: string;
    propertyName: string;
    amount: number;
    dueDate: string;
    status: ChargeStatus;
    chargeType: string;
  };

  const chargeColumns = [
    { key: "tenantName", label: OWNER_DASHBOARD_COPY.table.tenant },
    { key: "propertyName", label: OWNER_DASHBOARD_COPY.table.property },
    { key: "chargeType", label: OWNER_DASHBOARD_COPY.table.type },
    {
      key: "amount",
      label: OWNER_DASHBOARD_COPY.table.amount,
      render: (row: ChargeRow) => usd(row.amount),
    },
    {
      key: "dueDate",
      label: OWNER_DASHBOARD_COPY.table.dueDate,
      render: (row: ChargeRow) =>
        format(new Date(row.dueDate), OWNER_DASHBOARD_FORMAT.dueDate),
    },
    {
      key: "status",
      label: OWNER_DASHBOARD_COPY.table.status,
      render: (row: ChargeRow) => (
        <Badge variant={chargeStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {OWNER_DASHBOARD_COPY.pageTitle}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard
          label={OWNER_DASHBOARD_COPY.stats.paid}
          value={usd(stats.paidTotal)}
          color="teal"
        />
        <StatCard
          label={OWNER_DASHBOARD_COPY.stats.pending}
          value={usd(stats.pendingTotal)}
          color="yellow"
        />
        <StatCard
          label={OWNER_DASHBOARD_COPY.stats.overdue}
          value={stats.overdueAmount > 0 ? usd(stats.overdueAmount) : "—"}
          color="red"
        />
        <StatCard
          label={OWNER_DASHBOARD_COPY.stats.expiring90d}
          value={stats.expiringSoon}
          color="orange"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card
          title={OWNER_DASHBOARD_COPY.cards.paymentsLast12Months}
          className="lg:col-span-2"
        >
          <ResponsiveContainer
            width="100%"
            height={OWNER_DASHBOARD_NUMBERS.charts.bar.height}
          >
            <BarChart
              data={paymentsByMonth}
              margin={OWNER_DASHBOARD_NUMBERS.charts.bar.margin}
            >
              <XAxis
                dataKey="month"
                tick={{
                  fontSize: OWNER_DASHBOARD_NUMBERS.charts.bar.tickFontSize,
                  fill: "#6b7280",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  `${OWNER_DASHBOARD_FORMAT.axisCurrencySymbol}${(v / OWNER_DASHBOARD_NUMBERS.charts.bar.currencyScaleDivisor).toFixed(OWNER_DASHBOARD_NUMBERS.charts.bar.decimalPlaces)}${OWNER_DASHBOARD_FORMAT.axisThousandsSuffix}`
                }
                tick={{
                  fontSize: OWNER_DASHBOARD_NUMBERS.charts.bar.tickFontSize,
                  fill: "#6b7280",
                }}
                axisLine={false}
                tickLine={false}
                width={OWNER_DASHBOARD_NUMBERS.charts.bar.yAxisWidth}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#f3f4f6" }} />
              <Bar
                dataKey="total"
                fill="#3b82f6"
                radius={OWNER_DASHBOARD_NUMBERS.charts.bar.radius}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Half-pie chart */}
        <Card title={OWNER_DASHBOARD_COPY.cards.collectionRateThisMonth}>
          <div className="flex flex-col items-center pt-2">
            <div className="relative">
              <PieChart
                width={OWNER_DASHBOARD_NUMBERS.charts.pie.width}
                height={OWNER_DASHBOARD_NUMBERS.charts.pie.height}
              >
                <Pie
                  data={currentMonthPie.data}
                  cx={OWNER_DASHBOARD_NUMBERS.charts.pie.cx}
                  cy={OWNER_DASHBOARD_NUMBERS.charts.pie.cy}
                  startAngle={OWNER_DASHBOARD_NUMBERS.charts.pie.startAngle}
                  endAngle={OWNER_DASHBOARD_NUMBERS.charts.pie.endAngle}
                  outerRadius={OWNER_DASHBOARD_NUMBERS.charts.pie.outerRadius}
                  innerRadius={OWNER_DASHBOARD_NUMBERS.charts.pie.innerRadius}
                  dataKey="value"
                  stroke="none"
                >
                  {currentMonthPie.data.map((_, i) => (
                    <Cell key={i} fill={currentMonthPie.colors[i]} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1 pointer-events-none">
                <span className="text-3xl font-bold text-gray-900 leading-none">
                  {currentMonthPie.rate}%
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  {OWNER_DASHBOARD_COPY.collection.collectedLowercase}
                </span>
              </div>
            </div>

            <div className="flex gap-6 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                <span className="text-gray-600">
                  {OWNER_DASHBOARD_COPY.collection.collected}{" "}
                  <span className="font-medium text-gray-900">
                    {usd(currentMonthPie.paid)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                <span className="text-gray-600">
                  {OWNER_DASHBOARD_COPY.collection.outstanding}{" "}
                  <span className="font-medium text-gray-900">
                    {usd(currentMonthPie.outstanding)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Charges */}
      <Card title={OWNER_DASHBOARD_COPY.cards.recentCharges}>
        <Table<Record<string, unknown>>
          columns={chargeColumns as never}
          data={recentCharges as unknown as Record<string, unknown>[]}
          onRowClick={(row) => {
            const tenantId = (row as unknown as ChargeRow).tenantId;
            if (tenantId) navigate(`/tenants/${tenantId}`);
          }}
        />
      </Card>
    </div>
  );
}
