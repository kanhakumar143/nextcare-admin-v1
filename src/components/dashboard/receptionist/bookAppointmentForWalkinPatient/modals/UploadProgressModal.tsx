"use client";

import { Loader2, Check, FileImage, Scan } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ProgressModalProps {
  open: boolean;
  step: number; // 0: idle, 1: uploading, 2: analyzing, 3: completed
}

const steps = ["Uploading your image", "Analyzing your image"];

export const UploadProgressModal = ({ open, step }: ProgressModalProps) => {
  const renderIcon = (index: number) => {
    if (step === index + 1) {
      return <Loader2 className="animate-spin w-5 h-5 text-blue-500" />;
    } else if (step > index + 1) {
      return <Check className="text-green-500 w-5 h-5" />;
    } else {
      return <div className="w-5 h-5 border border-gray-300 rounded-full" />;
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="w-full max-w-sm">
        <DialogTitle>Processing your details</DialogTitle>

        {/* Custom Animation */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse">
              <div className="w-full h-full flex items-center justify-center">
                {step === 1 ? (
                  <FileImage className="w-8 h-8 text-blue-600 animate-bounce" />
                ) : step === 2 ? (
                  <Scan className="w-8 h-8 text-green-600 animate-pulse" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full" />
                )}
              </div>
            </div>
            <div className="absolute -inset-2 border-2 border-blue-400 rounded-full animate-spin opacity-30"></div>
          </div>
        </div>

        <div className="space-y-4 flex flex-col justify-center items-center">
          {steps.map((label, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 text-sm transition-all duration-300",
                step >= index + 1 ? "text-black font-medium" : "text-gray-400"
              )}
            >
              {renderIcon(index)}
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / steps.length) * 67}%` }}
            ></div>
          </div>
          <p className="text-xs text-center mt-2 text-gray-500">
            {step === 0
              ? "Preparing..."
              : step === 1
              ? "Uploading image to server..."
              : step === 2
              ? "Extracting document details..."
              : "Processing complete!"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
