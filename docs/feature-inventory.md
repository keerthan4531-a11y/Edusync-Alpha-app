# Feature Inventory

## Router: admin/challenges

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/admin/challenges/create` | `POST` | Create a new challenge | `challenges_collection` | Yes | - | Not Started |
| `/api/admin/challenges` | `GET` | Get all challenges for admin (including inactive) | `challenges_collection` | Yes | - | Not Started |
| `/api/admin/challenges/{challenge_id}` | `DELETE` | Delete a challenge (admin only) | `challenges_collection` | Yes | - | Not Started |

## Router: admin/communication

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/tasks` | `POST` | Admin: Create a new communication task | `communication_tasks_collection` | No | - | Not Started |
| `/tasks` | `GET` | Admin: Fetch communication tasks by skill | `communication_tasks_collection` | No | - | Not Started |
| `/tasks/{task_id}` | `PUT` | Admin: Update communication task | `communication_tasks_collection` | No | - | Not Started |
| `/tasks/{task_id}` | `DELETE` | Admin: Delete communication task | `communication_tasks_collection` | No | - | Not Started |

## Router: admin/stage1

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/admin/stage1/sentences` | `GET` | Admin: Get all voice/read challenge sentences | `voice_challenge_sentences_collection, writing_challenges_collection` | Yes | - | Not Started |
| `/api/admin/stage1/sentences/{sentence_id}` | `DELETE` | Admin: Delete a voice challenge sentence | `voice_challenge_sentences_collection, writing_challenges_collection` | Yes | - | Not Started |
| `/api/admin/stage1/writing-challenges` | `GET` | Admin: Get all writing challenges | `voice_challenge_sentences_collection, writing_challenges_collection` | Yes | - | Not Started |
| `/api/admin/stage1/writing-challenges/{challenge_id}` | `DELETE` | Admin: Delete a writing challenge | `voice_challenge_sentences_collection, writing_challenges_collection` | Yes | - | Not Started |
| `/api/admin/stage1/sentences` | `POST` | Admin: Add a new voice/read challenge sentence | `voice_challenge_sentences_collection, writing_challenges_collection` | Yes | - | Not Started |
| `/api/admin/stage1/writing-challenges` | `POST` | Admin: Add a new writing challenge | `voice_challenge_sentences_collection, writing_challenges_collection` | Yes | - | Not Started |

## Router: admin/stats

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/stats` | `GET` | Get admin statistics | `users_collection, challenges_collection, submissions_collection, groups_collection, projects_collection, code_repositories_collection` | No | - | Not Started |
| `/transactions` | `GET` | Get credit transactions | `users_collection, challenges_collection, submissions_collection, groups_collection, projects_collection, code_repositories_collection` | No | - | Not Started |

## Router: admin/users

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/admin/users` | `GET` | Get all users for admin management | `users_collection, communication_tasks_collection` | Yes | - | Not Started |
| `/api/admin/users/create` | `POST` | Admin create user account | `users_collection, communication_tasks_collection` | Yes | - | Not Started |
| `/api/admin/users/{user_id}` | `DELETE` | Admin delete user | `users_collection, communication_tasks_collection` | Yes | - | Not Started |
| `/api/admin/users/{user_id}/deactivate` | `POST` | Deactivate user account | `users_collection, communication_tasks_collection` | Yes | - | Not Started |
| `/api/admin/users/{user_id}/activate` | `POST` | Reactivate user account | `users_collection, communication_tasks_collection` | Yes | - | Not Started |
| `/api/admin/credits/adjust` | `POST` | Admin adjust user credits | `users_collection, communication_tasks_collection` | Yes | - | Not Started |
| `/api/admin/quiz-questions` | `POST` | Admin: Create a new quiz question (Meaning or Fill-in-Blank) | `users_collection, communication_tasks_collection` | Yes | - | Not Started |

## Router: ai

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/public-assistant` | `POST` | Public AI Chatbot for Landing Page - No authentication required | `ai_chats_collection, users_collection` | Yes | - | Not Started |
| `/chat` | `POST` | AI Chat endpoint - Provides intelligent responses to user queries | `ai_chats_collection, users_collection` | Yes | - | Not Started |
| `/chats` | `GET` | Get AI chat history | `ai_chats_collection, users_collection` | Yes | - | Not Started |
| `/chat-stream` | `POST` | Streaming AI Chat via Server-Sent Events | `ai_chats_collection, users_collection` | Yes | - | Not Started |
| `/faculty-assistant` | `POST` | Faculty-specific AI assistant with voice response | `ai_chats_collection, users_collection` | Yes | - | Not Started |
| `/english-teacher` | `POST` | English tutor feedback | `ai_chats_collection, users_collection` | Yes | - | Not Started |
| `/code-help` | `POST` | Coding help | `ai_chats_collection, users_collection` | Yes | - | Not Started |
| `/code-review` | `POST` | Code review | `ai_chats_collection, users_collection` | Yes | - | Not Started |
| `/project-ideas` | `GET` | Generate project ideas | `ai_chats_collection, users_collection` | Yes | - | Not Started |

## Router: ai_grading

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/ai/grade-submission` | `POST` | AI grading for submissions | `None` | Yes | - | Not Started |
| `/api/ai/bulk-grade` | `POST` | Bulk AI grading | `None` | Yes | - | Not Started |
| `/api/ai/check-plagiarism` | `POST` | Check plagiarism | `None` | Yes | - | Not Started |
| `/api/ai/generate-feedback` | `POST` | Generate AI feedback | `None` | Yes | - | Not Started |
| `/api/ai/analyze-patterns` | `POST` | Analyze grading patterns | `None` | Yes | - | Not Started |

## Router: announcements

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/announcements` | `GET` | Get announcements | `announcements_collection` | Yes | - | Not Started |

