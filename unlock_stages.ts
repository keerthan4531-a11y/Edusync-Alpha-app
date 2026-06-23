import { db } from "./src/lib/db"

async function main() {
  await db.stageProgress.updateMany({
    data: {
      status: "ACTIVE"
    }
  })
  console.log("All stages unlocked for all users.")
}

main().catch(console.error).finally(() => process.exit(0))
