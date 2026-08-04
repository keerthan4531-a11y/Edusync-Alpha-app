import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  const existingAdmin = await db.user.findFirst({
    where: {
      OR: [
        { email: "admin@edusync.app" },
        { role: "ADMIN" }
      ]
    }
  })

  if (existingAdmin) {
    console.log("Admin account already exists:", existingAdmin.email)
    return
  }

  const admin = await db.user.create({
    data: {
      name: "Super Admin",
      email: "admin@edusync.app",
      passwordHash: "admin123",
      role: "ADMIN",
      bio: "EduSync Super Administrator Account",
    }
  })

  console.log("Super Admin account successfully created!")
  console.log("Email: admin@edusync.app")
  console.log("Password: admin123")
  console.log("ID:", admin.id)
}

main()
  .catch((e) => {
    console.error("Error seeding admin account:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