## Router: auth

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/auth/register` | `POST` | Register a new user | `users_collection, badges_collection, analytics_collection` | Yes | - | Not Started |
| `/api/auth/login` | `POST` | User login with device tracking | `users_collection, badges_collection, analytics_collection` | Yes | - | Not Started |
| `/api/auth/refresh` | `POST` | Refresh access token using refresh token | `users_collection, badges_collection, analytics_collection` | Yes | - | Not Started |
| `/api/auth/logout` | `POST` | Logout user and invalidate tokens | `users_collection, badges_collection, analytics_collection` | Yes | - | Not Started |

## Router: badges

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/badges` | `GET` | Get user badges | `badges_collection` | Yes | - | Not Started |

## Router: career/alumni

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/alumni/network` | `GET` | Get alumni network for mentorship | `users_collection` | Yes | - | Not Started |
| `/api/alumni/connect` | `POST` | Connect with alumni for mentorship | `users_collection` | Yes | - | Not Started |

## Router: career/applications

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/applications` | `GET` | Get user's job applications | `None` | Yes | - | Not Started |

## Router: career/interviews

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/interviews/stats` | `GET` | Get user's interview statistics | `interviews_collection` | Yes | - | Not Started |
| `/api/interviews/questions` | `GET` | Get interview questions for practice | `interviews_collection` | Yes | - | Not Started |
| `/api/interviews/analyze` | `POST` | Analyze interview answer using AI | `interviews_collection` | Yes | - | Not Started |
| `/api/interviews/complete` | `POST` | Complete an interview session and get final feedback | `interviews_collection` | Yes | - | Not Started |
| `/api/interviews/session/start` | `POST` | You are an expert technical interviewer.             Question: "{current_question}"            ... | `interviews_collection` | Yes | - | Not Started |

## Router: career/jobs

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/jobs/matches` | `GET` | Get job matches based on user's real skills from database | `users_collection, resume_collection, jobs_collection, projects_collection` | No | - | Not Started |
| `/jobs/featured` | `GET` | Get featured job listings from database | `users_collection, resume_collection, jobs_collection, projects_collection` | No | - | Not Started |
| `/jobs/apply` | `POST` | Apply for a job | `users_collection, resume_collection, jobs_collection, projects_collection` | No | - | Not Started |

## Router: career/linkedin

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/checklist` | `GET` | Get LinkedIn profile checklist | `users_collection, jobs_collection` | No | - | Not Started |
| `/analyze` | `GET` | Analyze LinkedIn profile based on EduSync user data | `users_collection, jobs_collection` | No | - | Not Started |
| `/jobs` | `GET` | Search LinkedIn jobs with local database fallback | `users_collection, jobs_collection` | No | - | Not Started |

## Router: career/portfolio

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/portfolio/data` | `GET` | Get user's portfolio data | `projects_collection, resume_collection, badges_collection, certificates_collection, users_collection` | Yes | - | Not Started |
| `/api/portfolio/generate` | `POST` | Generate portfolio website for user | `projects_collection, resume_collection, badges_collection, certificates_collection, users_collection` | Yes | - | Not Started |
| `/api/portfolio/customize` | `POST` | Customize portfolio appearance | `projects_collection, resume_collection, badges_collection, certificates_collection, users_collection` | Yes | - | Not Started |

## Router: career/progress

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/career/progress` | `GET` | Get user's career readiness progress | `resume_collection, interviews_collection` | Yes | - | Not Started |

## Router: career/resume

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/resume/generate` | `POST` | No description | `resume_collection` | Yes | - | Not Started |
| `/api/resume/me` | `GET` | No description | `resume_collection` | Yes | - | Not Started |
| `/api/resume/save` | `POST` | No description | `resume_collection` | Yes | - | Not Started |

## Router: challenges

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/{challenge_id}` | `GET` | Get detailed challenge info | `challenges_collection, submissions_collection, users_collection` | Yes | - | Not Started |
| `/{challenge_id}/submit` | `POST` | Submit a challenge solution | `challenges_collection, submissions_collection, users_collection` | Yes | - | Not Started |

## Router: classrooms

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/classroom/add-students` | `POST` | Directly add students to classroom (no pending approval needed) | `classrooms_collection, users_collection` | Yes | - | Not Started |
| `/api/classrooms` | `GET` | Get classrooms | `classrooms_collection, users_collection` | Yes | - | Not Started |

## Router: compiler

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/execute` | `POST` | Execute code in a safe sandbox environment | `online_compiler_collection` | No | - | Not Started |
| `/history` | `GET` | Get user's code execution history | `online_compiler_collection` | No | - | Not Started |

## Router: credits

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/credits/award` | `POST` | Award credits for completing tasks - supports both legacy and new formats | `credit_transactions_collection, users_collection` | Yes | - | Not Started |
| `/api/credits/summary` | `GET` | Get user's credit summary | `credit_transactions_collection, users_collection` | Yes | - | Not Started |
| `/api/credits/transactions` | `GET` | Get user's credit transactions | `credit_transactions_collection, users_collection` | Yes | - | Not Started |
| `/api/credits/transfer` | `POST` | Transfer credits to another user | `credit_transactions_collection, users_collection` | Yes | - | Not Started |
| `/api/credits/spend` | `POST` | Spend credits on items | `credit_transactions_collection, users_collection` | Yes | - | Not Started |

## Router: daily_quiz

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/quiz-questions` | `GET` | Fetch quiz questions (Meaning or Fill-in-Blank) | `communication_tasks_collection, users_collection` | Yes | - | Not Started |
| `/api/daily-quiz-challenge` | `GET` | Get daily quiz challenge - 5 meaning + 5 fill-in-blanks (changes daily) | `communication_tasks_collection, users_collection` | Yes | - | Not Started |
| `/api/daily-challenge/record-completion` | `POST` | Record daily challenge completion in database | `communication_tasks_collection, users_collection` | Yes | - | Not Started |
| `/api/daily-challenge/status` | `GET` | Get today's daily challenge completion status | `communication_tasks_collection, users_collection` | Yes | - | Not Started |

## Router: docs

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/docs/generate` | `POST` | Generate documentation for code | `technical_docs_collection` | Yes | - | Not Started |

