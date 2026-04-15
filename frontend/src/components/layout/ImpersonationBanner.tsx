import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ImpersonationBanner() {
  const { impersonating, stopImpersonating } = useAuthStore()
  const navigate = useNavigate()

  if (!impersonating) return null

  const handleStop = () => {
    stopImpersonating()
    navigate('/admin')
  }

  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 flex items-center justify-between text-sm font-medium">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>
          You are acting as{' '}
          <strong>
            {impersonating.firstName} {impersonating.lastName}
          </strong>{' '}
          ({impersonating.role})
        </span>
      </div>
      <button
        onClick={handleStop}
        className="bg-yellow-900 text-yellow-100 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-yellow-800 transition-colors"
      >
        Exit Impersonation
      </button>
    </div>
  )
}
