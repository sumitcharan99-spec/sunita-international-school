/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, auth, isFirebaseEnabled, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  setDoc
} from 'firebase/firestore';
import { 
  Notice, 
  Homework, 
  Attendance, 
  FeeInvoice, 
  ExamResult, 
  AdmissionEnquiry, 
  User,
  CalendarEvent,
  CertificateRequest,
  CertificateStatus,
  CommunicationLog,
  Timetable
} from '../types';
import { 
  INITIAL_NOTICES, 
  INITIAL_HOMEWORK, 
  INITIAL_ATTENDANCE, 
  INITIAL_FEES, 
  INITIAL_RESULTS, 
  INITIAL_ENQUIRIES,
  DEFAULT_USERS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_TIMETABLES
} from '../data/mockData';

// Storage Helper Keys
const KEYS = {
  USERS: 'sis_users',
  NOTICES: 'sis_notices',
  HOMEWORK: 'sis_homework',
  ATTENDANCE: 'sis_attendance',
  FEES: 'sis_fees',
  RESULTS: 'sis_results',
  ENQUIRIES: 'sis_enquiries',
  EVENTS: 'sis_events',
  CERTIFICATES: 'sis_certificates',
  COMM_LOGS: 'sis_comm_logs',
  TIMETABLES: 'sis_timetables',
};

const INITIAL_CERTIFICATES: CertificateRequest[] = [
  {
    id: 'cert_1',
    studentId: 'student_demo',
    studentName: 'Rahul Sharma',
    classId: 'Class 10A',
    rollNo: '24',
    parentName: 'Mr. Ramesh Sharma',
    dob: '2011-04-15',
    reason: 'Higher studies in residential academy closer to hometown in Delhi NCR.',
    certificateType: 'transfer',
    status: 'pending',
    dateRequested: '2026-06-10'
  },
  {
    id: 'cert_2',
    studentId: 'student_sanya',
    studentName: 'Sanya Malhotra',
    classId: 'Class 12B',
    rollNo: '12',
    parentName: 'Mr. Alok Malhotra',
    dob: '2009-08-22',
    reason: 'Undergraduate college admissions and regional engineering entrance applications.',
    certificateType: 'character',
    status: 'approved',
    dateRequested: '2026-06-05',
    dateApproved: '2026-06-08',
    approvedBy: 'Mrs. Sunita Sharma',
    serialNo: 'SIS/CC/2026/089'
  }
];

const INITIAL_COMM_LOGS: CommunicationLog[] = [
  {
    id: 'comm_1',
    recipientName: 'Mr. Ramesh Sharma',
    recipientPhone: '+91 98765 43212',
    recipientRole: 'parent',
    messageType: 'both',
    messageContent: 'SMS & WhatsApp Alert: Monsoon Swimming & Summer Talent Camp has officially commenced! Register by 20th June.',
    status: 'delivered',
    timestamp: '2026-06-10T10:15:00.000Z',
    noticeTitle: 'Monsoon Swimming & Summer Camp Registrations Open',
    isManual: false
  },
  {
    id: 'comm_2',
    recipientName: 'Mr. Arvind Verma',
    recipientPhone: '+91 98765 43211',
    recipientRole: 'teacher',
    messageType: 'whatsapp',
    messageContent: 'Dear Teacher, please attend the Academic webinar on Wednesday afternoon (June 17th) regarding AI integration.',
    status: 'delivered',
    timestamp: '2026-06-11T12:00:22.000Z',
    noticeTitle: 'Teacher Training Inset Session',
    isManual: false
  }
];

// Initialize LocalStorage with seeds if empty
function initLocalStorage() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(KEYS.NOTICES)) {
      localStorage.setItem(KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
    }
    if (!localStorage.getItem(KEYS.HOMEWORK)) {
      localStorage.setItem(KEYS.HOMEWORK, JSON.stringify(INITIAL_HOMEWORK));
    }
    if (!localStorage.getItem(KEYS.ATTENDANCE)) {
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    }
    if (!localStorage.getItem(KEYS.FEES)) {
      localStorage.setItem(KEYS.FEES, JSON.stringify(INITIAL_FEES));
    }
    if (!localStorage.getItem(KEYS.RESULTS)) {
      localStorage.setItem(KEYS.RESULTS, JSON.stringify(INITIAL_RESULTS));
    }
    if (!localStorage.getItem(KEYS.ENQUIRIES)) {
      localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
    }
    if (!localStorage.getItem(KEYS.EVENTS)) {
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_CALENDAR_EVENTS));
    }
    if (!localStorage.getItem(KEYS.CERTIFICATES)) {
      localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
    }
    if (!localStorage.getItem(KEYS.COMM_LOGS)) {
      localStorage.setItem(KEYS.COMM_LOGS, JSON.stringify(INITIAL_COMM_LOGS));
    }
    if (!localStorage.getItem(KEYS.TIMETABLES)) {
      localStorage.setItem(KEYS.TIMETABLES, JSON.stringify(INITIAL_TIMETABLES));
    }
  }
}