## Router: faculty/ai_assistant

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/ai-command` | `POST` | Process natural language commands from Faculty AI assistant with classroom management | `classrooms_collection` | Yes | - | Not Started |

## Router: faculty/announcements

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/classrooms/{classroom_id}/announcements` | `GET` | Get all announcements for a classroom | `faculty_classrooms_collection, announcements_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/announcements/{announcement_id}` | `DELETE` | Delete an announcement | `faculty_classrooms_collection, announcements_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/announcements` | `POST` | Faculty posts an announcement to a classroom | `faculty_classrooms_collection, announcements_collection` | Yes | - | Not Started |

## Router: faculty/assignments

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/classrooms/{classroom_id}/assignments` | `GET` | Get all assignments for a classroom (faculty view) | `faculty_classrooms_collection, assignment_collection, faculty_submissions_collection, users_collection, faculty_assignments_collection, files_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/assignments/{assignment_id}` | `DELETE` | Delete an assignment (and all related submissions/grades) | `faculty_classrooms_collection, assignment_collection, faculty_submissions_collection, users_collection, faculty_assignments_collection, files_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/assignments/{assignment_id}/submissions` | `GET` | Get all submissions for an assignment in a classroom | `faculty_classrooms_collection, assignment_collection, faculty_submissions_collection, users_collection, faculty_assignments_collection, files_collection` | Yes | - | Not Started |
| `/api/faculty/assignments/{assignment_id}/submissions` | `GET` | Get all submissions for an assignment | `faculty_classrooms_collection, assignment_collection, faculty_submissions_collection, users_collection, faculty_assignments_collection, files_collection` | Yes | - | Not Started |
| `/api/faculty/submissions/{submission_id}/grade` | `POST` | Faculty grades a student submission | `faculty_classrooms_collection, assignment_collection, faculty_submissions_collection, users_collection, faculty_assignments_collection, files_collection` | Yes | - | Not Started |
| `/api/faculty/assignments` | `GET` | Get faculty assignments | `faculty_classrooms_collection, assignment_collection, faculty_submissions_collection, users_collection, faculty_assignments_collection, files_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/assignments` | `POST` | Faculty creates an assignment for a classroom | `faculty_classrooms_collection, assignment_collection, faculty_submissions_collection, users_collection, faculty_assignments_collection, files_collection` | Yes | - | Not Started |
| `/api/faculty/assignments` | `POST` | Create a new assignment | `faculty_classrooms_collection, assignment_collection, faculty_submissions_collection, users_collection, faculty_assignments_collection, files_collection` | Yes | - | Not Started |

## Router: faculty/attendance

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/attendance` | `GET` | Get attendance records | `faculty_attendance_collection, faculty_classrooms_collection` | Yes | - | Not Started |
| `/api/faculty/attendance` | `POST` | Mark attendance for a classroom | `faculty_attendance_collection, faculty_classrooms_collection` | Yes | - | Not Started |

## Router: faculty/classrooms

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/classrooms` | `GET` | Get faculty classrooms | `faculty_classrooms_collection, faculty_assignments_collection, users_collection, classrooms_collection, classroom_exists_in_student_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}` | `DELETE` | Delete a classroom | `faculty_classrooms_collection, faculty_assignments_collection, users_collection, classrooms_collection, classroom_exists_in_student_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/add-students` | `POST` | Directly add multiple students to classroom (no approval needed - like WhatsApp groups) | `faculty_classrooms_collection, faculty_assignments_collection, users_collection, classrooms_collection, classroom_exists_in_student_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms` | `POST` | Create a new classroom | `faculty_classrooms_collection, faculty_assignments_collection, users_collection, classrooms_collection, classroom_exists_in_student_collection` | Yes | - | Not Started |

## Router: faculty/communities

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/communities` | `GET` | Get faculty communities | `faculty_communities_collection, faculty_classrooms_collection` | Yes | - | Not Started |
| `/api/faculty/communities` | `POST` | Create a new community | `faculty_communities_collection, faculty_classrooms_collection` | Yes | - | Not Started |

## Router: faculty/materials

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/classrooms/{classroom_id}/materials` | `POST` | Add a material/resource to classroom with topic, scheduling, and visibility options | `faculty_classrooms_collection, classrooms_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/materials/{material_id}` | `DELETE` | Delete a material/resource from classroom | `faculty_classrooms_collection, classrooms_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/materials` | `GET` | Get all materials/resources for a classroom | `faculty_classrooms_collection, classrooms_collection` | Yes | - | Not Started |

## Router: faculty/profile

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/send-classroom-invitations` | `POST` | Send classroom invitations to students (creates pending requests) | `classrooms_collection, users_collection, classroom_requests_collection, assignment_collection, submissions_collection` | Yes | - | Not Started |
| `/api/faculty/profile` | `PUT` | Update faculty profile | `classrooms_collection, users_collection, classroom_requests_collection, assignment_collection, submissions_collection` | Yes | - | Not Started |
| `/api/faculty/dashboard-stats` | `GET` | Get faculty dashboard statistics | `classrooms_collection, users_collection, classroom_requests_collection, assignment_collection, submissions_collection` | Yes | - | Not Started |
| `/api/faculty/profile` | `GET` | Get faculty profile | `classrooms_collection, users_collection, classroom_requests_collection, assignment_collection, submissions_collection` | Yes | - | Not Started |

