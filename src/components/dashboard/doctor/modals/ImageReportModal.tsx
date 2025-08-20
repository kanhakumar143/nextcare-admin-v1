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
import { useState } from "react";

interface ImageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export function ImageReportModal({
  isOpen,
  onClose,
  imageUrl,
  title = "Report Image",
}: ImageReportModalProps) {
  const [zoom, setZoom] = useState(1);
  const [imageError, setImageError] = useState(false);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, "_")}_${Date.now()}.jpg`;
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
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-center items-center min-h-[500px]">
            {!imageError ? (
              <div
                className="transition-transform duration-200 ease-in-out"
                style={{ transform: `scale(${zoom})` }}
              >
                <Image
                  src={imageUrl}
                  alt={title}
                  width={800}
                  height={600}
                  className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                  onError={() => setImageError(true)}
                  priority
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 bg-gray-100 rounded-lg p-8">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium mb-2">
                  Image not available
                </h3>
                <p className="text-sm text-center">
                  The report image could not be loaded. Please try again later
                  or contact support.
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
