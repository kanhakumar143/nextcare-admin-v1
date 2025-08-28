"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import PdfViewer from "@/components/helper/PdfViewer";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title?: string;
}

export function ImageReportModal({
  isOpen,
  onClose,
  fileUrl,
  title = "Report",
}: ReportModalProps) {
  const [zoom, setZoom] = useState(1);
  const [imageError, setImageError] = useState(false);

  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    setImageError(false);
    setZoom(1);
  }, [fileUrl]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${title.replace(/\s+/g, "_")}_${Date.now()}${
      isPdf ? ".pdf" : ".jpg"
    }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            {!isPdf && (
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="px-2 py-1 text-sm font-medium min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                {/* Reset Zoom */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetZoom}
                  className="text-xs"
                >
                  Reset
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-center items-center min-h-[500px] w-full h-full">
            {isPdf ? (
              <PdfViewer url={fileUrl} height="h-[80vh]" />
            ) : !imageError ? (
              <div
                className="transition-transform duration-200 ease-in-out"
                style={{ transform: `scale(${zoom})` }}
              >
                <Image
                  src={fileUrl}
                  alt={title}
                  width={800}
                  height={600}
                  className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                  onError={() => setImageError(true)}
                  priority
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 bg-gray-100 rounded-lg p-8 w-full h-full">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium mb-2">File not available</h3>
                <p className="text-sm text-center">
                  The report could not be loaded. Please try again later or
                  contact support.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="mt-4"
                >
                  Try Direct Download
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
