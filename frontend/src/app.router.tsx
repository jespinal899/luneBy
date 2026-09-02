
import { createBrowserRouter, Navigate } from "react-router";
import { ShopLayouts } from "./shop/layouts/ShopLayouts";
import { HomePage } from "./shop/pages/home/HomePage";
import { ProductPage } from "./shop/pages/product/ProductPage";
import { DashboardPage } from "./admin/pages/dashboard/DashboardPage";
import { AdminProductsPages } from "./admin/pages/products/AdminProductsPages";
import { AdminProductPage } from "./admin/pages/product/AdminProductPage";
import { lazy } from "react";
import { LoginPage } from "./auth/layouts/pages/login/LoginPage";
import { RegisterPage } from "./auth/layouts/pages/register/RegisterPage";
import { ShopPage } from "./shop/pages/Shop/ShopPage";



const AuthLayout = lazy(() => import("./auth/layouts/AuthLayout"));
const AdminLayout = lazy(() => import("./admin/layouts/AdminLayout"));



export const appRouter = createBrowserRouter([

    //Main router
    {
        path: "/",
        element: <ShopLayouts />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "product/:idSlug",
                element: <ProductPage />
            },
            {
                path: "shop",
                element: <ShopPage />
            },
            {
                path: "shop/:shop",
                element: <ShopPage />
            }
        ],
    },
    //Auth router
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/auth/login" />
            },
            {
                path: "login",
                element: <LoginPage />
            },
            {
                path: "register",
                element: <RegisterPage />
            }
        ]
    },
    //Admin router
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <DashboardPage />
            },
            {
                path: "products",
                element: <AdminProductsPages />
            },
            {
                path: "product/:idSlug",
                element: <AdminProductPage />
            }
        ]
    }
])