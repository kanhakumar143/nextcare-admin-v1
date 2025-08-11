"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { fetchSpecialtiesByTenantId } from "@/store/slices/specialtySlice";
import { fetchQuestionsBySpecialty } from "@/store/slices/preQuestionarySlice";
import { Loader } from "lucide-react";

export default function PreQuestionarySet() {
  const dispatch = useDispatch<AppDispatch>();
  const { orgId } = useAuthInfo();
  const { specialtyData } = useSelector((state: RootState) => state.specialty);
  const { data, error, loading } = useSelector(
    (state: RootState) => state.preQuestionary
  );

  useEffect(() => {
    if (orgId) {
      dispatch(fetchSpecialtiesByTenantId(orgId));
    }
  }, [orgId, dispatch]);

  useEffect(() => {
    if (specialtyData.data.length > 0) {
      const specialtyId = specialtyData.data[0]?.id;
      dispatch(fetchQuestionsBySpecialty(specialtyId));
    }
  }, [specialtyData]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-4">
        {specialtyData.data.length > 0 && (
          <Select
            onValueChange={(specialtyId) => {
              dispatch(fetchQuestionsBySpecialty(specialtyId));
            }}
            defaultValue={specialtyData.data[0]?.id}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialtyData.data.map((spec, index) => (
                <SelectItem className="capitalize" key={index} value={spec.id}>
                  {spec?.specialty_label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex gap-2">
          <Button variant="default">Add Question</Button>
          {/* <Button variant="secondary">Bulk Upload</Button> */}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8 text-gray-500">
          <Loader className="animate-spin mr-2 h-4 w-4" />
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-center items-center py-8 text-red-500">
          {error}
        </div>
      )}

      {/* Data table */}
      {!loading && !error && (
        <div className="border rounded-lg">
          {data.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No questions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>{q.question}</TableCell>
                    <TableCell>{q.title}</TableCell>
                    <TableCell>{q.type}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
