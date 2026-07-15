/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCheck, 
  BookOpen, 
  FileSpreadsheet, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Award,
  AlertTriangle,
  Send,
  Printer
} from 'lucide-react';
import { Attendance, Homework, ExamResult, User, AttendanceStatus, CertificateRequest, CertificateType, CertificateStatus } from '../types';
import { MOCK_STUDENTS } from '../data/mockData';
import OfficialCertificatePDF from './OfficialCertificatePDF';

interface TeacherPortalProps {
  attendanceLogs: Attendance[];
  onMarkAttendance: (records: Omit<Attendance, 'id'>[]) => Promise<void>;
  onAddHomework: (hw: Omit<Homework, 'id' | 'submissionsCount'>) => Promise<void>;
  onAddExamResult: (res: Omit<ExamResult, 'id'>) => Promise<void>;
  currentUser: User;
  certificateRequests?: CertificateRequest[];
  onCreateCertificateRequest?: (req: Omit<CertificateRequest, 'id' | 'status' | 'dateRequested'>) => Promise<void>;
}

export default function TeacherPortal({
  attendanceLogs,
  onMarkAttendance,
  onAddHomework,
  onAddExamResult,
  currentUser,
  certificateRequests = [],
  onCreateCertificateRequest
}: TeacherPortalProps) {
  const [teacherTab, setTeacherTab] = useState<'attendance' | 'homework' | 'results' | 'certificates'>('attendance');
  const [isFabOpen, setIsFabOpen] = useState(false);

  // 1. Attendance States
  const [selectedClass, setSelectedClass] = useState('Class 10A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceState, setAttendanceState] = useState<{ [stuId: string]: { status: AttendanceStatus; remarks: string } }>(() => {
    const initial: any = {};
    MOCK_STUDENTS.forEach(s => {
      initial[s.id] = { status: 'present', remarks: '' };
    });
    return initial;
  });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);

  // 2. Homework States
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDueDate, setHwDueDate] = useState('2026-06-18');
  const [hwLoading, setHwLoading] = useState(false);
  const [hwSuccess, setHwSuccess] = useState(false);

  // 3. Results Card States
  const [resStudentId, setResStudentId] = useState(MOCK_STUDENTS[0]?.id || '');
  const [resTerm, setResTerm] = useState('Mid-Term Appraisal');
  const [resSubject, setResSubject] = useState('Science');
  const [resMarks, setResMarks] = useState('');
  const [resMaxMarks, setResMaxMarks] = useState('100');
  const [resRemarks, setResRemarks] = useState('');
  const [resLoading, setResLoading] = useState(false);
  const [resSuccess, setResSuccess] = useState(false);

  // 4. Certificate States
  const [certStudentId, setCertStudentId] = useState(MOCK_STUDENTS[0]?.id || '');
  const [certType, setCertType] = useState<'transfer' | 'character'>('transfer');
  const [certReason, setCertReason] = useState('');
  const [certDOB, setCertDOB] = useState('2011-04-15');
  const [certParentName, setCertParentName] = useState('Mr. Ramesh Sharma');
  const [certLoading, setCertLoading] = useState(false);
  const [certSuccess, setCertSuccess] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRequest | null>(null);

  const studentsInClass = MOCK_STUDENTS.filter(s => s.classId === selectedClass);

  const handleStatusChange = (stuId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({
      ...prev,
      [stuId]: { ...prev[stuId], status }
    }));
  };

  const handleRemarksChange = (stuId: string, remarks: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [stuId]: { ...prev[stuId], remarks }
    }));
  };

  const handleSumAttend = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttendanceLoading(true);
    setAttendanceSuccess(false);

    try {
      const recordsToSubmit = studentsInClass.map(s => ({
        studentId: s.id,
        studentName: s.name,
        date: attendanceDate,
        status: attendanceState[s.id]?.status || 'present',
        markedByTeacherId: currentUser.id,
        remarks: attendanceState[s.id]?.remarks || ''
      }));

      await onMarkAttendance(recordsToSubmit);
      setAttendanceSuccess(true);
      setTimeout(() => setAttendanceSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSumHw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim() || !hwDesc.trim()) return;
    setHwLoading(true);
    setHwSuccess(false);

    try {
      await onAddHomework({
        title: hwTitle,
        description: hwDesc,
        subject: hwSubject,
        classId: selectedClass,
        dueDate: hwDueDate,
        createdAt: new Date().toISOString()
      });

      setHwTitle('');
      setHwDesc('');
      setHwSuccess(true);
      setTimeout(() => setHwSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setHwLoading(false);
    }
  };

  const handleSumResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resMarks || Number(resMarks) < 0) return;
    setResLoading(true);
    setResSuccess(false);

    try {
      const selectedStudent = MOCK_STUDENTS.find(s => s.id === resStudentId);
      const studentName = selectedStudent ? selectedStudent.name : 'Unknown';

      // Auto calculating letter grade based on CBSE metrics
      const pct = (Number(resMarks) / Number(resMaxMarks)) * 100;
      let grade = 'C';
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B+';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 50) grade = 'C+';

      await onAddExamResult({
        studentId: resStudentId,
        studentName,
        term: resTerm,
        subject: resSubject,
        marksObtained: Number(resMarks),
        maxMarks: Number(resMaxMarks),
        grade,
        remarks: resRemarks,
        date: new Date().toISOString().split('T')[0]
      });

      setResMarks('');
      setResRemarks('');
      setResSuccess(true);
      setTimeout(() => setResSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setResLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Teacher Action bar tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs">
        <button
          onClick={() => setTeacherTab('attendance')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            teacherTab === 'attendance' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Mark Attendance
        </button>
        <button
          onClick={() => setTeacherTab('homework')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            teacherTab === 'homework' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Assign Homework
        </button>
        <button
          onClick={() => setTeacherTab('results')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            teacherTab === 'results' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          Post Student Results
        </button>
        <button
          onClick={() => setTeacherTab('certificates')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
            teacherTab === 'certificates' 
              ? 'bg-[#0B2545] text-[#EEB902] shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          Certificate Desk
        </button>
      </div>

      {/* 1. COMPREHENSIVE ATTENDANCE SHEET */}
      {teacherTab === 'attendance' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-3 mb-2">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-1.5">
                <FileSpreadsheet className="w-5 h-5 text-[#EEB902]" />
                Daily Attendance Register
              </h3>
              <p className="text-xs text-slate-500">Record verification of physical classroom presence on standard working calendars.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm w-full sm:w-auto">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
              >
                <option value="Class 10A">Class 10A</option>
                <option value="Class 10B">Class 10B</option>
              </select>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:outline-none text-xs font-mono"
              />
            </div>
          </div>

          <form onSubmit={handleSumAttend} className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b text-xs">
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Mark Status</th>
                    <th className="p-3">Specific Remark Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsInClass.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 font-mono text-xs">No students registered in {selectedClass}.</td>
                    </tr>
                  ) : (
                    studentsInClass.map((s) => {
                      const cur = attendanceState[s.id] || { status: 'present', remarks: '' };
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-600 w-20">#{s.rollNo}</td>
                          <td className="p-3 font-bold text-slate-800">{s.name}</td>
                          <td className="p-3 whitespace-nowrap w-64">
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'present')}
                                className={`px-3 py-1 text-xs font-extrabold rounded-md cursor-pointer ${
                                  cur.status === 'present' 
                                    ? 'bg-green-600 text-white shadow-xs' 
                                    : 'text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'absent')}
                                className={`px-3 py-1 text-xs font-extrabold rounded-md cursor-pointer ${
                                  cur.status === 'absent' 
                                    ? 'bg-red-600 text-white shadow-xs' 
                                    : 'text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(s.id, 'late')}
                                className={`px-3 py-1 text-xs font-extrabold rounded-md cursor-pointer ${
                                  cur.status === 'late' 
                                    ? 'bg-amber-500 text-white shadow-xs' 
                                    : 'text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={cur.remarks}
                              onChange={e => handleRemarksChange(s.id, e.target.value)}
                              placeholder="Medical emergency, bus delay, etc."
                              className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-[#0B2545]"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {attendanceSuccess && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-xs rounded-md flex items-center gap-1.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
                Class attendance register successfully finalized and synced to Firebase Cloud Database!
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <button
                type="submit"
                disabled={attendanceLoading}
                className="bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] font-black text-xs py-2.5 px-6 rounded-lg flex items-center gap-1.5 shadow"
              >
                Sync Class Attendance Register
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. HOMEWORK ASSIGNMENT TRANSMITTER */}
      {teacherTab === 'homework' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-4 max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-1.5 border-b pb-2">
              <Sparkles className="w-5 h-5 text-[#EEB902]" />
              Assign Class Homework Task
            </h3>
            <p className="text-xs text-slate-500 mt-1">Dispatches interactive homework requirements automatically mapped to targeted grades.</p>
          </div>

          <form onSubmit={handleSumHw} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Class Room</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                >
                  <option value="Class 10A">Class 10A</option>
                  <option value="Class 10B">Class 10B</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                <select
                  value={hwSubject}
                  onChange={e => setHwSubject(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science (Physics)">Science (Physics)</option>
                  <option value="Science (Chemistry)">Science (Chemistry)</option>
                  <option value="Social Science">Social Science</option>
                  <option value="English Literature">English Literature</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Homework Title / Subject Line</label>
              <input
                type="text"
                required
                value={hwTitle}
                onChange={e => setHwTitle(e.target.value)}
                placeholder="e.g. Solving Trigonometric Identities & Exercises"
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Submission Deadline Due Date</label>
              <input
                type="date"
                required
                value={hwDueDate}
                onChange={e => setHwDueDate(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Worksheet Description</label>
              <textarea
                required
                rows={5}
                value={hwDesc}
                onChange={e => setHwDesc(e.target.value)}
                placeholder="List textbook exercises, mathematical formulations, drawing parameters, or reference video materials..."
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              />
            </div>

            {hwSuccess && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-xs rounded-md flex items-center gap-1.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
                Homework assigned! Active notifications generated in target Student and Parent feeds.
              </div>
            )}

            <button
              type="submit"
              disabled={hwLoading}
              className="w-full bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] font-black text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              {hwLoading ? 'Broadcasting Worksheet...' : 'Assign & Broadcast Homework'}
            </button>
          </form>
        </div>
      )}

      {/* 3. SUBMIT MARKS RESULTS */}
      {teacherTab === 'results' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md animate-fade-in space-y-4 max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-1.5 border-b pb-2">
              <Award className="w-5 h-5 text-[#EEB902]" />
              Enter Academic Examination Scores
            </h3>
            <p className="text-xs text-slate-500 mt-1">Submit exam appraisals for individual student portfolios. Academic letters (A+, B, etc.) are calculated dynamically based on score ratios.</p>
          </div>

          <form onSubmit={handleSumResult} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Candidate</label>
                <select
                  value={resStudentId}
                  onChange={e => setResStudentId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                >
                  {MOCK_STUDENTS.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.classId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Examination Term</label>
                <select
                  value={resTerm}
                  onChange={e => setResTerm(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                >
                  <option value="Unit Evaluation 1">Unit Evaluation 1</option>
                  <option value="Mid-Term Appraisal">Mid-Term Appraisal</option>
                  <option value="Final Term Appraisal">Final Term Appraisal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                <select
                  value={resSubject}
                  onChange={e => setResSubject(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science (Combined)</option>
                  <option value="Chemistry">Science (Chemistry)</option>
                  <option value="Physics">Science (Physics)</option>
                  <option value="Social Science">Social Science</option>
                  <option value="English">English Literature</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B2545] uppercase mb-1">Marks Secured</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={Number(resMaxMarks) || 100}
                  value={resMarks}
                  onChange={e => setResMarks(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-[#0B2545]/30 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  placeholder="e.g. 85"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Maximum Scale Marks</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={resMaxMarks}
                  onChange={e => setResMaxMarks(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545] bg-slate-50"
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Appraisal Report Remarks</label>
              <textarea
                rows={3}
                value={resRemarks}
                onChange={e => setResRemarks(e.target.value)}
                placeholder="Outstanding focus on laboratory experiments, needs attention in algebraic proofs..."
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              />
            </div>

            {resSuccess && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-xs rounded-md flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
                Examinations report grade successfully recorded and published to student report cards!
              </div>
            )}

            <button
              type="submit"
              disabled={resLoading}
              className="w-full bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] font-black text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              {resLoading ? 'Uploading scores...' : 'Publish Academic Scores'}
            </button>
          </form>
        </div>
      )}

      {teacherTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
          
          {/* Create Request Form */}
          <div className="lg:col-span-1 bg-white rounded-xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider font-mono">Request Student Certificate</h3>
              <p className="text-xs text-slate-500 mt-1">Submit auto-generated requests for Admin approval.</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!onCreateCertificateRequest || !certReason || !certStudentId) return;

              setCertLoading(true);
              try {
                const targetStudent = MOCK_STUDENTS.find(s => s.id === certStudentId);
                await onCreateCertificateRequest({
                  studentId: certStudentId,
                  studentName: targetStudent?.name || 'Unknown Student',
                  classId: targetStudent?.classId || 'Class 10A',
                  rollNo: targetStudent?.rollNo || '01',
                  certificateType: certType,
                  parentName: certParentName,
                  reason: certReason,
                  dob: certDOB
                });
                setCertSuccess(true);
                setCertReason('');
                setTimeout(() => setCertSuccess(false), 3500);
              } catch (_) {
              } finally {
                setCertLoading(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Student</label>
                <select
                  value={certStudentId}
                  onChange={e => {
                    setCertStudentId(e.target.value);
                    const found = MOCK_STUDENTS.find(s => s.id === e.target.value);
                    if (found) {
                      const lastName = found.name.split(' ').slice(-1)[0] || 'Sharma';
                      setCertParentName(`Mr. Ramesh ${lastName}`);
                    }
                  }}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-[#0B2545] bg-white text-slate-900"
                >
                  {MOCK_STUDENTS.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.classId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Certificate Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCertType('transfer')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                      certType === 'transfer' 
                        ? 'bg-[#0B2545] text-[#EEB902] border-[#0B2545]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Transfer (TC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertType('character')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                      certType === 'character' 
                        ? 'bg-[#0B2545] text-[#EEB902] border-[#0B2545]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Character (CC)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent / Father\'s Name</label>
                <input
                  type="text"
                  required
                  value={certParentName}
                  onChange={e => setCertParentName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-[#0B2545] text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={certDOB}
                  onChange={e => setCertDOB(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-[#0B2545] text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Auto-Generation</label>
                <textarea
                  required
                  rows={3}
                  value={certReason}
                  onChange={e => setCertReason(e.target.value)}
                  placeholder="Completed studies / family relocating to New Delhi..."
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-[#0B2545] text-slate-900 bg-white"
                />
              </div>

              {certSuccess && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-xs rounded-lg flex items-center gap-1.5 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Certificate request successfully placed! Under review by Administration.
                </div>
              )}

              <button
                type="submit"
                disabled={certLoading}
                className="w-full bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] font-black text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 shadow transition-all animate-pulse"
              >
                <Send className="w-4 h-4" />
                {certLoading ? 'Submitting Form...' : 'Submit Request'}
              </button>
            </form>
          </div>

          {/* Teacher Request Audit List */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider font-mono">Submitted Requests Logs</h3>
              <p className="text-xs text-slate-500 mt-1">Audit status of outstanding and issued certificates.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse text-left">
                <thead>
                  <tr className="bg-[#0B2545]/5 text-[#0B2545] font-bold text-xs uppercase border-b border-slate-200 whitespace-nowrap">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Format Type</th>
                    <th className="p-3">D.O.B</th>
                    <th className="p-3 font-mono">Status</th>
                    <th className="p-3 text-center">Auto-Format File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificateRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400 font-mono text-xs">
                        No requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    certificateRequests.map(c => {
                      const isTC = c.certificateType === 'transfer';
                      const isApproved = c.status === 'approved';
                      const isPending = c.status === 'pending';

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#0B2545]">{c.studentName}</span>
                              <span className="text-[10px] text-slate-400">{c.classId} {c.rollNo && `• Roll: ${c.rollNo}`}</span>
                            </div>
                          </td>
                          <td className="p-3 font-medium text-xs">
                            {isTC ? 'Transfer (TC)' : 'Character (CC)'}
                          </td>
                          <td className="p-3 font-mono text-xs text-slate-500">{c.dob || '2011-04-15'}</td>
                          <td className="p-3">
                            {isPending && (
                              <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                                Pending
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-block bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                                Approved
                              </span>
                            )}
                            {c.status === 'rejected' && (
                              <span className="inline-block bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center text-xs">
                            {isApproved ? (
                              <button
                                type="button"
                                onClick={() => setSelectedCertificate(c)}
                                className="bg-[#0B2545] hover:bg-slate-800 text-white font-bold text-[10px] px-2.5 py-1.5 rounded inline-flex items-center gap-1 mx-auto shadow-sm tracking-wide cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#EEB902]" />
                                Print File
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Pending Seal</span>
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

      {selectedCertificate && (
        <OfficialCertificatePDF
          request={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* Floating Action Button (FAB) Menu for Quick Shortcuts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 no-print">
        {/* FAB Options menu (animated sliding up) */}
        {isFabOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-2 animate-fade-in">
            <div className="flex items-center gap-2 group transition-all duration-200">
              <span className="bg-slate-900 border border-slate-700 text-white text-[11px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg shadow-md select-none transition-all group-hover:bg-[#0B2545] opacity-95">
                Record Attendance
              </span>
              <button
                type="button"
                onClick={() => {
                  setTeacherTab('attendance');
                  setIsFabOpen(false);
                }}
                className="p-3.5 bg-green-600 hover:bg-green-705 text-white rounded-full shadow-lg hover:shadow-green-500/20 hover:scale-110 active:scale-90 transition duration-200 cursor-pointer border border-green-500 flex items-center justify-center"
                title="Quick Attendance"
              >
                <UserCheck className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 group transition-all duration-200">
              <span className="bg-slate-900 border border-slate-700 text-white text-[11px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg shadow-md select-none transition-all group-hover:bg-[#0B2545] opacity-95">
                Assign Homework
              </span>
              <button
                type="button"
                onClick={() => {
                  setTeacherTab('homework');
                  setIsFabOpen(false);
                }}
                className="p-3.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-full shadow-lg hover:shadow-indigo-500/20 hover:scale-110 active:scale-90 transition duration-200 cursor-pointer border border-indigo-500 flex items-center justify-center"
                title="Assign Homework"
              >
                <BookOpen className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 group transition-all duration-150">
              <span className="bg-slate-900 border border-slate-700 text-white text-[11px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg shadow-md select-none transition-all group-hover:bg-[#0B2545] opacity-95">
                Create Exam Result
              </span>
              <button
                type="button"
                onClick={() => {
                  setTeacherTab('results');
                  setIsFabOpen(false);
                }}
                className="p-3.5 bg-amber-500 hover:bg-amber-600 text-[#0B2545] rounded-full shadow-lg hover:shadow-amber-500/20 hover:scale-110 active:scale-90 transition duration-200 cursor-pointer border border-amber-400 flex items-center justify-center"
                title="Post Results"
              >
                <Award className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Toggle FAB trigger */}
        <button
          type="button"
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-305 cursor-pointer transform hover:scale-105 active:scale-95 border-2 ${
            isFabOpen 
              ? 'bg-[#EEB902] text-[#0B2545] border-[#0B2545]/60 hover:bg-amber-500 hover:text-black' 
              : 'bg-[#0B2545] text-[#EEB902] border-[#EEB902]/60 hover:bg-slate-800'
          }`}
          title="Quick Shortcuts Menu"
        >
          <Plus className={`w-7 h-7 transition-all duration-300 ${isFabOpen ? 'rotate-135' : ''}`} />
        </button>
      </div>

    </div>
  );
}
