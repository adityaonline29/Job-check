import React from 'react';
import { Candidate, CandidateStatusRule, UserRole } from '../types';
import { formatFullDateTime } from '../utils/dateUtils';
import {
  UserCheck,
  Check,
  X,
  Clock,
  Archive,
  Lock,
} from 'lucide-react';

interface PendingApprovalsViewProps {
  candidates: Candidate[];
  statuses: CandidateStatusRule[];
  userRole: UserRole;
  onApproveCandidate: (candidate: Candidate) => void;
  onRejectApproval: (candidate: Candidate) => void;
}

export const PendingApprovalsView: React.FC<PendingApprovalsViewProps> = ({
  candidates,
  statuses,
  userRole,
  onApproveCandidate,
  onRejectApproval,
}) => {
  const isAdmin = userRole === 'admin';

  if (!isAdmin) {
    return (
      <div id="approvals-access-denied" className="py-12 max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Admin Approval Authority Required</h3>
          <p className="text-sm text-slate-500 mt-1">
            Recruiters cannot approve archiving requests. Only Admins can review candidates submitted for archive approval.
          </p>
        </div>
      </div>
    );
  }

  const pendingList = candidates.filter((c) => c.lifecycleState === 'pending_approval');

  return (
    <div id="pending-approvals-section" className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 id="page-title-approvals" className="text-2xl font-bold text-slate-900 tracking-tight">
            Pending Archive Approvals
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            {pendingList.length} Awaiting Signoff
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Status rules configured with <span className="font-medium text-slate-800">Archive = Yes &amp; Approval = Yes</span> require Admin signoff before candidates move to the Archive and their retention timer begins.
        </p>
      </div>

      {/* Approvals Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {pendingList.length === 0 ? (
          <div className="py-14 text-center text-slate-500">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 text-base">No pending approvals</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              When a recruiter assigns a status like &quot;Not Interested&quot; or &quot;Already Joined Another Company&quot;, the approval request will appear here for Admin review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingList.map((cand) => {
              const rule = statuses.find((s) => s.id === cand.statusId);
              const retentionDays = rule?.deleteAfterDays ?? 30;

              return (
                <div
                  key={cand.id}
                  id={`approval-row-${cand.id}`}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900 text-base">{cand.name}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending Approval
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span><strong>Role:</strong> {cand.role}</span>
                      <span>•</span>
                      <span><strong>Recruiter:</strong> {cand.recruiterName}</span>
                      <span>•</span>
                      <span><strong>Requested:</strong> {formatFullDateTime(cand.approvalRequestedAt)}</span>
                    </div>

                    {cand.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2 max-w-2xl mt-1">
                        &quot;{cand.notes}&quot;
                      </p>
                    )}

                    {/* Rule to be applied after approval */}
                    <div className="flex items-center gap-2 text-xs pt-1 text-indigo-900">
                      <span className="font-semibold">Target Status:</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 font-medium text-indigo-700">
                        {cand.statusName}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-slate-600">
                        Upon approval: Moves to Archive with{' '}
                        <strong className="text-indigo-700">{retentionDays}-Day</strong> retention timer.
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      id={`btn-reject-approval-${cand.id}`}
                      onClick={() => onRejectApproval(cand)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                      Reject &amp; Keep Active
                    </button>

                    <button
                      type="button"
                      id={`btn-approve-archive-${cand.id}`}
                      onClick={() => onApproveCandidate(cand)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Approve &amp; Archive
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
