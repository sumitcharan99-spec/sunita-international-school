/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  classId?: string; // e.g. "Class 10A"
  studentId?: string; // Linked student for a Parent
  phone?: string;
  admissionNo?: string;
  rollNo?: string;
  password?: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  salary?: string;
}

export type NoticeTarget = 'all' | 'teachers' | 'students' | 'parents';

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  targetGroup: NoticeTarget;
  authorName: string;
  createdAt: string;
  isUrgent?: boolean;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  classId: string;
  dueDate: string; // YYYY-MM-DD
  submissionsCount: number;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedByTeacherId: string;
  remarks?: string;
}

export type FeeStatus = 'paid' | 'unpaid' | 'partial';

export interface FeeInvoice {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: FeeStatus;
  payDate?: string;
  transactionId?: string;
  termName: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  term: string; // e.g., "Term 1", "Midterm", "Final"
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
  date: string;
}

export type EnquiryStatus = 'submitted' | 'contacted' | 'approved' | 'rejected';

export interface AdmissionEnquiry {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  gradeSeeking: string; // e.g. "Grade 10"
  message: string;
  status: EnquiryStatus;
  date: string; // YYYY-MM-DD
  // New comprehensive application optional fields
  isFullApplication?: boolean;
  gender?: string;
  dob?: string;
  previousSchool?: string;
  previousMarks?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  address?: string;
  needsHostel?: boolean;
  documentsSubmitted?: string[];
}

export type CalendarEventType = 'holiday' | 'exam' | 'event';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD (start date)
  endDate?: string; // YYYY-MM-DD (optional, for multi-day events)
  type: CalendarEventType;
  createdBy: string;
  classId?: string; // Optional: "all" or specific class like "Class 10A"
}

export type CertificateType = 'transfer' | 'character';
export type CertificateStatus = 'pending' | 'approved' | 'rejected';

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  rollNo?: string;
  parentName?: string;
  dob?: string; // YYYY-MM-DD
  reason?: string;
  certificateType: CertificateType;
  status: CertificateStatus;
  dateRequested: string; // YYYY-MM-DD
  dateApproved?: string; // YYYY-MM-DD
  approvedBy?: string; // Admin User ID/Name
  serialNo?: string; // e.g. "SIS/TC/2026/104"
}

export interface CommunicationLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  recipientRole: string; // 'teacher' | 'parent' | 'student' | 'admin'
  messageType: 'sms' | 'whatsapp' | 'both' | 'email' | 'all';
  messageContent: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
  noticeTitle?: string;
  isManual?: boolean;
}

export interface Timetable {
  id: string;
  classId: string;
  day: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}



