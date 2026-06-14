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
import { ArrowUpDown, Medal } from "lucide-react"
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

const columns: ColumnDef<StudentLeaderboardEntry>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => {
      const rank = row.getValue("rank") as number
      if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />
      if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
      if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
      return <span className="font-medium text-muted-foreground ml-1">{rank}</span>
    },
  },
  {
    accessorKey: "name",
    header: "Student",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "department",
    header: "Department",
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
    cell: ({ row }) => <div className="font-semibold text-primary">Lv {row.getValue("level")}</div>,
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
      return <div className="text-right font-medium mr-4">{new Intl.NumberFormat().format(xp)} XP</div>
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
