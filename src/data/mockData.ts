/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Notice, Homework, Attendance, FeeInvoice, ExamResult, AdmissionEnquiry, CalendarEvent, Timetable } from '../types';

export const DEFAULT_USERS: User[] = [
  {
    id: 'admin_demo',
    name: 'Mrs. Sunita Sharma',
    email: 'admin@sunita.edu',
    role: 'admin',
    phone: '+91 98765 43210',
    password: 'admin123',
    designation: 'Principal & Director',
    department: 'Administration',
    joiningDate: '2020-01-15',
    salary: '₹85,000'
  },
  {
    id: 'teacher_demo',
    name: 'Mr. Arvind Verma',
    email: 'teacher@sunita.edu',
    role: 'teacher',
    classId: 'Class 10A',
    phone: '+91 98765 43211',
    password: 'teacher123',
    designation: 'Academic Coordinator',
    department: 'Mathematics',
    joiningDate: '2021-06-10',
    salary: '₹55,000'
  },
  {
    id: 'parent_demo',
    name: 'Mr. Ramesh Sharma',
    email: 'parent@sunita.edu',
    role: 'parent',
    studentId: 'student_demo',
    phone: '+91 98765 43212',
    password: 'parent123'
  },
  {
    id: 'student_demo',
    name: 'Rahul Sharma',
    email: 'student@sunita.edu',
    role: 'student',
    classId: 'Class 10A',
    admissionNo: 'SIS-2024-041',
    rollNo: '24',
    phone: '+91 98765 43213',
    password: 'student123'
  }
];

export const MOCK_STUDENTS = [
  { id: ' student_demo', name: 'Rahul Sharma', rollNo: '24', classId: 'Class 10A' },
  { id: 'std_2', name: 'Aarav Patel', rollNo: '01', classId: 'Class 10A' },
  { id: 'std_3', name: 'Ananya Iyer', rollNo: '05', classId: 'Class 10A' },
  { id: 'std_4', name: 'Aditya Rao', rollNo: '02', classId: 'Class 10A' },
  { id: 'std_5', name: 'Diya Sen', rollNo: '11', classId: 'Class 10A' },
  { id: 'std_6', name: 'Kabir Grewal', rollNo: '16', classId: 'Class 10B' },
  { id: 'std_7', name: 'Siddharth Roy', rollNo: '30', classId: 'Class 10B' }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not_1',
    title: 'Monsoon Swimming & Summer Camp Registrations Open',
    content: 'We are pleased to announce that registration for the Sunita International School Swimming and Summer Talent Camp has officially commenced. Activities include chess, robotics, debate, contemporary dance, and Vedic mathematics. Register by the 20th of June at the main office.',
    date: '2026-06-10',
    targetGroup: 'all',
    authorName: 'Mrs. Sunita Sharma (Principal)',
    createdAt: new Date('2026-06-10T10:00:00.000Z').toISOString()
  },
  {
    id: 'not_2',
    title: 'Upcoming Parent-Teacher Meeting (PTM)',
    content: 'The academic appraisal meet is scheduled for the coming Saturday (June 20th, 2026). Parents are requested to visit respective classrooms between 9:00 AM and 1:30 PM to discuss the mid-term evaluations and overall academic progress with subject teachers.',
    date: '2026-06-08',
    targetGroup: 'parents',
    authorName: 'Arvind Verma (Academic Coordinator)',
    createdAt: new Date('2026-06-08T09:00:00.000Z').toISOString()
  },
  {
    id: 'not_3',
    title: 'Term-1 Unit Tests Schedule Announcement',
    content: 'Attention Class 9-12 Students! The Unit Test 1 schedule has been published under the exams tab. The exams will begin on July 1st, 2026. The syllabus is attached to your homework portals or can be collected from class teachers.',
    date: '2026-06-05',
    targetGroup: 'students',
    authorName: 'Office of examinations',
    createdAt: new Date('2026-06-05T14:30:00.000Z').toISOString()
  },
  {
    id: 'not_4',
    title: 'Teacher Training Inset Session',
    content: 'Please note that Wednesday afternoon (June 17th) will be half-day for students due to the compulsory Professional Development webinar on AI Integration in Classrooms for school teaching staff.',
    date: '2026-06-11',
    targetGroup: 'teachers',
    authorName: 'Admin Desk',
    createdAt: new Date('2026-06-11T08:00:00.000Z').toISOString()
  }
];

