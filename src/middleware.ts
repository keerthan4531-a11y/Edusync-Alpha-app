import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!token) {
      if (path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const role = token.role as string

    // Role-based routing for admin paths
    if (path.startsWith("/admin") && path !== "/admin/login") {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
    }

    // Role-based routing for root and general dashboard
    if (path.startsWith("/dashboard") || path === "/") {
      if (role === "STUDENT") {
        return NextResponse.redirect(new URL("/student-dashboard", req.url))
      } else if (role === "FACULTY") {
        return NextResponse.redirect(new URL("/faculty-dashboard", req.url))
      } else if (role === "HOD") {
        return NextResponse.redirect(new URL("/hod-dashboard", req.url))
      } else if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path === "/admin/login") return true
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/student-dashboard/:path*",
    "/faculty-dashboard/:path*",
    "/hod-dashboard/:path*",
    "/admin/:path*",
  ]
}

