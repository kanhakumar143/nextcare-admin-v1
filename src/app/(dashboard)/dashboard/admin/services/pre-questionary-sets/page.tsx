import PreQuestionarySet from "@/components/dashboard/admin/PreQuestionarySet/PreQuestionarySet";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Pre-Questionary Sets",
  description: "Login to your account",
};

export default function PreQuestionaryPage() {
  return <PreQuestionarySet />;
}
