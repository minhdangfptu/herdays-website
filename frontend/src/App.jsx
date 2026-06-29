import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import BlogShell from "./components/blog/BlogShell.jsx";
import BlogTopicsPage from "./pages/Blog/BlogTopicsPage.jsx";
import BlogPostsPage from "./pages/Blog/BlogPostsPage.jsx";
import BlogPostDetailPage from "./pages/Blog/BlogPostDetailPage.jsx";
import AdminPostsPage from "./pages/Blog/AdminPostsPage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import ContactUs from "./pages/Common/ContactUs.jsx";
import HomePage from "./pages/Common/Homepage.jsx";
import TermOfUse from "./pages/Common/TermOfUse.jsx";
import Policy from "./pages/Common/Policy.jsx";
import SubscriptionStep1 from "./pages/Subcription/SubscriptionStep1.jsx";
import SubscriptionStep2 from "./pages/Subcription/SubscriptionStep2.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";
import ChooseMethodPage from "./pages/Auth/ChooseMethodPage.jsx";
import EnterEmailPhoneNoPage from "./pages/Auth/EnterEmailPhoneNoPage.jsx";
import EnterOTP from "./pages/Auth/EnterOTP.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import ChangePassword from "./pages/Auth/ChangePassword.jsx";

function RequireAdmin({ children }) {
  const isAdmin = localStorage.getItem("userRole") === "admin";
  return isAdmin ? children : <Navigate to="/blog" replace />;
}

function HeaderFooterLayout() {
  return (
    <>
      <Header />
      
      <Routes>
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/upgrade-account" element={<SubscriptionStep1 />} />
        <Route
          path="/upgrade-account/continue"
          element={<SubscriptionStep2 />}
        />
        <Route path="/term-of-use" element={<TermOfUse />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/home" element={<HomePage />} />
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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
    <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/choose-method" element={<ChooseMethodPage />} />
        <Route path="/confirmation-data" element={<EnterEmailPhoneNoPage />} />
        <Route path="/confirmation-otp" element={<EnterOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/*" element={<HeaderFooterLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
