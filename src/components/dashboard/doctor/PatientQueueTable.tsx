import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface Patient {
  id: string;
  name: string;
  slotStart: string;
  slotEnd: string;
  concern: string;
  date: string;
  status: string;
  phone: string;
  age: number;
  bloodGroup: string;
}

interface PatientQueueTableProps {
  patients: Patient[];
  onPatientInfo: (patient: Patient) => void;
}

const PatientQueueTable = ({
  patients,
  onPatientInfo,
}: PatientQueueTableProps) => {
  const [maxList, setMaxList] = useState<number>(6);

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-muted-foreground">Serial No.</TableHead>
            <TableHead className="text-muted-foreground">
              Patient Name
            </TableHead>
            <TableHead className="text-muted-foreground">Time Slot</TableHead>
            <TableHead className="text-muted-foreground">Concern</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.slice(0, maxList).map((patient, index) => (
            <TableRow key={patient.id + index} className="border-border">
              <TableCell className="text-foreground px-5">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {patient.name}
              </TableCell>
              <TableCell className="text-foreground">
                {patient.slotStart} - {patient.slotEnd}
              </TableCell>
              <TableCell className="text-foreground">
                {patient.concern}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    patient.status === "scheduled" ? "secondary" : "outline"
                  }
                  className="bg-secondary text-secondary-foreground"
                >
                  {patient.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPatientInfo(patient)}
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-center w-full py-5">
        {patients.length > 6 && (
          <Button
            className="text-sky-600"
            variant="link"
            onClick={() =>
              setMaxList((prev) => (prev === 6 ? patients.length : 6))
            }
          >
            {maxList === 6 ? "See all" : "See less"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PatientQueueTable;
