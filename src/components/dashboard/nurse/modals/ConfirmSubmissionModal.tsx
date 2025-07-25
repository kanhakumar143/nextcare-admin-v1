"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TriangleAlert } from "lucide-react";

interface ConfirmSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredQuestions: number;
}

export default function ConfirmSubmissionModal({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredQuestions,
}: ConfirmSubmissionModalProps) {
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const completionPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Submit Questionnaire?
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Please review your responses before submitting. This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Separator />

          {/* Summary Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Completion Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="text-black font-medium">Total Questions</div>
                <div className="text-2xl font-bold text-black">
                  {totalQuestions}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 font-medium">Answered</div>
                <div className="text-2xl font-bold text-green-700">
                  {answeredQuestions}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Progress</span>
                <span className="font-medium text-gray-800">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Warning for unanswered questions */}
            {unansweredQuestions > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-amber-600">
                    <TriangleAlert />
                  </div>
                  <div className="text-sm text-amber-700">
                    <span className="font-medium">
                      {unansweredQuestions} question
                      {unansweredQuestions !== 1 ? "s" : ""}
                    </span>{" "}
                    left unanswered. You can still submit, but consider
                    completing them for better care.
                  </div>
                </div>
              </div>
            )}

            {/* Success message for completed questionnaire */}
            {unansweredQuestions === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-green-600">✅</div>
                  <div className="text-sm text-green-700">
                    Great! You've answered all questions. Ready to submit.
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />
        </div>

        <DialogFooter className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} className="flex-1">
            Confirm Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
