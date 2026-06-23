"use client"

import { Bell, BookOpen, Trophy, Calendar, MessageSquare, Info } from "lucide-react"
import { useState } from "react"

interface Notification {
  id: string
  type: "info" | "achievement" | "course" | "event" | "message"
  title: string
  description: string
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "New Badge Earned!",
    description: "You earned the 'Quick Learner' badge for completing 5 lessons in a day.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "course",
    title: "New Course Material Available",
    description: "Your instructor uploaded new materials for Data Structures & Algorithms.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "event",
    title: "Upcoming Deadline",
    description: "Assignment 3: Object-Oriented Programming is due in 2 days.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "message",
    title: "New Message from Instructor",
    description: "Prof. Sharma commented on your project submission.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "System Update",
    description: "EduSync has been updated with new features. Check out the changelog!",
    time: "3 days ago",
    read: true,
  },
]

const typeConfig = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  achievement: { icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  course: { icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  event: { icon: Calendar, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  message: { icon: MessageSquare, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="glass-panel flex h-12 w-12 items-center justify-center rounded-2xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-primary/5"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
            filter === "all"
              ? "glass-panel text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2 ${
            filter === "unread"
              ? "glass-panel text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No notifications to show</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {filter === "unread" ? "All notifications have been read" : "You have no notifications yet"}
            </p>
          </div>
        ) : (
          filtered.map((notification) => {
            const config = typeConfig[notification.type]
            const Icon = config.icon
            return (
              <button
                key={notification.id}
                onClick={() => toggleRead(notification.id)}
                className={`glass-panel w-full text-left rounded-2xl p-4 flex items-start gap-4 transition-all duration-300 cursor-pointer group hover:scale-[1.005] ${
                  !notification.read ? "border-l-2 border-l-primary/60" : "opacity-70"
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.description}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2 font-medium">{notification.time}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
