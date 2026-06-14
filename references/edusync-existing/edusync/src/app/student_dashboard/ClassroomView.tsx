import React, { useState, useEffect } from 'react';

export default function ClassroomView() {
  const [activeClassroomId, setActiveClassroomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people'>('stream');
  
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Module 2: Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  // Module 3: Assignments State
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Module 4: People State
  const [people, setPeople] = useState<{ teacher: any, classmates: any[] }>({ teacher: null, classmates: [] });
  const [loadingPeople, setLoadingPeople] = useState(false);

  // Module 5: Join Class State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/student/classrooms', {
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

  useEffect(() => {
    if (activeClassroomId) {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.style.overflowY = 'hidden';
        mainContent.style.display = 'flex';
        mainContent.style.flexDirection = 'column';
      }
    } else {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.style.overflowY = 'auto';
        mainContent.style.display = '';
        mainContent.style.flexDirection = '';
      }
    }
    
    return () => {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.style.overflowY = 'auto';
        mainContent.style.display = '';
        mainContent.style.flexDirection = '';
      }
    };
  }, [activeClassroomId]);

  useEffect(() => {
    if (activeClassroomId) {
      if (activeTab === 'stream') fetchAnnouncements(activeClassroomId);
      if (activeTab === 'classwork') fetchAssignments(activeClassroomId);
      if (activeTab === 'people') fetchPeople(activeClassroomId);
    }
    // Reset selected assignment when changing tabs
    setSelectedAssignmentId(null);
  }, [activeClassroomId, activeTab]);

  const fetchAnnouncements = async (classroomId: string) => {
    try {
      setLoadingAnnouncements(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/classrooms/${classroomId}/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAnnouncements(false);
    }
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
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
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
      setPeople({
        teacher: data.teacher,
        classmates: data.classmates || []
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingPeople(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId || !submissionLink.trim()) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/student/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignment_id: selectedAssignmentId,
          submission_link: submissionLink
        })
      });

      if (!response.ok) throw new Error('Failed to submit assignment');
      
      // Refresh assignments to update status
      if (activeClassroomId) fetchAssignments(activeClassroomId);
      
      // Reset form
      setSubmissionLink('');
      setSelectedAssignmentId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format dates nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'var(--secondary)';
      case 'missing': return 'var(--danger)';
      case 'graded': return 'var(--primary)';
      default: return 'var(--text-muted)';
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setIsJoining(true);
      setJoinError(null);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/student/classrooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ class_code: joinCode.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to join classroom');
      }
      
      // Success
      setShowJoinModal(false);
      setJoinCode('');
      fetchClassrooms(); // Refresh list
      
    } catch (err: any) {
      setJoinError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const renderJoinModal = () => {
    if (!showJoinModal) return null;
    
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '30px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'var(--text)' }}>Join Class</h3>
            <button onClick={() => { setShowJoinModal(false); setJoinError(null); setJoinCode(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <form onSubmit={handleJoinClass}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Class Code</label>
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Ask your teacher for the class code"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)' }}
                required
              />
              {joinError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px' }}>{joinError}</div>}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowJoinModal(false); setJoinError(null); setJoinCode(''); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={isJoining || !joinCode.trim()} className="btn-primary" style={{ opacity: (isJoining || !joinCode.trim()) ? 0.7 : 1 }}>
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderClassroomList = () => {
    if (loading) {
      return (
        <div className="page-section active" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div className="loading-spinner">
            <i className="fas fa-circle-notch fa-spin fa-2x"></i>
            <span style={{ marginLeft: '10px' }}>Loading classrooms...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="page-section active" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: 'var(--danger)', marginBottom: '15px' }}></i>
          <h3 style={{ color: 'var(--text)' }}>Error loading classrooms</h3>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button onClick={fetchClassrooms} className="btn-primary" style={{ marginTop: '20px', margin: '0 auto' }}>Try Again</button>
        </div>
      );
    }

    return (
      <div className="page-section active">
        {renderJoinModal()}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>My Classrooms</h1>
            <p style={{ color: 'var(--text-muted)' }}>Join and manage your enrolled classes</p>
          </div>
          <button onClick={() => setShowJoinModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-plus"></i> Join Class
          </button>
        </div>

        {classrooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--glass)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
             <i className="fas fa-inbox" style={{ fontSize: '64px', color: 'rgba(99, 102, 241, 0.3)', marginBottom: '20px' }}></i>
             <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>No classrooms yet</h3>
             <p style={{ color: 'var(--text-muted)' }}>Wait for your instructors to invite you to join their classrooms</p>
          </div>
        ) : (
          <div className="classroom-grid">
            {classrooms.map(cls => (
              <div key={cls.id} className="classroom-card" onClick={() => setActiveClassroomId(cls.id)}>
                <div className="classroom-header">
                  <div>
                    <div className="classroom-title">{cls.name}</div>
                    <div className="classroom-subtitle">{cls.code}</div>
                  </div>
                </div>
                <div className="classroom-body">
                  <div className="classroom-instructor">
                    <div className="instructor-avatar">
                      {cls.instructor ? cls.instructor.substring(0, 1).toUpperCase() : 'I'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{cls.instructor}</div>
                      <div style={{ fontSize: '12px' }}>Instructor</div>
                    </div>
                  </div>
                </div>
                <div className="classroom-actions">
                  <i className="fas fa-folder" style={{ color: 'var(--text-muted)' }}></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderClassroomDetail = () => {
    const cls = classrooms.find(c => c.id === activeClassroomId);
    if (!cls) return null;

    return (
      <div className="page-section active" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <button 
          onClick={() => setActiveClassroomId(null)}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 500 }}
        >
          <i className="fas fa-arrow-left"></i> Back to Classrooms
        </button>

        <div className="classroom-detail-header">
          <div className="classroom-detail-title">{cls.name}</div>
          <div className="classroom-detail-subtitle">{cls.code}</div>
        </div>

        <div className="classroom-tabs">
          <div className={`classroom-tab ${activeTab === 'stream' ? 'active' : ''}`} onClick={() => setActiveTab('stream')}>Stream</div>
          <div className={`classroom-tab ${activeTab === 'classwork' ? 'active' : ''}`} onClick={() => setActiveTab('classwork')}>Classwork</div>
          <div className={`classroom-tab ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>People</div>
        </div>

        {/* Tab Contents */}
        <div className="classroom-content-scrollable" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', paddingBottom: '20px' }}>
          {activeTab === 'stream' && (
            <div className="classroom-stream">
            {loadingAnnouncements ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-circle-notch fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--glass)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
                 <i className="fas fa-bullhorn" style={{ fontSize: '48px', color: 'rgba(99, 102, 241, 0.3)', marginBottom: '20px' }}></i>
                 <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>No announcements yet</h3>
                 <p style={{ color: 'var(--text-muted)' }}>This is where your instructor will post updates</p>
              </div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} className="announcement-card">
                  <div className="announcement-header">
                    <div className="instructor-avatar">{ann.author.substring(0, 1).toUpperCase()}</div>
                    <div>
                      <div className="announcement-author">{ann.author}</div>
                      <div className="announcement-date">{formatDate(ann.date)}</div>
                    </div>
                  </div>
                  {ann.title && <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>{ann.title}</div>}
                  <div className="announcement-content">{ann.content}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'classwork' && (
          <div className="classroom-classwork">
            {loadingAssignments ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-circle-notch fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Loading classwork...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--glass)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
                 <i className="fas fa-clipboard-list" style={{ fontSize: '48px', color: 'rgba(99, 102, 241, 0.3)', marginBottom: '20px' }}></i>
                 <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>No classwork yet</h3>
                 <p style={{ color: 'var(--text-muted)' }}>Assignments will appear here when posted</p>
              </div>
            ) : (
              assignments.map(assn => (
                <div key={assn.id} style={{ marginBottom: '20px' }}>
                  <div 
                    className="assignment-item" 
                    onClick={() => setSelectedAssignmentId(selectedAssignmentId === assn.id ? null : assn.id)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className="assignment-icon" style={{ background: assn.status === 'submitted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)', color: assn.status === 'submitted' ? 'var(--secondary)' : 'var(--primary)' }}>
                        <i className={assn.status === 'submitted' ? "fas fa-check" : "fas fa-clipboard-list"}></i>
                      </div>
                      <div className="assignment-details">
                        <div className="assignment-title">{assn.title}</div>
                        <div className="assignment-due">Due {formatDate(assn.due_date)}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 500, color: getStatusColor(assn.status), textTransform: 'capitalize' }}>
                      {assn.status}
                    </div>
                  </div>

                  {/* Submission Form Dropdown */}
                  {selectedAssignmentId === assn.id && (
                    <div style={{ padding: '20px', background: 'var(--glass)', borderRadius: '10px', marginTop: '10px', border: '1px solid var(--glass-border)' }}>
                      <h4 style={{ color: 'var(--text)', marginBottom: '10px' }}>Instructions</h4>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>{assn.description || 'No instructions provided.'}</p>
                      
                      {assn.status === 'submitted' || assn.status === 'graded' ? (
                        <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', borderRadius: '8px', color: 'var(--secondary)' }}>
                          <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                          You have successfully submitted this assignment. 
                          {assn.score !== null && <span style={{ marginLeft: '10px', fontWeight: 600 }}>Score: {assn.score} / {assn.max_score}</span>}
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitAssignment}>
                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Submission Link (GitHub, Drive, etc.)</label>
                            <input 
                              type="url" 
                              value={submissionLink}
                              onChange={(e) => setSubmissionLink(e.target.value)}
                              placeholder="https://..."
                              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)' }}
                              required
                            />
                          </div>
                          <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={isSubmitting || !submissionLink.trim()}
                            style={{ opacity: (isSubmitting || !submissionLink.trim()) ? 0.7 : 1 }}
                          >
                            {isSubmitting ? 'Turning in...' : 'Turn In'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'people' && (
          <div className="classroom-people">
            {loadingPeople ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-circle-notch fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Loading people...</p>
              </div>
            ) : (
              <>
                <div className="people-section">
                  <div className="people-section-title">Teachers</div>
                  {people.teacher ? (
                    <div className="person-item">
                      <div className="instructor-avatar">
                        {people.teacher.profile_picture ? (
                          <img src={people.teacher.profile_picture} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          people.teacher.name.substring(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="person-name">{people.teacher.name}</div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 0', color: 'var(--text-muted)' }}>No teacher assigned yet.</div>
                  )}
                </div>
                
                <div className="people-section">
                  <div className="people-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span>Classmates</span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{people.classmates.length} students</span>
                  </div>
                  
                  {people.classmates.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No other students have joined this classroom yet.
                    </div>
                  ) : (
                    <div>
                      {people.classmates.map((student: any) => (
                        <div key={student.id} className="person-item">
                          <div className="instructor-avatar" style={{ background: student.is_you ? 'var(--primary)' : undefined }}>
                            {student.profile_picture ? (
                              <img src={student.profile_picture} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              student.name.substring(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="person-name">
                            {student.name} {student.is_you && <span style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px' }}>(You)</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        </div>

      </div>
    );
  };

  return activeClassroomId ? renderClassroomDetail() : renderClassroomList();
}
