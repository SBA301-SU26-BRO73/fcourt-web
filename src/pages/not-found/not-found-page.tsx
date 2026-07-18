import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
          404
        </p>
        <h1 className="text-4xl font-bold text-slate-950">Page not found</h1>
        <p className="text-slate-600">
          Route nay chua duoc khai bao trong project.
        </p>
        <Link
          to="/"
          className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Ve trang chu
        </Link>
      </div>
    </div>
  )
}
