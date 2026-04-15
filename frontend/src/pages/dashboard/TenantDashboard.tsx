import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import {
  allTenancies,
  allCharges,
  allPayments,
} from '../../data/stubs'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { mergeLateFees } from '../../utils/charges'
import type { Charge, ChargeStatus, PaymentMethod } from '../../types'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

function chargeStatusVariant(status: ChargeStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'PAID':     return 'success'
    case 'UNPAID':  return 'warning'
    case 'WAIVED':   return 'neutral'
    case 'DELETED':  return 'neutral'
    case 'DISPUTE':  return 'danger'
  }
}

function methodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'ACH':    return 'ACH'
    case 'CARD':   return 'Card'
    case 'MANUAL': return 'Manual'
  }
}

export default function TenantDashboard() {
  const { user } = useAuthStore()
  const { addedCharges, addedPayments, chargeStatusOverrides, setChargeStatus, addPayment } =
    useDataStore()

  const [payingCharge, setPayingCharge] = useState<Charge | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ACH')
  const [paidMsg, setPaidMsg] = useState<string | null>(null)

  const tenancy = useMemo(
    () => allTenancies.find((t) => t.tenantId === user?.id && t.status === 'ACTIVE'),
    [user],
  )

  // Merge and apply overrides for this tenant's charges
  const myCharges = useMemo(() => {
    const allMerged = [...allCharges, ...addedCharges]
    const tenancyCharges = allMerged.filter((c) => tenancy && c.tenancyId === tenancy.id)
    return mergeLateFees(tenancyCharges)
      .map((c) => (c.id in chargeStatusOverrides ? { ...c, status: chargeStatusOverrides[c.id] } : c))
  }, [tenancy, addedCharges, chargeStatusOverrides])

  const pendingCharges = myCharges.filter((c) => c.status === 'UNPAID')
  const totalBalance = pendingCharges.reduce((sum, c) => sum + c.amount, 0)

  const myPayments = useMemo(() => {
    const myChargeIds = myCharges.map((c) => c.id)
    return [...allPayments, ...addedPayments]
      .filter((p) => myChargeIds.includes(p.chargeId))
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
      .slice(0, 10)
  }, [myCharges, addedPayments])

  const confirmPayment = () => {
    if (!payingCharge) return
    addPayment({
      id: `pay-${Date.now()}`,
      chargeId: payingCharge.id,
      amountPaid: payingCharge.amount,
      paidAt: new Date().toISOString(),
      method: paymentMethod,
    })
    setChargeStatus(payingCharge.id, 'PAID')
    setPaidMsg(`Payment of ${usd(payingCharge.amount)} confirmed.`)
    setPayingCharge(null)
    setTimeout(() => setPaidMsg(null), 5000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>

      {/* Success toast */}
      {paidMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {paidMsg}
        </div>
      )}

      {/* Balance banner */}
      <div
        className={`rounded-xl p-6 ${
          totalBalance > 0
            ? 'bg-red-50 border border-red-200'
            : 'bg-green-50 border border-green-200'
        }`}
      >
        <p className="text-sm font-medium text-gray-600">Total Balance Due</p>
        <p
          className={`text-4xl font-bold mt-1 ${
            totalBalance > 0 ? 'text-red-700' : 'text-green-700'
          }`}
        >
          {usd(totalBalance)}
        </p>
        {totalBalance === 0 && (
          <p className="text-sm text-green-600 mt-1">You're all paid up!</p>
        )}
      </div>

      {/* Outstanding charges */}
      <Card title="Outstanding Charges">
        {pendingCharges.length === 0 ? (
          <p className="text-gray-400 text-sm">No outstanding charges.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingCharges.map((charge) => (
              <div
                key={charge.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50 -mx-6 px-6 rounded transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{charge.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Due: {format(new Date(charge.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-gray-900">{usd(charge.amount)}</span>
                  <Badge variant={chargeStatusVariant(charge.status)}>{charge.status}</Badge>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => { setPayingCharge(charge); setPaymentMethod('ACH') }}
                  >
                    Pay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent payments */}
      <Card title="Recent Payments">
        {myPayments.length === 0 ? (
          <p className="text-gray-400 text-sm">No payments on record.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {myPayments.map((payment) => {
              const charge = myCharges.find((c) => c.id === payment.chargeId)
              return (
                <div key={payment.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {charge?.description ?? 'Payment'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(payment.paidAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">
                      {methodLabel(payment.method)}
                    </span>
                    <span className="text-sm font-semibold text-green-700">
                      {usd(payment.amountPaid)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Pay Charge Modal */}
      <Modal
        isOpen={!!payingCharge}
        onClose={() => setPayingCharge(null)}
        title="Pay Charge"
      >
        {payingCharge && (
          <div className="space-y-4">
            {/* Charge summary */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1">
              <p className="text-sm font-medium text-gray-900">{payingCharge.description}</p>
              <p className="text-xs text-gray-500">
                Due: {format(new Date(payingCharge.dueDate), 'MMMM d, yyyy')}
              </p>
              <p className="text-2xl font-bold text-gray-900 pt-1">{usd(payingCharge.amount)}</p>
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="flex gap-2">
                {(['ACH', 'CARD', 'MANUAL'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      paymentMethod === m
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {methodLabel(m)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" onClick={() => setPayingCharge(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmPayment}>
                Confirm Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
