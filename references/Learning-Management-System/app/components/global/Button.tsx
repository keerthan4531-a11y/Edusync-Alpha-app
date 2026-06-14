"use client";

import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  type = 'button', 
  disabled = false, 
  onClick, 
  children,
  className = ''
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
  >
    {children}
  </button>
);

export default Button;