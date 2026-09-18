import React, { useState } from 'react';
import { Candidate, UserRole } from '../types';
import { formatShortDate } from '../utils/dateUtils';
import {
  Archive,
  RotateCcw,
  Trash2,
  Search,
  Lock,
  Clock,
  CheckCircle2,
  Calendar,
  FastForward,
  Info,
} from 'lucide-react';

interface ArchivedCandidatesViewProps {
  candidates: Candidate[];
  userRole: UserRole;
  onRestoreCandidate: (candidate: Candidate) => void;
  onPermanentDeleteCandidate: (candidate: Candidate) => void;
  onSimulateTimeAdvance: (days: number) => void;
  onTriggerCleanupExpired: () => void;
}

export const ArchivedCandidatesView: React.FC<ArchivedCandidatesViewProps> = ({
  candidates,
  userRole,
  onRestoreCandidate,
  onPermanentDeleteCandidate,
  onSimulateTimeAdvance,
  onTriggerCleanupExpired,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'regular'>('all');

  const isAdmin = userRole === 'admin';

  // Section 6: Recruiters/Salespersons must NOT be able to view, search, open, or edit archived candidates
  if (!isAdmin) {
    return (
      <div id="archived-access-denied-view" className="py-12 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Restricted Access — Admin Only</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Recruiters and salespersons are strictly restricted from viewing, searching, opening, or editing archived candidate profiles (Rule 6).
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-left space-y-2">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-600" />
            Compliance &amp; Data Retention Policy:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Candidates moved to Archive are queued for scheduled deletion.</li>
            <li>Archived profiles are isolated to maintain recruiter pipeline focus and compliance.</li>
            <li>To view or restore candidates from this queue, switch to the Admin role using the role selector in the top bar.</li>
          </ul>
        </div>
      </div>
    );
  }

  // Filter archived candidates
  const archivedCandidates = candidates.filter(
    (c) => c.lifecycleState === 'archived'
  );

  const filteredCandidates = archivedCandidates.filter((cand) => {
    const matchesSearch =
      cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.statusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (urgencyFilter === 'urgent') {
      return cand.daysRemaining !== null && cand.daysRemaining <= 7;
    }
    if (urgencyFilter === 'regular') {
      return cand.daysRemaining !== null && cand.daysRemaining > 7;
    }
    return true;
  });

  const dueForPermanentDeletionCount = archivedCandidates.filter(
    (c) => c.daysRemaining !== null && c.daysRemaining <= 0
  ).length;

  return (
    <div id="archived-candidates-section" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 id="page-title-archived" className="text-2xl font-bold text-slate-900 tracking-tight">
              Archived Candidates
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-900 text-white">
              Admin Vault
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Candidates moved to Archive under cleanup rules. Restoring a candidate cancels the deletion timer and returns them to the Active Database.
          </p>
        </div>

        {/* Simulation & Retention Controls */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            id="btn-simulate-advance-7"
            onClick={() => onSimulateTimeAdvance(7)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Fast forward simulation by 7 days"
          >
            <FastForward className="w-3.5 h-3.5 text-indigo-600" />
            Simulate +7 Days
          </button>

          {dueForPermanentDeletionCount > 0 && (
            <button
              type="button"
              id="btn-trigger-cleanup-expired"
              onClick={onTriggerCleanupExpired}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer animate-pulse"
              title="Purge expired candidates per Rule 8"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Expired ({dueForPermanentDeletionCount})
            </button>
          )}
        </div>
      </div>

      {/* Info notice about Rule 7 & Rule 8 */}
      <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Candidate Lifecycle Governance:</span>
          <span className="text-indigo-800 ml-1">
            Archived candidates remain in this vault until their retention period expires, at which point permanent deletion executes automatically. Admin can restore candidates at any time prior to deletion.
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-archived"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate, status, role..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setUrgencyFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              urgencyFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Archived ({archivedCandidates.length})
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('urgent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              urgencyFilter === 'urgent'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Expires ≤ 7 Days
          </button>
          <button
            type="button"
            onClick={() => setUrgencyFilter('regular')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              urgencyFilter === 'regular'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            &gt; 7 Days
          </button>
        </div>
      </div>

      {/* Archive List Table (Matching Section 9 Specification) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="archived-candidates-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Lifecycle Badge</th>
                <th className="py-3.5 px-4">Archived On</th>
                <th className="py-3.5 px-4">Delete On</th>
                <th className="py-3.5 px-4">Days Remaining</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <Archive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-800 text-base">No archived candidates found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Candidates will appear here when assigned an auto-archiving status (like Busy or Wrong Number) or once approved by Admin.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => {
                  const days = cand.daysRemaining ?? 0;
                  const isExpiringSoon = days <= 7 && days > 0;
                  const isExpired = days <= 0;

                  return (
                    <tr
                      key={cand.id}
                      id={`archived-row-${cand.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Candidate Name & Info */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-slate-900">{cand.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{cand.role}</span>
                            <span>•</span>
                            <span>{cand.email}</span>
                          </div>
                          {cand.recruiterName && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              Assigned Recruiter: {cand.recruiterName}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          {cand.statusName}
                        </span>
                      </td>

                      {/* Badges (Archived, Scheduled for Deletion) */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Archive className="w-3 h-3" />
                            Archived
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-3xs font-medium ${
                              isExpired
                                ? 'bg-rose-100 text-rose-800'
                                : isExpiringSoon
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            Scheduled for Deletion
                          </span>
                        </div>
                      </td>

                      {/* Archived On */}
                      <td className="py-4 px-4 text-slate-700 whitespace-nowrap font-medium text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatShortDate(cand.archivedAt)}
                        </div>
                      </td>

                      {/* Delete On */}
                      <td className="py-4 px-4 text-slate-700 whitespace-nowrap font-medium text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatShortDate(cand.deleteAt)}
                        </div>
                      </td>

                      {/* Days Remaining */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center justify-center min-w-[32px] px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isExpiringSoon
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {isExpired ? '0 (Expired)' : days}
                        </span>
                      </td>

                      {/* Actions: Restore & Permanent Delete */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            id={`btn-restore-${cand.id}`}
                            onClick={() => onRestoreCandidate(cand)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                            title="Restore candidate to active database"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restore
                          </button>

                          <button
                            type="button"
                            id={`btn-delete-permanently-${cand.id}`}
                            onClick={() => onPermanentDeleteCandidate(cand)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Permanently delete now"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Restoring cancels the deletion timer and reactivates recruiter access.
            </span>
          </div>
          <span className="text-slate-400">
            Total in Archive: {archivedCandidates.length}
          </span>
        </div>
      </div>
    </div>
  );
};
