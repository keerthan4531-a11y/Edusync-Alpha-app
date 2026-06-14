"use client";

import React, { useState } from 'react';
import Button from '../components/global/Button';
import Card from '../components/global/Card';
import InputField from '../components/global/InputField';
import MainLayout from '../components/layout/MainLayout';
import { useSession } from 'next-auth/react';

export default function TestComponentsPage() {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length < 3) {
      setError('Input must be at least 3 characters');
    } else {
      setError('');
    }
  };

  const handleButtonClick = () => {
    alert('Button clicked!');
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Component Testing Page</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Global Components</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Button Component</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleButtonClick}>Default Button</Button>
              <Button onClick={handleButtonClick} className="bg-green-600 hover:bg-green-700">
                Custom Button
              </Button>
              <Button disabled>Disabled Button</Button>
              <Button type="submit">Submit Button</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Card Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h4 className="text-lg font-medium">Default Card</h4>
                <p>This is a simple card component with default styling.</p>
              </Card>
              
              <Card className="bg-blue-50 border border-blue-200">
                <h4 className="text-lg font-medium">Custom Card</h4>
                <p>This card has custom background and border styling.</p>
              </Card>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Input Field Component</h3>
            <div className="max-w-md">
              <InputField
                label="Sample Input"
                name="sampleInput"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type something..."
                error={error}
              />
              
              <InputField
                label="Password Field"
                name="password"
                type="password"
                value="password123"
                onChange={() => {}}
                placeholder="Enter password"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Layout Components</h2>
        <p>You're currently viewing the <strong>MainLayout</strong> component which includes:</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>Navbar at the top</li>
          <li>Sidebar on the left (if logged in)</li>
          <li>This main content area</li>
          <li>Footer at the bottom</li>
        </ul>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            <strong>Note:</strong> The Sidebar will only appear if you're logged in. 
            User role: {session ? (session.user?.role || 'No role defined') : 'Not logged in'}
          </p>
        </div>
      </section>
    </MainLayout>
  );
}