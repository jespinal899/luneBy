import { Outlet } from "react-router"

import { QuoteDrawer } from "@/quote/QuoteDrawer"
import CustomHeader from "../components/CustomHeader"
import { CustomFooter } from "../components/CustomFooter"
import { ScrollToHash } from "../components/ScrollToHash"

export const ShopLayouts = () => {
    return (
        <div className="min-h-screen bg-background">

            <ScrollToHash />
            <CustomHeader />
            <Outlet />
            <CustomFooter />
            <QuoteDrawer />
        </div>
    )
}