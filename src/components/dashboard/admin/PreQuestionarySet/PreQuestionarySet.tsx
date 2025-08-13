"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { fetchSpecialtiesByTenantId } from "@/store/slices/specialtySlice";
import { fetchQuestionsBySpecialty } from "@/store/slices/preQuestionarySlice";
import { Loader, Pencil } from "lucide-react";

import { AddPreQuestionaryModal } from "@/components/dashboard/admin/PreQuestionarySet/modals/AddPreQuestionaryModal";
import { QuestionType, QuestionOption, AddQuestionRequest } from "@/types/admin.preQuestionary.types";
import { addPreQuestionary, updatePreQuestionary } from "@/services/preQuestionary.api";

import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

type QuestionRow = AddQuestionRequest & { id: string };

export default function PreQuestionarySet() {
  const dispatch = useDispatch<AppDispatch>();
  const { orgId } = useAuthInfo();
  const { specialtyData } = useSelector((state: RootState) => state.specialty);
  const { data, error, loading } = useSelector(
    (state: RootState) => state.preQuestionary
  );

  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionRow | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const columns: ColumnDef<QuestionRow>[] = [
    { accessorKey: "question", header: "Question" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "type", header: "Type" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>
          <Pencil />
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (orgId) {
      dispatch(fetchSpecialtiesByTenantId(orgId));
    }
  }, [orgId, dispatch]);

  useEffect(() => {
    if (specialtyData.data.length > 0) {
      const id = specialtyData.data[0]?.id;
      setSelectedSpecialtyId(id);
      dispatch(fetchQuestionsBySpecialty(id));
    }
  }, [specialtyData, dispatch]);

  const handleSpecialtyChange = (specialtyId: string) => {
    setSelectedSpecialtyId(specialtyId);
    dispatch(fetchQuestionsBySpecialty(specialtyId));
  };

  const handleAddQuestionClick = () => {
    setSelectedQuestion(null);
    setModalOpen(true);
    setSubmitError(null);
  };

  const handleEdit = (question: QuestionRow) => {
    setSelectedQuestion(question);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSubmitError(null);
  };

  const handleModalSubmit = async (formData: AddQuestionRequest) => {
    setSubmitLoading(true);
    setSubmitError(null);

    const payload: QuestionRow = {
      ...formData,
      id: selectedQuestion?.id ?? "",
      options: formData.options ?? [],
      note: formData.note ?? { mandatory: false, instruction: "" },
    };

    try {
      if (selectedQuestion) {
        await updatePreQuestionary(selectedQuestion.id, payload);
        toast.success("Question updated successfully");
      } else {
        await addPreQuestionary(payload);
        toast.success("Question added successfully");
      }
      setModalOpen(false);
      dispatch(fetchQuestionsBySpecialty(payload.specialty_id));
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save question");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Top Actions */}
      <div className="flex items-center justify-between gap-4">
        {specialtyData.data.length > 0 && (
          <Select
            onValueChange={handleSpecialtyChange}
            value={selectedSpecialtyId ?? undefined}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialtyData.data.map((spec) => (
                <SelectItem key={spec.id} value={spec.id}>
                  {spec.specialty_label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="default" onClick={handleAddQuestionClick}>
          Add Question
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8 text-gray-500">
          <Loader className="animate-spin mr-2 h-4 w-4" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex justify-center items-center py-8 text-red-500">
          {error}
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div className="border rounded-lg">
          {data.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No questions found.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data as QuestionRow[]}
              filterColumn="question"
            />
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && selectedSpecialtyId && (
        <AddPreQuestionaryModal
          initialData={
            selectedQuestion ?? {
              specialty_id: selectedSpecialtyId,
              title: "",
              question: "",
              type: "" as QuestionType,
              options: [],
              note: { mandatory: false, instruction: "" },
            }
          }
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Submit Loading */}
      {submitLoading && (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center text-white text-lg z-50">
          Saving question...
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-50">
          {submitError}
        </div>
      )}
    </div>
  );
}
