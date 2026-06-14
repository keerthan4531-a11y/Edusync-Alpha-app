"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../layout/Navbar';
import InputField from '../global/InputField';
import Button from '../global/Button';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await signIn("credentials", { 
        redirect: false, 
        email: form.email,
        password: form.password
      });
      
      if (res?.error) {
        setError("Invalid credentials");
        setIsLoading(false);
        return;
      }
      
      if (res?.ok) {
        // Wait for session to update
        setTimeout(async () => {
          const sessionRes = await fetch('/api/auth/session');
          const session = await sessionRes.json();
          const role = session?.user?.role;
          
          if (role === 'admin') {
            router.push('/dashboard');
          } else if (role === 'student') {
            router.push('/dashboard');
          } else {
            console.log(session);
          }
        }, 100);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-16 bg-white">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl text-black font-bold mb-6 text-center">Sign In</h2>
          
          {error && (
            <div className="mb-4 text-red-600 text-center text-sm" role="alert">
              {error}
            </div>
          )}
          
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
            placeholder="Enter your password"
            disabled={isLoading}
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginPage;