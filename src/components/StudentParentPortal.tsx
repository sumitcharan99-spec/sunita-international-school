/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Receipt, 
  BookOpen, 
  Award, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  FileCheck, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  BellRing,
  QrCode,
  Contact,
  Fingerprint,
  Send,
  Printer
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Attendance, Homework, FeeInvoice, ExamResult, UserRole, Notice, CertificateRequest, CertificateType, CertificateStatus, Timetable } from '../types';
import OfficialCertificatePDF from './OfficialCertificatePDF';

const QR_GRID = [
  [1,1,1,1,1,1,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,0,0,1,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0,0],
  [1,1,0,1,0,1,0,1,0,0,1,0,1,1,1,1,0,1,0,0,1],
  [1,0,1,0,1,0,1,1,1,1,0,0,1,0,0,1,0,1,0,1,0],
  [0,0,1,1,0,0,1,0,1,0,1,1,0,0,1,1,1,0,0,1,1],
  [1,1,0,0,1,1,1,0,1,1,0,1,1,0,0,0,1,0,1,0,1],
  [1,0,1,0,0,1,0,1,0,0,1,1,0,1,1,1,0,1,1,1,0],
  [0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,0,0,1],
  [1,1,1,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0],
  [1,0,0,0,0,0,1,0,0,1,1,0,1,1,0,0,1,0,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,1,0,0,0,1,1],
  [1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,1,0],
  [1,0,1,1,1,0,1,0,0,0,1,1,0,1,1,1,0,1,0,1,0],
  [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,1,1,0,0,1],
  [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,1,1,1,0,1,1]
];

interface StudentParentPortalProps {
  currentRole: UserRole;
  attendanceLogs: Attendance[];
  homeworkItems: Homework[];
  fees: FeeInvoice[];
  results: ExamResult[];
  onPayFee: (id: string, transactionId: string) => Promise<void>;
  studentName: string;
  notices?: Notice[];
  certificateRequests?: CertificateRequest[];
  onCreateCertificateRequest?: (req: Omit<CertificateRequest, 'id' | 'status' | 'dateRequested'>) => Promise<void>;
  timetables?: Timetable[];
}

