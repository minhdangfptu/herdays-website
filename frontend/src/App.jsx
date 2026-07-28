import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MessengerButton from "./components/MessengerButton.jsx";
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
import AdminProductsPage from "./pages/Admin/AdminProductsPage.jsx";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ChatWithAI from "./pages/AI/ChatWithAI.jsx";
import AboutUs from "./pages/Common/AboutUs.jsx";
import DownloadAppPage from "./pages/Common/DownloadAppPage.jsx";
import CollectData from "./pages/Common/CollectData.jsx";
import Error404 from "./pages/Error/Error404.jsx";
import Marketplace from "./pages/Marketplace/Marketplace.jsx";
import Checkout from "./pages/Marketplace/Checkout.jsx";
import QRPayment from "./pages/Marketplace/QRPayment.jsx";
import Cart from "./pages/Marketplace/Cart.jsx";
import BoxCustomize from "./pages/Marketplace/BoxCustomize.jsx";
import ProductDetailPage from "./pages/Marketplace/ProductDetailPage.jsx";
import BlogSearchPostPage from "./pages/Blog/BlogSearchPostPage.jsx";
import Tools from "./pages/Tools/Tools.jsx";
import {
  clearAuthSession,
  hasAuthSession,
  profileApi
} from "./services/apiService.js";
import { PageTransition } from "./motion/MotionPrimitives.jsx";
import { SmoothScroll } from "./motion/SmoothScroll.jsx";
import { getLenis } from "./motion/lenisInstance.js";

function RequireAuth({ children, role }) {
  if (!hasAuthSession()) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

function RequireAdmin({ children, role }) {
  if (!hasAuthSession()) return <Navigate to="/login" replace />;
  return role === "admin" ? children : <Navigate to="/home" replace />;
}

function RequireNonAdmin({ children, role }) {
  return role === "admin" ? <Navigate to="/admin" replace /> : children;
}

function RedirectAdmin({ children, role }) {
  return role === "admin" ? <Navigate to="/admin" replace /> : children;
}

function SessionLoading() {
  return (
    <main
      aria-live="polite"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        color: "#ed77a5",
        fontWeight: 700
      }}
    >
      Đang khôi phục phiên đăng nhập...
    </main>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? "admin-layout--collapsed" : ""}`}>
      <AdminSidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed((value) => !value)}
      />
      <div className="admin-main">
        <div className="admin-page-content">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="blog" element={<AdminPostsPage />} />
            <Route path="posts" element={<Navigate to="/admin/blog" replace />} />
            <Route path="shop" element={<Navigate to="/admin/marketplace/products" replace />} />
            <Route path="marketplace" element={<Navigate to="/admin/marketplace/products" replace />} />
            <Route path="marketplace/products" element={<AdminProductsPage />} />
            <Route path="marketplace/orders" element={<AdminOrdersPage />} />
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
      <Outlet />
      <Footer />
      <MessengerButton />
    </>
  );
}

function AppRoutes({ session }) {
  const location = useLocation();

  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/error-404" element={<Error404 />} />
        <Route
          path="/login"
          element={
            <RedirectAdmin role={session.role}>
              <LoginPage />
            </RedirectAdmin>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectAdmin role={session.role}>
              <RegisterPage />
            </RedirectAdmin>
          }
        />
        <Route
          path="/choose-method"
          element={
            <RedirectAdmin role={session.role}>
              <ChooseMethodPage />
            </RedirectAdmin>
          }
        />
        <Route
          path="/confirmation-data"
          element={
            <RedirectAdmin role={session.role}>
              <EnterEmailPhoneNoPage />
            </RedirectAdmin>
          }
        />
        <Route
          path="/confirmation-otp"
          element={
            <RedirectAdmin role={session.role}>
              <EnterOTP />
            </RedirectAdmin>
          }
        />
        <Route
          path="/reset-password"
          element={
            <RedirectAdmin role={session.role}>
              <ResetPassword />
            </RedirectAdmin>
          }
        />
        <Route
          path="/change-password"
          element={
            <RedirectAdmin role={session.role}>
              <ChangePassword />
            </RedirectAdmin>
          }
        />
        <Route
          path="/welcome-quiz"
          element={
            <RedirectAdmin role={session.role}>
              <QuizPage />
            </RedirectAdmin>
          }
        />
        <Route
          path="/admin/*"
          element={
            <RequireAdmin role={session.role}>
              <AdminLayout />
            </RequireAdmin>
          }
        />
        <Route
          element={
            <RequireNonAdmin role={session.role}>
              <HeaderFooterLayout />
            </RequireNonAdmin>
          }
        >
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/upgrade-account" element={<SubscriptionStep1 />} />
          <Route
            path="/upgrade-account/continue"
            element={<SubscriptionStep2 />}
          />
          <Route path="/upgrade-account/complete" element={<SubscriptionStep3 />} />
          <Route path="/term-of-use" element={<TermOfUse />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/collect-data" element={<CollectData />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/download-app" element={<DownloadAppPage />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:toolId" element={<Tools />} />
          <Route
            element={
              <RequireAuth role={session.role}>
                <Outlet />
              </RequireAuth>
            }
          >
            <Route path="/chat-with-herbot" element={<ChatWithAI />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/check-out" element={<Checkout />} />
            <Route path="/qr-payment" element={<QRPayment />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/box-customize" element={<BoxCustomize />} />
            <Route path="/box-customize/:boxId" element={<BoxCustomize />} />
            <Route path="/product-detail/:type/:itemId" element={<ProductDetailPage />} />
            <Route path="/product-detail/:productId" element={<ProductDetailPage />} />
            <Route element={<BlogShell />}>
              <Route path="/blog" element={<BlogTopicsPage />} />
              <Route path="/blog/:topicId/posts" element={<BlogPostsPage />} />
              <Route
                path="/blog/:topicId/posts/:postId"
                element={<BlogPostDetailPage />}
              />
              <Route path="/blog/search" element={<BlogSearchPostPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/error-404" replace />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    const hasStoredSession = hasAuthSession();
    return {
      isLoading: hasStoredSession,
      role: hasStoredSession ? localStorage.getItem("userRole") || "" : ""
    };
  });

  useEffect(() => {
    let isMounted = true;
    let isRestoring = true;

    const updateSessionFromStorage = () => {
      if (!isMounted || isRestoring) return;
      setSession({
        isLoading: false,
        role: hasAuthSession() ? localStorage.getItem("userRole") || "" : ""
      });
    };

    const restoreSession = async () => {
      if (!hasAuthSession()) {
        isRestoring = false;
        if (isMounted) setSession({ isLoading: false, role: "" });
        return;
      }

      try {
        const profile = await profileApi.getProfile();
        const role = profile.accountClass || "";
        if (role) localStorage.setItem("userRole", role);
        if (isMounted) setSession({ isLoading: false, role });
      } catch {
        clearAuthSession();
        if (isMounted) setSession({ isLoading: false, role: "" });
      } finally {
        isRestoring = false;
      }
    };

    window.addEventListener("auth-state-change", updateSessionFromStorage);
    window.addEventListener("storage", updateSessionFromStorage);
    restoreSession();

    return () => {
      isMounted = false;
      window.removeEventListener("auth-state-change", updateSessionFromStorage);
      window.removeEventListener("storage", updateSessionFromStorage);
    };
  }, []);

  if (session.isLoading) return <SessionLoading />;

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <SmoothScroll />
      <ScrollToTop />
      <AppRoutes session={session} />
    </BrowserRouter>
  );
}

export default App;