// Trigger initialization
initLocalStorage();

const isAuthAndReady = () => {
  return isFirebaseEnabled && db && auth && auth.currentUser !== null;
};

// Helper to interact with LocalStorage
const ls = {
  get: <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  set: <T>(key: string, data: T[]): void => {
    localStorage.setItem(key, JSON.stringify(data));
  },
};

export const dataService = {
  // ==========================================
  // USERS
  // ==========================================
  getUsers: async (): Promise<User[]> => {
    if (isAuthAndReady()) {
      const p = 'users';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as User));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<User>(KEYS.USERS);
  },

  saveUser: async (user: User): Promise<User> => {
    if (isAuthAndReady()) {
      const p = `users`;
      try {
        await setDoc(doc(db, p, user.id), user);
        return user;
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `${p}/${user.id}`);
      }
    }
    const current = ls.get<User>(KEYS.USERS);
    const existingIdx = current.findIndex(u => u.id === user.id);
    if (existingIdx > -1) {
      current[existingIdx] = user;
    } else {
      current.push(user);
    }
    ls.set(KEYS.USERS, current);
    return user;
  },

  // ==========================================
  // NOTICES
  // ==========================================
  getNotices: async (): Promise<Notice[]> => {
    if (isAuthAndReady()) {
      const p = 'notices';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as Notice));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<Notice>(KEYS.NOTICES).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  createNotice: async (notice: Omit<Notice, 'id'>): Promise<Notice> => {
    const newId = 'notice_' + Math.random().toString(36).substr(2, 9);
    const item: Notice = { ...notice, id: newId };
    
    if (isAuthAndReady()) {
      const p = 'notices';
      try {
        const docRef = await addDoc(collection(db, p), notice);
        return { ...notice, id: docRef.id };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, p);
      }
    }
    const current = ls.get<Notice>(KEYS.NOTICES);
    current.unshift(item);
    ls.set(KEYS.NOTICES, current);
    return item;
  },

  deleteNotice: async (id: string): Promise<void> => {
    if (isAuthAndReady()) {
      const p = `notices/${id}`;
      try {
        await deleteDoc(doc(db, 'notices', id));
        return;
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, p);
      }
    }
    const current = ls.get<Notice>(KEYS.NOTICES).filter(n => n.id !== id);
    ls.set(KEYS.NOTICES, current);
  },

  // ==========================================
  // HOMEWORK
  // ==========================================
  getHomework: async (): Promise<Homework[]> => {
    if (isAuthAndReady()) {
      const p = 'homework';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as Homework));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<Homework>(KEYS.HOMEWORK).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  createHomework: async (hw: Omit<Homework, 'id' | 'submissionsCount'>): Promise<Homework> => {
    const newId = 'hw_' + Math.random().toString(36).substr(2, 9);
    const item: Homework = { ...hw, id: newId, submissionsCount: 0 };
    
    if (isAuthAndReady()) {
      const p = 'homework';
      try {
        const docRef = await addDoc(collection(db, p), { ...hw, submissionsCount: 0 });
        return { ...hw, id: docRef.id, submissionsCount: 0 };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, p);
      }
    }
    const current = ls.get<Homework>(KEYS.HOMEWORK);
    current.unshift(item);
    ls.set(KEYS.HOMEWORK, current);
    return item;
  },

  // ==========================================
  // ATTENDANCE
  // ==========================================
  getAttendance: async (): Promise<Attendance[]> => {
    if (isAuthAndReady()) {
      const p = 'attendance';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as Attendance));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<Attendance>(KEYS.ATTENDANCE).sort((a,b) => b.date.localeCompare(a.date));
  },

  markAttendanceBatch: async (records: Omit<Attendance, 'id'>[]): Promise<Attendance[]> => {
    const saved: Attendance[] = [];
    if (isAuthAndReady()) {
      const p = 'attendance';
      for (const r of records) {
        try {
          // If a student already has attendance for this date, let's update it or write new
          // For simplicity, we add/write doc or search first
          const docRef = await addDoc(collection(db, p), r);
          saved.push({ ...r, id: docRef.id });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, p);
        }
      }
      return saved;
    }

    const current = ls.get<Attendance>(KEYS.ATTENDANCE);
    for (const r of records) {
      // Find and overwrite if same student and date already exists
      const existIdx = current.findIndex(a => a.studentId === r.studentId && a.date === r.date);
      const item: Attendance = { ...r, id: 'att_' + Math.random().toString(36).substr(2, 9) };
      if (existIdx > -1) {
        current[existIdx] = { ...r, id: current[existIdx].id };
        saved.push(current[existIdx]);
      } else {
        current.push(item);
        saved.push(item);
      }
    }
    ls.set(KEYS.ATTENDANCE, current);
    return saved;
  },

  // ==========================================
  // FEES
  // ==========================================
  getFeesInvoices: async (): Promise<FeeInvoice[]> => {
    if (isAuthAndReady()) {
      const p = 'fees';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as FeeInvoice));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<FeeInvoice>(KEYS.FEES);
  },

  payFeeInvoice: async (id: string, transactionId: string): Promise<FeeInvoice | null> => {
    const payDate = new Date().toISOString().split('T')[0];
    if (isAuthAndReady()) {
      const p = `fees/${id}`;
      try {
        const docRef = doc(db, 'fees', id);
        await updateDoc(docRef, {
          status: 'paid',
          payDate,
          transactionId
        });
        return { id } as any; // Trigger reload
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, p);
      }
    }

    const current = ls.get<FeeInvoice>(KEYS.FEES);
    const invoiceIdx = current.findIndex(f => f.id === id);
    if (invoiceIdx > -1) {
      current[invoiceIdx] = {
        ...current[invoiceIdx],
        status: 'paid',
        payDate,
        transactionId
      };
      ls.set(KEYS.FEES, current);
      return current[invoiceIdx];
    }
    return null;
  },

  createFeeInvoice: async (f: Omit<FeeInvoice, 'id'>): Promise<FeeInvoice> => {
    const newId = 'fee_' + Math.random().toString(36).substr(2, 9);
    const item: FeeInvoice = { ...f, id: newId };
    
    if (isAuthAndReady()) {
      const p = 'fees';
      try {
        const docRef = await addDoc(collection(db, p), f);
        return { ...f, id: docRef.id };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, p);
      }
    }
    const current = ls.get<FeeInvoice>(KEYS.FEES);
    current.push(item);
    ls.set(KEYS.FEES, current);
    return item;
  },

  // ==========================================
  // RESULTS
  // ==========================================
  getExamResults: async (): Promise<ExamResult[]> => {
    if (isAuthAndReady()) {
      const p = 'results';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as ExamResult));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<ExamResult>(KEYS.RESULTS);
  },

  createExamResult: async (res: Omit<ExamResult, 'id'>): Promise<ExamResult> => {
    const newId = 'res_' + Math.random().toString(36).substr(2, 9);
    const item: ExamResult = { ...res, id: newId };
    
    if (isAuthAndReady()) {
      const p = 'results';
      try {
        const docRef = await addDoc(collection(db, p), res);
        return { ...res, id: docRef.id };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, p);
      }
    }
    const current = ls.get<ExamResult>(KEYS.RESULTS);
    current.push(item);
    ls.set(KEYS.RESULTS, current);
    return item;
  },

  // ==========================================
  // ADMISSION ENQUIRIES
  // ==========================================
  getAdmissionEnquiries: async (): Promise<AdmissionEnquiry[]> => {
    if (isAuthAndReady()) {
      const p = 'enquiries';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionEnquiry));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<AdmissionEnquiry>(KEYS.ENQUIRIES).sort((a,b) => b.date.localeCompare(a.date));
  },

  createAdmissionEnquiry: async (enq: Omit<AdmissionEnquiry, 'id' | 'status' | 'date'>): Promise<AdmissionEnquiry> => {
    const date = new Date().toISOString().split('T')[0];
    const data: Omit<AdmissionEnquiry, 'id'> = {
      ...enq,
      status: 'submitted',
      date
    };
    
    const newId = 'enq_' + Math.random().toString(36).substr(2, 9);
    const item: AdmissionEnquiry = { ...data, id: newId };

    if (isAuthAndReady()) {
      const p = 'enquiries';
      try {
        const docRef = await addDoc(collection(db, p), data);
        return { ...data, id: docRef.id };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, p);
      }
    }

    const current = ls.get<AdmissionEnquiry>(KEYS.ENQUIRIES);
    current.unshift(item);
    ls.set(KEYS.ENQUIRIES, current);
    return item;
  },

  updateEnquiryStatus: async (id: string, status: AdmissionEnquiry['status']): Promise<AdmissionEnquiry | null> => {
    if (isAuthAndReady()) {
      const p = `enquiries/${id}`;
      try {
        const docRef = doc(db, 'enquiries', id);
        await updateDoc(docRef, { status });
        return { id } as any; // Trigger load reload
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, p);
      }
    }

    const current = ls.get<AdmissionEnquiry>(KEYS.ENQUIRIES);
    const idx = current.findIndex(e => e.id === id);
    if (idx > -1) {
      current[idx].status = status;
      ls.set(KEYS.ENQUIRIES, current);
      return current[idx];
    }
    return null;
  },

  // ==========================================
  // ACADEMIC CALENDAR EVENTS
  // ==========================================
  getCalendarEvents: async (): Promise<CalendarEvent[]> => {
    if (isAuthAndReady()) {
      const p = 'events';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<CalendarEvent>(KEYS.EVENTS);
  },

  createCalendarEvent: async (evt: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const newId = 'evt_' + Math.random().toString(36).substr(2, 9);
    const item: CalendarEvent = { ...evt, id: newId };
    
    if (isAuthAndReady()) {
      const p = 'events';
      try {
        const docRef = await addDoc(collection(db, p), evt);
        return { ...evt, id: docRef.id };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, p);
      }
    }
    const current = ls.get<CalendarEvent>(KEYS.EVENTS);
    current.push(item);
    ls.set(KEYS.EVENTS, current);
    return item;
  },

  deleteCalendarEvent: async (id: string): Promise<void> => {
    if (isAuthAndReady()) {
      const p = `events/${id}`;
      try {
        await deleteDoc(doc(db, 'events', id));
        return;
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, p);
      }
    }
    const current = ls.get<CalendarEvent>(KEYS.EVENTS).filter(e => e.id !== id);
    ls.set(KEYS.EVENTS, current);
  },

  // ==========================================
  // CERTIFICATE REQUESTS
  // ==========================================
  getCertificateRequests: async (): Promise<CertificateRequest[]> => {
    if (isAuthAndReady()) {
      const p = 'certificates';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as CertificateRequest));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<CertificateRequest>(KEYS.CERTIFICATES).sort((a, b) => b.dateRequested.localeCompare(a.dateRequested));
  },

  createCertificateRequest: async (req: Omit<CertificateRequest, 'id' | 'status' | 'dateRequested'>): Promise<CertificateRequest> => {
    const dateRequested = new Date().toISOString().split('T')[0];
    const data: Omit<CertificateRequest, 'id'> = {
      ...req,
      status: 'pending',
      dateRequested
    };
    
    const newId = 'cert_' + Math.random().toString(36).substr(2, 9);
    const item: CertificateRequest = { ...data, id: newId };

    if (isAuthAndReady()) {
      const p = 'certificates';
      try {
        const docRef = await addDoc(collection(db, p), data);
        return { ...data, id: docRef.id };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, p);
      }
    }

    const current = ls.get<CertificateRequest>(KEYS.CERTIFICATES);
    current.unshift(item);
    ls.set(KEYS.CERTIFICATES, current);
    return item;
  },

  updateCertificateStatus: async (
    id: string, 
    status: CertificateStatus, 
    approvedBy?: string
  ): Promise<CertificateRequest | null> => {
    const dateApproved = status === 'approved' ? new Date().toISOString().split('T')[0] : undefined;
    
    if (isAuthAndReady()) {
      const p = `certificates/${id}`;
      try {
        const docRef = doc(db, 'certificates', id);
        const updatePayload: any = { status };
        if (dateApproved) {
          updatePayload.dateApproved = dateApproved;
          updatePayload.approvedBy = approvedBy || 'Mrs. Sunita Sharma';
          const randomNum = Math.floor(Math.random() * 800) + 100;
          updatePayload.serialNo = `SIS/${status === 'approved' ? 'TC' : 'CC'}/2026/${randomNum}`;
        }
        await updateDoc(docRef, updatePayload);
        return { id } as any; // Trigger load reload
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, p);
      }
    }

    const current = ls.get<CertificateRequest>(KEYS.CERTIFICATES);
    const idx = current.findIndex(c => c.id === id);
    if (idx > -1) {
      current[idx].status = status;
      if (status === 'approved') {
        current[idx].dateApproved = dateApproved;
        current[idx].approvedBy = approvedBy || 'Mrs. Sunita Sharma';
        const code = current[idx].certificateType === 'transfer' ? 'TC' : 'CC';
        const num = Math.floor(Math.random() * 800) + 100;
        current[idx].serialNo = `SIS/${code}/2026/${num}`;
      }
      ls.set(KEYS.CERTIFICATES, current);
      return current[idx];
    }
    return null;
  },

  // ==========================================
  // COMMUNICATION RECIPIENTS LOGS
  // ==========================================
  getCommunicationLogs: async (): Promise<CommunicationLog[]> => {
    if (isAuthAndReady()) {
      const p = 'comm_logs';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as CommunicationLog));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<CommunicationLog>(KEYS.COMM_LOGS).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  createCommunicationLogBatch: async (logs: Omit<CommunicationLog, 'id'>[]): Promise<CommunicationLog[]> => {
    const saved: CommunicationLog[] = [];
    const timestamp = new Date().toISOString();
    
    if (isAuthAndReady()) {
      const p = 'comm_logs';
      for (const log of logs) {
        try {
          const docRef = await addDoc(collection(db, p), { ...log, timestamp });
          saved.push({ ...log, id: docRef.id, timestamp });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, p);
        }
      }
      return saved;
    }

    const current = ls.get<CommunicationLog>(KEYS.COMM_LOGS);
    for (const log of logs) {
      const item: CommunicationLog = {
        ...log,
        id: 'comm_' + Math.random().toString(36).substr(2, 9),
        timestamp
      };
      current.unshift(item);
      saved.push(item);
    }
    ls.set(KEYS.COMM_LOGS, current);
    return saved;
  },

  clearCommunicationLogs: async (): Promise<void> => {
    if (isAuthAndReady()) {
      const p = 'comm_logs';
      try {
        const q = await getDocs(collection(db, p));
        for (const docSnapshot of q.docs) {
          await deleteDoc(docSnapshot.ref);
        }
        return;
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, p);
      }
    }
    ls.set(KEYS.COMM_LOGS, []);
  },

  // ==========================================
  // TIMETABLES
  // ==========================================
  getTimetables: async (): Promise<Timetable[]> => {
    if (isAuthAndReady()) {
      const p = 'timetables';
      try {
        const q = await getDocs(collection(db, p));
        return q.docs.map(d => ({ id: d.id, ...d.data() } as Timetable));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, p);
      }
    }
    return ls.get<Timetable>(KEYS.TIMETABLES);
  },

  saveTimetable: async (timetable: Timetable): Promise<Timetable> => {
    if (isAuthAndReady()) {
      const p = `timetables`;
      try {
        await setDoc(doc(db, p, timetable.id), timetable);
        return timetable;
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `${p}/${timetable.id}`);
      }
    }
    const current = ls.get<Timetable>(KEYS.TIMETABLES);
    const existingIdx = current.findIndex(t => t.id === timetable.id);
    if (existingIdx > -1) {
      current[existingIdx] = timetable;
    } else {
      current.push(timetable);
    }
    ls.set(KEYS.TIMETABLES, current);
    return timetable;
  },

  deleteTimetable: async (id: string): Promise<void> => {
    if (isAuthAndReady()) {
      const p = `timetables/${id}`;
      try {
        await deleteDoc(doc(db, 'timetables', id));
        return;
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, p);
      }
    }
    const current = ls.get<Timetable>(KEYS.TIMETABLES).filter(t => t.id !== id);
    ls.set(KEYS.TIMETABLES, current);
  }
};
