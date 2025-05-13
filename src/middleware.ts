import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { protectedRoutes, unProtectedRoutes, USER_TOKEN_CHAT } from "./utils/constants";

export function middleware(request: NextRequest) {
    // const cookieStore = request?.cookies;
    // const token = cookieStore?.get(USER_TOKEN_CHAT)?.value;
    // const { pathname } = request.nextUrl;

    // if (token && unProtectedRoutes.includes(pathname)) {
    //     return NextResponse.redirect(new URL("/", request.url));
    // }

    // if (!token && protectedRoutes.includes(pathname)) {
    //     return NextResponse.redirect(new URL("/login", request.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [...protectedRoutes, ...unProtectedRoutes],
};

