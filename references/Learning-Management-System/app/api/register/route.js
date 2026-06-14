import { NextResponse } from 'next/server';

// Mock users array to store registrations (simulating a database)
let users = [];

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;
    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['student', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists in mock database
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Log registration details
    console.log('New user registration attempt:', {
      email,
      name,
      role,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // TODO: Hash password before storing
      name,
      role,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Add user to mock database
    users.push(newUser);

    console.log('User registration successful:', {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      timestamp: newUser.createdAt
    });

    // Return successful response without password
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}