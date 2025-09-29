"use client";

import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  submitQuestionariesAnswersBulk,
  updateNCSymptomData,
} from "@/services/nurse.api";
import { submitQuestionnairesAnswerToAi } from "@/services/ai.api";
import ConfirmSubmissionModal from "./modals/ConfirmSubmissionModal";
import { ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/store";
import {
  fetchListAllQuestionnaires,
  setNurseStepCompleted,
} from "@/store/slices/nurseSlice";
import { Question, SubmitQuestionPayload } from "@/types/nurse.types";
import { Slider } from "@/components/ui/slider";
import { AISubmitQuestionPayload, AIAnalysisPayload } from "@/types/ai.types";

export default function DynamicQuestionnaires() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [nextcareAnswers, setNextcareAnswers] = useState<Record<string, any>>(
    {}
  );
  const [nextcareRemark, setNextcareRemark] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { qrDtls, preAppQuestionnaires } = useSelector(
    (state: RootState) => state.nurse
  );

  useEffect(() => {
    if (qrDtls && qrDtls.appointment.id) {
      dispatch(fetchListAllQuestionnaires(qrDtls.appointment.id));
    } else {
      toast.error("Please scan again.");
      router.push("/dashboard/nurse/check-in");
    }
  }, [qrDtls]);

  useEffect(() => {
    if (
      qrDtls?.appointment.source === "nextcare" &&
      preAppQuestionnaires.response?.data
    ) {
      const initialAnswers: Record<string, any> = {};
      preAppQuestionnaires?.response.data.forEach((questionData, index) => {
        initialAnswers[`question_${index}`] = questionData.answer;
      });
      setNextcareAnswers(initialAnswers);
    }
  }, [preAppQuestionnaires.response, qrDtls?.appointment.source]);

  const handleChange = (id: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleNextcareAnswerChange = (
    questionIndex: number,
    value: any,
    key?: string
  ) => {
    const questionKey = `question_${questionIndex}`;
    if (key) {
      setNextcareAnswers((prev) => ({
        ...prev,
        [questionKey]: {
          ...prev[questionKey],
          [key]: value,
        },
      }));
    } else {
      setNextcareAnswers((prev) => ({
        ...prev,
        [questionKey]: value,
      }));
    }
  };

  const handleCheckbox = (id: string, option: string) => {
    const current = answers[id] || "";
    const currentArray = current ? current.split(", ") : [];
    const newArray = currentArray.includes(option)
      ? currentArray.filter((v: string) => v !== option)
      : [...currentArray, option];
    handleChange(id, newArray.join(", "));
  };

  const renderQuestionInput = (question: Question) => {
    const questionId = question.id;

    switch (question.type) {
      case "text":
        return (
          <Input
            type="text"
            className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
            placeholder="Enter your answer..."
          />
        );

      case "textarea":
        return (
          <Textarea
            className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black min-h-[80px] resize-none"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
            placeholder="Enter your detailed answer..."
          />
        );

      case "number":
        return (
          <Input
            type="number"
            className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
            placeholder="Enter a number..."
            step="any"
          />
        );

      case "slider":
        return (
          <div className="space-y-4">
            <Slider
              value={[parseInt(answers[questionId]) || 5]}
              onValueChange={(value) =>
                handleChange(questionId, value[0].toString())
              }
              max={10}
              step={1}
              className="w-[60%]"
            />
            <div className="text-sm text-gray-600">
              Current value:{" "}
              <span className="font-medium">{answers[questionId] || "5"}</span>
            </div>
          </div>
        );

      case "yes_no":
        return (
          <RadioGroup
            value={answers[questionId] || ""}
            onValueChange={(val) => handleChange(questionId, val)}
            className="flex flex-row gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="border-gray-400 text-black"
                value="yes"
                id={`${questionId}-yes`}
              />
              <Label htmlFor={`${questionId}-yes`} className="cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="border-gray-400 text-black"
                value="no"
                id={`${questionId}-no`}
              />
              <Label htmlFor={`${questionId}-no`} className="cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        );

      case "radio":
      case "multiple_choice":
        return (
          <RadioGroup
            value={answers[questionId] || ""}
            onValueChange={(val) => handleChange(questionId, val)}
            className="md:space-y-3 space-y-0"
          >
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  className="border-gray-400 text-black"
                  value={option.value}
                  id={`${questionId}-${option.value}`}
                />
                <Label
                  htmlFor={`${questionId}-${option.value}`}
                  className="cursor-pointer text-gray-700 leading-relaxed"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multi_select":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  className="border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-white"
                  id={`${questionId}-${option.value}`}
                  checked={(answers[questionId] || "")
                    .split(", ")
                    .includes(option.value)}
                  onCheckedChange={() =>
                    handleCheckbox(questionId, option.value)
                  }
                />
                <Label
                  htmlFor={`${questionId}-${option.value}`}
                  className="cursor-pointer text-gray-700 leading-relaxed"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
          />
        );

      case "time":
        return (
          <Input
            type="time"
            className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
          />
        );

      case "datetime":
        return (
          <Input
            type="datetime-local"
            className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
          />
        );

      default:
        return (
          <Input
            type="text"
            className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
            placeholder="Enter your answer..."
          />
        );
    }
  };

  const handleSubmit = () => {
    const result: SubmitQuestionPayload[] = [];
    const ai_result: AISubmitQuestionPayload[] = [];

    if (qrDtls?.appointment.source === "nextcare") {
      const updatedData = preAppQuestionnaires.response.data.map(
        (questionData, index) => {
          const questionKey = `question_${index}`;
          const editedAnswer = nextcareAnswers[questionKey];

          return {
            question: questionData.question,
            answer:
              editedAnswer !== undefined ? editedAnswer : questionData.answer,
          };
        }
      );

      // API call to update nextcare symptom data
      const nc_symptom_id = preAppQuestionnaires.response.id;
      const payload = {
        symptom_data: updatedData,
        remark: nextcareRemark.trim() || null,
      };
      if (!nc_symptom_id) {
        return toast.error("Symptom id is missing");
      }

      handleNextcareSubmit(nc_symptom_id, payload);
    } else {
      preAppQuestionnaires.response?.data.forEach((question) => {
        result.push({
          questionary_id: question.id,
          appointment_id: qrDtls?.appointment.id,
          answer: answers[question.id] || "",
          note: {
            submitted_by: "patient",
          },
        });
      });

      preAppQuestionnaires.response?.data.forEach((question) => {
        ai_result.push({
          question: question.question,
          answer: answers[question.id] || "",
        });
      });

      handleConfirmAnswerSubmit(result, ai_result);
    }
  };

  const handleConfirmAnswerSubmit = async (payload: any, ai_result: any) => {
    try {
      const response = await submitQuestionariesAnswersBulk(payload);
      if (response) {
        const aiPayload: AIAnalysisPayload = {
          qa_data: ai_result,
          summary_type: "comprehensive",
          appointment_id: qrDtls?.appointment.id || "",
        };

        router.push("/dashboard/nurse/check-in");
        dispatch(setNurseStepCompleted({ step1: true }));
        toast.success("Questionnaire submitted successfully.");

        submitQuestionnairesAnswerToAi(aiPayload).catch((error) => {
          console.error("AI analysis failed:", error);
        });
      }
    } catch (error) {
      toast.error("Failed to submit questionnaire.");
    }
  };

  const handleNextcareSubmit = async (nc_symptom_id: string, payload: any) => {
    try {
      const response = await updateNCSymptomData(nc_symptom_id, payload);
      console.log("Nextcare Update Response:", response);
      router.push("/dashboard/nurse/check-in");
      dispatch(setNurseStepCompleted({ step1: true }));
      toast.success("Nextcare symptom data updated successfully.");
    } catch (error) {
      toast.error("Failed to update data.");
    }
  };

  const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    handleSubmit();
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  if (preAppQuestionnaires.loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
          <div className="text-lg text-gray-600">Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center md:px-4 py-6">
      <div className="max-w-4xl w-full">
        <CardContent className="space-y-8 py-8">
          <div className="text-center">
            <h1 className="md:text-3xl text-xl font-bold text-gray-800">
              Patient Pre-Consultation Questionnaire
            </h1>
            <p className="text-gray-600 md:text-lg text-sm">
              Please answer the following questions to help us provide better
              care
            </p>
            {preAppQuestionnaires?.response?.data?.length > 0 && (
              <p className="text-sm text-gray-500">
                {preAppQuestionnaires.response?.data.length} question
                {preAppQuestionnaires.response?.data.length !== 1 ? "s" : ""} •
                All questions are optional
              </p>
            )}
          </div>

          <Separator className="my-8" />

          {preAppQuestionnaires?.response?.data?.length === 0 ? (
            <div className="text-center py-12">
              <div className="space-y-3">
                <p className="text-gray-500 text-lg">
                  No questions available at the moment.
                </p>
                <p className="text-gray-400 text-sm">
                  Please check back later or contact support.
                </p>
              </div>
            </div>
          ) : (
            <div className="md:space-y-8 space-y-4">
              {qrDtls?.appointment.source !== "nextcare"
                ? preAppQuestionnaires?.response?.data?.map(
                    (question, index) => (
                      <div
                        key={question.id}
                        className="bg-white border border-gray-200 rounded-xl md:p-6 p-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-3 mb-6">
                          <div className="flex items-start gap-3">
                            <span className="md:text-md text-sm font-semibold text-gray-500 bg-white">
                              Q{index + 1}
                            </span>
                            <div className="flex-1 space-y-2 ">
                              {question?.title && (
                                <h3 className="font-semibold text-gray-900 md:text-md text-sm">
                                  {question?.title}
                                </h3>
                              )}
                              <Label className="text-gray-700 font-medium md:text-md text-sm leading-relaxed block">
                                {question?.question}
                              </Label>
                              {question?.note && (
                                <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded">
                                  <p className="text-sm text-gray-700 italic">
                                    <span className="font-medium">Note:</span>{" "}
                                    {question?.note?.instruction}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="md:ml-12 ml-7 md:space-y-4 space-y-0">
                          {renderQuestionInput(question)}
                        </div>

                        <div className="ml-12 mt-4 flex items-center justify-between">
                          {answers[question.id] && (
                            <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                              ✓ Answered
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )
                : preAppQuestionnaires.response?.data.map(
                    (questionData, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <span className="text-md font-semibold text-black bg-white mt-0.5">
                              Q{index + 1}
                            </span>
                            <div className="flex-1 space-y-3">
                              {typeof questionData.question === "string" ? (
                                <Label className="text-gray-700 font-medium text-base leading-relaxed block">
                                  {questionData.question}
                                </Label>
                              ) : Array.isArray(questionData.question) ? (
                                <div className="space-y-3">
                                  {(questionData.question as any[]).map(
                                    (scenario: any, scenarioIndex: number) => (
                                      <div
                                        key={scenarioIndex}
                                        className="bg-gray-50 p-4 rounded-lg"
                                      >
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                          {scenario.scenario_title}
                                        </h4>
                                        <p className="text-gray-700 mb-3">
                                          {scenario.scenario_question}
                                        </p>
                                        {scenario.associated_title && (
                                          <div className="border-l-4 border-blue-400 pl-3">
                                            <h5 className="font-medium text-gray-800">
                                              {scenario.associated_title}
                                            </h5>
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

                              <div className="ml-4 space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-sm font-medium text-gray-700">
                                    Patient Response (Editable):
                                  </span>
                                </div>
                                {typeof questionData.answer === "string" ? (
                                  <Input
                                    type="text"
                                    className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                                    value={
                                      nextcareAnswers[`question_${index}`] || ""
                                    }
                                    onChange={(e) =>
                                      handleNextcareAnswerChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder="No answer provided"
                                  />
                                ) : typeof questionData.answer === "object" &&
                                  questionData.answer !== null ? (
                                  <div className="space-y-3">
                                    {Object.entries(questionData.answer).map(
                                      ([key, value]) => (
                                        <div key={key} className="space-y-1">
                                          <Label className="text-sm text-gray-600 capitalize">
                                            {key.replace(/_/g, " ")}:
                                          </Label>
                                          <Input
                                            type="text"
                                            className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                                            value={
                                              nextcareAnswers[
                                                `question_${index}`
                                              ]?.[key] || ""
                                            }
                                            onChange={(e) =>
                                              handleNextcareAnswerChange(
                                                index,
                                                e.target.value,
                                                key
                                              )
                                            }
                                            placeholder="Not provided"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <Input
                                    type="text"
                                    className="border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                                    value={
                                      nextcareAnswers[`question_${index}`] || ""
                                    }
                                    onChange={(e) =>
                                      handleNextcareAnswerChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder="No answer provided"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
            </div>
          )}

          {preAppQuestionnaires.response?.data.length > 0 && (
            <div className="pt-8">
              <Separator className="mb-8" />

              {/* Remark field for nextcare appointments */}
              {qrDtls?.appointment.source === "nextcare" && (
                <div className="max-w-2xl mx-auto mb-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <Label className="text-sm font-medium text-orange-800 mb-2 block">
                      Remarks (Optional)
                    </Label>
                    <Textarea
                      placeholder="Add any additional observations, concerns, or notes about the patient's responses..."
                      className="border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 min-h-[100px] resize-none"
                      value={nextcareRemark}
                      onChange={(e) => setNextcareRemark(e.target.value)}
                    />
                    <p className="text-xs text-orange-600 mt-2">
                      These remarks will be visible to the doctor during
                      consultation.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center md:space-y-4 space-y-2">
                <Button
                  onClick={handleSubmitClick}
                  className="w-full max-w-md py-3 md:text-md text-sm font-medium"
                  // size="lg"
                >
                  Submit Questionnaire
                  <ArrowRight />
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant={"outline"}
                  className="w-full max-w-md py-3 md:text-md text-sm font-medium"
                  // size=""
                >
                  Back
                </Button>
                <div className="text-center text-xs text-gray-500">
                  <p>
                    Ready to submit? Your responses have been saved
                    automatically.
                  </p>
                  <p>You can modify your answers before submitting.</p>
                </div>
              </div>
            </div>
          )}

          <ConfirmSubmissionModal
            isOpen={showConfirmModal}
            onClose={handleCancelSubmit}
            onConfirm={handleConfirmSubmit}
            totalQuestions={preAppQuestionnaires.response?.data.length}
            answeredQuestions={
              qrDtls?.appointment.source === "nextcare"
                ? Object.keys(nextcareAnswers).filter((key) => {
                    const answer = nextcareAnswers[key];
                    return (
                      answer !== "" && answer !== null && answer !== undefined
                    );
                  }).length
                : Object.keys(answers).filter((key) => {
                    const answer = answers[key];
                    return (
                      answer !== "" && answer !== null && answer !== undefined
                    );
                  }).length
            }
          />
        </CardContent>
      </div>
    </div>
  );
}