## Router: faculty/schedule

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/schedule` | `GET` | Get faculty schedule | `faculty_schedule_collection, faculty_classrooms_collection` | Yes | - | Not Started |
| `/api/faculty/schedule` | `POST` | Create a new schedule entry | `faculty_schedule_collection, faculty_classrooms_collection` | Yes | - | Not Started |

## Router: faculty/students

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/faculty/classrooms/{classroom_id}/students` | `POST` | Add a student to a classroom | `faculty_classrooms_collection, users_collection, faculty_students_collection, faculty_submissions_collection` | Yes | - | Not Started |
| `/api/faculty/classrooms/{classroom_id}/students/{student_id}` | `DELETE` | Remove a student from a classroom | `faculty_classrooms_collection, users_collection, faculty_students_collection, faculty_submissions_collection` | Yes | - | Not Started |
| `/api/faculty/students` | `GET` | Get faculty students | `faculty_classrooms_collection, users_collection, faculty_students_collection, faculty_submissions_collection` | Yes | - | Not Started |
| `/api/faculty/students` | `POST` | Add a new student | `faculty_classrooms_collection, users_collection, faculty_students_collection, faculty_submissions_collection` | Yes | - | Not Started |

## Router: files

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/{file_id}/view` | `GET` | View file details and access metadata | `files_collection` | No | - | Not Started |
| `/{file_id}/content` | `GET` | Read file content from storage | `files_collection` | No | - | Not Started |

## Router: forum

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/forum/posts` | `GET` | Get forum posts with filters | `forum_posts_collection` | Yes | - | Not Started |

## Router: frontend

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/favicon.ico` | `GET` | Return a simple favicon | `None` | Yes | - | Not Started |
| `/` | `GET` | Serve landing page at root | `None` | Yes | - | Not Started |
| `/login` | `GET` | Serve login page | `None` | Yes | - | Not Started |
| `/dashboard` | `GET` | Serve student dashboard | `None` | Yes | - | Not Started |
| `/faculty-dashboard` | `GET` | Serve faculty dashboard | `None` | Yes | - | Not Started |
| `/hod-dashboard` | `GET` | Serve HOD dashboard | `None` | Yes | - | Not Started |
| `/profile` | `GET` | Serve profile page | `None` | Yes | - | Not Started |
| `/challenges` | `GET` | Serve challenges page | `None` | Yes | - | Not Started |
| `/career-prep` | `GET` | Serve career prep page | `None` | Yes | - | Not Started |
| `/learning-path` | `GET` | Serve learning path page | `None` | Yes | - | Not Started |
| `/stage/2` | `GET` | Serve stage 2 page | `None` | Yes | - | Not Started |
| `/stage/3` | `GET` | Serve stage 3 page | `None` | Yes | - | Not Started |
| `/communication` | `GET` | Serve communication stage page | `None` | Yes | - | Not Started |
| `/static/{file_path:path}` | `GET` | Serve static files | `None` | Yes | - | Not Started |
| `/{path:path}` | `GET` | Serve HTML files - Catch-all route | `None` | Yes | - | Not Started |

## Router: groups

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/create` | `POST` | Create a new study group/team | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/discover` | `GET` | Find public groups that the user is not a member of | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/{group_id}` | `GET` | Get group details including member information | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/{group_id}/join` | `POST` | Join a study group (public only) | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/{group_id}/request` | `POST` | Request to join a private group | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/{group_id}/requests` | `GET` | Get pending join requests (Admins only) | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/{group_id}/requests/{request_id}/action` | `POST` | Approve or reject a join request | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/{group_id}/messages` | `GET` | Get group messages | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/{group_id}/send-message` | `POST` | Send a message to the group | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |
| `/{group_id}/files` | `POST` | Upload file to group | `groups_collection, users_collection, group_requests_collection` | No | - | Not Started |

## Router: health

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/health` | `GET` | Health check endpoint | `None` | Yes | - | Not Started |

## Router: hod/ai_assistant

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/ai-command` | `POST` | Process natural language commands from HOD AI assistant with full dashboard access | `hod_approvals_collection` | Yes | - | Not Started |
| `/api/hod/ai/status` | `GET` | Check HOD AI Assistant configuration status | `hod_approvals_collection` | Yes | - | Not Started |
| `/api/hod/ai/configure-api-keys` | `POST` | Configure HOD AI Assistant API keys (only for HOD users) | `hod_approvals_collection` | Yes | - | Not Started |
| `/api/hod/ai/gemini-api-keys` | `GET` | Get available Gemini API key types for HOD assistant | `hod_approvals_collection` | Yes | - | Not Started |

## Router: hod/analytics

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/analytics` | `POST` | Get detailed department analytics | `users_collection` | Yes | - | Not Started |

## Router: hod/approvals

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/statistics` | `GET` | Get approval statistics for HOD | `approvals_collection` | No | - | Not Started |
| `/pending` | `GET` | Specific endpoint for pending approvals | `approvals_collection` | No | - | Not Started |
| `/{approval_id}` | `GET` | Get detailed approval info | `approvals_collection` | No | - | Not Started |
| `/{approval_id}/action` | `POST` | Approve or reject a request | `approvals_collection` | No | - | Not Started |

