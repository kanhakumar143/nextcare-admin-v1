"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  AddQuestionRequest,
  QuestionNote,
  QuestionType,
} from "@/types/admin.preQuestionary.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Plus } from "lucide-react";

interface AddPreQuestionaryModalProps {
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData: (Partial<AddQuestionRequest> & { id?: string }) & {
    note?: QuestionNote | null;
  };
}

type Option = {
  label: string;
  value: string;
};

type FormData = {
  specialty_id: string;
  title: string;
  question: string;
  type: QuestionType;
  options: Option[];
  note: {
    mandatory: boolean;
    instruction: string;
  };
};

const optionTypes = [
  QuestionType.MultiSelect,
  QuestionType.MultipleChoice,
  QuestionType.Radio,
];

export const AddPreQuestionaryModal: React.FC<AddPreQuestionaryModalProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const specialties = useSelector(
    (state: RootState) => state.specialty.specialtyData.data
  );

  const isEditMode = Boolean(initialData && initialData.id);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      specialty_id: "",
      title: "",
      question: "",
      type: undefined as unknown as QuestionType,
      options: [{ label: "", value: "" }],
      note: { mandatory: false, instruction: "" },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const selectedType = watch("type");
  const selectedSpecialtyId = watch("specialty_id");

  useEffect(() => {
    if (!isEditMode && selectedSpecialtyId && specialties.length > 0) {
      const specialty = specialties.find((s) => s.id === selectedSpecialtyId);
      if (specialty) {
        setValue("title", specialty.specialty_label);
      }
    }
  }, [selectedSpecialtyId, specialties, setValue, isEditMode]);

  useEffect(() => {
    if (isEditMode && initialData) {
      reset(initialData as FormData);
    } else if (!isEditMode && specialties.length > 0) {
      reset({
        specialty_id: "",
        title: specialties[0].specialty_label,
        question: "",
        type: undefined as unknown as QuestionType,
        options: [{ label: "", value: "" }],
        note: { mandatory: false, instruction: "" },
      });
    }
  }, [specialties, reset, initialData, isEditMode]);

  const onFormSubmit = (data: FormData) => {
    if (optionTypes.includes(data.type)) {
      data.options = data.options.filter(
        (opt) => opt.label.trim() !== "" && opt.value.trim() !== ""
      );
    } else {
      data.options = [];
    }
    onSubmit(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="flex gap-x-9">
            <div>
              <Label htmlFor="specialty_id" className="block mb-2">
                Specialty
              </Label>
              <Controller
                control={control}
                name="specialty_id"
                rules={{ required: "Specialty is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec.id} value={spec.id}>
                          {spec.specialty_label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.specialty_id && (
                <p role="alert" className="text-red-600 text-sm mt-1">
                  {errors.specialty_id.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="type" className="block mb-2">
                Type
              </Label>
              <Controller
                control={control}
                name="type"
                rules={{ required: "Type is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(QuestionType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p role="alert" className="text-red-600 text-sm mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="question" className="block mb-2">
              Question
            </Label>
            <Textarea
              id="question"
              {...register("question", { required: "Question is required" })}
              aria-invalid={errors.question ? "true" : "false"}
            />
            {errors.question && (
              <p role="alert" className="text-red-600 text-sm mt-1">
                {errors.question.message}
              </p>
            )}
          </div>

          {selectedType && optionTypes.includes(selectedType) && (
            <div>
              <Label className="block mb-2">Options</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Label"
                    {...register(`options.${index}.label` as const, {
                      required: "Label is required",
                    })}
                  />
                  <Input
                    placeholder="Value"
                    {...register(`options.${index}.value` as const, {
                      required: "Value is required",
                    })}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                    size="sm"
                    className="min-w-[32px]"
                    aria-label="Remove option"
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append({ label: "", value: "" })}
                variant="outline"
              >
                <Plus />
              </Button>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
