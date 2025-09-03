"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

interface PdfViewerProps {
  url: string;
  height?: string;
}

// Completely dynamic PDF viewer component
const DynamicPdfViewer = dynamic(() => import("./PdfViewerClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading PDF viewer...</div>
    </div>
  ),
});

const PdfViewer: React.FC<PdfViewerProps> = ({ url, height = "h-[600px]" }) => {
  const [isClient, setIsClient] = useState(false);

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

  return <DynamicPdfViewer url={url} height={height} />;
};

export default PdfViewer;
