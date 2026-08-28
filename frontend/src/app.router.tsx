
import { createBrowserRouter } from "react-router";
import { ShopLayouts } from "./shop/layouts/ShopLayouts";
import { HomePage } from "./shop/pages/home/HomePage";
import { GenderPage } from "./shop/pages/gender/GenderPage";
import { ProductPage } from "./shop/pages/product/ProductPage";
import { AuthLayout } from "./auth/layouts/AuthLayout";
import { LoginPage } from "./auth/layouts/pages/login/LoginPage";
import { RegisterPage } from "./auth/layouts/pages/register/RegisterPage";

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
                path: "gender/:gender",
                element: <GenderPage />
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
                element: <LoginPage />
            },
            {
                path: "register",
                element: <RegisterPage />
            }
        ]
    }
])