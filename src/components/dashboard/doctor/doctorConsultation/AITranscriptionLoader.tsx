"use client";

import React, { useEffect, useState } from "react";
import { Minus, X, ArrowUp, Maximize, Minimize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import loadingAnimation from "../../../../../public/animation/Shining Stars.json";
import recordingAnimation from "../../../../../public/animation/Microphone record.json";
import RecordingWave from "@/components/common/RecordingWaveAnimation";
import { Label } from "recharts";

interface AITranscriptionLoaderProps {
  step: "transcribing" | "analyzing" | "recommending";
  onClose?: () => void; // optional close callback
  animationFor: boolean;
  recordingStatus: boolean;
  pauseRecord: boolean;
}

const stepTexts: Record<AITranscriptionLoaderProps["step"], string> = {
  transcribing: "Transcribing patient conversation",
  analyzing: "Analyzing symptoms and diagnosis",
  recommending: "Recommending best medications & tests",
};

export default function AITranscriptionLoader({
  step,
  onClose,
  animationFor,
  recordingStatus,
  pauseRecord,
}: AITranscriptionLoaderProps) {
  const [minimized, setMinimized] = useState(animationFor ? true : false);

  useEffect(() => {
    setMinimized(animationFor);
  }, [animationFor]);

  // Animation variants for the fullscreen modal
  const fullscreenVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      x: "100vw",
      y: "100vh",
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        duration: 0.6,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: "100vw",
      y: "100vh",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        duration: 0.5,
      },
    },
  };

  // Animation variants for the minimized modal
  const minimizedVariants = {
    hidden: {
      opacity: 0,
      scale: 0.3,
      x: 100,
      y: 100,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.3,
      x: 100,
      y: 100,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        duration: 0.3,
      },
    },
  };

  // Background overlay animation
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {/* Fullscreen Loader */}
      {!minimized && (
        <motion.div
          key="fullscreen"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="flex flex-col items-center gap-8 p-10 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 backdrop-blur-lg to-violet-600/10 rounded-2xl shadow-xl border-2 border-blue-300 relative w-96"
            variants={fullscreenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Minimize + Close */}
            <div className="absolute top-2 right-2 flex gap-2">
              <motion.button
                onClick={() => setMinimized(true)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Minimize className="w-4 h-4 text-gray-600" />
              </motion.button>
              {onClose && (
                <motion.button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-gray-600" />
                </motion.button>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {animationFor ? (
                <div>
                  <RecordingWave
                    isRecording={recordingStatus}
                    pauseRecord={pauseRecord}
                  />
                </div>
              ) : (
                <Lottie
                  animationData={loadingAnimation}
                  className="w-48 mx-auto"
                  loop
                />
              )}
            </motion.div>

            {/* Step text */}
            {!animationFor && (
              <motion.div
                className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 animate-pulse text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {stepTexts[step]}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Minimized Floating Loader */}
      {minimized && (
        <motion.div
          key="minimized"
          className="fixed bottom-6 right-6 z-[100]"
          variants={minimizedVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="flex flex-col items-center gap-3 p-4 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 backdrop-blur-lg to-violet-600/10 border-2 border-blue-500 relative w-72 rounded-xl shadow-2xl"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Expand + Close */}
            <div className="absolute top-2 right-2 flex gap-2">
              <motion.button
                onClick={() => setMinimized(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Maximize className="w-4 h-4 text-gray-600" />
              </motion.button>
              {onClose && (
                <motion.button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-gray-600" />
                </motion.button>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {animationFor ? (
                <RecordingWave
                  isRecording={recordingStatus}
                  pauseRecord={pauseRecord}
                />
              ) : (
                <Lottie
                  animationData={loadingAnimation}
                  className="w-48 mx-auto"
                  loop
                />
              )}
            </motion.div>

            {/* Step text */}
            {!animationFor && (
              <motion.div
                className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {stepTexts[step]}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
