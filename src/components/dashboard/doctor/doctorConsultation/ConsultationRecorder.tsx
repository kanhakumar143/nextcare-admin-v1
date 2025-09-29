"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause } from "lucide-react";
import AITranscriptionLoader from "./AITranscriptionLoader";
import { toast } from "sonner";
import {
  setAiSuggestedchiefComplaint,
  setAiSuggestedLabTests,
  setAiSuggestedMedications,
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

interface ConsultationRecorderProps {
  appointmentId?: string;
  onTranscriptionLoading: (loading: boolean) => void;
  onPauseRecording: (paused: boolean) => void;
}

export default function ConsultationRecorder({
  appointmentId,
  onTranscriptionLoading,
  onPauseRecording,
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

  const startRecording = async () => {
    try {
      onTranscriptionLoading(true);
      setAiLoading(true);
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
      onPauseRecording(true);
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      toast.info("Recording paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      onPauseRecording(false);
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

    transcribeAudio(audioBlob);
    setAiLoading(true);
    // setAiStep("transcribing");
    // dispatch(setAiSuggestedLabTests(response.investigations || []));
    // dispatch(setAiSuggestedMedications(response.medicines || []));
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

      // setShowRecordingAnim(false);
    }
  };

  // Futuristic Spiral Wave Animation Component
  // const SpiralWaveAnimation = () => {
  //   return (
  //     <div className="relative flex items-center justify-center w-full h-24">
  //       {/* Core glowing orb */}
  //       <div
  //         className={`w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-[0_0_20px_6px_rgba(56,189,248,0.6)]
  //       ${isPaused ? "opacity-40 scale-90" : "animate-pulse"} `}
  //       />

  //       {/* Dancing spiral waves */}
  //       {[...Array(5)].map((_, i) => (
  //         <div
  //           key={i}
  //           className={`absolute rounded-full border-2 border-transparent bg-gradient-to-r
  //         from-cyan-400/60 via-purple-500/40 to-pink-500/30
  //         blur-sm
  //         ${
  //           isPaused
  //             ? "opacity-20"
  //             : "animate-[spin_6s_linear_infinite,pulse_2s_ease-in-out_infinite]"
  //         }`}
  //           style={{
  //             width: `${70 + i * 25}px`,
  //             height: `${70 + i * 25}px`,
  //             borderRadius: "50%",
  //             animationDelay: `${i * 0.5}s`,
  //             animationDuration: `${4 + i}s`,
  //           }}
  //         />
  //       ))}

  //       {/* Flowing wave arcs (half rings for spiral illusion) */}
  //       {[...Array(3)].map((_, i) => (
  //         <div
  //           key={`arc-${i}`}
  //           className={`absolute border-t-2 border-gradient-to-r from-fuchsia-400 via-cyan-400 to-purple-500 rounded-full
  //         ${isPaused ? "opacity-10" : "animate-[spin_5s_linear_infinite]"}`}
  //           style={{
  //             width: `${90 + i * 40}px`,
  //             height: `${90 + i * 40}px`,
  //             borderRadius: "50%",
  //             animationDuration: `${5 + i * 1.5}s`,
  //             animationDirection: i % 2 === 0 ? "normal" : "reverse",
  //           }}
  //         />
  //       ))}
  //     </div>
  //   );
  // };

  return (
    <div className="space-y-4">
      {aiLoading && (
        <AITranscriptionLoader
          step={aiStep}
          animationFor={animationForRecord}
          recordingStatus={isRecording}
          pauseRecord={isPaused}
        />
      )}

      {!showRecordingUI ? (
        <div className="">
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

              <div className="flex gap-2">
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  variant="outline"
                  size="sm"
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
                  size="sm"
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
