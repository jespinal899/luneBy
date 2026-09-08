import { Outlet } from "react-router"

import { QuoteDrawer } from "@/quote/QuoteDrawer"
import CustomHeader from "../components/CustomHeader"
import { CustomFooter } from "../components/CustomFooter"

export const ShopLayouts = () => {
    return (
        <div className="min-h-screen bg-background">

            <CustomHeader />
            <Outlet />
            <CustomFooter />
            <QuoteDrawer />
        </div>
    )
}