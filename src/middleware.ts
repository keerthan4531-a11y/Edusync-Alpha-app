import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const role = token.role as string

    // Role-based routing
    if (path.startsWith("/dashboard") || path === "/") {
      if (role === "STUDENT") {
        return NextResponse.redirect(new URL("/student-dashboard", req.url))
      } else if (role === "FACULTY") {
        return NextResponse.redirect(new URL("/faculty-dashboard", req.url))
      } else if (role === "HOD") {
        return NextResponse.redirect(new URL("/hod-dashboard", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/student-dashboard/:path*",
    "/faculty-dashboard/:path*",
    "/hod-dashboard/:path*"
  ]
}
