/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  User, 
  Menu, 
  X, 
  LogOut, 
  BellRing, 
  Award, 
  Laptop, 
  ChevronRight,
  ShieldCheck,
  Key,
  ArrowDownToLine
} from 'lucide-react';
import { UserRole } from '../types';
import SchoolLogo from './SchoolLogo';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  userName: string;
  isFirebaseEnabled?: boolean;
  currentUserEmail?: string | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onTriggerCredentialLogin?: () => void;
  onOpenDownloadCenter?: () => void;
}

export default function Header({ 
  currentRole, 
  onChangeRole, 
  activeTab, 
  onChangeTab,
  userName,
  isFirebaseEnabled = false,
  currentUserEmail = null,
  onSignIn,
  onSignOut,
  onTriggerCredentialLogin,
  onOpenDownloadCenter
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles = [
    { value: 'admin', label: 'Admin Portal', desc: 'Manage Inquiries, Fees, Notices' },
    { value: 'teacher', label: 'Teacher Portal', desc: 'Log Attendance, Results, Homework' },
    { value: 'parent', label: 'Parent Portal', desc: 'Track Ward Progress & Pay Fees' },
    { value: 'student', label: 'Student Portal', desc: 'View Homework, Results & Schedule' }
  ] as const;

  // Define tabs based on role
  const getTabs = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Stats Overview' },
          { id: 'enquiries', label: 'Admission Inquiries' },
          { id: 'fees', label: 'Manage Fees' },
          { id: 'notices', label: 'School Notices' },
          { id: 'calendar', label: 'Academic Calendar' }
        ];
      case 'teacher':
        return [
          { id: 'attendance', label: 'Class Attendance' },
          { id: 'homework', label: 'Assign Homework' },
          { id: 'results', label: 'Post Results' },
          { id: 'notices', label: 'Shared Notices' },
          { id: 'calendar', label: 'Academic Calendar' }
        ];
      case 'parent':
        return [
          { id: 'overview', label: 'Ward Overview' },
          { id: 'attendance', label: 'Attendance logs' },
          { id: 'fees', label: 'Fee Payments' },
          { id: 'homework', label: 'Assign Homework' },
          { id: 'results', label: 'Report Cards' },
          { id: 'calendar', label: 'Academic Calendar' }
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'My Dashboard' },
          { id: 'homework', label: 'Homework portal' },
          { id: 'results', label: 'Academic Grades' },
          { id: 'attendance', label: 'My Attendance' },
          { id: 'calendar', label: 'Academic Calendar' }
        ];
    }
  };

  const navTabs = getTabs();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B2545] border-b-4 border-[#EEB902] shadow-xl text-white">
      {/* Top micro-bar for branding details */}
      <div className="bg-[#134074] text-xs px-4 py-2 flex items-center justify-between font-medium">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-slate-300">
            <Award className="w-3.5 h-3.5 text-[#EEB902] mr-1" />
            Affiliated to international examinations board (Aff. SIS-90184)
          </span>
          <span className="hidden md:inline-block text-slate-300">|</span>
          <span className="hidden md:inline-flex items-center text-[#EEB902]">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Official Firestore Database Active
          </span>
        </div>
        <div className="flex items-center space-x-3.5 text-slate-200">
          <span>Academic Session: 2026-2027</span>
          <span className="text-slate-500">|</span>
          <button
            onClick={onOpenDownloadCenter}
            className="flex items-center gap-1.5 bg-[#EEB902]/20 hover:bg-[#EEB902]/35 border border-[#EEB902]/40 text-[#EEB902] hover:text-white px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer animate-pulse duration-1000 uppercase font-mono tracking-wider shadow-sm"
            title="Download school system app, standalone offline site, or data backups"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-[#EEB902] stroke-[2.5]" />
            📲 Download App / Backup
          </button>
        </div>
      </div>

      {/* Main Navigation Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center cursor-pointer" onClick={() => onChangeTab('home')}>
            <SchoolLogo size="sm" />
          </div>

          {/* Desktop Tab Links */}
          <nav className="hidden lg:flex space-x-1">
            <button
              onClick={() => onChangeTab('home')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'home' 
                  ? 'bg-[#EEB902] text-[#0B2545] font-bold' 
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              School Website
            </button>
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#EEB902] text-[#0B2545] font-bold shadow-md' 
                    : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User Profile Summary */}
          <div className="hidden lg:flex items-center space-x-4 border-l border-[#134074] pl-6">
            {isFirebaseEnabled ? (
              <div className="flex items-center space-x-3 text-right">
                {currentUserEmail ? (
                  <>
                    <div>
                      <p className="text-sm font-semibold leading-none text-[#EEB902]">{userName}</p>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">{currentUserEmail}</p>
                      <span className="inline-block bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1">
                        {currentRole} (Cloud)
                      </span>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="p-2 bg-red-950/40 hover:bg-red-600 rounded-lg text-slate-200 hover:text-white transition-all shadow-inner border border-red-900/35 cursor-pointer ml-2"
                      title="Sign Out of Cloud Session"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-end space-y-1">
                    <button
                      onClick={onSignIn}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#EEB902] hover:bg-yellow-400 text-[#0B2545] text-xs font-black rounded-lg transition-all shadow-md cursor-pointer uppercase tracking-wider scale-95 hover:scale-100"
                    >
                      <span>Sign In with Google</span>
                    </button>
                    <span className="text-[9px] text-slate-400 font-mono">Running in Offline Mode</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center text-right space-x-3">
                <div>
                  <p className="text-sm font-medium leading-none text-slate-200">{userName}</p>
                  <span className="inline-block bg-slate-600 text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1">
                    {currentRole} (Offline Mode)
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-slate-500 bg-[#134074] flex items-center justify-center shadow-inner">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-200 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Official Portal Access Gateways Sub-Bar */}
      <div className="bg-[#134074] border-t border-[#0B2545] py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-[#EEB902] uppercase tracking-wider flex items-center font-sans">
              <Laptop className="w-3.5 h-3.5 mr-1" />
              Official Portal Gateways:
            </span>
            <span className="text-slate-300 hidden sm:inline">(Switch between active administrative, teaching staff, and parent/student dashboards)</span>
          </div>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  onChangeRole(r.value);
                  // Default reset to custom tabs depending on role
                  if (r.value === 'admin') onChangeTab('dashboard');
                  else if (r.value === 'teacher') onChangeTab('attendance');
                  else if (r.value === 'parent') onChangeTab('overview');
                  else onChangeTab('dashboard');
                }}
                className={`text-xs px-3 py-1.5 rounded font-semibold transition-all duration-200 flex items-center shadow-sm cursor-pointer ${
                  currentRole === r.value
                    ? 'bg-[#EEB902] text-[#0B2545] font-black border border-[#EEB902] scale-105'
                    : 'bg-[#0B2545] hover:bg-[#134074] text-slate-100 border border-slate-600'
                }`}
                title={r.desc}
              >
                {r.label.split(' ')[0]}
              </button>
            ))}
            <button
              onClick={onTriggerCredentialLogin}
              className="text-xs px-3.5 py-1.5 rounded font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer shadow-md flex items-center gap-1.5 uppercase tracking-wider md:ml-auto border border-emerald-500/30"
              title="Secure staff credential log in with ID & password"
            >
              <Key className="w-3.5 h-3.5 text-[#EEB902] stroke-[2.5]" />
              🔐 Staff Sign-In
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-[#134074] bg-[#0B2545] px-4 pt-2 pb-4 space-y-3 shadow-2xl">
          <div className="border-b border-[#134074] pb-3 text-center">
            <p className="text-sm font-semibold text-[#EEB902]">{userName}</p>
            <p className="text-xs text-slate-400 capitalize">{currentRole} account</p>
          </div>
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onChangeTab('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'home' ? 'bg-[#EEB902] text-[#0B2545]' : 'hover:bg-slate-800'
              }`}
            >
              School Website / Enquiry
            </button>
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onChangeTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === tab.id ? 'bg-[#EEB902] text-[#0B2545] font-black' : 'hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
