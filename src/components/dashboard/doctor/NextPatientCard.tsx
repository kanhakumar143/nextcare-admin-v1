import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, Phone, Heart } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  slotStart: string;
  slotEnd: string;
  concern: string;
  phone: string;
  age: number;
  bloodGroup: string;
}

interface NextPatientCardProps {
  patient: Patient | null;
}

const NextPatientCard = ({ patient }: NextPatientCardProps) => {
  if (!patient) {
    return (
      <Card className="w-full max-w-md mx-auto bg-card border border-border px-4 py-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <User className="h-4 w-4" />
            Next Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground text-center py-4">
          No patients are currently scheduled.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-card border border-border px-4 py-3 shadow-sm">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
          <User className="h-4 w-4" />
          Next Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3 text-sm">
        {/* Patient Name & Slot */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground">{patient.name}</span>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="h-4 w-4" />
            {patient.slotStart} - {patient.slotEnd}
          </div>
        </div>

        {/* Concern */}
        <div>
          <p className="text-xs text-muted-foreground">Concern</p>
          <p className="font-medium text-foreground">{patient.concern}</p>
        </div>

        {/* Age & Blood Group */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="font-medium">{patient.age} yrs</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Blood Group</p>
            <div className="flex items-center justify-end gap-1 text-destructive font-semibold">
              <Heart className="h-4 w-4" />
              {patient.bloodGroup}
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{patient.phone}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button size="sm" className="text-sm px-3 py-1.5">
            Start
          </Button>
          <Button size="sm" variant="outline" className="text-sm px-3 py-1.5">
            Hold
          </Button>
          <Button size="sm" variant="outline" className="text-sm px-3 py-1.5">
            Skip
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="text-sm px-3 py-1.5"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextPatientCard;