## Router: hod/curriculum

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/courses` | `GET` | Get all courses for the department | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/courses/{course_id}/syllabus` | `POST` | Add syllabus topic to a course | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/courses/assign-faculty` | `POST` | Assign faculty to a course | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/curriculum/stats` | `GET` | Get curriculum statistics for the department | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/curriculum` | `GET` | Get department curriculum | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/curriculum/upload-syllabus-pdf` | `POST` | Upload and process university syllabus PDF | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/curriculum/{course_id}/syllabus` | `DELETE` | Delete syllabus for a course | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/curriculum/manual-syllabus-unit` | `POST` | Manually add a syllabus unit | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/courses` | `POST` | Create a new course | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |
| `/api/hod/curriculum/{course_id}/syllabus` | `GET` | Get syllabus for a course | `courses_collection, faculty_assignments_collection, users_collection, classrooms_collection, syllabus_collection` | Yes | - | Not Started |

## Router: hod/dashboard

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/academic-calendar` | `GET` | Add entry to academic calendar | `users_collection, notifications_collection, events_collection` | Yes | - | Not Started |
| `/api/hod/dashboard` | `GET` | Get HOD dashboard data | `users_collection, notifications_collection, events_collection` | Yes | - | Not Started |
| `/api/hod/management-options` | `GET` | Get all management options and their data for HOD | `users_collection, notifications_collection, events_collection` | Yes | - | Not Started |

## Router: hod/faculty

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/faculty` | `POST` | Add new faculty (HOD only) | `users_collection` | Yes | - | Not Started |
| `/api/hod/faculty/{faculty_id}` | `GET` | Get detailed faculty information | `users_collection` | Yes | - | Not Started |
| `/api/hod/faculty` | `GET` | Get faculty list for HOD | `users_collection` | Yes | - | Not Started |

## Router: hod/maintenance

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/maintenance` | `POST` | Create a new maintenance record | `resources_collection, maintenance_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/maintenance/{maintenance_id}/complete` | `POST` | Mark maintenance as completed | `resources_collection, maintenance_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resource-maintenance` | `GET` | Get resource maintenance records (frontend compatible endpoint) | `resources_collection, maintenance_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resource-maintenance/stats` | `GET` | Get maintenance statistics for dashboard | `resources_collection, maintenance_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/maintenance` | `GET` | Get maintenance records | `resources_collection, maintenance_collection, resource_history_collection, users_collection` | Yes | - | Not Started |

## Router: hod/reports

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/stats` | `GET` | Get report statistics for HOD dashboard | `reports_collection` | No | - | Not Started |
| `/generate` | `POST` | Generate a new department report | `reports_collection` | No | - | Not Started |
| `/{report_id}/download` | `GET` | Download report file | `reports_collection` | No | - | Not Started |

## Router: hod/resources

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/resources/stats` | `GET` | Get comprehensive resource statistics for HOD dashboard | `resources_collection, maintenance_collection, resource_requests_collection, software_licenses_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resources` | `POST` | Create a new resource | `resources_collection, maintenance_collection, resource_requests_collection, software_licenses_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resources/{resource_id}` | `DELETE` | Delete a resource (soft delete) | `resources_collection, maintenance_collection, resource_requests_collection, software_licenses_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resources/{resource_id}/assign` | `POST` | Assign a resource to a user | `resources_collection, maintenance_collection, resource_requests_collection, software_licenses_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resources/{resource_id}/return` | `POST` | Return a resource that was in use | `resources_collection, maintenance_collection, resource_requests_collection, software_licenses_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resources` | `GET` | Get resources with filtering and pagination | `resources_collection, maintenance_collection, resource_requests_collection, software_licenses_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resources/{resource_id}` | `GET` | Get detailed information about a specific resource | `resources_collection, maintenance_collection, resource_requests_collection, software_licenses_collection, resource_history_collection, users_collection` | Yes | - | Not Started |
| `/api/hod/resources/{resource_id}` | `PUT` | Update resource information | `resources_collection, maintenance_collection, resource_requests_collection, software_licenses_collection, resource_history_collection, users_collection` | Yes | - | Not Started |

## Router: hod/resource_requests

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/resource-requests` | `POST` | Create a new resource request | `users_collection, resource_requests_collection, approvals_collection, resources_collection, resource_history_collection` | Yes | - | Not Started |
| `/api/hod/resource-requests/stats` | `GET` | Get resource requests statistics | `users_collection, resource_requests_collection, approvals_collection, resources_collection, resource_history_collection` | Yes | - | Not Started |
| `/api/hod/resource-requests/{request_id}` | `GET` | Get detailed resource request information | `users_collection, resource_requests_collection, approvals_collection, resources_collection, resource_history_collection` | Yes | - | Not Started |
| `/api/hod/resource-requests/{request_id}/approve` | `POST` | Approve a resource request | `users_collection, resource_requests_collection, approvals_collection, resources_collection, resource_history_collection` | Yes | - | Not Started |
| `/api/hod/resource-requests/{request_id}/reject` | `POST` | Reject a resource request | `users_collection, resource_requests_collection, approvals_collection, resources_collection, resource_history_collection` | Yes | - | Not Started |
| `/api/hod/resource-requests/{request_id}/complete` | `POST` | Mark resource request as completed | `users_collection, resource_requests_collection, approvals_collection, resources_collection, resource_history_collection` | Yes | - | Not Started |
| `/api/hod/resource-requests/{request_id}/comment` | `POST` | Add comment to resource request | `users_collection, resource_requests_collection, approvals_collection, resources_collection, resource_history_collection` | Yes | - | Not Started |
| `/api/hod/resource-requests` | `GET` | Get resource requests with filtering | `users_collection, resource_requests_collection, approvals_collection, resources_collection, resource_history_collection` | Yes | - | Not Started |

## Router: hod/software_licenses

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/hod/software-licenses` | `POST` | Create a new software license | `software_licenses_collection` | Yes | - | Not Started |
| `/api/hod/software-licenses/stats` | `GET` | Get software licenses dashboard statistics | `software_licenses_collection` | Yes | - | Not Started |
| `/api/hod/software-licenses/{license_id}` | `DELETE` | Delete a software license | `software_licenses_collection` | Yes | - | Not Started |
| `/api/hod/software-licenses/{license_id}/renew` | `POST` | Renew a software license | `software_licenses_collection` | Yes | - | Not Started |
| `/api/hod/software-licenses` | `GET` | Get software licenses with filtering | `software_licenses_collection` | Yes | - | Not Started |
| `/api/hod/software-licenses/{license_id}` | `PUT` | Update software license information | `software_licenses_collection` | Yes | - | Not Started |

