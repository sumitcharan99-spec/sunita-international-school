/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NoticeBoard from './components/NoticeBoard';
import AdminPortal from './components/AdminPortal';
import TeacherPortal from './components/TeacherPortal';
import StudentParentPortal from './components/StudentParentPortal';
import EnquiryForm from './components/EnquiryForm';
import AcademicCalendar from './components/AcademicCalendar';
import AppDownloadModal from './components/AppDownloadModal';
import { dataService } from './lib/dataService';
import SchoolLogo from './components/SchoolLogo';
import { 
  auth, 
  isFirebaseEnabled, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  User, 
  Notice, 
  Homework, 
  Attendance, 
  FeeInvoice, 
  ExamResult, 
  AdmissionEnquiry, 
  UserRole,
  CalendarEvent,
  CertificateRequest,
  CertificateStatus,
  Timetable
} from './types';
import { 
  BellRing, 
  HelpingHand, 
  Info, 
  CheckCircle, 
  Laptop,
  GraduationCap,
  UserCog,
  X,
  Save,
  Mail,
  Phone,
  MapPin,
  Key
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // PWA & Download State variables
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Database States
  const [notices, setNotices] = useState<Notice[]>([]);
  const [homeworkItems, setHomeworkItems] = useState<Homework[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [fees, setFees] = useState<FeeInvoice[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);

  // Page level loaded status
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Edit Profile Modal States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileEmail, setEditProfileEmail] = useState('');
  const [editProfilePhone, setEditProfilePhone] = useState('');
  const [editProfileLoading, setEditProfileLoading] = useState(false);

  // Credentials Session States
  const [sessionStaffUser, setSessionStaffUser] = useState<User | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [loginStaffId, setLoginStaffId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Load all entities from data service on launch
  const loadDatabase = async () => {
    setLoading(true);
    try {
      const [_users, _notices, _homework, _attendance, _fees, _results, _enquiries, _events, _certs, _timetables] = await Promise.all([
        dataService.getUsers(),
        dataService.getNotices(),
        dataService.getHomework(),
        dataService.getAttendance(),
        dataService.getFeesInvoices(),
        dataService.getExamResults(),
        dataService.getAdmissionEnquiries(),
        dataService.getCalendarEvents(),
        dataService.getCertificateRequests(),
        dataService.getTimetables()
      ]);

      setUsers(_users);
      setNotices(_notices);
      setHomeworkItems(_homework);
      setAttendanceLogs(_attendance);
      setFees(_fees);
      setResults(_results);
      setEnquiries(_enquiries);
      setCalendarEvents(_events || []);
      setCertificateRequests(_certs || []);
      setTimetables(_timetables || []);
    } catch (err) {
      console.error('Failure parsing data from server:', err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for Progressive Web App installation prompts
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default mini-infobar from appearing
      e.preventDefault();
      // Store event so we can trigger it later on request
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerNativeInstall = async () => {
    if (!deferredPrompt) return;
    // Show the native browser install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA install prompt: ${outcome}`);
    // Clear deferred prompt since it can only be used once
    setDeferredPrompt(null);
  };

  // Listen for user auth changes; fall back to local load if Firebase disabled
  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUserEmail(user.email || 'user@sunita.edu');
        } else {
          setCurrentUserEmail(null);
        }
        loadDatabase();
      });
      return () => unsubscribe();
    } else {
      loadDatabase();
    }
  }, []);

  // Sync user profile matching current role to firestore
  useEffect(() => {
    const syncUserProfile = async () => {
      if (isFirebaseEnabled && auth && auth.currentUser) {
        try {
          const profile: User = {
            id: auth.currentUser.uid,
            name: getProfileName(),
            email: auth.currentUser.email || 'user@sunita.edu',
            role: currentRole,
            classId: currentRole === 'teacher' ? 'Class 10A' : currentRole === 'student' ? 'Class 10A' : undefined,
            studentId: (currentRole === 'parent' || currentRole === 'student') ? 'student_demo' : undefined,
            phone: '+91 98765 43210'
          };
          await dataService.saveUser(profile);
          const freshUsers = await dataService.getUsers();
          setUsers(freshUsers);
        } catch (e) {
          console.error('Profile synchronization bypassed due to active rule checks:', e);
        }
      }
    };
    syncUserProfile();
  }, [currentRole, currentUserEmail]);

  const handleSignIn = async () => {
    if (!isFirebaseEnabled || !auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Sign In failed:', err);
    }
  };

  const handleSignOut = async () => {
    if (!isFirebaseEnabled || !auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  // Map user profile name details
  const getProfileName = () => {
    if (sessionStaffUser) {
      return sessionStaffUser.name;
    }
    const matched = users.find(u => {
      if (isFirebaseEnabled && auth && auth.currentUser) {
        return u.id === auth.currentUser.uid;
      }
      return u.role === currentRole;
    });
    if (matched) return matched.name;

    switch (currentRole) {
      case 'admin':
        return 'Mrs. Sunita Sharma';
      case 'teacher':
        return 'Mr. Arvind Verma';
      case 'parent':
        return 'Mr. Ramesh Sharma';
      case 'student':
        return 'Rahul Sharma';
    }
  };

  const getCurrentUserContact = () => {
    if (sessionStaffUser) {
      return {
        name: sessionStaffUser.name,
        email: sessionStaffUser.email || 'user@sunita.edu',
        phone: sessionStaffUser.phone || '+91 98765 43210'
      };
    }
    const matched = users.find(u => {
      if (isFirebaseEnabled && auth && auth.currentUser) {
        return u.id === auth.currentUser.uid;
      }
      return u.role === currentRole;
    });

    if (matched) {
      return {
        name: matched.name,
        email: matched.email || 'user@sunita.edu',
        phone: matched.phone || '+91 98765 43210'
      };
    }

    switch (currentRole) {
      case 'admin':
        return { name: 'Mrs. Sunita Sharma', email: 'admin@sunita.edu', phone: '+91 98765 43210' };
      case 'teacher':
        return { name: 'Mr. Arvind Verma', email: 'teacher@sunita.edu', phone: '+91 98765 43211' };
      case 'parent':
        return { name: 'Mr. Ramesh Sharma', email: 'parent@sunita.edu', phone: '+91 98765 43212' };
      case 'student':
        return { name: 'Rahul Sharma', email: 'student@sunita.edu', phone: '+91 98765 43213' };
    }
  };

  const openEditProfileModal = () => {
    const contacts = getCurrentUserContact();
    setEditProfileName(contacts.name);
    setEditProfileEmail(contacts.email);
    setEditProfilePhone(contacts.phone);
    setShowEditProfileModal(true);
  };

  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileLoading(true);
    try {
      const matched = users.find(u => {
        if (isFirebaseEnabled && auth && auth.currentUser) {
          return u.id === auth.currentUser.uid;
        }
        return u.role === currentRole;
      });

      const userId = (isFirebaseEnabled && auth && auth.currentUser) 
        ? auth.currentUser.uid 
        : `${currentRole}_demo`;

      const updatedUser: User = {
        id: matched?.id || userId,
        role: matched?.role || currentRole,
        classId: matched?.classId || (currentRole === 'teacher' ? 'Class 10A' : currentRole === 'student' ? 'Class 10A' : undefined),
        studentId: matched?.studentId || ((currentRole === 'parent' || currentRole === 'student') ? 'student_demo' : undefined),
        admissionNo: matched?.admissionNo,
        rollNo: matched?.rollNo,
        name: editProfileName,
        email: editProfileEmail,
        phone: editProfilePhone
      };

      await dataService.saveUser(updatedUser);
      const freshUsers = await dataService.getUsers();
      setUsers(freshUsers);

      if (isFirebaseEnabled && auth && auth.currentUser && auth.currentUser.uid === updatedUser.id) {
        setCurrentUserEmail(updatedUser.email);
      }

      setShowEditProfileModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setEditProfileLoading(false);
    }
  };

  // Handlers for Admin actions
  const handleSaveStaffMember = async (staffUser: User) => {
    try {
      await dataService.saveUser(staffUser);
      const freshUsers = await dataService.getUsers();
      setUsers(freshUsers);
    } catch (err) {
      console.error('Failed to save staff member to application states:', err);
      throw err;
    }
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const sId = loginStaffId.trim();
    const pWord = loginPassword.trim();

    if (!sId || !pWord) {
      setLoginError('Both unique ID and password are required.');
      return;
    }

    // Lookup user (with unique ID)
    const foundUser = users.find(u => u.id.trim() === sId);
    if (!foundUser) {
      setLoginError('No registered profile matches this ID.');
      return;
    }

    if (!foundUser.password || foundUser.password.trim() !== pWord) {
      setLoginError('Incorrect password.');
      return;
    }

    // Success Authentication
    setSessionStaffUser(foundUser);
    setCurrentRole(foundUser.role);
    
    // Auto route tabs
    if (foundUser.role === 'admin') setActiveTab('dashboard');
    else if (foundUser.role === 'teacher') setActiveTab('attendance');
    else if (foundUser.role === 'parent') setActiveTab('overview');
    else setActiveTab('dashboard');

    setShowCredentialsModal(false);
    setLoginStaffId('');
    setLoginPassword('');
  };

  const handleLogoutCredentials = () => {
    setSessionStaffUser(null);
    setCurrentRole('admin');
    setActiveTab('dashboard');
  };

  const handleAddNotice = async (
    notice: Omit<Notice, 'id' | 'createdAt'>,
    dispatchSms = false,
    dispatchWhatsapp = false
  ) => {
    const item = await dataService.createNotice({
      ...notice,
      createdAt: new Date().toISOString()
    });
    setNotices(prev => [item, ...prev]);

    // Automatic dispatch if selected
    if (dispatchSms || dispatchWhatsapp) {
      try {
        let targets = users.filter(u => {
          if (notice.targetGroup === 'all') return u.role === 'parent' || u.role === 'teacher';
          return u.role === notice.targetGroup;
        });

        if (targets.length === 0) {
          targets = [
            { id: 'sb_1', name: 'Mr. Ramesh Sharma', role: 'parent', email: 'ramesh@demo.com', phone: '+91 98765 43212' },
            { id: 'sb_2', name: 'Mrs. Aditi Sen', role: 'parent', email: 'aditi@demo.com', phone: '+91 98765 43213' },
            { id: 'sb_3', name: 'Dr. Vivek Anand', role: 'parent', email: 'vivek@demo.com', phone: '+91 98765 43214' },
            { id: 'sb_4', name: 'Mr. Arvind Verma', role: 'teacher', email: 'arvind@demo.com', phone: '+91 98765 43211' }
          ].filter(u => notice.targetGroup === 'all' || u.role === notice.targetGroup);
        }

        const medium: 'sms' | 'whatsapp' | 'both' = (dispatchSms && dispatchWhatsapp) ? 'both' : (dispatchSms ? 'sms' : 'whatsapp');

        const logsToSave = targets.map(t => {
          const bodyPrefix = medium === 'both' ? 'SMS & WHATSAPP Alert: ' : (medium === 'sms' ? 'SMS Alert: ' : 'WhatsApp Alert: ');
          const formattedBody = `${bodyPrefix}Circular "${notice.title}" released by ${notice.authorName}. Content: ${notice.content.slice(0, 100)}...`;
          
          return {
            recipientName: t.name,
            recipientPhone: t.phone || '+91 99911 22334',
            recipientRole: t.role,
            messageType: medium,
            messageContent: formattedBody,
            status: 'delivered' as const,
            timestamp: new Date().toISOString(),
            noticeTitle: notice.title,
            isManual: false
          };
        });

        await dataService.createCommunicationLogBatch(logsToSave);
      } catch (err) {
        console.error("Automatic notice alert broadcast failed:", err);
      }
    }
  };

  const handleQuickBroadcast = async (notice: Notice, channels: 'sms' | 'whatsapp' | 'both') => {
    try {
      let targets = users.filter(u => {
        if (notice.targetGroup === 'all') return u.role === 'parent' || u.role === 'teacher';
        return u.role === notice.targetGroup;
      });

      if (targets.length === 0) {
        targets = [
          { id: 'sb_1', name: 'Mr. Ramesh Sharma', role: 'parent', email: 'ramesh@demo.com', phone: '+91 98765 43212' },
          { id: 'sb_2', name: 'Mrs. Aditi Sen', role: 'parent', email: 'aditi@demo.com', phone: '+91 98765 43213' },
          { id: 'sb_3', name: 'Dr. Vivek Anand', role: 'parent', email: 'vivek@demo.com', phone: '+91 98765 43214' },
          { id: 'sb_4', name: 'Mr. Arvind Verma', role: 'teacher', email: 'arvind@demo.com', phone: '+91 98765 43211' }
        ].filter(u => notice.targetGroup === 'all' || u.role === notice.targetGroup);
      }

      const logsToSave = targets.map(t => {
        const bodyPrefix = channels === 'both' ? 'Instant SMS & WhatsApp Alert: ' : (channels === 'sms' ? 'Instant SMS Blast: ' : 'Instant WhatsApp Dispatch: ');
        const formattedBody = `${bodyPrefix}Important Update! Circular No. #${notice.id} - "${notice.title}". Please log in to review the details.`;
        
        return {
          recipientName: t.name,
          recipientPhone: t.phone || '+91 99911 22334',
          recipientRole: t.role,
          messageType: channels,
          messageContent: formattedBody,
          status: 'delivered' as const,
          timestamp: new Date().toISOString(),
          noticeTitle: notice.title,
          isManual: true
        };
      });

      await dataService.createCommunicationLogBatch(logsToSave);
    } catch (e) {
      console.error("Quick manual single-click communication broadcast failed:", e);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    await dataService.deleteNotice(id);
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const handleUpdateEnquiryStatus = async (id: string, status: AdmissionEnquiry['status']) => {
    await dataService.updateEnquiryStatus(id, status);
    // Reload enquiries
    const fresh = await dataService.getAdmissionEnquiries();
    setEnquiries(fresh);
  };

  const handleCreateFeeInvoice = async (invoice: Omit<FeeInvoice, 'id'>) => {
    const item = await dataService.createFeeInvoice(invoice);
    setFees(prev => [...prev, item]);
  };

  // Handlers for Teacher actions
  const handleMarkAttendance = async (records: Omit<Attendance, 'id'>[]) => {
    const saved = await dataService.markAttendanceBatch(records);
    // Overwrite logs state
    const fresh = await dataService.getAttendance();
    setAttendanceLogs(fresh);
  };

  const handleAddHomework = async (hw: Omit<Homework, 'id' | 'submissionsCount'>) => {
    const item = await dataService.createHomework(hw);
    setHomeworkItems(prev => [item, ...prev]);
  };

  const handleAddExamResult = async (res: Omit<ExamResult, 'id'>) => {
    const item = await dataService.createExamResult(res);
    setResults(prev => [...prev, item]);
  };

  const handleCreateCalendarEvent = async (evt: Omit<CalendarEvent, 'id'>) => {
    const item = await dataService.createCalendarEvent(evt);
    setCalendarEvents(prev => [...prev, item]);
  };

  const handleDeleteCalendarEvent = async (id: string) => {
    await dataService.deleteCalendarEvent(id);
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  // Certificate handlers
  const handleCreateCertificateRequest = async (req: Omit<CertificateRequest, 'id' | 'status' | 'dateRequested'>) => {
    const item = await dataService.createCertificateRequest(req);
    setCertificateRequests(prev => [item, ...prev]);
  };

  const handleUpdateCertificateStatus = async (id: string, status: CertificateStatus) => {
    await dataService.updateCertificateStatus(id, status, getProfileName());
    const fresh = await dataService.getCertificateRequests();
    setCertificateRequests(fresh);
  };

  // Handlers for Student/Parent Actions
  const handlePayFee = async (id: string, transactionId: string) => {
    await dataService.payFeeInvoice(id, transactionId);
    // Reload fees items
    const fresh = await dataService.getFeesInvoices();
    setFees(fresh);
  };

  const handleSubmitEnquiry = async (enq: Omit<AdmissionEnquiry, 'id' | 'status' | 'date'>) => {
    const item = await dataService.createAdmissionEnquiry(enq);
    setEnquiries(prev => [item, ...prev]);
  };

  // Active Teacher details
  const mockTeacherUser: User = {
    id: 'teacher_demo',
    name: 'Mr. Arvind Verma',
    email: 'teacher@sunita.edu',
    role: 'teacher',
    classId: 'Class 10A'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Primary Navigation System */}
      <Header
        currentRole={currentRole}
        onChangeRole={(role) => {
          setSessionStaffUser(null);
          setCurrentRole(role);
        }}
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        userName={getProfileName()}
        isFirebaseEnabled={isFirebaseEnabled}
        currentUserEmail={currentUserEmail}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onTriggerCredentialLogin={() => setShowCredentialsModal(true)}
        onOpenDownloadCenter={() => setShowDownloadModal(true)}
      />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-[#0B2545] animate-spin" />
          <p className="text-sm font-mono text-slate-500 font-bold">Synchronizing Sunita Int. School Workspace Databases...</p>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          
          {/* Unified Profile Header with 'Edit Profile' Trigger */}
          {activeTab !== 'home' && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0B2545] text-[#EEB902] font-black text-lg flex items-center justify-center shadow-inner">
                  {getProfileName().charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-[#0B2545]">{getProfileName()}</h2>
                    <span className="p-0.5 px-2 bg-[#EEB902]/15 border border-[#EEB902]/35 rounded text-[9px] font-black uppercase text-[#0B2545] tracking-wider font-mono">
                      {currentRole} Session
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600">Email:</span> {getCurrentUserContact().email}
                    </span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600">Phone:</span> {getCurrentUserContact().phone}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {sessionStaffUser && (
                  <button
                    onClick={handleLogoutCredentials}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Logout from this secure staff session"
                  >
                    Logout Credentials
                  </button>
                )}
                <button
                  onClick={openEditProfileModal}
                  className="bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-extrabold text-xs py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs self-start md:self-auto hover:text-slate-950 hover:border-slate-350"
                >
                  <UserCog className="w-4 h-4 text-[#EEB902]" />
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* Active Workspaces Routing rendering */}
          {activeTab === 'home' && (
            <div className="space-y-10">
              <EnquiryForm onSubmitEnquiry={handleSubmitEnquiry} />
            </div>
          )}

          {activeTab === 'calendar' && (
            <AcademicCalendar
              currentRole={currentRole}
              events={calendarEvents}
              onCreateEvent={handleCreateCalendarEvent}
              onDeleteEvent={handleDeleteCalendarEvent}
              userName={getProfileName()}
            />
          )}

          {currentRole === 'admin' && activeTab !== 'home' && activeTab !== 'calendar' && (
            <div>
              {activeTab === 'dashboard' && (
                <AdminPortal
                  enquiries={enquiries}
                  fees={fees}
                  users={users}
                  onUpdateEnquiryStatus={handleUpdateEnquiryStatus}
                  onCreateFeeInvoice={handleCreateFeeInvoice}
                  attendanceLogs={attendanceLogs}
                  certificateRequests={certificateRequests}
                  onUpdateCertificateStatus={handleUpdateCertificateStatus}
                  onSaveUser={handleSaveStaffMember}
                />
              )}
              {activeTab === 'enquiries' && (
                <AdminPortal
                  enquiries={enquiries}
                  fees={fees}
                  users={users}
                  onUpdateEnquiryStatus={handleUpdateEnquiryStatus}
                  onCreateFeeInvoice={handleCreateFeeInvoice}
                  attendanceLogs={attendanceLogs}
                  certificateRequests={certificateRequests}
                  onUpdateCertificateStatus={handleUpdateCertificateStatus}
                  onSaveUser={handleSaveStaffMember}
                />
              )}
              {activeTab === 'fees' && (
                <AdminPortal
                  enquiries={enquiries}
                  fees={fees}
                  users={users}
                  onUpdateEnquiryStatus={handleUpdateEnquiryStatus}
                  onCreateFeeInvoice={handleCreateFeeInvoice}
                  attendanceLogs={attendanceLogs}
                  certificateRequests={certificateRequests}
                  onUpdateCertificateStatus={handleUpdateCertificateStatus}
                  onSaveUser={handleSaveStaffMember}
                />
              )}
              {activeTab === 'notices' && (
                <NoticeBoard
                  notices={notices}
                  currentRole={currentRole}
                  authorName={getProfileName()}
                  onAddNotice={handleAddNotice}
                  onDeleteNotice={handleDeleteNotice}
                  onQuickBroadcast={handleQuickBroadcast}
                />
              )}
            </div>
          )}

          {currentRole === 'teacher' && activeTab !== 'home' && activeTab !== 'calendar' && (
            <div>
              {activeTab === 'attendance' && (
                <TeacherPortal
                  attendanceLogs={attendanceLogs}
                  onMarkAttendance={handleMarkAttendance}
                  onAddHomework={handleAddHomework}
                  onAddExamResult={handleAddExamResult}
                  currentUser={mockTeacherUser}
                  certificateRequests={certificateRequests}
                  onCreateCertificateRequest={handleCreateCertificateRequest}
                />
              )}
              {activeTab === 'homework' && (
                <TeacherPortal
                  attendanceLogs={attendanceLogs}
                  onMarkAttendance={handleMarkAttendance}
                  onAddHomework={handleAddHomework}
                  onAddExamResult={handleAddExamResult}
                  currentUser={mockTeacherUser}
                  certificateRequests={certificateRequests}
                  onCreateCertificateRequest={handleCreateCertificateRequest}
                />
              )}
              {activeTab === 'results' && (
                <TeacherPortal
                  attendanceLogs={attendanceLogs}
                  onMarkAttendance={handleMarkAttendance}
                  onAddHomework={handleAddHomework}
                  onAddExamResult={handleAddExamResult}
                  currentUser={mockTeacherUser}
                  certificateRequests={certificateRequests}
                  onCreateCertificateRequest={handleCreateCertificateRequest}
                />
              )}
              {activeTab === 'notices' && (
                <NoticeBoard
                  notices={notices}
                  currentRole={currentRole}
                  authorName={getProfileName()}
                  onAddNotice={handleAddNotice}
                  onDeleteNotice={handleDeleteNotice}
                  onQuickBroadcast={handleQuickBroadcast}
                />
              )}
            </div>
          )}

          {/* Unified Student & Parent portal experience */}
          {(currentRole === 'student' || currentRole === 'parent') && activeTab !== 'home' && activeTab !== 'calendar' && (
            <StudentParentPortal
              currentRole={currentRole}
              attendanceLogs={attendanceLogs}
              homeworkItems={homeworkItems}
              fees={fees}
              results={results}
              onPayFee={handlePayFee}
              studentName="Rahul Sharma"
              notices={notices}
              certificateRequests={certificateRequests}
              onCreateCertificateRequest={handleCreateCertificateRequest}
              timetables={timetables}
            />
          )}

        </main>
      )}

      {/* Elegant Academic Footer */}
      <footer className="bg-[#0B2545] text-white border-t-4 border-[#EEB902] py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-750 pb-8 mb-6 text-left">
          
          {/* Logo and brief description */}
          <div className="space-y-4">
            <SchoolLogo size="sm" />
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm">
              Nurturing smart minds and shaping future pioneers through high-cognition training, world-class experimental laboratories, and global day-boarding standards.
            </p>
          </div>

          {/* Quick Contact columns */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#EEB902] uppercase tracking-widest font-mono">Contact Coordinates</h4>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#EEB902] shrink-0 mt-0.5" />
                <span>+91 80570 92976<br />+91 84334 17870</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#EEB902] shrink-0" />
                <a href="mailto:sunitainternationalmbd@gmail.com" className="hover:underline hover:text-white">sunitainternationalmbd@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Physical Address columns */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#EEB902] uppercase tracking-widest font-mono">School Location</h4>
            <div className="flex items-start gap-2 text-xs font-mono text-slate-300 leading-normal">
              <MapPin className="w-4 h-4 text-[#EEB902] shrink-0 mt-0.5" />
              <span>
                Salempur Bangar,<br />
                Post Agwanpur, Moradabad,<br />
                Uttar Pradesh - 244001
              </span>
            </div>
          </div>

        </div>

        {/* Lower bar */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-450">
          <span>&copy; {new Date().getFullYear()} Sunita International School. All Rights Reserved.</span>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">
              Secure Cloud Firestore Active
            </span>
          </div>
        </div>
      </footer>

      {/* Edit Profile Modal Dialog */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
            
            {/* Modal Header */}
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between border-b-4 border-[#EEB902]">
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-[#EEB902]" />
                <h3 className="font-bold text-xs tracking-wider uppercase">Update Profile Contacts</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-300 hover:text-white transition duration-150 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfileChanges} className="p-5 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">
                  Full Profile Name
                </label>
                <input
                  type="text"
                  required
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  className="w-full text-xs font-semibold text-[#0B2545] border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] focus:border-[#0B2545] transition-all"
                  placeholder="e.g. Mrs. Sunita Sharma"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">
                  Contact Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editProfileEmail}
                  onChange={(e) => setEditProfileEmail(e.target.value)}
                  className="w-full text-xs font-semibold text-[#0B2545] border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] focus:border-[#0B2545] transition-all"
                  placeholder="e.g. contact@sunita.edu"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={editProfilePhone}
                  onChange={(e) => setEditProfilePhone(e.target.value)}
                  className="w-full text-xs font-semibold text-[#0B2545] border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] focus:border-[#0B2545] transition-all"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-3.5 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editProfileLoading}
                  className="px-4 py-1.5 text-[11px] font-black text-[#0B2545] bg-[#EEB902] hover:bg-yellow-400 rounded shadow-xs transition duration-150 flex items-center gap-1.5 cursor-pointer"
                >
                  {editProfileLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#0B2545]/20 border-t-[#0B2545] rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {editProfileLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* Secure Credentials Login Modal Dialog */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
            
            {/* Modal Header */}
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between border-b-4 border-emerald-500">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#EEB902]" />
                <h3 className="font-bold text-xs tracking-wider uppercase">Staff Account Login</h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowCredentialsModal(false);
                  setLoginError(null);
                }}
                className="text-slate-300 hover:text-white transition duration-150 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCredentialsLogin} className="p-5 space-y-4 text-left">
              <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed font-sans">
                Enter your unique Staff Access ID & personalized passcode credentials generated by the School Administrator.
              </p>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
                  ⚠️ {loginError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">
                  Access Username / Staff ID
                </label>
                <input
                  type="text"
                  required
                  value={loginStaffId}
                  onChange={(e) => setLoginStaffId(e.target.value)}
                  className="w-full text-xs font-bold text-[#0B2545] border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] focus:border-[#0B2545] font-mono tracking-wider"
                  placeholder="e.g. SIS-TCH-1025 or admin_demo"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">
                  Private Security Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs font-bold text-[#0B2545] border border-[1px] border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] focus:border-[#0B2545] font-mono tracking-wider"
                  placeholder="e.g. admin123 or teacher123"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setLoginError(null);
                  }}
                  className="px-3.5 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[11px] font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded shadow-sm transition duration-150 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Key className="w-3.5 h-3.5 text-[#EEB902]" />
                  Authenticate
                </button>
              </div>
            </form>

            <div className="bg-slate-50 p-3.5 border-t border-slate-100/70 text-[10.5px] text-slate-500 font-semibold text-center font-mono">
              Authorized Registrar Sign-In Pass: admin_demo &bull; Code: admin123
            </div>

          </div>
        </div>
      )}

      {/* Progressive Web App / Standalone Site & Database Download Center */}
      <AppDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerNativeInstall}
        currentData={{
          users,
          notices,
          homework: homeworkItems,
          attendance: attendanceLogs,
          fees,
          results,
          enquiries,
          events: calendarEvents,
          certs: certificateRequests,
          timetables
        }}
      />

    </div>
  );
}
