"use client";

import React, { useState } from "react";
import { Minus, X, ArrowUp } from "lucide-react";

interface AITranscriptionLoaderProps {
  step: "transcribing" | "analyzing" | "recommending";
  onClose?: () => void; // optional close callback
}

const stepTexts: Record<AITranscriptionLoaderProps["step"], string> = {
  transcribing: "Transcribing patient conversation",
  analyzing: "Analyzing symptoms and diagnosis",
  recommending: "Recommending best medications & tests",
};

export default function AITranscriptionLoader({
  step,
  onClose,
}: AITranscriptionLoaderProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {/* Fullscreen Loader */}
      {!minimized && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-200 relative w-96">
            {/* Minimize + Close */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => setMinimized(true)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>

            {/* Futuristic Orbital Loader */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full border border-cyan-400/30 animate-spin-slow" />
              <div className="absolute w-16 h-16 rounded-full border border-violet-500/30 animate-spin-reverse-slow" />
              <span className="absolute top-0 w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_#38bdf8] animate-orbit" />
              <span className="absolute bottom-0 w-5 h-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 shadow-[0_0_15px_#a855f7] animate-orbit-reverse" />
            </div>

            {/* Step text */}
            <div className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 animate-pulse text-center">
              {stepTexts[step]}
            </div>
          </div>
        </div>
      )}

      {/* Minimized Floating Loader */}
      {minimized && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-200 relative w-72">
            {/* Expand + Close */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => setMinimized(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                <ArrowUp className="w-4 h-4 text-gray-600" />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>

            {/* Mini Orbital Loader */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute w-14 h-14 rounded-full border border-cyan-400/30 animate-spin-slow" />
              <div className="absolute w-10 h-10 rounded-full border border-violet-500/30 animate-spin-reverse-slow" />
              <span className="absolute top-0 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_#38bdf8] animate-orbit" />
              <span className="absolute bottom-0 w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 shadow-[0_0_12px_#a855f7] animate-orbit-reverse" />
            </div>

            {/* Step text */}
            <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-center">
              {stepTexts[step]}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
