"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteTemplateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  templateName: string;
}

export default function DeleteTemplateConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  templateName,
}: DeleteTemplateConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Delete Template
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete the template{" "}
            <span className="font-medium text-gray-900">"{templateName}"</span>?
            This will permanently remove the template and all its
            configurations.
          </p>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
          >
            Delete Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
