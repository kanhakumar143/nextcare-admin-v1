import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitNote } from "@/types/doctor.types";
import { FileText, Stethoscope } from "lucide-react";
import React from "react";

type ClinicalNotesCardProps = {
  visitNotes: VisitNote[];
};

const ClinicalNotesCard: React.FC<ClinicalNotesCardProps> = ({
  visitNotes,
}) => {
  if (!visitNotes || visitNotes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Clinical Visit Notes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visitNotes.map((note) => (
          <div key={note.id} className="space-y-4">
            {note.summary && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {note.summary}
                </p>
              </div>
            )}

            {note.assessments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Assessment</h4>
                <div className="space-y-2">
                  {note.assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <Stethoscope className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-blue-900">
                            {assessment.description}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-amber-50"
                          >
                            {assessment.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {note.care_plans.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Care Plan</h4>
                <div className="space-y-2">
                  {note.care_plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          {plan.goal}
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          {plan.detail}
                        </p>
                      </div>
                      <Badge className="ml-4 whitespace-nowrap self-start capitalize">
                        {plan.plan_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {note.follow_up && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Follow-up Instructions
                </h4>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                  {note.follow_up}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ClinicalNotesCard;
