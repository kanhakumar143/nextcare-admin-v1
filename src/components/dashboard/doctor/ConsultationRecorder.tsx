"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play } from "lucide-react";
import { toast } from "sonner";
import { updateVisitNote } from "@/store/slices/doctorSlice";
import { useDispatch } from "react-redux";
import { getTranscriptionText } from "@/services/doctor.api";

interface ConsultationRecorderProps {
  appointmentId?: string;
  onTranscriptionLoading?: (loading: boolean) => void;
}

export default function ConsultationRecorder({
  appointmentId,
  onTranscriptionLoading,
}: ConsultationRecorderProps) {
  const dispatch = useDispatch();
  const [isRecording, setIsRecording] = useState(false);
  // const [showRecordingAnim, setShowRecordingAnim] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const textDrNote =
    // "The patient experiences a dull, continuous headache that is worse in the morning but persists through the day. There is no nausea, suggesting the pain is more likely related to tension or lifestyle factors than migraine. Sleep quality is reported as poor, which can aggravate headaches, reduce daily energy, and increase long-term health risks. The family history is significant: the patient’s father had hypertension and suffered a stroke at age 60. This indicates a strong genetic risk for cardiovascular disease. Combined with lifestyle habits, this raises concern for developing high blood pressure or related complications. The patient’s diet is high in salt and processed food, both of which are linked to hypertension and poor cardiovascular outcomes. Minimal physical activity is also noted, which worsens sleep quality, stress, and vascular health. Stress levels are high, further contributing to headaches and overall health risk."
    "This patient presents with symptoms of gingivitis, including bleeding gums (primarily when brushing in the morning), bad breath, and localized redness. There is also a mention of a loose tooth and occasional tiredness. The patient has a history of diabetes, which is not consistently well-controlled. They do not smoke or use tobacco products, and have not experienced fever or facial swelling.";

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
      // setShowRecordingAnim(true);
      toast.success("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  useEffect(() => {
    if (!audioBlob) return;
    transcribeAudio(audioBlob);
  }, [audioBlob]);

  const transcribeAudio = async (audio: any) => {
    if (onTranscriptionLoading) onTranscriptionLoading(true);
    const formData = new FormData();
    formData.append("audio_file", audio, "consultation.mp3");
    formData.append("language", "en");
    try {
      const response = await getTranscriptionText(formData);
      dispatch(
        updateVisitNote({ field: "summary", value: response.transcribed_text })
      );
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error("Failed to transcribe audio.");
    } finally {
      if (onTranscriptionLoading) onTranscriptionLoading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // setShowRecordingAnim(false);
    }
  };

  return (
    <div className="space-y-4">
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

      {/* {audioUrl && (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Play className="h-4 w-4 text-gray-600" />
          <audio controls className="flex-1">
            <source src={audioUrl} type="audio/webm" />
            <source src={audioUrl} type="audio/ogg" />
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )} */}
    </div>
  );
}
