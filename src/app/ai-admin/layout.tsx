import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AIAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Guard: Only HOD and ADMIN can access
  if (!session?.user?.role || !['HOD', 'ADMIN'].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0a1a] to-[#0f0520]">
      {children}
    </div>
  );
}
