/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  MapPin, 
  Award, 
  Users, 
  GraduationCap, 
  BookMarked, 
  Calendar,
  Send,
  CheckCircle2,
  Phone,
  BookmarkPlus,
  HelpCircle,
  Mail,
  FileText,
  Check
} from 'lucide-react';
import { AdmissionEnquiry } from '../types';
import SchoolLogo from './SchoolLogo';

interface EnquiryFormProps {
  onSubmitEnquiry: (enquiry: Omit<AdmissionEnquiry, 'id' | 'status' | 'date'>) => Promise<void>;
}

export default function EnquiryForm({ onSubmitEnquiry }: EnquiryFormProps) {
  // Form Type Selection
  const [formType, setFormType] = useState<'enquiry' | 'application'>('enquiry');

  // Shared Form State
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gradeSeeking, setGradeSeeking] = useState('Grade 9');
  const [message, setMessage] = useState('');
  
  // Comprehensive Admission Application States
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [previousMarks, setPreviousMarks] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [needsHostel, setNeedsHostel] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Facility Items
  const facilities = [
    {
      title: "Robotics & STEM Conservatory",
      desc: "Armed with 3D printers, IoT boards, and AI toolkits for design thinking workshops.",
      icon: Sparkles
    },
    {
      title: "Olympic Indoor Aquatics Dome",
      desc: "All-weather temperature regulated Olympic pool overseen by national champion coaches.",
      icon: Award
    },
    {
      title: "High-Cognition Smart Classrooms",
      desc: "Equipped with interactive tactile boards, dual cameras, and ambient noise-cancellation.",
      icon: Building2
    },
    {
      title: "Visual & Performing Arts Guild",
      desc: "Comprehensive conservatories for contemporary fine arts, hindustani classical, and western theatre.",
      icon: BookMarked
    }
  ];

  const handleDocumentToggle = (docName: string) => {
    if (selectedDocs.includes(docName)) {
      setSelectedDocs(selectedDocs.filter(d => d !== docName));
    } else {
      setSelectedDocs([...selectedDocs, docName]);
    }
  };

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentName.trim() || !email.trim()) return;
    setLoading(true);
    setSuccess(false);

    try {
      await onSubmitEnquiry({
        studentName,
        parentName,
        email,
        phone,
        gradeSeeking,
        message: message || (formType === 'application' ? `Formal Admission Application Submitted for ${studentName}` : 'Inquiry registered'),
        isFullApplication: formType === 'application',
        gender: formType === 'application' ? gender : undefined,
        dob: formType === 'application' ? dob : undefined,
        previousSchool: formType === 'application' ? previousSchool : undefined,
        previousMarks: formType === 'application' ? previousMarks : undefined,
        fatherOccupation: formType === 'application' ? fatherOccupation : undefined,
        motherName: formType === 'application' ? motherName : undefined,
        motherOccupation: formType === 'application' ? motherOccupation : undefined,
        address: formType === 'application' ? address : undefined,
        needsHostel: formType === 'application' ? needsHostel : undefined,
        documentsSubmitted: formType === 'application' ? selectedDocs : undefined,
      });

      // Resetting states
      setStudentName('');
      setParentName('');
      setEmail('');
      setPhone('');
      setGradeSeeking('Grade 9');
      setMessage('');
      setDob('');
      setPreviousSchool('');
      setPreviousMarks('');
      setFatherOccupation('');
      setMotherName('');
      setMotherOccupation('');
      setAddress('');
      setNeedsHostel(false);
      setSelectedDocs([]);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const documentOptions = [
    "Birth Certificate copy",
    "Candidate Passport Photo",
    "Transfer Certificate (TC)",
    "Last Class CBSE/State Report Card",
    "Aadhaar Card (UIDAI)"
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Majestic Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-2xl overflow-hidden border-b-8 border-[#EEB902] shadow-xl text-white">
        
        {/* Abstract background vector patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#EEB902_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

         <div className="relative max-w-4xl mx-auto px-6 py-12 md:py-16 text-center space-y-6 flex flex-col items-center">
          
          {/* Official Brand Logo */}
          <div className="bg-[#0B2545]/60 hover:bg-[#0B2545]/85 border border-slate-500/30 p-4 rounded-2xl shadow-lg inline-block transform hover:scale-105 transition-all duration-300">
            <SchoolLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#EEB902] text-[#0B2545] font-black text-[10px] md:text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow">
            <Award className="w-3.5 h-3.5" />
            Voted #1 International Day Boarding Institution
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black font-sans leading-tight tracking-tight text-white">
            Nurturing Smart Minds, <br />
            <span className="text-[#EEB902]">Shaping Future Pioneers.</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-200 max-w-2xl mx-auto font-sans leading-relaxed">
            Welcome to <span className="font-bold text-white">Sunita International School</span>. We synthesize a rigorous global curriculum with premier athletic development, creating balanced pathways for modern young achievers.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 pt-4 text-xs font-mono text-slate-200 w-full max-w-3xl">
            <span className="flex items-center gap-1.5 text-center justify-center">
              <MapPin className="w-4 h-4 text-[#EEB902] shrink-0" />
              <span>Salempur Bangar Post Agwanpur Moradabad Uttar Pradesh 244001</span>
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-200">
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#EEB902] shrink-0" />
              <span>+91 80570 92976, +91 84334 17870</span>
            </span>
            <span className="hidden md:inline text-slate-450">•</span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#EEB902] shrink-0" />
              <a href="mailto:sunitainternationalmbd@gmail.com" className="hover:underline hover:text-white transition duration-150">sunitainternationalmbd@gmail.com</a>
            </span>
          </div>
        </div>
      </div>

      {/* Legacy Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { label: "Founded Session", val: "2010" },
          { label: "Faculty-Student Ratio", val: "1 : 12" },
          { label: "Ivy League Success", val: "100%" },
          { label: "Curriculum Choice", val: "Cambridge & CBSE" }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-black text-[#0B2545] mt-1 font-mono">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Main Core Facilities Section & Enquiry Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Core Facilities Information (Left 3 columns if enquiry, Left 2 if big application is shown) */}
        <div className={`${formType === 'application' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6 transition-all duration-300`}>
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-black text-[#0B2545] flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#EEB902]" />
              World-Class Infrastructure
            </h3>
            <p className="text-sm text-slate-500">Creating inspiring spaces that redefine experimental learning.</p>
          </div>

          <div className={`grid grid-cols-1 ${formType === 'application' ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-4`}>
            {facilities.map((fac, idx) => {
              const IconComp = fac.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow transition duration-200">
                  <div className="p-2.5 rounded bg-[#0B2545]/5 text-[#0B2545] inline-block mb-3.5">
                    <IconComp className="w-5 h-5 text-[#EEB902]" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{fac.title}</h4>
                  <p className="text-xs text-slate-500 leading-normal mt-2 text-justify">{fac.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50/5 border-2 border-dashed border-[#EEB902] p-5 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-[#EEB902] text-[#0B2545] rounded-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm leading-tight">Accredited Academic Authority</h4>
              <p className="text-xs text-slate-500 leading-normal mt-1.5 text-justify">
                Sunita International School is approved and accredited by the Central Board of Higher Education, and operates under standard guidelines of international appraisal modules.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Admission Forms (Right columns - stretches to 3 columns if comprehensive form is active) */}
        <div className={`${formType === 'application' ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white p-6 rounded-xl border-t-4 border-[#0B2545] border-x border-b border-slate-200 shadow-lg space-y-6 transition-all duration-300`}>
          
          <div className="border-b pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-[#EEB902]" />
              <h3 className="text-base font-extrabold text-[#0B2545] uppercase tracking-wide leading-tight">
                Admissions Gateway
              </h3>
            </div>
            
            {/* Interactive Mode Toggler */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFormType('enquiry')}
                className={`py-2 text-xs font-bold rounded-md transition cursor-pointer text-center ${
                  formType === 'enquiry'
                    ? 'bg-[#0B2545] text-[#EEB902] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                1. Quick Enquiry
              </button>
              <button
                type="button"
                onClick={() => setFormType('application')}
                className={`py-2 text-xs font-bold rounded-md transition cursor-pointer text-center ${
                  formType === 'application'
                    ? 'bg-[#0B2545] text-[#EEB902] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                2. Full Application Form
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-snug">
              {formType === 'enquiry' 
                ? "Register a simple enquiry request. Our academic relations registrar will reach out within 24 operational hours."
                : "Fill out the formal application with absolute student biographical and administrative details."
              }
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 text-green-800 p-6 rounded-lg border border-green-200 flex flex-col items-center justify-center text-center space-y-3 animate-scale-up">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-sm font-bold">
                {formType === 'application' 
                  ? "Formal Admission Application Saved!" 
                  : "Enquiry Registered Successfully!"}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {formType === 'application' 
                  ? "Your complete application has been stored at the SIS Admission Desk. Our registrar will contact you to schedule the screening test shortly."
                  : "A confirmation note and prospectus guide have been sent to your email address. Thank you for your interest!"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSub} className="space-y-5 text-left text-slate-800">
              
              {/* Profile Overview segment */}
              <div className="space-y-4">
                <div className="border-l-4 border-[#0B2545] pl-2 py-0.5">
                  <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">Student Profile details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Candidate Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      placeholder="e.g. Prisha Mehra"
                      className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Grade Seeking Admission *</label>
                    <select
                      value={gradeSeeking}
                      onChange={e => setGradeSeeking(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    >
                      <option value="Kindergarten">Kindergarten / Prep</option>
                      <option value="Grade 1">Grade 1 to 5 Primary</option>
                      <option value="Grade 6">Grade 6 to 8 Middle</option>
                      <option value="Grade 9">Grade 9 Secondary</option>
                      <option value="Grade 10">Grade 10 Secondary</option>
                      <option value="Grade 11 Science">Grade 11 (Science Streams)</option>
                      <option value="Grade 11 Commerce">Grade 11 (Commerce Streams)</option>
                      <option value="Grade 12">Grade 12 Higher Secondary</option>
                    </select>
                  </div>
                </div>

                {formType === 'application' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Candidate Gender *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Male', 'Female', 'Other'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`py-2 text-xs font-bold rounded border transition cursor-pointer text-center ${
                              gender === g 
                                ? 'bg-[#0B2545] text-white border-[#0B2545]' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Family and Parent segment */}
              <div className="space-y-4">
                <div className="border-l-4 border-[#0B2545] pl-2 py-0.5">
                  <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">Parent/Guardian Biography</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Father / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      placeholder="e.g. Mr. Sanjay Mehra"
                      className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      {formType === 'application' ? "Father's Occupation *" : "Father's Occupation (optional)"}
                    </label>
                    <input
                      type="text"
                      required={formType === 'application'}
                      value={fatherOccupation}
                      onChange={e => setFatherOccupation(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>
                </div>

                {formType === 'application' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Mother's Name *</label>
                      <input
                        type="text"
                        required
                        value={motherName}
                        onChange={e => setMotherName(e.target.value)}
                        placeholder="e.g. Mrs. Sunita Mehra"
                        className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Mother's Occupation *</label>
                      <input
                        type="text"
                        required
                        value={motherOccupation}
                        onChange={e => setMotherOccupation(e.target.value)}
                        placeholder="e.g. Architect"
                        className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information segment */}
              <div className="space-y-4">
                <div className="border-l-4 border-[#0B2545] pl-2 py-0.5">
                  <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">Contact & Communications</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>
                </div>

                {formType === 'application' && (
                  <div className="space-y-4 animate-fade-in text-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Permanent Residence Address *</label>
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Complete residential address with landmark and Pin Code..."
                        className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 border p-3 rounded-md">
                      <input
                        type="checkbox"
                        id="hostelCheck"
                        checked={needsHostel}
                        onChange={e => setNeedsHostel(e.target.checked)}
                        className="w-4 h-4 text-[#0B2545] border-slate-300 rounded focus:ring-[#0B2545]"
                      />
                      <label htmlFor="hostelCheck" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                        Require SIS On-campus Hostel Boarding Accommodations?
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Educational History segment */}
              {formType === 'application' && (
                <div className="space-y-4 animate-fade-in text-slate-800">
                  <div className="border-l-4 border-[#0B2545] pl-2 py-0.5">
                    <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">Educational History</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Previous School Attended *</label>
                      <input
                        type="text"
                        required
                        value={previousSchool}
                        onChange={e => setPreviousSchool(e.target.value)}
                        placeholder="e.g. Modern Public School Sec 5"
                        className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Previous Class Grades % / Marks *</label>
                      <input
                        type="text"
                        required
                        value={previousMarks}
                        onChange={e => setPreviousMarks(e.target.value)}
                        placeholder="e.g. 8.8 CGPA / 88%"
                        className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                      />
                    </div>
                  </div>

                  {/* Documents Verified Checklist */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Documents Furnished for verification</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 border p-3.5 rounded-md">
                      {documentOptions.map(dName => {
                        const hasSelected = selectedDocs.includes(dName);
                        return (
                          <button
                            key={dName}
                            type="button"
                            onClick={() => handleDocumentToggle(dName)}
                            className="flex items-center gap-2 text-left text-slate-700 py-1 font-medium transition hover:text-slate-900 cursor-pointer"
                          >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              hasSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300'
                            }`}>
                              {hasSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </span>
                            <span className="truncate">{dName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Message remarks segment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  {formType === 'application' ? "Candidate Background & Remarks (optional)" : "Describe Candidate background & query details *"}
                </label>
                <textarea
                  rows={formType === 'application' ? 2 : 3}
                  required={formType === 'enquiry'}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={formType === 'application' 
                    ? "Athletic record, health conditions, or unique accomplishments..." 
                    : "Transferring boards, sport/cultural track records, extra-curricular queries... etc."
                  }
                  className="w-full text-xs px-3 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] font-black text-xs py-3.5 rounded-lg flex items-center justify-center gap-1.5 shadow transform transition hover:scale-102 cursor-pointer uppercase tracking-wider"
              >
                <Send className="w-4 h-4" />
                {loading 
                  ? 'Submitting Request...' 
                  : (formType === 'application' ? 'Submit Formal Admission Application' : 'Register Admission Enquiry')
                }
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
