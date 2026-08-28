import { RouterProvider } from "react-router";
import { appRouter } from "./app.router";



export const Luneby = () => {
    return (
        <RouterProvider router={appRouter} />
    )
}