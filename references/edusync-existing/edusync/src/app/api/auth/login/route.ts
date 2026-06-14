import { NextResponse } from 'next/server';
import { getUsersCollection, getAnalyticsCollection } from '@/lib/db/collections';
import { verifyPassword, createAccessToken, createRefreshToken } from '@/lib/auth/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, device_info } = body;

    if (!email || !password) {
      return NextResponse.json({ detail: "Missing credentials" }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();

    // Search by email, username, roll_number, faculty_id, hod_id
    const user = await usersCollection.findOne({
      $or: [
        { email },
        { username: email },
        { roll_number: email },
        { faculty_id: email },
        { hod_id: email }
      ]
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
    }

    if (user.is_active === false) {
      return NextResponse.json({ detail: "Account is deactivated" }, { status: 403 });
    }

    // Update login stats
    const now = new Date();
    const lastLogin = user.last_login as Date | null;
    
    let dailyStreak = user.daily_login_streak || 0;
    let weeklyStreak = user.weekly_login_streak || 0;

    if (lastLogin) {
      const msPerDay = 1000 * 60 * 60 * 24;
      // Get dates without time for accurate streak calculation
      const lastLoginDate = new Date(lastLogin.toISOString().split('T')[0]).getTime();
      const today = new Date(now.toISOString().split('T')[0]).getTime();
      const diffDays = Math.floor((today - lastLoginDate) / msPerDay);

      // Daily streak
      if (diffDays === 1) dailyStreak += 1;
      else if (diffDays > 1) dailyStreak = 1;

      // Weekly streak
      if (diffDays <= 7) weeklyStreak += 1;
      else weeklyStreak = 1;
    } else {
      dailyStreak = 1;
      weeklyStreak = 1;
    }

    // Award credits for login streak
    const loginCredits = 10 + (dailyStreak * 2);

    // Prepare update data
    const updateData: any = {
      last_login: now,
      last_active: now,
      daily_login_streak: dailyStreak,
      weekly_login_streak: weeklyStreak,
      credits: (user.credits || 0) + loginCredits,
      login_count: (user.login_count || 0) + 1,
      updated_at: now
    };

    if (device_info) {
      const deviceHistory = user.device_history || [];
      deviceHistory.push({
        device_info,
        login_time: now,
        ip_address: null
      });
      // Keep only last 10
      updateData.device_history = deviceHistory.slice(-10);
    }

    // Update user
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: updateData }
    );

    // Update analytics
    const analyticsCollection = await getAnalyticsCollection();
    await analyticsCollection.updateOne(
      { user_id: user._id.toString() },
      { $inc: { total_sessions: 1 } }
    );

    const userIdStr = user._id.toString();

    // Create tokens
    const accessToken = createAccessToken({
      email: user.email,
      user_type: user.user_type,
      user_id: userIdStr,
      full_name: user.full_name
    });

    const refreshToken = createRefreshToken({
      user_id: userIdStr,
      email: user.email
    });

    // NOTE: In the Python code, the refresh token was stored in Redis here. 
    // We'll skip the Redis part for Phase 1 to get the core working without Redis dependency.
    
    console.log(`[Mock Background Task] Send login notification to ${userIdStr}`);

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "bearer",
      expires_in: 24 * 60 * 60, // 24 hours in seconds
      user: {
        user_id: userIdStr,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        stage: user.stage,
        department: user.department,
        year: user.year,
        credits: (user.credits || 0) + loginCredits,
        xp: user.xp || 0,
        level: user.level || 1,
        daily_streak: dailyStreak,
        weekly_streak: weeklyStreak,
        profile_picture: user.profile_picture,
        theme: user.theme || "light",
        is_verified: user.is_verified || false,
        role: user.role || "user"
      }
    });

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ detail: "Login failed", error: error.message }, { status: 500 });
  }
}
