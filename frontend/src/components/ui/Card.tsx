interface CardProps {
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export default function Card({ title, children, action, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
