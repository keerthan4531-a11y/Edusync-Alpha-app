"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Medal, Crown, Trophy } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export type StudentLeaderboardEntry = {
  id: string
  rank: number
  name: string
  department: string
  level: number
  xp: number
}

const rankColors: Record<number, { bg: string; text: string; glow: string }> = {
  1: { bg: "bg-yellow-500/15", text: "text-yellow-500", glow: "shadow-[0_0_12px_rgba(234,179,8,0.4)]" },
  2: { bg: "bg-slate-300/15", text: "text-slate-400", glow: "shadow-[0_0_12px_rgba(148,163,184,0.3)]" },
  3: { bg: "bg-amber-600/15", text: "text-amber-600", glow: "shadow-[0_0_12px_rgba(217,119,6,0.3)]" },
}

const columns: ColumnDef<StudentLeaderboardEntry>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => {
      const rank = row.getValue("rank") as number
      const style = rankColors[rank]
      if (style) {
        return (
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${style.bg} ${style.glow}`}>
            {rank === 1 ? <Crown className={`h-4 w-4 ${style.text} drop-shadow-[0_0_6px_currentColor]`} /> :
             <Medal className={`h-4 w-4 ${style.text} drop-shadow-[0_0_6px_currentColor]`} />}
          </div>
        )
      }
      return <span className="font-medium text-muted-foreground ml-2.5">{rank}</span>
    },
  },
  {
    accessorKey: "name",
    header: "Student",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const rank = row.original.rank
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-[var(--glass-border-subtle)]">
            <AvatarFallback className="bg-[var(--glass-bg)] text-foreground text-xs font-bold">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className={`font-medium ${rank <= 3 ? 'text-foreground' : ''}`}>{name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("department")}</span>,
  },
  {
    accessorKey: "level",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-bold text-primary drop-shadow-[0_0_4px_rgba(139,92,246,0.3)]">
        Lv {row.getValue("level")}
      </div>
    ),
  },
  {
    accessorKey: "xp",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total XP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const xp = parseFloat(row.getValue("xp"))
      return <div className="text-right font-semibold mr-4 tabular-nums">{new Intl.NumberFormat().format(xp)} XP</div>
    },
  },
]

interface LeaderboardProps {
  data: StudentLeaderboardEntry[]
}



export function Leaderboard({ data }: LeaderboardProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "xp", desc: true } // Default sort by XP descending
  ])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <GlassCard>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </GlassCard>
  )
}