export const INITIAL_HOMEWORK: Homework[] = [
  {
    id: 'hw_1',
    title: 'Quadratic Equations & Polynomial Proofs',
    description: 'Complete Exercise 4.3 and 4.4 from standard textbook. Solve all proofs in homework registers. Show steps for complex derivation formula.',
    subject: 'Mathematics',
    classId: 'Class 10A',
    dueDate: '2026-06-15',
    submissionsCount: 4,
    createdAt: new Date('2026-06-10T11:00:00.000Z').toISOString()
  },
  {
    id: 'hw_2',
    title: 'Light Reflection & Refraction Mechanics',
    description: 'Solve all ray diagrams representing real and virtual image formation by concave and convex mirrors. Submit high contrast pencil drawings.',
    subject: 'Science (Physics)',
    classId: 'Class 10A',
    dueDate: '2026-06-16',
    submissionsCount: 3,
    createdAt: new Date('2026-06-11T14:20:00.000Z').toISOString()
  },
  {
    id: 'hw_3',
    title: 'The Great Indian Rebellion of 1857 Analysis',
    description: 'Draft a short 500-word critical evaluation on the primary military, religious, and political triggers that led to the Sepoy Mutiny in Meerut.',
    subject: 'Social Science',
    classId: 'Class 10A',
    dueDate: '2026-06-18',
    submissionsCount: 1,
    createdAt: new Date('2026-06-12T09:00:00.000Z').toISOString()
  }
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 'att_1', studentId: 'student_demo', studentName: 'Rahul Sharma', date: '2026-06-12', status: 'present', markedByTeacherId: 'teacher_demo' },
  { id: 'att_2', studentId: 'std_2', studentName: 'Aarav Patel', date: '2026-06-12', status: 'present', markedByTeacherId: 'teacher_demo' },
  { id: 'att_3', studentId: 'std_3', studentName: 'Ananya Iyer', date: '2026-06-12', status: 'absent', markedByTeacherId: 'teacher_demo', remarks: 'Medical leave' },
  { id: 'att_4', studentId: 'std_4', studentName: 'Aditya Rao', date: '2026-06-12', status: 'late', markedByTeacherId: 'teacher_demo', remarks: 'Late school bus' },
  { id: 'att_5', studentId: 'std_5', studentName: 'Diya Sen', date: '2026-06-12', status: 'present', markedByTeacherId: 'teacher_demo' },
  // Historical context to make statistics pop!
  { id: 'att_h1', studentId: 'student_demo', studentName: 'Rahul Sharma', date: '2026-06-11', status: 'present', markedByTeacherId: 'teacher_demo' },
  { id: 'att_h2', studentId: 'student_demo', studentName: 'Rahul Sharma', date: '2026-06-10', status: 'present', markedByTeacherId: 'teacher_demo' },
  { id: 'att_h3', studentId: 'student_demo', studentName: 'Rahul Sharma', date: '2026-06-09', status: 'absent', markedByTeacherId: 'teacher_demo', remarks: 'Cold & Cough' },
  { id: 'att_h4', studentId: 'student_demo', studentName: 'Rahul Sharma', date: '2026-06-08', status: 'present', markedByTeacherId: 'teacher_demo' }
];

export const INITIAL_FEES: FeeInvoice[] = [
  {
    id: 'fee_1',
    studentId: 'student_demo',
    studentName: 'Rahul Sharma',
    amount: 14500,
    dueDate: '2026-07-01',
    status: 'unpaid',
    termName: 'Quarter 2 Tuition (July - September)'
  },
  {
    id: 'fee_2',
    studentId: 'student_demo',
    studentName: 'Rahul Sharma',
    amount: 12100,
    dueDate: '2026-04-10',
    status: 'paid',
    payDate: '2026-04-08',
    transactionId: 'TXN-SIS-89210',
    termName: 'Quarter 1 Tuition (April - June)'
  },
  {
    id: 'fee_3',
    studentId: 'student_demo',
    studentName: 'Rahul Sharma',
    amount: 3500,
    dueDate: '2026-05-30',
    status: 'paid',
    payDate: '2026-05-18',
    transactionId: 'TXN-SIS-34190',
    termName: 'Annual Sports & Science Activity Subscription'
  }
];

