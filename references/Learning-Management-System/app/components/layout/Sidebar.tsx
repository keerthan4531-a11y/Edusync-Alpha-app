"use client";

import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  role?: 'admin' | 'student' | undefined;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ role, children }) => {
  let links;
  
  if (role === 'admin') {
    links = (
      <>
        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">Admin Dashboard</Link>
        <Link href="/admin/courses" className="text-blue-600 hover:text-blue-800">Manage Courses</Link>
        <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">Manage Users</Link>
        <Link href="/api/auth/signout" className="text-blue-600 hover:text-blue-800">Logout</Link>
      </>
    );
  } else if (role === 'student') {
    links = (
      <>
        <Link href="/dashboard" className="text-green-600 hover:text-green-800">Student Dashboard</Link>
        <Link href="/courses" className="text-green-600 hover:text-green-800">My Courses</Link>
        <Link href="/grades" className="text-green-600 hover:text-green-800">Grades</Link>
        <Link href="/profile" className="text-green-600 hover:text-green-800">Profile</Link>
        <Link href="/api/auth/signout" className="text-green-600 hover:text-green-800">Logout</Link>
      </>
    );
  } else {
    links = null;
  }

  if (!links) return null;

  return (
    <aside className="w-64 bg-gray-100 h-full p-4 border-r">
      <nav className="flex flex-col gap-4">
        {links}
      </nav>
      {children}
    </aside>
  );
};

export default Sidebar;