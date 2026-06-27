import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header.jsx";
import BlogShell from "./components/blog/BlogShell.jsx";
import BlogTopicsPage from "./pages/Blog/BlogTopicsPage.jsx";
import BlogPostsPage from "./pages/Blog/BlogPostsPage.jsx";
import BlogPostDetailPage from "./pages/Blog/BlogPostDetailPage.jsx";
import AdminPostsPage from "./pages/Blog/AdminPostsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Footer from "./components/Footer.jsx";
import ContactUs from "./pages/Common/ContactUs.jsx";
import HomePage from "./pages/Common/HomePage.jsx";

function RequireAdmin({ children }) {
  const isAdmin = localStorage.getItem("userRole") === "admin";
  return isAdmin ? children : <Navigate to="/blog" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Toaster position="top-center" reverseOrder={false} />

      <div>
        <Routes>
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/home" element={<HomePage />} />
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
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
