/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Laptop, 
  ArrowDownToLine, 
  Database, 
  FileCode, 
  Check, 
  HelpCircle,
  Chrome,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
  currentData: {
    users: any[];
    notices: any[];
    homework: any[];
    attendance: any[];
    fees: any[];
    results: any[];
    enquiries: any[];
    events: any[];
    certs: any[];
    timetables: any[];
  };
}

export default function AppDownloadModal({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall,
  currentData
}: AppDownloadModalProps) {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'backup' | 'standalone'>('pwa');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Handler to download manifest.json directly
  const handleDownloadManifest = () => {
    const manifestData = {
      "short_name": "Sunita SIS",
      "name": "Sunita International School Portal",
      "description": "Complete School Management System featuring Admin, Teacher, Student, and Parent portals with attendance tracking, fees invoice management, homework assignments, notices, academic results, and admission enquiry management.",
      "icons": [
        {
          "src": "/icon.svg",
          "type": "image/svg+xml",
          "sizes": "any",
          "purpose": "any"
        },
        {
          "src": "/icon.svg",
          "type": "image/svg+xml",
          "sizes": "192x192",
          "purpose": "any"
        },
        {
          "src": "/icon.svg",
          "type": "image/svg+xml",
          "sizes": "512x512",
          "purpose": "any"
        },
        {
          "src": "/icon.svg",
          "type": "image/svg+xml",
          "sizes": "192x192",
          "purpose": "maskable"
        },
        {
          "src": "/icon.svg",
          "type": "image/svg+xml",
          "sizes": "512x512",
          "purpose": "maskable"
        }
      ],
      "start_url": "/",
      "background_color": "#0B2545",
      "theme_color": "#0B2545",
      "display": "standalone",
      "orientation": "portrait"
    };

    const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'manifest.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler to copy current deployment URL to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handler to export JSON Database backup
  const handleDownloadJSONBackup = () => {
    try {
      const dataStr = JSON.stringify(currentData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sis_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setDownloadSuccess('json');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error('Failed to export JSON backup:', e);
    }
  };

  // Handler to export Standalone HTML Offline Portal Dashboard
  const handleDownloadStandaloneHTML = () => {
    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIS - Offline Standalone Portal Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
  </style>
</head>
<body class="min-h-screen flex flex-col text-slate-800">
  <!-- Header -->
  <header class="bg-[#0B2545] text-white py-6 px-8 border-b-4 border-[#EEB902] shadow-md">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-center sm:text-left">
        <h1 class="text-2xl font-black tracking-tight text-[#EEB902]">Smart School Information System</h1>
        <p class="text-xs text-slate-300 font-mono mt-1">OFFLINE PORTABLE BACKUP DASHBOARD & ARCHIVE</p>
      </div>
      <div class="bg-[#134074] px-4 py-2 rounded-lg text-xs font-bold border border-slate-700">
        Status: <span class="text-emerald-400">● Full Static Offline Ready</span>
      </div>
    </div>
  </header>

  <main class="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-8">
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
      <strong>Offline Security:</strong> This file is a self-contained portable backup compiled on <strong>${new Date().toLocaleString()}</strong>. It runs locally in any web browser without internet access, keeping your personal educational records secure and private.
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border shadow-xs text-center">
        <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Notices</p>
        <p class="text-3xl font-black text-[#0B2545] mt-1">${currentData.notices.length}</p>
      </div>
      <div class="bg-white p-5 rounded-xl border shadow-xs text-center">
        <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Homeworks</p>
        <p class="text-3xl font-black text-[#0B2545] mt-1">${currentData.homework.length}</p>
      </div>
      <div class="bg-white p-5 rounded-xl border shadow-xs text-center">
        <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Fees & Invoices</p>
        <p class="text-3xl font-black text-[#0B2545] mt-1">${currentData.fees.length}</p>
      </div>
      <div class="bg-white p-5 rounded-xl border shadow-xs text-center">
        <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Weekly Lectures</p>
        <p class="text-3xl font-black text-[#0B2545] mt-1">${currentData.timetables.length}</p>
      </div>
    </div>

    <!-- Core Sections -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Notices Section -->
      <div class="bg-white p-6 rounded-xl border shadow-xs space-y-4">
        <h3 class="font-black text-lg text-[#0B2545] border-b pb-2">📢 Official School Notices</h3>
        <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
          ${currentData.notices.map((n: any) => `
            <div class="p-3 bg-slate-50 border rounded-lg">
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-xs text-slate-700">${n.title}</span>
                <span class="text-[9px] bg-[#EEB902]/20 text-[#0B2545] font-bold px-1.5 py-0.5 rounded">${n.category || 'General'}</span>
              </div>
              <p class="text-xs text-slate-600 mt-1.5">${n.content}</p>
              <div class="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                <span>By: ${n.author || 'Administration'}</span>
                <span>${n.date || 'Recent'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Homework Portal -->
      <div class="bg-white p-6 rounded-xl border shadow-xs space-y-4">
        <h3 class="font-black text-lg text-[#0B2545] border-b pb-2">📝 Academic Assignments</h3>
        <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
          ${currentData.homework.map((h: any) => `
            <div class="p-3 bg-slate-50 border rounded-lg">
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-xs text-blue-700">${h.subject}</span>
                <span class="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">Due: ${h.dueDate}</span>
              </div>
              <h4 class="text-xs font-bold text-slate-800 mt-1">${h.title}</h4>
              <p class="text-xs text-slate-600 mt-1">${h.description}</p>
              <div class="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Class ID: ${h.classId}</span>
                <span>Points: ${h.maxPoints || 100}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Timetable grid -->
    <div class="bg-white p-6 rounded-xl border shadow-xs space-y-4">
      <h3 class="font-black text-lg text-[#0B2545] border-b pb-2">📅 Weekly Lecture Schedules</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
          const slots = currentData.timetables.filter((t: any) => t.day === day);
          return `
            <div class="border rounded-lg overflow-hidden bg-slate-50/50">
              <div class="bg-[#0B2545] text-white px-3 py-1.5 text-xs font-bold flex justify-between">
                <span>${day}</span>
                <span class="text-[9px] bg-[#EEB902] text-[#0B2545] px-1 rounded">${slots.length} Classes</span>
              </div>
              <div class="p-2 space-y-1.5">
                ${slots.map((s: any) => `
                  <div class="bg-white p-2 rounded border text-xs shadow-3xs">
                    <div class="flex justify-between">
                      <span class="font-bold text-[#0B2545]">${s.subject}</span>
                      <span class="text-[9px] text-slate-400 font-mono">${s.startTime}-${s.endTime}</span>
                    </div>
                    <div class="flex justify-between text-[9px] text-slate-400 mt-1">
                      <span>${s.teacher}</span>
                      <span class="font-mono">${s.classId}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  </main>

  <footer class="bg-slate-100 border-t py-6 px-8 text-center text-xs text-slate-400 font-mono mt-12">
    © ${new Date().getFullYear()} Sunita International School. Standing Offline Portal Package (Client Compiled).
  </footer>
</body>
</html>`;

      const dataBlob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sis_offline_portal_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess('html');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error('Failed to export standalone HTML:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header bar */}
        <div className="bg-[#0B2545] text-white p-5 flex items-center justify-between border-b-4 border-[#EEB902]">
          <div className="text-left">
            <h3 className="font-black text-base flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-[#EEB902]" />
              School Information System Download Center
            </h3>
            <p className="text-xs text-slate-300 font-mono mt-0.5">Choose a method to save, back up, or run this app offline</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-[#0B2545] text-[#0B2545] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Install Native App
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'border-[#0B2545] text-[#0B2545] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            Get Android APK
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-[#0B2545] text-[#0B2545] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Database Backup
          </button>
          <button
            onClick={() => setActiveTab('standalone')}
            className={`flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'standalone'
                ? 'border-[#0B2545] text-[#0B2545] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Offline Site
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
          
          {/* TAB 1: PWA */}
          {activeTab === 'pwa' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-50 border rounded-xl p-4 flex gap-4">
                <div className="h-12 w-12 bg-[#0B2545]/5 text-[#0B2545] rounded-xl flex items-center justify-center shrink-0 border border-[#0B2545]/10 shadow-xs">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0B2545]">Install on Smartphone & Desktop</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    This system supports Progressive Web App standards. Installing allows you to add a secure launcher icon directly to your app list, running in standalone full-screen window mode even when offline.
                  </p>
                </div>
              </div>

              {/* Install Trigger Button */}
              {deferredPrompt ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-xs text-emerald-800">Direct Installation Available</h5>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Your browser supports one-click installation for this system.</p>
                  </div>
                  <button
                    onClick={onTriggerInstall}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    Install Native App Now
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2 text-amber-800">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs">Browser Security Frame Restriction</h5>
                    <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                      If running inside the AI Studio inline frame preview, modern browsers block direct app-install alerts. Click the <strong className="underline">Open in new tab</strong> link in the top menu to view the independent URL first, then try installing directly from the browser!
                    </p>
                  </div>
                </div>
              )}

              {/* Step by Step Manual Guides */}
              <div className="border border-slate-150 rounded-xl p-4 bg-white space-y-4">
                <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider font-mono">Platform Installation Manual</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Android / Chrome Desktop */}
                  <div className="p-3 bg-slate-50 border rounded-lg space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                      <Chrome className="w-4 h-4 text-[#EEB902]" />
                      Google Chrome & Edge
                    </div>
                    <ul className="text-[11px] text-slate-500 list-decimal pl-4 space-y-1">
                      <li>Open the app URL in Chrome or Edge.</li>
                      <li>Look for the <span className="font-bold">Install</span> icon in the top right address bar.</li>
                      <li>Or, open the browser menu (...) and click <span className="font-bold">Install App</span> / <span className="font-bold">Add to Home screen</span>.</li>
                    </ul>
                  </div>

                  {/* iOS Safari */}
                  <div className="p-3 bg-slate-50 border rounded-lg space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                      <Share2 className="w-4 h-4 text-blue-500" />
                      Safari on iPhone / iPad
                    </div>
                    <ul className="text-[11px] text-slate-500 list-decimal pl-4 space-y-1">
                      <li>Open the app URL inside the iOS <span className="font-bold">Safari</span> browser.</li>
                      <li>Tap the iOS <span className="font-bold">Share</span> button (rectangle with upward arrow) at the bottom.</li>
                      <li>Scroll down and select <span className="font-bold">Add to Home Screen</span>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android APK */}
          {activeTab === 'apk' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-[#0B2545]/5 border border-[#0B2545]/15 rounded-xl p-4 flex gap-4">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0B2545]">Convert to Android APK</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Because this system is built as a fully compliant Progressive Web App (PWA), you can package it into a standard native <strong>Android APK</strong> file to share, side-load, or list on the Google Play Store for free.
                  </p>
                </div>
              </div>

              {/* URL Copy Card */}
              <div className="p-4 border border-slate-150 bg-slate-50/50 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">Your App Portal URL</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">PWA Compliant</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.origin}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 select-all"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className={`px-4 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                      copied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#0B2545] hover:bg-slate-800 text-[#EEB902] cursor-pointer'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* WHY PWABuilder Scanner Fails Alert */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                <h5 className="font-extrabold text-xs flex items-center gap-1.5 text-amber-800">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  PWABuilder says "Missing Manifest or Server Name"?
                </h5>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  Because this development environment is hosted inside a secure sandbox with Google OAuth authentication, external scanners like <strong>PWABuilder.com</strong> cannot fetch your site's manifest directly (they get redirected to a login screen).
                </p>
                <div className="text-[11px] font-bold text-amber-800 pt-1">
                  💡 Easy Fix: Use the "Download manifest.json" button below and upload it directly on PWABuilder!
                </div>
              </div>

              {/* Generation Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method A: Microsoft PWABuilder (Play Store & Shared APK) */}
                <div className="border border-slate-150 rounded-xl p-4 bg-white space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#0B2545] flex items-center gap-1.5 border-b pb-1.5">
                      <span className="flex items-center justify-center h-5 w-5 bg-[#0B2545] text-white text-[10px] font-black rounded-full">1</span>
                      Create Signed APK via Upload
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Instead of scanning your secure URL, download your manifest and upload it to Microsoft's official free packaging tool:
                    </p>
                    <ul className="text-[11px] text-slate-500 list-decimal pl-4 space-y-1">
                      <li>Click the button below to download your <strong>manifest.json</strong> file.</li>
                      <li>Visit <strong>pwabuilder.com</strong>.</li>
                      <li>Click <strong>"Upload a Web Manifest"</strong> (below the URL text field).</li>
                      <li>Upload your downloaded <code>manifest.json</code>.</li>
                      <li>Configure your name/icons and download your signed native <strong>Android APK</strong>!</li>
                    </ul>
                  </div>

                  <div className="space-y-2 pt-3">
                    <button
                      onClick={handleDownloadManifest}
                      className="w-full bg-[#0B2545] hover:bg-slate-800 text-[#EEB902] font-black text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      Download manifest.json
                    </button>

                    <a
                      href="https://www.pwabuilder.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      Launch PWABuilder.com
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Method B: Instant Local APK Wrap */}
                <div className="border border-slate-150 rounded-xl p-4 bg-white space-y-3">
                  <div className="text-xs font-bold text-[#0B2545] flex items-center gap-1.5 border-b pb-1.5">
                    <span className="flex items-center justify-center h-5 w-5 bg-[#0B2545] text-white text-[10px] font-black rounded-full">2</span>
                    Instant Chrome Web-APK Wrap
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Modern Android smartphones can generate a native secure system APK wrapper automatically in the background without any downloads!
                  </p>
                  <ul className="text-[11px] text-slate-500 list-decimal pl-4 space-y-1.5">
                    <li>Open <strong>Google Chrome</strong> on any Android device.</li>
                    <li>Visit your shared app portal URL.</li>
                    <li>Tap the browser's menu button <strong>(three dots)</strong> in the top right.</li>
                    <li>Tap <strong>Add to Home Screen</strong> or <strong>Install App</strong>.</li>
                    <li>Android will automatically compile and register a standalone native APK with custom launch icons in your app drawer!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JSON Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-50 border rounded-xl p-4 flex gap-4">
                <div className="h-12 w-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0B2545]">Backup & Export Database</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Download a secure JSON schema archive containing all your current school information databases, including student lists, homework items, academic results, calendars, and noticeboards.
                  </p>
                </div>
              </div>

              {downloadSuccess === 'json' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-lg flex items-center gap-1.5 animate-bounce">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Database backup file generated and downloaded successfully! Keep this file secure.
                </div>
              )}

              <div className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs text-slate-700">Schema Archive Backup</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Format: JSON | Fields: {Object.keys(currentData).length} databases</p>
                </div>
                <button
                  onClick={handleDownloadJSONBackup}
                  className="bg-[#0B2545] hover:bg-slate-800 text-[#EEB902] font-extrabold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Download JSON Backup
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Standalone Site */}
          {activeTab === 'standalone' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-50 border rounded-xl p-4 flex gap-4">
                <div className="h-12 w-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center shrink-0 border border-purple-100 shadow-xs">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0B2545]">Download Independent Web Portal</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Generate a fully self-contained standalone Single-File HTML portal of your school system! This exports all active academic files, schedules, and bulletins into an executable page you can open and browse on any device without any internet or cloud host.
                  </p>
                </div>
              </div>

              {downloadSuccess === 'html' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-lg flex items-center gap-1.5 animate-bounce">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Self-contained portable HTML Portal generated and downloaded successfully!
                </div>
              )}

              <div className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs text-slate-700">Portable Site Package</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Format: Single-Page HTML Document | Tailwinds integrated</p>
                </div>
                <button
                  onClick={handleDownloadStandaloneHTML}
                  className="bg-[#0B2545] hover:bg-slate-800 text-[#EEB902] font-extrabold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <FileCode className="w-4 h-4" />
                  Export Offline Portal
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs py-2 px-4 rounded-lg transition cursor-pointer shadow-xs"
          >
            Close Download Center
          </button>
        </div>

      </div>
    </div>
  );
}
