"use client";

import React from 'react';
import MainLayout from '../layout/MainLayout';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import Card from '../global/Card';
import Footer from '../layout/Footer';

const DashboardPage = () => {
  return (
    <MainLayout>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-gray-800">1,245</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Courses</p>
                <p className="text-2xl font-bold text-gray-800">42</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Course Completions</p>
                <p className="text-2xl font-bold text-gray-800">876</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white">
            <h2 className="text-xl text-gray-800 font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 border-l-4 border-blue-500 bg-blue-50">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">New student registered</p>
                  <p className="text-xs text-gray-500">John Doe - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 border-l-4 border-green-500 bg-green-50">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">New course published</p>
                  <p className="text-xs text-gray-500">Advanced JavaScript - 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 border-l-4 border-yellow-500 bg-yellow-50">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">Course review submitted</p>
                  <p className="text-xs text-gray-500">React Fundamentals - 1 day ago</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white">
            <h2 className="text-xl text-gray-800 font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <button className="p-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span className="text-sm font-medium">Add Course</span>
              </button>
              <button className="p-4 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                <span className="text-sm font-medium">Add Student</span>
              </button>
              <button className="p-4 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                <span className="text-sm font-medium">Reports</span>
              </button>
              <button className="p-4 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;