"use client";

import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface QrScannerBoxProps {
  onScanSuccess: (result: string) => void;
  buttonLabel?: string;
  width?: number;
  height?: number;
  className?: string;
}

const QrScannerBox: React.FC<QrScannerBoxProps> = ({
  onScanSuccess,
  buttonLabel = "Scan QR",
  width = 320,
  height = 320,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [scanning, setScanning] = useState(false);

  const startScanner = async () => {
    setScanning(true);

    if (!videoRef.current) return;

    // Cleanup existing scanner if any
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;

      const canvas = videoRef.current.parentElement?.querySelector("canvas");
      if (canvas) canvas.remove();
    }

    scannerRef.current = new QrScanner(
      videoRef.current,
      (result) => {
        onScanSuccess(result.data);
        stopScanner();
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
      }
    );

    await scannerRef.current.start();
  };

  const stopScanner = () => {
    scannerRef.current?.stop();
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.destroy();
    };
  }, []);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Button onClick={startScanner} disabled={scanning}>
        {scanning ? (
          <>
            Scanning
            <Loader2 className="animate-spin ml-2" />
          </>
        ) : (
          buttonLabel
        )}
      </Button>

      <video
        ref={videoRef}
        className={`border-2 border-gray-300 rounded-lg shadow-md ${
          scanning ? "block" : "hidden"
        }`}
        style={{ width, height }}
        muted
      />
    </div>
  );
};

export default QrScannerBox;
