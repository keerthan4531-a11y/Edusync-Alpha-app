import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default async function HodDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "HOD") {
    redirect("/")
  }

  return <DashboardLayout user={session.user as any}>{children}</DashboardLayout>
}
