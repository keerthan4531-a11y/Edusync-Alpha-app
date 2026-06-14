export default function HodDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">HOD Dashboard</h1>
        <p className="text-muted-foreground">Department-wide analytics and faculty directory.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Department Average XP</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">8,450</div>
          </div>
        </div>
      </div>
    </div>
  )
}
