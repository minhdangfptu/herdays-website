import { Outlet } from 'react-router-dom'

function BlogShell() {
  return (
    <div className="min-h-svh bg-[#fff8fb] text-slate-700">
      <Outlet />
    </div>
  )
}

export default BlogShell
