"use client";

import React from 'react';
import MainLayout from '../layout/MainLayout';
import Card from '../global/Card';

const StudentDashboardPage = () => {
  return (
    <MainLayout showSidebar={true}>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-800">4</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed Courses</p>
                <p className="text-2xl font-bold text-gray-800">2</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <h2 className="text-xl text-gray-800 font-semibold mb-4">My Courses</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">Web Development Fundamentals</h3>
                      <p className="text-sm text-gray-500">Progress: 75%</p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">JavaScript Mastery</h3>
                      <p className="text-sm text-gray-500">Progress: 40%</p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">React Framework</h3>
                      <p className="text-sm text-gray-500">Progress: 20%</p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">UI/UX Design Principles</h3>
                      <p className="text-sm text-gray-500">Progress: 60%</p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="bg-white">
              <h2 className="text-xl text-gray-800 font-semibold mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 border-l-4 border-red-500 bg-red-50">
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">JavaScript Quiz</p>
                    <p className="text-xs text-gray-500">Due: Today</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border-l-4 border-yellow-500 bg-yellow-50">
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">React Project</p>
                    <p className="text-xs text-gray-500">Due: In 3 days</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border-l-4 border-blue-500 bg-blue-50">
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">Design Assignment</p>
                    <p className="text-xs text-gray-500">Due: Next week</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white mt-6">
              <h2 className="text-xl text-gray-800 font-semibold mb-4">Learning Stats</h2>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Study Hours</span>
                  <span className="font-medium text-gray-800">24h this week</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Assignments</span>
                  <span className="font-medium text-gray-800">5 completed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Grade</span>
                  <span className="font-medium text-gray-800">85%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentDashboardPage;