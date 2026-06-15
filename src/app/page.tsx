import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Redirect based on role
  if (session.user.role === "STUDENT") {
    redirect("/student-dashboard");
  } else if (session.user.role === "FACULTY") {
    redirect("/faculty-dashboard");
  } else if (session.user.role === "HOD") {
    redirect("/hod-dashboard");
  } else {
    // Fallback if role is somehow missing or unknown
    redirect("/login");
  }
}