## Router: jobs

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/jobs/matches` | `GET` | Get personalized job matches based on user skills | `resume_collection, jobs_collection` | Yes | - | Not Started |
| `/api/jobs/featured` | `GET` | Get featured job listings from database | `resume_collection, jobs_collection` | Yes | - | Not Started |
| `/api/jobs/apply` | `POST` | Apply for a job | `resume_collection, jobs_collection` | Yes | - | Not Started |

## Router: language_courses

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/progress` | `GET` | Get user's language course progress | `language_course_progress_collection` | No | - | Not Started |
| `/run-code` | `POST` | Run code with AI assistance and sandbox execution | `language_course_progress_collection` | No | - | Not Started |
| `/submit-exercise` | `POST` | Submit solution for AI-powered evaluation and scoring | `language_course_progress_collection` | No | - | Not Started |

## Router: leaderboard

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/leaderboard` | `GET` | Get leaderboard with filters | `submissions_collection, leaderboard_collection, users_collection, interviews_collection, resume_collection, badges_collection` | Yes | - | Done |
| `/api/leaderboard/career` | `GET` | Get career readiness leaderboard | `submissions_collection, leaderboard_collection, users_collection, interviews_collection, resume_collection, badges_collection` | Yes | - | Done |

## Router: learning_paths

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/learning-paths/generate` | `POST` | Generate personalized learning path | `users_collection, learning_paths_collection` | Yes | - | Not Started |
| `/api/learning-paths` | `GET` | Get user's learning paths | `users_collection, learning_paths_collection` | Yes | - | Not Started |

## Router: licensing

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/license/generate` | `POST` | Generate a new institutional license key (Super Admin only) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/license/activate` | `POST` | Activate an institutional license key (Admin panel) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/license/status` | `GET` | Get current license status for Validity Tracker (Admin/HOD dashboards) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/license/all` | `GET` | Get all licenses (Super Admin only) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/license/bulk-onboard` | `POST` | Bulk create student accounts from CSV upload (Admin only) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/credits/edu-balance` | `GET` | Get student's EduCredit balance (used in profile.html and student dashboard) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/credits/consume` | `POST` | Consume EduCredits for an AI task (Mock interview, Code compilation, etc.) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/credits/request-refill` | `POST` | Student requests extra EduCredits (appears in Faculty/HOD dashboard) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/credits/refill` | `PUT` | HOD/Admin bulk assign EduCredits to students | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/credits/refill-requests` | `GET` | Get pending credit refill requests (Faculty/HOD dashboard) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/credits/approve-refill/{request_id}` | `POST` | Approve a student's credit refill request | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/license/renewal-quote` | `POST` | Generate an auto-renewal budget proposal & quote | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/license/analytics` | `GET` | Get detailed usage analytics for ROI proof (Admin/HOD dashboards) | `credit_refill_requests_collection` | No | - | Not Started |
| `/api/credits/costs` | `GET` | Get EduCredit costs for each task type (public endpoint) | `credit_refill_requests_collection` | No | - | Not Started |

## Router: misc

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/approvals/request` | `POST` | Create a new approval request | `approvals_collection, users_collection` | Yes | - | Not Started |
| `/api/approvals/faculty-community` | `POST` | Request creation of faculty community (requires HOD approval) | `approvals_collection, users_collection` | Yes | - | Not Started |
| `/api/approvals/faculty-leave` | `POST` | Request faculty leave (requires HOD approval) | `approvals_collection, users_collection` | Yes | - | Not Started |
| `/api/approvals/resource-request` | `POST` | Request department resources | `approvals_collection, users_collection` | Yes | - | Not Started |

## Router: notifications

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/notifications` | `GET` | Get user notifications | `notifications_collection` | Yes | - | Not Started |
| `/api/notifications/{notification_id}/read` | `POST` | Mark notification as read | `notifications_collection` | Yes | - | Not Started |
| `/api/notifications/read-all` | `POST` | Mark all notifications as read | `notifications_collection` | Yes | - | Not Started |

## Router: pair_programming

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/pair-programming/sessions` | `POST` | Create a pair programming session | `users_collection, pair_programming_collection` | Yes | - | Not Started |

## Router: problem_statements

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/problem-statements` | `POST` | Create a new problem statement (Admin only) | `problem_statements_collection` | Yes | - | Not Started |
| `/api/problem-statements/generate-ai` | `POST` | Generate a problem statement using AI | `problem_statements_collection` | Yes | - | Not Started |
| `/api/problem-statements` | `GET` | List all problem statements | `problem_statements_collection` | Yes | - | Not Started |

## Router: projects

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/create` | `POST` | Create a new personal or team project | `projects_collection, files_collection` | Yes | - | Not Started |
| `/{project_id}` | `GET` | Get detailed project info | `projects_collection, files_collection` | Yes | - | Not Started |
| `/team/group/{group_id}` | `GET` | List projects linked to a specific group | `projects_collection, files_collection` | Yes | - | Not Started |
| `/{project_id}/files` | `GET` | List all files in a project workspace | `projects_collection, files_collection` | Yes | - | Not Started |
| `/{project_id}/files/create` | `POST` | Create a new file in project workspace | `projects_collection, files_collection` | Yes | - | Not Started |

## Router: repositories

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/repositories` | `GET` | Get repositories with filters | `code_repositories_collection, code_commits_collection` | Yes | - | Not Started |
| `/api/repositories/{repository_id}` | `GET` | Get repository details | `code_repositories_collection, code_commits_collection` | Yes | - | Not Started |
| `/api/repositories/{repository_id}/commits` | `POST` | Create a new commit | `code_repositories_collection, code_commits_collection` | Yes | - | Not Started |
| `/api/repositories` | `POST` | Create a new code repository | `code_repositories_collection, code_commits_collection` | Yes | - | Not Started |

