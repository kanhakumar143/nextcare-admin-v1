"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  uploadImageToAws,
  updateLabTestOrder,
} from "@/services/labTechnician.api";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearSelectedOrder } from "@/store/slices/labTechnicianSlice"; // ✅ import clear

export default function UploadLabReport() {
  const router = useRouter();
  const dispatch = useDispatch();

  // ✅ get selected lab order from redux
  const order = useSelector((state: RootState) => state.labOrder.selectedOrder);

  const [selectedType] = useState<string>("Lab Report"); // default only
  const [image, setImage] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImage(e.target.files[0]);
  };
  const triggerFileSelect = () => fileInputRef.current?.click();

  // Camera start
  const startCamera = async () => {
    setCameraActive(true);
    if (navigator.mediaDevices?.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    }
  };

  // Capture snapshot
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 300, 200);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            setImage(new File([blob], "capture.png", { type: "image/png" }));
          }
        });
      }
    }
  };

  const removeImage = () => setImage(null);

  // Upload flow
  const handleUpload = async () => {
    if (!image) return toast.error("Please select or capture a file");
    if (!order) return toast.error("No lab order selected");

    try {
      setLoading(true);

      // Upload to AWS
      const formData = new FormData();
      formData.append("phone_no", "9999999999"); // TODO: make dynamic later
      formData.append("doc_types", selectedType);
      formData.append("files", image);
      formData.append("f_name", "nc_ehr");

      const awsRes = await uploadImageToAws(formData);
      const fileUrl = awsRes?.uploaded_files?.[0]?.file_url;
      if (!fileUrl) throw new Error("AWS upload failed");

      const payload = {
        ...order,
        test_report_path: fileUrl,
        status: "completed",
        notes: [
          {
            value: description,
          },
        ],
      };
      await updateLabTestOrder(payload);

      toast.success("Lab report uploaded & linked");
      dispatch(clearSelectedOrder());
      router.back();
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
      setImage(null);
      setDescription("");
    }
  };
  return (
    <div className="w-96 flex-col">
      <h1 className="text-2xl font-bold text-center">Upload Lab Report</h1>

      {/* File + Camera Section */}
      <div className="flex space-x-2 items-stretch mt-4 justify-center">
        {/* File Upload */}
        <div
          onClick={triggerFileSelect}
          className="flex items-center justify-center border-2 h-20 border-dashed border-gray-300 rounded-lg p-2 text-center text-black bg-gray-100 cursor-pointer flex-1"
        >
          <Label htmlFor="fileUpload" className="cursor-pointer">
            Drag & drop images or PDFs here, or click to select
          </Label>
          <input
            type="file"
            accept="image/*,.pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Camera */}
        <div className="flex flex-col items-center justify-center flex-1 h-20 border-dashed border-gray-300 rounded-lg p-2">
          {!cameraActive ? (
            <Button
              onClick={startCamera}
              className="w-full h-full cursor-pointer"
            >
              <Camera className="mr-2 h-4 w-4 " /> Capture
            </Button>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <video
                ref={videoRef}
                width={280}
                height={160}
                className="border rounded-lg"
              />
              <Button onClick={capturePhoto} className="w-full cursor-pointer">
                Capture Photo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Remark */}
      <div className="mt-4">
        <Label htmlFor="remark" className="block mb-2 font-medium">
          Remark
        </Label>
        <textarea
          id="remark"
          placeholder="Add any notes or remarks..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 min-h-[100px]"
        />
      </div>

      {/* Preview */}
      {image && (
        <div className="relative mt-4 border rounded-lg overflow-hidden min-h-96">
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full cursor-pointer p-1 hover:bg-opacity-70"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-full"
          />
        </div>
      )}

      <canvas ref={canvasRef} width={300} height={200} className="hidden" />

      {/* Actions */}
      <div className="flex justify-between mt-6 cursor-pointer">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <Button
          className="cursor-pointer"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload →"}
        </Button>
      </div>
    </div>
  );
}
