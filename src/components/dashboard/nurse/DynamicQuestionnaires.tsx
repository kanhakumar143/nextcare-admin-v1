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
  fetchAllQuestionnairesByTenantServiceId,
  submitQuestionariesAnswersBulk,
} from "@/services/nurse.api";
import ConfirmSubmissionModal from "./modals/ConfirmSubmissionModal";
import { ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch } from "@/store";
import { setNurseStepCompleted } from "@/store/slices/nurseSlice";
import { Question, SubmitQuestionPayload } from "@/types/nurse.types";
import { Slider } from "@/components/ui/slider";

export default function DynamicQuestionnaires() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { qrDtls } = useSelector((state: any) => state.nurse);

  const tenantServiceId = "d3b70733-c73b-47d8-8fda-deb238d64653";

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetchAllQuestionnairesByTenantServiceId(
          qrDtls.appointment.service_id
        );
        setQuestions(response.data || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [tenantServiceId]);

  const handleChange = (id: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
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
            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
            placeholder="Enter your answer..."
          />
        );

      case "textarea":
        return (
          <Textarea
            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
            placeholder="Enter your detailed answer..."
          />
        );

      case "number":
        return (
          <Input
            type="number"
            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            className="flex flex-row gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="border-gray-400 text-blue-600"
                value="yes"
                id={`${questionId}-yes`}
              />
              <Label htmlFor={`${questionId}-yes`} className="cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="border-gray-400 text-blue-600"
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
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  className="border-gray-400 text-blue-600"
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
                  className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
          />
        );

      case "time":
        return (
          <Input
            type="time"
            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
          />
        );

      case "datetime":
        return (
          <Input
            type="datetime-local"
            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
          />
        );

      default:
        return (
          <Input
            type="text"
            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={answers[questionId] || ""}
            onChange={(e) => handleChange(questionId, e.target.value)}
            placeholder="Enter your answer..."
          />
        );
    }
  };

  const handleSubmit = () => {
    const result: SubmitQuestionPayload[] = [];

    questions.forEach((question) => {
      result.push({
        questionary_id: question.id,
        appointment_id: qrDtls.appointment.id,
        answer: answers[question.id] || "",
        note: {
          submitted_by: "patient",
        },
      });
    });

    console.log("All Answers (Formatted):", result);
    handleConfirmAnswerSubmit(result);
  };

  const handleConfirmAnswerSubmit = async (payload: any) => {
    try {
      const response = await submitQuestionariesAnswersBulk(payload);
      console.log("Submission Response:", response);
      router.push("/dashboard/nurse/check-in");
      dispatch(setNurseStepCompleted({ step1: true }));
      toast.success("Questionnaire submitted successfully.");
    } catch (error) {
      console.error("Error submitting answers:", error);
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
  if (loading) {
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
    <div className="flex justify-center px-4 py-6">
      <div className="max-w-4xl w-full">
        <CardContent className="space-y-8 py-8">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-800">
              Patient Pre-Consultation Questionnaire
            </h1>
            <p className="text-gray-600 text-lg">
              Please answer the following questions to help us provide better
              care
            </p>
            {questions.length > 0 && (
              <p className="text-sm text-gray-500">
                {questions.length} question{questions.length !== 1 ? "s" : ""} •
                All questions are optional
              </p>
            )}
          </div>

          <Separator className="my-8" />

          {/* Questions Section */}
          {questions.length === 0 ? (
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
            <div className="space-y-8">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Question Header */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <span className="text-md font-semibold text-black bg-white mt-0.5">
                        Q{index + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        {question.title && (
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {question.title}
                          </h3>
                        )}
                        <Label className="text-gray-700 font-medium text-base leading-relaxed block">
                          {question.question}
                        </Label>
                        {question.note && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                            <p className="text-sm text-blue-700 italic">
                              <span className="font-medium">Note:</span>{" "}
                              {question.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question Input */}
                  <div className="ml-12 space-y-4">
                    {renderQuestionInput(question)}
                  </div>

                  {/* Question Meta Info */}
                  <div className="ml-12 mt-4 flex items-center justify-between">
                    {/* <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      Type: {question.type.replace("_", " ")}
                    </div> */}
                    {answers[question.id] && (
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ Answered
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Section */}
          {questions.length > 0 && (
            <div className="pt-8">
              <Separator className="mb-8" />
              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={handleSubmitClick}
                  className="w-full max-w-md py-3 text-md font-medium"
                  size="lg"
                >
                  Submit Questionnaire
                  <ArrowRight />
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant={"outline"}
                  className="w-full max-w-md py-3 text-md font-medium"
                  size="lg"
                >
                  Back
                </Button>
                <div className="text-center text-sm text-gray-500">
                  <p>
                    Ready to submit? Your responses have been saved
                    automatically.
                  </p>
                  <p>You can modify your answers before submitting.</p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          <ConfirmSubmissionModal
            isOpen={showConfirmModal}
            onClose={handleCancelSubmit}
            onConfirm={handleConfirmSubmit}
            totalQuestions={questions.length}
            answeredQuestions={
              Object.keys(answers).filter((key) => {
                const answer = answers[key];
                return answer !== "" && answer !== null && answer !== undefined;
              }).length
            }
          />
        </CardContent>
      </div>
    </div>
  );
}
