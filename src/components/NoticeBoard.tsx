/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BellRing, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  User2, 
  ArrowRight,
  Sparkles,
  MessageSquare,
  Send,
  Check,
  Smartphone,
  Share2
} from 'lucide-react';
import { Notice, NoticeTarget, UserRole } from '../types';

interface NoticeBoardProps {
  notices: Notice[];
  currentRole: UserRole;
  authorName: string;
  onAddNotice: (notice: Omit<Notice, 'id' | 'createdAt'>, dispatchSms: boolean, dispatchWhatsapp: boolean) => Promise<void>;
  onDeleteNotice: (id: string) => Promise<void>;
  onQuickBroadcast?: (notice: Notice, channels: 'sms' | 'whatsapp' | 'both') => Promise<void>;
}

export default function NoticeBoard({ 
  notices, 
  currentRole, 
  authorName,
  onAddNotice, 
  onDeleteNotice,
  onQuickBroadcast
}: NoticeBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTarget, setFilterTarget] = useState<NoticeTarget | 'all_active'>('all_active');
  const [isAdding, setIsAdding] = useState(false);

  // Communication automatic toggles
  const [dispatchSms, setDispatchSms] = useState(true);
  const [dispatchWhatsapp, setDispatchWhatsapp] = useState(true);

  // Trigger loading state for individual quick broadcasts
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [broadcastSuccessText, setBroadcastSuccessText] = useState<Record<string, string>>({});

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetGroup, setTargetGroup] = useState<NoticeTarget>('all');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const canManage = currentRole === 'admin' || currentRole === 'teacher';

  const handleTriggerQuickBroadcast = async (notice: Notice, channel: 'sms' | 'whatsapp' | 'both') => {
    if (!onQuickBroadcast) return;
    const bKey = `${notice.id}_${channel}`;
    setBroadcastingId(bKey);
    try {
      await onQuickBroadcast(notice, channel);
      setBroadcastSuccessText(prev => ({
        ...prev,
        [notice.id]: `✓ Sent ${channel.toUpperCase()} broadcast to target registered recipients!`
      }));
      // clear success text after 4 seconds
      setTimeout(() => {
        setBroadcastSuccessText(prev => {
          const updated = { ...prev };
          delete updated[notice.id];
          return updated;
        });
      }, 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await onAddNotice({
        title,
        content,
        date,
        targetGroup,
        authorName,
        isUrgent
      }, dispatchSms, dispatchWhatsapp);
      setTitle('');
      setContent('');
      setTargetGroup('all');
      setIsUrgent(false);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterTarget === 'all_active') {
      return matchesSearch;
    }
    return matchesSearch && (item.targetGroup === filterTarget || item.targetGroup === 'all');
  });

  return (
    <div className="bg-slate-50 rounded-xl p-4 sm:p-6 shadow-md border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0B2545] flex items-center gap-2">
            <BellRing className="w-6 h-6 text-[#EEB902]" />
            Circular Notice Board
          </h2>
          <p className="text-sm text-slate-500">Official news, events guidelines and announcements from Sunita International Administration</p>
        </div>
        {canManage && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="self-start sm:self-center bg-[#0B2545] hover:bg-[#134074] text-[#EEB902] border border-[#EEB902] font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 transition shadow"
          >
            <Plus className="w-4 h-4" />
            Publish Notice
          </button>
        )}
      </div>

      {/* Add Notice Panel */}
      {isAdding && (
        <form onSubmit={handleSub} className="mb-6 p-4 bg-[#0B2545]/5 rounded-lg border border-[#0B2545]/20 animate-fade-in">
          <h3 className="text-base font-bold text-[#0B2545] mb-4 flex items-center gap-1.5 border-b pb-2">
            <Sparkles className="w-4 h-4 text-[#EEB902]" />
            Compose New School Notice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notice Title / Subject</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                placeholder="e.g. Revised Homework Policy or Annual Day Updates"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Group Audience</label>
              <select
                value={targetGroup}
                onChange={e => setTargetGroup(e.target.value as NoticeTarget)}
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              >
                <option value="all">All Groups</option>
                <option value="teachers">Teachers Only</option>
                <option value="students">Students Only</option>
                <option value="parents">Parents Only</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Circular Announcement</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              placeholder="State clear operational details, timings, dates, and coordinator contacts..."
            />
          </div>

          {/* Automatic Multi-Channel Broadcast Section */}
          <div className="mb-4 bg-emerald-50/60 p-4 rounded-xl border border-emerald-500/20 shadow-xs">
            <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
              <Share2 className="w-4 h-4 text-emerald-600 animate-pulse" />
              ⚡ Instant Multi-Channel Broadcast Channels
            </h4>
            <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
              When releasing this notice, automatically trigger a single-click cloud-simulated API send-out with customized name placeholders straight to parents and teachers of target group.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex-1 flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:border-emerald-500/40 cursor-pointer shadow-2xs transition">
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-[#0B2545] font-sans">Trigger SMS Alert</span>
                </span>
                <input
                  type="checkbox"
                  checked={dispatchSms}
                  onChange={(e) => setDispatchSms(e.target.checked)}
                  className="w-4.5 h-4.5 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>
              <label className="flex-1 flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:border-emerald-500/40 cursor-pointer shadow-2xs transition">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[#0B2545] font-sans">Trigger WhatsApp Delivery</span>
                </span>
                <input
                  type="checkbox"
                  checked={dispatchWhatsapp}
                  onChange={(e) => setDispatchWhatsapp(e.target.checked)}
                  className="w-4.5 h-4.5 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {currentRole === 'admin' && (
            <div className="mb-4 bg-red-50 p-3.5 rounded-lg border border-red-200 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <BellRing className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <label htmlFor="isUrgent" className="block text-xs font-extrabold text-red-900 uppercase">
                    Urgent Circular Alert / Push broadcast
                  </label>
                  <p className="text-[11px] text-red-700 font-medium">
                    This will display a high-visibility persistent visual warning alert at the top of Student & Parent dashboards and broadcast browser notifications.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isUrgent"
                  type="checkbox"
                  checked={isUrgent}
                  onChange={e => setIsUrgent(e.target.checked)}
                  className="w-5 h-5 text-red-600 bg-white border-red-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-red-800 font-mono">Urgent</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0B2545] hover:bg-[#134074] text-white font-bold text-xs px-5 py-2 rounded-md shadow transition"
            >
              {loading ? 'Publishing...' : 'Publish Board Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* Query Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search circular title or keyword details..."
            className="w-full text-sm pl-10 pr-4 py-2 fill-slate-50 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all_active', label: 'All Notices' },
            { id: 'parents', label: 'For Parents' },
            { id: 'students', label: 'For Students' },
            { id: 'teachers', label: 'For Teachers' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterTarget(opt.id as any)}
              className={`text-xs px-4 py-2 rounded-md font-semibold transition whitespace-nowrap cursor-pointer ${
                filterTarget === opt.id
                  ? 'bg-[#EEB902] text-[#0B2545] font-black'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notice list */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-400 font-mono text-sm">No notices found matching current filtering criteria.</p>
          </div>
        ) : (
          filteredNotices.map((n) => {
            // style mapping based on audience tag for visuals
            const tagStyle = (tg: NoticeTarget) => {
              switch (tg) {
                case 'all': return 'bg-blue-100 text-blue-800';
                case 'parents': return 'bg-purple-100 text-purple-800';
                case 'teachers': return 'bg-amber-100 text-amber-800';
                case 'students': return 'bg-green-100 text-green-800';
              }
            };
            const isNoticeUrgent = n.isUrgent === true;
            return (
              <div 
                key={n.id} 
                className={`bg-white rounded-lg p-5 border-l-4 shadow-xs hover:shadow-md transition duration-200 relative ${
                  isNoticeUrgent 
                    ? 'border-red-600 bg-red-50/20 ring-1 ring-red-200' 
                    : 'border-[#0B2545]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-500 uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {n.date}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${tagStyle(n.targetGroup)}`}>
                      Audience: {n.targetGroup}
                    </span>
                    {isNoticeUrgent && (
                      <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <BellRing className="w-3 h-3" /> URGENT ALERT
                      </span>
                    )}
                  </div>
                  {(currentRole === 'admin' || (currentRole === 'teacher' && n.authorName.includes('Verma'))) && (
                    <button
                      onClick={() => onDeleteNotice(n.id)}
                      className="text-slate-400 hover:text-red-600 transition p-1 rounded-full hover:bg-red-50"
                      title="Remove this bulletin announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h4 className="text-base font-bold text-[#0B2545] mb-2 leading-snug">{n.title}</h4>
                <p className="text-sm text-slate-600 text-justify whitespace-pre-wrap leading-relaxed mb-4">{n.content}</p>
                
                {canManage && onQuickBroadcast && (
                  <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <p className="text-[11px] font-black text-[#0B2545] uppercase tracking-wider flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5 text-[#EEB902]" />
                          Single-Click Push Broadcasts
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold font-sans">Simulate SMS/WhatsApp delivery to all target registered recipients in 1 click</p>
                      </div>

                      {broadcastSuccessText[n.id] ? (
                        <div className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-250 px-3 py-1.5 rounded-lg animate-fade-in flex items-center gap-1.5 shadow-sm">
                          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                          {broadcastSuccessText[n.id]}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
                          <button
                            type="button"
                            disabled={broadcastingId !== null}
                            onClick={() => handleTriggerQuickBroadcast(n, 'sms')}
                            className="bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-sky-200 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-3xs"
                            title="Instant SMS Delivery Dispatch"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                            {broadcastingId === `${n.id}_sms` ? 'Sending...' : 'SMS Blast'}
                          </button>
                          <button
                            type="button"
                            disabled={broadcastingId !== null}
                            onClick={() => handleTriggerQuickBroadcast(n, 'whatsapp')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-emerald-200 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-3xs"
                            title="Instant WhatsApp Template Delivery"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            {broadcastingId === `${n.id}_whatsapp` ? 'Sending...' : 'WhatsApp Blast'}
                          </button>
                          <button
                            type="button"
                            disabled={broadcastingId !== null}
                            onClick={() => handleTriggerQuickBroadcast(n, 'both')}
                            className="bg-[#0B2545] hover:bg-[#134074] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
                            title="Instant Multi-channel Delivery Dispatch"
                          >
                            <Send className="w-3 h-3 text-[#EEB902]" />
                            {broadcastingId === `${n.id}_both` ? 'Dispatching...' : 'Send Both'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <User2 className="w-3.5 h-3.5 text-[#EEB902]" />
                    {n.authorName}
                  </span>
                  <span className="text-[10px] italic">Circular Ref: #{n.id}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
