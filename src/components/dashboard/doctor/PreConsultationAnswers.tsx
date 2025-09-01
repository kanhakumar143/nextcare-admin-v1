"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AppointmentDtlsForDoctor } from "@/types/doctorNew.types";

interface PreConsultationAnswersProps {
  apptDtls: AppointmentDtlsForDoctor | null;
}

export default function PreConsultationAnswers({
  apptDtls,
}: PreConsultationAnswersProps) {
  const [showAiSummary, setShowAiSummary] = useState<boolean>(true);

  return (
    <Card className="border-border p-0">
      <CardHeader className=" rounded-t-lg">
        <div className="flex items-center justify-between py-3">
          <CardTitle className="text-lg">
            <div className="pt-4">
              <p className="text-xl font-bold">Pre Questionaries</p>
            </div>
          </CardTitle>
          {apptDtls?.source === "nextcare" && (
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="ai-summary-switch"
                className="text-sm font-medium"
              >
                AI Summary
              </Label>
              <Switch
                id="ai-summary-switch"
                checked={showAiSummary}
                onCheckedChange={setShowAiSummary}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pb-6 pr-4 h-[52vh]">
          <div className="space-y-3 text-sm">
            {apptDtls?.source === "nextcare" &&
              apptDtls?.symptom_data_nc?.diagnosis && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg mb-4">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-orange-800 text-sm">
                      Preliminary Symptom Diagnosis:
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <p className="text-gray-900 font-medium">
                      {apptDtls.symptom_data_nc.diagnosis}
                    </p>
                  </div>
                </div>
              )}

            {apptDtls?.source === "nextcare" ? (
              showAiSummary ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex items-center mb-3">
                    <span className="font-semibold text-blue-800 text-lg">
                      AI Generated Summary
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded border border-blue-200">
                    <div className="prose prose-sm max-w-none">
                      {apptDtls?.symptom_data_nc?.ai_summary ? (
                        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {apptDtls.symptom_data_nc.ai_summary}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          No AI summary available for this consultation.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                apptDtls?.symptom_data_nc?.symptom_data &&
                apptDtls.symptom_data_nc.symptom_data.map(
                  (q: any, i: number) => (
                    <div
                      key={i}
                      className="border-b border-gray-100 pb-3 mb-3 last:border-b-0"
                    >
                      {typeof q.question === "string" ? (
                        <p className="pl-3 text-gray-700 mb-2">{q.question}</p>
                      ) : Array.isArray(q.question) ? (
                        <div className="pl-3 space-y-3">
                          {q.question.map(
                            (scenario: any, scenarioIndex: number) => (
                              <div
                                key={scenarioIndex}
                                className="bg-gray-50 p-3 rounded-lg"
                              >
                                <div className="font-semibold text-gray-800 mb-1">
                                  {scenario.scenario_title}
                                </div>
                                <p className="text-gray-700 mb-2">
                                  {scenario.scenario_question}
                                </p>
                                {scenario.associated_title && (
                                  <div className="border-l-4 border-blue-400 pl-3 mt-2">
                                    <div className="font-medium text-gray-800 text-sm">
                                      {scenario.associated_title}
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                      {scenario.associated_question}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : null}
                      <div className="pl-3 mt-3">
                        <div className="bg-slate-50 border-l-4 border-slate-400 p-3 rounded-r-lg">
                          {typeof q.answer === "object" && q.answer !== null ? (
                            <div className="space-y-2">
                              {Object.entries(q.answer).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="bg-white p-2 rounded border border-green-200"
                                >
                                  <span className="capitalize text-green-700 font-medium text-sm">
                                    {key.replace(/_/g, " ")}:{" "}
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {String(value) || "Not provided"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-white p-2 rounded border border-slate-200">
                              <span className="text-gray-900 font-semibold">
                                {q.answer || "No answer provided"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )
              )
            ) : apptDtls?.questionary_answers &&
              apptDtls.questionary_answers.length > 0 ? (
              apptDtls.questionary_answers.map((q: any, i: number) => (
                <div key={i}>
                  <p className="font-medium text-foreground">
                    Q{i + 1}: {q?.questionary?.question}
                  </p>
                  <p className="pl-3 text-muted-foreground">
                    A : {q.answer || ""}
                  </p>
                </div>
              ))
            ) : (
              // Dummy Q&A when no questionary answers available
              [
                {
                  question: "What is your primary reason for this visit?",
                  answer: "General consultation and health checkup",
                },
                {
                  question: "Are you currently taking any medications?",
                  answer: "No current medications",
                },
                {
                  question: "Do you have any known allergies?",
                  answer: "No known allergies",
                },
                {
                  question:
                    "How would you rate your current pain level (1-10)?",
                  answer: "3 - Mild discomfort",
                },
                {
                  question: "When did your symptoms first appear?",
                  answer: "Approximately 2-3 days ago",
                },
              ].map((dummyQ, i) => (
                <div key={`dummy-${i}`} className="opacity-60">
                  <p className="font-medium text-foreground">
                    Q{i + 1}: {dummyQ.question}
                  </p>
                  <p className="pl-3 text-muted-foreground">
                    A : {dummyQ.answer}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
