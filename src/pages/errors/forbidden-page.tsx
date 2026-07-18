import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">403 — Không có quyền truy cập</h1>
        <p className="text-slate-500 text-sm mb-6">Bạn không có quyền xem trang này.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  )
}
