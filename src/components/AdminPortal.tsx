/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Receipt, 
  MessageSquare, 
  Plus, 
  Check, 
  X, 
  PhoneCall, 
  AlertCircle, 
  Calendar,
  CheckCircle, 
  CircleDollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Download,
  BookOpen,
  ClipboardCheck,
  Award,
  Printer,
  Eye,
  EyeOff,
  Key,
  FileText,
  Send,
  Smartphone,
  Share2,
  Search
} from 'lucide-react';
import { AdmissionEnquiry, FeeInvoice, User, Attendance, CertificateRequest, CertificateStatus, CommunicationLog } from '../types';
import OfficialCertificatePDF from './OfficialCertificatePDF';
import { dataService } from '../lib/dataService';
import { MOCK_STUDENTS } from '../data/mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface AdminPortalProps {
  enquiries: AdmissionEnquiry[];
  fees: FeeInvoice[];
  users: User[];
  onUpdateEnquiryStatus: (id: string, status: AdmissionEnquiry['status']) => Promise<void>;
  onCreateFeeInvoice: (invoice: Omit<FeeInvoice, 'id'>) => Promise<void>;
  attendanceLogs?: Attendance[];
  certificateRequests?: CertificateRequest[];
  onUpdateCertificateStatus?: (id: string, status: CertificateStatus) => Promise<void>;
  onSaveUser?: (user: User) => Promise<void>;
}

