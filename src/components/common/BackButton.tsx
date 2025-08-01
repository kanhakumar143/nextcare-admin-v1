"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackButton = ({ label = "Back" }: { label?: string }) => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="group mb-4 flex items-center text-sm hover:bg-white transition-all"
    >
      <ChevronLeft className="h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-1 text-slate-600" />
      <span className="transform transition-transform duration-200 group-hover:-translate-x-0.5 text-slate-600">
        {label}
      </span>
    </Button>
  );
};

export default BackButton;
