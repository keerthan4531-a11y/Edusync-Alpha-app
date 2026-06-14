"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const Navbar = () => {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="w-full bg-blue-700 text-white px-4 py-3 shadow">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">LMS</Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden focus:outline-none" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/" className="hover:text-blue-200">Home</Link>
          <Link href="/courses" className="hover:text-blue-200">Courses</Link>
          
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              <div className="flex items-center ml-4">
                <span className="mr-2">{session.user?.name}</span>
                <Link 
                  href="/api/auth/signout" 
                  className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link 
              href="/login" 
              className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pt-2 pb-4 border-t border-blue-600">
          <Link href="/" className="block py-2 px-2 hover:bg-blue-800">Home</Link>
          <Link href="/courses" className="block py-2 px-2 hover:bg-blue-800">Courses</Link>
          
          {session ? (
            <>
              <Link href="/dashboard" className="block py-2 px-2 hover:bg-blue-800">Dashboard</Link>
              <div className="flex items-center justify-between px-2 py-2">
                <span>{session.user?.name}</span>
                <Link 
                  href="/api/auth/signout" 
                  className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link 
              href="/login" 
              className="block py-2 px-2 hover:bg-blue-800"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;