export const INITIAL_RESULTS: ExamResult[] = [
  {
    id: 'res_1',
    studentId: 'student_demo',
    studentName: 'Rahul Sharma',
    term: 'Mid-Term Appraisal',
    subject: 'Mathematics',
    marksObtained: 94,
    maxMarks: 100,
    grade: 'A+',
    remarks: 'Exceptional command over analytical questions.',
    date: '2026-05-15'
  },
  {
    id: 'res_2',
    studentId: 'student_demo',
    studentName: 'Rahul Sharma',
    term: 'Mid-Term Appraisal',
    subject: 'Science',
    marksObtained: 88,
    maxMarks: 100,
    grade: 'A',
    remarks: 'Shows keen insight in practical lab activities.',
    date: '2026-05-16'
  },
  {
    id: 'res_3',
    studentId: 'student_demo',
    studentName: 'Rahul Sharma',
    term: 'Mid-Term Appraisal',
    subject: 'English',
    marksObtained: 81,
    maxMarks: 100,
    grade: 'B+',
    remarks: 'Excellent essay structures, scope for language vocabulary improvement.',
    date: '2026-05-17'
  },
  {
    id: 'res_4',
    studentId: 'student_demo',
    studentName: 'Rahul Sharma',
    term: 'Mid-Term Appraisal',
    subject: 'Social Science',
    marksObtained: 79,
    maxMarks: 100,
    grade: 'B',
    remarks: 'Dedicated performance, needs descriptive memorization refinement.',
    date: '2026-05-18'
  }
];

export const INITIAL_ENQUIRIES: AdmissionEnquiry[] = [
  {
    id: 'enq_1',
    studentName: 'Anshuman Roy',
    parentName: 'Dipankar Roy',
    email: 'dipankar.roy@gmail.com',
    phone: '+91 91234 56789',
    gradeSeeking: 'Class 9',
    message: 'Seeking enquiries for admission syllabus, fee structures, and bus transport availability from South Kolkata area.',
    status: 'submitted',
    date: '2026-06-11'
  },
  {
    id: 'enq_2',
    studentName: 'Prisha Mehra',
    parentName: 'Sanjay Mehra',
    email: 'sanjay.mehra@yahoo.co.in',
    phone: '+91 99887 76655',
    gradeSeeking: 'Kindergarten',
    message: 'Interested in the pre-primary curriculum. Please send documentation about toddler play areas and mid-day snacks guidelines.',
    status: 'contacted',
    date: '2026-06-09'
  },
  {
    id: 'enq_3',
    studentName: 'Devansh Singhal',
    parentName: 'Reema Singhal',
    email: 'reema.s@outlook.com',
    phone: '+91 88776 65544',
    gradeSeeking: 'Class 11 Science',
    message: 'We are transferring from CBSE to Sunita International. Interested in physical labs and IIT-JEE coaching integrated modules.',
    status: 'approved',
    date: '2026-06-05',
    isFullApplication: true,
    gender: 'Male',
    dob: '2010-09-14',
    previousSchool: 'Moradabad Central Public School',
    previousMarks: '94.2% CGPA in Class 10 Board',
    fatherOccupation: 'Executive Engineer, Irrigation Department',
    motherName: 'Dr. Reema Singhal',
    motherOccupation: 'Associate Professor, Pediatric Medicine',
    address: 'H.No 145, Sector 4, Kanth Road, Moradabad, UP - 244001',
    needsHostel: true,
    documentsSubmitted: ['Birth Certificate', 'Class 10 CBSE Marksheet', 'Transfer Certificate']
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'Monsoon Swim Camp Registration',
    description: 'Swimming & Summer Talent camp registration begins. Chess, robotics, contemporary arts registration at registrar desk.',
    date: '2026-06-10',
    type: 'event',
    createdBy: 'Mrs. Sunita Sharma (Principal)',
    classId: 'all'
  },
  {
    id: 'evt_2',
    title: 'Teacher Training Block',
    description: 'Compulsory teacher webinar on Integrating AI Assistants & Generative AI Tools in Secondary Classrooms. School half-day for kids.',
    date: '2026-06-17',
    type: 'event',
    createdBy: 'Admin Desk',
    classId: 'all'
  },
  {
    id: 'evt_3',
    title: 'Parent-Teacher Meeting (PTM)',
    description: 'Academic Appraisal meet for Class 1 to 12. Discuss mid-term results and curriculum progress with classroom teachers (9 AM - 1:30 PM).',
    date: '2026-06-20',
    type: 'event',
    createdBy: 'Mr. Arvind Verma',
    classId: 'all'
  },
  {
    id: 'evt_4',
    title: 'Anti-Drug Day Special Assembly',
    description: 'School assembly with guest lecture by health officers regarding adolescent safety, wellness, and digital hygiene practices.',
    date: '2026-06-26',
    type: 'event',
    createdBy: 'Principal Desk',
    classId: 'all'
  },
  {
    id: 'evt_5',
    title: 'Unit Test 1: Mathematics',
    description: 'Unit Exam covering Polynomials, Quadratic Equations, and Coordinate Geometry. Time: 8:30 AM to 10:00 AM.',
    date: '2026-07-01',
    type: 'exam',
    createdBy: 'Examination Controller',
    classId: 'Class 10A'
  },
  {
    id: 'evt_6',
    title: 'Unit Test 1: Science',
    description: 'Unit Exam covering Chemical Reactions, Life Processes, and Light Reflection. Time: 8:30 AM to 10:00 AM.',
    date: '2026-07-02',
    type: 'exam',
    createdBy: 'Examination Controller',
    classId: 'Class 10A'
  },
  {
    id: 'evt_7',
    title: 'Unit Test 1: English',
    description: 'Unit Exam covering Unseen Passages, Grammar Editing, and Prose comprehension. Time: 8:30 AM to 10:00 AM.',
    date: '2026-07-03',
    type: 'exam',
    createdBy: 'Examination Controller',
    classId: 'Class 10A'
  },
  {
    id: 'evt_8',
    title: 'Guru Purnima Celebrations',
    description: 'Special cultural homage and award ceremony for teachers by student council. Vocal music & classical dance performances.',
    date: '2026-07-10',
    type: 'event',
    createdBy: 'Aarav Patel (Student Head)',
    classId: 'all'
  },
  {
    id: 'evt_9',
    title: 'Independence Day Celebrations',
    description: 'Flag hoisting ceremony, patriotic choir singing, and parade exhibition by school NCC batches. Attendance mandatory.',
    date: '2026-08-15',
    type: 'holiday',
    createdBy: 'Mrs. Sunita Sharma (Principal)',
    classId: 'all'
  },
  {
    id: 'evt_10',
    title: 'Raksha Bandhan Holiday',
    description: 'School closed on account of Raksha Bandhan cultural festival.',
    date: '2026-08-27',
    type: 'holiday',
    createdBy: 'Admin Desk',
    classId: 'all'
  },
  {
    id: 'evt_11',
    title: 'Teachers Day Carnival',
    description: 'Student-led food stalls, sports matches (Teachers vs. Seniors), and fun games. No normal academic classes.',
    date: '2026-09-05',
    type: 'event',
    createdBy: 'Student Council',
    classId: 'all'
  },
  {
    id: 'evt_12',
    title: 'Semester 1 Terminal Exams Begin',
    description: 'Bi-annual terminal board exams for Class 9 to 12. Detailed datesheets can be collected from academic wing.',
    date: '2026-09-15',
    type: 'exam',
    createdBy: 'Examination Controller',
    classId: 'all'
  }
];

