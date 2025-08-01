import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Observation } from "@/types/doctor.types";
import {
  Activity,
  AlertCircle,
  Heart,
  Ruler,
  Thermometer,
  Weight,
} from "lucide-react";
import React from "react";

type VitalSignsCardProps = {
  observations: Observation[];
};

const VitalSignsCard: React.FC<VitalSignsCardProps> = ({ observations }) => {
  if (!observations || observations.length === 0) return null;

  const getVitalIcon = (code: string) => {
    switch (code) {
      case "HT":
        return <Ruler className="h-4 w-4" />;
      case "WT":
        return <Weight className="h-4 w-4" />;
      case "TEMP":
        return <Thermometer className="h-4 w-4" />;
      case "BP":
        return <Heart className="h-4 w-4" />;
      case "HR":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>Vital Signs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-60 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {observations.map((observation) => (
            <div key={observation.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getVitalIcon(observation.vital_definition.code)}
                  <span className="text-sm font-medium">
                    {observation.vital_definition.name}
                  </span>
                </div>
                {observation.is_abnormal && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="text-lg font-semibold text-primary">
                {observation.vital_definition.code === "BP"
                  ? `${observation.value.systolic}/${observation.value.diastolic}`
                  : observation.value.value}
                <span className="text-sm text-gray-500 ml-1">
                  {observation.vital_definition.unit}
                </span>
              </div>

              <div className="text-xs text-gray-500">
                Normal: {observation.vital_definition.normal_min} -{" "}
                {observation.vital_definition.normal_max}{" "}
                {observation.vital_definition.unit}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalSignsCard;
