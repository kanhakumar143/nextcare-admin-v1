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
    "Patient presents with dull continuous morning headaches, poor sleep, high stress, minimal activity, high-salt processed diet, and family history of hypertension and stroke.";

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
