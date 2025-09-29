"use client";
import { useEffect, useState, useRef } from "react";
import { Separator } from "../ui/separator";

interface RecordingWaveProps {
  isRecording: boolean;
  pauseRecord: boolean;
  analyser?: AnalyserNode | null;
  dataArray?: Uint8Array | null;
}

export default function RecordingWave({
  isRecording,
  pauseRecord,
  analyser,
  dataArray,
}: RecordingWaveProps) {
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(40).fill(8));
  const animationRef = useRef<number>(1);

  const getAudioData = () => {
    if (!analyser || !dataArray) return null;

    const audioDataArray = new Uint8Array(dataArray.length);
    analyser.getByteFrequencyData(audioDataArray);

    // Calculate average volume
    const average =
      dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;

    // Get frequency data for different ranges (bass, mid, treble)
    const bassRange = dataArray.slice(0, Math.floor(dataArray.length * 0.1));
    const midRange = dataArray.slice(
      Math.floor(dataArray.length * 0.1),
      Math.floor(dataArray.length * 0.4)
    );
    const trebleRange = dataArray.slice(Math.floor(dataArray.length * 0.4));

    const bass =
      bassRange.reduce((acc, val) => acc + val, 0) / bassRange.length;
    const mid = midRange.reduce((acc, val) => acc + val, 0) / midRange.length;
    const treble =
      trebleRange.reduce((acc, val) => acc + val, 0) / trebleRange.length;

    return { average, bass, mid, treble, raw: dataArray };
  };

  const updateWaveAnimation = () => {
    if (!isRecording || pauseRecord) return;

    const audioData = getAudioData();

    if (audioData) {
      const { raw } = audioData;
      // Create wave heights based on actual audio data
      setWaveHeights((prev) =>
        prev.map((_, index) => {
          // Map each bar to a frequency range
          const frequencyIndex = Math.floor((index / prev.length) * raw.length);
          const frequencyValue = raw[frequencyIndex] || 0;

          // Combine frequency data with some smoothing
          const baseHeight = 8;
          const maxHeight = 48;

          // Use frequency value and add some randomness for smoother animation
          const voiceHeight = (frequencyValue / 255) * (maxHeight - baseHeight);
          const smoothedHeight =
            baseHeight + voiceHeight * (0.7 + Math.random() * 0.3);

          return Math.max(baseHeight, Math.min(maxHeight, smoothedHeight));
        })
      );
    } else {
      // Fallback to random animation if no audio data
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 36) + 8)
      );
    }

    animationRef.current = requestAnimationFrame(updateWaveAnimation);
  };

  useEffect(() => {
    if (isRecording && !pauseRecord) {
      updateWaveAnimation();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Reset to idle state
      setWaveHeights(Array(40).fill(8));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, pauseRecord, analyser, dataArray]);

  if (!isRecording) return null;

  return (
    <div className="flex items-center justify-center space-x-1 h-16 w-full">
      {/* <Separator className="" /> */}
      {waveHeights.map((height, i) => (
        <div
          key={i}
          className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-full transition-all duration-75 ease-in-out"
          style={{
            width: "2px",
            height: `${height}px`,
            transform: `scaleY(${isRecording ? 1 : 0.5})`,
          }}
        />
      ))}
      {/* <Separator className="max-w-3xs" /> */}
    </div>
  );
}
