"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import InputField from '../components/global/InputField';
import Button from '../components/global/Button';

const SignupPage = () => {
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    role: 'student' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.email || !form.password || !form.name || !form.role) {
      setError('All fields are required.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 2000);

    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-16 bg-white">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl text-black font-bold mb-6 text-center">Sign Up</h2>
          
          {error && (
            <div className="mb-4 text-red-600 text-center text-sm" role="alert">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 text-green-600 text-center text-sm" role="alert">
              {success}
            </div>
          )}
          
          <InputField
            label="Full Name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password (min 6 characters)"
            disabled={isLoading}
          />
          
          <div className="mb-6">
            <label htmlFor="role" className="block text-sm text-black font-medium mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signin')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignupPage;