"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AppointmentDtlsForDoctor } from "@/types/doctorNew.types";
import {
  FileText,
  Brain,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkle,
  Sparkles,
  // Sparkles,
} from "lucide-react";
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";
import { Badge } from "@/components/ui/badge";

interface PreConsultationAnswersProps {
  apptDtls: AppointmentDtlsForDoctor | null;
}

export default function PreConsultationAnswersRedesigned({
  apptDtls,
}: PreConsultationAnswersProps) {
  const [showAiSummary, setShowAiSummary] = useState<boolean>(true);

  return (
    <Card className="">
      <CardHeader className="">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Pre-Consultation Questionnaire
              </CardTitle>
              <p className="text-sm text-gray-600">
                Patient responses and AI-generated insights
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              aria-label={showAiSummary ? "Disable AI Mode" : "Enable AI Mode"}
              onClick={() => setShowAiSummary((prev) => !prev)}
              type="button"
              className={"rounded-md hover:cursor-pointer border p-2"}
            >
              {/* <SparkleAiIcon width={40} height={40} />
               */}
              <Sparkles className="text-primary" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[59vh] pr-4">
          <div className="space-y-4">
            {apptDtls?.source === "nextcare" &&
              apptDtls?.symptom_data_nc?.diagnosis && (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-800 text-base">
                      Preliminary Symptom Diagnosis
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
                    <p className="text-gray-900 font-medium leading-relaxed">
                      {apptDtls.symptom_data_nc.diagnosis}
                    </p>
                  </div>
                </div>
              )}

            {apptDtls?.source === "nextcare" ? (
              showAiSummary ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800 text-base">
                      AI-Generated Summary
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 border-blue-200"
                    >
                      Smart Analysis
                    </Badge>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                    {apptDtls?.symptom_data_nc?.ai_summary ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {apptDtls.symptom_data_nc.ai_summary}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 italic">
                            No AI summary available for this consultation.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                apptDtls?.symptom_data_nc?.symptom_data && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-800 text-base">
                        Detailed Responses
                      </span>
                    </div>
                    {apptDtls.symptom_data_nc.symptom_data.map(
                      (q: any, i: number) => (
                        <div
                          key={i}
                          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Question */}
                          <div className="mb-3">
                            {typeof q.question === "string" ? (
                              <p className="text-gray-800 font-medium leading-relaxed">
                                <span className="text-blue-600 font-semibold">
                                  Q{i + 1}:
                                </span>{" "}
                                {q.question}
                              </p>
                            ) : Array.isArray(q.question) ? (
                              <div className="space-y-3">
                                {q.question.map(
                                  (scenario: any, scenarioIndex: number) => (
                                    <div
                                      key={scenarioIndex}
                                      className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                                    >
                                      <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <span className="text-blue-600">
                                          Scenario {scenarioIndex + 1}:
                                        </span>
                                        {scenario.scenario_title}
                                      </div>
                                      <p className="text-gray-700 mb-2 leading-relaxed">
                                        {scenario.scenario_question}
                                      </p>
                                      {scenario.associated_title && (
                                        <div className="mt-3 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
                                          <div className="font-medium text-blue-800 text-sm mb-1">
                                            {scenario.associated_title}
                                          </div>
                                          <p className="text-blue-700 text-sm">
                                            {scenario.associated_question}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : null}
                          </div>

                          {/* Answer */}
                          <div className="mt-3">
                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800 text-sm">
                                  Answer:
                                </span>
                              </div>
                              {typeof q.answer === "object" &&
                              q.answer !== null ? (
                                <div className="space-y-2">
                                  {Object.entries(q.answer).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex items-center justify-between p-2 bg-white rounded border border-green-100"
                                      >
                                        <span className="capitalize text-green-700 font-medium text-sm">
                                          {key.replace(/_/g, " ")}:
                                        </span>
                                        <span className="text-gray-900 font-semibold">
                                          {String(value) || "Not provided"}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="p-2 bg-white rounded border border-green-100">
                                  <span className="text-gray-900 font-semibold">
                                    {q.answer || "No answer provided"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )
              )
            ) : showAiSummary ? (
              apptDtls?.pre_appointment_qa_ai_summaries &&
              apptDtls.pre_appointment_qa_ai_summaries.length > 0 ? (
                <div className="space-y-6">
                  {apptDtls.pre_appointment_qa_ai_summaries.map(
                    (summary, index) => (
                      <div key={summary.id} className="p-0">
                        {/* <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-800 text-base">
                              AI Summary
                            </span>
                          </div>
                        </div> */}

                        <div
                          dangerouslySetInnerHTML={{
                            __html: summary.summary
                              .replace(
                                /class="alert-high"/g,
                                'class="text-red-600 font-bold"'
                              )
                              .replace(
                                /class="alert-medium"/g,
                                'class="text-orange-500 font-bold"'
                              )
                              .replace(
                                /class="positive"/g,
                                'class="text-green-600 font-bold"'
                              )
                              .replace(
                                /class="medical-summary"/g,
                                'class="p-4 rounded-lg border border-gray-200"'
                              ),
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-600">
                      No AI summary available
                    </p>
                    <p className="text-sm text-gray-500">
                      AI analysis will appear here when available
                    </p>
                  </div>
                </div>
              )
            ) : apptDtls?.questionary_answers &&
              apptDtls.questionary_answers.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-800 text-base">
                    Questionnaire Responses
                  </span>
                </div>
                {apptDtls.questionary_answers.map((q: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-2">
                      <p className="font-medium text-gray-800 leading-relaxed">
                        <span className="text-blue-600 font-semibold">
                          Q{i + 1}:
                        </span>{" "}
                        {q?.questionary?.question}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 text-sm">
                          Answer:
                        </span>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {q.answer || "No answer provided"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-600">
                    No questionnaire data
                  </p>
                  <p className="text-sm text-gray-500">
                    Patient responses will appear here when available
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
