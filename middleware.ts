import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/_vercel/insights/script.js"];

export default clerkMiddleware((auth, req) => {
  console.log("Middleware executed");
  console.log("Request URL:", req.url);
  console.log("Auth status:", auth.userId ? "Authenticated" : "Not authenticated");

  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  console.log("Is public route:", isPublicRoute);

  if (!auth.userId && !isPublicRoute) {
    console.log("Redirecting to login");
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(loginUrl);
  }

  console.log("Proceeding with request");
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};