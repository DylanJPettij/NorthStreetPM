interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'teal' | 'orange'
}

const colorClasses: Record<NonNullable<StatCardProps['color']>, string> = {
  blue:   'border-blue-500',
  green:  'border-green-500',
  yellow: 'border-yellow-500',
  red:    'border-red-500',
  purple: 'border-purple-500',
  teal:   'border-teal-500',
  orange: 'border-orange-500',
}

export default function StatCard({ label, value, sub, color = 'blue' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
