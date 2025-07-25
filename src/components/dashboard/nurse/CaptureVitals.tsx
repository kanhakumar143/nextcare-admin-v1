"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setNurseStepCompleted, setQrDetails } from "@/store/slices/nurseSlice";
import { fetchVitals, submitBulkVitals } from "@/services/nurse.api";

type VitalDefinition = {
  id: string;
  name: string;
  code: string;
  loinc_code: string;
  system: string;
  unit?: string;
  data_type: string;
  normal_min: number;
  normal_max: number;
  component_definitions: {
    measurement_method?: string;
  };
  multiple_results_allowed: boolean;
  is_active: boolean;
  tenant_id: string;
};

type DynamicFormValues = {
  [key: string]: string;
};

// Function to create dynamic validation schema based on vital definitions
const createValidationSchema = (vitals: VitalDefinition[]) => {
  const schemaFields: Record<string, z.ZodString> = {};

  vitals.forEach((vital) => {
    let fieldValidation = z.string().min(1, `${vital.name} is required`);

    // Special validation for Blood Pressure (format: systolic/diastolic)
    if (
      vital.name.toLowerCase().includes("blood pressure") ||
      vital.code === "BP"
    ) {
      fieldValidation = fieldValidation.refine(
        (value) => {
          const bpRegex = /^\d{2,3}\/\d{2,3}$/;
          return bpRegex.test(value);
        },
        {
          message:
            "Blood pressure must be in format: systolic/diastolic (e.g., 120/80)",
        }
      );
    } else {
      // Numeric validation for other vitals with reasonable range checking
      fieldValidation = fieldValidation
        .refine(
          (value) => {
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue > 0;
          },
          { message: `${vital.name} must be a valid positive number` }
        )
        .refine(
          (value) => {
            const numValue = parseFloat(value);
            return (
              numValue >= vital.normal_min * 0.5 &&
              numValue <= vital.normal_max * 2
            );
          },
          {
            message: `${vital.name} should be within reasonable range (${
              vital.normal_min * 0.5
            } - ${vital.normal_max * 2})`,
          }
        );
    }

    schemaFields[vital.code] = fieldValidation;
  });

  return z.object(schemaFields);
};

const CaptureVitals = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [vitalDefs, setVitalDefs] = useState<VitalDefinition[]>([]);
  const { qrDtls } = useSelector((state: RootState) => state.nurse);
  const [loading, setLoading] = useState<boolean>(false);

  // Create form without validation initially
  const form = useForm<DynamicFormValues>({
    defaultValues: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vitals = await fetchVitals();
        setVitalDefs(vitals);
      } catch (error) {
        console.error("Error fetching vitals:", error);
        toast.error("Failed to fetch vital definitions");
      }
    };
    fetchData();
  }, []);

  // Custom validation function
  const validateForm = (values: DynamicFormValues): boolean => {
    if (vitalDefs.length === 0) return false;

    const schema = createValidationSchema(vitalDefs);
    const result = schema.safeParse(values);

    if (!result.success) {
      // Set form errors
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          form.setError(issue.path[0] as string, {
            type: "manual",
            message: issue.message,
          });
        }
      });
      return false;
    }

    // Clear all errors if validation passes
    form.clearErrors();
    return true;
  };

  // Function to check if a vital value is abnormal
  const isVitalAbnormal = (vital: VitalDefinition, value: string): boolean => {
    if (
      vital.name.toLowerCase().includes("blood pressure") ||
      vital.code === "BP"
    ) {
      const [systolic, diastolic] = value.split("/").map(Number);
      // Basic BP abnormal check (you can adjust these ranges as needed)
      return (
        systolic < 90 || systolic > 140 || diastolic < 60 || diastolic > 90
      );
    }

    const numValue = parseFloat(value);
    return numValue < vital.normal_min || numValue > vital.normal_max;
  };

  const onSubmit = async (values: DynamicFormValues) => {
    // Validate form first
    if (!validateForm(values)) {
      toast.error("Please fix the validation errors");
      return;
    }

    // if (!qrDtls?.patient.user_id || !qrDtls?.appointment.id) {
    //   return toast.error("Missing required field.");
    // }

    const vitalsPayload = vitalDefs.map((vital) => {
      const value = values[vital.code]; // Use code instead of id for form field

      if (
        vital.name.toLowerCase().includes("blood pressure") ||
        vital.code === "BP"
      ) {
        const [systolic, diastolic] = value.split("/").map(Number);
        return {
          vital_def_id: vital.id, // Use id for API
          value: { systolic, diastolic },
          is_abnormal: isVitalAbnormal(vital, value),
        };
      }

      return {
        vital_def_id: vital.id, // Use id for API
        value: { value: Number(value) },
        is_abnormal: isVitalAbnormal(vital, value),
      };
    });

    const payload = {
      patient_id: qrDtls?.patient.patient_profile.id || "",
      appointment_id: qrDtls?.appointment.id || "",
      // recorded_by_id: "f2f2921d-dde9-4e20-ab4c-846011e2c255",
      vitals: vitalsPayload,
    };

    console.log("Final payload:", payload);

    setLoading(true);
    try {
      const response = await submitBulkVitals(payload);
      console.log("Vitals submitted:", response);
      toast.success("General vitals captured successfully.");
      router.push("/dashboard/nurse/check-in");
      dispatch(setNurseStepCompleted({ step2: true }));
    } catch (err) {
      console.error("Error submitting vitals:", err);
      toast.error("Getting error when submit general vitals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-4">
      <CardContent className="w-full max-w-xl mt-6 space-y-6 p-6 rounded-xl ">
        <h2 className="text-2xl font-semibold text-center text-primary">
          General Vitals Form
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {vitalDefs.map((vital) => (
              <FormField
                key={vital.id}
                name={vital.code}
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-medium">
                      {vital.name} {vital.unit && `(${vital.unit})`}
                      <span className="text-sm text-gray-500 ml-2">
                        {vital.name.toLowerCase().includes("blood pressure") ||
                        vital.code === "BP"
                          ? "(Normal: 90-140/60-90)"
                          : `(Normal: ${vital.normal_min}-${vital.normal_max})`}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={
                          vital.name.toLowerCase().includes("blood pressure") ||
                          vital.code === "BP"
                            ? "e.g. 120/80"
                            : `Enter ${vital.name} (${vital.normal_min}-${vital.normal_max})`
                        }
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex flex-col gap-3 justify-between pt-2">
              <Button
                onClick={() => router.back()}
                type="button"
                variant="outline"
                className="w-full md:w-auto"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  "Save Vitals"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default CaptureVitals;
