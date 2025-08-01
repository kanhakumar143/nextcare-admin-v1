"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { QuestionaryAnswer } from "@/types/doctor.types";

type QuestionaryAnswersProps = {
  answers: QuestionaryAnswer[];
};

const QuestionaryAnswers: React.FC<QuestionaryAnswersProps> = ({ answers }) => {
  if (!answers || answers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <span>Pre-Appointment Questionnaire Answers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-60 overflow-y-auto">
        {answers.map((dataObj, i) => (
          <div
            key={i}
            className="py-1 px-3 border rounded-lg shadow-sm bg-muted/20"
          >
            <p className="text-sm text-gray-500 mb-0.5 font-medium">
              {dataObj?.questionary?.question}
            </p>
            <div className="text-sm text-gray-900">
              {Array.isArray(dataObj.answer) ? (
                <div className="flex flex-wrap gap-2">
                  {dataObj.answer.map((ans: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {ans}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p>{dataObj.answer}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuestionaryAnswers;
