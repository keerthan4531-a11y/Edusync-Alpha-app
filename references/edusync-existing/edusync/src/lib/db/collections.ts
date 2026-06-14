import { getDb } from './mongodb';
import { Collection, Document } from 'mongodb';

// Helper to safely get a collection
export const getCollection = async <T extends Document>(collectionName: string): Promise<Collection<T>> => {
  const db = await getDb();
  return db.collection<T>(collectionName);
};

// Core collections getters
export const getUsersCollection = () => getCollection('users');
export const getChallengesCollection = () => getCollection('challenges');
export const getSubmissionsCollection = () => getCollection('submissions');
export const getGroupsCollection = () => getCollection('groups');
export const getMessagesCollection = () => getCollection('messages');
export const getFilesCollection = () => getCollection('files');
export const getLeaderboardCollection = () => getCollection('leaderboard');
export const getBadgesCollection = () => getCollection('badges');
export const getProjectsCollection = () => getCollection('projects');
export const getInterviewsCollection = () => getCollection('interviews');
export const getJobsCollection = () => getCollection('jobs');
export const getNotificationsCollection = () => getCollection('notifications');
export const getCertificatesCollection = () => getCollection('certificates');
export const getCrewBattlesCollection = () => getCollection('crew_battles');
export const getAnalyticsCollection = () => getCollection('analytics');
export const getOnlineCompilerCollection = () => getCollection('online_compiler');
export const getExamsCollection = () => getCollection('exams');
export const getAnnouncementsCollection = () => getCollection('announcements');
export const getStudyMaterialsCollection = () => getCollection('study_materials');
export const getClassroomsCollection = () => getCollection('classrooms');
export const getAiChatsCollection = () => getCollection('ai_chats');
export const getCodingChallengesCollection = () => getCollection('coding_challenges');
export const getQuizzesCollection = () => getCollection('quizzes');
export const getAssignmentsCollection = () => getCollection('assignments');
export const getAttendanceCollection = () => getCollection('attendance');
export const getEventsCollection = () => getCollection('events');
export const getCoursesCollection = () => getCollection('courses');
export const getPaymentsCollection = () => getCollection('payments');
export const getFeedbackCollection = () => getCollection('feedback');
export const getResumesCollection = () => getCollection('resumes');

// Add more collection getters as needed based on backend/app/database.py
