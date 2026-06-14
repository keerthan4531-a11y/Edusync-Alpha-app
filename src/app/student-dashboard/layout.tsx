import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/")
  }

  return <DashboardLayout user={session.user as any}>{children}</DashboardLayout>
}
