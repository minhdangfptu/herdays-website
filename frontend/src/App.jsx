import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header.jsx";
import BlogShell from "./components/blog/BlogShell.jsx";
import AdminPostsPage from "./pages/AdminPostsPage.jsx";
import BlogPostDetailPage from "./pages/BlogPostDetailPage.jsx";
import BlogPostsPage from "./pages/BlogPostsPage.jsx";
import BlogTopicsPage from "./pages/BlogTopicsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Footer from "./components/Footer.jsx";

function RequireAdmin({ children }) {
  const isAdmin = localStorage.getItem("userRole") === "admin";
  return isAdmin ? children : <Navigate to="/blog" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<BlogShell />}>
          <Route path="/blog" element={<BlogTopicsPage />} />
          <Route path="/blog/:topicId/posts" element={<BlogPostsPage />} />
          <Route
            path="/blog/:topicId/posts/:postId"
            element={<BlogPostDetailPage />}
          />
          <Route
            path="/admin/posts"
            element={
              <RequireAdmin>
                <AdminPostsPage />
              </RequireAdmin>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/blog" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
