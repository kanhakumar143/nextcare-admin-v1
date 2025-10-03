"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause } from "lucide-react";
import AITranscriptionLoader from "./AITranscriptionLoader";
import { toast } from "sonner";
import {
  setAiSuggestedchiefComplaint,
  // setAiSuggestedLabTests,
  // setAiSuggestedMedications,
  updateVisitNote,
} from "@/store/slices/doctorSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  analyzeConversation,
  getTranscriptionText,
  suggestMedicalRecommendations,
} from "@/services/doctor.api";
import { RootState } from "@/store";
import RecordingWave from "@/components/common/RecordingWaveAnimation";
import {
  setAiSuggestedLabTests,
  setAiSuggestedMedications,
} from "@/store/slices/doctorConsultationSlice";
import WavesurferPlayer from "@wavesurfer/react";

interface ConsultationRecorderProps {
  appointmentId?: string;
  onTranscriptionLoading?: (loading: boolean) => void;
  onPauseRecording?: (paused: boolean) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

export default function ConsultationRecorder({
  // appointmentId,
  // onTranscriptionLoading,
  onPauseRecording,
  onRecordingStart,
  onRecordingStop,
}: ConsultationRecorderProps) {
  const dispatch = useDispatch();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationForRecord, setAnimationForRecord] = useState<boolean>(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { appointmentIdTemp } = useSelector((state: RootState) => state.doctor);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState<
    "transcribing" | "analyzing" | "recommending"
  >("transcribing");
  const [wavesurfer, setWavesurfer] = useState<any | null>(null);

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause();
  };
  const startRecording = async () => {
    try {
      // onTranscriptionLoading(true);
      setAiLoading(true);
      // onPlayPause();
      setAnimationForRecord(true);
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
      setShowRecordingUI(true);
      onRecordingStart?.();
      toast.success("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      onPauseRecording?.(true);
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      toast.info("Recording paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      onPauseRecording?.(false);
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      toast.success("Recording resumed");
    }
  };

  useEffect(() => {
    dispatch(setAiSuggestedLabTests([]));
    dispatch(setAiSuggestedMedications([]));
    if (!audioBlob) return;

    const response = {
      medicines: [
        {
          name: "Paracetamol",
          brand: "Tylenol",
          strength: "500mg",
          form: "Tablet",
          route: "Oral",
          frequency: "Three times daily",
          timing: "After meals",
          duration: "As needed for fever and headache",
          ai_note:
            "For symptomatic relief of fever and headache. A common and relatively safe antipyretic and analgesic.",
        },
        {
          name: "Domperidone",
          brand: "Motilium",
          strength: "10mg",
          form: "Tablet",
          route: "Oral",
          frequency: "Three times daily",
          timing: "30 minutes before meals",
          duration: "As needed for vomiting",
          ai_note:
            "An antiemetic to help reduce nausea and vomiting. Should be used cautiously and not for prolonged periods.",
        },
        {
          name: "Artesunate-Amodiaquine",
          brand: "Coarsucam",
          strength:
            "Variable (based on weight, follow manufacturer's instructions)",
          form: "Tablet",
          route: "Oral",
          frequency: "Once daily",
          timing: "With food",
          duration: "3 days",
          ai_note:
            "First-line treatment for uncomplicated malaria, *only to be started after positive malaria test*. Follow local guidelines for appropriate dosing based on patient weight.",
        },
        {
          name: "Oral Rehydration Solution (ORS)",
          brand: "Various",
          strength: "Variable",
          form: "Powder for solution",
          route: "Oral",
          frequency: "As needed",
          timing: "Throughout the day",
          duration: "Until hydration improves",
          ai_note:
            "To prevent and treat dehydration due to vomiting or fever. Helps replace lost fluids and electrolytes.",
        },
      ],
      investigations: [
        {
          test_name: "Complete Blood Count (CBC)",
          intent:
            "Assess overall blood health, identify signs of infection or anemia",
          priority: "High",
          abcd: "vsdhbvkjdsv",
          ai_note:
            "To evaluate white blood cell count (for infection), red blood cell count (for anemia), and platelet count. May reveal signs of malaria or other infections.",
        },
        {
          test_name: "Malaria Rapid Diagnostic Test (RDT)",
          intent: "Detect malaria parasites in the blood",
          priority: "High",
          ai_note:
            "A rapid and convenient test for detecting malaria antigens, which is essential to confirm the diagnosis.",
        },
        // {
        //   test_name: "Peripheral Blood Smear for Malaria Parasites",
        //   intent: "Confirm the presence and species of malaria parasites",
        //   priority: "High",
        //   ai_note:
        //     "Microscopic examination of a blood smear is the gold standard for malaria diagnosis. It allows for parasite identification and quantification.",
        // },
        // {
        //   test_name: "Liver Function Tests (LFTs)",
        //   intent:
        //     "Assess liver function, which can be affected by malaria or medications",
        //   priority: "Medium",
        //   ai_note:
        //     "Malaria and some antimalarial drugs can affect liver function. LFTs help monitor for liver damage.",
        // },
        // {
        //   test_name: "Renal Function Tests (RFTs)",
        //   intent:
        //     "Assess kidney function, dehydration, or potential complications of malaria",
        //   priority: "Medium",
        //   ai_note:
        //     "Malaria can sometimes cause kidney complications. RFTs help evaluate kidney function and guide fluid management.",
        // },
      ],
      token_usage: {
        prompt_tokens: 445,
        completion_tokens: 878,
        total_tokens: 1323,
      },
    };

    // transcribeAudio(audioBlob);
    setAiLoading(true);
    setAiStep("transcribing");
    dispatch(setAiSuggestedLabTests(response.investigations || []));
    dispatch(setAiSuggestedMedications(response.medicines || []));
    // setAiStep("analyzing");
  }, [audioBlob]);

  const transcribeAudio = async (audio: any) => {
    setAiLoading(true);
    setAiStep("transcribing");
    const formData = new FormData();
    formData.append("audio_file", audio, "consultation.mp3");
    formData.append("language", "en");
    try {
      const response = await getTranscriptionText(formData);
      dispatch(
        updateVisitNote({ field: "summary", value: response.transcribed_text })
      );
      setAiStep("analyzing");
      await findChiefComplaintFields(response);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error("Failed to transcribe audio.");
      setAiLoading(false);
    }
  };

  const findChiefComplaintFields = async (data: any) => {
    const payload = {
      conversation: data.transcribed_text,
      appointment_id: appointmentIdTemp || "",
      groq_transcription_id: data.id || "",
    };

    console.log("AI Analysis Payload:", payload);
    try {
      const response = await analyzeConversation(payload);
      console.log("AI Analysis Response:", response);
      setAiStep("recommending");
      await fetchMedicalRecommendations(response);
      dispatch(
        setAiSuggestedchiefComplaint({
          chief_complaint: response.chief_complaint || "",
          provisional_diagnosis: response.provisional_diagnosis || "",
          // doctor_notes: response.doctor_notes || "",
        })
      );
    } catch {
      toast.error("Failed to analyze conversation for chief complaint.");
      setAiLoading(false);
    }
  };

  const fetchMedicalRecommendations = async (data: any) => {
    try {
      const response = await suggestMedicalRecommendations({
        chief_complaint: data.chief_complaint,
        provisional_diagnosis: data.provisional_diagnosis,
        doctor_notes: data.doctor_notes,
      });
      dispatch(setAiSuggestedLabTests(response.investigations || []));
      dispatch(setAiSuggestedMedications(response.medicines || []));
      console.log("Medical Recommendations Response:", response);
    } catch {
      toast.error("Failed to fetch medical recommendations.");
    } finally {
      setAiLoading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setAnimationForRecord(false);
      setIsRecording(false);
      setIsPaused(false);
      setShowRecordingUI(false);
      setAiLoading(true);
      onRecordingStop?.();
      // setShowRecordingAnim(false);
    }
  };

  return (
    <div className="space-y-4">
      {aiLoading && (
        <AITranscriptionLoader
          step={aiStep}
          animationFor={animationForRecord}
          recordingStatus={isRecording}
          pauseRecord={isPaused}
          setWavesurfer={setWavesurfer}
        />
      )}

      {!showRecordingUI ? (
        <div className="ml-3">
          <Button onClick={startRecording} variant="default" className="w-full">
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        </div>
      ) : (
        <div className="mx-4">
          <div className="">
            <div className="flex items-center justify-between">
              {/* <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {isPaused
                      ? "Recording Paused"
                      : "AI Consultation Recording Active"}
                  </span>
                </div>

                <div className="flex-1 max-w-md mx-auto">
                  <RecordingWave isRecording={!isPaused} />
                </div>
              </div> */}

              <div className="flex gap-4">
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  variant="outline"
                  // size="sm"
                  className="hover:bg-blue-50 border-blue-200"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>

                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  // size="sm"
                  className="hover:bg-red-50"
                >
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ...existing code... */}
    </div>
  );
}
