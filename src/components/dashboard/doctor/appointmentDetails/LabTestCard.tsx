"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabTestOrder } from "@/types/doctor.types";
import { FlaskConical } from "lucide-react";
import moment from "moment";
import React from "react";
import { toast } from "sonner";

type LabTestCardProps = {
  labTests: LabTestOrder[];
};

const LabTestCard: React.FC<LabTestCardProps> = ({ labTests }) => {
  if (!labTests || labTests.length === 0) return null;

  const handleViewReport = async (test: LabTestOrder) => {
    if (test.status !== "completed" && test.status !== "verified") {
      toast.warning(
        "Report is not yet ready. You can view it once it's completed or verified."
      );
      return;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <span>Lab Investigations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-60 overflow-y-auto">
        {labTests.map((test) => (
          <div key={test.id} className="space-y-2 p-2 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge
                  className={`capitalize ${
                    test.status === "completed" || test.status === "verified"
                      ? "bg-green-100 text-green-800"
                      : test.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : test.status === "active"
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {test.status}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewReport(test)}
              >
                View Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500">Test Name</p>
                <p>{test.test_display}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Ordered On</p>
                <p>
                  {test.authored_on
                    ? moment(test.authored_on).format("DD MMM YYYY, hh:mm A")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Priority</p>
                <p className="capitalize">{test.priority}</p>
              </div>
            </div>

            {test.notes.length > 0 && (
              <div className="p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                <strong>Note:</strong>{" "}
                {test.notes
                  .map((note) => note.text)
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LabTestCard;
