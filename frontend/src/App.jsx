import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import BlogShell from './components/blog/BlogShell.jsx'
import AdminPostsPage from './pages/AdminPostsPage.jsx'
import BlogPostDetailPage from './pages/BlogPostDetailPage.jsx'
import BlogPostsPage from './pages/BlogPostsPage.jsx'
import BlogTopicsPage from './pages/BlogTopicsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

function RequireAdmin({ children }) {
  const isAdmin = localStorage.getItem('userRole') === 'admin'
  return isAdmin ? children : <Navigate to="/blog" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<BlogShell />}>
          <Route path="/blog" element={<BlogTopicsPage />} />
          <Route path="/blog/:topicId/posts" element={<BlogPostsPage />} />
          <Route path="/blog/:topicId/posts/:postId" element={<BlogPostDetailPage />} />
          <Route path="/admin/posts" element={<RequireAdmin><AdminPostsPage /></RequireAdmin>} />
        </Route>
        <Route path="*" element={<Navigate to="/blog" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