export default function AdminPortal({
  enquiries,
  fees,
  users,
  onUpdateEnquiryStatus,
  onCreateFeeInvoice,
  attendanceLogs = [],
  certificateRequests = [],
  onUpdateCertificateStatus,
  onSaveUser
}: AdminPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'enquiries' | 'fees' | 'students' | 'attendance' | 'certificates' | 'staff' | 'broadcaster'>('stats');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRequest | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdmissionEnquiry | null>(null);

  // Broadcaster Center States
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);
  const [broadcasterTarget, setBroadcasterTarget] = useState<'all' | 'teachers' | 'parents'>('all');
  const [broadcasterMedium, setBroadcasterMedium] = useState<'sms' | 'whatsapp' | 'both'>('both');
  const [broadcasterMessage, setBroadcasterMessage] = useState('');
  const [broadcasterTemplate, setBroadcasterTemplate] = useState('custom');
  const [broadcasterSending, setBroadcasterSending] = useState(false);
  const [broadcasterSuccess, setBroadcasterSuccess] = useState<string | null>(null);
  const [broadcasterError, setBroadcasterError] = useState<string | null>(null);

  // Broadcast list filtering
  const [logsSearchTerm, setLogsSearchTerm] = useState('');
  const [logsRoleFilter, setLogsRoleFilter] = useState<'all' | 'parent' | 'teacher'>('all');

  // Automated Fee Reminder States
  const [feeReminderChannel, setFeeReminderChannel] = useState<'sms' | 'email' | 'both'>('both');
  const [feeReminderSending, setFeeReminderSending] = useState(false);
  const [feeReminderSuccess, setFeeReminderSuccess] = useState<string | null>(null);
  const [individualSendingId, setIndividualSendingId] = useState<string | null>(null);
  const [individualSuccessText, setIndividualSuccessText] = useState<Record<string, string>>({});

  const handleTriggerBatchFeeReminders = async () => {
    const unpaidInvoices = fees.filter(f => f.status === 'unpaid');
    if (unpaidInvoices.length === 0) {
      alert("No unpaid or overdue fee invoices found to remind.");
      return;
    }
    
    setFeeReminderSending(true);
    setFeeReminderSuccess(null);

    // High fidelity simulated latency/delay for a realistic experience
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const logsToSave = unpaidInvoices.map(f => {
        const parentUser = users.find(u => u.role === 'parent' && u.studentId?.trim() === f.studentId.trim());
        const parentName = parentUser ? parentUser.name : `Parent of ${f.studentName}`;
        const parentPhone = parentUser?.phone || '+91 98765 43212';
        const parentEmail = parentUser?.email || 'parent@sunita.edu';
        
        let messageText = "";
        if (feeReminderChannel === 'sms') {
          messageText = `[SMS REMINDER] Dear ${parentName}, this is a friendly reminder that ₹${f.amount.toLocaleString()} is outstanding for ${f.studentName}'s ${f.termName}. Due Date: ${f.dueDate}. Kindly clear outstanding dues immediately to avoid fee surcharges. - Sunita School Accounts Desk`;
        } else if (feeReminderChannel === 'email') {
          messageText = `[EMAIL REMINDER] Subject: OVERDUE FEE INVOICE REMINDER - ${f.studentName} (${f.termName})\n\nDear ${parentName},\n\nOur accounts records show that the tuition invoice for ${f.studentName} is currently outstanding and overdue.\n\nInvoice Term: ${f.termName}\nAmount Owed: ₹${f.amount.toLocaleString()}\nDue Date: ${f.dueDate}\n\nKindly complete the secure online payment directly within your Parent SIS Dashboard.\n\nWarm regards,\nFinance & Accounts Office, Sunita International School (Sent to: ${parentEmail})`;
        } else {
          messageText = `[DUAL SMS & EMAIL ALERT] Dear ${parentName}, payment of ₹${f.amount.toLocaleString()} for ${f.studentName}'s ${f.termName} is OVERDUE. Please clear it immediately in your portal. Formal reminder email sent to ${parentEmail}. - SIS Finance Office`;
        }

        return {
          recipientName: parentName,
          recipientPhone: parentPhone,
          recipientRole: 'parent',
          messageType: feeReminderChannel,
          messageContent: messageText,
          status: 'delivered' as const,
          timestamp: new Date().toISOString(),
          noticeTitle: `Fee Overdue Alert: ${f.termName}`,
          isManual: false
        };
      });

      // Call dataService to save to database!
      await dataService.createCommunicationLogBatch(logsToSave);
      
      // Reload the communication logs so it updates in real time
      await loadBroadcasterLogs();

      setFeeReminderSuccess(
        `✓ Batch Automated System completed! Dispatched ${unpaidInvoices.length} high-priority reminders to all parent accounts successfully.`
      );
      
      setTimeout(() => setFeeReminderSuccess(null), 6000);
    } catch (err) {
      console.error("Batch fee reminders failed:", err);
    } finally {
      setFeeReminderSending(false);
    }
  };

  const handleTriggerIndividualFeeReminder = async (f: FeeInvoice, channel: 'sms' | 'email' | 'both') => {
    const k = `${f.id}_${channel}`;
    setIndividualSendingId(k);
    
    // Simulate web transmission delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const parentUser = users.find(u => u.role === 'parent' && u.studentId?.trim() === f.studentId.trim());
      const parentName = parentUser ? parentUser.name : `Parent of ${f.studentName}`;
      const parentPhone = parentUser?.phone || '+91 98765 43212';
      const parentEmail = parentUser?.email || 'parent@sunita.edu';
      
      let messageContent = "";
      if (channel === 'sms') {
        messageContent = `[SMS PRIORITY] Dear ${parentName}, quick reminder that ₹${f.amount.toLocaleString()} for ${f.studentName}'s "${f.termName}" is overdue. Please settle. - Sunita Admin`;
      } else if (channel === 'email') {
        messageContent = `[EMAIL REMINDER] Dear ${parentName}, official statement of payments indicates an outstanding amount of ₹${f.amount.toLocaleString()} for "${f.termName}". Due: ${f.dueDate}. Sent to: ${parentEmail}. - accounts@sunita.edu`;
      } else {
        messageContent = `[DUAL SMS + EMAIL] Dear ${parentName}, immediate reminder: Tuition fee of ₹${f.amount.toLocaleString()} for ${f.studentName} (${f.termName}) is overdue. Please pay within your Parent Portal. Email sent to: ${parentEmail}.`;
      }

      await dataService.createCommunicationLogBatch([{
        recipientName: parentName,
        recipientPhone: parentPhone,
        recipientRole: 'parent',
        messageType: channel,
        messageContent,
        status: 'delivered',
        timestamp: new Date().toISOString(),
        noticeTitle: `Individual Overdue Alert: ${f.termName}`,
        isManual: true
      }]);

      await loadBroadcasterLogs();

      setIndividualSuccessText(prev => ({
        ...prev,
        [f.id]: `✓ Sent ${channel.toUpperCase()}`
      }));

      setTimeout(() => {
        setIndividualSuccessText(prev => {
          const ud = { ...prev };
          delete ud[f.id];
          return ud;
        });
      }, 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIndividualSendingId(null);
    }
  };

  // Load Broadcaster logs and synced data on transition
  const loadBroadcasterLogs = async () => {
    try {
      const logs = await dataService.getCommunicationLogs();
      setCommLogs(logs);
    } catch (err) {
      console.error("Failed to load communication logs:", err);
    }
  };

  React.useEffect(() => {
    if (activeSubTab === 'broadcaster' || activeSubTab === 'stats' || activeSubTab === 'fees') {
      loadBroadcasterLogs();
    }
  }, [activeSubTab]);

  React.useEffect(() => {
    switch (broadcasterTemplate) {
      case 'ptm':
        setBroadcasterMessage(
          "Dear [Recipient Name],\n\nYou are cordially invited to the Academic Parent Teacher Meeting (PTM) this Saturday (20th June) at 9:30 AM in the Main Auditorium to review term results and teacher feedback.\n\nWarm regards,\nSunita International School Administration"
        );
        break;
      case 'results':
        setBroadcasterMessage(
          "Dear [Recipient Name],\n\nThis is to notify you that Term-I Examination Results have been officially published! Kindly log into your SIS Student/Parent Dashboard to access the digital report card.\n\nBest wishes,\nAcademic Registrar, SIS"
        );
        break;
      case 'weather':
        setBroadcasterMessage(
          "Dear Teachers & Parents,\n\nALERT: Due to intense heatwaves and air quality warnings across Delhi NCR, lessons tomorrow will conduct online via Microsoft Teams. School buses will not ply.\n\nStay safe,\nOffice of the Principal, SIS"
        );
        break;
      case 'fee_reminder':
        setBroadcasterMessage(
          "Dear [Recipient Name],\n\nFRIENDLY NOTICE: The outstanding tuition fees for Quarter 1 (April-June) are overdue. Kindly clear outstanding dues by Friday afternoon to avoid terms surcharge.\n\nThank you,\nFinance & Accounts Desk, SIS"
        );
        break;
      case 'custom':
      default:
        // Do not overwrite if they choose customized
        break;
    }
  }, [broadcasterTemplate]);

  // Staff Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'teacher'>('teacher');
  const [regPhone, setRegPhone] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regJoiningDate, setRegJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [regSalary, setRegSalary] = useState('');
  const [regClassId, setRegClassId] = useState('Class 10A');
  const [regStaffId, setRegStaffId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<{[key: string]: boolean}>({});
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  const generateCredentials = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = regRole === 'admin' ? 'SIS-ADM' : 'SIS-TCH';
    setRegStaffId(`${prefix}-${randomNum}`);
    
    // Generate passwords
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#%&*';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRegPassword(pass);
  };

  React.useEffect(() => {
    if (!regStaffId) {
      generateCredentials();
    }
  }, [regRole]);

  // Billing Form State
  const [billStudentId, setBillStudentId] = useState(MOCK_STUDENTS[0]?.id || '');
  const [billAmount, setBillAmount] = useState('');
  const [billTerm, setBillTerm] = useState('Quarter 2 Tuition (July - September)');
  const [billDueDate, setBillDueDate] = useState('2026-07-15');
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingSuccess, setBillingSuccess] = useState(false);

  // Helper to handle client-side CSV downloads
  const handleExportToCSV = (data: any[], headers: string[], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const val = row[header] ?? '';
          const escValue = ('' + val).replace(/"/g, '""');
          return `"${escValue}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Financial calculations
  const totalReceived = fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0);
  const totalPending = fees.filter(f => f.status === 'unpaid').reduce((acc, f) => acc + f.amount, 0);
  const totalFeesCount = fees.length;

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billAmount || Number(billAmount) <= 0) return;
    setBillingLoading(true);
    setBillingSuccess(false);

    try {
      const selectedStudent = MOCK_STUDENTS.find(s => s.id === billStudentId);
      const studentName = selectedStudent ? selectedStudent.name : 'Unknown Student';

      await onCreateFeeInvoice({
        studentId: billStudentId,
        studentName,
        amount: Number(billAmount),
        dueDate: billDueDate,
        status: 'unpaid',
        termName: billTerm
      });

      setBillAmount('');
      setBillingSuccess(true);
      setTimeout(() => setBillingSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setBillingLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRegisterStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const nameVal = regName.trim();
    const emailVal = regEmail.trim();
    const phoneVal = regPhone.trim();
    const designationVal = regDesignation.trim();
    const departmentVal = regDepartment.trim();
    const salaryVal = regSalary.trim();
    const staffIdVal = regStaffId.trim();
    const passwordVal = regPassword.trim();

    if (!nameVal) {
      setRegError('Staff full name is required');
      return;
    }
    if (!emailVal) {
      setRegError('Corporate email address is required');
      return;
    }
    if (!staffIdVal) {
      setRegError('Unique Staff ID is required');
      return;
    }
    if (!passwordVal) {
      setRegError('Security login password is required');
      return;
    }

    // Check if ID already exists (unique constraint)
    const exists = users.some(u => u.id.trim().toLowerCase() === staffIdVal.toLowerCase());
    if (exists) {
      setRegError(`Staff ID "${staffIdVal}" is already registered. Please generate or specify another.`);
      return;
    }

    const newStaff: User = {
      id: staffIdVal,
      name: nameVal,
      email: emailVal,
      role: regRole,
      phone: phoneVal || undefined,
      password: passwordVal,
      designation: designationVal || (regRole === 'admin' ? 'Administrator' : 'Faculty Teacher'),
      department: departmentVal || (regRole === 'admin' ? 'Office' : 'Academic Core'),
      joiningDate: regJoiningDate,
      salary: salaryVal ? `₹${Number(salaryVal).toLocaleString()}` : undefined,
      classId: regRole === 'teacher' ? regClassId : undefined
    };

    try {
      if (onSaveUser) {
        await onSaveUser(newStaff);
      } else {
        // Fallback
        await dataService.saveUser(newStaff);
      }
      setRegSuccess(`Staff registered successfully! Staff ID: ${staffIdVal}`);
      
      // Clear fields
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegDesignation('');
      setRegDepartment('');
      setRegSalary('');
      
      // Seed next unique ID & strong password immediately
      setTimeout(() => {
        generateCredentials();
      }, 50);
    } catch (err: any) {
      setRegError(err?.message || 'Verification logic or network state has temporarily bypassed saving.');
    }
  };

  // Prepare chart data for Admissions over status
  const enquiryChartData = [
    { name: 'Submitted', count: enquiries.filter(e => e.status === 'submitted').length, fill: '#134074' },
    { name: 'Contacted', count: enquiries.filter(e => e.status === 'contacted').length, fill: '#F59E0B' },
    { name: 'Approved', count: enquiries.filter(e => e.status === 'approved').length, fill: '#10B981' },
    { name: 'Rejected', count: enquiries.filter(e => e.status === 'rejected').length, fill: '#EF4444' }
  ];

  // Financial charts pie data
  const feePieData = [
    { name: 'Fees Collected', value: totalReceived, color: '#10B981' },
    { name: 'Outstanding Balance', value: totalPending, color: '#EF4444' }
  ];

  // Prepare chart data for Attendance Trends (Historical baseline merged with live logs)
  const monthlyTrends = React.useMemo(() => {
    // Standard academic calendar baseline of student presence levels
    const baseline = [
      { month: 'Jan', present: 93.5, absent: 4.5, late: 2.0 },
      { month: 'Feb', present: 94.8, absent: 3.5, late: 1.7 },
      { month: 'Mar', present: 92.1, absent: 5.7, late: 2.2 },
      { month: 'Apr', present: 95.3, absent: 3.5, late: 1.2 },
      { month: 'May', present: 91.0, absent: 7.0, late: 2.0 },
      { month: 'Jun', present: 88.5, absent: 7.5, late: 4.0 },
    ];

    if (!attendanceLogs || attendanceLogs.length === 0) {
      return baseline;
    }

    // Group active logs by month name
    const groups: { [key: string]: { present: number; absent: number; late: number; total: number } } = {};
    attendanceLogs.forEach(log => {
      if (!log.date) return;
      const parts = log.date.split('-');
      if (parts.length < 2) return;
      const monthNum = parts[1];
      const monthNames: { [k: string]: string } = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
        '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
      };
      const monthName = monthNames[monthNum];
      if (!monthName) return;

      if (!groups[monthName]) {
        groups[monthName] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      
      groups[monthName].total += 1;
      if (log.status === 'present') {
        groups[monthName].present += 1;
      } else if (log.status === 'absent') {
        groups[monthName].absent += 1;
      } else if (log.status === 'late') {
        groups[monthName].late += 1;
      }
    });

    // Override baseline months where live database logs are active
    return baseline.map(b => {
      const g = groups[b.month];
      if (g && g.total > 0) {
        return {
          month: b.month,
          present: Number(((g.present / g.total) * 100).toFixed(1)),
          absent: Number(((g.absent / g.total) * 100).toFixed(1)),
          late: Number(((g.late / g.total) * 100).toFixed(1))
        };
      }
      return b;
    });
  }, [attendanceLogs]);

  const avgPresence = React.useMemo(() => {
    if (monthlyTrends.length === 0) return '0.0';
    const sum = monthlyTrends.reduce((acc, m) => acc + m.present, 0);
    return (sum / monthlyTrends.length).toFixed(1);
  }, [monthlyTrends]);

  return (
    <div className="space-y-6">
      
      {/* Admin Tabs */}
      <div className="flex flex-wrap md:flex-nowrap border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs gap-1">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeSubTab === 'stats' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Metrics Dashboard
        </button>
        <button
          onClick={() => setActiveSubTab('enquiries')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeSubTab === 'enquiries' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Admission Leads ({enquiries.filter(e => e.status === 'submitted').length})
        </button>
        <button
          onClick={() => setActiveSubTab('fees')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeSubTab === 'fees' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Bill Student Fees
        </button>
        <button
          onClick={() => setActiveSubTab('students')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeSubTab === 'students' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Student Records
        </button>
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeSubTab === 'attendance' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Attendance Logs
        </button>
        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeSubTab === 'certificates' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          Certificate Desk ({certificateRequests.filter(c => c.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveSubTab('staff')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeSubTab === 'staff' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Registry
        </button>
        <button
          onClick={() => setActiveSubTab('broadcaster')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            activeSubTab === 'broadcaster' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          Broadcaster Center
        </button>
      </div>

      {/* DASHBOARD STATISTICS PREVIEW */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Metrics KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-lg bg-blue-50 text-[#0B2545]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Admission Leads</p>
                <h3 className="text-2xl font-black text-[#0B2545]">{enquiries.length}</h3>
                <span className="text-[10px] text-green-600 font-bold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12% vs May
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-lg bg-green-50 text-green-600">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fees Collected</p>
                <h3 className="text-2xl font-black text-slate-900">₹{(totalReceived / 1000).toFixed(1)}k</h3>
                <span className="text-[10px] text-slate-400 font-mono">From {fees.filter(f => f.status === 'paid').length} payments</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-lg bg-red-50 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Dues</p>
                <h3 className="text-2xl font-black text-red-600">₹{(totalPending / 1000).toFixed(1)}k</h3>
                <span className="text-[10px] text-red-500 font-bold flex items-center">
                  Needs instant collection chase
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-lg bg-amber-50 text-amber-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Students</p>
                <h3 className="text-2xl font-black text-slate-900">{MOCK_STUDENTS.length}</h3>
                <span className="text-[10px] text-green-600 font-semibold">100% database synced</span>
              </div>
            </div>

          </div>

          {/* Graphical Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Admission Enquiries Bar Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h4 className="font-bold text-[#0B2545] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#EEB902]" />
                  Inquiry Funnel Stats
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-mono py-0.5 px-2 rounded">Current Session</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enquiryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(11, 37, 69, 0.04)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {enquiryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fees Ledger Collection Pie Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h4 className="font-bold text-[#0B2545] flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-green-600" />
                  Tuition Fees Ledger Index
                </h4>
                <span className="text-[10px] text-[#EEB902] font-semibold bg-[#0B2545] py-0.5 px-2 rounded">Real-time</span>
              </div>
              <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {feePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-3.5 pl-4 flex flex-col justify-center">
                  {feePieData.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-xs text-slate-500 font-bold">{item.name}</p>
                        <p className="text-base font-black text-slate-800">₹{item.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-400 border-t pt-2 max-w-xs leading-relaxed">
                    Collection Index is at <span className="font-black text-green-600">{((totalReceived / (totalReceived + totalPending || 1)) * 100).toFixed(0)}%</span> efficacy this quarter.
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Attendance Trends Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md col-span-1 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-4 gap-4">
                <div>
                  <h4 className="font-bold text-[#0B2545] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#EEB902]" />
                    Academic Attendance Performance Trends
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Monthly student presence, late-in registers, and absenteeism rate analysis.</p>
                </div>
                <div className="flex gap-2 text-[10px] items-center">
                  <span className="bg-green-50 text-green-700 font-bold py-1 px-2.5 rounded border border-green-200">
                    Avg. Presence: {avgPresence}%
                  </span>
                  <span className="bg-[#0B2545] text-[#EEB902] font-black py-1 px-2.5 rounded">
                    Active Session: 2026/27
                  </span>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value}%`]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" name="Present / Attended" dataKey="present" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPresent)" />
                    <Area type="monotone" name="Excused Late" dataKey="late" stroke="#F59E0B" strokeWidth={1.5} fill="transparent" />
                    <Area type="monotone" name="Absent" dataKey="absent" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAbsent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t pt-4 mt-2 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historical Peak</p>
                  <p className="text-base font-black text-slate-800">95.3% <span className="text-xs text-slate-500 font-medium">(April)</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Evaluated</p>
                  <p className="text-base font-black text-slate-800">{attendanceLogs ? attendanceLogs.length : 0} logs</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Quality</p>
                  <span className="inline-block text-[10px] font-black uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full mt-1">
                    Good
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ADMISSION ENQUIRIES ADMIN VIEW */}
      {activeSubTab === 'enquiries' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-1.5 border-b pb-2">
              <Users className="w-5 h-5 text-[#EEB902]" />
              Manage Inbound Admission Leads
            </h3>
            <p className="text-xs text-slate-500 mt-1">Review parent inquiries submitted from school website portal, update contacting loops or approve student candidacy.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-[#0B2545]/5 text-[#0B2545] font-bold text-xs uppercase border-b border-slate-200">
                  <th className="p-3">Applicant details</th>
                  <th className="p-3">Grade Sought</th>
                  <th className="p-3">Lead Date</th>
                  <th className="p-3">Message details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-mono">No enquires found in record history.</td>
                  </tr>
                ) : (
                  enquiries.map((e) => {
                    const statusColors = (st: typeof e.status) => {
                      switch (st) {
                        case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
                        case 'contacted': return 'bg-amber-50 text-amber-700 border-amber-200';
                        case 'approved': return 'bg-green-50 text-green-700 border-green-200';
                        case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
                      }
                    };
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-[#0B2545]">{e.studentName}</p>
                            {e.isFullApplication && (
                              <span className="inline-flex items-center gap-0.5 bg-[#0B2545] text-[#EEB902] text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded shadow-sm">
                                <FileText className="w-2.5 h-2.5" />
                                Form Application
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">Parent: {e.parentName}</p>
                          <p className="text-xs text-slate-400">{e.email} | {e.phone}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-700 font-mono">{e.gradeSeeking}</td>
                        <td className="p-3 text-slate-500 text-xs">{e.date}</td>
                        <td className="p-3 max-w-xs">
                          <p className="text-xs text-slate-600 line-clamp-2" title={e.message}>
                            {e.message}
                          </p>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors(e.status)}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => setSelectedEnquiry(e)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#0B2545] rounded-lg transition"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {e.status === 'submitted' && (
                              <button
                                onClick={() => onUpdateEnquiryStatus(e.id, 'contacted')}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition border border-amber-200 bg-amber-50/20"
                                title="Mark as Contacted"
                              >
                                <PhoneCall className="w-4 h-4" />
                              </button>
                            )}
                            {(e.status === 'submitted' || e.status === 'contacted') && (
                              <>
                                <button
                                  onClick={() => onUpdateEnquiryStatus(e.id, 'approved')}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition border border-green-200 bg-green-50/20"
                                  title="Approve Candidate"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onUpdateEnquiryStatus(e.id, 'rejected')}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200 bg-red-50/20"
                                  title="Decline Inquiry"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GENERATE FEE DUE INVOICES CODENAME */}
      {activeSubTab === 'fees' && (() => {
        const unpaidFeesCount = fees.filter(f => f.status === 'unpaid').length;
        const totalUnpaidAmount = fees.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* LHS Side panel: Generator and Automator */}
            <div className="lg:col-span-1 space-y-6">
              {/* Bill Generator Form */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md">
                <h3 className="text-base font-bold text-[#0B2545] flex items-center gap-1.5 border-b pb-2 mb-4">
                  <Plus className="w-4.5 h-4.5 text-[#EEB902]" />
                  Generate Fee Invoice
                </h3>
                <form onSubmit={handleCreateBill} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Target Student</label>
                    <select
                      value={billStudentId}
                      onChange={e => setBillStudentId(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                    >
                      {MOCK_STUDENTS.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.classId})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bill Description / Term</label>
                    <select
                      value={billTerm}
                      onChange={e => setBillTerm(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                    >
                      <option value="Quarter 2 Tuition (July - September)">Quarter 2 Tuition (July - September)</option>
                      <option value="Science Laboratory & Computer Levy">Science Laboratory & Computer Levy</option>
                      <option value="Terminal Examination Administrative Fee">Terminal Examination Administrative Fee</option>
                      <option value="Hostel & Dining Subscription (Term 1)">Hostel & Dining Subscription (Term 1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={billAmount}
                      onChange={e => setBillAmount(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                      placeholder="e.g. 14500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Due Date</label>
                    <input
                      type="date"
                      required
                      value={billDueDate}
                      onChange={e => setBillDueDate(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                    />
                  </div>

                  {billingSuccess && (
                    <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-xs rounded-md flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Bill successfully dispatched to parent account ledger!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={billingLoading}
                    className="w-full bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] font-extrabold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    {billingLoading ? 'Generating bill...' : 'Dispatch Tuition Invoice'}
                  </button>
                </form>
              </div>

              {/* Overdue Invoice Automated Reminder System */}
              <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-md space-y-4">
                <h3 className="text-sm font-black text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Share2 className="w-4.5 h-4.5 text-emerald-505 text-emerald-505 animate-pulse" />
                  ⚡ Overdue Invoice Automator
                </h3>

                <div className="space-y-3.5">
                  <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                      <span className="text-xs font-black text-[#0B2545] uppercase tracking-wide">Ledger Overdue Analysis</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center mt-1">
                      <div className="bg-white p-2 rounded border border-amber-100">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Unpaid Ledger</span>
                        <span className="text-sm font-extrabold text-[#0B2545] font-mono">{unpaidFeesCount} Invoices</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-amber-100">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Overdue Total</span>
                        <span className="text-sm font-extrabold text-red-600 font-mono">₹{totalUnpaidAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reminder channel configuration */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-black text-slate-505 uppercase tracking-wide">
                      Automated Reminder Dispatch Channel
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'sms', label: 'SMS Carrier' },
                        { id: 'email', label: 'E-Mail SMTP' },
                        { id: 'both', label: 'Dual-Blast' }
                      ].map(ch => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setFeeReminderChannel(ch.id as any)}
                          className={`py-1.5 px-1 text-[10px] font-extrabold rounded border text-center transition cursor-pointer ${
                            feeReminderChannel === ch.id 
                              ? 'border-[#0B2545] bg-[#0B2545]/5 text-[#0B2545] ring-1 ring-offset-0 ring-[#0b2545]' 
                              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {ch.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed text-left">
                    Automated scan locates all parents with outstanding invoices, dynamically parses personalized templates, and dispatches high-priority reminders.
                  </p>

                  {feeReminderSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 animate-fade-in text-left">
                      {feeReminderSuccess}
                    </div>
                  )}

                  {/* Main Dispatch Action Button */}
                  <button
                    type="button"
                    disabled={feeReminderSending || unpaidFeesCount === 0}
                    onClick={handleTriggerBatchFeeReminders}
                    className="w-full bg-[#0B2545] hover:bg-[#134074] text-white font-black text-xs uppercase tracking-wider py-3 rounded-lg shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {feeReminderSending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Broadcasting Reminders...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#EEB902]" />
                        <span>Trigger Auto-Reminders ({unpaidFeesCount})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Current school bills table */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0B2545] border-b pb-2 mb-4 flex justify-between items-center">
                  <span>Dispatched Academic Ledger Invoices</span>
                  <span className="text-xs bg-[#0B2545]/5 text-[#0B2545] px-2.5 py-1 rounded-full font-mono font-bold">
                    Total: {fees.length}
                  </span>
                </h3>
                <div className="overflow-y-auto max-h-[580px]">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold text-xs border-b">
                        <th className="p-2">Invoice Student ID</th>
                        <th className="p-2">Charge Term Description</th>
                        <th className="p-2">Amount Dues</th>
                        <th className="p-2">Due Date</th>
                        <th className="p-2">Status</th>
                        <th className="p-2 text-right">Instant Control Remind</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fees.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <span className="font-bold text-slate-800 block">{f.studentName}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">ID: #{f.studentId}</span>
                          </td>
                          <td className="p-2 text-xs text-slate-600 font-medium">{f.termName}</td>
                          <td className="p-2 font-bold font-mono text-slate-800">₹{f.amount.toLocaleString()}</td>
                          <td className="p-2 text-xs text-slate-500 font-mono">{f.dueDate}</td>
                          <td className="p-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              f.status === 'paid' 
                                ? 'bg-green-150 text-green-800 bg-emerald-100 text-emerald-800' 
                                : 'bg-red-150 text-red-800 bg-rose-105 text-red-800 bg-red-100'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="p-2 text-right whitespace-nowrap">
                            {f.status === 'paid' ? (
                              <span className="text-[10.5px] text-slate-400 font-bold italic mr-1">Paid (Cleared)</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                {individualSuccessText[f.id] ? (
                                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {individualSuccessText[f.id]}
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      disabled={individualSendingId !== null}
                                      onClick={() => handleTriggerIndividualFeeReminder(f, 'sms')}
                                      className="bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded transition disabled:opacity-50 cursor-pointer"
                                      title="Send Priority SMS"
                                    >
                                      SMS
                                    </button>
                                    <button
                                      type="button"
                                      disabled={individualSendingId !== null}
                                      onClick={() => handleTriggerIndividualFeeReminder(f, 'email')}
                                      className="bg-purple-50 text-purple-850 hover:bg-purple-100 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded transition disabled:opacity-50 cursor-pointer"
                                      title="Send Email Alert"
                                    >
                                      Email
                                    </button>
                                    <button
                                      type="button"
                                      disabled={individualSendingId !== null}
                                      onClick={() => handleTriggerIndividualFeeReminder(f, 'both')}
                                      className="bg-[#0B2545] text-white hover:bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded transition disabled:opacity-50 cursor-pointer"
                                      title="Trigger Dual Alert"
                                    >
                                      Both
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* STUDENT RECORDS DIRECTORY LIST */}
      {activeSubTab === 'students' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-4 text-slate-705">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-1.5">
                <BookOpen className="w-5 h-5 text-[#EEB902]" />
                Enrolled Student Records Directory
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Primary directory of student enrollments, class sections, roll listings, and parent account links.
              </p>
            </div>
            
            <button
              onClick={() => {
                const csvData = MOCK_STUDENTS.map(student => {
                  const sId = student.id.trim();
                  const matchedUser = users.find(u => u.id.trim() === sId || u.name.toLowerCase() === student.name.toLowerCase());
                  return {
                    'Student ID': sId,
                    'Student Name': student.name,
                    'Class ID': student.classId,
                    'Roll No': student.rollNo,
                    'Phone Number': matchedUser?.phone || 'N/A',
                    'Email Address': matchedUser?.email || 'N/A'
                  };
                });
                handleExportToCSV(
                  csvData,
                  ['Student ID', 'Student Name', 'Class ID', 'Roll No', 'Phone Number', 'Email Address'],
                  `student_records_${new Date().toISOString().split('T')[0]}.csv`
                );
              }}
              className="bg-[#0B2545] hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow transition self-start"
            >
              <Download className="w-4 h-4 text-[#EEB902]" />
              Export Directory to CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-[#0B2545]/5 text-[#0B2545] font-bold text-xs uppercase border-b border-slate-200 whitespace-nowrap">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">ID Profile</th>
                  <th className="p-3">Roll Register</th>
                  <th className="p-3">Class/Grade</th>
                  <th className="p-3">Linked Parent</th>
                  <th className="p-3">Support Hotlines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_STUDENTS.map((student) => {
                  const sId = student.id.trim();
                  const matchedStudentUser = users.find(u => u.id.trim() === sId);
                  const matchedParentUser = users.find(u => u.role === 'parent' && u.studentId?.trim() === sId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-[#0B2545]">{student.name}</td>
                      <td className="p-3 font-mono text-xs text-slate-500">#{sId}</td>
                      <td className="p-3 font-mono text-xs text-slate-700">{student.rollNo}</td>
                      <td className="p-3">
                        <span className="p-1 px-2.5 bg-slate-100 border rounded text-xs font-semibold text-slate-600 font-mono">
                          {student.classId}
                        </span>
                      </td>
                      <td className="p-3">
                        {matchedParentUser ? (
                          <div>
                            <p className="font-bold text-xs text-slate-700">{matchedParentUser.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{matchedParentUser.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-medium">No parent account linked</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-500">
                        {matchedStudentUser?.phone || matchedParentUser?.phone || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATTENDANCE AUDIT LOGS VIEW */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-4 text-slate-705">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-1.5">
                <ClipboardCheck className="w-5 h-5 text-[#EEB902]" />
                Daily Attendance Ledger Index
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Audit trail of student presence, late arrivals, excused leaves, and physical attendance markings.
              </p>
            </div>
            
            <button
              disabled={attendanceLogs.length === 0}
              onClick={() => {
                const csvData = attendanceLogs.map(log => ({
                  'Log ID': log.id,
                  'Student ID': log.studentId,
                  'Student Name': log.studentName,
                  'Date': log.date,
                  'Status': log.status.toUpperCase(),
                  'Remarks': log.remarks || 'N/A',
                  'Marked By (ID)': log.markedByTeacherId || 'N/A'
                }));
                handleExportToCSV(
                  csvData,
                  ['Log ID', 'Student ID', 'Student Name', 'Date', 'Status', 'Remarks', 'Marked By (ID)'],
                  `attendance_audit_${new Date().toISOString().split('T')[0]}.csv`
                );
              }}
              className={`font-extrabold text-xs py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow transition self-start ${
                attendanceLogs.length === 0 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-[#0B2545] hover:bg-slate-800 text-white'
              }`}
            >
              <Download className="w-4 h-4 text-[#EEB902]" />
              Export Register to CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-[#0B2545]/5 text-[#0B2545] font-bold text-xs uppercase border-b border-slate-200 whitespace-nowrap">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Log Date</th>
                  <th className="p-3">Audit ID</th>
                  <th className="p-3">Roll / ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Disciplinary Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-mono">
                      No active daily presence logs found in database.
                    </td>
                  </tr>
                ) : (
                  attendanceLogs
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((log) => {
                      const statusStyles = (st: typeof log.status) => {
                        switch (st) {
                          case 'present': return 'bg-green-50 text-green-700 border-green-200';
                          case 'absent': return 'bg-red-50 text-red-700 border-red-200';
                          case 'late': return 'bg-amber-50 text-amber-700 border-amber-200';
                        }
                      };

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-[#0B2545]">{log.studentName}</td>
                          <td className="p-3 font-mono text-xs text-slate-500">{log.date}</td>
                          <td className="p-3 font-mono text-xs text-slate-400">#{log.id}</td>
                          <td className="p-3 font-mono text-xs text-slate-600">ID: {log.studentId}</td>
                          <td className="p-3">
                            <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusStyles(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-slate-500 italic pr-4">
                            {log.remarks || <span className="text-slate-300">None</span>}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'certificates' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-6 animate-fade-in text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545]">Certificate Issuance Desk</h3>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Approve, reject, or preview auto-generated formal Transfer (TC) and Character (CC) Certificates requested by parents or staff.
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className="bg-amber-100 border border-amber-200 text-amber-850 px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{certificateRequests.filter(c => c.status === 'pending').length} Action Required</span>
              </span>
              <span className="bg-green-100 border border-green-200 text-green-800 px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>{certificateRequests.filter(c => c.status === 'approved').length} Issued Securely</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-[#0B2545]/5 text-[#0B2545] font-black text-xs uppercase border-b border-slate-200 whitespace-nowrap">
                  <th className="p-3">Student / Reference</th>
                  <th className="p-3">Certificate Type</th>
                  <th className="p-3">Reason for Request</th>
                  <th className="p-3">Request Date</th>
                  <th className="p-3">Approval Status</th>
                  <th className="p-3 text-center">Actions / Format Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificateRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-mono text-xs">
                      No certificate requests are currently pending in the portal logs.
                    </td>
                  </tr>
                ) : (
                  certificateRequests.map((cert) => {
                    const isTC = cert.certificateType === 'transfer';
                    const isPending = cert.status === 'pending';
                    const isApproved = cert.status === 'approved';
                    const isRejected = cert.status === 'rejected';

                    return (
                      <tr key={cert.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-[#0B2545] text-sm">{cert.studentName}</span>
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {cert.classId} {cert.rollNo && `• Roll: ${cert.rollNo}`} • Ref: {cert.id}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            isTC 
                              ? 'bg-blue-50 text-blue-700 border-blue-200/60' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                          }`}>
                            {isTC ? 'Transfer Certificate (TC)' : 'Character Certificate (CC)'}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-slate-600 max-w-xs truncate" title={cert.reason}>
                          {cert.reason || <span className="text-slate-300 italic">No reason provided</span>}
                        </td>
                        <td className="p-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {cert.dateRequested}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold border border-amber-200/60 rounded-full px-2.5 py-1 text-[10px] uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending Approval
                              </span>
                            )}
                            {isApproved && (
                              <div className="flex flex-col gap-0.5">
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 font-bold border border-green-200/60 rounded-full px-2.5 py-1 text-[10px] uppercase">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  APPROVED & SEALED
                                </span>
                                {cert.serialNo && (
                                  <span className="text-[9px] font-mono font-bold text-red-650 pr-1">
                                    {cert.serialNo}
                                  </span>
                                )}
                              </div>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-bold border border-red-200/60 rounded-full px-2.5 py-1 text-[10px] uppercase">
                                Rejected
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => onUpdateCertificateStatus?.(cert.id, 'approved')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-xs transition duration-150 cursor-pointer"
                                >
                                  Approve Request
                                </button>
                                <button
                                  onClick={() => onUpdateCertificateStatus?.(cert.id, 'rejected')}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs py-1.5 px-3 rounded-lg transition duration-150 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {isApproved && (
                              <button
                                onClick={() => setSelectedCertificate(cert)}
                                className="bg-[#0B2545] hover:bg-slate-800 text-white font-black text-xs py-1.5 px-3.5 rounded-lg shadow-sm transition duration-150 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#EEB902]" />
                                <span>Preview & Print</span>
                              </button>
                            )}
                            {isRejected && (
                              <span className="text-xs text-slate-400 italic">Rejected Request</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'staff' && (
        <div className="space-y-6 animate-fade-in text-slate-800 text-left">
          {/* Header Description */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#EEB902]" />
                Staff Credentials Registry
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Configure administrative privileges and assign unique Login IDs and passwords to teachers and administrators.
              </p>
            </div>
            <button
               onClick={() => {
                 const csvData = users.filter(u => u.role === 'admin' || u.role === 'teacher').map(staff => ({
                   'Staff Name': staff.name,
                   'Unique ID': staff.id,
                   'Role': staff.role.toUpperCase(),
                   'Email': staff.email,
                   'Phone': staff.phone || 'N/A',
                   'Designation': staff.designation || 'N/A',
                   'Department': staff.department || 'N/A',
                   'Joining Date': staff.joiningDate || 'N/A',
                   'Salary': staff.salary || 'N/A'
                 }));
                 handleExportToCSV(
                   csvData,
                   ['Staff Name', 'Unique ID', 'Role', 'Email', 'Phone', 'Designation', 'Department', 'Joining Date', 'Salary'],
                   `staff_registry_${new Date().toISOString().split('T')[0]}.csv`
                 );
               }}
               className="bg-[#0B2545] hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-3.5 rounded-lg flex items-center gap-2 cursor-pointer shadow transition"
            >
              <Download className="w-4 h-4 text-[#EEB902]" />
              Export Staff CSV
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Registration form */}
            <form onSubmit={handleRegisterStaffMember} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-4">
              <h4 className="text-sm font-black text-[#0B2545] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#EEB902] stroke-[3]" />
                Register New Staff
              </h4>

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Mrs. Priya Sen"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0B2545] font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Access Role *</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as 'admin' | 'teacher')}
                      className="w-full p-2.5 bg-slate-50 border border-[#0B2545]/25 rounded-lg text-slate-800 font-bold cursor-pointer font-sans"
                    >
                      <option value="teacher">👨‍🏫 Teacher</option>
                      <option value="admin">💻 Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Mobile Contact</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. +91 98765..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. priya@sunita.edu"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Designation</label>
                    <input
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder={regRole === 'admin' ? 'e.g. VP / Registrar' : 'e.g. PG Teacher / Coordinator'}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Department</label>
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder={regRole === 'admin' ? 'e.g. IT Office' : 'e.g. Science / Humanities'}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={regJoiningDate}
                      onChange={(e) => setRegJoiningDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      value={regSalary}
                      onChange={(e) => setRegSalary(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {regRole === 'teacher' && (
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Section/Class Assignment</label>
                    <select
                      value={regClassId}
                      onChange={(e) => setRegClassId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-[#0B2545]/20 rounded-lg text-slate-800 cursor-pointer font-bold font-sans"
                    >
                      <option value="Class 10A">Class 10A</option>
                      <option value="Class 11A">Class 11A</option>
                      <option value="Class 12B">Class 12B</option>
                      <option value="Class 9C">Class 9C</option>
                    </select>
                  </div>
                )}

                {/* SECURE SYSTEM-GENERATED CREDENTIALS */}
                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-[#0B2545]/20 mt-4 space-y-3 font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#0B2545] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#EEB902]" />
                      Login Credentials Setup
                    </span>
                    <button
                      type="button"
                      onClick={generateCredentials}
                      className="text-[10px] text-[#EEB902] bg-[#0B2545] hover:bg-slate-800 font-black tracking-wider uppercase px-2 py-1 rounded cursor-pointer leading-tight transition"
                    >
                      🔄 Re-Generate
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-none">
                    <div>
                      <label className="block text-slate-400 font-semibold text-[10px] uppercase mb-1">Unique Login Staff ID *</label>
                      <input
                        type="text"
                        required
                        value={regStaffId}
                        onChange={(e) => setRegStaffId(e.target.value)}
                        placeholder="e.g. SIS-TCH-4819"
                        className="w-full p-2 bg-white border border-[#0B2545]/30 rounded text-slate-900 font-mono text-[11px] font-black tracking-wider focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold text-[10px] uppercase mb-1">Access Password *</label>
                      <input
                        type="text"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Security code"
                        className="w-full p-2 bg-white border border-[#0B2545]/30 rounded text-slate-900 font-mono text-[11px] font-black tracking-wider focus:outline-none"
                      />
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-medium block pt-1 border-t leading-tight font-sans">
                    * The staff member can use this exact Unique ID & password to sign into their secure workspace portal interface.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] font-black text-xs py-3 rounded-xl transition cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Register & Save Staff Credentials
              </button>
            </form>

            {/* RIGHT COLUMN: Directory list */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1 bg-amber-500/10 rounded-lg">
                    <Users className="w-4 h-4 text-[#EEB902]" />
                  </span>
                  Active Staff Directory ({users.filter(u => u.role === 'admin' || u.role === 'teacher').length})
                </h4>
                
                {/* Search bar */}
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search staff, department..."
                    className="w-full text-xs p-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-[#0B2545] font-semibold"
                  />
                </div>
              </div>

              {/* Responsive Staff directory cards */}
              <div className="space-y-3 max-h-[64vh] overflow-y-auto pr-1">
                {users.filter(u => u.role === 'admin' || u.role === 'teacher').filter(u => {
                  if (!staffSearchQuery.trim()) return true;
                  const query = staffSearchQuery.toLowerCase();
                  return u.name.toLowerCase().includes(query) || 
                         u.id.toLowerCase().includes(query) || 
                         (u.department && u.department.toLowerCase().includes(query)) ||
                         (u.designation && u.designation.toLowerCase().includes(query));
                }).length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 font-sans text-xs">
                    No active staff users matching your query were found.
                  </div>
                ) : (
                  users.filter(u => u.role === 'admin' || u.role === 'teacher').filter(u => {
                    if (!staffSearchQuery.trim()) return true;
                    const query = staffSearchQuery.toLowerCase();
                    return u.name.toLowerCase().includes(query) || 
                           u.id.toLowerCase().includes(query) || 
                           (u.department && u.department.toLowerCase().includes(query)) ||
                           (u.designation && u.designation.toLowerCase().includes(query));
                  }).map((staff) => {
                    const isRevealed = !!revealedPasswords[staff.id];
                    const maskedPassword = staff.password ? '••' + '•'.repeat(6) : 'Not Specified';

                    return (
                      <div key={staff.id} className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition shadow-3xs relative overflow-hidden group">
                        
                        {/* Decorative side accent matching role */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1.2 ${
                          staff.role === 'admin' ? 'bg-[#EEB902]' : 'bg-[#134074]'
                        }`} />

                        <div className="pl-2 flex flex-col sm:flex-row items-start justify-between gap-4">
                          
                          {/* Left section: Identity */}
                          <div className="flex items-start gap-3 text-left">
                            <div className="w-10 h-10 rounded-full bg-[#0B2545] text-[#EEB902] font-black text-sm flex items-center justify-center shrink-0 shadow-sm border border-slate-200 font-sans">
                              {staff.name.charAt(0)}
                            </div>
                            <div className="text-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-extrabold text-xs sm:text-sm text-[#0B2545]">{staff.name}</h5>
                                <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs ${
                                  staff.role === 'admin' 
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200/50' 
                                    : 'bg-indigo-50 text-indigo-900 border border-indigo-250/20'
                                }`}>
                                  {staff.role}
                                </span>
                              </div>
                              <p className="text-slate-500 font-semibold mt-0.5">{staff.designation || 'Staff member'}</p>
                              
                              <div className="mt-2 space-y-1 text-[11px] text-slate-600 font-sans font-medium">
                                <p>📧 <strong className="font-semibold text-slate-400">Email:</strong> {staff.email}</p>
                                <p>📞 <strong className="font-semibold text-slate-400">Phone:</strong> {staff.phone || 'N/A'}</p>
                                <p>💼 <strong className="font-semibold text-slate-400">Dept:</strong> {staff.department || 'General'}</p>
                                {staff.classId && (
                                  <p className="inline-block bg-[#0B2545]/10 text-[#0B2545] font-black px-1.5 py-0.5 rounded text-[10px] mt-1">
                                    🏫 Section: {staff.classId}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right section: Login Credentials */}
                          <div className="w-full sm:w-auto bg-white p-3 rounded-xl border border-slate-200/80 space-y-2 shrink-0 sm:min-w-[190px]">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">System Credentials</div>
                            
                            <div className="text-[11px] leading-tight space-y-1.5 text-left font-sans">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400 font-bold">Staff ID:</span>
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 font-black text-slate-700 tracking-wider rounded text-[10.5px]">
                                  {staff.id}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400 font-bold">Password:</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono bg-slate-100 px-1.5 py-1 font-black text-slate-700 tracking-wider rounded text-[10px] leading-none">
                                    {isRevealed ? (staff.password || 'N/A') : maskedPassword}
                                  </span>
                                  {staff.password && (
                                    <button
                                      type="button"
                                      onClick={() => togglePasswordVisibility(staff.id)}
                                      className="p-1 text-[#0B2545] hover:text-[#134074] hover:bg-slate-100 rounded transition cursor-pointer"
                                      title={isRevealed ? "Hide Password" : "View Password"}
                                    >
                                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {staff.joiningDate && (
                              <div className="border-t pt-1.5 mt-1 text-[10px] text-slate-400 font-semibold flex justify-between">
                                <span>Joined:</span>
                                <span className="text-slate-600 font-mono font-bold">{staff.joiningDate}</span>
                              </div>
                            )}

                            {staff.salary && (
                              <div className="text-[10px] text-slate-400 font-semibold flex justify-between">
                                <span>Salary:</span>
                                <span className="text-slate-600 font-mono font-bold">{staff.salary}</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === 'broadcaster' && (
        <div className="space-y-6 animate-fade-in text-slate-800 text-left">
          {/* Header information banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-500 animate-pulse" />
                Multi-Channel Cloud Broadcaster Command Center
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Dispatch instantaneous, tailored SMS alerts and premium pre-configured WhatsApp templates direct to parents and teachers of chosen cohorts.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Are you sure you want to permanently purge all transmission logs?")) {
                  await dataService.clearCommunicationLogs();
                  await loadBroadcasterLogs();
                }
              }}
              className="text-xs px-3.5 py-2 font-extrabold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition duration-200 shadow-2xs pointer-events-auto cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Purge Broadcast Logs
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COMPOSER FORM (LHS) */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!broadcasterMessage.trim()) {
                setBroadcasterError("Message content cannot be blank.");
                return;
              }
              setBroadcasterSending(true);
              setBroadcasterSuccess(null);
              setBroadcasterError(null);

              // High-fidelity delay
              await new Promise(r => setTimeout(r, 1200));

              try {
                // Find matching recipients
                let targets = users.filter(u => {
                  if (broadcasterTarget === 'all') return u.role === 'parent' || u.role === 'teacher';
                  return u.role === broadcasterTarget;
                });

                if (targets.length === 0) {
                  // Fall back seeds
                  targets = [
                    { id: 'sb_1', name: 'Mr. Ramesh Sharma', role: 'parent' as const, email: 'ramesh@demo.com', phone: '+91 98765 43212' },
                    { id: 'sb_2', name: 'Mrs. Aditi Sen', role: 'parent' as const, email: 'aditi@demo.com', phone: '+91 98765 43213' },
                    { id: 'sb_3', name: 'Dr. Vivek Anand', role: 'parent' as const, email: 'vivek@demo.com', phone: '+91 98765 43214' },
                    { id: 'sb_4', name: 'Mr. Arvind Verma', role: 'teacher' as const, email: 'arvind@demo.com', phone: '+91 98765 43211' }
                  ].filter(u => broadcasterTarget === 'all' || u.role === broadcasterTarget);
                }

                const logsToSave = targets.map(t => {
                  let personalMsg = broadcasterMessage.replace(/\[Recipient Name\]/g, t.name);
                  personalMsg = personalMsg.replace(/\[Recipient\]/g, t.name);
                  return {
                    recipientName: t.name,
                    recipientPhone: t.phone || '+91 90055 44332',
                    recipientRole: t.role,
                    messageType: broadcasterMedium,
                    messageContent: personalMsg,
                    status: 'delivered' as const,
                    timestamp: new Date().toISOString(),
                    noticeTitle: 'Manual Admin Broadcast',
                    isManual: true
                  };
                });

                await dataService.createCommunicationLogBatch(logsToSave);
                await loadBroadcasterLogs();

                setBroadcasterSuccess(`✓ Dispatched transmission successfully to ${logsToSave.length} customized recipient accounts!`);
                setBroadcasterMessage('');
                setBroadcasterTemplate('custom');
              } catch (err) {
                console.error(err);
                setBroadcasterError("Broadcast dispatching failed.");
              } finally {
                setBroadcasterSending(false);
              }
            }} className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-205 shadow-md space-y-4 text-left">
              <h3 className="text-sm font-black text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Send className="w-4 h-4 text-[#EEB902]" />
                New Broadcast Dispatcher
              </h3>

              {broadcasterSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-250 animate-fade-in">
                  {broadcasterSuccess}
                </div>
              )}

              {broadcasterError && (
                <div className="p-3 bg-red-50 text-red-800 text-xs font-bold rounded-lg border border-red-250 animate-fade-in">
                  {broadcasterError}
                </div>
              )}

              {/* Targets select */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">1. Recipient Target Cohort</label>
                <select
                  value={broadcasterTarget}
                  onChange={(e) => setBroadcasterTarget(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545] bg-white font-semibold cursor-pointer"
                >
                  <option value="all">All School Accounts (Teachers & Parents)</option>
                  <option value="parents">Registered Parents Only</option>
                  <option value="teachers">Authorized Teachers Only</option>
                </select>
              </div>

              {/* Medium select */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">2. Delivery Routing Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sms', label: 'SMS Core', icon: Smartphone, color: 'text-sky-600' },
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-600' },
                    { id: 'both', label: 'Dual Blast', icon: Share2, color: 'text-purple-600' }
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setBroadcasterMedium(ch.id as any)}
                      className={`py-2 px-1 text-[10px] font-black rounded-lg border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        broadcasterMedium === ch.id 
                          ? 'border-[#0B2545] bg-slate-50 text-[#0B2545] ring-2 ring-[#0b2545]/20' 
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <ch.icon className={`w-4 h-4 ${ch.color}`} />
                      <span>{ch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template quick fill */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">3. Broadcast SMS/WhatsApp templates</label>
                <select
                  value={broadcasterTemplate}
                  onChange={(e) => setBroadcasterTemplate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545] bg-white font-semibold cursor-pointer text-slate-700"
                >
                  <option value="custom">✍️ Formulate Custom Freeform Alert</option>
                  <option value="ptm">🏫 Parent-Teacher Meeting invitation (PTM)</option>
                  <option value="results">🎓 Examination Marksheets Published</option>
                  <option value="weather">🚨 Weather Emergency & Classes Online Alert</option>
                  <option value="fee_reminder">💰 Tuitions Fee Payments Installment reminder</option>
                </select>
              </div>

              {/* Content text */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>4. Alert Content Message</span>
                  <span className="text-[10px] text-slate-400 normal-case font-medium font-sans">Use [Recipient Name] for personalized tags</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={broadcasterMessage}
                  onChange={(e) => {
                    setBroadcasterMessage(e.target.value);
                    if (broadcasterTemplate !== 'custom') setBroadcasterTemplate('custom');
                  }}
                  className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545] leading-relaxed font-sans"
                  placeholder="Enter the alert notification body text..."
                />
              </div>

              {/* Action buttons */}
              <button
                type="submit"
                disabled={broadcasterSending}
                className="w-full bg-[#0B2545] hover:bg-[#134074] text-white font-black text-xs uppercase tracking-wider py-3 rounded-lg shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {broadcasterSending ? (
                  <>
                    <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Broadcasting messages...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#EEB902]" />
                    <span>Launch Transmission Blast</span>
                  </>
                )}
              </button>

              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-[10px] text-slate-500 leading-relaxed font-semibold">
                <strong>Official Broadcast Service: </strong>
                <span className="text-emerald-600 font-extrabold">READY & ACTIVE</span>.
                Announcements and urgent alerts are dispatched instantly to parent and teacher dashboard portals.
              </div>
            </form>

            {/* LOGS LIST (RHS) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-205 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
                <h3 className="text-sm font-black text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Live Broadcast Logs & Delivery Status ({commLogs.length})
                </h3>
              </div>

              {/* Filtering row */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search logs by recipient, body..."
                    value={logsSearchTerm}
                    onChange={(e) => setLogsSearchTerm(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  />
                </div>
                <select
                  value={logsRoleFilter}
                  onChange={(e) => setLogsRoleFilter(e.target.value as any)}
                  className="text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2545] font-semibold cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="parent">Parents Logs</option>
                  <option value="teacher">Teachers Logs</option>
                </select>
              </div>

              {/* Logs display container */}
              <div className="max-h-[460px] overflow-y-auto space-y-3.5 pr-1.5 shadow-2xs p-1">
                {commLogs.filter(log => {
                  const matchesSearch = log.recipientName.toLowerCase().includes(logsSearchTerm.toLowerCase()) || 
                                        log.messageContent.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                                        log.recipientPhone.includes(logsSearchTerm);
                  const matchesRole = logsRoleFilter === 'all' || log.recipientRole === logsRoleFilter;
                  return matchesSearch && matchesRole;
                }).length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed text-slate-400">
                    <Smartphone className="w-10 h-10 mx-auto text-slate-300 mb-2 animate-bounce" />
                    <p className="text-xs font-mono">No communication dispatch logs found matching active search filters.</p>
                  </div>
                ) : (
                  commLogs.filter(log => {
                    const matchesSearch = log.recipientName.toLowerCase().includes(logsSearchTerm.toLowerCase()) || 
                                          log.messageContent.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                                          log.recipientPhone.includes(logsSearchTerm);
                    const matchesRole = logsRoleFilter === 'all' || log.recipientRole === logsRoleFilter;
                    return matchesSearch && matchesRole;
                  }).map((log) => {
                    const formatTimestamp = (iso: string) => {
                      const d = new Date(iso);
                      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    };
                    
                    return (
                      <div key={log.id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 shadow-3xs text-left relative hover:bg-slate-50 hover:border-slate-300 transition duration-150">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-[#0B2545]">{log.recipientName}</span>
                            <span className="text-[9px] bg-slate-200/80 text-slate-605 font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                              {log.recipientRole}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">{log.recipientPhone}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {/* status dot */}
                            <span className="text-[9.5px] font-mono font-bold text-slate-400 flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              DELIVERED
                            </span>
                            
                            {/* channel badge */}
                            <span className="text-[9px] bg-[#EEB902]/20 text-[#0B2545] font-black px-1.5 py-0.5 rounded uppercase font-mono">
                              {log.messageType.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap pl-1 border-l-2 border-[#0B2545]/20 italic bg-white p-2.5 rounded border border-slate-100">
                          "{log.messageContent}"
                        </p>
                        
                        <div className="text-[9px] text-slate-400 font-mono mt-2 text-right">
                          Transmitted: {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl border-t-8 border-[#0B2545] shadow-2xl max-w-2xl w-full text-left overflow-hidden sm:my-8 animate-scale-up">
            
            {/* Header info bar */}
            <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-[#EEB902] text-[#0B2545] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                  {selectedEnquiry.isFullApplication ? 'Official Admission Application' : 'Inbound Enquiry Card'}
                </span>
                <h3 className="text-lg font-bold mt-1.5">
                  {selectedEnquiry.studentName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content areas */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-slate-800">
              
              {/* Biographical Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Grade Seeking</p>
                  <p className="text-slate-900 font-extrabold mt-0.5 font-sans text-sm">{selectedEnquiry.gradeSeeking}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Date of Lead</p>
                  <p className="text-slate-900 font-extrabold mt-0.5 font-sans text-sm">{selectedEnquiry.date}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Current Status</p>
                  <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded mt-0.5 ${
                    selectedEnquiry.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    selectedEnquiry.status === 'contacted' ? 'bg-amber-100 text-amber-800' :
                    selectedEnquiry.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedEnquiry.status}
                  </span>
                </div>

                {selectedEnquiry.isFullApplication && (
                  <>
                    <div>
                      <p className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Candidate Gender</p>
                      <p className="text-slate-900 font-extrabold mt-0.5 font-sans text-sm">{selectedEnquiry.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Date of Birth</p>
                      <p className="text-slate-900 font-extrabold mt-0.5 font-sans text-sm font-mono">{selectedEnquiry.dob || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Boarding Request</p>
                      <p className="text-slate-900 font-extrabold mt-0.5 font-sans text-sm">
                        {selectedEnquiry.needsHostel ? '🏨 Requires Hostel' : '🏠 Day Scholar'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Parent Biography */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-[#0B2545] uppercase tracking-wider border-b pb-1.5 flex items-center justify-between">
                  <span>Parent & Contact Information</span>
                  <span className="text-[10px] text-slate-500 font-mono">Contact Details Verified</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div>
                    <span className="font-bold text-slate-500">Father / Guardian:</span>
                    <p className="text-slate-900 font-semibold mt-0.5">{selectedEnquiry.parentName}</p>
                    {selectedEnquiry.fatherOccupation && (
                      <p className="text-[10.5px] text-slate-400">Occupation: {selectedEnquiry.fatherOccupation}</p>
                    )}
                  </div>
                  {selectedEnquiry.motherName && (
                    <div>
                      <span className="font-bold text-slate-500">Mother / Parent:</span>
                      <p className="text-slate-900 font-semibold mt-0.5">{selectedEnquiry.motherName}</p>
                      {selectedEnquiry.motherOccupation && (
                        <p className="text-[10.5px] text-slate-400">Occupation: {selectedEnquiry.motherOccupation}</p>
                      )}
                    </div>
                  )}
                  <div className="sm:col-span-2 pt-1 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-1">
                    <span>
                      <strong className="text-slate-500">Email:</strong> {selectedEnquiry.email}
                    </span>
                    <span>
                      <strong className="text-slate-500">Phone:</strong> {selectedEnquiry.phone}
                    </span>
                  </div>
                  {selectedEnquiry.isFullApplication && selectedEnquiry.address && (
                    <div className="sm:col-span-2 pt-1 border-t border-slate-100">
                      <strong className="text-slate-500 block">Permanent residential Address:</strong>
                      <p className="text-slate-900 hover:text-slate-950 mt-0.5 bg-white p-2 rounded border">{selectedEnquiry.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Performance Background */}
              {selectedEnquiry.isFullApplication && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/95 space-y-3">
                  <h4 className="text-xs font-black text-[#0B2545] uppercase tracking-wider border-b pb-1.5">
                    Previous Academic & Transfer Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block">Previous School Attended:</span>
                      <p className="text-slate-900 font-extrabold mt-0.5">{selectedEnquiry.previousSchool || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">Last Academic standing:</span>
                      <p className="text-slate-900 font-extrabold mt-0.5">{selectedEnquiry.previousMarks || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message remarks */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Remarks & Candidate Message</h4>
                <div className="bg-slate-100/60 p-4 rounded-lg text-xs leading-relaxed text-slate-700 italic border border-slate-150">
                  "{selectedEnquiry.message}"
                </div>
              </div>

              {/* Uploaded Verification Docs */}
              {selectedEnquiry.isFullApplication && selectedEnquiry.documentsSubmitted && (
                <div className="space-y-2 text-xs">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Uploaded Administrative Documents</h4>
                  {selectedEnquiry.documentsSubmitted.length === 0 ? (
                    <p className="text-slate-400 italic">No verification papers uploaded yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedEnquiry.documentsSubmitted.map(docu => (
                        <span key={docu} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-[11px] shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                          <span>{docu}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer action bar inside overlay */}
            <div className="bg-slate-50 px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 text-right">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 text-xs bg-white border border-slate-250 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer font-bold"
              >
                Close View
              </button>
              
              <div className="flex gap-2">
                {selectedEnquiry.status === 'submitted' && (
                  <button
                    onClick={() => {
                      onUpdateEnquiryStatus(selectedEnquiry.id, 'contacted');
                      setSelectedEnquiry(null);
                    }}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-black text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Mark contacted</span>
                  </button>
                )}
                {(selectedEnquiry.status === 'submitted' || selectedEnquiry.status === 'contacted') && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateEnquiryStatus(selectedEnquiry.id, 'approved');
                        setSelectedEnquiry(null);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#0B2545] to-[#134074] hover:opacity-90 text-[#EEB902] font-black text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Admission</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdateEnquiryStatus(selectedEnquiry.id, 'rejected');
                        setSelectedEnquiry(null);
                      }}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-300 text-red-800 font-extrabold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {selectedCertificate && (
        <OfficialCertificatePDF
          request={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

    </div>
  );
}
