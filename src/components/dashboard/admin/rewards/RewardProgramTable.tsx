"use client";

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
import { ExtendedRewardProgramData } from "@/types/reward.types";
import { Edit, Trash, Trash2 } from "lucide-react";

type RewardProgramTableProps = {
  data: ExtendedRewardProgramData[];
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function RewardProgramTable({
  data,
  onEdit,
  onDelete,
}: RewardProgramTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Created At</TableHead>
            {/* <TableHead className="text-center">Action</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-medium">{program.name}</TableCell>
              <TableCell className="max-w-xs truncate">
                {program.description}
              </TableCell>
              <TableCell>
                {program.active ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(program.created_at).toLocaleDateString()}
              </TableCell>
              {/* <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                </Button>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