## Router: speech

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/generate` | `POST` | Generate audio from text (TTS) supporting both JSON and model formats | `None` | No | - | Not Started |
| `/text-to-speech` | `POST` | Form-based TTS for legacy support | `None` | No | - | Not Started |
| `/speech-to-text` | `POST` | Convert audio to text | `None` | No | - | Not Started |

## Router: stage1/ai

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/communication/generate-sentence` | `POST` | Generate a new English sentence for pronunciation practice | `communication_tasks_collection` | Yes | - | Not Started |
| `/api/communication/analyze-grammar` | `POST` | Analyze grammar and provide feedback in Tamil | `communication_tasks_collection` | Yes | - | Not Started |
| `/api/communication/ai-chat` | `POST` | Unified Communication AI Chatbot using Ollama     Handles: Conversation Practice, Grammar Assist... | `communication_tasks_collection` | Yes | - | Not Started |
| `/api/communication/analyze-pronunciation` | `POST` | Unified speech evaluation endpoint for Communication Stage.     Provides detailed AI analysis fo... | `communication_tasks_collection` | Yes | - | Not Started |
| `/api/communication/tasks` | `GET` | Get active communication tasks by skill (for students and all users) | `communication_tasks_collection` | Yes | - | Not Started |
| `/api/communication/tasks/{task_id}` | `GET` | Get single communication task by ID | `communication_tasks_collection` | Yes | - | Not Started |

## Router: stage1/listening

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/communication/evaluate-listening` | `POST` | Evaluate a listening challenge answer (Sentence Dictation). | `None` | Yes | - | Not Started |
| `/communication/generate-listening-mcq` | `POST` | Generate a Listen & Respond MCQ challenge using AI. | `None` | Yes | - | Not Started |
| `/communication/evaluate-listening-mcq` | `POST` | Evaluate a Listening MCQ answer. | `None` | Yes | - | Not Started |
| `/communication/generate-listening-gap` | `POST` | Generate a 'Fill the Beats' challenge using Gemini. | `None` | Yes | - | Not Started |
| `/communication/evaluate-listening-gap` | `POST` | Evaluate 'Fill the Beats' answers with AI feedback. | `None` | Yes | - | Not Started |
| `/communication/generate-listening-direction` | `POST` | Generate a grid-based path tracing listening challenge. | `None` | Yes | - | Not Started |
| `/communication/evaluate-listening-direction` | `POST` | Evaluate direction follower path tracing results. | `None` | Yes | - | Not Started |
| `/communication/generate-listening-tone` | `POST` | Generate a tone recognition challenge. | `None` | Yes | - | Not Started |
| `/communication/evaluate-listening-tone` | `POST` | Evaluate tone recognition selection. | `None` | Yes | - | Not Started |

## Router: stage1/read_challenge

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/stage1/read-challenge/admin` | `GET` | Get a random admin-created sentence for read challenge | `voice_challenge_sentences_collection, communication_submissions_collection, challenges_collection` | Yes | - | Not Started |
| `/api/stage1/read-challenge/ai` | `GET` | Generate an AI sentence for read challenge | `voice_challenge_sentences_collection, communication_submissions_collection, challenges_collection` | Yes | - | Not Started |
| `/api/stage1/read-challenge/submit` | `POST` | Submit a read challenge and get AI feedback with voice | `voice_challenge_sentences_collection, communication_submissions_collection, challenges_collection` | Yes | - | Not Started |
| `/api/stage1/generate-reading-challenge` | `POST` | Generate a reading challenge passage using Ollama | `voice_challenge_sentences_collection, communication_submissions_collection, challenges_collection` | Yes | - | Not Started |
| `/api/stage1/evaluate-reading-answer` | `POST` | Evaluate reading comprehension answer using Ollama | `voice_challenge_sentences_collection, communication_submissions_collection, challenges_collection` | Yes | - | Not Started |

## Router: stage1/roleplay

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/stage1/roleplay/scenarios` | `GET` | Get all available roleplay scenarios with difficulty levels. | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/roleplay/start` | `POST` | Start a new AI roleplay session. | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/roleplay/message` | `POST` | Send a message in an active roleplay session and get AI response. | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/roleplay/end` | `POST` | End a roleplay session and get detailed AI evaluation report. | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/roleplay/history` | `GET` | Get user's roleplay session history. | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/analyze-speech` | `POST` | Full speech analysis from audio:     - Transcription (Whisper/Deepgram/Fallback)     - Filler w... | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/analyze-text-speech` | `POST` | Analyze speech from text transcript (when audio is already transcribed on frontend).     Returns... | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/shadow-practice` | `POST` | Shadowing practice: Compare user's speech against reference text.     Uses Levenshtein distance ... | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/shadow-practice-text` | `POST` | Shadowing practice from pre-transcribed text (no audio upload required). | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |
| `/api/stage1/analyze-tone` | `POST` | Analyze the tone and communication style of a text message. | `roleplay_sessions_collection, users_collection, speech_analyses_collection` | Yes | - | Not Started |

