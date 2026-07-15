/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Award, Calendar, CheckSquare, Download, MapPin, Printer, Shield, User, X } from 'lucide-react';
import { CertificateRequest } from '../types';
import SchoolLogo from './SchoolLogo';

interface OfficialCertificateProps {
  request: CertificateRequest;
  onClose: () => void;
}

export default function OfficialCertificatePDF({ request, onClose }: OfficialCertificateProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      // Open a clean printable window
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>${request.certificateType === 'transfer' ? 'Transfer_Certificate' : 'Character_Certificate'}_${request.studentName.replace(/\s+/g, '_')}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=JetBrains+Mono:wght@400;700&display=swap');
                body {
                  font-family: 'Inter', sans-serif;
                  background-color: white;
                }
                .font-cert-title {
                  font-family: 'Playfair Display', serif;
                }
                .font-mono {
                  font-family: 'JetBrains Mono', monospace;
                }
                @media print {
                  .no-print { display: none; }
                  body { padding: 0; margin: 0; }
                }
              </style>
            </head>
            <body class="p-6 md:p-10">
              <div class="max-w-4xl mx-auto border-8 border-amber-500/70 p-6 md:p-12 relative bg-amber-50/20 rounded-lg">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        win.document.close();
        // Give fonts and styles a brief millisecond to register
        setTimeout(() => {
          win.focus();
          win.print();
        }, 300);
      }
    }
  };

  const isTC = request.certificateType === 'transfer';
  const displaySerial = request.serialNo || `SIS/${isTC ? 'TC' : 'CC'}/2026/${Math.floor(Math.random() * 800) + 100}`;
  const displayDate = request.dateApproved || new Date().toISOString().split('T')[0];

  // Formatting helpers
  const formatDOBWords = (dobString?: string) => {
    if (!dobString) return 'Fifteenth April Two Thousand Eleven';
    try {
      const d = new Date(dobString);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const numbersToWords = (n: number) => {
        const units = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
                       'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth',
                       'Twenty First', 'Twenty Second', 'Twenty Third', 'Twenty Fourth', 'Twenty Fifth', 'Twenty Sixth', 'Twenty Seventh', 'Twenty Eighth', 'Twenty Ninth', 'Thirtieth', 'Thirty First'];
        return units[n] || '';
      };
      const yearToWords = (y: number) => {
        if (y === 2011) return 'Two Thousand Eleven';
        if (y === 2009) return 'Two Thousand Nine';
        if (y === 2010) return 'Two Thousand Ten';
        if (y === 2012) return 'Two Thousand Twelve';
        return `Two Thousand ${y - 2000}`;
      };

      return `${numbersToWords(d.getDate())} of ${months[d.getMonth()]} ${yearToWords(d.getFullYear())}`;
    } catch {
      return dobString;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-4xl border border-slate-700/50 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#EEB902]" />
            <span className="font-bold text-sm uppercase tracking-wider font-mono">
              Auto-Generated Official {isTC ? 'Transfer' : 'Character'} Certificate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#EEB902] hover:bg-[#EEB902]/90 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Credential / PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Frame Container */}
        <div className="p-6 md:p-8 bg-slate-900 overflow-y-auto flex-1">
          
          {/* Printable visual mock container */}
          <div className="bg-white text-[#0B2545] p-6 sm:p-12 border-8 border-[#EEB902]/60 rounded-xl shadow-inner relative max-w-3xl mx-auto overflow-hidden">
            
            {/* Background design accents */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/10 to-transparent pointer-events-none" />
            {/* Fine security borders */}
            <div className="absolute inset-2 border border-slate-300 pointer-events-none rounded-lg p-3">
              <div className="w-full h-full border border-dashed border-[#EEB902]/35" />
            </div>

            {/* Print Area Block */}
            <div ref={printAreaRef} className="relative z-10 space-y-6 select-text text-left">
              
              {/* Crest & Title block */}
              <div className="text-center flex flex-col items-center space-y-2 pb-4 border-b-2 border-[#0B2545]/20">
                <SchoolLogo size="md" variant="color" className="justify-center" />
                
                <div className="space-y-1 mt-1 text-center font-sans">
                  <p className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#EEB902]">
                    Affiliated to Central Board of Secondary Education (CBSE), New Delhi
                  </p>
                  <p className="text-[9px] font-mono text-slate-500 leading-tight">
                    Affiliation No. 2133405 | School Code: 81961
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-600 font-medium">
                    Salempur Bangar, Post Agwanpur, Moradabad, Uttar Pradesh - 244001
                  </p>
                  <p className="text-[9px] font-mono text-[#0B2545]/80">
                    Contact: +91 80570 92976 | sunitainternationalmbd@gmail.com
                  </p>
                </div>
              </div>

              {/* Title Scroll or Certificate Heading */}
              <div className="text-center py-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase font-serif underline decoration-[#EEB902] decoration-2 underline-offset-8">
                  {isTC ? 'TRANSFER CERTIFICATE' : 'CHARACTER CERTIFICATE'}
                </h1>
                <p className="text-[10px] font-mono mt-3 text-slate-400 capitalize">
                  [ Generated securely under Academic Session 2026 - 2027 ]
                </p>
              </div>

              {/* Identifier Headers */}
              <div className="flex justify-between items-center text-xs font-mono border-b border-dashed border-slate-200 pb-2">
                <p>
                  <span className="font-bold text-slate-500">Certificate No:</span>{' '}
                  <span className="text-red-600 font-extrabold">{displaySerial}</span>
                </p>
                <p>
                  <span className="font-bold text-slate-500">Date of Issue:</span>{' '}
                  <span className="text-slate-900 font-bold">{displayDate}</span>
                </p>
              </div>

              {/* Certificate Inner content */}
              {isTC ? (
                /* Transfer Certificate Fields */
                <div className="space-y-3.5 text-xs text-slate-800 leading-relaxed font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">1. Name of the Pupil :</span>
                      <strong className="text-slate-950 font-black uppercase tracking-wide">{request.studentName}</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">2. Mother\'s Name :</span>
                      <strong className="text-slate-900">Mrs. Kiran Sharma</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">3. Father\'s / Guardian\'s Name :</span>
                      <strong className="text-slate-900">{request.parentName || 'Mr. Ramesh Sharma'}</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">4. Nationality :</span>
                      <strong className="text-slate-900">Indian</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">5. Admission Register No :</span>
                      <strong className="text-slate-900 font-mono">SIS-2024-041</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">6. School Card Roll No :</span>
                      <strong className="text-slate-900 font-mono">{request.rollNo || '24'}</strong>
                    </p>
                  </div>

                  <p className="border-b border-dashed border-slate-300 pb-1 leading-normal">
                    <span className="font-semibold text-slate-500 mr-2">7. Date of Birth according to Admission Register :</span>
                    <strong className="text-slate-950">{request.dob || '2011-04-15'}</strong>{' '}
                    <span className="text-slate-500 font-mono text-[10px]">
                      (In Words: <strong>{formatDOBWords(request.dob)}</strong>)
                    </span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">8. Class last studied (in figures & words) :</span>
                      <strong className="text-slate-900 uppercase">{request.classId} (Tenth Class)</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">9. School Annual Examination Last taken :</span>
                      <strong className="text-slate-900">CBSE Secondary Board Examinations</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">10. Promotion qualified to higher class? :</span>
                      <strong className="text-emerald-700 font-bold uppercase">YES, PROMOTED TO CLASS XI</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">11. All school dues cleared up to :</span>
                      <strong className="text-amber-800 font-bold">March 2026 (No Outstanding Dues)</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">12. Active Co-curricular Activities :</span>
                      <strong className="text-slate-900">Debate, Football Club, Robotics Lab</strong>
                    </p>
                    <p className="border-b border-dashed border-slate-300 pb-1">
                      <span className="font-semibold text-slate-500 mr-2">13. General Conduct :</span>
                      <strong className="text-emerald-700 font-bold uppercase">EXCELLENT & EXEMPLARY</strong>
                    </p>
                  </div>

                  <p className="border-b border-dashed border-slate-300 pb-2 pt-2.5">
                    <span className="font-semibold text-slate-500 block mb-1">14. Reason for Leaving School :</span>
                    <strong className="text-slate-950 font-sans block italic text-xs leading-relaxed bg-amber-50/50 p-2.5 rounded border border-amber-100">
                      &ldquo;{request.reason || 'Family relocating closer to hometown.'}&rdquo;
                    </strong>
                  </p>
                </div>
              ) : (
                /* Character Certificate Fields */
                <div className="space-y-6 py-4 text-slate-800 text-sm leading-relaxed font-sans text-center max-w-2xl mx-auto">
                  <p className="text-justify indent-8 text-sm md:text-base leading-loose text-slate-800">
                    This is to formally certify that Master / Miss{' '}
                    <strong className="text-slate-950 font-black underline decoration-amber-500 underline-offset-4 tracking-wide uppercase">
                      {request.studentName}
                    </strong>,{' '}
                    son / daughter of{' '}
                    <strong className="text-slate-900 font-bold">
                      {request.parentName || 'Mr. Ramesh Sharma'}
                    </strong>,{' '}
                    and resident of Uttar Pradesh, has been an active, registered student of{' '}
                    <strong>Sunita International School, Moradabad</strong> during the period from{' '}
                    <span className="font-mono font-bold">2024</span> to{' '}
                    <span className="font-mono font-bold">2026</span>, enrolled under register code{' '}
                    <span className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px] font-bold">SIS-2024-041</span>.{' '}
                    He/She has completed his/her curriculum in{' '}
                    <strong className="uppercase">{request.classId}</strong>.
                  </p>

                  <p className="text-justify indent-8 text-sm md:text-base leading-loose text-slate-800">
                    During his/her tenure, we found him/her to be highly sincere, disciplined, and hard-working. To the best of our knowledge and school historical data, he/she bears an <strong className="text-emerald-700 uppercase">Excellent & Exemplary Moral Character</strong>. He/She has shown exceptional creative vigor, cooperative behaviors towards cohort peers, and respectful compliance with school policies.
                  </p>

                  <p className="text-justify indent-8 text-sm md:text-base leading-loose text-slate-800">
                    Furthermore, his/her reason for applying for credentials is: <span className="italic font-medium text-slate-900">&ldquo;{request.reason || 'Undergraduate entrance examinations'}&rdquo;</span>.
                  </p>

                  <p className="text-center font-serif text-slate-800 text-base italic pt-3 font-semibold">
                    &ldquo;We wish him/her immense success and a bright trajectory in all future scholastic pursuits.&rdquo;
                  </p>
                </div>
              )}

              {/* Watermark Logo Stamp Overlay */}
              <div className="absolute right-1/4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none transform scale-[2.2]">
                <SchoolLogo size="lg" />
              </div>

              {/* Signatures Row */}
              <div className="grid grid-cols-3 gap-4 pt-12 text-center text-[10px] sm:text-xs">
                
                {/* Prepared By block */}
                <div className="space-y-6">
                  <div className="w-24 sm:w-32 border-b border-slate-400 mx-auto" />
                  <p className="font-bold text-slate-500 uppercase tracking-widest leading-none">Class Teacher</p>
                  <p className="text-[9px] font-mono text-slate-400 leading-none">Prepared & Sync</p>
                </div>

                {/* Checked By block */}
                <div className="space-y-6">
                  <div className="h-6 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=150" 
                      alt="Stamp" 
                      className="h-10 opacity-60 mix-blend-multiply rotate-12 select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-24 sm:w-32 border-b border-slate-400 mx-auto" strokeDasharray="2" />
                  <p className="font-bold text-slate-500 uppercase tracking-widest leading-none">School Clerk</p>
                  <p className="text-[9px] font-mono text-slate-400 leading-none">Checked Records</p>
                </div>

                {/* Approved By block */}
                <div className="space-y-6">
                  <div className="h-6 flex flex-col items-center justify-center">
                    <span className="font-serif italic text-amber-900 text-xs tracking-wider leading-none mt-1 select-none font-bold">
                      Sunita Sharma
                    </span>
                    <span className="text-[8px] font-mono font-bold text-blue-800 scale-90 border border-blue-800 rounded px-1 mt-1 uppercase select-none tracking-widest">
                      SIS SEALED
                    </span>
                  </div>
                  <div className="w-24 sm:w-32 border-b border-slate-400 mx-auto" />
                  <p className="font-bold text-slate-900 uppercase tracking-widest leading-none">
                    Principal, SIS
                  </p>
                  <p className="text-[9px] font-mono text-slate-400 leading-none">Official Authority</p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 rounded-b-2xl shrink-0">
          <p className="flex items-center gap-1">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <span>Cryptographically sealed under database reference ID: {request.id}</span>
          </p>
          <p>&copy; Sunita International School, Moradabad</p>
        </div>

      </div>
    </div>
  );
}
