'use client';

import React, { useState, useEffect } from 'react';

export default function FacultyClassroomView() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [activeClassroomId, setActiveClassroomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people' | 'grades'>('stream');

  // Announcements (Stream) State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Assignments (Classwork) State
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [newAssignmentData, setNewAssignmentData] = useState({
    title: '',
    description: '',
    due_date: '',
    max_score: 100
  });

  // People State
  const [people, setPeople] = useState<{ teacher: any, classmates: any[] }>({ teacher: null, classmates: [] });
  const [loadingPeople, setLoadingPeople] = useState(false);

  // Grades / Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<number | string>('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  // Create Class State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);


  useEffect(() => {
    if (activeClassroomId) {
      if (activeTab === 'stream') fetchAnnouncements(activeClassroomId);
      if (activeTab === 'classwork') fetchAssignments(activeClassroomId);
      if (activeTab === 'people') fetchPeople(activeClassroomId);
      if (activeTab === 'grades') fetchSubmissions(activeClassroomId);
    }
  }, [activeClassroomId, activeTab]);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/faculty/classrooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
      }
      
      const data = await response.json();
      setClassrooms(data.classrooms || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      setIsCreating(true);
      setCreateError(null);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/faculty/classrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newClassName.trim(),
          description: newClassDescription.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create classroom');
      }
      
      // Success
      setShowCreateModal(false);
      setNewClassName('');
      setNewClassDescription('');
      fetchClassrooms(); // Refresh list
      
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const fetchAnnouncements = async (classroomId: string) => {
    try {
      setLoadingAnnouncements(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${classroomId}/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch announcements');
      
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim() || !activeClassroomId) return;

    try {
      setIsPosting(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${activeClassroomId}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newAnnouncement.trim() })
      });

      if (!response.ok) throw new Error('Failed to post announcement');
      
      setNewAnnouncement('');
      fetchAnnouncements(activeClassroomId); // Refresh stream
      
    } catch (err) {
      console.error(err);
      alert('Failed to post announcement.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${activeClassroomId}/announcements?id=${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete announcement');
      
      // Refresh stream
      if (activeClassroomId) fetchAnnouncements(activeClassroomId);
    } catch (err) {
      console.error(err);
      alert('Failed to delete announcement.');
    }
  };

  // Helper to format dates nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const fetchAssignments = async (classroomId: string) => {
    try {
      setLoadingAssignments(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${classroomId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch assignments');
      
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentData.title.trim() || !activeClassroomId) return;

    try {
      setIsCreatingAssignment(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${activeClassroomId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAssignmentData)
      });

      if (!response.ok) throw new Error('Failed to create assignment');
      
      setNewAssignmentData({ title: '', description: '', due_date: '', max_score: 100 });
      setShowCreateAssignmentModal(false);
      fetchAssignments(activeClassroomId); // Refresh classwork
      
    } catch (err) {
      console.error(err);
      alert('Failed to create assignment.');
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const fetchSubmissions = async (classroomId: string) => {
    try {
      setLoadingSubmissions(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${classroomId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch submissions');
      
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    if (!activeClassroomId || gradingScore === '') return;

    try {
      setIsGrading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${activeClassroomId}/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          score: Number(gradingScore),
          feedback: gradingFeedback.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to submit grade');
      
      // Reset state and refresh
      setActiveSubmissionId(null);
      setGradingScore('');
      setGradingFeedback('');
      fetchSubmissions(activeClassroomId);
      
    } catch (err) {
      console.error(err);
      alert('Failed to grade submission.');
    } finally {
      setIsGrading(false);
    }
  };

  const fetchPeople = async (classroomId: string) => {
    try {
      setLoadingPeople(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${classroomId}/people`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch people');
      
      const data = await response.json();
      setPeople({ teacher: data.teacher, classmates: data.classmates || [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPeople(false);
    }
  };

  const renderCreateModal = () => {
    if (!showCreateModal) return null;
    
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '30px', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'var(--text)' }}>Create Class</h3>
            <button onClick={() => { setShowCreateModal(false); setCreateError(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <form onSubmit={handleCreateClass}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Class Name (required)</label>
              <input 
                type="text" 
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. Introduction to React"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Description (optional)</label>
              <textarea 
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
                placeholder="Brief description of the course"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', minHeight: '100px', resize: 'vertical' }}
              />
              {createError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px' }}>{createError}</div>}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowCreateModal(false); setCreateError(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isCreating || !newClassName.trim()} className="btn-primary" style={{ opacity: (isCreating || !newClassName.trim()) ? 0.7 : 1 }}>
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>

      {showCreateAssignmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e1e2d', width: '100%', maxWidth: '600px', borderRadius: '20px', padding: '30px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-file-signature" style={{ color: 'var(--primary)' }}></i> Create Assignment
              </h2>
              <button onClick={() => setShowCreateAssignmentModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Title *</label>
                <input 
                  type="text" 
                  value={newAssignmentData.title}
                  onChange={(e) => setNewAssignmentData({...newAssignmentData, title: e.target.value})}
                  placeholder="e.g., Chapter 1 Quiz" 
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Instructions (Optional)</label>
                <textarea 
                  value={newAssignmentData.description}
                  onChange={(e) => setNewAssignmentData({...newAssignmentData, description: e.target.value})}
                  placeholder="Add details for your students..." 
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'white', minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Due Date (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={newAssignmentData.due_date}
                    onChange={(e) => setNewAssignmentData({...newAssignmentData, due_date: e.target.value})}
                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Points</label>
                  <input 
                    type="number" 
                    value={newAssignmentData.max_score}
                    onChange={(e) => setNewAssignmentData({...newAssignmentData, max_score: parseInt(e.target.value) || 0})}
                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button type="button" onClick={() => setShowCreateAssignmentModal(false)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isCreatingAssignment || !newAssignmentData.title.trim()} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', cursor: (isCreatingAssignment || !newAssignmentData.title.trim()) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (isCreatingAssignment || !newAssignmentData.title.trim()) ? 0.7 : 1 }}>
                  {isCreatingAssignment ? 'Creating...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
  const renderClassroomList = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="fas fa-circle-notch fa-spin fa-3x" style={{ color: 'var(--primary)' }}></i>
            <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Loading classrooms...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return <div style={{ color: 'var(--danger)', padding: '20px' }}>Error: {error}</div>;
    }

    return (
      <div className="page-section active">
        {renderCreateModal()}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>My Classrooms</h1>
            <p style={{ color: 'var(--text-muted)' }}>Create and manage classes you teach</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-plus"></i> Create Class
          </button>
        </div>

        {classrooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--glass)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
             <i className="fas fa-chalkboard-teacher" style={{ fontSize: '48px', color: 'rgba(99, 102, 241, 0.3)', marginBottom: '20px' }}></i>
             <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>No classrooms found</h3>
             <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't created any classes yet.</p>
             <button onClick={() => setShowCreateModal(true)} className="btn-primary">Create Your First Class</button>
          </div>
        ) : (
          <div className="classroom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {classrooms.map(cls => (
              <div key={cls.id} className="classroom-card" onClick={() => setActiveClassroomId(cls.id)} style={{ background: 'var(--glass)', borderRadius: '15px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'transform 0.2s', position: 'relative' }}>
                <div className="classroom-banner" style={{ height: '100px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', position: 'relative' }}>
                   {/* Abstract pattern or image could go here */}
                </div>
                <div className="classroom-info" style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: 'var(--text)', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.name}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cls.studentsCount} Students</p>
                </div>
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <i className="fas fa-key"></i> Class Code: <strong style={{ color: 'var(--text)' }}>{cls.code}</strong>
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderActiveClassroom = () => {
    const cls = classrooms.find(c => c.id === activeClassroomId);
    if (!cls) return null;

    return (
      <div className="active-classroom" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div className="classroom-header" style={{ marginBottom: '30px' }}>
          <button 
            className="btn-back" 
            onClick={() => setActiveClassroomId(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Classes
          </button>
          
          <div className="classroom-hero" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '15px', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <h1 style={{ fontSize: '36px', margin: '0 0 10px 0', position: 'relative', zIndex: 1 }}>{cls.name}</h1>
            <p style={{ margin: 0, opacity: 0.9, position: 'relative', zIndex: 1 }}>Class Code: <strong>{cls.code}</strong></p>
          </div>
        </div>

        <div className="classroom-nav" style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '30px', overflowX: 'auto' }}>
          {['stream', 'classwork', 'people', 'grades'].map((tab) => (
            <div 
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab as any)}
              style={{ 
                padding: '15px 25px', 
                cursor: 'pointer', 
                textTransform: 'capitalize',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                fontWeight: activeTab === tab ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        <div className="classroom-content" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', paddingBottom: '20px' }}>
          {activeTab === 'stream' && (
            <div className="classroom-stream">
              {/* Post Announcement Form */}
              <div style={{ background: 'var(--glass)', borderRadius: '15px', padding: '20px', marginBottom: '30px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <form onSubmit={handlePostAnnouncement}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div className="instructor-avatar" style={{ background: 'var(--primary)', color: 'white', flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <textarea 
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        placeholder="Announce something to your class"
                        style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', minHeight: '80px', resize: 'vertical' }}
                        required
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="submit" className="btn-primary" disabled={isPosting || !newAnnouncement.trim()} style={{ opacity: (isPosting || !newAnnouncement.trim()) ? 0.7 : 1 }}>
                          {isPosting ? 'Posting...' : 'Post Announcement'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Announcements Feed */}
              {loadingAnnouncements ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-circle-notch fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                </div>
              ) : announcements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--glass)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
                   <i className="fas fa-bullhorn" style={{ fontSize: '48px', color: 'rgba(99, 102, 241, 0.3)', marginBottom: '20px' }}></i>
                   <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>No announcements yet</h3>
                   <p style={{ color: 'var(--text-muted)' }}>Communicate with your class here</p>
                </div>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="announcement-card" style={{ background: 'var(--glass)', borderRadius: '15px', padding: '20px', marginBottom: '20px', border: '1px solid var(--glass-border)' }}>
                    <div className="announcement-header" style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                      <div className="instructor-avatar" style={{ background: 'var(--secondary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {ann.author.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="announcement-author" style={{ fontWeight: 600, color: 'var(--text)' }}>{ann.author}</div>
                        <div className="announcement-date" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(ann.date)}</div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7, padding: '5px' }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                        title="Delete Announcement"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    {ann.title && <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>{ann.title}</div>}
                    <div className="announcement-content" style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{ann.content}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'classwork' && (
            <div className="classroom-classwork">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ margin: 0, color: 'var(--text)' }}>Classwork</h3>
                <button className="btn-primary" onClick={() => setShowCreateAssignmentModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                  <i className="fas fa-plus"></i> Create
                </button>
              </div>

              {loadingAssignments ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-circle-notch fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                </div>
              ) : assignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--glass)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
                   <i className="fas fa-tasks" style={{ fontSize: '48px', color: 'rgba(99, 102, 241, 0.3)', marginBottom: '20px' }}></i>
                   <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>No assignments yet</h3>
                   <p style={{ color: 'var(--text-muted)' }}>Click "Create" to assign work to your class</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {assignments.map(assn => (
                    <div key={assn.id} className="assignment-card" style={{ background: 'var(--glass)', borderRadius: '15px', padding: '20px', border: '1px solid var(--glass-border)', display: 'flex', gap: '20px', alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}>
                      <div className="assignment-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: 'var(--text)', fontSize: '1.1rem' }}>{assn.title}</h4>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
                          Posted {formatDate(assn.created_at)}
                        </div>
                        {assn.due_date && (
                          <div style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500 }}>
                            Due {formatDate(assn.due_date)}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', background: 'rgba(255, 255, 255, 0.05)', padding: '5px 12px', borderRadius: '8px' }}>
                          {assn.max_score} Points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'people' && (
            <div className="classroom-people" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, color: 'var(--primary)', fontWeight: 400, fontSize: '2rem' }}>Teachers</h2>
                </div>
                {loadingPeople ? (
                   <div style={{ textAlign: 'center', padding: '20px' }}><i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--primary)' }}></i></div>
                ) : people.teacher ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="instructor-avatar" style={{ background: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {people.teacher.name ? people.teacher.name.substring(0, 1).toUpperCase() : 'T'}
                    </div>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{people.teacher.name}</span>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>No teacher assigned.</div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, color: 'var(--secondary)', fontWeight: 400, fontSize: '2rem' }}>Students</h2>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{people.classmates?.length || 0} students</span>
                </div>
                
                {loadingPeople ? (
                   <div style={{ textAlign: 'center', padding: '20px' }}><i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--secondary)' }}></i></div>
                ) : people.classmates && people.classmates.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {people.classmates.map((student: any) => (
                      <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                        <div className="student-avatar" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {student.name.substring(0, 1).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '1.1rem', color: 'var(--text)', flex: 1 }}>{student.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <i className="fas fa-user-graduate" style={{ fontSize: '32px', marginBottom: '15px', opacity: 0.5 }}></i>
                    <p>No students have joined this class yet.</p>
                    <p>Share the Class Code: <strong>{classrooms.find(c => c.id === activeClassroomId)?.code}</strong></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="classroom-grades">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ margin: 0, color: 'var(--text)' }}>Student Submissions</h3>
              </div>

              {loadingSubmissions ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-circle-notch fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                </div>
              ) : submissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--glass)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
                   <i className="fas fa-inbox" style={{ fontSize: '48px', color: 'rgba(99, 102, 241, 0.3)', marginBottom: '20px' }}></i>
                   <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>No submissions yet</h3>
                   <p style={{ color: 'var(--text-muted)' }}>When students submit their assignments, they will appear here.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                        <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Student</th>
                        <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Assignment</th>
                        <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Status</th>
                        <th style={{ padding: '15px', color: 'var(--text-muted)' }}>Submitted At</th>
                        <th style={{ padding: '15px', color: 'var(--text-muted)', textAlign: 'right' }}>Action / Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(sub => (
                        <React.Fragment key={sub.id}>
                          <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <td style={{ padding: '15px', color: 'var(--text)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: 'var(--primary)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                  {sub.student_name.substring(0, 1).toUpperCase()}
                                </div>
                                {sub.student_name}
                              </div>
                            </td>
                            <td style={{ padding: '15px', color: 'var(--text)' }}>{sub.assignment_title}</td>
                            <td style={{ padding: '15px' }}>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '12px', 
                                fontSize: '0.8rem', 
                                fontWeight: 600,
                                background: sub.status === 'graded' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: sub.status === 'graded' ? '#10b981' : '#f59e0b'
                              }}>
                                {sub.status === 'graded' ? 'Graded' : 'Needs Grading'}
                              </span>
                            </td>
                            <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{formatDate(sub.submitted_at)}</td>
                            <td style={{ padding: '15px', textAlign: 'right' }}>
                              {sub.status === 'graded' ? (
                                <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>{sub.score} / {sub.max_score}</div>
                              ) : (
                                <button 
                                  className="btn-primary" 
                                  onClick={() => {
                                    setActiveSubmissionId(activeSubmissionId === sub.id ? null : sub.id);
                                    setGradingScore('');
                                    setGradingFeedback('');
                                  }}
                                  style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                                >
                                  {activeSubmissionId === sub.id ? 'Cancel' : 'Grade'}
                                </button>
                              )}
                            </td>
                          </tr>
                          
                          {/* Grading Panel Expansion */}
                          {activeSubmissionId === sub.id && (
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <td colSpan={5} style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '20px' }}>
                                  <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Grading Panel</h4>
                                  
                                  {sub.submission_url && (
                                    <div style={{ marginBottom: '20px' }}>
                                      <a href={sub.submission_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <i className="fas fa-external-link-alt"></i> View Submission Attachment
                                      </a>
                                    </div>
                                  )}
                                  
                                  {sub.content && (
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px', whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                                      {sub.content}
                                    </div>
                                  )}

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                                    <div>
                                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Score (out of {sub.max_score})</label>
                                      <input 
                                        type="number" 
                                        value={gradingScore}
                                        onChange={(e) => setGradingScore(e.target.value)}
                                        max={sub.max_score}
                                        min={0}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Feedback / Comments</label>
                                      <input 
                                        type="text" 
                                        value={gradingFeedback}
                                        onChange={(e) => setGradingFeedback(e.target.value)}
                                        placeholder="Great job on..."
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button 
                                      className="btn-primary" 
                                      onClick={() => handleGradeSubmission(sub.id)}
                                      disabled={isGrading || gradingScore === ''}
                                      style={{ opacity: (isGrading || gradingScore === '') ? 0.7 : 1 }}
                                    >
                                      {isGrading ? 'Saving...' : 'Save Grade'}
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="classroom-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {activeClassroomId ? renderActiveClassroom() : renderClassroomList()}
    </div>
  );
}
