"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './dashboard.css';
import ClassroomView from './ClassroomView';

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userStr = localStorage.getItem('user_data');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.user_type !== 'student') {
            router.push(`/${userData.user_type}_dashboard`);
            return;
          }
          setUser(userData);
        } else {
          router.push('/login');
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  // Helper component for sidebar links
  const SidebarLink = ({ id, icon, label }: { id: string, icon: string, label: string }) => (
    <li className="menu-item">
      <a 
        href="#" 
        className={`menu-link ${activeTab === id ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); setActiveTab(id); }}
      >
        <i className={`fas ${icon} menu-icon`}></i>
        <span>{label}</span>
      </a>
    </li>
  );

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Top Navigation */}
      <header className="nav-header">
        <nav className="top-nav">
          <div className="logo">
            <i className="fas fa-graduation-cap logo-icon"></i>
            <span>EduSync 4.0</span>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar" id="userAvatar">
                {user.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'ST'}
              </div>
              <div>
                <div id="userName" style={{ fontWeight: 600 }}>{user.full_name || 'Student'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Stage {user.level || 1} • {user.department || 'Computer Science'}
                </div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul className="sidebar-menu">
            <SidebarLink id="dashboard" icon="fa-home" label="Dashboard" />
            <SidebarLink id="learning-path" icon="fa-map-signs" label="Learning Path" />
            <SidebarLink id="my-classrooms" icon="fa-chalkboard" label="My Classrooms" />
            <SidebarLink id="stage1" icon="fa-microphone-alt" label="Stage 1: Communication" />
            <SidebarLink id="stage2" icon="fa-code" label="Stage 2: Coding" />
            <SidebarLink id="stage3" icon="fa-project-diagram" label="Stage 3: Projects" />
            <SidebarLink id="stage4" icon="fa-briefcase" label="Stage 4: Career" />
            <SidebarLink id="daily-challenges" icon="fa-calendar-day" label="Daily Challenges" />
            <SidebarLink id="language-courses" icon="fa-language" label="Language Courses" />
            <SidebarLink id="profile" icon="fa-user" label="Profile" />
          </ul>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          
          {/* View: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="page-section active">
              <div className="welcome-card">
                <h1 className="welcome-title">Welcome back, {user.full_name}! 👋</h1>
                <p className="welcome-subtitle">Here's your learning progress for today.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}>
                      <i className="fas fa-star"></i>
                    </div>
                  </div>
                  <div className="stat-value">{user.credits || 0}</div>
                  <div className="stat-label">Total Credits</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)' }}>
                      <i className="fas fa-fire"></i>
                    </div>
                  </div>
                  <div className="stat-value">{user.daily_streak || 0}</div>
                  <div className="stat-label">Day Streak</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent)' }}>
                      <i className="fas fa-trophy"></i>
                    </div>
                  </div>
                  <div className="stat-value">Level {user.level || 1}</div>
                  <div className="stat-label">Current Stage</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                      <i className="fas fa-tasks"></i>
                    </div>
                  </div>
                  <div className="stat-value">{user.xp || 0}</div>
                  <div className="stat-label">Total XP</div>
                </div>
              </div>
            </div>
          )}

          {/* View: My Classrooms */}
          {activeTab === 'my-classrooms' && (
            <ClassroomView />
          )}

          {/* Placeholders for other tabs */}
          {activeTab !== 'dashboard' && activeTab !== 'my-classrooms' && (
            <div className="page-section active">
              <div className="welcome-card">
                <h1 className="welcome-title">Module Under Construction 🚧</h1>
                <p className="welcome-subtitle">
                  The <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{activeTab}</span> module is currently being migrated to Next.js TSX. Check back soon!
                </p>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