export default function StudentParentPortal({
  currentRole,
  attendanceLogs,
  homeworkItems,
  fees,
  results,
  onPayFee,
  studentName,
  notices = [],
  certificateRequests = [],
  onCreateCertificateRequest,
  timetables = []
}: StudentParentPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'homework' | 'results' | 'idcard' | 'certificates' | 'timetable'>('overview');
  const [dismissedNotices, setDismissedNotices] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [idCardFace, setIdCardFace] = useState<'front' | 'back'>('front');
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [idToast, setIdToast] = useState<string | null>(null);

  // Timetable State variables & helper methods
  const [filterDay, setFilterDay] = useState<string>('All Days');
  const [searchSubject, setSearchSubject] = useState<string>('');

  const getFilteredTimetables = () => {
    // Filter down to the student's standard class schedules
    const classSlots = timetables.filter(t => t.classId === 'Class 10A');
    return classSlots.filter(t => {
      const matchDay = filterDay === 'All Days' || t.day === filterDay;
      const matchSearch = !searchSubject || t.subject.toLowerCase().includes(searchSubject.toLowerCase());
      return matchDay && matchSearch;
    });
  };

  const getSubjectColor = (subject: string): string => {
    const sj = subject.toLowerCase();
    if (sj.includes('math')) return 'text-blue-700';
    if (sj.includes('sci')) return 'text-emerald-700';
    if (sj.includes('eng')) return 'text-purple-700';
    if (sj.includes('social') || sj.includes('hist')) return 'text-amber-700';
    if (sj.includes('hindi')) return 'text-orange-700';
    if (sj.includes('informatics') || sj.includes('computer')) return 'text-indigo-700';
    if (sj.includes('physical') || sj.includes('sport')) return 'text-sky-700';
    return 'text-slate-800';
  };

  // Certificate Application States
  const [parentCertType, setParentCertType] = useState<'transfer' | 'character'>('transfer');
  const [parentCertReason, setParentCertReason] = useState('');
  const [parentCertDOB, setParentCertDOB] = useState('2011-04-15');
  const [parentCertStudentParent, setParentCertStudentParent] = useState('Mr. Ramesh Sharma');
  const [parentCertLoading, setParentCertLoading] = useState(false);
  const [parentCertSuccess, setParentCertSuccess] = useState(false);
  const [parentSelectedCert, setParentSelectedCert] = useState<CertificateRequest | null>(null);

  const playBeep = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (_) {}
  };

  const triggerToast = (msg: string) => {
    setIdToast(msg);
    setTimeout(() => {
      setIdToast(prev => prev === msg ? null : prev);
    }, 4500);
  };

  // Find active urgent notices matching our target Group
  const urgentNotices = React.useMemo(() => {
    return notices.filter(n => {
      if (!n.isUrgent) return false;
      const targetMatches = n.targetGroup === 'all' || 
        (currentRole === 'student' && n.targetGroup === 'students') ||
        (currentRole === 'parent' && n.targetGroup === 'parents');
      return targetMatches && !dismissedNotices.includes(n.id);
    });
  }, [notices, currentRole, dismissedNotices]);

  // Trigger web push native browser notifications on load/new notice if granted
  React.useEffect(() => {
    if (urgentNotices.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      urgentNotices.forEach(n => {
        try {
          new Notification(`SIS Urgent circular: ${n.title}`, {
            body: n.content.substring(0, 120) + '...',
          });
        } catch (_) {}
      });
    }
  }, [urgentNotices]);

  // Checkout Dialog State
  const [payingInvoice, setPayingInvoice] = useState<FeeInvoice | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [invoiceReceipt, setInvoiceReceipt] = useState<FeeInvoice | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FeeInvoice | null>(null);

  // Homework submission state
  const [submittingHw, setSubmittingHw] = useState<Homework | null>(null);
  const [hwFile, setHwFile] = useState<File | null>(null);
  const [hwText, setHwText] = useState('');
  const [hwSubmitting, setHwSubmitting] = useState(false);
  const [hwSubSuccess, setHwSubSuccess] = useState(false);

  // Filter items specifically for our student 'student_demo'
  const filterStudentId = 'student_demo';
  const myAttendance = attendanceLogs.filter(a => a.studentId === filterStudentId);
  const myFees = fees.filter(f => f.studentId === filterStudentId);
  const myResults = results.filter(r => r.studentId === filterStudentId);
  
  // Calculate academic performance trend stats
  const { chartData, gpaRatio, topSubject } = React.useMemo(() => {
    let topSub = 'N/A';
    let maxPct = -1;
    let sumPercentages = 0;
    
    const mapped = myResults.map(r => {
      const percentage = Math.round((r.marksObtained / r.maxMarks) * 100);
      if (percentage > maxPct) {
        maxPct = percentage;
        topSub = r.subject;
      }
      sumPercentages += percentage;
      
      const classAvgMap: { [key: string]: number } = {
        'Mathematics': 78,
        'Science': 82,
        'English': 75,
        'Social Science': 74
      };
      
      return {
        subject: r.subject,
        'Marks Sec. (%)': percentage,
        'Class Avg. (%)': classAvgMap[r.subject] || 75,
      };
    });

    const averagePct = mapped.length > 0 ? (sumPercentages / mapped.length) : 0;
    // GPA conversion out of 10.0 scale relative to standard 95-100 score ceilings
    const gpa = Number(((averagePct / 100) * 10).toFixed(1));

    return {
      chartData: mapped,
      gpaRatio: gpa > 0 ? gpa.toFixed(1) : '0.0',
      topSubject: topSub
    };
  }, [myResults]);

  const availableSubjects = React.useMemo(() => {
    return Array.from(new Set(chartData.map(d => d.subject)));
  }, [chartData]);

  const filteredChartData = React.useMemo(() => {
    if (selectedSubject === 'all') {
      return chartData;
    }
    return chartData.filter(d => d.subject === selectedSubject);
  }, [chartData, selectedSubject]);
  
  // Calculate attendance ratios
  const presentDays = myAttendance.filter(a => a.status === 'present').length;
  const lateDays = myAttendance.filter(a => a.status === 'late').length;
  const absentDays = myAttendance.filter(a => a.status === 'absent').length;
  const totalDays = myAttendance.length || 1;
  const attendancePercentage = (((presentDays + (lateDays * 0.5)) / totalDays) * 100).toFixed(1);

  // Filter homework for class 10A
  const myHomework = homeworkItems.filter(h => h.classId === 'Class 10A');

  const triggerPayModal = (f: FeeInvoice) => {
    setPayingInvoice(f);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCheckoutSuccess(false);
    setCheckoutLoading(false);
  };

  const handlePayCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setCheckoutLoading(true);

    try {
      // Simulate real bank authorization roundtrip
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedTxnId = 'TXN-SIS-' + Math.floor(10000 + Math.random() * 90000);
      
      await onPayFee(payingInvoice.id, generatedTxnId);
      
      setInvoiceReceipt({
        ...payingInvoice,
        status: 'paid',
        transactionId: generatedTxnId,
        payDate: new Date().toISOString().split('T')[0]
      });

      setCheckoutSuccess(true);
      setPayingInvoice(null);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleHwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw) return;
    setHwSubmitting(true);
    setHwSubSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHwSubSuccess(true);
      // Increment submission locally for client UI satisfaction
      submittingHw.submissionsCount += 1;
      setTimeout(() => {
        setSubmittingHw(null);
        setHwSubSuccess(false);
        setHwText('');
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setHwSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Urgent Notices Push Alerts System */}
      {urgentNotices.length > 0 && (
        <div className="space-y-3 no-print">
          {urgentNotices.map(notice => (
            <div 
              key={notice.id} 
              className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-xl p-4.5 shadow-lg border border-red-500 relative overflow-hidden transition-all duration-300"
            >
              {/* background graphic design */}
              <div className="absolute right-0 top-0 text-white/[0.04] transform translate-y-[-10%] translate-x-[10%] select-none pointer-events-none">
                <AlertTriangle className="w-40 h-40" />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-white/20 rounded-lg text-white shadow-md shrink-0">
                    <BellRing className="w-5.5 h-5.5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-red-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                        URGENT ADMINISTRATIVE ALERT
                      </span>
                      <span className="text-red-100 text-[11px] font-semibold flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        Posted: {notice.date} ({notice.authorName})
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold mt-1 tracking-tight pr-8 text-[#EEB902]">{notice.title}</h3>
                    <p className="text-xs font-semibold line-clamp-3 mt-1 sm:max-w-3xl text-justify text-slate-100 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end md:justify-start">
                  <button
                    onClick={() => {
                      if ('Notification' in window) {
                        Notification.requestPermission().then(permission => {
                          if (permission === 'granted') {
                            new Notification(`Sunita School Alert`, {
                              body: `${notice.title}: ${notice.content.substring(0, 100)}...`,
                            });
                          }
                        });
                      }
                    }}
                    className="bg-white/10 hover:bg-white/25 active:bg-white/30 border border-white/20 text-white font-extrabold text-[10px] sm:text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Request Push Permissions
                  </button>
                  <button
                    onClick={() => setDismissedNotices(prev => [...prev, notice.id])}
                    className="p-1 px-3 bg-red-800/60 hover:bg-red-800/80 text-white hover:text-red-100 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase cursor-pointer"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Student/Parent Nav Bar Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeTab === 'overview' 
              ? 'bg-[#0B2545] text-[#EEB902]' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeTab === 'attendance' 
              ? 'bg-[#0B2545] text-[#EEB902]' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeTab === 'fees' 
              ? 'bg-[#0B2545] text-[#EEB902]' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Tuition Fees
        </button>
        <button
          onClick={() => setActiveTab('homework')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeTab === 'homework' 
              ? 'bg-[#0B2545] text-[#EEB902]' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Worksheets
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeTab === 'results' 
              ? 'bg-[#0B2545] text-[#EEB902]' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          Grades
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeTab === 'timetable' 
              ? 'bg-[#0B2545] text-[#EEB902]' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Timetable
        </button>
        <button
          onClick={() => setActiveTab('idcard')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeTab === 'idcard' 
              ? 'bg-[#0B2545] text-[#EEB902]' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Contact className="w-4 h-4" />
          Digital ID
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeTab === 'certificates' 
              ? 'bg-[#0B2545] text-[#EEB902]' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          Certificates
        </button>
      </div>

      {/* 1. PORTAL OVERVIEW LANDING CONTAINER */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Welcome Alert */}
          <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] rounded-xl text-white p-6 shadow-md border-b-4 border-[#EEB902] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-[#EEB902] text-[#0B2545] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                SIS Academic Space
              </span>
              <h2 className="text-xl md:text-2xl font-bold mt-1">
                {currentRole === 'parent' ? 'Ward Appraisal Workspace' : 'My Student Desk'}
              </h2>
              <p className="text-sm text-slate-200 mt-1">
                Welcome back to Sunita International, reviewing records of <span className="font-bold text-[#EEB902]">{studentName}</span> (Class 10A)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-300">Attendance Index</span>
                <span className="text-xl font-black text-[#EEB902]">{attendancePercentage}%</span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-300">Unpaid bills</span>
                <span className="text-xl font-black text-rose-400">
                  {myFees.filter(f => f.status === 'unpaid').length} Bills
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Class Task checklist */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center justify-between border-b pb-3 mb-4">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#EEB902]" />
                    Pending Homework Assignments
                  </span>
                  <span className="text-[10px] bg-red-50 text-red-700 font-mono py-0.5 px-2 rounded-full font-black uppercase">
                    {myHomework.length} assigned
                  </span>
                </h4>
                <div className="space-y-4">
                  {myHomework.slice(0,2).map(hw => (
                    <div key={hw.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border flex items-start gap-3 transition">
                      <div className="p-2 rounded bg-[#0B2545]/5 text-[#0B2545]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm leading-tight">{hw.title}</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">{hw.subject} | Due: <span className="text-amber-600 font-semibold">{hw.dueDate}</span></p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('homework');
                          setSubmittingHw(hw);
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline py-1 flex items-center gap-0.5"
                      >
                        Submit <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('homework')}
                className="w-full text-center text-xs font-mono font-bold text-[#0B2545] hover:text-[#134074] pt-4 mt-4 border-t border-dashed"
              >
                Go to Homework Portal &rarr;
              </button>
            </div>

            {/* School Tuition Payment block */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center justify-between border-b pb-3 mb-4">
                  <span className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-600" />
                    Outstanding Term Fees
                  </span>
                </h4>
                <div className="space-y-3">
                  {myFees.filter(f => f.status === 'unpaid').map(f => (
                    <div key={f.id} className="p-4 bg-red-50/50 rounded-lg border border-red-200 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-snug">{f.termName}</p>
                        <p className="text-xs text-red-600 mt-1 flex items-center font-mono font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          Due date: {f.dueDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-rose-600 font-mono">₹{f.amount.toLocaleString()}</p>
                        {currentRole === 'parent' && (
                          <button
                            onClick={() => triggerPayModal(f)}
                            className="mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded uppercase tracking-wider cursor-pointer transform transition hover:scale-102"
                          >
                            Pay Dues
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {myFees.filter(f => f.status === 'unpaid').length === 0 && (
                    <div className="text-center py-6 bg-emerald-50/30 border border-emerald-200 rounded-lg text-emerald-800">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                      <p className="text-sm font-bold">Outstanding balance: Nil</p>
                      <p className="text-xs text-slate-400 mt-1">All academic bills have been successfully closed!</p>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('fees')}
                className="w-full text-center text-xs font-mono font-bold text-[#0B2545] hover:text-[#134074] pt-4 mt-4 border-t border-dashed"
              >
                Review Billing Ledger Records &rarr;
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 2. DETAILED ATTENDANCE LOG TIMELINE VIEW */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#0B2545] border-b pb-2">
              Monthly Academic Attendance Logs
            </h3>
            <p className="text-xs text-slate-500 mt-1">Review dates of present, tardy, or leave markings verified by roll call registers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Present Days</span>
              <span className="text-3xl font-black text-green-700">{presentDays}</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Late Arrivals</span>
              <span className="text-3xl font-black text-amber-700">{lateDays}</span>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Leave / Absent days</span>
              <span className="text-3xl font-black text-red-700">{absentDays}</span>
            </div>
          </div>

          <div className="space-y-2 mt-4 max-h-80 overflow-y-auto">
            {myAttendance.length === 0 ? (
              <p className="text-center py-10 text-slate-400 font-mono text-xs">No attendance registers logged for this candidate.</p>
            ) : (
              myAttendance.map((a) => {
                const colors = {
                  present: 'bg-green-100 text-green-800 border-green-200',
                  absent: 'bg-red-100 text-red-800 border-red-200',
                  late: 'bg-amber-100 text-amber-800 border-amber-200'
                }[a.status];
                return (
                  <div key={a.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-md border text-slate-500">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 font-mono">{a.date}</p>
                        {a.remarks && <p className="text-xs text-red-500 font-mono mt-0.5">Remarks: {a.remarks}</p>}
                      </div>
                    </div>
                    <span className={`text-[10px] px-3 py-1 rounded font-bold uppercase ${colors}`}>
                      {a.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. TUITION FEE PAYMENTS & LEDGER */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#0B2545] border-b pb-2">
              Fee Ledger Statement of Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-1">Review active tuition lists, printing tax certificates, and pay pending academic bills safely online.</p>
          </div>

          {/* Ledger history list */}
          <div className="space-y-4">
            {myFees.map((f) => (
              <div key={f.id} className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-200 ${
                f.status === 'paid' 
                  ? 'border-green-200 bg-green-50/10' 
                  : 'border-red-200 bg-red-50/20'
              }`}>
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-lg flex items-center justify-center ${
                    f.status === 'paid' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 leading-snug">{f.termName}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">Bill Reference ID: SIS-INV-{f.id}</p>
                    {f.status === 'paid' ? (
                      <div className="text-[10px] text-green-700 mt-1 space-y-0.5">
                        <p className="font-semibold">Paid online on: <span className="font-mono font-bold">{f.payDate}</span></p>
                        <p className="font-mono">Transaction ID: {f.transactionId}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-600 mt-1 flex items-center font-bold font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        Due date: {f.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Invoice Amount</p>
                    <p className="text-lg font-black text-slate-800 font-mono">₹{f.amount.toLocaleString()}</p>
                  </div>

                  <div>
                    {f.status === 'paid' ? (
                      <div className="flex flex-col sm:items-end gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-800 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Fully Cleared
                        </span>
                        <button
                          onClick={() => setViewingReceipt(f)}
                          className="flex items-center gap-1 text-[11px] text-[#0B2545] font-bold hover:text-emerald-700 hover:underline cursor-pointer transition no-print"
                          title="Save Receipt PDF"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Receipt
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {currentRole === 'parent' ? (
                          <button
                            onClick={() => triggerPayModal(f)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded shadow flex items-center gap-1 transform transition hover:-translate-y-0.5 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" /> Pay Bill Online
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded flex items-center">
                            Unpaid Dues
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PDF Invoice receipt renderer (after payment completion) */}
          {invoiceReceipt && (
            <div className="mt-6 p-6 bg-amber-50/10 border-2 border-dashed border-[#EEB902] rounded-xl flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden animate-fade-in">
              <div className="absolute right-0 top-0 bg-[#EEB902] text-[#0B2545] font-black text-[9px] px-6 py-1 transform rotate-45 translate-x-6 translate-y-2 uppercase tracking-widest leading-none">
                Official
              </div>
              <div>
                <h4 className="font-extrabold text-[#0B2545] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#EEB902]" />
                  Tuition Fee Clearance Receipt
                </h4>
                <p className="text-xs text-slate-500 mt-1">Print copy generated for tax exemptions. A digital copy of this ledger is dispatched to registrar.</p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4 text-xs">
                  <p className="text-slate-500">Student Candidate:</p>
                  <p className="font-bold text-slate-800">{invoiceReceipt.studentName}</p>
                  <p className="text-slate-500">Academic Term:</p>
                  <p className="font-bold text-[#0B2545]">{invoiceReceipt.termName}</p>
                  <p className="text-slate-500">Settled Amount:</p>
                  <p className="font-extrabold text-slate-800 font-mono">₹{invoiceReceipt.amount.toLocaleString()} (INR)</p>
                  <p className="text-slate-500">Receipt Reference:</p>
                  <p className="font-bold font-mono text-emerald-800">{invoiceReceipt.transactionId}</p>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-2.5">
                <button 
                  onClick={() => setViewingReceipt(invoiceReceipt)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Open & Save PDF Receipt
                </button>
                <span className="text-[9px] text-center text-slate-400 font-mono leading-none">Verified Sunita Int. Systems 2026</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. HOMEWORK PORTAL */}
      {activeTab === 'homework' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#0B2545] border-b pb-2">
              Class Homework & Worksheets Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1">Review active subjects directives assigned by respective class teachers, complete problems sets and submit worksheets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myHomework.map((hw) => {
              const hasSubmittedObj = hw.submissionsCount > 1; // Submission active checks
              return (
                <div key={hw.id} className="p-5 bg-slate-50 hover:bg-white rounded-xl border border-slate-250 hover:border-[#0B2545]/40 hover:shadow-md transition duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        {hw.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Issued: {hw.createdAt.split('T')[0]}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-base leading-snug">{hw.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2 text-justify">{hw.description}</p>
                    <p className="text-xs text-amber-600 mt-3 font-mono font-bold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Dealine due date: {hw.dueDate}
                    </p>
                  </div>

                  <div className="border-t pt-4 mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">My Status: 
                      <span className={`ml-1 font-bold ${hw.submissionsCount > 3 ? 'text-green-600' : 'text-amber-500'}`}>
                        {hw.submissionsCount > 3 ? 'Worksheet Submitted' : 'Submission Pending'}
                      </span>
                    </span>
                    {currentRole === 'student' && hw.submissionsCount <= 3 && (
                      <button
                        onClick={() => {
                          setSubmittingHw(hw);
                          setHwSubSuccess(false);
                          setHwText('');
                        }}
                        className="bg-[#0B2545] hover:bg-[#134074] text-white text-[11px] font-bold py-1.5 px-3.5 rounded shadow cursor-pointer transition"
                      >
                        Submit Answers
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit answer worksheet modal overlay */}
          {submittingHw && (
            <div className="fixed inset-0 bg-[#0B2545]/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-extrabold text-[#0B2545] flex items-center gap-1">
                    <FileCheck className="w-5 h-5 text-[#EEB902]" />
                    Submit Worksheet Answers
                  </h4>
                  <button onClick={() => setSubmittingHw(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
                </div>

                <div className="bg-[#0B2545]/5 p-3 rounded text-xs text-slate-600">
                  <p className="font-bold">Worksheet Class: {submittingHw.subject}</p>
                  <p className="mt-0.5 font-bold text-[#0B2545]">{submittingHw.title}</p>
                </div>

                <form onSubmit={handleHwSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Answer explanation / steps details</label>
                    <textarea
                      required
                      rows={4}
                      value={hwText}
                      onChange={e => setHwText(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                      placeholder="Type your brief answers summaries, formula proofs steps, or homework registers index page details..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Upload Homework File (PDF, JPG)</label>
                    <input
                      type="file"
                      onChange={e => setHwFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-xs"
                    />
                  </div>

                  {hwSubSuccess && (
                    <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-xs rounded-md flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Success! Your submission file has been compiled!
                    </div>
                  )}

                  <div className="flex justify-end gap-2.5 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setSubmittingHw(null)}
                      className="text-xs text-slate-500 hover:bg-slate-100 px-3.5 py-1.5 rounded"
                    >
                      Close Portal
                    </button>
                    <button
                      type="submit"
                      disabled={hwSubmitting}
                      className="bg-[#0B2545] hover:bg-[#134074] text-white text-xs font-extrabold px-5 py-1.5 rounded shadow"
                    >
                      {hwSubmitting ? 'Transmitting Answers...' : 'Transmit Worksheet'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. REPORT CARDS & GRADES VIEW */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-3">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545]">
                Academic Results Report Card
              </h3>
              <p className="text-xs text-slate-500 mt-1">Sunita International appraisals system database transcript sheet.</p>
            </div>
            
            <button
              onClick={() => window.print()}
              className="bg-[#0B2545] text-white hover:bg-slate-800 text-xs py-2 px-3.5 rounded flex items-center gap-1 font-bold shadow cursor-pointer border border-[#EEB902]"
            >
              <Download className="w-4 h-4 text-[#EEB902]" /> Print Report Card Transcript
            </button>
          </div>

          {/* Performance Summary Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
            
            {/* Chart Widget - occupying 2 columns */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h4 className="font-bold text-[#0B2545] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600 animate-pulse" />
                    Subject Wise Academic Performance Trends
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Visual plot of subject-wise scores (%) compared against the school class average guidelines.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                  <span className="text-xs font-bold text-slate-500 font-mono uppercase whitespace-nowrap">Filter:</span>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="text-xs font-semibold text-[#0B2545] bg-white border border-slate-300 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0B2545] h-7 cursor-pointer"
                  >
                    <option value="all">All Subjects</option>
                    {availableSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <div className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded border border-emerald-200 uppercase tracking-wider font-mono h-7 flex items-center">
                    Class: 10A
                  </div>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-64 mt-2">
                {filteredChartData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
                    <Award className="w-8 h-8 text-slate-300 mb-1" />
                    No performance data points to plot.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredChartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="subject" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderRadius: '8px', 
                          border: '1px solid #E2E8F0', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px' 
                        }}
                        formatter={(value) => [`${value}%`]}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      <Line 
                        type="monotone" 
                        name="My Secured Score" 
                        dataKey="Marks Sec. (%)" 
                        stroke="#10B981" 
                        strokeWidth={3} 
                        activeDot={{ r: 7 }} 
                        dot={{ stroke: '#10B981', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                      />
                      <Line 
                        type="monotone" 
                        name="Class Average Score" 
                        dataKey="Class Avg. (%)" 
                        stroke="#0B2545" 
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                        dot={{ r: 3, fill: '#0B2545' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Quick Metrics Widget - occupying 1 column */}
            <div className="bg-[#0B2545] text-white p-5 rounded-xl border border-slate-800 flex flex-col justify-between shadow-md relative overflow-hidden">
              {/* background graphic element */}
              <div className="absolute right-0 bottom-0 text-white/[0.03] transform translate-x-1/4 translate-y-1/4 select-none pointer-events-none">
                <Award className="w-48 h-48" />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="border-b border-[#134074] pb-3">
                  <span className="bg-[#EEB902] text-[#0B2545] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    Executive Appraisal
                  </span>
                  <h4 className="text-base font-extrabold mt-1 text-[#EEB902]">Grade Appraisal Summary</h4>
                  <p className="text-xs text-slate-300">Analysis of the student's primary academic indicators.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">GPA Index</span>
                    <span className="text-xl font-black text-white font-mono">{gpaRatio} / 10</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 overflow-hidden">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Subject</span>
                    <span className="text-xs font-black text-emerald-400 truncate block mt-1" title={topSubject}>{topSubject}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 col-span-2">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Placement</span>
                    <span className="text-xs font-semibold text-slate-200 mt-1 block">First Division Distinction</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#134074] mt-4 flex items-center justify-between relative z-10">
                <span className="text-[10px] font-mono text-[#EEB902]">Status: VERIFIED</span>
                <span className="text-[9px] font-mono text-slate-400">Sunita Int. Boards</span>
              </div>
            </div>

          </div>

          {/* Transcript Grade sheet card */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] text-white p-5 border-b-2 border-[#EEB902]">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="block text-xs uppercase font-black text-[#EEB902] font-mono tracking-wider">Sunita International Examination board Transcript</span>
                  <h4 className="text-lg font-bold mt-1">Rahul Sharma</h4>
                  <p className="text-xs text-slate-300">Registration Roll No: SIS-2024-041/24 | Grade: Class 10A</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] uppercase text-slate-300 font-bold">Overall Term Valuation</span>
                  <p className="text-lg font-black text-[#EEB902]">Mid-Term Appraisal</p>
                  <p className="text-xs text-slate-400">Result status: <span className="text-green-400 font-extrabold uppercase">Pass</span></p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-black text-xs uppercase border-b border-slate-200">
                    <th className="p-3">Course / Subject Description</th>
                    <th className="p-3">Max Marks Scale</th>
                    <th className="p-3">Marks Secured</th>
                    <th className="p-3">Percentage Ratio</th>
                    <th className="p-3">Letter Grade</th>
                    <th className="p-3">Instructor Remark Statements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {myResults.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 font-mono text-slate-400 text-xs">No examination results transcripts tabulated.</td>
                    </tr>
                  ) : (
                    myResults.map((res) => {
                      const pct = ((res.marksObtained / res.maxMarks) * 100);
                      const isHigh = pct >= 80;
                      return (
                        <tr key={res.id} className="hover:bg-slate-50/20">
                          <td className="p-3 font-bold text-[#0B2545]">{res.subject}</td>
                          <td className="p-3 font-mono font-bold text-slate-500">{res.maxMarks}</td>
                          <td className="p-3 font-mono font-black text-slate-800">{res.marksObtained}</td>
                          <td className="p-3 font-mono font-bold">{pct.toFixed(0)}%</td>
                          <td className="p-3">
                            <span className={`inline-block text-xs font-black min-w-[28px] text-center px-1.5 py-0.5 rounded font-mono ${
                              isHigh ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {res.grade}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-slate-500 italic max-w-xs">{res.remarks}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Scale appraisal weights card */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-400 flex flex-col md:flex-row justify-between gap-4 font-mono">
              <p>Grading Standard: A+ (90-100%), A (80-89%), B+ (70-79%), B (60-69%), C+ (50-59%)</p>
              <p className="text-slate-500 text-left md:text-right font-bold text-[10px]">VERIFIED REGISTRAR DESK SUNITA INTL.</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. DIGITAL ID CARD VIEW */}
      {activeTab === 'idcard' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-3">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-2">
                <Contact className="w-5 h-5 text-[#EEB902]" />
                Digital ID Credential Card
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Official encrypted smart ID card suitable for campus gates access & NFC check-in verification.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-[#0B2545] text-white hover:bg-slate-800 text-xs py-2 px-3.5 rounded flex items-center gap-1 font-bold shadow cursor-pointer border border-[#EEB902] no-print"
            >
              <Download className="w-4 h-4 text-[#EEB902]" /> Print ID Badge
            </button>
          </div>

          {idToast && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-xs font-bold leading-relaxed shadow-sm animate-pulse flex items-center gap-2 no-print">
              <span className="p-1 px-1.5 bg-indigo-600 text-white text-[9px] uppercase font-mono rounded font-black shrink-0">Security Handshake</span>
              {idToast}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: ID Card stage */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/70 border border-slate-200 rounded-2xl relative overflow-hidden">
              <div className="absolute top-3 right-3 flex bg-emerald-500 text-white text-[8px] font-mono px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs select-none no-print">
                NFC RFID PASS
              </div>

              {/* Face selectors */}
              <div className="flex gap-2 mb-5 w-full justify-center no-print">
                <button
                  type="button"
                  onClick={() => setIdCardFace('front')}
                  className={`text-[10px] uppercase font-mono font-black px-3.5 py-1.5 rounded-md transition ${
                    idCardFace === 'front'
                      ? 'bg-[#0B2545] text-[#EEB902]'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Front Design
                </button>
                <button
                  type="button"
                  onClick={() => setIdCardFace('back')}
                  className={`text-[10px] uppercase font-mono font-black px-3.5 py-1.5 rounded-md transition ${
                    idCardFace === 'back'
                      ? 'bg-[#0B2545] text-[#EEB902]'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Back Design
                </button>
              </div>

              {/* Plastic Card visual container */}
              <div 
                onClick={() => setIdCardFace(prev => prev === 'front' ? 'back' : 'front')}
                className="w-full max-w-[280px] aspect-[1/1.58] rounded-2xl shadow-2xl border border-slate-205 cursor-pointer select-none overflow-hidden relative transition-all duration-300 transform hover:scale-[1.03] hover:shadow-cyan-500/5 flex flex-col justify-between"
                title="Click to flip the card!"
              >
                {idCardFace === 'front' ? (
                  <div className="h-full w-full bg-gradient-to-b from-[#0B2545] via-[#10305B] to-[#16437A] flex flex-col justify-between text-white relative">
                    <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-[#0B2545]/20 to-[#0B2545]/80 opacity-30 pointer-events-none" />
                    
                    {/* Header block */}
                    <div className="p-4 pt-5 pb-3 bg-[#081B34] border-b border-[#EEB902]/30 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#EEB902] to-amber-400 p-[1.5px] shadow flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-[#0B2545] flex items-center justify-center text-[8px] font-black text-[#EEB902]">
                            SIS
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[9px] font-black tracking-wider text-amber-400 leading-none">SUNITA</h4>
                          <span className="text-[6.5px] text-slate-300 font-mono tracking-widest block uppercase font-bold leading-none mt-0.5">INTERNATIONAL</span>
                        </div>
                      </div>
                      <div className="text-right text-slate-400 font-mono text-[6px]">
                        <p className="font-bold">CAMPUS CARD</p>
                        <p className="text-[#EEB902]">2026 - 2027</p>
                      </div>
                    </div>

                    {/* Chip & portrait section */}
                    <div className="px-5 py-2 flex items-start justify-between relative z-10 gap-3">
                      <div className="w-8 h-6 bg-gradient-to-br from-amber-300 via-[#EEB902] to-yellow-600 rounded border border-amber-400 p-0.5 shadow-inner relative mt-4 shrink-0">
                        <div className="w-full h-full grid grid-cols-3 gap-[1px]">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="border-[0.5px] border-amber-800/20" />
                          ))}
                        </div>
                      </div>

                      <div className="relative text-center shrink-0">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-100 shadow bg-slate-800 flex items-center justify-center relative">
                          <img 
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200" 
                            alt="Student Avatar" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute right-0.5 bottom-0.5 text-white/35">
                            <Fingerprint className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="mt-1.5 bg-amber-400 text-[#0B2545] font-black text-[7px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider inline-block">
                          SIS REGISTERED
                        </div>
                      </div>
                    </div>

                    {/* Info lines footer */}
                    <div className="p-4 pt-2 text-center relative z-10 bg-[#081B34]/60 border-t border-slate-500/10">
                      <h3 className="text-sm font-extrabold text-[#EEB902] tracking-tight">{studentName}</h3>
                      <p className="text-[8px] font-bold text-slate-300 font-mono uppercase mt-0.5">GRADE: Class 10A</p>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-mono text-slate-300 border-t border-slate-500/15 pt-2 mt-2 leading-tight">
                        <div className="text-left">
                          <p className="text-[6.5px] text-slate-400 font-bold">ADM NUMBER:</p>
                          <p className="font-bold text-white">SIS-2024-041</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[6.5px] text-slate-405 font-bold">ROLL NUMBER:</p>
                          <p className="font-bold text-white">24</p>
                        </div>
                      </div>
                    </div>

                    <div className="h-2.5 bg-gradient-to-r from-[#0B2545] via-[#EEB902] to-amber-500 w-full shrink-0" />
                  </div>
                ) : (
                  <div className="h-full w-full bg-slate-900 flex flex-col justify-between text-slate-300 relative font-mono">
                    <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-slate-950/60 to-slate-950 opacity-40 pointer-events-none" />

                    <div className="mt-4 h-9 bg-slate-950 w-full shrink-0 relative" />

                    <div className="px-5 py-2 flex flex-col items-center justify-center relative z-10">
                      <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
                        <svg viewBox="0 0 21 21" className="w-24 h-24 text-slate-900 fill-current">
                          {QR_GRID.map((row, rIdx) => 
                            row.map((cell, cIdx) => 
                              cell === 1 ? (
                                <rect key={`${rIdx}-${cIdx}`} x={cIdx} y={rIdx} width={1} height={1} />
                              ) : null
                            )
                          )}
                        </svg>
                      </div>
                      <span className="text-[6.5px] text-zinc-505 tracking-wider font-extrabold uppercase text-center block mt-2 whitespace-nowrap">
                        SCAN AT CAMPUS TERMINALS
                      </span>
                    </div>

                    <div className="px-5 py-2 text-[6.5px] text-zinc-400 leading-normal space-y-1.5 border-t border-zinc-800/80 mt-1 relative z-10 text-center">
                      <p className="text-zinc-500 leading-tight">
                        Property of Sunita International School. If found, please return to registrar office immediately.
                      </p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1.5 border-t border-zinc-800 text-[6px] text-[#EEB902]">
                        <p className="text-left"><span className="text-zinc-500">Guardian:</span> Ramesh Sharma</p>
                        <p className="text-right"><span className="text-zinc-500">Blood Gp:</span> O+</p>
                        <p className="text-left"><span className="text-zinc-500">Emergency:</span> +91 98765 43212</p>
                        <p className="text-right"><span className="text-zinc-500">DOB:</span> 15 Aug 2011</p>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950 shrink-0 text-center relative z-10 flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center gap-[1px] h-5 bg-white px-1.5 py-0.5 rounded-sm w-44">
                        {Array.from({ length: 42 }).map((_, idx) => {
                          const widths = [1, 2, 3, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1, 2, 4, 1, 2, 1, 2];
                          const isLine = idx % 2 === 0;
                          return (
                            <div 
                              key={idx} 
                              style={{ width: `${widths[idx % widths.length]}px` }} 
                              className={`h-full ${isLine ? 'bg-slate-800' : 'bg-transparent'}`} 
                            />
                          );
                        })}
                      </div>
                      <p className="text-[6.5px] text-zinc-500 tracking-widest uppercase mt-0.5 font-bold">SIS-M98204-10A24</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center mt-3.5 text-slate-400 text-[10px] font-mono select-none no-print">
                &lsaquo; Click the ID layout image to flip &rsaquo;
              </div>
            </div>

            {/* Right Column: Interaction panel */}
            <div className="lg:col-span-7 space-y-5 no-print">
              <div className="bg-[#0B2545]/5 p-5 rounded-xl border border-slate-205">
                <h4 className="font-extrabold text-[#0B2545] flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-[#0B2545]/10 text-[#0B2545] rounded font-mono text-[9px]">VERIFIED SECURE</span>
                  Identity Integrity Parameters
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Verified system validation registers matching the active student's encrypted smart chip.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-white p-3.5 rounded-lg border">
                    <span className="block text-slate-400 text-[9px] font-black uppercase font-mono">ID Access Ledger</span>
                    <p className="text-slate-800 font-extrabold mt-0.5">SIS-2024-041/24</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-lg border">
                    <span className="block text-slate-400 text-[9px] font-black uppercase font-mono">Smart UID Code</span>
                    <p className="text-indigo-600 font-bold font-mono mt-0.5">04:9E:C1:2F:A9:4B:0C</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-lg border">
                    <span className="block text-slate-400 text-[9px] font-black uppercase font-mono">Assigned Bus Route</span>
                    <p className="text-slate-800 font-bold mt-0.5 font-sans">Route-04 Bus Service</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-lg border">
                    <span className="block text-slate-400 text-[9px] font-black uppercase font-mono">Emergency Contact</span>
                    <p className="text-rose-600 font-bold font-mono mt-0.5">+91 98765 43212</p>
                  </div>
                </div>
              </div>

              {/* Simulated Attendance Checkpoint Reader */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-5 rounded-2xl border border-indigo-900 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 text-white/[0.015] transform translate-x-1/10 select-none pointer-events-none">
                  <Fingerprint className="w-48 h-48" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div>
                    <span className="bg-[#EEB902] text-[#0B2545] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      Gate checkpoint simulator
                    </span>
                    <h4 className="text-base font-extrabold mt-1 text-[#EEB902]">NFC & QR Check-In Terminal</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Demonstrate scanning your card at the automated school gate entrance to simulate checking-in for the day.
                    </p>
                  </div>

                  {isCheckedIn ? (
                    <div className="bg-green-500/10 border border-green-500/40 p-4 rounded-xl flex items-start gap-3 text-left">
                      <div className="p-2 bg-green-500 text-white rounded-full shrink-0">
                        <CheckCircle2 className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-extrabold text-sm text-green-400">Card Scan Authorization Approved!</h5>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          Check-in register recorded: candidate <span className="font-bold text-[#EEB902]">{studentName}</span> has successfully cleared the <span className="font-bold">Front Terminal Gate</span> at <span className="font-mono text-white text-xs">{new Date().toLocaleTimeString()}</span>. Check-in event recorded.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCheckedIn(false);
                          }}
                          className="mt-3 text-[10px] font-bold text-[#EEB902] hover:underline hover:text-white transition"
                        >
                          Reset checkpoint gate reader
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800/40 border border-slate-700/80 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs text-slate-300 font-mono">
                        Scanner state: <span className="text-amber-500 font-black animate-pulse uppercase">Waiting For Scan</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          playBeep();
                          setIsCheckedIn(true);
                          triggerToast("Gateway Check-In connection authorized successfully. Verified student: " + studentName);
                        }}
                        className="bg-[#EEB902] hover:bg-amber-500 active:bg-amber-600 text-[#0B2545] font-black font-mono text-xs py-2 px-4 rounded-lg shadow transition transform hover:-translate-y-0.5 cursor-pointer text-center"
                      >
                        ⚡ Press to Scan ID QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Smart Badge Wallet Integrations */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase">Export Digital Pass coordinates</h4>
                  <p className="text-xs text-slate-400">Connect this official education smart ID pass to standard secure phone wallet utilities.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast("Dispatched Apple Wallet secure pass generation link to: +91 98765 43213");
                    }}
                    className="p-2 px-3.5 bg-zinc-900 hover:bg-black text-white text-xs font-extrabold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm border border-zinc-800"
                  >
                    <span className="font-black text-sm text-teal-400"></span> Add to Apple Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast("Initialized secure API handshake. Saved Sunita Int. student credentials to Google Wallet.");
                    }}
                    className="p-2 px-3.5 bg-zinc-900 hover:bg-black text-white text-xs font-extrabold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm border border-zinc-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 flex items-center justify-center text-[8px] font-black text-white shrink-0">W</span> Save on Google Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. PARENT & STUDENT CERTIFICATE DESK */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
          
          {/* Certificate Application Form */}
          <div className="lg:col-span-1 bg-white rounded-xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider font-mono">Apply for Certificate</h3>
              <p className="text-xs text-slate-500 mt-1 font-sans">Request an official digital TC or CC verified by the Sunita Int. Registrar Desk.</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!onCreateCertificateRequest || !parentCertReason) return;

              setParentCertLoading(true);
              try {
                await onCreateCertificateRequest({
                  studentId: 'STUDENT-SELF',
                  studentName: studentName || 'Self Student',
                  classId: 'Class 10A',
                  rollNo: '24',
                  certificateType: parentCertType,
                  parentName: parentCertStudentParent,
                  reason: parentCertReason,
                  dob: parentCertDOB
                });
                setParentCertSuccess(true);
                setParentCertReason('');
                setTimeout(() => setParentCertSuccess(false), 3500);
              } catch (_) {
              } finally {
                setParentCertLoading(false);
              }
            }} className="space-y-4 font-sans">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Applicant Name</label>
                <input
                  type="text"
                  disabled
                  value={studentName}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Format Template Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setParentCertType('transfer')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                      parentCertType === 'transfer' 
                        ? 'bg-[#0B2545] text-[#EEB902] border-[#0B2545]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Transfer Cert (TC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setParentCertType('character')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                      parentCertType === 'character' 
                        ? 'bg-[#0B2545] text-[#EEB902] border-[#0B2545]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Character Cert (CC)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent / Father\'s Name</label>
                <input
                  type="text"
                  required
                  value={parentCertStudentParent}
                  onChange={e => setParentCertStudentParent(e.target.value)}
                  placeholder="Mr. Ramesh Sharma"
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-[#0B2545] text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Date of Birth</label>
                <input
                  type="date"
                  required
                  value={parentCertDOB}
                  onChange={e => setParentCertDOB(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-[#0B2545] text-slate-900 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Justification Reason for Request</label>
                <textarea
                  required
                  rows={3}
                  value={parentCertReason}
                  onChange={e => setParentCertReason(e.target.value)}
                  placeholder="Family relocating / transfer to higher central college course..."
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-[#0B2545] text-slate-900 bg-white"
                />
              </div>

              {parentCertSuccess && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-xs rounded-lg flex items-center gap-1.5 animate-fade-in leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Your request has been successfully submitted to the school administration desk.
                </div>
              )}

              <button
                type="submit"
                disabled={parentCertLoading}
                className="w-full bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] font-black text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {parentCertLoading ? 'Submitting Form...' : 'Apply & Generate Request'}
              </button>
            </form>
          </div>

          {/* Certificate Log View and Printer Setup */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider font-mono">My Requests & Downloads</h3>
              <p className="text-xs text-slate-500 mt-1">Check administrative review status or download and print issued templates.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse text-left">
                <thead>
                  <tr className="bg-[#0B2545]/5 text-[#0B2545] font-bold text-xs uppercase border-b border-slate-200 whitespace-nowrap">
                    <th className="p-3">Ref Code</th>
                    <th className="p-3">Certificate Type</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3 font-mono">Status</th>
                    <th className="p-3 text-center">Print File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificateRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-mono text-xs">
                        No certificate applications recorded for your profile.
                      </td>
                    </tr>
                  ) : (
                    certificateRequests.map(c => {
                      const isApproved = c.status === 'approved';
                      const isPending = c.status === 'pending';
                      const isRejected = c.status === 'rejected';

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-xs text-slate-600">REF-{c.id.substring(0, 7).toUpperCase()}</td>
                          <td className="p-3 font-bold text-slate-800 text-xs text-left">
                            {c.certificateType === 'transfer' ? 'Transfer Certificate (TC)' : 'Character Certificate (CC)'}
                          </td>
                          <td className="p-3 text-xs text-slate-500 max-w-xs truncate" title={c.reason}>{c.reason}</td>
                          <td className="p-3">
                            {isPending && (
                              <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                Under Review
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-block bg-green-50 text-emerald-800 border border-green-200 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                                Approved & Sealed
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-block bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center text-xs">
                            {isApproved ? (
                              <button
                                type="button"
                                onClick={() => setParentSelectedCert(c)}
                                className="bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded inline-flex items-center gap-1 mx-auto shadow-sm tracking-wide cursor-pointer hover:scale-105 active:scale-95 transition-all text-center justify-center"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#EEB902]" />
                                Print File
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Seal Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. DETAILED CLASS TIMETABLE VIEW */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0B2545] flex items-center gap-2">
                <Clock className="w-5.5 h-5.5 text-[#EEB902]" />
                Class Weekly Timetable & Schedule
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Displaying period allotments, teachers, and active timings for <span className="font-bold text-[#0B2545]">Class 10A</span>.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 transition no-print border shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Print Schedule
            </button>
          </div>

          {/* Filters and search info bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print bg-slate-50 p-4 rounded-xl border border-slate-150">
            {/* Day Filter Slider */}
            <div className="flex flex-wrap gap-1.5">
              {['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDay(d)}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    filterDay === d
                      ? 'bg-[#0B2545] text-[#EEB902] shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Subject Text Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search subject..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="text-xs px-3 py-2 w-full md:w-48 rounded-lg border border-slate-350 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
              />
              {searchSubject && (
                <button
                  onClick={() => setSearchSubject('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Main Visual Display */}
          <div className="space-y-6">
            {getFilteredTimetables().length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed rounded-xl text-slate-400">
                <Clock className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold">No period schedules found</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting your subject search filter or day toggle.</p>
              </div>
            ) : filterDay === 'All Days' ? (
              // Matrix Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName) => {
                  const daySlots = getFilteredTimetables().filter(t => t.day === dayName);

                  return (
                    <div key={dayName} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      {/* Day Header Grid */}
                      <div className="bg-[#0B2545] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#EEB902]">
                        <span className="font-extrabold text-sm tracking-wide">{dayName}</span>
                        <span className="text-[10px] bg-[#EEB902] text-[#0B2545] px-2 py-0.5 rounded font-black font-mono">
                          {daySlots.length} Periods
                        </span>
                      </div>

                      {/* Periods list */}
                      <div className="divide-y divide-slate-100 p-2 space-y-1.5">
                        {daySlots.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4 italic">No matching periods</p>
                        ) : (
                          daySlots.sort((a,b) => a.startTime.localeCompare(b.startTime)).map((slot) => {
                            const isSearchMatch = searchSubject && slot.subject.toLowerCase().includes(searchSubject.toLowerCase());
                            return (
                              <div
                                key={slot.id}
                                className={`p-2.5 rounded-lg transition-all ${
                                  isSearchMatch ? 'bg-amber-50 border border-amber-300' : 'bg-slate-50/70 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-black ${getSubjectColor(slot.subject)}`}>
                                    {slot.subject}
                                  </span>
                                  <span className="text-[10px] font-bold font-mono text-slate-400 bg-white border px-1.5 py-0.5 rounded shadow-2xs">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    {slot.teacher}
                                  </span>
                                  <span className="text-[9px] font-mono uppercase bg-slate-200/50 text-slate-600 px-1 rounded">
                                    {slot.classId}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Detailed Day focused Timeline List
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs animate-fade-in">
                <div className="bg-[#0B2545] text-white px-5 py-4 flex items-center justify-between border-b-4 border-[#EEB902]">
                  <div>
                    <h4 className="font-extrabold text-sm tracking-wider uppercase">Focus Board: {filterDay} Schedule</h4>
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5">Sequential class listing for the day</p>
                  </div>
                  <span className="bg-white/10 text-[#EEB902] font-mono text-xs px-3 py-1 rounded-full border border-white/20 font-black">
                    {getFilteredTimetables().length} Lectures scheduled
                  </span>
                </div>

                <div className="divide-y divide-slate-100 p-4 space-y-4">
                  {getFilteredTimetables().sort((a,b) => a.startTime.localeCompare(b.startTime)).map((slot, index) => (
                    <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50/50 rounded-xl border border-slate-100 transition">
                      <div className="flex items-start gap-4">
                        {/* Period count indicator */}
                        <div className="h-10 w-10 rounded-full bg-[#0B2545]/5 text-[#0B2545] flex items-center justify-center font-black text-sm shrink-0 shadow-inner border border-[#0B2545]/10">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-base font-black ${getSubjectColor(slot.subject)}`}>{slot.subject}</h4>
                            <span className="bg-slate-100 text-[10px] text-slate-500 font-mono py-0.5 px-2 rounded-full border">
                              {slot.classId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
                            Subject Instructor: <span className="font-bold text-slate-700">{slot.teacher}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto text-right">
                        <div>
                          <p className="text-xs text-slate-400 font-mono leading-none">Active Period Duration</p>
                          <p className="text-sm font-extrabold text-slate-700 mt-1 flex items-center font-mono select-none">
                            <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {parentSelectedCert && (
        <OfficialCertificatePDF
          request={parentSelectedCert}
          onClose={() => setParentSelectedCert(null)}
        />
      )}

      {/* PAYABLE INVOICE BANKING SECURE CHECKOUT POPUP DIALOG */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-[#0B2545]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden border-t-8 border-[#EEB902] animate-scale-up">
            
            {/* Bank Card Header */}
            <div className="bg-[#0B2545] text-white p-5 border-b border-[#134074]">
              <h4 className="font-extrabold text-base flex items-center gap-1.5 text-white">
                <CreditCard className="w-5 h-5 text-[#EEB902]" />
                Secure Bank Checkout Gateway
              </h4>
              <p className="text-[10px] text-slate-300 font-mono mt-1">PCI-DSS Compliant Encryption | Ref: SIS-INV-{payingInvoice.id}</p>
            </div>

            {/* Invoce price details */}
            <div className="bg-[#134074]/5 p-4 flex justify-between items-center text-sm border-b">
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase leading-none">Tuition Dues</p>
                <p className="font-black text-slate-800 text-xs mt-1">{payingInvoice.termName}</p>
              </div>
              <div className="text-right">
                <p className="text-[#0B2545] font-black text-xl font-mono">₹{payingInvoice.amount.toLocaleString()}</p>
                <span className="text-[9px] text-slate-400">INR tax inclusive</span>
              </div>
            </div>

            {/* checkout Form */}
            <form onSubmit={handlePayCheckout} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Standard Cardholder Name</label>
                <input
                  type="text"
                  required
                  defaultValue="RAMESH SHARMA"
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Debit & Credit Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4532 •••• •••• 8920"
                  value={cardNumber}
                  onChange={e => {
                    // formats with spacing automatically
                    const v = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                    setCardNumber(v);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CVV Pin</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="•••"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-1.5 rounded shadow cursor-pointer"
                >
                  {checkoutLoading ? 'Authorizing Payment...' : `Authorize Charge ₹${payingInvoice.amount.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED TAX INVOICE & OFFICIAL TRANSACTION RECEIPT MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-[#0B2545]/60 z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden border-t-8 border-emerald-500 animate-scale-up relative">
            
            {/* Modal Controls (No-Print) */}
            <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-100 flex justify-between items-center no-print">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Official Fee Receipt</span>
              <button 
                onClick={() => setViewingReceipt(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer p-1"
                title="Close Receipt Overlay"
              >
                &times;
              </button>
            </div>

            {/* The Print-Only Targeted Content Area */}
            <div className="p-8 space-y-6 print-only-area text-slate-800">
              
              {/* Receipt Header Header */}
              <div className="flex justify-between items-start gap-4 border-b border-dashed border-slate-300 pb-5">
                <div>
                  <h1 className="text-xl font-black text-[#0B2545] tracking-tight uppercase">SUNITA INTERNATIONAL SCHOOL</h1>
                  <p className="text-[10px] text-slate-500 font-medium">Sector-5, Institutional Area, Dwarka, New Delhi - 110075</p>
                  <p className="text-[9px] text-slate-400 font-mono">CBSE Affiliation Number: 2730122 | Registry ID: SIS-2026/04</p>
                </div>
                <div className="text-right border-l border-slate-300 pl-4">
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider mb-2">
                    Payment Success
                  </span>
                  <p className="text-[10px] text-slate-400">Tax Invoice Receipt</p>
                  <p className="text-xs font-bold font-mono text-slate-700">Ref: SIS-REC-98{viewingReceipt.id}</p>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs bg-slate-50/50 p-4 border border-slate-100 rounded-lg">
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Student Candidate</p>
                  <p className="font-bold text-[#0B2545]">{studentName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Standard Class</p>
                  <p className="font-bold text-slate-600">Class 10 - Section A</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Candidate UID</p>
                  <p className="font-bold font-mono text-slate-600">SID-978-DEMO</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Academic Term</p>
                  <p className="font-bold text-slate-700">{viewingReceipt.termName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Date of Settlement</p>
                  <p className="font-bold font-mono text-slate-700">{viewingReceipt.payDate || '2026-06-12'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Gateway Txn ID</p>
                  <p className="font-bold font-mono text-emerald-700">{viewingReceipt.transactionId || 'SIS-TXN-OFFLINE'}</p>
                </div>
              </div>

              {/* Itemized Allocations Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3 w-12 text-center">S.No.</th>
                      <th className="p-3">Fee Category Particulars</th>
                      <th className="p-3 text-right">Applicable Period</th>
                      <th className="p-3 text-right w-32">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    <tr>
                      <td className="p-3 text-center text-slate-400 font-mono">01</td>
                      <td className="p-3">
                        <p className="font-bold">Core Instruction Tuition Fee</p>
                        <p className="text-[10px] text-slate-400">Classroom tutoring, syllabus guides & assessments</p>
                      </td>
                      <td className="p-3 text-right text-slate-500 font-mono">Current Quarter</td>
                      <td className="p-3 text-right font-mono font-bold">₹{Math.floor(viewingReceipt.amount * 0.70).toLocaleString()}.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-center text-slate-400 font-mono">02</td>
                      <td className="p-3">
                        <p className="font-bold">Laboratory & Computer Network Maintenance</p>
                        <p className="text-[10px] text-slate-400">Science lab consumables, high-speed fiber & smart modules</p>
                      </td>
                      <td className="p-3 text-right text-slate-500 font-mono">Current Quarter</td>
                      <td className="p-3 text-right font-mono font-bold">₹{Math.floor(viewingReceipt.amount * 0.15).toLocaleString()}.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-center text-slate-400 font-mono">03</td>
                      <td className="p-3">
                        <p className="font-bold">Sports & Athletics Facilities Levy</p>
                        <p className="text-[10px] text-slate-400">Sports grounds upkeep, physical training, fitness centers</p>
                      </td>
                      <td className="p-3 text-right text-slate-500 font-mono">Current Quarter</td>
                      <td className="p-3 text-right font-mono font-bold">₹{Math.floor(viewingReceipt.amount * 0.10).toLocaleString()}.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-center text-slate-400 font-mono">04</td>
                      <td className="p-3">
                        <p className="font-bold">Library Subscriptions & Digital Resources Pass</p>
                        <p className="text-[10px] text-slate-400">Access to reference books, online publications & archives</p>
                      </td>
                      <td className="p-3 text-right text-slate-500 font-mono">Current Quarter</td>
                      <td className="p-3 text-right font-mono font-bold">₹{Math.floor(viewingReceipt.amount * 0.05).toLocaleString()}.00</td>
                    </tr>
                    
                    {/* Totals Section */}
                    <tr className="bg-slate-50 text-slate-900 border-t border-slate-300 font-bold">
                      <td colSpan={2} className="p-3 text-right">Aggregate Gross Tuition Amount:</td>
                      <td className="p-3 text-right text-slate-400 font-normal italic">All inclusive</td>
                      <td className="p-3 text-right font-mono font-black text-rose-600 text-sm">
                        ₹{viewingReceipt.amount.toLocaleString()}.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Receipt Footer, Stamper and Signature layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pt-4 border-t border-dashed border-slate-200">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Security Certification Stamp</p>
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-150 p-3 rounded-lg w-fit">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-300 shadow-inner scale-95 shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-emerald-800 leading-none">APPROVED & SETTLED</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-1">Sunita Int. Registrar Desk</p>
                      <p className="text-[8px] font-mono text-slate-400 leading-none mt-0.5">SHA256: BD3089AC09A2</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-center md:text-right font-mono">
                  <div className="inline-block border-b border-slate-300 pb-2 w-48 text-center">
                    <span className="text-[10px] text-emerald-700 tracking-wider">Digitally Approved</span>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Academic Accounts Desk Representative</p>
                </div>
              </div>

              {/* Bottom Notice banner */}
              <div className="bg-slate-50 p-3 text-center rounded border border-slate-100 text-[9px] text-slate-400 font-mono">
                This is a computer-generated official payment receipt issued under verified school administration workspace credentials in 2026. No physical ink signature is required.
              </div>

            </div>

            {/* Modal Controls Footer (No-Print) */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 no-print">
              <button
                onClick={() => setViewingReceipt(null)}
                className="text-xs font-bold text-slate-500 hover:bg-slate-100 px-4 py-2 rounded-lg transition duration-150 cursor-pointer"
              >
                Cancel / Return
              </button>
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 transform transition active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4 cursor-pointer" /> Download PDF Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
