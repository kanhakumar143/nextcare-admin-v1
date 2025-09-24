"use client";

import Link from "next/link";
import {
  getAbhaDetails,
  getAdhaarDetails,
  getDlDetails,
  getPassportDetails,
  uploadImageToAws,
} from "@/services/uploadRegister.api";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { UploadProgressModal } from "./modals/UploadProgressModal";
import { Loader2, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setCaptureDtls } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import BackButton from "@/components/common/BackButton";

export default function UploadImageAndRegisterUser() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [progressOpen, setProgressOpen] = useState<boolean>(false);
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [currentDocType, setCurrentDocType] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedDetails, setScannedDetails] = useState<any>(null);
  const [docDetails, setDocDetails] = useState<any>(null);

  // Ensure videoRef gets the stream when it changes
  useEffect(() => {
    if (cameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    // Clean up srcObject when camera closes
    if (!cameraOpen && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream, cameraOpen]);

  const startCamera = async (docType: string) => {
    try {
      setCurrentDocType(docType);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera API not supported in this browser.");
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error(
        "Unable to access camera. Please check permissions or use a supported browser."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
    setCurrentDocType("");
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `${currentDocType}_capture.jpg`, {
                type: "image/jpeg",
              });
              handleImageUpload(file, currentDocType);
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
    stopCamera();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    doc_type: string
  ) => {
    if (!e.target.files || !e.target.files[0]) {
      toast.error("Please select an image to upload.");
      return;
    }

    handleImageUpload(e.target.files[0], doc_type);
  };

  const handleImageUpload = async (file: File, doc_type: string) => {
    console.log("Starting upload for document type:", doc_type);

    const formData = new FormData();
    formData.append("f_name", "government_id_proof");
    formData.append("doc_types", doc_type);
    formData.append("phone_no", new Date().toISOString());
    formData.append("files", file);

    // Show progress modal and set to uploading step
    setProgressOpen(true);
    setStep(1);
    setLoading(true);

    try {
      // Step 1: Upload image to AWS
      console.log("Step 1: Uploading image to AWS...");
      const response = await uploadImageToAws(formData);
      const file_url = response.uploaded_files[0]?.file_url;

      if (file_url) {
        // Step 2: Analyze the uploaded image
        console.log("Step 2: Analyzing document...");
        setStep(2);

        // Add a small delay to show the analyzing step
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (doc_type === "adhaar") {
          await getAdhaarDetailsFromImage(file_url, doc_type);
        } else if (doc_type === "DL") {
          await getDrivingLiscenceDetailsFromImage(file_url, doc_type);
        } else if (doc_type === "abha") {
          await getAbhaDetailsFromImage(file_url, doc_type);
        } else if (doc_type === "passport") {
          await getPPDetailsFromImage(file_url, doc_type);
        }

        // Step 3: Complete
        setStep(3);
        toast.success("Document processed successfully!");

        // Keep modal open for a brief moment to show completion
        setTimeout(() => {
          setProgressOpen(false);
          setStep(0);
        }, 1500);
      } else {
        throw new Error("No file URL received from upload");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong! Please try again");
      setProgressOpen(false);
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const getAdhaarDetailsFromImage = async (
    fileUrl: string,
    doc_type: string
  ) => {
    try {
      if (fileUrl) {
        const response = await getAdhaarDetails({ file_url: fileUrl });
        setDocDetails({
          doc_type: doc_type,
          file_url: fileUrl,
        });
        // router.push("/auth/verify-by-user"); // Omitted as requested
        dispatch(setCaptureDtls(response.data));
        toast.success("Adhaar details extracted successfully");
        router.push(
          `/dashboard/receptionist/book-appointment/register-patient/${response.data.id}`
        );
      }
    } catch (error) {
      console.error("Adhaar extraction error:", error);
      toast.error("Failed to extract Adhaar details. Please try again");
    }
  };

  const getDrivingLiscenceDetailsFromImage = async (
    fileUrl: string,
    doc_type: string
  ) => {
    try {
      if (fileUrl) {
        const response = await getDlDetails({ file_url: fileUrl });
        setDocDetails({
          doc_type: doc_type,
          file_url: fileUrl,
        });
        // router.push("/auth/verify-by-user"); // Omitted as requested
        dispatch(setCaptureDtls(response.data));
        toast.success("Driving License details extracted successfully");
        router.push(
          `/dashboard/receptionist/book-appointment/register-patient/${response.data.id}`
        );
      }
    } catch (error) {
      console.error("DL extraction error:", error);
      toast.error(
        "Failed to extract Driving License details. Please try again"
      );
    }
  };

  const getAbhaDetailsFromImage = async (fileUrl: string, doc_type: string) => {
    try {
      if (fileUrl) {
        const response = await getAbhaDetails({ file_url: fileUrl });
        setDocDetails({
          doc_type: doc_type,
          file_url: fileUrl,
        });
        // router.push("/auth/verify-by-user"); // Omitted as requested
        dispatch(setCaptureDtls(response.data));
        toast.success("ABHA details extracted successfully");
        console.log("ABHA Details:", response.data);
      }
    } catch (error) {
      console.error("ABHA extraction error:", error);
      toast.error("Failed to extract ABHA details. Please try again");
    }
  };

  const getPPDetailsFromImage = async (fileUrl: string, doc_type: string) => {
    try {
      if (fileUrl) {
        const response = await getPassportDetails({ file_url: fileUrl });
        setDocDetails({
          doc_type: doc_type,
          file_url: fileUrl,
        });
        // router.push("/auth/verify-by-user"); // Omitted as requested
        dispatch(setCaptureDtls(response.data));
        toast.success("Passport details extracted successfully");
        console.log("Passport Details:", response.data);
      }
    } catch (error) {
      console.error("Passport extraction error:", error);
      toast.error("Failed to extract Passport details. Please try again");
    }
  };

  const DocumentUploadOption = ({
    docType,
    label,
    inputId,
  }: {
    docType: string;
    label: string;
    inputId: string;
  }) => (
    <div className="w-full space-y-2">
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => startCamera(docType)}
          className="w-full bg-blue-100 text-gray-700 font-medium text-sm py-3 rounded-md hover:bg-blue-200 transition flex justify-center items-center gap-2"
          disabled={loading}
        >
          <Camera className="w-4 h-4" />
          Camera
        </Button>
        <label
          htmlFor={inputId}
          className="cursor-pointer flex-1 bg-orange-100 text-gray-700 font-medium text-sm py-2 rounded-md text-center hover:bg-orange-200 transition flex justify-center items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload
        </label>
      </div>
      <p className="text-center text-sm text-gray-600">{label}</p>
      <input
        id={inputId}
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => handleFileChange(e, docType)}
        className="hidden"
        ref={docType === "adhaar" ? fileInputRef : undefined}
      />
    </div>
  );

  return (
    <div className="flex flex-col w-full h-screen items-center">
      <div className="min-h-[90vh] flex flex-col items-center justify-center md:w-1/2 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
          <BackButton />

          <h2 className="text-xl font-semibold text-gray-800 text-left">
            {"Fill your details with your Government ID's"}
          </h2>

          <div className="my-8 gap-4 flex flex-col">
            <DocumentUploadOption
              docType="adhaar"
              label="Upload your Aadhar"
              inputId="aadharUpload"
            />

            <DocumentUploadOption
              docType="DL"
              label="Upload your Driving License"
              inputId="dl"
            />

            <DocumentUploadOption
              docType="passport"
              label="Upload your Passport"
              inputId="passport"
            />

            <DocumentUploadOption
              docType="abha"
              label="Upload your ABHA Card"
              inputId="abha"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500">Or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="flex flex-col items-center">
            <Link href="/auth/signup" className="text-cyan-600 hover:underline">
              Sign Up Manually
            </Link>
          </div>

          <div className="mt-6 flex md:flex-row flex-col md:gap-6 gap-2 justify-center items-center text-sm text-gray-500">
            <span>Terms & Conditions</span>
            <span>Support</span>
            <span>Customer Care</span>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Capture {currentDocType.toUpperCase()} Document
            </h3>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-4 mt-4">
              <Button
                onClick={capturePhoto}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <UploadProgressModal open={progressOpen} step={step} />
    </div>
  );
}
