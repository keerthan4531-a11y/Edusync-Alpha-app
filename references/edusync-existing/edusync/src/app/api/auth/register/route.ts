import { NextResponse } from 'next/server';
import { getUsersCollection, getBadgesCollection, getAnalyticsCollection } from '@/lib/db/collections';
import { hashPassword } from '@/lib/auth/utils';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, username, password, full_name, user_type, department, 
      year, roll_number, faculty_id, hod_id, phone 
    } = body;

    if (!email || !username || !password || !full_name || !user_type) {
      return NextResponse.json({ detail: "Missing required fields" }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();

    // Check if email exists
    const existingEmail = await usersCollection.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ detail: "Email already registered" }, { status: 400 });
    }

    // Check if username exists
    const existingUsername = await usersCollection.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ detail: "Username already taken" }, { status: 400 });
    }

    // Check roll number for students
    if (user_type === 'student' && roll_number) {
      const existingRoll = await usersCollection.findOne({ roll_number });
      if (existingRoll) {
        return NextResponse.json({ detail: "Roll number already registered" }, { status: 400 });
      }
    }

    const cleanUsername = full_name.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
    
    // Base user object matching Python model
    const userDict: any = {
      email,
      username,
      password: hashPassword(password),
      full_name,
      user_type,
      department: department || null,
      phone: phone || null,
      campus_email: `${cleanUsername}@campus.com`,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      is_verified: false,
      verification_code: crypto.randomBytes(16).toString('hex')
    };

    // Add specific fields based on user type
    if (user_type === 'student') {
      userDict.roll_number = roll_number || null;
      userDict.year = year ? parseInt(year) : null;
      userDict.stage = "freshie";
      userDict.credits = 0;
      userDict.xp = 0;
      userDict.level = 1;
      userDict.daily_login_streak = 0;
      userDict.weekly_login_streak = 0;
      userDict.current_stage_progress = 0;
      userDict.last_login = null;
      userDict.last_active = null;
      userDict.weak_areas = [];
      userDict.strengths = [];
      userDict.skills = [];
      userDict.interests = [];
      userDict.career_goals = [];
      userDict.completed_challenges = 0;
      userDict.projects_completed = 0;
      userDict.courses_enrolled = [];
      userDict.badges = [];
      userDict.achievements = [];
      userDict.mood_history = [];
      userDict.learning_style = null;
      userDict.preferred_language = "en";
      userDict.timezone = "UTC";
      userDict.notification_preferences = {
        email: true,
        push: true,
        sms: false,
        challenge_reminders: true,
        deadline_alerts: true,
        achievement_alerts: true
      };
    } else if (user_type === 'faculty') {
      userDict.faculty_id = faculty_id || null;
    } else if (user_type === 'hod') {
      userDict.hod_id = hod_id || null;
    }

    // Insert user
    const result = await usersCollection.insertOne(userDict);
    const userId = result.insertedId.toString();

    // Setup collections
    const badgesCollection = await getBadgesCollection();
    const analyticsCollection = await getAnalyticsCollection();

    // Create initial badges
    await badgesCollection.insertOne({
      user_id: userId,
      badges: [{
        name: "Welcome Aboard!",
        icon: "🎉",
        earned_date: new Date(),
        description: "Welcome to EduSync 4.0",
        category: "welcome"
      }],
      created_at: new Date()
    });

    // Create analytics entry
    await analyticsCollection.insertOne({
      user_id: userId,
      user_type: user_type,
      joined_at: new Date(),
      total_sessions: 0,
      total_time_spent: 0,
      last_active: null,
      created_at: new Date()
    });

    // NOTE: In Next.js, background tasks (emails/notifications) might need a queue 
    // like BullMQ or Serverless Background Functions (Vercel Functions). 
    // We are skipping them synchronously for now to keep response fast.
    console.log(`[Mock Background Task] Send welcome email to ${email}`);
    console.log(`[Mock Background Task] Send welcome notification to ${userId}`);

    return NextResponse.json({
      message: "Registration successful",
      user_id: userId,
      user_type: user_type,
      verification_required: true
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ detail: "Registration failed", error: error.message }, { status: 500 });
  }
}
