"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useState, useEffect } from "react";

interface PdfViewerProps {
  url: string;
  height?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, height = "h-[600px]" }) => {
  const [isClient, setIsClient] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className={`w-full ${height} border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50`}
      >
        <div className="text-gray-500">Loading PDF viewer...</div>
      </div>
    );
  }

  return (
    <div className={`w-full ${height} border rounded-lg overflow-hidden`}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  );
};

export default PdfViewer;
