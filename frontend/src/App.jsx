import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AdminSidebar from "./components/AdminSidebar.jsx";
import BlogShell from "./components/blog/BlogShell.jsx";
import BlogTopicsPage from "./pages/Blog/BlogTopicsPage.jsx";
import BlogPostsPage from "./pages/Blog/BlogPostsPage.jsx";
import BlogPostDetailPage from "./pages/Blog/BlogPostDetailPage.jsx";
import AdminPostsPage from "./pages/Blog/AdminPostsPage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import ContactUs from "./pages/Common/ContactUs.jsx";
import HomePage from "./pages/Common/HomePage.jsx";
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
import SubscriptionStep3 from "./pages/Subcription/SubscriptionStep3.jsx";
import UserProfile from "./pages/Profile/UserProfile.jsx";
import AdminHome from "./pages/Admin/AdminHome.jsx";
import AdminUsersPage from "./pages/Admin/AdminUsersPage.jsx";
import AdminUserDetailPage from "./pages/Admin/AdminUserDetailPage.jsx";
import AdminContactsPage from "./pages/Admin/AdminContactsPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ChatWithAI from "./pages/AI/ChatWithAI.jsx";
import AboutUs from "./pages/Common/AboutUs.jsx";
import DownloadAppPage from "./pages/Common/DownloadAppPage.jsx";
import CollectData from "./pages/Common/CollectData.jsx";
import Error404 from "./pages/Error/Error404.jsx";
import Marketplace from "./pages/Marketplace/Marketplace.jsx";
import Checkout from "./pages/Marketplace/Checkout.jsx";
import QRPayment from "./pages/Marketplace/QRPayment.jsx";

function RequireAdmin({ children }) {
  const isAdmin = localStorage.getItem("userRole") === "admin";
  return isAdmin ? children : <Navigate to="/blog" replace />;
}

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-page-content">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="blog" element={<AdminPostsPage />} />
            <Route path="posts" element={<Navigate to="/admin/blog" replace />} />
            <Route path="shop" element={<div>Shop Admin (coming soon)</div>} />
            <Route path="herbotai" element={<div>HerbotAI Admin (coming soon)</div>} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:userId" element={<AdminUserDetailPage />} />
            <Route path="contacts" element={<AdminContactsPage />} />
            <Route path="contact" element={<Navigate to="/admin/contacts" replace />} />
            <Route path="lien-he" element={<Navigate to="/admin/contacts" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}

function HeaderFooterLayout() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/chat-with-herbot" element={<ChatWithAI />} />
        <Route path="/upgrade-account" element={<SubscriptionStep1 />} />
        <Route
          path="/upgrade-account/continue"
          element={<SubscriptionStep2 />}
        />
        <Route path="/upgrade-account/complete" element={<SubscriptionStep3 />} />
        <Route path="/term-of-use" element={<TermOfUse />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/collect-data" element={<CollectData />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/download-app" element={<DownloadAppPage />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/check-out" element={<Checkout />} />
        <Route path="/qr-payment" element={<QRPayment />} />
        <Route element={<BlogShell />}>
          <Route path="/blog" element={<BlogTopicsPage />} />
          <Route path="/blog/:topicId/posts" element={<BlogPostsPage />} />
          <Route
            path="/blog/:topicId/posts/:postId"
            element={<BlogPostDetailPage />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/error-404" replace />} />
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
        <Route path="/error-404" element={<Error404 />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/choose-method" element={<ChooseMethodPage />} />
        <Route path="/confirmation-data" element={<EnterEmailPhoneNoPage />} />
        <Route path="/confirmation-otp" element={<EnterOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/welcome-quiz" element={<QuizPage />} />
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        />
        <Route path="/*" element={<HeaderFooterLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
