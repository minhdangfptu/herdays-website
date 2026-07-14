import { Outlet } from 'react-router-dom'

function BlogShell() {
  return (
    <div className="min-h-svh bg-[#fff8fb] text-slate-700" style={{ fontFamily: '"Be Vietnam Pro", "Noto Sans", Arial, sans-serif' }}>
      <Outlet />
    </div>
  )
}

export default BlogShell
