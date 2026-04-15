export const MY_CHARGES_COPY = {
  pageTitle: "My Charges",
  summarySection: {
    totalAmountOwed: "Total Amount Owed",
    overdueAmount: "Overdue Amount",
  },
  cardTitle: "All Charges",
  tableHeaders: ["Type", "Description", "Amount", "Due Date", "Status"],
  emptyState: "No charges found.",
  overdueLabel: "(Overdue)",
} as const;

export const MY_CHARGES_STYLES = {
  layout: {
    container: "space-y-6",
    pageTitle: "text-2xl font-bold text-gray-900",
    summaryGrid: "grid grid-cols-1 md:grid-cols-2 gap-4",
  },
  summary: {
    cardBase: "rounded-xl p-5 border-l-4",
    cardOwed: "border-yellow-400 bg-yellow-50",
    cardPaid: "border-green-500 bg-green-50",
    cardOverdue: "border-red-500 bg-red-50",
    labelText: "text-sm text-gray-500",
    amountTextBase: "text-2xl font-bold mt-1",
    amountOwed: "text-yellow-800",
    amountPaid: "text-green-700",
    amountOverdue: "text-red-700",
  },
  table: {
    container: "overflow-x-auto",
    table: "min-w-full divide-y divide-gray-200",
    thead: "bg-gray-50",
    th: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    tbody: "bg-white divide-y divide-gray-100",
    emptyRow: "px-4 py-8 text-center text-sm text-gray-400",
    rowBase: "text-sm hover:bg-gray-50",
    rowOverdue: "bg-red-50",
    td: "px-4 py-3",
    tdGray: "px-4 py-3 text-gray-700",
    tdBold: "px-4 py-3 font-medium text-gray-900",
    tdDateBase: "px-4 py-3",
    tdDateNormal: "text-gray-600",
    tdDateOverdue: "text-red-600 font-medium",
    overdueIndicator: "ml-1 text-xs",
  },
} as const;

export const MY_CHARGES_FORMAT = {
  locale: "en-US",
  currency: "USD",
  dateFormat: "MMM d, yyyy",
} as const;
