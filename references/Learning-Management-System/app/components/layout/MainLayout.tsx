"use client";

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useSession } from 'next-auth/react';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showSidebar = true
}) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role as 'admin' | 'student' | undefined;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header>
        <Navbar />
      </header>
      
      <div className="flex flex-1 w-full">
        {showSidebar && session && (
          <aside className="hidden md:block">
            <Sidebar role={userRole} />
          </aside>
        )}
        
        <main className={`flex-1 p-4 md:p-6 ${showSidebar && session ? 'max-w-5xl' : 'max-w-7xl'} mx-auto w-full`}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;