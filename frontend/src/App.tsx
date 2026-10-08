import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentResultPage from './pages/PaymentResultPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import AccountPage from './pages/account/AccountPage';
import MyOrdersPage from './pages/account/MyOrdersPage';
import SlugResolver from './routes/SlugResolver';
import ScrollToTop from './components/common/ScrollToTop';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import GuestRoute from './components/auth/GuestRoute';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminDraftProductsPage from './pages/admin/AdminDraftProductsPage';
import AddProductPage from './pages/admin/AddProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import AdminCatalogPage from './pages/admin/AdminCatalogPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { CouponProvider } from './context/CouponContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CategoryProvider>
          <CouponProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <Routes>
                  {/* Public General Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <LoginPage />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <RegisterPage />
                      </GuestRoute>
                    }
                  />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/payment/result/:merchantOrderId" element={<PaymentResultPage />} />
                  <Route path="/products" element={<ProductListingPage />} />

                  {/* User Protected Routes */}
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/password"
                    element={
                      <ProtectedRoute>
                        <ChangePasswordPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminRoute>
                        <AdminDashboardPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <AdminRoute>
                        <AdminProductsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/drafts"
                    element={
                      <AdminRoute>
                        <AdminDraftProductsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/add"
                    element={
                      <AdminRoute>
                        <AddProductPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/:id/edit"
                    element={
                      <AdminRoute>
                        <EditProductPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/banners"
                    element={
                      <AdminRoute>
                        <AdminBannersPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/catalog"
                    element={
                      <AdminRoute>
                        <AdminCatalogPage />
                      </AdminRoute>
                    }
                  />
                  <Route path="/admin/brands" element={<Navigate to="/admin/catalog" replace />} />
                  <Route path="/admin/categories" element={<Navigate to="/admin/catalog" replace />} />
                  <Route
                    path="/admin/coupons"
                    element={
                      <AdminRoute>
                        <AdminCouponsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <AdminUsersPage defaultTab="users" />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/admins"
                    element={
                      <AdminRoute>
                        <AdminUsersPage defaultTab="admins" />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <AdminRoute>
                        <AdminOrdersPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/profile"
                    element={
                      <AdminRoute>
                        <AdminProfilePage />
                      </AdminRoute>
                    }
                  />

                  {/* Dynamic Root-Level Slug Resolver for Categories & Products */}
                  <Route path="/products/:slug" element={<SlugResolver />} />
                  <Route path="/product/:slug" element={<SlugResolver />} />
                  <Route path="/:slug" element={<SlugResolver />} />
                  <Route path="*" element={<SlugResolver />} />
                </Routes>
              </Router>
            </CartProvider>
          </CouponProvider>
        </CategoryProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
