
        export function initScripts() {
            if (typeof window === 'undefined') return;
            try {
                
        function applyHodTheme(theme) {
            if (!theme) return;
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            
            const themeCheckboxes = document.querySelectorAll('.theme-checkbox');
            themeCheckboxes.forEach(cb => {
                cb.checked = (theme === 'dark');
            });
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: theme } }));
        }

        (function() {
            let currentTheme = localStorage.getItem('hod_theme');
            if (currentTheme) {
                applyHodTheme(currentTheme);
            } else {
                applyHodTheme('light');
            }
        })();

        window.addEventListener('storage', function(e) {
            if (e.key === 'hod_theme') {
                applyHodTheme(e.newValue || 'light');
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            const themeCheckboxes = document.querySelectorAll('.theme-checkbox');
            themeCheckboxes.forEach(cb => {
                cb.checked = (localStorage.getItem('hod_theme') === 'dark');
                cb.addEventListener('change', function(e) {
                    const newTheme = e.target.checked ? 'dark' : 'light';
                    localStorage.setItem('hod_theme', newTheme);
                    applyHodTheme(newTheme);
                });
            });
        });
    



        const API_CONFIG = {
            BASE_URL: 'http://localhost:8000/api',
            ENDPOINTS: {
                DASHBOARD: '/hod/dashboard',
                FACULTY: '/hod/faculty',
                ADD_FACULTY: '/hod/faculty',
                FACULTY_DETAILS: '/hod/faculty',
                ANALYTICS: '/hod/analytics',
                REPORTS: '/hod/reports/generate',
                APPROVALS: '/hod/approvals/pending',
                CURRICULUM: '/hod/curriculum',
                USER_PROFILE: '/users/profile',
                LOGOUT: '/auth/logout',
                CURRICULUM_STATS: '/hod/curriculum/stats',
                COURSES: '/hod/courses',
                ADD_COURSE: '/hod/courses',
                ADD_SYLLABUS: '/hod/courses',
                ACADEMIC_CALENDAR: '/hod/academic-calendar',
                ASSIGN_FACULTY: '/hod/courses/assign-faculty',
                RESOURCES: '/hod/resources',
                RESOURCE_STATS: '/hod/resources/stats',
                ADD_RESOURCE: '/hod/resources',
                RESOURCE_DETAILS: '/hod/resources',
                RESOURCE_REQUESTS: '/hod/resource-requests',
                SOFTWARE_LICENSES: '/hod/software-licenses',
                RESOURCE_MAINTENANCE: '/hod/resource-maintenance',
                RESOURCE_REPORTS: '/hod/resources/reports',
                DEPARTMENT_ANALYTICS: '/hod/department/analytics',
                FACULTY_ANALYTICS: '/hod/analytics/faculty',
                STUDENT_ANALYTICS: '/hod/analytics/students',
                COURSE_ANALYTICS: '/hod/analytics/courses',
                RESOURCE_ANALYTICS: '/hod/analytics/resources',
                RESEARCH_ANALYTICS: '/hod/analytics/research',
                GENERATE_INSIGHTS: '/hod/analytics/generate-insights',
                EXPORT_ANALYTICS: '/hod/analytics/export',
                DEPARTMENT_SETTINGS: '/hod/department/settings',
                DEPARTMENT_INFO: '/hod/department/info',
                DEPARTMENT_LOCATION: '/hod/department/location',
                RESET_SETTINGS: '/hod/department/settings/reset',
                BACKUP_SETTINGS: '/hod/department/settings/backup',
                CREATE_BACKUP: '/hod/department/settings/create-backup',
                RESTORE_BACKUP: '/hod/department/settings/restore',
                IMPORT_SETTINGS: '/hod/department/settings/import',
                CLEAR_CACHE: '/hod/department/clear-cache',
                CLEANUP_DATA: '/hod/department/cleanup-data',
                TRANSFER_OWNERSHIP: '/hod/department/transfer-ownership',
                ARCHIVE_DEPARTMENT: '/hod/department/archive'
            }
        };

        // State Management
        const appState = {
            currentUser: null,
            currentPage: 'dashboard',
            facultyData: [],
            departmentStats: null,
            isLoading: false,
            charts: {},
            approvalsData: []
        };

        // Utility Functions
        class Utils {
            static showNotification(message, type = 'info') {
                const colors = {
                    info: '#3b82f6',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444'
                };

                const notification = document.createElement('div');
                notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${colors[type]};
                color: white;
                border-radius: 10px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
                notification.textContent = message;
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            }

            static formatNumber(num) {
                return new Intl.NumberFormat().format(num);
            }

            static async fetchWithAuth(url, options = {}) {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    window.location.href = 'login.html';
                    return null;
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                };

                try {
                    const response = await fetch(url, { ...options, headers });

                    if (response.status === 401) {
                        localStorage.clear();
                        window.location.href = 'login.html';
                        return null;
                    }

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }

                    return response.json();
                } catch (error) {
                    console.error('Fetch error:', error);
                    Utils.showNotification('Network error. Please check your connection.', 'error');
                    throw error;
                }
            }

            static async postWithAuth(url, data = {}) {
                return Utils.fetchWithAuth(url, {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
        }
        // Add this at the beginning of your script (after Utils class)
        class ModalManager {
            constructor() {
                this.activeModal = null;
                this.init();
            }

            init() {
                this.setupGlobalModalHandlers();
            }

            setupGlobalModalHandlers() {
                // Close modal on outside click
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            this.closeModal(modal);
                        }
                    });
                });

                // Close modal on ESC key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.activeModal) {
                        this.closeModal(this.activeModal);
                    }
                });

                // Add body class when modal opens
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach(mutation => {
                        if (mutation.attributeName === 'class') {
                            const hasActiveModal = document.querySelector('.modal.active');
                            if (hasActiveModal) {
                                document.body.classList.add('modal-open');
                                this.activeModal = hasActiveModal;
                            } else {
                                document.body.classList.remove('modal-open');
                                this.activeModal = null;
                            }
                        }
                    });
                });

                // Observe all modals
                document.querySelectorAll('.modal').forEach(modal => {
                    observer.observe(modal, { attributes: true });
                });
            }

            closeModal(modal) {
                modal.classList.remove('active');
            }

            openModal(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                }
            }
        }

        // Initialize Modal Manager
        let modalManager;
        document.addEventListener('DOMContentLoaded', () => {
            modalManager = new ModalManager();
            window.modalManager = modalManager;
        });

        // Main Application
        class HODDashboard {
            constructor() {
                this.init();
            }

            async init() {
                await this.checkAuth();
                this.setupEventListeners();
                await this.loadUserData();
                await this.loadDashboardData();
                this.setupCharts();
            }

            async checkAuth() {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    window.location.href = 'login.html';
                }
            }

            setupEventListeners() {
                // Menu navigation
                document.querySelectorAll('.menu-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const page = link.getAttribute('data-page');
                        this.navigateTo(page);
                    });
                });

                // Logout
                document.getElementById('logoutBtn').addEventListener('click', () => {
                    this.logout();
                });

                // Faculty Management buttons
                document.getElementById('addFacultyBtn')?.addEventListener('click', () => {
                    this.showAddFacultyModal();
                });

                document.getElementById('importFacultyBtn')?.addEventListener('click', () => {
                    this.importFacultyData();
                });

                document.getElementById('closeFacultyModal')?.addEventListener('click', () => {
                    this.hideAddFacultyModal();
                });

                document.getElementById('cancelFacultyModal')?.addEventListener('click', () => {
                    this.hideAddFacultyModal();
                });

                // Faculty form submission
                document.getElementById('facultyForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addNewFaculty();
                });

                // Search functionality
                document.getElementById('searchFacultyBtn')?.addEventListener('click', () => {
                    this.searchFaculty();
                });

                document.getElementById('facultySearch')?.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchFaculty();
                    }
                });

                // Dashboard buttons
                document.getElementById('generateReport')?.addEventListener('click', () => {
                    this.generateReport();
                });

                document.getElementById('departmentMeeting')?.addEventListener('click', () => {
                    this.scheduleMeeting();
                });

                // Modal close on outside click
                document.getElementById('addFacultyModal')?.addEventListener('click', (e) => {
                    if (e.target.id === 'addFacultyModal') {
                        this.hideAddFacultyModal();
                    }
                });
            }

            async loadUserData() {
                try {
                    const userData = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE}`
                    );

                    if (userData) {
                        appState.currentUser = userData;
                        this.updateUserUI(userData);
                        localStorage.setItem('user_data', JSON.stringify(userData));
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                    // Fallback to localStorage data
                    const cachedUser = localStorage.getItem('user_data');
                    if (cachedUser) {
                        appState.currentUser = JSON.parse(cachedUser);
                        this.updateUserUI(appState.currentUser);
                    }
                }
            }

            updateUserUI(user) {
                if (!user) return;

                document.getElementById('userName').textContent = user.full_name || user.name || 'HOD';
                document.getElementById('userAvatar').textContent = (user.full_name || user.name || 'H').charAt(0);
                document.getElementById('welcomeTitle').textContent = `${user.department || 'Department'} Dashboard`;
                document.getElementById('userDepartment').textContent = `HOD • ${user.department || 'Department'}`;
            }

            async loadDashboardData() {
                try {
                    const dashboardData = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}`
                    );

                    if (dashboardData) {
                        this.renderDashboardStats(dashboardData);
                        this.renderFacultyQuickView(dashboardData.faculty_quick_view || []);
                        Utils.showNotification('Dashboard data loaded successfully', 'success');
                    }
                } catch (error) {
                    console.error('Error loading dashboard data:', error);
                    Utils.showNotification('Failed to load dashboard data. Using sample data.', 'warning');
                    this.loadSampleDashboardData();
                }
            }

            async loadResourcesData() {
                try {
                    // Initialize resources manager if not already
                    if (!window.resourcesManager) {
                        window.resourcesManager = new ResourcesManager();
                        await window.resourcesManager.initResources();
                    } else if (!window.resourcesManager.initialized) {
                        await window.resourcesManager.initResources();
                    }

                } catch (error) {
                    console.error('Error loading resources in HODDashboard:', error);
                    Utils.showNotification('Failed to load resources data', 'error');
                }
            }

            renderDashboardStats(data) {
                const container = document.getElementById('overview-stats');
                if (!container) return;

                const stats = data.department_stats || {};

                container.innerHTML = `
                <div class="overview-card">
                    <div class="overview-header">
                        <div class="overview-icon">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <div class="overview-change ${stats?.students?.change >= 0 ? 'change-up' : 'change-down'}">
                            ${stats?.students?.change >= 0 ? '+' : ''}${stats?.students?.change || 0}%
                        </div>
                    </div>
                    <div class="overview-value">${Utils.formatNumber(stats?.students?.total || 0)}</div>
                    <div class="overview-label">Total Students</div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-header">
                        <div class="overview-icon">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div class="overview-change ${stats?.faculty?.change >= 0 ? 'change-up' : 'change-down'}">
                            ${stats?.faculty?.change >= 0 ? '+' : ''}${stats?.faculty?.change || 0}
                        </div>
                    </div>
                    <div class="overview-value">${stats?.faculty?.total || 0}</div>
                    <div class="overview-label">Faculty Members</div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-header">
                        <div class="overview-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="overview-change ${stats?.pass_percentage?.change >= 0 ? 'change-up' : 'change-down'}">
                            ${stats?.pass_percentage?.change >= 0 ? '+' : ''}${stats?.pass_percentage?.change || 0}%
                        </div>
                    </div>
                    <div class="overview-value">${stats?.pass_percentage?.value || 0}%</div>
                    <div class="overview-label">Overall Pass Percentage</div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-header">
                        <div class="overview-icon">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div class="overview-change ${stats?.placement?.change >= 0 ? 'change-up' : 'change-down'}">
                            ${stats?.placement?.change >= 0 ? '+' : ''}${stats?.placement?.change || 0}%
                        </div>
                    </div>
                    <div class="overview-value">${stats?.placement?.value || 0}%</div>
                    <div class="overview-label">Placement Rate</div>
                </div>
            `;
            }

            renderFacultyQuickView(faculty) {
                const container = document.getElementById('faculty-quick-view');
                if (!container) return;

                if (!faculty || faculty.length === 0) {
                    container.innerHTML = `
                    <div class="management-card" style="grid-column: 1 / -1;">
                        <div class="card-header">
                            <div class="card-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="card-title">No Faculty Data</div>
                        </div>
                        <p style="color: var(--text-muted); text-align: center; padding: 20px;">
                            No faculty data available. Add faculty members to get started.
                        </p>
                    </div>
                `;
                    return;
                }

                const presentCount = faculty.filter(f => f.status === 'present').length;
                const leaveCount = faculty.filter(f => f.status === 'leave').length;

                container.innerHTML = `
                <div class="management-card">
                    <div class="card-header">
                        <div class="card-icon">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="card-title">Attendance & Leaves</div>
                    </div>
                    <ul class="card-list">
                        <li class="card-item">
                            <div class="item-name">
                                <i class="fas fa-circle" style="color: var(--secondary); font-size: 10px;"></i>
                                <span>Present Today</span>
                            </div>
                            <div class="item-status status-active">${presentCount}/${faculty.length}</div>
                        </li>
                        <li class="card-item">
                            <div class="item-name">
                                <i class="fas fa-circle" style="color: #f59e0b; font-size: 10px;"></i>
                                <span>On Leave</span>
                            </div>
                            <div class="item-status status-pending">${leaveCount}</div>
                        </li>
                    </ul>
                    <div class="card-action">
                        <button class="btn-secondary" style="width: 100%;" onclick="app.navigateTo('faculty')">
                            <i class="fas fa-chalkboard-teacher"></i> View All Faculty
                        </button>
                    </div>
                </div>
                
                <div class="management-card">
                    <div class="card-header">
                        <div class="card-icon">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <div class="card-title">Workload Distribution</div>
                    </div>
                    <ul class="card-list">
                        <li class="card-item">
                            <div class="item-name">
                                <i class="fas fa-book"></i>
                                <span>Total Courses</span>
                            </div>
                            <div>${faculty.reduce((sum, f) => sum + (f.classes_taught || 0), 0)}</div>
                        </li>
                        <li class="card-item">
                            <div class="item-name">
                                <i class="fas fa-user-graduate"></i>
                                <span>Avg. Students/Faculty</span>
                            </div>
                            <div>${Math.round(faculty.reduce((sum, f) => sum + (f.student_count || 0), 0) / faculty.length) || 0}</div>
                        </li>
                    </ul>
                    <div class="card-action">
                        <button class="btn-secondary" style="width: 100%;" onclick="app.navigateTo('curriculum')">
                            <i class="fas fa-calendar-alt"></i> View Schedule
                        </button>
                    </div>
                </div>
                
                <div class="management-card">
                    <div class="card-header">
                        <div class="card-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="card-title">Performance Metrics</div>
                    </div>
                    <ul class="card-list">
                        <li class="card-item">
                            <div class="item-name">
                                <i class="fas fa-star"></i>
                                <span>Avg. Student Rating</span>
                            </div>
                            <div>${(faculty.reduce((sum, f) => sum + (f.avg_rating || 0), 0) / faculty.length).toFixed(1)}/5</div>
                        </li>
                        <li class="card-item">
                            <div class="item-name">
                                <i class="fas fa-paper-plane"></i>
                                <span>Research Papers</span>
                            </div>
                            <div>${faculty.reduce((sum, f) => sum + (f.research_papers || 0), 0)}</div>
                        </li>
                    </ul>
                    <div class="card-action">
                        <button class="btn-secondary" style="width: 100%;" onclick="app.navigateTo('analytics')">
                            <i class="fas fa-chart-line"></i> View Detailed Analytics
                        </button>
                    </div>
                </div>
            `;
            }

            setupCharts() {
                // Performance Chart - Using sample data initially, will be updated with real data
                const performanceCtx = document.getElementById('performanceChart');
                if (performanceCtx) {
                    const ctx = performanceCtx.getContext('2d');
                    if (appState.charts.performance) {
                        appState.charts.performance.destroy();
                    }

                    appState.charts.performance = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [
                                {
                                    label: 'Pass Percentage',
                                    data: [85, 88, 90, 87, 92, 95],
                                    borderColor: '#8b5cf6',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                },
                                {
                                    label: 'Placement Rate',
                                    data: [78, 82, 85, 88, 90, 94],
                                    borderColor: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#94a3b8',
                                        font: {
                                            size: 12
                                        }
                                    }
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    titleColor: '#e2e8f0',
                                    bodyColor: '#94a3b8',
                                    borderColor: 'rgba(139, 92, 246, 0.5)'
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    min: 70,
                                    max: 100,
                                    ticks: {
                                        color: '#94a3b8',
                                        callback: function (value) {
                                            return value + '%';
                                        }
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    }
                                },
                                x: {
                                    ticks: {
                                        color: '#94a3b8'
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }
                            }
                        }
                    });
                }
            }

            async navigateTo(page) {
                // Update menu active state
                document.querySelectorAll('.menu-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-page') === page) {
                        link.classList.add('active');
                    }
                });

                // Hide all pages
                document.querySelectorAll('.page-container').forEach(container => {
                    container.classList.remove('active');
                });

                // Show selected page
                const pageElement = document.getElementById(`${page}-page`);
                const mc = document.getElementById('mailContainer');

                if (page === 'mail') {
                    if (mc) {
                        mc.style.display = 'flex';
                        if (typeof showMailSection === 'function') {
                            showMailSection();
                        } else {
                            loadMails('inbox');
                            loadMailStats();
                        }
                    }
                    appState.currentPage = 'mail';
                } else {
                    if (mc) mc.style.display = 'none';
                    if (pageElement) {
                        pageElement.classList.add('active');
                        appState.currentPage = page;

                        // Load page-specific data
                        switch (page) {
                            case 'faculty':
                                await this.loadFacultyManagementData();
                                break;
                            case 'analytics':
                                await this.loadAnalyticsData();
                                break;
                            case 'curriculum':
                                await this.loadCurriculumData();
                                break;
                            case 'approvals':
                                await this.loadApprovalsData();
                                break;
                            case 'resources':
                                await this.loadResourcesData();
                                break;
                            case 'reports':
                                await this.loadReportsData();
                                break;
                            case 'settings':
                                await this.loadSettingsData();
                                break;
                        }
                    }
                }
            }

            async loadFacultyManagementData() {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FACULTY}`
                    );

                    if (response && response.faculty) {
                        appState.facultyData = response.faculty;
                        this.renderFacultyManagementView(appState.facultyData);
                        this.updateFacultyCharts(appState.facultyData);
                        Utils.showNotification('Faculty data loaded successfully', 'success');
                    } else {
                        Utils.showNotification('No faculty data available', 'warning');
                    }
                } catch (error) {
                    console.error('Error loading faculty data:', error);
                    Utils.showNotification('Failed to load faculty data', 'error');
                }
            }

            renderFacultyManagementView(faculty) {
                // Render faculty cards
                const gridContainer = document.getElementById('faculty-grid-container');
                if (gridContainer) {
                    if (!faculty || faculty.length === 0) {
                        gridContainer.innerHTML = `
                        <div class="faculty-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                            <div class="faculty-header" style="justify-content: center; margin-bottom: 20px;">
                                <div class="card-icon" style="background: rgba(239, 68, 68, 0.2); color: var(--danger);">
                                    <i class="fas fa-users-slash"></i>
                                </div>
                            </div>
                            <h3 style="margin-bottom: 10px;">No Faculty Members</h3>
                            <p style="color: var(--text-muted); margin-bottom: 20px;">
                                No faculty members found in the department.
                            </p>
                            <button class="btn-primary" onclick="app.showAddFacultyModal()">
                                <i class="fas fa-user-plus"></i> Add First Faculty Member
                            </button>
                        </div>
                    `;
                        return;
                    }

                    const cardsHTML = faculty.map(f => `
                    <div class="faculty-card">
                        <div class="faculty-header">
                            <div class="faculty-avatar">${(f.name || f.full_name || 'F').charAt(0)}</div>
                            <div class="faculty-info">
                                <h3>${f.name || f.full_name || 'Unknown Faculty'}</h3>
                                <p>${f.designation || 'Faculty'} • ${f.specialization || 'General'}</p>
                            </div>
                        </div>
                        
                        <div class="faculty-stats">
                            <div class="stat-item">
                                <div class="stat-value">${f.classes_taught || 0}</div>
                                <div class="stat-label">Classes</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${f.avg_rating?.toFixed(1) || 'N/A'}</div>
                                <div class="stat-label">Rating</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${f.status === 'present' ? 'Active' : 'Leave'}</div>
                                <div class="stat-label">Status</div>
                            </div>
                        </div>
                        
                        <div class="progress-section">
                            <div class="progress-item">
                                <div class="progress-header">
                                    <span>Workload</span>
                                    <span>${f.workload_percentage || 0}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${f.workload_percentage || 0}%"></div>
                                </div>
                            </div>
                            
                            <div class="progress-item">
                                <div class="progress-header">
                                    <span>Research Progress</span>
                                    <span>${f.research_progress || 0}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${f.research_progress || 0}%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 15px; display: flex; gap: 10px;">
                            <button class="btn-secondary" onclick="app.viewFacultyDetails('${f.faculty_id || f._id || f.id}')" style="flex: 1;">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn-primary" onclick="app.editFaculty('${f.faculty_id || f._id || f.id}')" style="flex: 1;">
                                <i class="fas fa-edit"></i> Details
                            </button>
                        </div>
                    </div>
                `).join('');

                    gridContainer.innerHTML = cardsHTML;
                }

                // Render faculty table
                const tableBody = document.getElementById('faculty-table-body');
                if (tableBody) {
                    const tableRows = faculty.map(f => `
                    <tr>
                        <td>${f.name || f.full_name || 'Unknown'}</td>
                        <td>${f.email || 'N/A'}</td>
                        <td>${f.specialization || 'General'}</td>
                        <td>${f.classes_taught || 0} courses</td>
                        <td>${f.avg_rating?.toFixed(1) || 'N/A'}/5</td>
                        <td>
                            <span class="item-status ${f.status === 'present' ? 'status-active' : 'status-pending'}">
                                ${f.status === 'present' ? 'Active' : 'On Leave'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-secondary" onclick="app.viewFacultyDetails('${f.faculty_id || f._id || f.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-primary" onclick="app.editFaculty('${f.faculty_id || f._id || f.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');

                    tableBody.innerHTML = tableRows;
                }
            }

            updateFacultyCharts(faculty) {
                // Faculty Rating Chart
                const ratingCtx = document.getElementById('facultyRatingChart');
                if (ratingCtx && faculty.length > 0) {
                    const ctx = ratingCtx.getContext('2d');
                    if (appState.charts.facultyRating) {
                        appState.charts.facultyRating.destroy();
                    }

                    const ratings = faculty.map(f => f.avg_rating || 0);
                    const names = faculty.map(f => (f.name || f.full_name || 'Faculty').split(' ')[0]);

                    appState.charts.facultyRating = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: names.slice(0, 10), // Limit to 10 for readability
                            datasets: [{
                                label: 'Faculty Ratings',
                                data: ratings.slice(0, 10),
                                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                                borderColor: '#8b5cf6',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#94a3b8'
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            return `Rating: ${context.raw.toFixed(1)}/5`;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 5,
                                    ticks: {
                                        color: '#94a3b8',
                                        stepSize: 1
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    }
                                },
                                x: {
                                    ticks: {
                                        color: '#94a3b8'
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }
                            }
                        }
                    });
                }

                // Workload Distribution Chart
                const workloadCtx = document.getElementById('workloadDistributionChart');
                if (workloadCtx && faculty.length > 0) {
                    const ctx = workloadCtx.getContext('2d');
                    if (appState.charts.workload) {
                        appState.charts.workload.destroy();
                    }

                    const workloads = faculty.map(f => f.workload_percentage || 0);
                    const colors = [
                        '#8b5cf6', '#6366f1', '#4f46e5', '#10b981', '#0ea5e9',
                        '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'
                    ];

                    appState.charts.workload = new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: faculty.map(f => (f.name || f.full_name || 'Faculty').split(' ')[0]),
                            datasets: [{
                                data: workloads,
                                backgroundColor: colors.slice(0, faculty.length),
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        color: '#94a3b8',
                                        padding: 20
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            return `${context.label}: ${context.raw}% workload`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }

            showAddFacultyModal() {
                document.getElementById('addFacultyModal').classList.add('active');
            }

            hideAddFacultyModal() {
                document.getElementById('addFacultyModal').classList.remove('active');
                document.getElementById('facultyForm').reset();
            }

            async addNewFaculty() {
                const form = document.getElementById('facultyForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const facultyData = {
                    name: document.getElementById('facultyName').value,
                    email: document.getElementById('facultyEmail').value,
                    specialization: document.getElementById('facultySpecialization').value,
                    designation: document.getElementById('facultyDesignation').value,
                    department: appState.currentUser?.department || 'Computer Science'
                };

                try {
                    this.setLoading(true);

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_FACULTY}`,
                        facultyData
                    );

                    if (response) {
                        Utils.showNotification('Faculty added successfully!', 'success');
                        this.hideAddFacultyModal();
                        await this.loadFacultyManagementData();
                    }
                } catch (error) {
                    console.error('Error adding faculty:', error);
                    Utils.showNotification('Error adding faculty. Please try again.', 'error');
                } finally {
                    this.setLoading(false);
                }
            }

            setLoading(isLoading) {
                appState.isLoading = isLoading;
                const submitText = document.getElementById('submitBtnText');
                const submitLoading = document.getElementById('submitBtnLoading');

                if (submitText && submitLoading) {
                    if (isLoading) {
                        submitText.style.display = 'none';
                        submitLoading.style.display = 'inline-block';
                    } else {
                        submitText.style.display = 'inline';
                        submitLoading.style.display = 'none';
                    }
                }
            }

            searchFaculty() {
                const searchTerm = document.getElementById('facultySearch').value.toLowerCase();
                const filter = document.getElementById('facultyFilter').value;

                let filteredFaculty = appState.facultyData;

                if (searchTerm) {
                    filteredFaculty = filteredFaculty.filter(f =>
                        (f.name && f.name.toLowerCase().includes(searchTerm)) ||
                        (f.full_name && f.full_name.toLowerCase().includes(searchTerm)) ||
                        (f.email && f.email.toLowerCase().includes(searchTerm)) ||
                        (f.specialization && f.specialization.toLowerCase().includes(searchTerm))
                    );
                }

                if (filter !== 'all') {
                    filteredFaculty = filteredFaculty.filter(f => {
                        if (filter === 'active') return f.status === 'present';
                        if (filter === 'on-leave') return f.status === 'leave';
                        if (filter === 'probation') return f.status === 'probation';
                        return true;
                    });
                }

                this.renderFacultyManagementView(filteredFaculty);
            }

            async viewFacultyDetails(facultyId) {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FACULTY_DETAILS}/${facultyId}`
                    );

                    if (response) {
                        const faculty = response;
                        let message = `Faculty Details:\n\n`;
                        message += `Name: ${faculty.personal_info?.name || 'N/A'}\n`;
                        message += `Email: ${faculty.personal_info?.email || 'N/A'}\n`;
                        message += `Designation: ${faculty.personal_info?.designation || 'N/A'}\n`;
                        message += `Specialization: ${faculty.personal_info?.specialization?.join(', ') || 'N/A'}\n`;
                        message += `\nPerformance Stats:\n`;
                        message += `Classes Taught: ${faculty.performance_stats?.classes_taught || 0}\n`;
                        message += `Average Rating: ${faculty.performance_stats?.avg_rating || 0}/5\n`;
                        message += `Workload: ${faculty.performance_stats?.workload_percentage || 0}%\n`;

                        alert(message);
                    }
                } catch (error) {
                    console.error('Error fetching faculty details:', error);
                    Utils.showNotification('Failed to load faculty details', 'error');
                }
            }

            editFaculty(facultyId) {
                // For now, just show an alert. You can implement edit functionality later
                const faculty = appState.facultyData.find(f =>
                    f.faculty_id === facultyId || f._id === facultyId || f.id === facultyId
                );

                if (faculty) {
                    alert(`Edit functionality for ${faculty.name || faculty.full_name} will be implemented in the next update.`);
                }
            }

            importFacultyData() {
                alert('Faculty import feature will be implemented in the next update.');
            }

            async generateReport() {
                try {
                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}`,
                        {
                            report_type: "monthly",
                            format: "pdf"
                        }
                    );

                    if (response && response.download_url) {
                        // For JSON response
                        if (response.report) {
                            const dataStr = JSON.stringify(response.report, null, 2);
                            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                            const exportFileDefaultName = `department-report-${new Date().toISOString().split('T')[0]}.json`;

                            const linkElement = document.createElement('a');
                            linkElement.setAttribute('href', dataUri);
                            linkElement.setAttribute('download', exportFileDefaultName);
                            linkElement.click();

                            Utils.showNotification('JSON report downloaded successfully!', 'success');
                        } else if (response.message) {
                            Utils.showNotification(response.message, 'success');
                        }
                    }
                } catch (error) {
                    console.error('Error generating report:', error);
                    Utils.showNotification('Error generating report. Please try again.', 'error');
                }
            }

            scheduleMeeting() {
                const date = prompt('Enter meeting date (YYYY-MM-DD):');
                if (date) {
                    const time = prompt('Enter meeting time (HH:MM):');
                    if (time) {
                        Utils.showNotification(`Meeting scheduled for ${date} at ${time}`, 'success');
                    }
                }
            }

            async logout() {
                try {
                    await Utils.postWithAuth(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`);
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
            }

            // Additional page data loading methods
            async loadAnalyticsData() {
                try {
                    const container = document.getElementById('analytics-content');
                    if (container) {
                        container.innerHTML = `
                        <div class="management-card">
                            <h3 class="section-title" style="margin-bottom: 20px;">
                                <i class="fas fa-chart-pie"></i>
                                Department Analytics
                            </h3>
                            <p style="color: var(--text-muted); margin-bottom: 20px;">
                                Loading analytics data...
                            </p>
                        </div>
                    `;
                    }

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS}`,
                        {
                            department: appState.currentUser?.department || "Computer Science",
                            academic_year: "2024-2025",
                            period: "monthly"
                        }
                    );

                    if (response) {
                        this.renderAnalyticsPage(response);
                    }
                } catch (error) {
                    console.error('Error loading analytics:', error);
                    this.renderAnalyticsPage({});
                }
            }

            async loadCurriculumData() {
                try {
                    const container = document.getElementById('curriculum-content');
                    if (container) {
                        container.innerHTML = `
                    <div class="management-card">
                        <h3 class="section-title" style="margin-bottom: 20px;">
                            <i class="fas fa-book-open"></i>
                            Curriculum Management
                        </h3>
                        <div style="text-align: center; padding: 40px;">
                            <div class="loading" style="margin: 0 auto 15px auto;"></div>
                            <p style="color: var(--text-muted);">Loading curriculum data...</p>
                        </div>
                    </div>
                `;
                    }

                    // Initialize curriculum manager
                    if (!window.curriculumManager) {
                        window.curriculumManager = new CurriculumManager();
                    } else {
                        await curriculumManager.loadCurriculumData();
                    }

                } catch (error) {
                    console.error('Error loading curriculum:', error);
                    const container = document.getElementById('curriculum-content');
                    if (container) {
                        container.innerHTML = `
                    <div class="management-card">
                        <h3 class="section-title" style="margin-bottom: 20px;">
                            <i class="fas fa-book-open"></i>
                            Curriculum Management
                        </h3>
                        <p style="color: var(--danger); text-align: center; padding: 40px;">
                            Error loading curriculum data. Please try again.
                        </p>
                    </div>
                `;
                    }
                }
            }

            async loadApprovalsData() {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPROVALS}`
                    );

                    if (response) {
                        appState.approvalsData = response.approvals || [];
                        this.renderApprovalsPage(appState.approvalsData);
                    }
                } catch (error) {
                    console.error('Error loading approvals:', error);
                    this.renderApprovalsPage([]);
                }
            }



            async loadReportsData() {
                try {
                    const container = document.getElementById('reports-content');
                    if (container) {
                        container.innerHTML = `
                <div class="management-card">
                    <h3 class="section-title" style="margin-bottom: 20px;">
                        <i class="fas fa-chart-pie"></i>
                        Reports Management
                    </h3>
                    <div style="text-align: center; padding: 40px;">
                        <div class="loading" style="margin: 0 auto 15px auto;"></div>
                        <p style="color: var(--text-muted);">Loading reports data...</p>
                    </div>
                </div>
            `;
                    }

                    // Initialize reports manager
                    if (!window.reportsManager) {
                        window.reportsManager = new ReportsManager();
                    } else {
                        await reportsManager.loadReportsData();
                    }

                } catch (error) {
                    console.error('Error loading reports:', error);
                    const container = document.getElementById('reports-content');
                    if (container) {
                        container.innerHTML = `
                <div class="management-card">
                    <h3 class="section-title" style="margin-bottom: 20px;">
                        <i class="fas fa-chart-pie"></i>
                        Reports Management
                    </h3>
                    <p style="color: var(--danger); text-align: center; padding: 40px;">
                        Error loading reports data. Please try again.
                    </p>
                </div>
            `;
                    }
                }
            }

            async loadSettingsData() {
                const container = document.getElementById('settings-content');
                if (container) {
                    container.innerHTML = `
                    <div class="management-card">
                        <h3 class="section-title" style="margin-bottom: 20px;">
                            <i class="fas fa-cogs"></i>
                            Department Settings
                        </h3>
                        <p style="color: var(--text-muted);">
                            Settings management features will be implemented in the next update.
                        </p>
                    </div>
                `;
                }
            }

            renderAnalyticsPage(analytics) {
                const container = document.getElementById('analytics-content');
                if (!container) return;

                container.innerHTML = `
                <div class="management-grid">
                    <div class="management-card">
                        <h3 class="section-title" style="margin-bottom: 20px;">
                            <i class="fas fa-chart-pie"></i>
                            Department Overview
                        </h3>
                        <div style="margin-top: 20px;">
                            ${analytics.overview ? `
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                                        <div style="font-size: 12px; color: var(--text-muted);">Total Faculty</div>
                                        <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                                            ${analytics.overview.faculty?.total || 0}
                                        </div>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                                        <div style="font-size: 12px; color: var(--text-muted);">Total Students</div>
                                        <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                                            ${analytics.overview.students?.total || 0}
                                        </div>
                                    </div>
                                </div>
                            ` : '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No analytics data available</p>'}
                        </div>
                    </div>
                    
                    <div class="management-card">
                        <h3 class="section-title" style="margin-bottom: 20px;">
                            <i class="fas fa-chart-area"></i>
                            Performance Trends
                        </h3>
                        <div id="analytics-chart-placeholder" style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                            Chart will be displayed here
                        </div>
                    </div>
                </div>
            `;
            }

            renderCurriculumPage(curriculum) {
                const container = document.getElementById('curriculum-content');
                if (!container) return;

                container.innerHTML = `
                <div class="management-card">
                    <h3 class="section-title" style="margin-bottom: 20px;">
                        <i class="fas fa-book-open"></i>
                        Department Curriculum
                    </h3>
                    
                    ${curriculum.curriculum_structure ? `
                        <div style="margin-top: 20px;">
                            ${Object.entries(curriculum.curriculum_structure).map(([year, semesters]) => `
                                <div style="margin-bottom: 25px;">
                                    <h4 style="color: var(--accent); margin-bottom: 15px; font-size: 18px;">${year}</h4>
                                    ${Object.entries(semesters).map(([semester, courses]) => `
                                        <div style="margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                                            <h5 style="color: var(--text); margin-bottom: 10px;">${semester}</h5>
                                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">
                                                ${courses.map(course => `
                                                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
                                                        <div style="font-weight: 500;">${course.title}</div>
                                                        <div style="font-size: 12px; color: var(--text-muted);">
                                                            ${course.credits} credits • ${course.type}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No curriculum data available</p>'}
                </div>
            `;
            }

            renderApprovalsPage(approvals) {
                const container = document.getElementById('approvals-content');
                if (!container) return;

                container.innerHTML = `
                <div class="management-card">
                    <h3 class="section-title" style="margin-bottom: 20px;">
                        <i class="fas fa-tasks"></i>
                        Pending Approvals
                    </h3>
                    
                    ${approvals.length > 0 ? `
                        <div style="overflow-x: auto; margin-top: 20px;">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Requested By</th>
                                        <th>Date</th>
                                        <th>Priority</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${approvals.map(item => `
                                        <tr>
                                            <td>${item.title || 'Approval Request'}</td>
                                            <td>${item.type || 'general'}</td>
                                            <td>${item.requested_by || 'Unknown'}</td>
                                            <td>${new Date(item.requested_at).toLocaleDateString()}</td>
                                            <td>
                                                <span class="item-status ${item.priority === 'high' ? 'status-pending' : 'status-active'}">
                                                    ${item.priority || 'medium'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn-primary" style="padding: 5px 10px;" onclick="app.processApproval('${item.id}')">
                                                    <i class="fas fa-check"></i> Review
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No pending approvals</p>'}
                </div>
            `;
            }

            async processApproval(approvalId) {
                const action = prompt("Enter action (approve/reject/defer):");
                if (action && ['approve', 'reject', 'defer'].includes(action.toLowerCase())) {
                    const comments = prompt("Enter comments (optional):");

                    try {
                        const formData = new FormData();
                        formData.append('action', action);
                        if (comments) formData.append('comments', comments);

                        const response = await fetch(
                            `${API_CONFIG.BASE_URL}/hod/approvals/${approvalId}/action`,
                            {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                                },
                                body: formData
                            }
                        );

                        if (response.ok) {
                            Utils.showNotification(`Approval ${action}ed successfully`, 'success');
                            await this.loadApprovalsData();
                        } else {
                            Utils.showNotification('Failed to process approval', 'error');
                        }
                    } catch (error) {
                        console.error('Error processing approval:', error);
                        Utils.showNotification('Error processing approval', 'error');
                    }
                }
            }

            // Sample data fallback
            loadSampleDashboardData() {
                const sampleData = {
                    department_stats: {
                        students: { total: 450, change: 5 },
                        faculty: { total: 32, change: 2 },
                        pass_percentage: { value: 87, change: 3 },
                        placement: { value: 92, change: 4 }
                    },
                    faculty_quick_view: []
                };

                this.renderDashboardStats(sampleData);
                this.renderFacultyQuickView(sampleData.faculty_quick_view);
            }
        }

        // Initialize the application
        let app;
        document.addEventListener('DOMContentLoaded', () => {
            app = new HODDashboard();

            // Add CSS animations for notifications
            const style = document.createElement('style');
            style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
            document.head.appendChild(style);

            window.curriculumManager = null;
            window.syllabusManager = new SyllabusManager();
            window.resourcesManager = null;

            // Make app available globally for button click handlers
            window.app = app;
        });

        // Curriculum Management Class
        class CurriculumManager {
            constructor() {
                this.currentCourse = null;
                this.coursesData = [];
                this.curriculumStats = null;
                this.facultyList = [];
                this.initCurriculum();
            }

            initCurriculum() {
                this.setupCurriculumEventListeners();
                this.setupTabs();
                this.loadCurriculumData();
            }

            setupCurriculumEventListeners() {
                // Tab buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.switchTab(e.target.getAttribute('data-tab'));
                    });
                });

                // Course management buttons
                document.getElementById('addCourseBtn')?.addEventListener('click', () => {
                    this.showAddCourseModal();
                });

                document.getElementById('assignFacultyBtn')?.addEventListener('click', () => {
                    this.showAssignFacultyModal();
                });

                document.getElementById('viewCalendarBtn')?.addEventListener('click', () => {
                    this.switchTab('calendar-tab');
                });

                document.getElementById('generateSyllabusBtn')?.addEventListener('click', () => {
                    this.showGenerateSyllabusModal();
                });

                document.getElementById('addCalendarEventBtn')?.addEventListener('click', () => {
                    this.showAddCalendarModal();
                });

                // Course form submission
                document.getElementById('courseForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addNewCourse();
                });

                document.getElementById('assignFacultyForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.assignFacultyToCourse();
                });

                document.getElementById('syllabusForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addSyllabusTopic();
                });

                document.getElementById('calendarForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addCalendarEvent();
                });

                // Course search functionality
                document.getElementById('searchCoursesBtn')?.addEventListener('click', () => {
                    this.searchCourses();
                });

                document.getElementById('clearCourseFilters')?.addEventListener('click', () => {
                    this.clearCourseFilters();
                });

                document.getElementById('courseSearch')?.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchCourses();
                    }
                });

                // Modal close buttons
                document.getElementById('closeCourseModal')?.addEventListener('click', () => {
                    this.hideAddCourseModal();
                });

                document.getElementById('cancelCourseModal')?.addEventListener('click', () => {
                    this.hideAddCourseModal();
                });

                document.getElementById('closeAssignModal')?.addEventListener('click', () => {
                    this.hideAssignFacultyModal();
                });

                document.getElementById('cancelAssignModal')?.addEventListener('click', () => {
                    this.hideAssignFacultyModal();
                });

                document.getElementById('closeSyllabusModal')?.addEventListener('click', () => {
                    this.hideAddSyllabusModal();
                });

                document.getElementById('cancelSyllabusModal')?.addEventListener('click', () => {
                    this.hideAddSyllabusModal();
                });

                document.getElementById('closeCalendarModal')?.addEventListener('click', () => {
                    this.hideAddCalendarModal();
                });

                document.getElementById('cancelCalendarModal')?.addEventListener('click', () => {
                    this.hideAddCalendarModal();
                });

                document.getElementById('closeDetailsModal')?.addEventListener('click', () => {
                    this.hideCourseDetailsModal();
                });

                // Modal outside click
                ['addCourseModal', 'assignFacultyModal', 'addSyllabusModal', 'addCalendarModal', 'courseDetailsModal'].forEach(modalId => {
                    document.getElementById(modalId)?.addEventListener('click', (e) => {
                        if (e.target.id === modalId) {
                            this[`hide${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`]();
                        }
                    });
                });

                // Set today's date in calendar forms
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('eventStartDate')?.setAttribute('min', today);
                document.getElementById('eventEndDate')?.setAttribute('min', today);
            }

            setupTabs() {
                // Show first tab by default
                this.switchTab('courses-tab');
            }

            switchTab(tabId) {
                // Update tab buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-tab') === tabId) {
                        btn.classList.add('active');
                    }
                });

                // Show selected tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');

                        // Load data for specific tab if needed
                        switch (tabId) {
                            case 'syllabus-tab':
                                this.loadSyllabusData();
                                break;
                            case 'calendar-tab':
                                this.loadCalendarData();
                                break;
                            case 'assignments-tab':
                                this.loadAssignmentsData();
                                break;
                            case 'structure-tab':
                                this.loadProgramStructure();
                                break;
                        }
                    }
                });
            }

            async loadCurriculumData() {
                try {
                    // Load curriculum statistics
                    const statsResponse = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/curriculum/stats`
                    );

                    if (statsResponse) {
                        this.curriculumStats = statsResponse;
                        this.renderCurriculumStats(statsResponse);
                        this.renderCurriculumCharts(statsResponse);
                        Utils.showNotification('Curriculum data loaded successfully', 'success');
                    }

                    // Load courses
                    await this.loadCourses();

                    // Load faculty list for assignments
                    await this.loadFacultyForAssignments();

                } catch (error) {
                    console.error('Error loading curriculum data:', error);
                    Utils.showNotification('Failed to load curriculum data', 'error');
                }
            }

            renderCurriculumStats(stats) {
                const container = document.getElementById('curriculum-stats');
                if (!container) return;

                const courseStats = stats.course_statistics || {};
                const curriculumCompleteness = stats.curriculum_completeness || {};

                container.innerHTML = `
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="overview-change change-up">
                        +${courseStats.core_courses || 0}
                    </div>
                </div>
                <div class="overview-value">${courseStats.total_courses || 0}</div>
                <div class="overview-label">Total Courses</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="overview-change ${courseStats.unassigned_courses > 0 ? 'change-down' : 'change-up'}">
                        ${courseStats.unassigned_courses || 0} unassigned
                    </div>
                </div>
                <div class="overview-value">${courseStats.total_credits || 0}</div>
                <div class="overview-label">Total Credits</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="overview-change change-up">
                        +${Math.round(curriculumCompleteness.faculty_assignment_rate || 0)}%
                    </div>
                </div>
                <div class="overview-value">${Math.round(curriculumCompleteness.faculty_assignment_rate || 0)}%</div>
                <div class="overview-label">Faculty Assignment Rate</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="overview-change change-up">
                        +${Math.round(curriculumCompleteness.syllabus_coverage || 0)}%
                    </div>
                </div>
                <div class="overview-value">${Math.round(curriculumCompleteness.syllabus_coverage || 0)}%</div>
                <div class="overview-label">Syllabus Coverage</div>
            </div>
        `;
            }

            async loadCourses() {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/courses?limit=100`
                    );

                    if (response && response.courses) {
                        this.coursesData = response.courses;
                        this.renderCoursesGrid(this.coursesData);
                        this.renderCoursesTable(this.coursesData);
                        this.populateCourseDropdowns();
                    }
                } catch (error) {
                    console.error('Error loading courses:', error);
                    Utils.showNotification('Failed to load courses', 'error');
                }
            }

            renderCoursesGrid(courses) {
                const container = document.getElementById('courses-grid-container');
                if (!container) return;

                if (!courses || courses.length === 0) {
                    container.innerHTML = `
                <div class="course-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div style="margin-bottom: 20px;">
                        <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                            <i class="fas fa-book-open"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">No Courses Found</h3>
                        <p style="color: var(--text-muted); margin-bottom: 20px;">
                            No courses have been created for your department yet.
                        </p>
                    </div>
                    <button class="btn-primary" onclick="curriculumManager.showAddCourseModal()">
                        <i class="fas fa-plus-circle"></i> Create First Course
                    </button>
                </div>
            `;
                    return;
                }

                const cardsHTML = courses.map(course => `
            <div class="course-card" data-course-id="${course._id || course.id}">
                <div class="course-header">
                    <div class="course-code">${course.course_code || 'N/A'}</div>
                    <div class="course-type type-${course.type || 'core'}">
                        ${course.type ? course.type.charAt(0).toUpperCase() + course.type.slice(1) : 'Core'}
                    </div>
                </div>
                
                <div class="course-title">${course.title || 'Untitled Course'}</div>
                
                <div class="course-description">
                    ${course.description || 'No description available'}
                </div>
                
                <div class="course-meta">
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span>${course.credits || 0} Credits</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Year ${course.year || 1}, Sem ${course.semester || 1}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${course.faculty_assignments_count || 0} Faculty</span>
                    </div>
                </div>
                
                <div class="course-actions">
                    <button class="btn-secondary" onclick="curriculumManager.viewCourseDetails('${course._id || course.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-primary" onclick="curriculumManager.editCourse('${course._id || course.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-secondary" onclick="syllabusManager.viewCourseSyllabus('${course._id || course.id}')">
    <i class="fas fa-file-pdf"></i> Syllabus
</button>
                    ${(course.faculty_assignments_count || 0) === 0 ? `
                        <button class="btn-secondary" onclick="curriculumManager.showAssignFacultyModal('${course._id || course.id}')">
                            <i class="fas fa-user-plus"></i> Assign
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

                container.innerHTML = cardsHTML;
            }

            renderCoursesTable(courses) {
                const tableBody = document.getElementById('courses-table-body');
                if (!tableBody) return;

                const rowsHTML = courses.map(course => `
            <tr>
                <td>
                    <div class="course-code" style="display: inline-block; font-size: 14px;">
                        ${course.course_code || 'N/A'}
                    </div>
                </td>
                <td>${course.title || 'Untitled Course'}</td>
                <td>${course.credits || 0}</td>
                <td>Year ${course.year || 1}, Sem ${course.semester || 1}</td>
                <td>
                    <span class="course-type type-${course.type || 'core'}">
                        ${course.type ? course.type.charAt(0).toUpperCase() + course.type.slice(1) : 'Core'}
                    </span>
                </td>
                <td>
                    ${course.assigned_faculty && course.assigned_faculty.length > 0
                        ? course.assigned_faculty.map(name =>
                            `<div style="margin-bottom: 3px; font-size: 12px;">${name}</div>`
                        ).join('')
                        : '<span style="color: var(--danger); font-size: 12px;">Not Assigned</span>'
                    }
                </td>
                <td>
                    ${course.syllabus && course.syllabus.length > 0
                        ? `<span style="color: var(--secondary); font-size: 12px;">${course.syllabus.length} topics</span>`
                        : '<span style="color: var(--text-muted); font-size: 12px;">No syllabus</span>'
                    }
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-secondary" onclick="curriculumManager.viewCourseDetails('${course._id || course.id}')" 
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-primary" onclick="curriculumManager.editCourse('${course._id || course.id}')"
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-secondary" onclick="curriculumManager.manageSyllabus('${course._id || course.id}')"
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-book"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

                tableBody.innerHTML = rowsHTML;
            }

            async loadFacultyForAssignments() {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/faculty?limit=100`
                    );

                    if (response && response.faculty) {
                        this.facultyList = response.faculty;
                        this.populateFacultyDropdown();
                    }
                } catch (error) {
                    console.error('Error loading faculty for assignments:', error);
                }
            }

            populateCourseDropdowns() {
                const courseSelects = ['assignCourseSelect', 'syllabusCourseSelect'];

                courseSelects.forEach(selectId => {
                    const select = document.getElementById(selectId);
                    if (select) {
                        // Clear existing options except first
                        select.innerHTML = '<option value="">-- Select Course --</option>';

                        // Add courses
                        this.coursesData.forEach(course => {
                            const option = document.createElement('option');
                            option.value = course._id || course.id;
                            option.textContent = `${course.course_code} - ${course.title} (Year ${course.year}, Sem ${course.semester})`;
                            select.appendChild(option);
                        });
                    }
                });
            }

            populateFacultyDropdown() {
                const select = document.getElementById('assignFacultySelect');
                if (!select) return;

                // Clear existing options except first
                select.innerHTML = '<option value="">-- Select Faculty --</option>';

                // Add faculty
                this.facultyList.forEach(faculty => {
                    const option = document.createElement('option');
                    option.value = faculty.faculty_id || faculty._id || faculty.id;
                    option.textContent = `${faculty.name || faculty.full_name} - ${faculty.designation || 'Faculty'}`;
                    select.appendChild(option);
                });
            }

            renderCurriculumCharts(stats) {
                // 1. Courses by Year Chart
                const yearCtx = document.getElementById('coursesByYearChart');
                if (yearCtx) {
                    const ctx = yearCtx.getContext('2d');

                    // Destroy existing chart if it exists
                    if (this.yearChart) {
                        this.yearChart.destroy();
                    }

                    const coursesByYear = stats.course_statistics?.courses_by_year || {};
                    const years = Object.keys(coursesByYear);
                    const courseCounts = Object.values(coursesByYear);

                    this.yearChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: years,
                            datasets: [{
                                label: 'Number of Courses',
                                data: courseCounts,
                                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                                borderColor: '#8b5cf6',
                                borderWidth: 1,
                                borderRadius: 5
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                    labels: {
                                        color: '#94a3b8',
                                        font: { family: "'Poppins', sans-serif" }
                                    }
                                },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    titleColor: '#fff',
                                    bodyColor: '#fff'
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        color: '#94a3b8',
                                        stepSize: 1,
                                        font: { family: "'Poppins', sans-serif" }
                                    },
                                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                },
                                x: {
                                    ticks: {
                                        color: '#94a3b8',
                                        font: { family: "'Poppins', sans-serif" }
                                    },
                                    grid: { display: false }
                                }
                            }
                        }
                    });
                }

                // 2. Course Type Distribution Chart
                const typeCtx = document.getElementById('courseTypeDistributionChart');
                if (typeCtx && stats.course_statistics) {
                    const ctx = typeCtx.getContext('2d');

                    // Check and destroy existing chart
                    const existingTypeChart = Chart.getChart(typeCtx);
                    if (existingTypeChart) {
                        existingTypeChart.destroy();
                    }

                    const labels = ['Core', 'Elective', 'Lab', 'Project'];
                    const data = [
                        stats.course_statistics.core_courses || 0,
                        stats.course_statistics.elective_courses || 0,
                        stats.course_statistics.lab_courses || 0,
                        (stats.course_statistics.total_courses || 0) -
                        (stats.course_statistics.core_courses || 0) -
                        (stats.course_statistics.elective_courses || 0) -
                        (stats.course_statistics.lab_courses || 0)
                    ];

                    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: data,
                                backgroundColor: colors,
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                            }]
                        },
                        options: {
                            responsive: true,
                            cutout: '70%',
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        color: '#94a3b8',
                                        padding: 20
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // Modal Management Methods
            showAddCourseModal() {
                document.getElementById('addCourseModal').classList.add('active');
            }

            hideAddCourseModal() {
                document.getElementById('addCourseModal').classList.remove('active');
                document.getElementById('courseForm').reset();
            }

            showAssignFacultyModal(courseId = null) {
                if (courseId) {
                    const select = document.getElementById('assignCourseSelect');
                    if (select) {
                        select.value = courseId;
                    }
                }
                document.getElementById('assignFacultyModal').classList.add('active');
            }

            hideAssignFacultyModal() {
                document.getElementById('assignFacultyModal').classList.remove('active');
                document.getElementById('assignFacultyForm').reset();
            }

            showAddSyllabusModal() {
                document.getElementById('addSyllabusModal').classList.add('active');
            }

            hideAddSyllabusModal() {
                document.getElementById('addSyllabusModal').classList.remove('active');
                document.getElementById('syllabusForm').reset();
            }

            showAddCalendarModal() {
                document.getElementById('addCalendarModal').classList.add('active');
            }

            hideAddCalendarModal() {
                document.getElementById('addCalendarModal').classList.remove('active');
                document.getElementById('calendarForm').reset();
            }

            showCourseDetailsModal(course) {
                document.getElementById('courseDetailsModal').classList.add('active');
                this.renderCourseDetails(course);
            }

            hideCourseDetailsModal() {
                document.getElementById('courseDetailsModal').classList.remove('active');
            }

            showGenerateSyllabusModal() {
                alert('Syllabus generation feature will be implemented in the next update.');
            }

            // API Methods
            async addNewCourse() {
                const form = document.getElementById('courseForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const courseData = {
                    course_code: document.getElementById('courseCode').value,
                    title: document.getElementById('courseTitle').value,
                    description: document.getElementById('courseDescription').value,
                    credits: parseInt(document.getElementById('courseCredits').value),
                    year: parseInt(document.getElementById('courseYear').value),
                    semester: parseInt(document.getElementById('courseSemester').value),
                    type: document.getElementById('courseType').value,
                    department: (document.getElementById('deptDisplay') ? document.getElementById('deptDisplay').innerText : "AI&DS"),
                    prerequisites: document.getElementById('coursePrerequisites').value
                        .split(',')
                        .map(code => code.trim())
                        .filter(code => code),
                    learning_outcomes: document.getElementById('learningOutcomes').value
                        .split('\n')
                        .map(outcome => outcome.trim())
                        .filter(outcome => outcome)
                };

                try {
                    this.setLoading(true, 'course');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/courses`,
                        courseData
                    );

                    if (response) {
                        Utils.showNotification('Course created successfully!', 'success');
                        this.hideAddCourseModal();
                        await this.loadCurriculumData();
                    }
                } catch (error) {
                    console.error('Error creating course:', error);
                    Utils.showNotification('Error creating course. Please try again.', 'error');
                } finally {
                    this.setLoading(false, 'course');
                }
            }

            async assignFacultyToCourse() {
                const form = document.getElementById('assignFacultyForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const assignmentData = {
                    course_id: document.getElementById('assignCourseSelect').value,
                    faculty_id: document.getElementById('assignFacultySelect').value,
                    role: document.getElementById('facultyRole').value,
                    section: document.getElementById('facultySection').value || null
                };

                try {
                    this.setLoading(true, 'assign');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/courses/assign-faculty`,
                        assignmentData
                    );

                    if (response) {
                        Utils.showNotification('Faculty assigned successfully!', 'success');
                        this.hideAssignFacultyModal();
                        await this.loadCurriculumData();
                    }
                } catch (error) {
                    console.error('Error assigning faculty:', error);
                    Utils.showNotification('Error assigning faculty. Please try again.', 'error');
                } finally {
                    this.setLoading(false, 'assign');
                }
            }

            async addSyllabusTopic() {
                const form = document.getElementById('syllabusForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const syllabusData = {
                    course_id: document.getElementById('syllabusCourseSelect').value,
                    week_number: parseInt(document.getElementById('syllabusWeek').value),
                    topic: document.getElementById('syllabusTopic').value,
                    subtopics: document.getElementById('syllabusSubtopics').value
                        .split('\n')
                        .map(topic => topic.trim())
                        .filter(topic => topic),
                    learning_objectives: document.getElementById('syllabusObjectives').value
                        .split('\n')
                        .map(obj => obj.trim())
                        .filter(obj => obj),
                    teaching_method: document.getElementById('teachingMethod').value,
                    assessment_method: 'Quiz/Assignment' // Default for now
                };

                try {
                    this.setLoading(true, 'syllabus');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/courses/${syllabusData.course_id}/syllabus`,
                        syllabusData
                    );

                    if (response) {
                        Utils.showNotification('Syllabus topic added successfully!', 'success');
                        this.hideAddSyllabusModal();
                        await this.loadCurriculumData();
                    }
                } catch (error) {
                    console.error('Error adding syllabus topic:', error);
                    Utils.showNotification('Error adding syllabus topic. Please try again.', 'error');
                } finally {
                    this.setLoading(false, 'syllabus');
                }
            }

            async addCalendarEvent() {
                const form = document.getElementById('calendarForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const calendarData = {
                    event_name: document.getElementById('eventName').value,
                    event_type: document.getElementById('eventType').value,
                    start_date: document.getElementById('eventStartDate').value,
                    end_date: document.getElementById('eventEndDate').value,
                    venue: document.getElementById('eventVenue').value || null,
                    description: document.getElementById('eventDescription').value || null
                };

                try {
                    this.setLoading(true, 'calendar');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/academic-calendar`,
                        calendarData
                    );

                    if (response) {
                        Utils.showNotification('Calendar event created successfully!', 'success');
                        this.hideAddCalendarModal();
                        await this.loadCalendarData();
                    }
                } catch (error) {
                    console.error('Error creating calendar event:', error);
                    Utils.showNotification('Error creating calendar event. Please try again.', 'error');
                } finally {
                    this.setLoading(false, 'calendar');
                }
            }

            async viewCourseDetails(courseId) {
                try {
                    // Find course in loaded data
                    const course = this.coursesData.find(c =>
                        c._id === courseId || c.id === courseId
                    );

                    if (course) {
                        // Get detailed syllabus if available
                        let syllabusHTML = '';
                        if (course.syllabus && course.syllabus.length > 0) {
                            syllabusHTML = `
                        <h3 style="margin-top: 20px; margin-bottom: 15px; color: var(--accent);">Syllabus</h3>
                        <div class="syllabus-timeline">
                            ${course.syllabus.map((topic, index) => `
                                <div class="timeline-item">
                                    <div class="timeline-week">Week ${topic.week_number || index + 1}</div>
                                    <div class="timeline-content">
                                        <h4 style="margin-bottom: 8px;">${topic.topic || 'Topic'}</h4>
                                        ${topic.subtopics && topic.subtopics.length > 0 ? `
                                            <p style="font-size: 14px; margin-bottom: 8px;">
                                                <strong>Subtopics:</strong> ${topic.subtopics.join(', ')}
                                            </p>
                                        ` : ''}
                                        ${topic.learning_objectives && topic.learning_objectives.length > 0 ? `
                                            <p style="font-size: 14px;">
                                                <strong>Learning Objectives:</strong> ${topic.learning_objectives.join(', ')}
                                            </p>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                        }

                        const detailsHTML = `
                    <div style="margin-bottom: 25px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div>
                                <h3 style="color: var(--accent); margin-bottom: 5px;">${course.course_code || 'N/A'}</h3>
                                <h2 style="margin-bottom: 10px;">${course.title || 'Untitled Course'}</h2>
                            </div>
                            <div class="course-type type-${course.type || 'core'}">
                                ${course.type ? course.type.charAt(0).toUpperCase() + course.type.slice(1) : 'Core'}
                            </div>
                        </div>
                        
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                            <p style="line-height: 1.6;">${course.description || 'No description available'}</p>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: var(--text-muted);">Credits</div>
                                <div style="font-size: 24px; font-weight: bold; color: var(--accent);">${course.credits || 0}</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: var(--text-muted);">Year</div>
                                <div style="font-size: 24px; font-weight: bold; color: var(--accent);">${course.year || 1}</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: var(--text-muted);">Semester</div>
                                <div style="font-size: 24px; font-weight: bold; color: var(--accent);">${course.semester || 1}</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 12px; color: var(--text-muted);">Faculty</div>
                                <div style="font-size: 24px; font-weight: bold; color: var(--accent);">${course.faculty_assignments_count || 0}</div>
                            </div>
                        </div>
                        
                        ${course.prerequisites && course.prerequisites.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <h4 style="margin-bottom: 8px; color: var(--text);">Prerequisites</h4>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    ${course.prerequisites.map(code => `
                                        <span style="background: rgba(139, 92, 246, 0.2); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                                            ${code}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${course.learning_outcomes && course.learning_outcomes.length > 0 ? `
                            <div style="margin-bottom: 20px;">
                                <h4 style="margin-bottom: 8px; color: var(--text);">Learning Outcomes</h4>
                                <ul style="padding-left: 20px;">
                                    ${course.learning_outcomes.map(outcome => `
                                        <li style="margin-bottom: 5px; line-height: 1.5;">${outcome}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${syllabusHTML}
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn-primary" onclick="curriculumManager.editCourse('${courseId}')" style="flex: 1;">
                            <i class="fas fa-edit"></i> Edit Course
                        </button>
                        <button class="btn-secondary" onclick="curriculumManager.showAssignFacultyModal('${courseId}')" style="flex: 1;">
                            <i class="fas fa-user-plus"></i> Assign Faculty
                        </button>
                        <button class="btn-secondary" onclick="curriculumManager.manageSyllabus('${courseId}')" style="flex: 1;">
                            <i class="fas fa-book"></i> Manage Syllabus
                        </button>
                    </div>
                `;

                        document.getElementById('courseDetailsTitle').textContent = `${course.course_code} - ${course.title}`;
                        document.getElementById('courseDetailsContent').innerHTML = detailsHTML;
                        this.showCourseDetailsModal(course);
                    }
                } catch (error) {
                    console.error('Error loading course details:', error);
                    Utils.showNotification('Failed to load course details', 'error');
                }
            }

            async loadSyllabusData() {
                const container = document.getElementById('syllabus-content');
                if (!container) return;

                container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="margin-bottom: 20px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                        <i class="fas fa-book"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">Syllabus Management</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        Manage syllabus for all courses in your department.
                    </p>
                </div>
                <button class="btn-primary" onclick="curriculumManager.showAddSyllabusModal()">
                    <i class="fas fa-plus"></i> Add Syllabus Topic
                </button>
            </div>
        `;
            }

            async loadCalendarData() {
                try {
                    const container = document.getElementById('calendar-content');
                    if (!container) return;

                    container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading"></div>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading calendar events...</p>
                </div>
            `;

                    // Load upcoming events from curriculum stats or separate endpoint
                    if (this.curriculumStats && this.curriculumStats.upcoming_events) {
                        this.renderCalendarEvents(this.curriculumStats.upcoming_events);
                    } else {
                        // Fetch calendar events separately
                        const response = await Utils.fetchWithAuth(
                            `${API_CONFIG.BASE_URL}/hod/academic-calendar`
                        );

                        if (response && response.events) {
                            this.renderCalendarEvents(response.events);
                        } else {
                            this.renderCalendarEvents([]);
                        }
                    }
                } catch (error) {
                    console.error('Error loading calendar data:', error);
                    this.renderCalendarEvents([]);
                }
            }

            renderCalendarEvents(events) {
                const container = document.getElementById('calendar-content');
                if (!container) return;

                if (!events || events.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">No Upcoming Events</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        No academic calendar events scheduled for your department.
                    </p>
                    <button class="btn-primary" onclick="curriculumManager.showAddCalendarModal()">
                        <i class="fas fa-plus"></i> Add First Event
                    </button>
                </div>
            `;
                    return;
                }

                const eventsHTML = `
            <div class="calendar-grid">
                ${events.map(event => {
                    const startDate = new Date(event.start_date);
                    const endDate = new Date(event.end_date);
                    const day = startDate.getDate();
                    const month = startDate.toLocaleString('default', { month: 'short' });

                    return `
                        <div class="event-card">
                            <div class="event-date">
                                <div>${day}</div>
                                <div style="font-size: 10px;">${month}</div>
                            </div>
                            <div class="event-title">${event.event_name}</div>
                            <div class="event-type ${event.event_type}">
                                ${event.event_type ? event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1) : 'Event'}
                            </div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">
                                <i class="far fa-calendar"></i> 
                                ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                            </div>
                            ${event.venue ? `
                                <div style="font-size: 12px; color: var(--text-muted);">
                                    <i class="fas fa-map-marker-alt"></i> ${event.venue}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

                container.innerHTML = eventsHTML;
            }

            async loadAssignmentsData() {
                const container = document.getElementById('assignments-content');
                if (!container) return;

                // This would ideally come from a separate endpoint
                // For now, we'll show courses with faculty assignments
                const coursesWithFaculty = this.coursesData.filter(course =>
                    course.faculty_assignments_count > 0
                );

                if (coursesWithFaculty.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">No Faculty Assignments</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        No faculty members have been assigned to courses yet.
                    </p>
                    <button class="btn-primary" onclick="curriculumManager.showAssignFacultyModal()">
                        <i class="fas fa-user-plus"></i> Assign Faculty
                    </button>
                </div>
            `;
                    return;
                }

                const assignmentsHTML = `
            <div class="assignments-grid">
                ${coursesWithFaculty.map(course => `
                    <div class="assignment-card">
                        <div class="assignment-header">
                            <div>
                                <div style="font-weight: 500; color: var(--accent);">${course.course_code}</div>
                                <div style="font-size: 14px;">${course.title}</div>
                            </div>
                            <div class="course-type type-${course.type}">
                                ${course.faculty_assignments_count} Faculty
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">Assigned Faculty:</div>
                            ${course.assigned_faculty && course.assigned_faculty.length > 0
                        ? course.assigned_faculty.map(name =>
                            `<div style="font-size: 14px; margin-bottom: 3px;">• ${name}</div>`
                        ).join('')
                        : '<div style="font-size: 14px; color: var(--text-muted);">No specific faculty assigned</div>'
                    }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

                container.innerHTML = assignmentsHTML;
            }

            async loadProgramStructure() {
                const container = document.getElementById('structure-content');
                if (!container) return;

                // This would come from a separate endpoint
                // For now, we'll create a sample structure based on courses
                const years = [1, 2, 3, 4];
                let structureHTML = '<div class="program-structure">';

                years.forEach(year => {
                    const yearCourses = this.coursesData.filter(course => course.year === year);
                    const semesters = [1, 2];

                    structureHTML += `
                <div style="margin-bottom: 30px;">
                    <h4 style="color: var(--accent); margin-bottom: 15px; font-size: 18px;">Year ${year}</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            `;

                    semesters.forEach(semester => {
                        const semesterCourses = yearCourses.filter(course => course.semester === semester);

                        structureHTML += `
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                        <h5 style="color: var(--text); margin-bottom: 10px; display: flex; justify-content: space-between;">
                            <span>Semester ${semester}</span>
                            <span style="font-size: 12px; color: var(--text-muted);">
                                ${semesterCourses.reduce((sum, course) => sum + (course.credits || 0), 0)} credits
                            </span>
                        </h5>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${semesterCourses.map(course => `
                                <div style="background: rgba(255, 255, 255, 0.03); padding: 8px; border-radius: 6px; margin-bottom: 5px; font-size: 14px;">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>${course.course_code}</span>
                                        <span style="color: var(--text-muted); font-size: 12px;">${course.credits} cr</span>
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${course.title}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                    });

                    structureHTML += `</div></div>`;
                });

                structureHTML += '</div>';

                container.innerHTML = structureHTML;
            }

            searchCourses() {
                const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
                const yearFilter = document.getElementById('courseYearFilter').value;
                const semesterFilter = document.getElementById('courseSemesterFilter').value;
                const typeFilter = document.getElementById('courseTypeFilter').value;

                let filteredCourses = this.coursesData;

                if (searchTerm) {
                    filteredCourses = filteredCourses.filter(course =>
                        (course.course_code && course.course_code.toLowerCase().includes(searchTerm)) ||
                        (course.title && course.title.toLowerCase().includes(searchTerm)) ||
                        (course.description && course.description.toLowerCase().includes(searchTerm))
                    );
                }

                if (yearFilter !== 'all') {
                    filteredCourses = filteredCourses.filter(course =>
                        course.year == yearFilter
                    );
                }

                if (semesterFilter !== 'all') {
                    filteredCourses = filteredCourses.filter(course =>
                        course.semester == semesterFilter
                    );
                }

                if (typeFilter !== 'all') {
                    filteredCourses = filteredCourses.filter(course =>
                        course.type === typeFilter
                    );
                }

                this.renderCoursesGrid(filteredCourses);
                this.renderCoursesTable(filteredCourses);
            }

            clearCourseFilters() {
                document.getElementById('courseSearch').value = '';
                document.getElementById('courseYearFilter').value = 'all';
                document.getElementById('courseSemesterFilter').value = 'all';
                document.getElementById('courseTypeFilter').value = 'all';

                this.renderCoursesGrid(this.coursesData);
                this.renderCoursesTable(this.coursesData);
            }

            editCourse(courseId) {
                // Find the course
                const course = this.coursesData.find(c =>
                    c._id === courseId || c.id === courseId
                );

                if (course) {
                    // For now, show an edit modal or redirect to edit page
                    alert(`Edit functionality for ${course.course_code} will be implemented in the next update.`);
                }
            }

            manageSyllabus(courseId) {
                // Find the course
                const course = this.coursesData.find(c =>
                    c._id === courseId || c.id === courseId
                );

                if (course) {
                    // Pre-select the course in syllabus modal and show it
                    const select = document.getElementById('syllabusCourseSelect');
                    if (select) {
                        select.value = courseId;
                    }
                    this.switchTab('syllabus-tab');
                    this.showAddSyllabusModal();
                }
            }

            setLoading(isLoading, type = '') {
                const btnText = document.getElementById(`${type}SubmitBtnText`);
                const btnLoading = document.getElementById(`${type}SubmitBtnLoading`);

                if (btnText && btnLoading) {
                    if (isLoading) {
                        btnText.style.display = 'none';
                        btnLoading.style.display = 'inline-block';
                    } else {
                        btnText.style.display = 'inline';
                        btnLoading.style.display = 'none';
                    }
                }
            }
        }

        class SyllabusManager {
            constructor() {
                this.selectedPDF = null;
                this.currentCourseId = null;
                this.initSyllabus();
            }

            initSyllabus() {
                this.setupSyllabusEventListeners();
            }

            setupSyllabusEventListeners() {
                // PDF file selection
                document.getElementById('pdfFileInput')?.addEventListener('change', (e) => {
                    this.handlePDFSelection(e.target.files[0]);
                });

                // Process button
                document.getElementById('processSyllabusBtn')?.addEventListener('click', () => {
                    this.processSyllabusPDF();
                });

                // Modal close buttons
                document.getElementById('closeSyllabusUploadModal')?.addEventListener('click', () => {
                    this.hideSyllabusUploadModal();
                });

                document.getElementById('cancelSyllabusUpload')?.addEventListener('click', () => {
                    this.hideSyllabusUploadModal();
                });

                document.getElementById('closeSyllabusViewModal')?.addEventListener('click', () => {
                    this.hideSyllabusViewModal();
                });

                // PDF drag and drop
                const dropZone = document.getElementById('pdfDropZone');
                if (dropZone) {
                    dropZone.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        dropZone.style.borderColor = 'var(--accent)';
                        dropZone.style.background = 'rgba(139, 92, 246, 0.1)';
                    });

                    dropZone.addEventListener('dragleave', () => {
                        dropZone.style.borderColor = 'var(--glass-border)';
                        dropZone.style.background = 'transparent';
                    });

                    dropZone.addEventListener('drop', (e) => {
                        e.preventDefault();
                        dropZone.style.borderColor = 'var(--glass-border)';
                        dropZone.style.background = 'transparent';

                        if (e.dataTransfer.files.length > 0) {
                            const file = e.dataTransfer.files[0];
                            if (file.type === 'application/pdf') {
                                this.handlePDFSelection(file);
                            } else {
                                Utils.showNotification('Please upload only PDF files', 'error');
                            }
                        }
                    });
                }
            }

            handlePDFSelection(file) {
                if (!file) return;

                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    Utils.showNotification('PDF file too large. Max 10MB', 'error');
                    return;
                }

                if (!file.name.toLowerCase().endsWith('.pdf')) {
                    Utils.showNotification('Only PDF files are allowed', 'error');
                    return;
                }

                this.selectedPDF = file;

                // Update UI
                document.getElementById('pdfFileInfo').style.display = 'block';
                document.getElementById('pdfFileName').textContent = file.name;
                document.getElementById('pdfFileSize').textContent = this.formatFileSize(file.size);
                document.getElementById('processSyllabusBtn').disabled = false;

                Utils.showNotification('PDF selected successfully', 'success');
            }

            formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            async processSyllabusPDF() {
                const courseSelect = document.getElementById('syllabusCourseSelect');
                const courseId = courseSelect.value;

                if (!courseId) {
                    Utils.showNotification('Please select a course', 'error');
                    return;
                }

                if (!this.selectedPDF) {
                    Utils.showNotification('Please select a PDF file', 'error');
                    return;
                }

                const unitCount = document.getElementById('unitCountSelect').value;

                // Show processing UI
                document.getElementById('syllabusProcessing').style.display = 'block';
                document.getElementById('processSyllabusBtn').disabled = true;
                document.getElementById('processBtnText').style.display = 'none';
                document.getElementById('processBtnLoading').style.display = 'inline-block';

                try {
                    const formData = new FormData();
                    formData.append('file', this.selectedPDF);
                    formData.append('course_id', courseId);
                    formData.append('unit_count', unitCount);

                    const response = await fetch(
                        `${API_CONFIG.BASE_URL}/hod/curriculum/upload-syllabus-pdf`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            },
                            body: formData
                        }
                    );

                    const result = await response.json();

                    if (response.ok) {
                        // Show success preview
                        this.showSyllabusPreview(result);
                        Utils.showNotification('Syllabus processed successfully!', 'success');

                        // Refresh curriculum data after 3 seconds
                        setTimeout(() => {
                            if (window.curriculumManager) {
                                window.curriculumManager.loadCurriculumData();
                            }
                        }, 3000);
                    } else {
                        throw new Error(result.detail || 'Processing failed');
                    }
                } catch (error) {
                    console.error('Syllabus processing error:', error);
                    Utils.showNotification('Failed to process syllabus: ' + error.message, 'error');
                } finally {
                    // Hide processing UI
                    document.getElementById('syllabusProcessing').style.display = 'none';
                    document.getElementById('processBtnText').style.display = 'inline';
                    document.getElementById('processBtnLoading').style.display = 'none';
                }
            }

            showSyllabusPreview(result) {
                const previewContainer = document.getElementById('unitsPreview');
                const units = result.preview || [];

                const previewHTML = `
            <div style="background: rgba(16, 185, 129, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-check-circle" style="color: var(--secondary);"></i>
                    <span style="font-weight: 500;">${result.units_extracted} units extracted</span>
                </div>
                <div style="font-size: 14px; color: var(--text-muted);">
                    Course: ${result.course?.code || 'N/A'} - ${result.course?.title || 'N/A'}
                </div>
            </div>
            
            ${units.map(unit => `
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h5 style="color: var(--accent);">
                            Unit ${unit.unit_number}: ${unit.title}
                        </h5>
                        <span style="font-size: 12px; background: rgba(139, 92, 246, 0.2); color: var(--accent); padding: 2px 8px; border-radius: 10px;">
                            AI Generated
                        </span>
                    </div>
                    <p style="font-size: 14px; margin-bottom: 10px; color: var(--text-muted);">
                        ${unit.description}
                    </p>
                    ${unit.topics && unit.topics.length > 0 ? `
                        <div style="font-size: 13px;">
                            <strong>Topics:</strong> ${unit.topics.slice(0, 3).join(', ')}${unit.topics.length > 3 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        `;

                previewContainer.innerHTML = previewHTML;
                document.getElementById('syllabusPreview').style.display = 'block';
            }

            async viewCourseSyllabus(courseId) {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/curriculum/${courseId}/syllabus`
                    );

                    if (response && response.has_syllabus) {
                        this.renderSyllabusView(response.syllabus, response.course);
                    } else {
                        this.showNoSyllabusView(courseId);
                    }
                } catch (error) {
                    console.error('Error loading syllabus:', error);
                    Utils.showNotification('Failed to load syllabus', 'error');
                }
            }

            renderSyllabusView(syllabus, course) {
                const title = document.getElementById('syllabusViewTitle');
                const content = document.getElementById('syllabusViewContent');

                title.textContent = `${course.course_code} - Syllabus`;

                const unitsHTML = syllabus.units?.map(unit => `
            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <h3 style="color: var(--accent); margin-bottom: 5px;">
                            Unit ${unit.unit_number}: ${unit.title}
                        </h3>
                        <div style="font-size: 14px; color: var(--text-muted);">
                            ${unit.description}
                        </div>
                    </div>
                    ${syllabus.ai_processed ? `
                        <span style="font-size: 12px; background: rgba(16, 185, 129, 0.2); color: var(--secondary); padding: 4px 10px; border-radius: 12px;">
                            <i class="fas fa-robot"></i> AI Generated
                        </span>
                    ` : ''}
                </div>
                
                ${unit.topics && unit.topics.length > 0 ? `
                    <div style="margin-bottom: 15px;">
                        <h4 style="font-size: 16px; margin-bottom: 8px; color: var(--text);">
                            <i class="fas fa-list"></i> Topics Covered
                        </h4>
                        <ul style="padding-left: 20px;">
                            ${unit.topics.map(topic => `
                                <li style="margin-bottom: 5px;">${topic}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${unit.learning_outcomes && unit.learning_outcomes.length > 0 ? `
                    <div style="margin-bottom: 15px;">
                        <h4 style="font-size: 16px; margin-bottom: 8px; color: var(--text);">
                            <i class="fas fa-bullseye"></i> Learning Outcomes
                        </h4>
                        <ul style="padding-left: 20px;">
                            ${unit.learning_outcomes.map(outcome => `
                                <li style="margin-bottom: 5px;">${outcome}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${unit.references && unit.references.length > 0 ? `
                    <div>
                        <h4 style="font-size: 16px; margin-bottom: 8px; color: var(--text);">
                            <i class="fas fa-book"></i> References
                        </h4>
                        <ul style="padding-left: 20px;">
                            ${unit.references.map(ref => `
                                <li style="margin-bottom: 5px; font-size: 14px; color: var(--text-muted);">${ref}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('') || '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No units found</p>';

                const metadata = syllabus.metadata || {};

                content.innerHTML = `
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <h2 style="color: var(--accent); margin-bottom: 5px;">${course.course_code}</h2>
                        <h3 style="margin-bottom: 10px;">${course.title}</h3>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; color: var(--text-muted);">
                            Uploaded: ${new Date(syllabus.uploaded_at).toLocaleDateString()}
                        </div>
                        <div style="font-size: 12px; color: var(--text-muted);">
                            By: ${syllabus.uploaded_by_name}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Total Units</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                            ${metadata.total_units || syllabus.units?.length || 0}
                        </div>
                    </div>
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Status</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                            ${syllabus.status || 'Active'}
                        </div>
                    </div>
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Processing</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                            ${syllabus.ai_processed ? 'AI' : 'Manual'}
                        </div>
                    </div>
                </div>
            </div>
            
            ${unitsHTML}
            
            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button class="btn-primary" onclick="syllabusManager.downloadSyllabus('${syllabus._id}')">
                    <i class="fas fa-download"></i> Download Syllabus
                </button>
                <button class="btn-secondary" onclick="syllabusManager.deleteSyllabus('${syllabus.course_id}')">
                    <i class="fas fa-trash"></i> Delete Syllabus
                </button>
            </div>
        `;

                this.showSyllabusViewModal();
            }

            showNoSyllabusView(courseId) {
                const content = document.getElementById('syllabusViewContent');

                content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <h3 style="margin-bottom: 10px;">No Syllabus Available</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">
                    No syllabus has been uploaded for this course yet.
                </p>
                <button class="btn-primary" onclick="syllabusManager.showSyllabusUploadModal('${courseId}')">
                    <i class="fas fa-upload"></i> Upload Syllabus PDF
                </button>
            </div>
        `;

                this.showSyllabusViewModal();
            }

            // Modal control methods
            showSyllabusUploadModal(courseId = null) {
                // Populate course dropdown
                const select = document.getElementById('syllabusCourseSelect');
                if (select && courseId) {
                    select.value = courseId;
                }

                document.getElementById('syllabusUploadModal').classList.add('active');
            }

            hideSyllabusUploadModal() {
                document.getElementById('syllabusUploadModal').classList.remove('active');
                this.resetSyllabusUploadForm();
            }

            showSyllabusViewModal() {
                document.getElementById('syllabusViewModal').classList.add('active');
            }

            hideSyllabusViewModal() {
                document.getElementById('syllabusViewModal').classList.remove('active');
            }

            resetSyllabusUploadForm() {
                this.selectedPDF = null;
                document.getElementById('pdfFileInfo').style.display = 'none';
                document.getElementById('pdfFileName').textContent = '';
                document.getElementById('pdfFileSize').textContent = '';
                document.getElementById('processSyllabusBtn').disabled = true;
                document.getElementById('syllabusPreview').style.display = 'none';
                document.getElementById('pdfFileInput').value = '';
            }

            async downloadSyllabus(syllabusId) {
                // Implementation for downloading syllabus as PDF
                Utils.showNotification('Download feature coming soon', 'info');
            }

            async deleteSyllabus(courseId) {
                if (!confirm('Are you sure you want to delete this syllabus? This action cannot be undone.')) {
                    return;
                }

                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/curriculum/${courseId}/syllabus`,
                        { method: 'DELETE' }
                    );

                    if (response.success) {
                        Utils.showNotification('Syllabus deleted successfully', 'success');
                        this.hideSyllabusViewModal();

                        // Refresh curriculum data
                        if (window.curriculumManager) {
                            window.curriculumManager.loadCurriculumData();
                        }
                    }
                } catch (error) {
                    console.error('Delete syllabus error:', error);
                    Utils.showNotification('Failed to delete syllabus', 'error');
                }
            }
        }

        // Approvals Management Class
        class ApprovalsManager {
            constructor() {
                this.approvalsData = [];
                this.pendingApprovals = [];
                this.urgentApprovals = [];
                this.statistics = {};
                this.initApprovals();
            }

            initApprovals() {
                this.setupApprovalsEventListeners();
                this.setupApprovalTabs();
                this.loadApprovalsData();
            }

            setupApprovalsEventListeners() {
                // Tab buttons
                document.querySelectorAll('[data-tab]').forEach(btn => {
                    if (btn.closest('#approvals-page')) {
                        btn.addEventListener('click', (e) => {
                            this.switchApprovalTab(e.target.getAttribute('data-tab'));
                        });
                    }
                });

                // Search and filter
                document.getElementById('searchApprovalsBtn')?.addEventListener('click', () => {
                    this.searchApprovals();
                });

                document.getElementById('clearApprovalFilters')?.addEventListener('click', () => {
                    this.clearApprovalFilters();
                });

                document.getElementById('approvalSearch')?.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchApprovals();
                    }
                });

                // Action buttons
                document.getElementById('quickApproveBtn')?.addEventListener('click', () => {
                    this.showQuickApprove();
                });

                document.getElementById('approvalStatsBtn')?.addEventListener('click', () => {
                    this.showDetailedStatistics();
                });

                document.getElementById('exportApprovalsBtn')?.addEventListener('click', () => {
                    this.exportApprovals();
                });

                document.getElementById('addTemplateBtn')?.addEventListener('click', () => {
                    this.showCreateTemplateModal();
                });

                document.getElementById('createTemplateBtn')?.addEventListener('click', () => {
                    this.showCreateTemplateModal();
                });

                // Modal close buttons
                document.getElementById('closeApprovalModal')?.addEventListener('click', () => {
                    this.hideApprovalDetailsModal();
                });

                document.getElementById('closeActionModal')?.addEventListener('click', () => {
                    this.hideTakeActionModal();
                });

                document.getElementById('cancelActionModal')?.addEventListener('click', () => {
                    this.hideTakeActionModal();
                });

                document.getElementById('closeTemplateModal')?.addEventListener('click', () => {
                    this.hideCreateTemplateModal();
                });

                document.getElementById('cancelTemplateModal')?.addEventListener('click', () => {
                    this.hideCreateTemplateModal();
                });

                // Form submissions
                document.getElementById('actionForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitApprovalAction();
                });

                document.getElementById('templateForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.createTemplate();
                });

                // Modal outside click
                ['approvalDetailsModal', 'takeActionModal', 'createTemplateModal'].forEach(modalId => {
                    document.getElementById(modalId)?.addEventListener('click', (e) => {
                        if (e.target.id === modalId) {
                            this[`hide${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`]();
                        }
                    });
                });
            }

            setupApprovalTabs() {
                // Show first tab by default
                this.switchApprovalTab('pending-tab');
            }

            switchApprovalTab(tabId) {
                // Update tab buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    if (btn.closest('#approvals-page')) {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-tab') === tabId) {
                            btn.classList.add('active');
                        }
                    }
                });

                // Show selected tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    if (content.closest('#approvals-page')) {
                        content.classList.remove('active');
                        if (content.id === tabId) {
                            content.classList.add('active');

                            // Load data for specific tab
                            switch (tabId) {
                                case 'pending-tab':
                                    this.renderPendingApprovals();
                                    break;
                                case 'urgent-tab':
                                    this.renderUrgentApprovals();
                                    break;
                                case 'recent-tab':
                                    this.renderRecentActions();
                                    break;
                                case 'all-tab':
                                    this.renderAllApprovalsTable();
                                    break;
                                case 'templates-tab':
                                    this.loadTemplates();
                                    break;
                            }
                        }
                    }
                });
            }

            async loadApprovalsData() {
                try {
                    // Load approval statistics
                    const statsResponse = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/approvals/statistics?period=month`
                    );

                    if (statsResponse) {
                        this.statistics = statsResponse;
                        this.renderApprovalStatistics(statsResponse);
                        this.renderApprovalCharts(statsResponse);
                    }

                    // Load all approvals
                    await this.loadAllApprovals();

                    Utils.showNotification('Approvals data loaded successfully', 'success');

                } catch (error) {
                    console.error('Error loading approvals data:', error);
                    Utils.showNotification('Failed to load approvals data', 'error');
                }
            }

            async loadAllApprovals() {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/approvals?limit=100&sort_by=created_at&sort_order=desc`
                    );

                    if (response && response.approvals) {
                        this.approvalsData = response.approvals;
                        this.pendingApprovals = this.approvalsData.filter(a => a.status === 'pending');
                        this.urgentApprovals = this.pendingApprovals.filter(a =>
                            a.priority === 'urgent' || a.priority === 'high'
                        );

                        // Update counts
                        this.updateApprovalCounts();

                        // Render based on current tab
                        const activeTab = document.querySelector('#approvals-page .tab-btn.active');
                        if (activeTab) {
                            const tabId = activeTab.getAttribute('data-tab');
                            this.switchApprovalTab(tabId);
                        }
                    }
                } catch (error) {
                    console.error('Error loading approvals:', error);
                }
            }

            updateApprovalCounts() {
                const pendingCount = this.pendingApprovals.length;
                const urgentCount = this.urgentApprovals.length;

                document.getElementById('pending-count').textContent = pendingCount;
                document.getElementById('urgent-count').textContent = urgentCount;
            }

            renderApprovalStatistics(stats) {
                const container = document.getElementById('approval-stats-cards');
                if (!container) return;

                const statistics = stats.statistics || {};

                container.innerHTML = `
            <div class="stats-card">
                <div class="stats-value">${statistics.total || 0}</div>
                <div class="stats-label">Total Requests</div>
                <div class="stats-change change-up">+${statistics.by_status?.pending || 0} pending</div>
            </div>
            
            <div class="stats-card">
                <div class="stats-value">${statistics.pending_urgent || 0}</div>
                <div class="stats-label">Urgent Pending</div>
                <div class="stats-change ${statistics.pending_urgent > 0 ? 'change-down' : 'change-up'}">
                    ${statistics.pending_urgent > 0 ? 'Needs attention' : 'All clear'}
                </div>
            </div>
            
            <div class="stats-card">
                <div class="stats-value">${statistics.pending_high || 0}</div>
                <div class="stats-label">High Priority</div>
                <div class="stats-change">Pending review</div>
            </div>
            
            <div class="stats-card">
                <div class="stats-value">${Math.round(statistics.processing_stats?.avg_hours || 0)}h</div>
                <div class="stats-label">Avg. Response Time</div>
                <div class="stats-change">Last 30 days</div>
            </div>
        `;
            }

            renderPendingApprovals() {
                const container = document.getElementById('pending-approvals-container');
                if (!container) return;

                if (this.pendingApprovals.length === 0) {
                    container.innerHTML = `
                <div class="approval-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div style="margin-bottom: 20px;">
                        <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(16, 185, 129, 0.2); color: var(--secondary);">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">No Pending Approvals</h3>
                        <p style="color: var(--text-muted);">
                            All approval requests have been processed. Great work!
                        </p>
                    </div>
                </div>
            `;
                    return;
                }

                const approvalsHTML = this.pendingApprovals.map(approval => `
            <div class="approval-card ${approval.priority}">
                <div class="approval-status status-${approval.status}">
                    ${approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                </div>
                
                <div class="approval-header">
                    <div style="flex: 1;">
                        <div class="approval-type type-${approval.approval_type}">
                            ${this.formatApprovalType(approval.approval_type)}
                        </div>
                        <div class="approval-title">${approval.title}</div>
                    </div>
                    <div class="approval-priority priority-${approval.priority}">
                        ${approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
                    </div>
                </div>
                
                <div class="approval-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${approval.requester_details?.name || 'Unknown'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${new Date(approval.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="approval-description">
                    ${approval.description.substring(0, 150)}${approval.description.length > 150 ? '...' : ''}
                </div>
                
                ${approval.due_date ? `
                    <div style="font-size: 13px; color: ${this.isDueSoon(approval.due_date) ? 'var(--danger)' : 'var(--text-muted)'}; margin: 10px 0;">
                        <i class="fas fa-clock"></i>
                        Due: ${new Date(approval.due_date).toLocaleDateString()}
                        ${this.isDueSoon(approval.due_date) ? ' (Soon!)' : ''}
                    </div>
                ` : ''}
                
                <div class="approval-actions">
                    <button class="btn-primary" onclick="approvalsManager.viewApprovalDetails('${approval._id || approval.id}')" style="flex: 1;">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-secondary" onclick="approvalsManager.showTakeActionModal('${approval._id || approval.id}', 'approved')" style="flex: 1;">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-secondary" onclick="approvalsManager.showTakeActionModal('${approval._id || approval.id}', 'rejected')" style="flex: 1;">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');

                container.innerHTML = approvalsHTML;
            }

            renderUrgentApprovals() {
                const container = document.getElementById('urgent-approvals-container');
                if (!container) return;

                if (this.urgentApprovals.length === 0) {
                    container.innerHTML = `
                <div class="approval-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div style="margin-bottom: 20px;">
                        <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(16, 185, 129, 0.2); color: var(--secondary);">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">No Urgent Approvals</h3>
                        <p style="color: var(--text-muted);">
                            No urgent approval requests pending. Great work!
                        </p>
                    </div>
                </div>
            `;
                    return;
                }

                const urgentHTML = this.urgentApprovals.map(approval => `
            <div class="approval-card urgent">
                <div class="approval-status status-pending">
                    ${approval.priority.toUpperCase()}
                </div>
                
                <div class="approval-header">
                    <div style="flex: 1;">
                        <div class="approval-type type-${approval.approval_type}">
                            ${this.formatApprovalType(approval.approval_type)}
                        </div>
                        <div class="approval-title">${approval.title}</div>
                    </div>
                    <div style="font-size: 24px; color: var(--danger);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
                
                <div class="approval-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${approval.requester_details?.name || 'Unknown'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${new Date(approval.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="approval-description">
                    ${approval.description.substring(0, 120)}${approval.description.length > 120 ? '...' : ''}
                </div>
                
                <div style="color: var(--danger); font-size: 13px; margin: 10px 0;">
                    <i class="fas fa-clock"></i>
                    Requires immediate attention
                </div>
                
                <div class="approval-actions">
                    <button class="btn-primary" onclick="approvalsManager.viewApprovalDetails('${approval._id || approval.id}')" style="flex: 2;">
                        <i class="fas fa-eye"></i> Review Now
                    </button>
                    <button class="btn-secondary" onclick="approvalsManager.quickApprove('${approval._id || approval.id}')" style="flex: 1;">
                        <i class="fas fa-bolt"></i> Quick Approve
                    </button>
                </div>
            </div>
        `).join('');

                container.innerHTML = urgentHTML;
            }

            renderRecentActions() {
                const container = document.getElementById('recent-actions-container');
                if (!container) return;

                const recentActions = this.statistics.recent_actions || [];

                if (recentActions.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-history" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>No recent actions found</p>
                </div>
            `;
                    return;
                }

                const actionsHTML = `
            <div class="timeline-item" style="padding-left: 0; margin-left: 20px;">
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;">
                    Last ${recentActions.length} actions
                </div>
            </div>
            
            ${recentActions.map(action => `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-time">
                            ${new Date(action.updated_at).toLocaleString()}
                        </div>
                        <div>
                            <strong>${action.requested_by_name}</strong>'s request 
                            <span style="color: ${action.status === 'approved' ? 'var(--secondary)' : 'var(--danger)'}">
                                "${action.title.substring(0, 50)}..."
                            </span>
                            was <strong>${action.status}</strong>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;

                container.innerHTML = actionsHTML;
            }

            renderAllApprovalsTable() {
                const tableBody = document.getElementById('all-approvals-body');
                if (!tableBody) return;

                const rowsHTML = this.approvalsData.map(approval => `
            <tr>
                <td>
                    <div style="font-weight: 500;">${approval.title}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
                        ${approval.description.substring(0, 80)}${approval.description.length > 80 ? '...' : ''}
                    </div>
                </td>
                <td>
                    <span class="approval-type type-${approval.approval_type}" style="font-size: 11px;">
                        ${this.formatApprovalType(approval.approval_type)}
                    </span>
                </td>
                <td>
                    <div>${approval.requester_details?.name || 'Unknown'}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${approval.requester_details?.role || ''}</div>
                </td>
                <td>
                    <span class="approval-priority priority-${approval.priority}">
                        ${approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
                    </span>
                </td>
                <td>
                    <span class="approval-status status-${approval.status}">
                        ${approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </span>
                </td>
                <td>${new Date(approval.created_at).toLocaleDateString()}</td>
                <td>
                    ${approval.due_date ? new Date(approval.due_date).toLocaleDateString() : 'No due date'}
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-secondary" onclick="approvalsManager.viewApprovalDetails('${approval._id || approval.id}')"
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${approval.status === 'pending' ? `
                            <button class="btn-primary" onclick="approvalsManager.showTakeActionModal('${approval._id || approval.id}', 'approved')"
                                    style="padding: 5px 10px; font-size: 12px;">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

                tableBody.innerHTML = rowsHTML;
            }

            async viewApprovalDetails(approvalId) {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/approvals/${approvalId}`
                    );

                    if (response) {
                        this.renderApprovalDetails(response);
                    }
                } catch (error) {
                    console.error('Error loading approval details:', error);
                    Utils.showNotification('Failed to load approval details', 'error');
                }
            }

            renderApprovalDetails(approval) {
                const title = document.getElementById('approvalDetailsTitle');
                const content = document.getElementById('approvalDetailsContent');

                title.textContent = approval.title;

                const detailsHTML = `
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <h3 style="color: var(--accent); margin-bottom: 5px;">${approval.title}</h3>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                            <span class="approval-type type-${approval.approval_type}">
                                ${this.formatApprovalType(approval.approval_type)}
                            </span>
                            <span class="approval-priority priority-${approval.priority}">
                                ${approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)} Priority
                            </span>
                            <span class="approval-status status-${approval.status}">
                                ${approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; color: var(--text-muted);">
                            Submitted: ${new Date(approval.created_at).toLocaleDateString()}
                        </div>
                        ${approval.due_date ? `
                            <div style="font-size: 14px; color: ${this.isDueSoon(approval.due_date) ? 'var(--danger)' : 'var(--text-muted)'};">
                                Due: ${new Date(approval.due_date).toLocaleDateString()}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px; color: var(--text);">Description</h4>
                    <p style="line-height: 1.6;">${approval.description}</p>
                </div>
                
                <!-- Requester Details -->
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px; color: var(--text);">Requester Information</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--text-muted);">Name</div>
                            <div style="font-weight: 500;">${approval.requester_details?.name}</div>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--text-muted);">Role</div>
                            <div style="font-weight: 500;">${approval.requester_details?.role || 'Not specified'}</div>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--text-muted);">Department</div>
                            <div style="font-weight: 500;">${approval.requester_details?.department || approval.department}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Related Data -->
                ${approval.related_data ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: var(--text);">Request Details</h4>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px;">
                            <pre style="margin: 0; font-family: inherit; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(approval.related_data, null, 2)}</pre>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Comments Section -->
                <div class="comments-section">
                    <h4 style="margin-bottom: 15px; color: var(--text);">
                        <i class="fas fa-comments"></i> Comments & History
                    </h4>
                    
                    ${approval.comments && approval.comments.length > 0 ? `
                        <div style="margin-bottom: 20px;">
                            ${approval.comments.map(comment => `
                                <div class="comment-item">
                                    <div class="comment-header">
                                        <div class="comment-author">${comment.user_name}</div>
                                        <div class="comment-time">${new Date(comment.timestamp).toLocaleString()}</div>
                                    </div>
                                    <div class="comment-text">${comment.comment}</div>
                                    ${comment.action ? `
                                        <div style="margin-top: 5px;">
                                            <span class="approval-status status-${comment.action}" style="font-size: 10px;">
                                                ${comment.action.charAt(0).toUpperCase() + comment.action.slice(1)}
                                            </span>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No comments yet</p>'}
                    
                    <!-- History Timeline -->
                    <h4 style="margin-bottom: 15px; color: var(--text);">
                        <i class="fas fa-history"></i> Approval History
                    </h4>
                    <div class="timeline-item" style="padding-left: 0; margin-left: 20px;">
                        ${approval.history && approval.history.length > 0 ? `
                            ${approval.history.map((entry, index) => `
                                <div class="timeline-item">
                                    <div class="timeline-content">
                                        <div class="timeline-time">
                                            ${new Date(entry.timestamp).toLocaleString()}
                                        </div>
                                        <div>
                                            <strong>${entry.by_name}</strong> ${entry.action} the request
                                            ${entry.notes ? `: ${entry.notes}` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        ` : '<p style="color: var(--text-muted);">No history available</p>'}
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            ${approval.can_approve ? `
                <div style="display: flex; gap: 10px; margin-top: 30px;">
                    <button class="btn-primary" onclick="approvalsManager.showTakeActionModal('${approval._id || approval.id}', 'approved')" style="flex: 1;">
                        <i class="fas fa-check"></i> Approve Request
                    </button>
                    <button class="btn-secondary" onclick="approvalsManager.showTakeActionModal('${approval._id || approval.id}', 'rejected')" style="flex: 1;">
                        <i class="fas fa-times"></i> Reject Request
                    </button>
                    <button class="btn-secondary" onclick="approvalsManager.showTakeActionModal('${approval._id || approval.id}', 'deferred')" style="flex: 1;">
                        <i class="fas fa-clock"></i> Defer
                    </button>
                </div>
            ` : ''}
        `;

                content.innerHTML = detailsHTML;
                this.showApprovalDetailsModal();
            }

            showTakeActionModal(approvalId, defaultAction = '') {
                document.getElementById('actionApprovalId').value = approvalId;

                if (defaultAction) {
                    document.getElementById('actionType').value = defaultAction;
                }

                document.getElementById('takeActionModal').classList.add('active');
            }

            hideTakeActionModal() {
                document.getElementById('takeActionModal').classList.remove('active');
                document.getElementById('actionForm').reset();
            }

            async submitApprovalAction() {
                const approvalId = document.getElementById('actionApprovalId').value;
                const action = document.getElementById('actionType').value;
                const comments = document.getElementById('actionComments').value;

                if (!action) {
                    alert('Please select an action');
                    return;
                }

                try {
                    this.setLoading(true, 'action');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/approvals/${approvalId}/action`,
                        {
                            action: action,
                            comments: comments,
                            notify_requester: true,
                            notify_approvers: true
                        }
                    );

                    if (response) {
                        Utils.showNotification(`Request ${action} successfully`, 'success');
                        this.hideTakeActionModal();
                        this.hideApprovalDetailsModal();
                        await this.loadApprovalsData();
                    }
                } catch (error) {
                    console.error('Error submitting approval action:', error);
                    Utils.showNotification('Failed to submit action', 'error');
                } finally {
                    this.setLoading(false, 'action');
                }
            }

            async quickApprove(approvalId) {
                try {
                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/approvals/${approvalId}/action`,
                        {
                            action: 'approved',
                            comments: 'Quick approved by HOD',
                            notify_requester: true,
                            notify_approvers: false
                        }
                    );

                    if (response) {
                        Utils.showNotification('Request approved quickly', 'success');
                        await this.loadApprovalsData();
                    }
                } catch (error) {
                    console.error('Quick approve error:', error);
                    Utils.showNotification('Failed to quick approve', 'error');
                }
            }

            showQuickApprove() {
                const urgentApprovals = this.urgentApprovals;

                if (urgentApprovals.length === 0) {
                    alert('No urgent approvals to quick approve');
                    return;
                }

                const approvalList = urgentApprovals.map(a =>
                    `• ${a.title} (${a.requester_details?.name})`
                ).join('\n');

                if (confirm(`Quick approve ${urgentApprovals.length} urgent requests?\n\n${approvalList}`)) {
                    // Batch approve all urgent requests
                    urgentApprovals.forEach(approval => {
                        this.quickApprove(approval._id || approval.id);
                    });

                    Utils.showNotification(`Batch approving ${urgentApprovals.length} requests`, 'info');
                }
            }

            renderApprovalCharts(stats) {
                // Approval Status Chart
                const statusCtx = document.getElementById('approvalStatusChart');
                if (statusCtx) {
                    const ctx = statusCtx.getContext('2d');
                    const statusData = stats.statistics?.by_status || {};

                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(statusData).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                            datasets: [{
                                data: Object.values(statusData),
                                backgroundColor: [
                                    'rgba(245, 158, 11, 0.7)',  // Pending
                                    'rgba(16, 185, 129, 0.7)',  // Approved
                                    'rgba(239, 68, 68, 0.7)',   // Rejected
                                    'rgba(107, 114, 128, 0.7)'  // Deferred
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        color: '#94a3b8'
                                    }
                                }
                            }
                        }
                    });
                }

                // Approval Type Chart
                const typeCtx = document.getElementById('approvalTypeChart');
                if (typeCtx) {
                    const ctx = typeCtx.getContext('2d');
                    const typeData = stats.statistics?.by_type || {};

                    new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: Object.keys(typeData).map(this.formatApprovalType),
                            datasets: [{
                                data: Object.values(typeData),
                                backgroundColor: [
                                    'rgba(139, 92, 246, 0.7)',
                                    'rgba(59, 130, 246, 0.7)',
                                    'rgba(16, 185, 129, 0.7)',
                                    'rgba(245, 158, 11, 0.7)',
                                    'rgba(236, 72, 153, 0.7)',
                                    'rgba(99, 102, 241, 0.7)'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        color: '#94a3b8',
                                        font: {
                                            size: 11
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // Utility Methods
            formatApprovalType(type) {
                const typeMap = {
                    'faculty_community': 'Faculty Community',
                    'faculty_leave': 'Faculty Leave',
                    'resource_request': 'Resource Request',
                    'budget_allocation': 'Budget Allocation',
                    'curriculum_change': 'Curriculum Change',
                    'event_permission': 'Event Permission',
                    'student_request': 'Student Request',
                    'other': 'Other'
                };
                return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            }

            isDueSoon(dueDate) {
                if (!dueDate) return false;
                const due = new Date(dueDate);
                const now = new Date();
                const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                return diffDays <= 3 && diffDays >= 0;
            }

            searchApprovals() {
                const searchTerm = document.getElementById('approvalSearch').value.toLowerCase();
                const statusFilter = document.getElementById('approvalStatusFilter').value;
                const typeFilter = document.getElementById('approvalTypeFilter').value;
                const priorityFilter = document.getElementById('approvalPriorityFilter').value;

                let filteredApprovals = this.approvalsData;

                if (searchTerm) {
                    filteredApprovals = filteredApprovals.filter(approval =>
                        approval.title.toLowerCase().includes(searchTerm) ||
                        approval.description.toLowerCase().includes(searchTerm) ||
                        (approval.requester_details?.name && approval.requester_details.name.toLowerCase().includes(searchTerm))
                    );
                }

                if (statusFilter !== 'all') {
                    filteredApprovals = filteredApprovals.filter(approval =>
                        approval.status === statusFilter
                    );
                }

                if (typeFilter !== 'all') {
                    filteredApprovals = filteredApprovals.filter(approval =>
                        approval.approval_type === typeFilter
                    );
                }

                if (priorityFilter !== 'all') {
                    filteredApprovals = filteredApprovals.filter(approval =>
                        approval.priority === priorityFilter
                    );
                }

                // Update the displays based on current tab
                this.filteredApprovals = filteredApprovals;
                this.filteredPending = filteredApprovals.filter(a => a.status === 'pending');
                this.filteredUrgent = this.filteredPending.filter(a => a.priority === 'urgent' || a.priority === 'high');

                const activeTab = document.querySelector('#approvals-page .tab-btn.active');
                if (activeTab) {
                    const tabId = activeTab.getAttribute('data-tab');
                    this.switchApprovalTab(tabId);
                }
            }

            clearApprovalFilters() {
                document.getElementById('approvalSearch').value = '';
                document.getElementById('approvalStatusFilter').value = 'all';
                document.getElementById('approvalTypeFilter').value = 'all';
                document.getElementById('approvalPriorityFilter').value = 'all';

                this.filteredApprovals = this.approvalsData;
                this.filteredPending = this.pendingApprovals;
                this.filteredUrgent = this.urgentApprovals;

                const activeTab = document.querySelector('#approvals-page .tab-btn.active');
                if (activeTab) {
                    const tabId = activeTab.getAttribute('data-tab');
                    this.switchApprovalTab(tabId);
                }
            }

            showDetailedStatistics() {
                const stats = this.statistics.statistics || {};

                let message = `📊 Approval Statistics\n\n`;
                message += `Total Requests: ${stats.total || 0}\n`;
                message += `Pending: ${stats.by_status?.pending || 0}\n`;
                message += `Approved: ${stats.by_status?.approved || 0}\n`;
                message += `Rejected: ${stats.by_status?.rejected || 0}\n\n`;
                message += `Urgent Pending: ${stats.pending_urgent || 0}\n`;
                message += `High Priority: ${stats.pending_high || 0}\n\n`;
                message += `Average Response Time: ${Math.round(stats.processing_stats?.avg_hours || 0)} hours`;

                alert(message);
            }

            exportApprovals() {
                const dataStr = JSON.stringify(this.approvalsData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                const exportFileDefaultName = `approvals-${new Date().toISOString().split('T')[0]}.json`;

                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();

                Utils.showNotification('Approvals exported successfully', 'success');
            }

            // Modal control methods
            showApprovalDetailsModal() {
                document.getElementById('approvalDetailsModal').classList.add('active');
            }

            hideApprovalDetailsModal() {
                document.getElementById('approvalDetailsModal').classList.remove('active');
            }

            showCreateTemplateModal() {
                document.getElementById('createTemplateModal').classList.add('active');
            }

            hideCreateTemplateModal() {
                document.getElementById('createTemplateModal').classList.remove('active');
                document.getElementById('templateForm').reset();
            }

            setLoading(isLoading, type = '') {
                const btnText = document.getElementById(`${type}SubmitBtnText`);
                const btnLoading = document.getElementById(`${type}SubmitBtnLoading`);

                if (btnText && btnLoading) {
                    if (isLoading) {
                        btnText.style.display = 'none';
                        btnLoading.style.display = 'inline-block';
                    } else {
                        btnText.style.display = 'inline';
                        btnLoading.style.display = 'none';
                    }
                }
            }

            async createTemplate() {
                const form = document.getElementById('templateForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const templateData = {
                    name: document.getElementById('templateName').value,
                    type: document.getElementById('templateType').value,
                    priority: document.getElementById('templatePriority').value,
                    approvers: document.getElementById('templateApprovers').value
                        .split(',')
                        .map(id => id.trim())
                        .filter(id => id),
                    description: document.getElementById('templateDescription').value,
                    fields: document.getElementById('templateFields').value
                };

                try {
                    // Here you would save the template to the database
                    // For now, just show a success message
                    Utils.showNotification('Template created successfully!', 'success');
                    this.hideCreateTemplateModal();
                } catch (error) {
                    console.error('Error creating template:', error);
                    Utils.showNotification('Failed to create template', 'error');
                }
            }

            async loadTemplates() {
                // This would load templates from the database
                const container = document.getElementById('templates-container');
                if (container) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-file-alt" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 10px;">No Templates Yet</h3>
                    <p style="margin-bottom: 20px;">
                        Create templates to streamline common approval requests.
                    </p>
                    <button class="btn-primary" onclick="approvalsManager.showCreateTemplateModal()">
                        <i class="fas fa-plus"></i> Create First Template
                    </button>
                </div>
            `;
                }
            }
        }

        // Initialize the approvals manager
        let approvalsManager;
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('approvals-page')) {
                approvalsManager = new ApprovalsManager();
                window.approvalsManager = approvalsManager;
            }
        });
        class ResourcesManager {
            constructor() {
                this.resourcesData = [];
                this.resourceStats = null;
                this.softwareLicenses = [];
                this.resourceRequests = [];
                this.maintenanceRecords = [];
                this.initialized = false;
            }

            async initResources() {
                if (this.initialized) return;

                this.setupResourcesEventListeners();
                this.setupResourceTabs();
                await this.loadResourcesData();
                this.initialized = true;
            }

            setupResourcesEventListeners() {
                // Tab buttons for resources
                document.querySelectorAll('[data-tab]').forEach(btn => {
                    if (btn.closest('#resources-page')) {
                        btn.addEventListener('click', (e) => {
                            this.switchResourceTab(e.target.getAttribute('data-tab'));
                        });
                    }
                });

                // Resource management buttons
                document.getElementById('addResourceBtn')?.addEventListener('click', () => {
                    this.showAddResourceModal();
                });

                document.getElementById('importResourcesBtn')?.addEventListener('click', () => {
                    this.importResources();
                });

                document.getElementById('resourceRequestsBtn')?.addEventListener('click', () => {
                    this.switchResourceTab('requests-tab');
                });

                document.getElementById('resourceReportsBtn')?.addEventListener('click', () => {
                    this.generateResourceReport();
                });

                document.getElementById('addSoftwareBtn')?.addEventListener('click', () => {
                    this.showAddSoftwareModal();
                });

                // Search and filter
                document.getElementById('searchEquipmentBtn')?.addEventListener('click', () => {
                    this.searchEquipment();
                });

                document.getElementById('clearEquipmentFilters')?.addEventListener('click', () => {
                    this.clearEquipmentFilters();
                });

                // Form submissions
                document.getElementById('resourceForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addNewResource();
                });

                // Modal close buttons
                document.getElementById('closeResourceModal')?.addEventListener('click', () => {
                    this.hideResourceDetailsModal();
                });

                document.getElementById('closeResourceAddModal')?.addEventListener('click', () => {
                    this.hideAddResourceModal();
                });

                document.getElementById('cancelResourceModal')?.addEventListener('click', () => {
                    this.hideAddResourceModal();
                });

                // Modal outside click
                ['resourceDetailsModal', 'addResourceModal'].forEach(modalId => {
                    document.getElementById(modalId)?.addEventListener('click', (e) => {
                        if (e.target.id === modalId) {
                            this[`hide${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`]();
                        }
                    });
                });

                // Initialize date fields with today's date
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('resourcePurchaseDate')?.setAttribute('max', today);
                document.getElementById('resourceWarrantyDate')?.setAttribute('min', today);
            }

            setupResourceTabs() {
                // Show first tab by default
                this.switchResourceTab('equipment-tab');
            }

            switchResourceTab(tabId) {
                // Update tab buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    if (btn.closest('#resources-page')) {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-tab') === tabId) {
                            btn.classList.add('active');
                        }
                    }
                });

                // Show selected tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    if (content.closest('#resources-page')) {
                        content.classList.remove('active');
                        if (content.id === tabId) {
                            content.classList.add('active');

                            // Load data for specific tab
                            switch (tabId) {
                                case 'equipment-tab':
                                    this.loadEquipmentData();
                                    break;
                                case 'software-tab':
                                    this.loadSoftwareData();
                                    break;
                                case 'inventory-tab':
                                    this.loadInventoryData();
                                    break;
                                case 'requests-tab':
                                    this.loadResourceRequests();
                                    break;
                                case 'maintenance-tab':
                                    this.loadMaintenanceRecords();
                                    break;
                            }
                        }
                    }
                });
            }

            async loadResourcesData() {
                try {
                    const container = document.getElementById('resources-content');
                    if (container) {
                        container.innerHTML = `
                    <div class="management-card">
                        <h3 class="section-title" style="margin-bottom: 20px;">
                            <i class="fas fa-flask"></i>
                            Department Resources
                        </h3>
                        <div style="text-align: center; padding: 40px;">
                            <div class="loading" style="margin: 0 auto 15px auto;"></div>
                            <p style="color: var(--text-muted);">Loading resources data...</p>
                        </div>
                    </div>
                `;
                    }

                    // Load resource statistics
                    const statsResponse = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/resources/stats`
                    );

                    if (statsResponse) {
                        this.resourceStats = statsResponse;
                        this.renderResourceStatistics(statsResponse);
                        this.renderResourceCharts(statsResponse);
                    }

                    // Load equipment data
                    await this.loadEquipmentData();

                    Utils.showNotification('Resources data loaded successfully', 'success');

                } catch (error) {
                    console.error('Error loading resources data:', error);
                    const container = document.getElementById('resources-content');
                    if (container) {
                        container.innerHTML = `
                    <div class="management-card">
                        <h3 class="section-title" style="margin-bottom: 20px;">
                            <i class="fas fa-flask"></i>
                            Department Resources
                        </h3>
                        <p style="color: var(--danger); text-align: center; padding: 40px;">
                            Error loading resources data. Please try again.
                        </p>
                    </div>
                `;
                    }
                    Utils.showNotification('Failed to load resources data', 'error');
                }
            }

            async loadEquipmentData() {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/resources?limit=100&type=equipment`
                    );

                    if (response && response.resources) {
                        this.resourcesData = response.resources;
                        this.renderEquipmentGrid(this.resourcesData);
                        this.renderEquipmentTable(this.resourcesData);
                    }
                } catch (error) {
                    console.error('Error loading equipment:', error);
                }
            }

            renderResourceStatistics(stats) {
                const container = document.getElementById('resources-stats');
                if (!container) return;

                const statistics = stats.statistics || {};

                container.innerHTML = `
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-flask"></i>
                    </div>
                    <div class="overview-change change-up">
                        +${statistics.equipment_count || 0}
                    </div>
                </div>
                <div class="overview-value">${statistics.total_resources || 0}</div>
                <div class="overview-label">Total Resources</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="overview-change ${statistics.available_percentage > 80 ? 'change-up' : 'change-down'}">
                        ${Math.round(statistics.available_percentage || 0)}%
                    </div>
                </div>
                <div class="overview-value">${statistics.available_count || 0}</div>
                <div class="overview-label">Available Resources</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-tools"></i>
                    </div>
                    <div class="overview-change change-down">
                        ${statistics.maintenance_count || 0}
                    </div>
                </div>
                <div class="overview-value">${statistics.maintenance_count || 0}</div>
                <div class="overview-label">Under Maintenance</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="overview-change change-down">
                        ${statistics.warranty_expiring || 0}
                    </div>
                </div>
                <div class="overview-value">${statistics.warranty_expiring || 0}</div>
                <div class="overview-label">Warranty Expiring Soon</div>
            </div>
        `;
            }

            renderEquipmentGrid(equipment) {
                const container = document.getElementById('equipment-grid-container');
                if (!container) return;

                if (!equipment || equipment.length === 0) {
                    container.innerHTML = `
                <div class="course-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div style="margin-bottom: 20px;">
                        <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                            <i class="fas fa-flask"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">No Equipment Found</h3>
                        <p style="color: var(--text-muted); margin-bottom: 20px;">
                            No equipment has been added to your department yet.
                        </p>
                    </div>
                    <button class="btn-primary" onclick="resourcesManager.showAddResourceModal()">
                        <i class="fas fa-plus-circle"></i> Add First Equipment
                    </button>
                </div>
            `;
                    return;
                }

                const cardsHTML = equipment.map(resource => `
            <div class="course-card" data-resource-id="${resource._id || resource.id}">
                <div class="course-header">
                    <div class="course-code">${resource.serial_number || 'N/A'}</div>
                    <div class="course-type type-${resource.status === 'available' ? 'core' :
                        resource.status === 'maintenance' ? 'lab' :
                            resource.status === 'damaged' ? 'project' : 'elective'}">
                        ${resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                    </div>
                </div>
                
                <div class="course-title">${resource.name || 'Unnamed Resource'}</div>
                
                <div class="course-description">
                    ${resource.description || 'No description available'}
                </div>
                
                <div class="course-meta">
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        <span>${resource.category || 'General'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${resource.location || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${resource.purchase_date ? new Date(resource.purchase_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="course-actions">
                    <button class="btn-secondary" onclick="resourcesManager.viewResourceDetails('${resource._id || resource.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-primary" onclick="resourcesManager.editResource('${resource._id || resource.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${resource.status === 'available' ? `
                        <button class="btn-secondary" onclick="resourcesManager.reserveResource('${resource._id || resource.id}')">
                            <i class="fas fa-hand-paper"></i> Reserve
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

                container.innerHTML = cardsHTML;
            }

            renderEquipmentTable(equipment) {
                const tableBody = document.getElementById('equipment-table-body');
                if (!tableBody) return;

                const rowsHTML = equipment.map(resource => {
                    const lastMaintenance = resource.last_maintenance_date
                        ? new Date(resource.last_maintenance_date).toLocaleDateString()
                        : 'Never';

                    return `
                <tr>
                    <td>
                        <div style="font-weight: 500;">${resource.name}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">${resource.category}</div>
                    </td>
                    <td>${resource.model || 'N/A'}</td>
                    <td>${resource.serial_number || 'N/A'}</td>
                    <td>
                        <span style="font-size: 12px; padding: 2px 8px; border-radius: 10px; 
                                    background: rgba(139, 92, 246, 0.1); color: var(--accent);">
                            ${resource.category}
                        </span>
                    </td>
                    <td>${resource.location || 'N/A'}</td>
                    <td>
                        <span class="item-status ${this.getStatusClass(resource.status)}">
                            ${resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                        </span>
                    </td>
                    <td>${lastMaintenance}</td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn-secondary" onclick="resourcesManager.viewResourceDetails('${resource._id || resource.id}')"
                                    style="padding: 5px 10px; font-size: 12px;">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-primary" onclick="resourcesManager.scheduleMaintenance('${resource._id || resource.id}')"
                                    style="padding: 5px 10px; font-size: 12px;">
                                <i class="fas fa-tools"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
                }).join('');

                tableBody.innerHTML = rowsHTML;
            }

            getStatusClass(status) {
                switch (status) {
                    case 'available': return 'status-active';
                    case 'in-use': return 'status-review';
                    case 'maintenance': return 'status-pending';
                    case 'damaged': return 'status-rejected';
                    default: return 'status-active';
                }
            }

            async loadSoftwareData() {
                try {
                    const container = document.getElementById('software-content');
                    if (!container) return;

                    container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading"></div>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading software licenses...</p>
                </div>
            `;

                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/software-licenses`
                    );

                    if (response && response.software) {
                        this.softwareLicenses = response.software;
                        this.renderSoftwareContent(this.softwareLicenses);
                    } else {
                        this.renderSoftwareContent([]);
                    }
                } catch (error) {
                    console.error('Error loading software data:', error);
                    this.renderSoftwareContent([]);
                }
            }

            renderSoftwareContent(software) {
                const container = document.getElementById('software-content');
                if (!container) return;

                if (!software || software.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">No Software Licenses</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        No software licenses have been registered for your department.
                    </p>
                    <button class="btn-primary" onclick="resourcesManager.showAddSoftwareModal()">
                        <i class="fas fa-plus"></i> Add Software License
                    </button>
                </div>
            `;
                    return;
                }

                const softwareHTML = `
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Software Name</th>
                            <th>Version</th>
                            <th>License Type</th>
                            <th>License Key</th>
                            <th>Users</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${software.map(item => {
                    const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
                    const isExpiringSoon = item.expiry_date &&
                        new Date(item.expiry_date) > new Date() &&
                        new Date(item.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                    return `
                                <tr>
                                    <td>
                                        <div style="font-weight: 500;">${item.name}</div>
                                        <div style="font-size: 12px; color: var(--text-muted);">${item.vendor || ''}</div>
                                    </td>
                                    <td>${item.version || 'N/A'}</td>
                                    <td>${item.license_type || 'Perpetual'}</td>
                                    <td>
                                        <div style="font-family: monospace; font-size: 11px; background: rgba(0,0,0,0.2); padding: 2px 5px; border-radius: 4px;">
                                            ${item.license_key ? '••••••••' : 'No key'}
                                        </div>
                                    </td>
                                    <td>${item.max_users || 'Unlimited'}</td>
                                    <td>
                                        <div style="color: ${isExpired ? 'var(--danger)' : isExpiringSoon ? '#f59e0b' : 'var(--text)'}">
                                            ${item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'Never'}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="item-status ${isExpired ? 'status-rejected' : isExpiringSoon ? 'status-pending' : 'status-active'}">
                                            ${isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-secondary" onclick="resourcesManager.viewSoftwareDetails('${item._id || item.id}')"
                                                style="padding: 5px 10px; font-size: 12px;">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-primary" onclick="resourcesManager.renewLicense('${item._id || item.id}')"
                                                style="padding: 5px 10px; font-size: 12px;">
                                            <i class="fas fa-sync"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                <div style="font-size: 14px; color: var(--text-muted);">
                    ${software.length} software licenses registered
                </div>
                <button class="btn-primary" onclick="resourcesManager.exportSoftwareReport()">
                    <i class="fas fa-file-export"></i> Export Report
                </button>
            </div>
        `;

                container.innerHTML = softwareHTML;
            }

            async loadInventoryData() {
                const container = document.getElementById('inventory-content');
                if (!container) return;

                container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                    <i class="fas fa-boxes"></i>
                </div>
                <h3 style="margin-bottom: 10px;">Inventory Management</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">
                    Track consumables, stationery, and other inventory items.
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="btn-primary" onclick="resourcesManager.addInventoryItem()">
                        <i class="fas fa-plus"></i> Add Item
                    </button>
                    <button class="btn-secondary" onclick="resourcesManager.checkInventoryLevels()">
                        <i class="fas fa-chart-line"></i> Check Levels
                    </button>
                </div>
            </div>
        `;
            }

            async loadResourceRequests() {
                try {
                    const container = document.getElementById('requests-content');
                    if (!container) return;

                    container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading"></div>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading resource requests...</p>
                </div>
            `;

                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/resource-requests?status=pending`
                    );

                    if (response && response.requests) {
                        this.resourceRequests = response.requests;
                        this.renderResourceRequests(this.resourceRequests);
                    } else {
                        this.renderResourceRequests([]);
                    }
                } catch (error) {
                    console.error('Error loading resource requests:', error);
                    this.renderResourceRequests([]);
                }
            }

            renderResourceRequests(requests) {
                const container = document.getElementById('requests-content');
                if (!container) return;

                if (!requests || requests.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(16, 185, 129, 0.2); color: var(--secondary);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">No Pending Requests</h3>
                    <p style="color: var(--text-muted);">
                        All resource requests have been processed.
                    </p>
                </div>
            `;
                    return;
                }

                const requestsHTML = `
            <div class="approvals-grid">
                ${requests.map(request => {
                    const isUrgent = request.priority === 'urgent' || request.priority === 'high';

                    return `
                        <div class="approval-card ${request.priority}">
                            <div class="approval-header">
                                <div style="flex: 1;">
                                    <div class="approval-title">${request.title}</div>
                                    <div style="font-size: 14px; color: var(--text-muted); margin-top: 5px;">
                                        <i class="fas fa-user"></i> ${request.requested_by_name}
                                    </div>
                                </div>
                                <div class="approval-priority priority-${request.priority}">
                                    ${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                                </div>
                            </div>
                            
                            <div class="approval-description">
                                ${request.description}
                            </div>
                            
                            <div class="approval-meta">
                                <div class="meta-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>${new Date(request.requested_date).toLocaleDateString()}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${request.duration || 'Not specified'}</span>
                                </div>
                                ${request.requested_resource ? `
                                    <div class="meta-item">
                                        <i class="fas fa-flask"></i>
                                        <span>${request.requested_resource}</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            ${isUrgent ? `
                                <div style="color: var(--danger); font-size: 13px; margin: 10px 0;">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Urgent request - requires immediate attention
                                </div>
                            ` : ''}
                            
                            <div class="approval-actions">
                                <button class="btn-primary" onclick="resourcesManager.approveResourceRequest('${request._id || request.id}')" style="flex: 1;">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn-secondary" onclick="resourcesManager.rejectResourceRequest('${request._id || request.id}')" style="flex: 1;">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                                <button class="btn-secondary" onclick="resourcesManager.viewResourceRequestDetails('${request._id || request.id}')" style="flex: 1;">
                                    <i class="fas fa-eye"></i> Details
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

                container.innerHTML = requestsHTML;
            }

            async loadMaintenanceRecords() {
                try {
                    const container = document.getElementById('maintenance-content');
                    if (!container) return;

                    container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading"></div>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading maintenance records...</p>
                </div>
            `;

                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/resource-maintenance?limit=50`
                    );

                    if (response && response.maintenance) {
                        this.maintenanceRecords = response.maintenance;
                        this.renderMaintenanceContent(this.maintenanceRecords);
                    } else {
                        this.renderMaintenanceContent([]);
                    }
                } catch (error) {
                    console.error('Error loading maintenance records:', error);
                    this.renderMaintenanceContent([]);
                }
            }

            renderMaintenanceContent(maintenance) {
                const container = document.getElementById('maintenance-content');
                if (!container) return;

                if (!maintenance || maintenance.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                        <i class="fas fa-tools"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">No Maintenance Records</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        No maintenance records found for your department.
                    </p>
                    <button class="btn-primary" onclick="resourcesManager.scheduleMaintenance()">
                        <i class="fas fa-plus"></i> Schedule Maintenance
                    </button>
                </div>
            `;
                    return;
                }

                const activeMaintenance = maintenance.filter(m => m.status === 'scheduled' || m.status === 'in-progress');
                const completedMaintenance = maintenance.filter(m => m.status === 'completed');

                const maintenanceHTML = `
            <div style="margin-bottom: 30px;">
                <h4 style="margin-bottom: 15px; color: var(--accent);">
                    <i class="fas fa-clock"></i> Active Maintenance (${activeMaintenance.length})
                </h4>
                ${activeMaintenance.length > 0 ? `
                    <div class="calendar-grid">
                        ${activeMaintenance.map(record => {
                    const dueDate = new Date(record.scheduled_date);
                    const today = new Date();
                    const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                    return `
                                <div class="event-card" style="border-left: 3px solid ${record.status === 'in-progress' ? '#f59e0b' : '#3b82f6'};">
                                    <div class="event-date">
                                        <div>${dueDate.getDate()}</div>
                                        <div style="font-size: 10px;">${dueDate.toLocaleString('default', { month: 'short' })}</div>
                                    </div>
                                    <div class="event-title">${record.title}</div>
                                    <div style="font-size: 12px; margin-bottom: 5px;">
                                        <strong>Resource:</strong> ${record.resource_name}
                                    </div>
                                    <div style="font-size: 12px; color: ${daysUntil <= 3 ? 'var(--danger)' : 'var(--text-muted)'}; margin-bottom: 5px;">
                                        <i class="fas fa-calendar"></i> ${dueDate.toLocaleDateString()} 
                                        (${daysUntil > 0 ? `${daysUntil} days` : 'Today'})
                                    </div>
                                    <div style="display: flex; gap: 5px; margin-top: 10px;">
                                        <button class="btn-secondary" onclick="resourcesManager.updateMaintenanceStatus('${record._id || record.id}')"
                                                style="padding: 5px 10px; font-size: 11px;">
                                            Update
                                        </button>
                                        <button class="btn-primary" onclick="resourcesManager.completeMaintenance('${record._id || record.id}')"
                                                style="padding: 5px 10px; font-size: 11px;">
                                            Complete
                                        </button>
                                    </div>
                                </div>
                            `;
                }).join('')}
                    </div>
                ` : '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No active maintenance scheduled</p>'}
            </div>
            
            <div>
                <h4 style="margin-bottom: 15px; color: var(--accent);">
                    <i class="fas fa-check-circle"></i> Recent Completed Maintenance
                </h4>
                ${completedMaintenance.slice(0, 10).map(record => {
                    const completedDate = new Date(record.completed_date);

                    return `
                        <div style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between;">
                                <div>
                                    <div style="font-weight: 500;">${record.title}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${record.resource_name}</div>
                                </div>
                                <div style="font-size: 12px; color: var(--text-muted);">
                                    ${completedDate.toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

                container.innerHTML = maintenanceHTML;
            }

            renderResourceCharts(stats) {
                // Equipment Status Chart
                const statusCtx = document.getElementById('equipmentStatusChart');
                if (statusCtx && stats.charts && stats.charts.equipment_by_status) {
                    const ctx = statusCtx.getContext('2d');
                    const chartData = stats.charts.equipment_by_status;

                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(chartData),
                            datasets: [{
                                data: Object.values(chartData),
                                backgroundColor: [
                                    'rgba(16, 185, 129, 0.7)',  // Available
                                    'rgba(59, 130, 246, 0.7)',  // In Use
                                    'rgba(245, 158, 11, 0.7)',  // Maintenance
                                    'rgba(239, 68, 68, 0.7)',   // Damaged
                                    'rgba(107, 114, 128, 0.7)'  // Other
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        color: '#94a3b8'
                                    }
                                }
                            }
                        }
                    });
                }

                // Resource Utilization Chart
                const utilizationCtx = document.getElementById('resourceUtilizationChart');
                if (utilizationCtx && stats.charts && stats.charts.utilization_by_category) {
                    const ctx = utilizationCtx.getContext('2d');
                    const chartData = stats.charts.utilization_by_category;

                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: Object.keys(chartData),
                            datasets: [{
                                label: 'Utilization Rate',
                                data: Object.values(chartData),
                                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                                borderRadius: 5
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
                                    ticks: {
                                        callback: function (value) {
                                            return value + '%';
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // Modal Methods
            showAddResourceModal() {
                document.getElementById('addResourceModal').classList.add('active');
            }

            hideAddResourceModal() {
                document.getElementById('addResourceModal').classList.remove('active');
                document.getElementById('resourceForm').reset();
            }

            showResourceDetailsModal() {
                document.getElementById('resourceDetailsModal').classList.add('active');
            }

            hideResourceDetailsModal() {
                document.getElementById('resourceDetailsModal').classList.remove('active');
            }

            showAddSoftwareModal() {
                alert('Add software license feature will be implemented in next update.');
            }

            // API Methods
            async addNewResource() {
                const form = document.getElementById('resourceForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const resourceData = {
                    name: document.getElementById('resourceName').value,
                    category: document.getElementById('resourceCategory').value,
                    model: document.getElementById('resourceModel').value || null,
                    serial_number: document.getElementById('resourceSerial').value || null,
                    location: document.getElementById('resourceLocation').value,
                    status: document.getElementById('resourceStatus').value,
                    description: document.getElementById('resourceDescription').value || null,
                    purchase_date: document.getElementById('resourcePurchaseDate').value || null,
                    warranty_expiry: document.getElementById('resourceWarrantyDate').value || null,
                    purchase_cost: document.getElementById('resourceCost').value ? parseFloat(document.getElementById('resourceCost').value) : null,
                    vendor: document.getElementById('resourceVendor').value || null,
                    notes: document.getElementById('resourceNotes').value || null,
                    department: appState.currentUser?.department || 'Computer Science'
                };

                try {
                    this.setLoading(true, 'resource');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/resources`,
                        resourceData
                    );

                    if (response) {
                        Utils.showNotification('Resource added successfully!', 'success');
                        this.hideAddResourceModal();
                        await this.loadResourcesData();
                    }
                } catch (error) {
                    console.error('Error adding resource:', error);
                    Utils.showNotification('Error adding resource. Please try again.', 'error');
                } finally {
                    this.setLoading(false, 'resource');
                }
            }

            async viewResourceDetails(resourceId) {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/resources/${resourceId}`
                    );

                    if (response) {
                        this.renderResourceDetails(response);
                    }
                } catch (error) {
                    console.error('Error loading resource details:', error);
                    Utils.showNotification('Failed to load resource details', 'error');
                }
            }

            renderResourceDetails(resource) {
                const title = document.getElementById('resourceDetailsTitle');
                const content = document.getElementById('resourceDetailsContent');

                title.textContent = resource.name;

                const detailsHTML = `
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <h3 style="color: var(--accent); margin-bottom: 5px;">${resource.name}</h3>
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                            <span style="background: rgba(139, 92, 246, 0.1); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                                ${resource.category}
                            </span>
                            <span class="item-status ${this.getStatusClass(resource.status)}">
                                ${resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; color: var(--text-muted);">
                            Added: ${new Date(resource.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="line-height: 1.6;">${resource.description || 'No description available'}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Model</div>
                        <div style="font-size: 16px; font-weight: 500;">${resource.model || 'N/A'}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Serial No.</div>
                        <div style="font-size: 16px; font-weight: 500;">${resource.serial_number || 'N/A'}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Location</div>
                        <div style="font-size: 16px; font-weight: 500;">${resource.location || 'N/A'}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Cost</div>
                        <div style="font-size: 16px; font-weight: 500;">${resource.purchase_cost ? '₹' + resource.purchase_cost : 'N/A'}</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h4 style="margin-bottom: 8px; color: var(--text);">Purchase Details</h4>
                        <div style="font-size: 14px;">
                            <div style="margin-bottom: 5px;"><strong>Date:</strong> ${resource.purchase_date ? new Date(resource.purchase_date).toLocaleDateString() : 'N/A'}</div>
                            <div style="margin-bottom: 5px;"><strong>Vendor:</strong> ${resource.vendor || 'N/A'}</div>
                            <div><strong>Warranty:</strong> ${resource.warranty_expiry ? new Date(resource.warranty_expiry).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 8px; color: var(--text);">Maintenance History</h4>
                        ${resource.last_maintenance_date ? `
                            <div style="font-size: 14px;">
                                <div style="margin-bottom: 5px;"><strong>Last Maintenance:</strong> ${new Date(resource.last_maintenance_date).toLocaleDateString()}</div>
                                <div><strong>Next Due:</strong> ${resource.next_maintenance_date ? new Date(resource.next_maintenance_date).toLocaleDateString() : 'Not scheduled'}</div>
                            </div>
                        ` : '<p style="color: var(--text-muted); font-size: 14px;">No maintenance records</p>'}
                    </div>
                </div>
                
                ${resource.notes ? `
                    <div>
                        <h4 style="margin-bottom: 8px; color: var(--text);">Additional Notes</h4>
                        <div style="background: rgba(255, 255, 255, 0.03); padding: 10px; border-radius: 8px; font-size: 14px;">
                            ${resource.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn-primary" onclick="resourcesManager.editResource('${resource._id || resource.id}')" style="flex: 1;">
                    <i class="fas fa-edit"></i> Edit Resource
                </button>
                <button class="btn-secondary" onclick="resourcesManager.scheduleMaintenance('${resource._id || resource.id}')" style="flex: 1;">
                    <i class="fas fa-tools"></i> Schedule Maintenance
                </button>
                <button class="btn-secondary" onclick="resourcesManager.generateQRCode('${resource._id || resource.id}')" style="flex: 1;">
                    <i class="fas fa-qrcode"></i> Generate QR Code
                </button>
            </div>
        `;

                content.innerHTML = detailsHTML;
                this.showResourceDetailsModal();
            }

            searchEquipment() {
                const searchTerm = document.getElementById('equipmentSearch').value.toLowerCase();
                const statusFilter = document.getElementById('equipmentStatusFilter').value;
                const categoryFilter = document.getElementById('equipmentCategoryFilter').value;
                const locationFilter = document.getElementById('equipmentLocationFilter').value;

                let filteredEquipment = this.resourcesData;

                if (searchTerm) {
                    filteredEquipment = filteredEquipment.filter(resource =>
                        (resource.name && resource.name.toLowerCase().includes(searchTerm)) ||
                        (resource.model && resource.model.toLowerCase().includes(searchTerm)) ||
                        (resource.serial_number && resource.serial_number.toLowerCase().includes(searchTerm)) ||
                        (resource.description && resource.description.toLowerCase().includes(searchTerm))
                    );
                }

                if (statusFilter !== 'all') {
                    filteredEquipment = filteredEquipment.filter(resource =>
                        resource.status === statusFilter
                    );
                }

                if (categoryFilter !== 'all') {
                    filteredEquipment = filteredEquipment.filter(resource =>
                        resource.category === categoryFilter
                    );
                }

                if (locationFilter !== 'all') {
                    filteredEquipment = filteredEquipment.filter(resource =>
                        resource.location === locationFilter
                    );
                }

                this.renderEquipmentGrid(filteredEquipment);
                this.renderEquipmentTable(filteredEquipment);
            }

            clearEquipmentFilters() {
                document.getElementById('equipmentSearch').value = '';
                document.getElementById('equipmentStatusFilter').value = 'all';
                document.getElementById('equipmentCategoryFilter').value = 'all';
                document.getElementById('equipmentLocationFilter').value = 'all';

                this.renderEquipmentGrid(this.resourcesData);
                this.renderEquipmentTable(this.resourcesData);
            }

            setLoading(isLoading, type = '') {
                const btnText = document.getElementById(`${type}SubmitBtnText`);
                const btnLoading = document.getElementById(`${type}SubmitBtnLoading`);

                if (btnText && btnLoading) {
                    if (isLoading) {
                        btnText.style.display = 'none';
                        btnLoading.style.display = 'inline-block';
                    } else {
                        btnText.style.display = 'inline';
                        btnLoading.style.display = 'none';
                    }
                }
            }

            // Other methods for different functionalities
            importResources() {
                alert('Resource import feature will be implemented in next update.');
            }

            generateResourceReport() {
                alert('Resource report generation will be implemented in next update.');
            }

            editResource(resourceId) {
                const resource = this.resourcesData.find(r =>
                    r._id === resourceId || r.id === resourceId
                );

                if (resource) {
                    alert(`Edit functionality for ${resource.name} will be implemented in next update.`);
                }
            }

            reserveResource(resourceId) {
                const resource = this.resourcesData.find(r =>
                    r._id === resourceId || r.id === resourceId
                );

                if (resource) {
                    const duration = prompt('Enter reservation duration (in days):');
                    if (duration && !isNaN(duration)) {
                        const reason = prompt('Enter reason for reservation:');
                        if (reason) {
                            Utils.showNotification(`Resource reserved for ${duration} days`, 'success');
                        }
                    }
                }
            }

            scheduleMaintenance(resourceId = null) {
                if (resourceId) {
                    const resource = this.resourcesData.find(r =>
                        r._id === resourceId || r.id === resourceId
                    );
                    if (resource) {
                        alert(`Schedule maintenance for ${resource.name} - feature coming soon.`);
                    }
                } else {
                    alert('Schedule maintenance feature will be implemented in next update.');
                }
            }

            async approveResourceRequest(requestId) {
                try {
                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/resource-requests/${requestId}/approve`
                    );

                    if (response) {
                        Utils.showNotification('Resource request approved', 'success');
                        await this.loadResourceRequests();
                    }
                } catch (error) {
                    console.error('Error approving request:', error);
                    Utils.showNotification('Failed to approve request', 'error');
                }
            }

            async rejectResourceRequest(requestId) {
                const reason = prompt('Enter reason for rejection:');
                if (reason) {
                    try {
                        const response = await Utils.postWithAuth(
                            `${API_CONFIG.BASE_URL}/hod/resource-requests/${requestId}/reject`,
                            { reason }
                        );

                        if (response) {
                            Utils.showNotification('Resource request rejected', 'success');
                            await this.loadResourceRequests();
                        }
                    } catch (error) {
                        console.error('Error rejecting request:', error);
                        Utils.showNotification('Failed to reject request', 'error');
                    }
                }
            }
        }
        // Reports Manager Class
        class ReportsManager {
            constructor() {
                this.reportsData = [];
                this.reportStats = null;
                this.templatesData = [];
                this.scheduledReports = [];
                this.initReports();
            }

            initReports() {
                this.setupReportsEventListeners();
                this.setupReportsTabs();
            }

            setupReportsEventListeners() {
                // Tab buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const tabId = e.target.getAttribute('data-tab');
                        if (tabId.includes('reports-tab') || tabId.includes('templates-tab')) {
                            this.switchReportsTab(tabId);
                        }
                    });
                });

                // Report management buttons
                document.getElementById('generateCustomReport')?.addEventListener('click', () => {
                    this.showGenerateReportModal();
                });

                document.getElementById('scheduleReport')?.addEventListener('click', () => {
                    this.showScheduleReportModal();
                });

                document.getElementById('importReportData')?.addEventListener('click', () => {
                    this.importReportData();
                });

                document.getElementById('reportAnalytics')?.addEventListener('click', () => {
                    this.switchReportsTab('analytics-tab');
                });

                document.getElementById('addScheduledReport')?.addEventListener('click', () => {
                    this.showScheduleReportModal();
                });

                document.getElementById('addReportTemplate')?.addEventListener('click', () => {
                    this.showCreateTemplateModal();
                });

                // Form submissions
                document.getElementById('generateReportForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.generateCustomReport();
                });

                document.getElementById('scheduleReportForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.scheduleAutomatedReport();
                });

                document.getElementById('templateForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.createReportTemplate();
                });

                // Report search functionality
                document.getElementById('searchReportsBtn')?.addEventListener('click', () => {
                    this.searchReports();
                });

                document.getElementById('clearReportFilters')?.addEventListener('click', () => {
                    this.clearReportFilters();
                });

                document.getElementById('reportSearch')?.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchReports();
                    }
                });

                // Date range toggle
                document.getElementById('dateRange')?.addEventListener('change', (e) => {
                    const customRangeDiv = document.getElementById('customDateRange');
                    if (e.target.value === 'custom') {
                        customRangeDiv.style.display = 'grid';
                    } else {
                        customRangeDiv.style.display = 'none';
                    }
                });

                document.getElementById('scheduleFrequency')?.addEventListener('change', (e) => {
                    const customScheduleDiv = document.getElementById('customSchedule');
                    if (e.target.value === 'custom') {
                        customScheduleDiv.style.display = 'grid';
                    } else {
                        customScheduleDiv.style.display = 'none';
                    }
                });

                // Modal close buttons
                document.getElementById('closeReportModal')?.addEventListener('click', () => {
                    this.hideReportDetailsModal();
                });

                document.getElementById('closeGenerateModal')?.addEventListener('click', () => {
                    this.hideGenerateReportModal();
                });

                document.getElementById('cancelGenerateModal')?.addEventListener('click', () => {
                    this.hideGenerateReportModal();
                });

                document.getElementById('closeScheduleModal')?.addEventListener('click', () => {
                    this.hideScheduleReportModal();
                });

                document.getElementById('cancelScheduleModal')?.addEventListener('click', () => {
                    this.hideScheduleReportModal();
                });

                document.getElementById('closeTemplateModal')?.addEventListener('click', () => {
                    this.hideCreateTemplateModal();
                });

                document.getElementById('cancelTemplateModal')?.addEventListener('click', () => {
                    this.hideCreateTemplateModal();
                });

                // Set default dates
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('scheduleStartDate')?.setAttribute('min', today);
                document.getElementById('scheduleEndDate')?.setAttribute('min', today);
                document.getElementById('startDate')?.setAttribute('max', today);
                document.getElementById('endDate')?.setAttribute('max', today);
            }

            setupReportsTabs() {
                this.switchReportsTab('all-reports-tab');
            }

            switchReportsTab(tabId) {
                // Update tab buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-tab') === tabId) {
                        btn.classList.add('active');
                    }
                });

                // Show selected tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');

                        // Load data for specific tab if needed
                        switch (tabId) {
                            case 'all-reports-tab':
                                this.loadReportsData();
                                break;
                            case 'generated-tab':
                                this.loadRecentReports();
                                break;
                            case 'scheduled-tab':
                                this.loadScheduledReports();
                                break;
                            case 'templates-tab':
                                this.loadReportTemplates();
                                break;
                            case 'analytics-tab':
                                this.loadReportsAnalytics();
                                break;
                        }
                    }
                });
            }

            async loadReportsData() {
                try {
                    // Load report statistics
                    const statsResponse = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/stats`
                    );

                    if (statsResponse) {
                        this.reportStats = statsResponse;
                        this.renderReportsStats(statsResponse);
                        this.renderReportsCharts(statsResponse);
                    }

                    // Load reports list
                    await this.loadReportsList();

                } catch (error) {
                    console.error('Error loading reports data:', error);
                    Utils.showNotification('Failed to load reports data', 'error');
                }
            }

            async loadReportsList() {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports?limit=100`
                    );

                    if (response && response.reports) {
                        this.reportsData = response.reports;
                        this.renderReportsGrid(this.reportsData);
                        this.renderReportsTable(this.reportsData);
                    }
                } catch (error) {
                    console.error('Error loading reports list:', error);
                    Utils.showNotification('Failed to load reports', 'error');
                }
            }

            renderReportsStats(stats) {
                const container = document.getElementById('reports-stats');
                if (!container) return;

                container.innerHTML = `
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="overview-change change-up">
                        +${stats.total_reports_growth || 0}%
                    </div>
                </div>
                <div class="overview-value">${stats.total_reports || 0}</div>
                <div class="overview-label">Total Reports</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="overview-change ${stats.active_schedules > 0 ? 'change-up' : 'change-down'}">
                        ${stats.active_schedules || 0} active
                    </div>
                </div>
                <div class="overview-value">${stats.scheduled_reports || 0}</div>
                <div class="overview-label">Scheduled Reports</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="overview-change change-up">
                        +${stats.templates_growth || 0}
                    </div>
                </div>
                <div class="overview-value">${stats.report_templates || 0}</div>
                <div class="overview-label">Report Templates</div>
            </div>
            
            <div class="overview-card">
                <div class="overview-header">
                    <div class="overview-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="overview-change ${stats.avg_generation_time_growth >= 0 ? 'change-up' : 'change-down'}">
                        ${stats.avg_generation_time_growth >= 0 ? '+' : ''}${stats.avg_generation_time_growth || 0}%
                    </div>
                </div>
                <div class="overview-value">${stats.avg_generation_time || 0}s</div>
                <div class="overview-label">Avg. Generation Time</div>
            </div>
        `;
            }

            renderReportsGrid(reports) {
                const container = document.getElementById('reports-grid-container');
                if (!container) return;

                if (!reports || reports.length === 0) {
                    container.innerHTML = `
                <div class="course-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div style="margin-bottom: 20px;">
                        <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">No Reports Found</h3>
                        <p style="color: var(--text-muted); margin-bottom: 20px;">
                            No reports have been generated for your department yet.
                        </p>
                    </div>
                    <button class="btn-primary" onclick="reportsManager.showGenerateReportModal()">
                        <i class="fas fa-plus-circle"></i> Generate First Report
                    </button>
                </div>
            `;
                    return;
                }

                const cardsHTML = reports.map(report => `
            <div class="course-card" data-report-id="${report._id || report.id}">
                <div class="course-header">
                    <div class="course-code">${this.getReportTypeIcon(report.type)} ${this.formatReportType(report.type)}</div>
                    <div class="course-type type-${report.status || 'generated'}">
                        ${this.formatReportStatus(report.status)}
                    </div>
                </div>
                
                <div class="course-title">${report.title || 'Untitled Report'}</div>
                
                <div class="course-description">
                    ${report.description || 'No description available'}
                </div>
                
                <div class="course-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${new Date(report.generated_at).toLocaleDateString()}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${report.generated_by_name || 'System'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-file"></i>
                        <span>${report.format?.toUpperCase() || 'PDF'}</span>
                    </div>
                </div>
                
                <div class="course-actions">
                    <button class="btn-secondary" onclick="reportsManager.viewReportDetails('${report._id || report.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-primary" onclick="reportsManager.downloadReport('${report._id || report.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn-secondary" onclick="reportsManager.shareReport('${report._id || report.id}')">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        `).join('');

                container.innerHTML = cardsHTML;
            }

            renderReportsTable(reports) {
                const tableBody = document.getElementById('reports-table-body');
                if (!tableBody) return;

                const rowsHTML = reports.map(report => `
            <tr>
                <td>
                    <div style="font-weight: 500;">${report.title || 'Untitled Report'}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">
                        ${this.formatReportType(report.type)}
                    </div>
                </td>
                <td>
                    <span style="display: flex; align-items: center; gap: 5px;">
                        ${this.getReportTypeIcon(report.type)}
                        ${this.formatReportType(report.type)}
                    </span>
                </td>
                <td>${report.generated_by_name || 'System'}</td>
                <td>${new Date(report.generated_at).toLocaleDateString()}</td>
                <td>
                    <span style="background: rgba(139, 92, 246, 0.1); color: var(--accent); padding: 4px 8px; border-radius: 6px; font-size: 12px;">
                        ${report.format?.toUpperCase() || 'PDF'}
                    </span>
                </td>
                <td>${this.formatFileSize(report.file_size || 0)}</td>
                <td>
                    <span class="item-status ${this.getStatusClass(report.status)}">
                        ${this.formatReportStatus(report.status)}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-secondary" onclick="reportsManager.viewReportDetails('${report._id || report.id}')" 
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-primary" onclick="reportsManager.downloadReport('${report._id || report.id}')"
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-secondary" onclick="reportsManager.deleteReport('${report._id || report.id}')"
                                style="padding: 5px 10px; font-size: 12px; background: rgba(239, 68, 68, 0.2); color: var(--danger);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

                tableBody.innerHTML = rowsHTML;
            }

            getReportTypeIcon(type) {
                const icons = {
                    'academic': 'fas fa-graduation-cap',
                    'faculty': 'fas fa-chalkboard-teacher',
                    'attendance': 'fas fa-calendar-check',
                    'financial': 'fas fa-money-bill-wave',
                    'resource': 'fas fa-cogs',
                    'placement': 'fas fa-briefcase',
                    'research': 'fas fa-flask',
                    'inventory': 'fas fa-boxes',
                    'custom': 'fas fa-file-alt'
                };
                return `<i class="${icons[type] || 'fas fa-file-alt'}"></i>`;
            }

            formatReportType(type) {
                const types = {
                    'academic': 'Academic Performance',
                    'faculty': 'Faculty Performance',
                    'attendance': 'Attendance Report',
                    'financial': 'Financial Report',
                    'resource': 'Resource Utilization',
                    'placement': 'Placement Report',
                    'research': 'Research Report',
                    'inventory': 'Inventory Report',
                    'custom': 'Custom Report'
                };
                return types[type] || type;
            }

            formatReportStatus(status) {
                const statuses = {
                    'generated': 'Generated',
                    'pending': 'Pending',
                    'scheduled': 'Scheduled',
                    'failed': 'Failed',
                    'processing': 'Processing'
                };
                return statuses[status] || status;
            }

            getStatusClass(status) {
                const classes = {
                    'generated': 'status-active',
                    'pending': 'status-pending',
                    'scheduled': 'status-review',
                    'failed': 'status-rejected',
                    'processing': 'status-pending'
                };
                return classes[status] || 'status-active';
            }

            formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            renderReportsCharts(stats) {
                // Report Type Distribution Chart
                const typeCtx = document.getElementById('reportTypeChart');
                if (typeCtx && stats.report_type_distribution) {
                    const ctx = typeCtx.getContext('2d');

                    const existingChart = Chart.getChart(typeCtx);
                    if (existingChart) {
                        existingChart.destroy();
                    }

                    const labels = Object.keys(stats.report_type_distribution).map(key =>
                        this.formatReportType(key)
                    );
                    const data = Object.values(stats.report_type_distribution);

                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: data,
                                backgroundColor: [
                                    '#8b5cf6', '#6366f1', '#4f46e5', '#10b981',
                                    '#0ea5e9', '#f59e0b', '#ef4444', '#ec4899'
                                ],
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        color: '#94a3b8',
                                        padding: 20,
                                        font: {
                                            size: 11
                                        }
                                    }
                                }
                            }
                        }
                    });
                }

                // Report Usage Chart
                const usageCtx = document.getElementById('reportUsageChart');
                if (usageCtx && stats.monthly_usage) {
                    const ctx = usageCtx.getContext('2d');

                    const existingChart = Chart.getChart(usageCtx);
                    if (existingChart) {
                        existingChart.destroy();
                    }

                    const months = Object.keys(stats.monthly_usage);
                    const usageData = Object.values(stats.monthly_usage);

                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: months,
                            datasets: [{
                                label: 'Reports Generated',
                                data: usageData,
                                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                                borderColor: '#8b5cf6',
                                borderWidth: 1,
                                borderRadius: 5
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#94a3b8'
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        color: '#94a3b8',
                                        stepSize: 1
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    }
                                },
                                x: {
                                    ticks: {
                                        color: '#94a3b8'
                                    },
                                    grid: {
                                        display: false
                                    }
                                }
                            }
                        }
                    });
                }

                // Report Timeline Chart
                const timelineCtx = document.getElementById('reportTimelineChart');
                if (timelineCtx && stats.daily_timeline) {
                    const ctx = timelineCtx.getContext('2d');

                    const existingChart = Chart.getChart(timelineCtx);
                    if (existingChart) {
                        existingChart.destroy();
                    }

                    const dates = Object.keys(stats.daily_timeline);
                    const timelineData = Object.values(stats.daily_timeline);

                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: dates,
                            datasets: [{
                                label: 'Daily Reports',
                                data: timelineData,
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                tension: 0.4,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#94a3b8'
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        color: '#94a3b8',
                                        stepSize: 1
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    }
                                },
                                x: {
                                    ticks: {
                                        color: '#94a3b8'
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // Modal Management Methods
            showGenerateReportModal() {
                document.getElementById('generateReportModal').classList.add('active');
            }

            hideGenerateReportModal() {
                document.getElementById('generateReportModal').classList.remove('active');
                document.getElementById('generateReportForm').reset();
                document.getElementById('customDateRange').style.display = 'none';
            }

            showScheduleReportModal() {
                // Load templates into dropdown
                this.populateScheduleTemplates();
                document.getElementById('scheduleReportModal').classList.add('active');
            }

            hideScheduleReportModal() {
                document.getElementById('scheduleReportModal').classList.remove('active');
                document.getElementById('scheduleReportForm').reset();
                document.getElementById('customSchedule').style.display = 'none';
            }

            showCreateTemplateModal() {
                document.getElementById('createTemplateModal').classList.add('active');
            }

            hideCreateTemplateModal() {
                document.getElementById('createTemplateModal').classList.remove('active');
                document.getElementById('templateForm').reset();
            }

            showReportDetailsModal(report) {
                document.getElementById('reportDetailsModal').classList.add('active');
                this.renderReportDetails(report);
            }

            hideReportDetailsModal() {
                document.getElementById('reportDetailsModal').classList.remove('active');
            }

            // API Methods
            async generateCustomReport() {
                const form = document.getElementById('generateReportForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const reportData = {
                    title: document.getElementById('reportTitle').value,
                    type: document.getElementById('reportType').value,
                    format: document.getElementById('reportFormat').value,
                    date_range: document.getElementById('dateRange').value,
                    sections: Array.from(document.querySelectorAll('input[name="reportSections"]:checked'))
                        .map(checkbox => checkbox.value),
                    parameters: document.getElementById('reportParameters').value
                };

                // Add custom dates if selected
                if (reportData.date_range === 'custom') {
                    reportData.start_date = document.getElementById('startDate').value;
                    reportData.end_date = document.getElementById('endDate').value;
                }

                try {
                    this.setLoading(true, 'generateReport');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/generate`,
                        reportData
                    );

                    if (response) {
                        Utils.showNotification('Report generation started! You will be notified when complete.', 'success');
                        this.hideGenerateReportModal();

                        // Start polling for report status
                        this.pollReportStatus(response.report_id);
                    }
                } catch (error) {
                    console.error('Error generating report:', error);
                    Utils.showNotification('Error generating report. Please try again.', 'error');
                } finally {
                    this.setLoading(false, 'generateReport');
                }
            }

            async pollReportStatus(reportId) {
                let attempts = 0;
                const maxAttempts = 30; // 30 seconds timeout

                const checkStatus = async () => {
                    try {
                        const response = await Utils.fetchWithAuth(
                            `${API_CONFIG.BASE_URL}/hod/reports/${reportId}/status`
                        );

                        if (response && response.status === 'generated') {
                            Utils.showNotification('Report generated successfully!', 'success');
                            await this.loadReportsData();
                            return;
                        } else if (response && response.status === 'failed') {
                            Utils.showNotification('Report generation failed', 'error');
                            return;
                        }

                        // Continue polling
                        attempts++;
                        if (attempts < maxAttempts) {
                            setTimeout(checkStatus, 1000);
                        } else {
                            Utils.showNotification('Report generation timed out', 'warning');
                        }
                    } catch (error) {
                        console.error('Error checking report status:', error);
                        attempts++;
                        if (attempts < maxAttempts) {
                            setTimeout(checkStatus, 1000);
                        }
                    }
                };

                checkStatus();
            }

            async scheduleAutomatedReport() {
                const form = document.getElementById('scheduleReportForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const scheduleData = {
                    template_id: document.getElementById('scheduleTemplate').value,
                    frequency: document.getElementById('scheduleFrequency').value,
                    recipients: document.getElementById('scheduleRecipients').value
                        .split(',')
                        .map(email => email.trim())
                        .filter(email => email),
                    start_date: document.getElementById('scheduleStartDate').value,
                    end_date: document.getElementById('scheduleEndDate').value || null
                };

                // Add custom schedule details
                if (scheduleData.frequency === 'custom') {
                    scheduleData.day_of_week = document.getElementById('customDay').value;
                    scheduleData.time = document.getElementById('customTime').value;
                }

                try {
                    this.setLoading(true, 'scheduleReport');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/schedule`,
                        scheduleData
                    );

                    if (response) {
                        Utils.showNotification('Report scheduled successfully!', 'success');
                        this.hideScheduleReportModal();
                        await this.loadScheduledReports();
                    }
                } catch (error) {
                    console.error('Error scheduling report:', error);
                    Utils.showNotification('Error scheduling report. Please try again.', 'error');
                } finally {
                    this.setLoading(false, 'scheduleReport');
                }
            }

            async createReportTemplate() {
                const form = document.getElementById('templateForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const templateData = {
                    name: document.getElementById('templateName').value,
                    description: document.getElementById('templateDescription').value,
                    type: document.getElementById('templateType').value,
                    format: document.getElementById('templateFormat').value,
                    sections: document.getElementById('templateSections').value,
                    data_sources: Array.from(document.querySelectorAll('input[name="dataSources"]:checked'))
                        .map(checkbox => checkbox.value)
                };

                try {
                    this.setLoading(true, 'template');

                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/templates`,
                        templateData
                    );

                    if (response) {
                        Utils.showNotification('Template created successfully!', 'success');
                        this.hideCreateTemplateModal();
                        await this.loadReportTemplates();
                    }
                } catch (error) {
                    console.error('Error creating template:', error);
                    Utils.showNotification('Error creating template. Please try again.', 'error');
                } finally {
                    this.setLoading(false, 'template');
                }
            }

            async viewReportDetails(reportId) {
                try {
                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/${reportId}`
                    );

                    if (response) {
                        this.renderReportDetails(response);
                    }
                } catch (error) {
                    console.error('Error loading report details:', error);
                    Utils.showNotification('Failed to load report details', 'error');
                }
            }

            renderReportDetails(report) {
                const title = document.getElementById('reportDetailsTitle');
                const content = document.getElementById('reportDetailsContent');

                title.textContent = report.title;

                const metadata = report.metadata || {};
                const parameters = report.parameters || {};

                content.innerHTML = `
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <h3 style="color: var(--accent); margin-bottom: 5px;">${report.title}</h3>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                            <span style="display: flex; align-items: center; gap: 5px;">
                                ${this.getReportTypeIcon(report.type)}
                                <span>${this.formatReportType(report.type)}</span>
                            </span>
                            <span class="item-status ${this.getStatusClass(report.status)}">
                                ${this.formatReportStatus(report.status)}
                            </span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; color: var(--text-muted);">
                            Generated: ${new Date(report.generated_at).toLocaleString()}
                        </div>
                        <div style="font-size: 12px; color: var(--text-muted);">
                            By: ${report.generated_by_name}
                        </div>
                    </div>
                </div>
                
                ${report.description ? `
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <p style="line-height: 1.6;">${report.description}</p>
                    </div>
                ` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Format</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--accent);">
                            ${report.format?.toUpperCase() || 'PDF'}
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">File Size</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--accent);">
                            ${this.formatFileSize(report.file_size || 0)}
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Generation Time</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--accent);">
                            ${report.generation_time || 0}s
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">Download Count</div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--accent);">
                            ${report.download_count || 0}
                        </div>
                    </div>
                </div>
                
                ${Object.keys(metadata).length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: var(--text);">Report Metadata</h4>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                            ${Object.entries(metadata).map(([key, value]) => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: var(--text-muted);">${key}:</span>
                                    <span>${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${Object.keys(parameters).length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: var(--text);">Report Parameters</h4>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                            ${Object.entries(parameters).map(([key, value]) => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: var(--text-muted);">${key}:</span>
                                    <span>${JSON.stringify(value)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn-primary" onclick="reportsManager.downloadReport('${report._id || report.id}')" style="flex: 1;">
                    <i class="fas fa-download"></i> Download Report
                </button>
                <button class="btn-secondary" onclick="reportsManager.shareReport('${report._id || report.id}')" style="flex: 1;">
                    <i class="fas fa-share"></i> Share Report
                </button>
                <button class="btn-secondary" onclick="reportsManager.deleteReport('${report._id || report.id}')" style="flex: 1;">
                    <i class="fas fa-trash"></i> Delete Report
                </button>
            </div>
        `;

                this.showReportDetailsModal(report);
            }

            async downloadReport(reportId) {
                try {
                    const response = await fetch(
                        `${API_CONFIG.BASE_URL}/hod/reports/${reportId}/download`,
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            }
                        }
                    );

                    if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `report_${reportId}.${response.headers.get('content-type').includes('pdf') ? 'pdf' : 'xlsx'}`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        Utils.showNotification('Report downloaded successfully!', 'success');

                        // Update download count
                        await this.loadReportsData();
                    } else {
                        throw new Error('Download failed');
                    }
                } catch (error) {
                    console.error('Error downloading report:', error);
                    Utils.showNotification('Failed to download report', 'error');
                }
            }

            async shareReport(reportId) {
                const email = prompt('Enter email address to share report with:');
                if (!email) return;

                try {
                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/${reportId}/share`,
                        { email: email }
                    );

                    if (response) {
                        Utils.showNotification('Report shared successfully!', 'success');
                    }
                } catch (error) {
                    console.error('Error sharing report:', error);
                    Utils.showNotification('Failed to share report', 'error');
                }
            }

            async deleteReport(reportId) {
                if (!confirm('Are you sure you want to delete this report?')) return;

                try {
                    const response = await fetch(
                        `${API_CONFIG.BASE_URL}/hod/reports/${reportId}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            }
                        }
                    );

                    if (response.ok) {
                        Utils.showNotification('Report deleted successfully!', 'success');
                        await this.loadReportsData();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    console.error('Error deleting report:', error);
                    Utils.showNotification('Failed to delete report', 'error');
                }
            }

            async loadRecentReports() {
                try {
                    const container = document.getElementById('recent-reports-container');
                    if (!container) return;

                    container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading"></div>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading recent reports...</p>
                </div>
            `;

                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/recent?limit=10`
                    );

                    if (response && response.reports) {
                        this.renderRecentReports(response.reports);
                    } else {
                        this.renderRecentReports([]);
                    }
                } catch (error) {
                    console.error('Error loading recent reports:', error);
                    this.renderRecentReports([]);
                }
            }

            renderRecentReports(reports) {
                const container = document.getElementById('recent-reports-container');
                if (!container) return;

                if (!reports || reports.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">No Recent Reports</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        No reports have been generated recently.
                    </p>
                    <button class="btn-primary" onclick="reportsManager.showGenerateReportModal()">
                        <i class="fas fa-plus"></i> Generate Report
                    </button>
                </div>
            `;
                    return;
                }

                const reportsHTML = `
            <div class="calendar-grid">
                ${reports.map(report => {
                    const date = new Date(report.generated_at);
                    const day = date.getDate();
                    const month = date.toLocaleString('default', { month: 'short' });

                    return `
                        <div class="event-card">
                            <div class="event-date">
                                <div>${day}</div>
                                <div style="font-size: 10px;">${month}</div>
                            </div>
                            <div class="event-title">${report.title}</div>
                            <div class="event-type ${report.type}">
                                ${this.formatReportType(report.type)}
                            </div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">
                                <i class="far fa-clock"></i> 
                                ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style="font-size: 12px; color: var(--text-muted);">
                                <i class="fas fa-user"></i> ${report.generated_by_name}
                            </div>
                            <div style="margin-top: 10px; display: flex; gap: 5px;">
                                <button class="btn-secondary" onclick="reportsManager.viewReportDetails('${report._id || report.id}')"
                                        style="padding: 5px 10px; font-size: 11px;">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-primary" onclick="reportsManager.downloadReport('${report._id || report.id}')"
                                        style="padding: 5px 10px; font-size: 11px;">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

                container.innerHTML = reportsHTML;
            }

            async loadScheduledReports() {
                try {
                    const container = document.getElementById('scheduled-reports-container');
                    if (!container) return;

                    container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading"></div>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading scheduled reports...</p>
                </div>
            `;

                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/scheduled`
                    );

                    if (response && response.schedules) {
                        this.scheduledReports = response.schedules;
                        this.renderScheduledReports(response.schedules);
                    } else {
                        this.renderScheduledReports([]);
                    }
                } catch (error) {
                    console.error('Error loading scheduled reports:', error);
                    this.renderScheduledReports([]);
                }
            }

            renderScheduledReports(schedules) {
                const container = document.getElementById('scheduled-reports-container');
                if (!container) return;

                if (!schedules || schedules.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">No Scheduled Reports</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        No automated reports are scheduled for your department.
                    </p>
                    <button class="btn-primary" onclick="reportsManager.showScheduleReportModal()">
                        <i class="fas fa-plus"></i> Schedule First Report
                    </button>
                </div>
            `;
                    return;
                }

                const schedulesHTML = `
            <div class="assignments-grid">
                ${schedules.map(schedule => `
                    <div class="assignment-card">
                        <div class="assignment-header">
                            <div>
                                <div style="font-weight: 500; color: var(--accent);">${schedule.template_name}</div>
                                <div style="font-size: 12px; color: var(--text-muted);">
                                    ${schedule.frequency} • ${schedule.format}
                                </div>
                            </div>
                            <div class="course-type ${schedule.active ? 'type-core' : 'type-lab'}">
                                ${schedule.active ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">Next Run:</div>
                            <div style="font-size: 14px; font-weight: 500;">
                                ${new Date(schedule.next_run).toLocaleString()}
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">Recipients:</div>
                            <div style="font-size: 13px;">
                                ${schedule.recipients_count || 0} email(s)
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px; margin-top: 15px;">
                            <button class="btn-secondary" onclick="reportsManager.editSchedule('${schedule._id}')"
                                    style="padding: 5px 10px; font-size: 11px; flex: 1;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-secondary" onclick="reportsManager.toggleSchedule('${schedule._id}', ${!schedule.active})"
                                    style="padding: 5px 10px; font-size: 11px; flex: 1;">
                                <i class="fas fa-power-off"></i> ${schedule.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button class="btn-secondary" onclick="reportsManager.deleteSchedule('${schedule._id}')"
                                    style="padding: 5px 10px; font-size: 11px; flex: 1; background: rgba(239, 68, 68, 0.2); color: var(--danger);">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

                container.innerHTML = schedulesHTML;
            }

            async loadReportTemplates() {
                try {
                    const container = document.getElementById('report-templates-container');
                    if (!container) return;

                    container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading"></div>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading report templates...</p>
                </div>
            `;

                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/templates`
                    );

                    if (response && response.templates) {
                        this.templatesData = response.templates;
                        this.renderReportTemplates(response.templates);
                    } else {
                        this.renderReportTemplates([]);
                    }
                } catch (error) {
                    console.error('Error loading templates:', error);
                    this.renderReportTemplates([]);
                }
            }

            renderReportTemplates(templates) {
                const container = document.getElementById('report-templates-container');
                if (!container) return;

                if (!templates || templates.length === 0) {
                    container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="card-icon" style="margin: 0 auto 15px auto; background: rgba(139, 92, 246, 0.2); color: var(--accent);">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">No Report Templates</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        No report templates have been created yet.
                    </p>
                    <button class="btn-primary" onclick="reportsManager.showCreateTemplateModal()">
                        <i class="fas fa-plus"></i> Create First Template
                    </button>
                </div>
            `;
                    return;
                }

                const templatesHTML = `
            <div class="courses-grid">
                ${templates.map(template => `
                    <div class="course-card">
                        <div class="course-header">
                            <div class="course-code">
                                ${this.getReportTypeIcon(template.type)}
                            </div>
                            <div class="course-type type-${template.status || 'active'}">
                                ${template.usage_count || 0} uses
                            </div>
                        </div>
                        
                        <div class="course-title">${template.name}</div>
                        
                        <div class="course-description">
                            ${template.description || 'No description available'}
                        </div>
                        
                        <div class="course-meta">
                            <div class="meta-item">
                                <i class="fas fa-file"></i>
                                <span>${template.format?.toUpperCase() || 'PDF'}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>Created ${new Date(template.created_at).toLocaleDateString()}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-user"></i>
                                <span>${template.created_by_name}</span>
                            </div>
                        </div>
                        
                        <div class="course-actions">
                            <button class="btn-secondary" onclick="reportsManager.useTemplate('${template._id || template.id}')">
                                <i class="fas fa-play"></i> Use
                            </button>
                            <button class="btn-primary" onclick="reportsManager.editTemplate('${template._id || template.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-secondary" onclick="reportsManager.deleteTemplate('${template._id || template.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

                container.innerHTML = templatesHTML;
            }

            async loadReportsAnalytics() {
                try {
                    const container = document.getElementById('reports-analytics-container');
                    if (!container) return;

                    container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading"></div>
                    <p style="color: var(--text-muted); margin-top: 10px;">Loading reports analytics...</p>
                </div>
            `;

                    const response = await Utils.fetchWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/analytics`
                    );

                    if (response) {
                        this.renderReportsAnalytics(response);
                    } else {
                        this.renderReportsAnalytics({});
                    }
                } catch (error) {
                    console.error('Error loading reports analytics:', error);
                    this.renderReportsAnalytics({});
                }
            }

            renderReportsAnalytics(analytics) {
                const container = document.getElementById('reports-analytics-container');
                if (!container) return;

                const usageStats = analytics.usage_statistics || {};
                const userStats = analytics.user_statistics || {};

                container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px;">
                    <h4 style="margin-bottom: 15px; color: var(--accent);">Usage Statistics</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Total Reports</div>
                            <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                                ${usageStats.total_reports || 0}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Downloads</div>
                            <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                                ${usageStats.total_downloads || 0}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Avg. Generation Time</div>
                            <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                                ${usageStats.avg_generation_time || 0}s
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Success Rate</div>
                            <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                                ${usageStats.success_rate || 0}%
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px;">
                    <h4 style="margin-bottom: 15px; color: var(--accent);">User Statistics</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Active Users</div>
                            <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                                ${userStats.active_users || 0}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Most Active User</div>
                            <div style="font-size: 16px; font-weight: bold; color: var(--accent);">
                                ${userStats.most_active_user || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Reports/User</div>
                            <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                                ${userStats.avg_reports_per_user || 0}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Top Report Type</div>
                            <div style="font-size: 16px; font-weight: bold; color: var(--accent);">
                                ${this.formatReportType(userStats.top_report_type) || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 30px;">
                <canvas id="detailedAnalyticsChart" style="height: 300px;"></canvas>
            </div>
        `;
            }

            populateScheduleTemplates() {
                const select = document.getElementById('scheduleTemplate');
                if (!select || !this.templatesData.length) return;

                select.innerHTML = '<option value="">-- Select Template --</option>';

                this.templatesData.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template._id || template.id;
                    option.textContent = `${template.name} (${this.formatReportType(template.type)})`;
                    select.appendChild(option);
                });
            }

            searchReports() {
                const searchTerm = document.getElementById('reportSearch').value.toLowerCase();
                const typeFilter = document.getElementById('reportTypeFilter').value;
                const statusFilter = document.getElementById('reportStatusFilter').value;
                const periodFilter = document.getElementById('reportPeriodFilter').value;

                let filteredReports = this.reportsData;

                if (searchTerm) {
                    filteredReports = filteredReports.filter(report =>
                        (report.title && report.title.toLowerCase().includes(searchTerm)) ||
                        (report.description && report.description.toLowerCase().includes(searchTerm)) ||
                        (report.type && report.type.toLowerCase().includes(searchTerm))
                    );
                }

                if (typeFilter !== 'all') {
                    filteredReports = filteredReports.filter(report =>
                        report.type === typeFilter
                    );
                }

                if (statusFilter !== 'all') {
                    filteredReports = filteredReports.filter(report =>
                        report.status === statusFilter
                    );
                }

                if (periodFilter !== 'all') {
                    const now = new Date();
                    let startDate;

                    switch (periodFilter) {
                        case 'today':
                            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            break;
                        case 'week':
                            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                            break;
                        case 'month':
                            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                            break;
                        case 'quarter':
                            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                            break;
                        case 'year':
                            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                            break;
                    }

                    filteredReports = filteredReports.filter(report =>
                        new Date(report.generated_at) >= startDate
                    );
                }

                this.renderReportsGrid(filteredReports);
                this.renderReportsTable(filteredReports);
            }

            clearReportFilters() {
                document.getElementById('reportSearch').value = '';
                document.getElementById('reportTypeFilter').value = 'all';
                document.getElementById('reportStatusFilter').value = 'all';
                document.getElementById('reportPeriodFilter').value = 'all';

                this.renderReportsGrid(this.reportsData);
                this.renderReportsTable(this.reportsData);
            }

            async useTemplate(templateId) {
                const template = this.templatesData.find(t =>
                    t._id === templateId || t.id === templateId
                );

                if (template) {
                    // Pre-fill the generate report form with template data
                    document.getElementById('reportTitle').value = `Report based on ${template.name}`;
                    document.getElementById('reportType').value = template.type;
                    document.getElementById('reportFormat').value = template.format;

                    if (template.sections) {
                        try {
                            const sections = JSON.parse(template.sections);
                            if (sections.sections && Array.isArray(sections.sections)) {
                                document.querySelectorAll('input[name="reportSections"]').forEach(checkbox => {
                                    checkbox.checked = sections.sections.includes(checkbox.value);
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing template sections:', e);
                        }
                    }

                    this.showGenerateReportModal();
                }
            }

            async editTemplate(templateId) {
                const template = this.templatesData.find(t =>
                    t._id === templateId || t.id === templateId
                );

                if (template) {
                    alert(`Edit functionality for template "${template.name}" will be implemented in the next update.`);
                }
            }

            async deleteTemplate(templateId) {
                if (!confirm('Are you sure you want to delete this template?')) return;

                try {
                    const response = await fetch(
                        `${API_CONFIG.BASE_URL}/hod/reports/templates/${templateId}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            }
                        }
                    );

                    if (response.ok) {
                        Utils.showNotification('Template deleted successfully!', 'success');
                        await this.loadReportTemplates();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    console.error('Error deleting template:', error);
                    Utils.showNotification('Failed to delete template', 'error');
                }
            }

            async editSchedule(scheduleId) {
                const schedule = this.scheduledReports.find(s =>
                    s._id === scheduleId
                );

                if (schedule) {
                    alert(`Edit functionality for schedule will be implemented in the next update.`);
                }
            }

            async toggleSchedule(scheduleId, activate) {
                try {
                    const response = await Utils.postWithAuth(
                        `${API_CONFIG.BASE_URL}/hod/reports/schedules/${scheduleId}/toggle`,
                        { active: activate }
                    );

                    if (response) {
                        Utils.showNotification(`Schedule ${activate ? 'activated' : 'deactivated'} successfully!`, 'success');
                        await this.loadScheduledReports();
                    }
                } catch (error) {
                    console.error('Error toggling schedule:', error);
                    Utils.showNotification('Failed to update schedule', 'error');
                }
            }

            async deleteSchedule(scheduleId) {
                if (!confirm('Are you sure you want to delete this schedule?')) return;

                try {
                    const response = await fetch(
                        `${API_CONFIG.BASE_URL}/hod/reports/schedules/${scheduleId}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            }
                        }
                    );

                    if (response.ok) {
                        Utils.showNotification('Schedule deleted successfully!', 'success');
                        await this.loadScheduledReports();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    console.error('Error deleting schedule:', error);
                    Utils.showNotification('Failed to delete schedule', 'error');
                }
            }

            importReportData() {
                // This would open a file upload dialog for importing data
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv,.xlsx,.json';
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        await this.processImportFile(file);
                    }
                };
                input.click();
            }

            async processImportFile(file) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch(
                        `${API_CONFIG.BASE_URL}/hod/reports/import`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            },
                            body: formData
                        }
                    );

                    if (response.ok) {
                        Utils.showNotification('Data imported successfully!', 'success');
                        await this.loadReportsData();
                    } else {
                        throw new Error('Import failed');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    Utils.showNotification('Failed to import data', 'error');
                }
            }

            setLoading(isLoading, type = '') {
                const btnText = document.getElementById(`${type}BtnText`);
                const btnLoading = document.getElementById(`${type}BtnLoading`);

                if (btnText && btnLoading) {
                    if (isLoading) {
                        btnText.style.display = 'none';
                        btnLoading.style.display = 'inline-block';
                    } else {
                        btnText.style.display = 'inline';
                        btnLoading.style.display = 'none';
                    }
                }
            }
        }


        // Initialize Reports Manager when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            window.reportsManager = new ReportsManager();
        });

        // ============== HOD AI VOICE ASSISTANT ============== //
        // Global state for assistant
        const hodAssistant = {
            recognition: null,
            isListening: false,
            isSpeaking: false,
            transcript: '',
            voices: []
        };

        function initHODAssistant() {
            // Initialize speech recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.error('Speech Recognition not supported');
                return;
            }

            hodAssistant.recognition = new SpeechRecognition();
            hodAssistant.recognition.lang = 'en-US';
            hodAssistant.recognition.continuous = true;
            hodAssistant.recognition.interimResults = true;
            hodAssistant.recognition.maxAlternatives = 1;

            // Load voices
            window.speechSynthesis.onvoiceschanged = () => {
                hodAssistant.voices = window.speechSynthesis.getVoices();
            };

            // Recognition start
            hodAssistant.recognition.onstart = () => {
                hodAssistant.isListening = true;
                hodAssistant.transcript = '';
                updateAssistantUI();
                console.log('🎤 Listening...');
            };

            // Recognition result - show interim results
            hodAssistant.recognition.onresult = (event) => {
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        hodAssistant.transcript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Show what's being typed
                const statusText = document.getElementById('assistantStatusText');
                if (statusText) {
                    statusText.textContent = hodAssistant.transcript + interimTranscript;
                }
            };

            // Recognition end
            hodAssistant.recognition.onend = () => {
                hodAssistant.isListening = false;
                updateAssistantUI();
                console.log('✅ Stopped listening');
            };

            hodAssistant.recognition.onerror = (event) => {
                console.error('Speech error:', event.error);
                hodAssistant.isListening = false;
                updateAssistantUI();
            };
        }

        function toggleAssistantMic() {
            if (!hodAssistant.recognition) {
                initHODAssistant();
            }

            if (!hodAssistant.isListening) {
                // START listening
                hodAssistant.transcript = '';
                const btn = document.getElementById('assistantMicBtn');
                btn.classList.add('active');

                try {
                    hodAssistant.recognition.start();
                    console.log('🎤 Started listening...');
                } catch (e) {
                    console.log('Already started');
                }
            } else {
                // STOP listening and process
                const btn = document.getElementById('assistantMicBtn');
                btn.classList.remove('active');

                try {
                    hodAssistant.recognition.stop();
                    console.log('🛑 Stopped listening');
                } catch (e) {
                    console.log('Already stopped');
                }

                // Process the transcript
                if (hodAssistant.transcript.trim().length > 0) {
                    setTimeout(() => {
                        processHODCommand(hodAssistant.transcript.trim());
                    }, 500);
                }
            }
        }

        function startCommandListening() {
            if (!hodAssistant.recognition || hodAssistant.isSpeaking) return;
            try {
                hodAssistant.recognition.lang = 'en-US';
                hodAssistant.recognition.start();
                console.log('🎤 Listening for command...');
            } catch (e) {
                console.log('Already running');
            }
        }

        async function processHODCommand(command) {
            hodAssistant.isSpeaking = true;
            updateAssistantUI();

            try {
                // Stop listening
                try { hodAssistant.recognition.stop(); } catch (e) { }

                // Send to backend for AI analysis
                const token = localStorage.getItem('access_token');

                // Debug: Check if token exists
                if (!token) {
                    console.error('❌ ERROR: No access token found in localStorage!');
                    const errorMsg = 'You need to login first to use the AI Assistant.';
                    addAssistantMessage(errorMsg, 'ai');
                    await speakResponse(errorMsg);
                    return;
                }

                console.log('📤 Sending HOD AI command with token:', token.substring(0, 20) + '...');

                const response = await fetch('http://localhost:8000/api/hod/ai-command', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ command: command })
                });

                if (response.ok) {
                    const data = await response.json();

                    console.log('📥 Raw API Response:', data);

                    // Use the helper function to cleanly extract speech text
                    const aiResponse = extractSpeechText(data);

                    console.log('🔊 Final speech output:', aiResponse);

                    addAssistantMessage(aiResponse, 'ai');
                    await speakResponse(aiResponse);

                    // Execute any dashboard actions if needed
                    if (data.action && data.action !== 'none') {
                        executeDashboardAction(data.action);
                    }
                } else {
                    // Get error details from response
                    let errorDetails = '';
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || response.statusText;
                    } catch {
                        errorDetails = response.statusText;
                    }

                    console.error(`❌ AI Command Error (${response.status}):`, errorDetails);

                    // Show appropriate error message
                    if (response.status === 401) {
                        const errorMsg = 'Authentication failed. Please login again.';
                        addAssistantMessage(errorMsg, 'ai');
                        await speakResponse(errorMsg);
                    } else if (response.status === 403) {
                        const errorMsg = 'You do not have permission to use this feature.';
                        addAssistantMessage(errorMsg, 'ai');
                        await speakResponse(errorMsg);
                    } else {
                        const errorMsg = 'I\'m having trouble processing that. Could you rephrase?';
                        addAssistantMessage(errorMsg, 'ai');
                        await speakResponse(errorMsg);
                    }
                }
            } catch (error) {
                console.error('❌ Command processing error:', error);
                const errorMsg = 'There was an error processing your request.';
                addAssistantMessage(errorMsg, 'ai');
                await speakResponse(errorMsg);
            }

            hodAssistant.isSpeaking = false;
            updateAssistantUI();
        }

        function executeDashboardAction(action) {
            console.log('Executing action:', action);
            if (action === 'show-dashboard') {
                navigateTo('dashboard');
            } else if (action === 'show-approvals') {
                navigateTo('approvals');
            } else if (action === 'show-reports') {
                navigateTo('reports');
            } else if (action === 'show-analytics') {
                navigateTo('analytics');
            }
        }

        function addAssistantMessage(text, sender) {
            const messagesDiv = document.getElementById('assistantMessages');
            const messageEl = document.createElement('div');
            messageEl.className = `assistant-message ${sender}`;
            messageEl.innerHTML = `<div>${text}</div>`;
            messagesDiv.appendChild(messageEl);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function toggleAssistant() {
            const modal = document.getElementById('voiceAssistantModal');
            const btn = document.getElementById('voiceAssistantBtn');

            if (modal.classList.contains('active')) {
                closeAssistant();
            } else {
                modal.classList.add('active');
                btn.classList.remove('listening');

                // Request microphone permission
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                        if (!hodAssistant.recognition) {
                            initHODAssistant();
                        }
                        addAssistantMessage('🎤 Click the microphone button to start recording', 'system');
                    })
                    .catch(() => {
                        addAssistantMessage('❌ Microphone access denied', 'system');
                    });
            }
        }

        function closeAssistant() {
            const modal = document.getElementById('voiceAssistantModal');
            const btn = document.getElementById('voiceAssistantBtn');
            modal.classList.remove('active');
            btn.classList.remove('listening');
            try { hodAssistant.recognition.stop(); } catch (e) { }
        }

        function clearAssistantChat() {
            document.getElementById('assistantMessages').innerHTML = '';
            addAssistantMessage('Chat cleared. Click mic to start!', 'system');
        }

        function minimizeAssistant() {
            document.getElementById('voiceAssistantModal').style.display = 'none';
        }

        // Helper function to extract ONLY the speech text from AI response
        function extractSpeechText(apiResponse) {
            try {
                let parsedData = apiResponse;

                // If response is a string (might be double-encoded JSON), parse it
                if (typeof parsedData === 'string') {
                    console.log('📋 Raw response string:', parsedData.substring(0, 100));

                    // Try to parse if it looks like JSON
                    if (parsedData.trim().startsWith('{')) {
                        try {
                            parsedData = JSON.parse(parsedData);
                            console.log('✅ Parsed JSON from string');
                        } catch (e) {
                            console.warn('⚠️ Could not parse JSON string, returning as-is');
                            return parsedData;
                        }
                    }
                }

                // Now extract the response field
                if (typeof parsedData === 'object' && parsedData.response) {
                    const speechText = parsedData.response.trim();
                    console.log('🎤 Extracted speech text:', speechText);
                    return speechText;
                }

                // If no response field, return the data as string
                console.warn('⚠️ No response field found in:', parsedData);
                return String(parsedData).trim();

            } catch (error) {
                console.error('❌ Error extracting speech text:', error);
                return 'I understand. Let me help with that.';
            }
        }

        async function speakResponse(text) {
            return new Promise((resolve) => {
                // Ensure we're only speaking plain text, no JSON
                const cleanText = String(text).trim();

                console.log('🔊 Speaking text:', cleanText);

                if (!cleanText) {
                    console.warn('⚠️ No text to speak');
                    resolve();
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.rate = 1;
                utterance.pitch = 1;
                utterance.volume = 1;

                utterance.onend = () => {
                    console.log('✅ Speech finished');
                    resolve();
                };

                utterance.onerror = (event) => {
                    console.error('❌ Speech error:', event.error);
                    resolve();
                };

                window.speechSynthesis.speak(utterance);
            });
        }

        function updateAssistantUI() {
            const status = document.getElementById('assistantStatus');
            const statusText = document.getElementById('assistantStatusText');
            const wave = document.getElementById('assistantWave');
            const btn = document.getElementById('assistantMicBtn');

            if (hodAssistant.isListening) {
                status.className = 'status-indicator listening';
                statusText.textContent = 'Listening...';
                wave.style.display = 'flex';
                btn.classList.add('active');
            } else if (hodAssistant.isSpeaking) {
                status.className = 'status-indicator thinking';
                statusText.textContent = 'Processing...';
                wave.style.display = 'flex';
            } else {
                status.className = 'status-indicator idle';
                statusText.textContent = 'Ready to listen';
                wave.style.display = 'none';
                btn.classList.remove('active');
            }
        }

        function sendAssistantCommand(command) {
            addAssistantMessage(command, 'user');
            processHODCommand(command);
        }

        // Initialize assistant on page load
        document.addEventListener('DOMContentLoaded', () => {
            initHODAssistant();
        });

        // Update the DOMContentLoaded event at the bottom of your script
        document.addEventListener('DOMContentLoaded', () => {
            app = new HODDashboard();

            // Add CSS animations for notifications
            const style = document.createElement('style');
            style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
            document.head.appendChild(style);

            // Initialize managers
            window.curriculumManager = null;
            window.syllabusManager = new SyllabusManager();
            window.resourcesManager = null;
            window.analyticsManager = null;
            window.settingsManager = null;
            window.reportsManager = null;

            // Make app available globally for button click handlers
            window.app = app;
        });
    


        // HOD theme management
        function applyHodTheme(theme) {
            if (!theme) return;
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            const cbs = document.querySelectorAll('.theme-checkbox');
            cbs.forEach(cb => { cb.checked = (theme === 'dark'); });
        }

        // Apply on load immediately
        (function() {
            const saved = localStorage.getItem('hod_theme') || 'light';
            applyHodTheme(saved);
        })();

        // Setup toggle when DOM ready
        document.addEventListener('DOMContentLoaded', function() {
            const toggle = document.getElementById('hod-theme-checkbox');
            if (toggle) {
                const current = localStorage.getItem('hod_theme') || 'light';
                toggle.checked = (current === 'dark');

                toggle.addEventListener('change', function(e) {
                    const newTheme = e.target.checked ? 'dark' : 'light';
                    localStorage.setItem('hod_theme', newTheme);
                    applyHodTheme(newTheme);
                });
            }

            // Cross-tab sync
            window.addEventListener('storage', function(e) {
                if (e.key === 'hod_theme') {
                    applyHodTheme(e.newValue || 'light');
                }
            });
        });

        function useHodSystemTheme() {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const newTheme = prefersDark ? 'dark' : 'light';
            localStorage.setItem('hod_theme', newTheme);
            applyHodTheme(newTheme);
            alert('Theme set to ' + (prefersDark ? 'Dark' : 'Light') + ' based on system preference!');
        }
    
            } catch (e) {
                console.error(e);
            }
        }
    