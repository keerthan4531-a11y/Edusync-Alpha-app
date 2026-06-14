"use client";

import React from 'react';
import Link from 'next/link';

const Footer = () => (
  <footer className="w-full bg-gray-200 text-gray-700 py-6 mt-auto">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="font-semibold">&copy; {new Date().getFullYear()} LMS. All rights reserved.</p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
          <Link href="/about" className="text-blue-600 hover:text-blue-800">About</Link>
          <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact</Link>
          <Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>
          <Link href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;