"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-center">EduSync 4.0 Login</h1>
        <div className="space-y-4">
          <Button className="w-full" onClick={() => signIn("credentials", { email: "student@test.com", password: "hash", callbackUrl: "/student-dashboard" })}>
            Login as Student
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => signIn("credentials", { email: "faculty@test.com", password: "hash", callbackUrl: "/faculty-dashboard" })}>
            Login as Faculty
          </Button>
          <Button className="w-full" variant="outline" onClick={() => signIn("credentials", { email: "hod@test.com", password: "hash", callbackUrl: "/hod-dashboard" })}>
            Login as HOD
          </Button>
        </div>
      </div>
    </div>
  )
}
