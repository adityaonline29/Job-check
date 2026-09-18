/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Candidate, CandidateStatusRule } from '../types';
import {
  AlertTriangle,
  ArrowRight,
  Archive,
  UserCheck,
  CheckCircle2,
  X,
  MessageSquare,
  Clock,
} from 'lucide-react';

interface StatusChangeConfirmationModalProps {
  isOpen: boolean;
  candidate: Candidate | null;
  newStatusRule: CandidateStatusRule | null;
  onClose: () => void;
  onConfirm: (candidateId: string, newStatusId: string, comment: string) => void;
}

export function StatusChangeConfirmationModal({
  isOpen,
  candidate,
  newStatusRule,
  onClose,
  onConfirm,
}: StatusChangeConfirmationModalProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setError(null);
    }
  }, [isOpen, candidate, newStatusRule]);

  if (!isOpen || !candidate || !newStatusRule) return null;

  const handleConfirm = () => {
    if (!comment.trim()) {
      setError('A comment explaining the status update is mandatory.');
      return;
    }
    onConfirm(candidate.id, newStatusRule.id, comment.trim());
    onClose();
  };

  // Rule effect determination
  const isArchive = newStatusRule.archive;
  const isApprovalReq = newStatusRule.approvalRequired;
  const retentionDays = newStatusRule.deleteAfterDays;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#006e88] flex items-center justify-center border border-sky-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Status Update
              </h3>
              <p className="text-2xs text-slate-500">
                Please provide notes explaining this status change
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Candidate & Status Transition Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Candidate:</span>
              <span className="font-bold text-slate-900">{candidate.name}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-2xs font-semibold bg-slate-200 text-slate-700">
                  {candidate.statusName}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2.5 py-0.5 rounded-md text-2xs font-bold bg-[#006e88] text-white shadow-2xs">
                  {newStatusRule.name}
                </span>
              </div>
            </div>
          </div>

          {/* Rule Outcome Notice */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              !isArchive
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : isApprovalReq
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-orange-50/70 border-orange-200 text-orange-900'
            }`}
          >
            {!isArchive ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Rule A: Stays in Active Database</span>
                  <p className="text-2xs text-blue-700 mt-0.5">
                    No archive will occur, no admin approval is required, and no deletion timer is set.
                  </p>
                </div>
              </>
            ) : isApprovalReq ? (
              <>
                <UserCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Rule C: Queued for Admin Approval</span>
                  <p className="text-2xs text-amber-700 mt-0.5">
                    Candidate will be sent to Admin Approval. Once approved, moves to Archive with a {retentionDays}-day retention countdown.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Rule B: Direct Archival</span>
                  <p className="text-2xs text-orange-700 mt-0.5">
                    Candidate moves directly to the Archive Vault. {retentionDays}-day deletion timer starts immediately.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Mandatory Comment Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="status-comment-input"
                className="text-xs font-semibold text-slate-800 flex items-center gap-1"
              >
                <span>Comment / Status Notes</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-3xs text-slate-400 font-medium">
                {comment.length} characters (Mandatory)
              </span>
            </div>

            <textarea
              id="status-comment-input"
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Discussed with candidate on phone; they requested follow-up next Monday afternoon..."
              className={`w-full p-3 text-xs bg-white border rounded-xl focus:outline-none transition-colors placeholder:text-slate-400 leading-relaxed ${
                error
                  ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                  : 'border-slate-300 focus:border-[#006e88] focus:ring-1 focus:ring-[#006e88]/20'
              }`}
            />

            {error && (
              <p className="text-2xs text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-status-change"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-[#006e88] hover:bg-[#005a70] rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm &amp; Update Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}