## Router: stage1/speaking

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/stage1/evaluate-pronunciation` | `POST` | Evaluate pronunciation from audio file - transcribe and analyze | `challenges_collection, communication_submissions_collection` | Yes | - | Not Started |
| `/api/stage1/generate-speaking-challenge` | `POST` | Generate a speaking challenge question using Ollama | `challenges_collection, communication_submissions_collection` | Yes | - | Not Started |
| `/api/stage1/evaluate-speaking-answer` | `POST` | Evaluate speaking recording for pronunciation and grammar | `challenges_collection, communication_submissions_collection` | Yes | - | Not Started |

## Router: stage1/write_challenge

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/stage1/write-challenge/admin` | `GET` | Get a random admin-created writing challenge | `writing_challenges_collection, communication_tasks_collection, communication_submissions_collection` | Yes | - | Not Started |
| `/api/stage1/write-challenge/ai` | `GET` | Generate an AI writing challenge using Ollama | `writing_challenges_collection, communication_tasks_collection, communication_submissions_collection` | Yes | - | Not Started |
| `/api/stage1/write-challenge/submit` | `POST` | Submit a writing challenge and get AI feedback | `writing_challenges_collection, communication_tasks_collection, communication_submissions_collection` | Yes | - | Not Started |
| `/api/stage1/generate-writing-challenge` | `POST` | Generate a writing challenge using Ollama | `writing_challenges_collection, communication_tasks_collection, communication_submissions_collection` | Yes | - | Not Started |

## Router: stage2_arcade

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/stage2/arcade/battle/matchmake` | `POST` | Finds a match for Code Battle Arena | `users_collection, challenges_collection` | Yes | - | Done |
| `/api/stage2/arcade/boss/start` | `POST` | Starts an AI Boss Fight | `users_collection, challenges_collection` | Yes | - | Done |

## Router: student/announcements

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/student/classroom/{classroom_id}/announcements` | `GET` | Get announcements for a classroom the student is enrolled in | `classrooms_collection, announcements_collection` | Yes | - | Not Started |

## Router: student/assignments

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/student/classroom/{classroom_id}/assignments` | `GET` | Get all assignments for a student in a classroom | `classrooms_collection, assignment_collection, faculty_submissions_collection` | Yes | - | Not Started |
| `/api/student/assignments/{assignment_id}/submit` | `POST` | Student submits an assignment with optional file uploads | `classrooms_collection, assignment_collection, faculty_submissions_collection` | Yes | - | Not Started |
| `/api/student/assignments/{submission_id}/unsubmit` | `POST` | Student unsubmits an assignment (before due date) | `classrooms_collection, assignment_collection, faculty_submissions_collection` | Yes | - | Not Started |

## Router: student/classrooms

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/student/classrooms` | `GET` | Get classrooms enrolled by the current student | `classrooms_collection, classroom_requests_collection, users_collection` | Yes | - | Not Started |
| `/api/student/classroom-requests/pending` | `GET` | Get pending classroom requests for the current student | `classrooms_collection, classroom_requests_collection, users_collection` | Yes | - | Not Started |
| `/api/student/classroom-requests/{request_id}/respond` | `POST` | Student accepts or rejects a classroom invitation | `classrooms_collection, classroom_requests_collection, users_collection` | Yes | - | Not Started |
| `/api/search-students` | `GET` | Search for students by name, email, or student ID | `classrooms_collection, classroom_requests_collection, users_collection` | Yes | - | Not Started |
| `/api/add-student-to-classroom` | `POST` | Add an existing student to a classroom | `classrooms_collection, classroom_requests_collection, users_collection` | Yes | - | Not Started |

## Router: student/materials

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/student/classroom/{classroom_id}/materials` | `GET` | Get materials for a student's classroom | `classrooms_collection` | Yes | - | Not Started |

## Router: study_materials

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/study-materials` | `GET` | Get study materials | `study_materials_collection` | Yes | - | Not Started |

## Router: submissions

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/submissions` | `GET` | Get user submissions | `submissions_collection` | Yes | - | Not Started |

## Router: users

| Path | Method | Description | Collections | Gemini AI | Template | Status |
|------|--------|-------------|-------------|-----------|----------|--------|
| `/api/users/profile` | `PUT` | Update user profile | `users_collection, badges_collection, submissions_collection, code_repositories_collection` | Yes | - | Not Started |
| `/api/users/profile/picture` | `POST` | Upload profile picture | `users_collection, badges_collection, submissions_collection, code_repositories_collection` | Yes | - | Not Started |
| `/api/users/all` | `GET` | Get all registered users with optional search and filtering | `users_collection, badges_collection, submissions_collection, code_repositories_collection` | Yes | - | Not Started |
| `/api/users/mail-recipients` | `GET` | Get users for mail recipient selection (excluding current user) | `users_collection, badges_collection, submissions_collection, code_repositories_collection` | Yes | - | Not Started |
| `/api/users/search` | `GET` | Get current user profile | `users_collection, badges_collection, submissions_collection, code_repositories_collection` | Yes | - | Not Started |


## Suggested Phase Order

### Phase C — Stage 1: Communication (AI-heavy)
**Core/Must-Have:**
- `stage1_read_router`: Reading comprehension core loop.
- `stage1_listening_router`: Listening exercises.
- `stage1.ai` & `speech`: AI-graded writing and speaking.
**Nice-to-Have:**
- `stage1.roleplay`: Advanced roleplay scenarios.

### Phase D — Stage 3: Projects/Hackathons
**Core/Must-Have:**
- `groups` / `classroom`: Team formation and project workspace.
**Nice-to-Have:**
- `ai_grading`: AI code assistant for projects.

### Phase E — Stage 4: Career Prep
**Core/Must-Have:**
- `career_interviews`: Mock interviews powered by Gemini.
- `career_resume`: Resume builder pulling from achievements.
**Nice-to-Have:**
- `career_linkedin`: LinkedIn integration.

### Phase F — Faculty & HOD Dashboards
**Core/Must-Have:**
- `faculty_students` / `hod_faculty`: Core tracking.
- `hod_analytics`: Department overview.
**Nice-to-Have:**
- `faculty_ai_assistant`: AI helps faculty.

### Phase G — Remaining Gamification
**Core/Must-Have:**
- `challenges`: Daily challenges generation.
