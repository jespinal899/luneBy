import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

import { ProtectedRoute } from './auth/components/ProtectedRoute';
import { LoginPage } from './auth/layouts/pages/login/LoginPage';
import { RegisterPage } from './auth/layouts/pages/register/RegisterPage';
import { AdminProductPage } from './admin/pages/product/AdminProductPage';
import { AdminProductsPage } from './admin/pages/products/AdminProductsPages';
import { DashboardPage } from './admin/pages/dashboard/DashboardPage';
import { ShopLayouts } from './shop/layouts/ShopLayouts';
import { HomePage } from './shop/pages/home/HomePage';
import { ProductPage } from './shop/pages/product/ProductPage';
import { ShopPage } from './shop/pages/Shop/ShopPage';

const AuthLayout = lazy(() => import('./auth/layouts/AuthLayout'));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));

export const appRouter = createBrowserRouter([
  // Tienda
  {
    path: '/',
    element: <ShopLayouts />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'product/:idSlug', element: <ProductPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:shop', element: <ShopPage /> },
    ],
  },
  // Autenticación
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  // Administración (solo rol admin)
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/:id', element: <AdminProductPage /> },
    ],
  },
]);
