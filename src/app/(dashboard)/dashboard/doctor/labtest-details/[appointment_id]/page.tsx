import { Metadata } from "next";
import LabtestsReportReview from "@/components/dashboard/doctor/LabtestsReportReview";

export const metadata: Metadata = {
  title: "Lab Test Report Review - NextCare Admin",
  description:
    "Review lab test reports, patient information, vital signs, medications, and visit notes for medical appointments.",
};

export default function LabtestDetailsPage() {
  return <LabtestsReportReview />;
}