export const INITIAL_TIMETABLES: Timetable[] = [
  // Monday
  { id: 'tt_1', classId: 'Class 10A', day: 'Monday', subject: 'Mathematics', teacher: 'Mr. Arvind Verma', startTime: '08:00', endTime: '08:45' },
  { id: 'tt_2', classId: 'Class 10A', day: 'Monday', subject: 'Science', teacher: 'Mrs. Aditi Sen', startTime: '08:45', endTime: '09:30' },
  { id: 'tt_3', classId: 'Class 10A', day: 'Monday', subject: 'English', teacher: 'Dr. Vivek Anand', startTime: '09:45', endTime: '10:30' },
  { id: 'tt_4', classId: 'Class 10A', day: 'Monday', subject: 'Social Science', teacher: 'Mr. S. K. Gupta', startTime: '10:30', endTime: '11:15' },
  { id: 'tt_5', classId: 'Class 10A', day: 'Monday', subject: 'Informatics Practices', teacher: 'Mrs. Neha Roy', startTime: '11:30', endTime: '12:15' },

  // Tuesday
  { id: 'tt_6', classId: 'Class 10A', day: 'Tuesday', subject: 'Science', teacher: 'Mrs. Aditi Sen', startTime: '08:00', endTime: '08:45' },
  { id: 'tt_7', classId: 'Class 10A', day: 'Tuesday', subject: 'Mathematics', teacher: 'Mr. Arvind Verma', startTime: '08:45', endTime: '09:30' },
  { id: 'tt_8', classId: 'Class 10A', day: 'Tuesday', subject: 'Hindi', teacher: 'Mr. S. P. Dwivedi', startTime: '09:45', endTime: '10:30' },
  { id: 'tt_9', classId: 'Class 10A', day: 'Tuesday', subject: 'English', teacher: 'Dr. Vivek Anand', startTime: '10:30', endTime: '11:15' },
  { id: 'tt_10', classId: 'Class 10A', day: 'Tuesday', subject: 'Physical Education', teacher: 'Mr. Amit Rana', startTime: '11:30', endTime: '12:15' },

  // Wednesday
  { id: 'tt_11', classId: 'Class 10A', day: 'Wednesday', subject: 'Mathematics', teacher: 'Mr. Arvind Verma', startTime: '08:00', endTime: '08:45' },
  { id: 'tt_12', classId: 'Class 10A', day: 'Wednesday', subject: 'Social Science', teacher: 'Mr. S. K. Gupta', startTime: '08:45', endTime: '09:30' },
  { id: 'tt_13', classId: 'Class 10A', day: 'Wednesday', subject: 'Science', teacher: 'Mrs. Aditi Sen', startTime: '09:45', endTime: '10:30' },
  { id: 'tt_14', classId: 'Class 10A', day: 'Wednesday', subject: 'Informatics Practices', teacher: 'Mrs. Neha Roy', startTime: '10:30', endTime: '11:15' },
  { id: 'tt_15', classId: 'Class 10A', day: 'Wednesday', subject: 'Arts & Craft', teacher: 'Mrs. Rupa Ganguly', startTime: '11:30', endTime: '12:15' },

  // Thursday
  { id: 'tt_16', classId: 'Class 10A', day: 'Thursday', subject: 'English', teacher: 'Dr. Vivek Anand', startTime: '08:00', endTime: '08:45' },
  { id: 'tt_17', classId: 'Class 10A', day: 'Thursday', subject: 'Science', teacher: 'Mrs. Aditi Sen', startTime: '08:45', endTime: '09:30' },
  { id: 'tt_18', classId: 'Class 10A', day: 'Thursday', subject: 'Mathematics', teacher: 'Mr. Arvind Verma', startTime: '09:45', endTime: '10:30' },
  { id: 'tt_19', classId: 'Class 10A', day: 'Thursday', subject: 'Hindi', teacher: 'Mr. S. P. Dwivedi', startTime: '10:30', endTime: '11:15' },
  { id: 'tt_20', classId: 'Class 10A', day: 'Thursday', subject: 'Social Science', teacher: 'Mr. S. K. Gupta', startTime: '11:30', endTime: '12:15' },

  // Friday
  { id: 'tt_21', classId: 'Class 10A', day: 'Friday', subject: 'Mathematics', teacher: 'Mr. Arvind Verma', startTime: '08:00', endTime: '08:45' },
  { id: 'tt_22', classId: 'Class 10A', day: 'Friday', subject: 'English', teacher: 'Dr. Vivek Anand', startTime: '08:45', endTime: '09:30' },
  { id: 'tt_23', classId: 'Class 10A', day: 'Friday', subject: 'Science', teacher: 'Mrs. Aditi Sen', startTime: '09:45', endTime: '10:30' },
  { id: 'tt_24', classId: 'Class 10A', day: 'Friday', subject: 'Library Session', teacher: 'Mrs. Kiran Bedi', startTime: '10:30', endTime: '11:15' },
  { id: 'tt_25', classId: 'Class 10A', day: 'Friday', subject: 'Social Science', teacher: 'Mr. S. K. Gupta', startTime: '11:30', endTime: '12:15' },

  // Saturday
  { id: 'tt_26', classId: 'Class 10A', day: 'Saturday', subject: 'Laboratory Science', teacher: 'Mrs. Aditi Sen', startTime: '08:00', endTime: '09:30' },
  { id: 'tt_27', classId: 'Class 10A', day: 'Saturday', subject: 'Weekly Assessment', teacher: 'Mr. Arvind Verma', startTime: '09:45', endTime: '11:15' },
  { id: 'tt_28', classId: 'Class 10A', day: 'Saturday', subject: 'Life Skills & Club Activities', teacher: 'Mrs. Sunita Sharma', startTime: '11:30', endTime: '12:15' }
];
