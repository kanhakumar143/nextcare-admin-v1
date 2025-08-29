"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/index";
import { toggleEhrViewModal } from "@/store/slices/ehrSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import moment from "moment";
import { FileText } from "lucide-react";
import PdfViewer from "@/components/helper/PdfViewer";
// import PdfViewer from "@/components/PdfViewer";

export default function EhrViewModal() {
  const dispatch = useDispatch<AppDispatch>();
  const { isEhrViewModalOpen, selectedEhr } = useSelector(
    (state: RootState) => state.ehr
  );

  const handleClose = () => {
    dispatch(toggleEhrViewModal({ isOpen: false }));
  };

  if (!selectedEhr) return null;

  const isPdf = selectedEhr.file_type === "application/pdf";
  const isImage = selectedEhr.file_type.startsWith("image/");

  return (
    <Dialog open={isEhrViewModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="
          w-full 
          sm:max-w-lg 
          md:max-w-2xl 
          lg:max-w-3xl 
          xl:max-w-5xl 
          max-h-[90vh] 
          overflow-y-auto 
          px-4 sm:px-6 md:px-8
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Electronic Health Record
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 ">
          {/* Meta Info Card */}
          <div className="bg-gray-50 rounded-lg border p-3 sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Type
                </p>
                <p className="capitalize font-medium text-sm sm:text-base mt-1">
                  {selectedEhr.type}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Status
                </p>
                <Badge
                  className={`capitalize mt-1 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm ${
                    selectedEhr.status === "current"
                      ? "bg-green-100 text-green-800"
                      : selectedEhr.status === "archived"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {selectedEhr.status}
                </Badge>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  File Size
                </p>
                <p className="font-medium text-sm sm:text-base mt-1">
                  {selectedEhr.file_size}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  File Type
                </p>
                <p className="font-medium text-sm sm:text-base mt-1">
                  {selectedEhr.file_type}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Uploaded At
                </p>
                <p className="font-medium text-sm sm:text-base mt-1">
                  {moment(selectedEhr.created_at).format(
                    "DD MMM YYYY, hh:mm A"
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Description
                </p>
                <p className="font-medium text-sm sm:text-base mt-1">
                  {selectedEhr.description}
                </p>
              </div>
            </div>
          </div>  

          {/* Preview Card */}
          <div className="space-y-3">
            {isPdf ? (
              <PdfViewer
                url={selectedEhr.file_url}
                height="h-[500px] sm:h-[600px]"
              />
            ) : isImage ? (
              <div className="flex justify-center">
                <Image
                  src={selectedEhr.file_url}
                  alt={selectedEhr.description}
                  width={1200}
                  height={800}
                  className="rounded-lg border shadow-md object-contain w-full max-h-[70vh]"
                  priority
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-4">
                  Preview not available for this file type
                </p>
                <a
                  href={selectedEhr.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
