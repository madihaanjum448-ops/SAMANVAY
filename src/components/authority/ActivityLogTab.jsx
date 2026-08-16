import React, { useMemo, useState } from 'react';
import { Clock, Download, Share2 } from 'lucide-react';
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';
import {
  ACTIVITY_PERIODS,
  filterActivityByPeriod,
  formatActivityDateTime
} from '../../utils/activityLogUtils';
import { downloadActivityReportPdf } from '../../utils/activityReportPdf';
import { sendActivityReport, isValidEmail } from '../../services/emailService';

export default function ActivityLogTab({ activity = [], user = null }) {
  const [periodKey, setPeriodKey] = useState('1w');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const [sending, setSending] = useState(false);

  const district = user?.district || 'Pune';
  const state = user?.state || 'Maharashtra';

  const filteredActivity = useMemo(
    () => filterActivityByPeriod(activity, periodKey),
    [activity, periodKey]
  );

  const handleDownloadPdf = () => {
    downloadActivityReportPdf({
      activities: filteredActivity,
      periodKey,
      district,
      state
    });
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareError('');
    setShareSuccess('');

    if (!isValidEmail(shareEmail)) {
      setShareError('Please enter a valid email address.');
      return;
    }

    setSending(true);
    const result = await sendActivityReport({
      to: shareEmail,
      periodLabel: ACTIVITY_PERIODS[periodKey].label,
      district,
      state,
      activities: filteredActivity
    });
    setSending(false);

    if (result.success) {
      setShareSuccess(result.message);
      setShareEmail('');
    } else {
      setShareError(result.error);
    }
  };

  return (
    <div className="bg-white border border-[#CBD5E1] p-5 shadow-2xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E2E8F0] pb-3">
        <div>
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">ACTIVITY LOG</h2>
          <p className="text-[10px] text-[#64748B] font-mono mt-0.5">
            System actions, coordination events and operational changes
          </p>
        </div>

        {/* Controls: Select dropdown and PDF/Share buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <div className="w-full sm:w-auto">
            <select
              id="activity-period"
              value={periodKey}
              onChange={(e) => setPeriodKey(e.target.value)}
              className="w-full sm:w-auto text-[11px] font-mono font-bold border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-[#0F172A] focus:outline-none focus:border-[#166534]"
            >
              {Object.entries(ACTIVITY_PERIODS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-none bg-[#166534] hover:bg-[#14532D] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-colors cursor-pointer font-mono text-center flex items-center justify-center gap-1"
            >
              <Download size={12} /> Download PDF
            </button>

            <button
              type="button"
              onClick={() => {
                setShowShareModal(true);
                setShareError('');
                setShareSuccess('');
              }}
              className="flex-1 sm:flex-none bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-colors cursor-pointer font-mono text-center flex items-center justify-center gap-1"
            >
              <Share2 size={12} /> Share Report
            </button>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-[#64748B] font-mono">
        Showing {filteredActivity.length} of {activity.length} records · {ACTIVITY_PERIODS[periodKey].label}
      </div>

      {/* Timeline items list */}
      <div className="space-y-3 max-w-4xl mx-auto py-2">
        {filteredActivity.length === 0 ? (
          <div className="py-8 text-center text-[11px] text-[#64748B] font-mono border border-dashed border-[#CBD5E1]">
            No activity recorded during this period.
          </div>
        ) : (
          filteredActivity.map((log) => (
            <div key={log.id} className="flex gap-3 items-start">
              <div className="mt-1 flex-shrink-0">
                <div className={`w-6 h-6 rounded-none border bg-white flex items-center justify-center text-xs ${
                  log.type === 'incident' && log.severity === 'CRITICAL'
                    ? 'border-[#DC2626] text-[#DC2626] font-bold'
                    : log.type === 'verification'
                    ? 'border-[#166534] text-[#166534]'
                    : 'border-[#CBD5E1] text-[#64748B]'
                }`}>
                  <Clock size={12} />
                </div>
              </div>

              <div className="flex-1 bg-[#F8FAFC] border border-[#CBD5E1] p-3 font-mono">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${
                      log.type === 'incident'
                        ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                        : log.type === 'verification'
                        ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#166534]'
                        : 'bg-white border-[#E2E8F0] text-[#64748B]'
                    }`}>
                      {log.action}
                    </span>
                    <h4 className="text-xs font-bold text-[#0F172A] mt-1.5 font-sans">{log.detail}</h4>
                  </div>
                  <span className="text-[10px] text-[#64748B] whitespace-nowrap">{formatActivityDateTime(log)}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#64748B] border-t border-[#E2E8F0] pt-1.5">
                  <span>TRIGGERED BY:</span>
                  <span className="text-[#0F172A] font-semibold font-sans">{log.actor}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Share Modal Dialog */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="SHARE ACTIVITY REPORT"
        size="sm"
      >
        <form onSubmit={handleShare} className="space-y-4">
          <p className="text-xs text-[#64748B]">
            Report period: <strong className="text-[#0F172A]">{ACTIVITY_PERIODS[periodKey].label}</strong>
            · {filteredActivity.length} records
          </p>

          <FormInput
            id="share-email"
            label="Email Address"
            type="email"
            placeholder="example@gmail.com"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            required
          />

          {shareError && (
            <p className="text-xs text-[#DC2626] font-semibold">{shareError}</p>
          )}
          {shareSuccess && (
            <p className="text-xs text-[#166534] font-semibold">{shareSuccess}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="px-4 py-2 text-xs font-bold uppercase border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 text-xs font-bold uppercase bg-[#166534] hover:bg-[#14532D] text-white cursor-pointer disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
