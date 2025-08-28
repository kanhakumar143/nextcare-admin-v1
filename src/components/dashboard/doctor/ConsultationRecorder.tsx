"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play } from "lucide-react";
import { toast } from "sonner";
import { updateVisitNote } from "@/store/slices/doctorSlice";
import { useDispatch } from "react-redux";

interface ConsultationRecorderProps {
  appointmentId?: string;
}

export default function ConsultationRecorder({
  appointmentId,
}: ConsultationRecorderProps) {
  const dispatch = useDispatch();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const textDrNote =
    "The patient experiences a dull, continuous headache that is worse in the morning but persists through the day. There is no nausea, suggesting the pain is more likely related to tension or lifestyle factors than migraine. Sleep quality is reported as poor, which can aggravate headaches, reduce daily energy, and increase long-term health risks. The family history is significant: the patient’s father had hypertension and suffered a stroke at age 60. This indicates a strong genetic risk for cardiovascular disease. Combined with lifestyle habits, this raises concern for developing high blood pressure or related complications. The patient’s diet is high in salt and processed food, both of which are linked to hypertension and poor cardiovascular outcomes. Minimal physical activity is also noted, which worsens sleep quality, stress, and vascular health. Stress levels are high, further contributing to headaches and overall health risk.";

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = "audio/mp3";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm;codecs=opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/ogg;codecs=opus";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "audio/wav";
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        toast.success("Recording completed successfully!");
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    dispatch(updateVisitNote({ field: "summary", value: textDrNote }));
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
        className={isRecording ? "animate-pulse" : ""}
      >
        {isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Start Consultation
          </>
        )}
      </Button>
    </>
  );
}
