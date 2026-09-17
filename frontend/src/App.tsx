import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
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

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AddProductPage from './pages/admin/AddProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CategoryProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* Public General Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
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
                  path="/admin/categories"
                  element={
                    <AdminRoute>
                      <AdminCategoriesPage />
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
        </CategoryProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
