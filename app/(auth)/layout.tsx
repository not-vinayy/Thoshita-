import { ReactNode } from 'react'
import {isAuthenticated} from "@/lib/actions/auth.action";
import {redirect} from "next/navigation";

const AuthLayout = async ({ children } : { children: ReactNode }) => {
    let isUserAuthenticated = false;
    try {
        isUserAuthenticated = await isAuthenticated();
    } catch (e) {
        console.error("AuthLayout auth check failed:", e);
    }


    if(isUserAuthenticated) redirect('/');

    return (
        <div className="auth-layout">{children}</div>
    )
}
export default AuthLayout
