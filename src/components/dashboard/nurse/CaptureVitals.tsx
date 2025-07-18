"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import axios from "axios";
import { Loader2 } from "lucide-react";
import { setQrDetails } from "@/store/slices/nurseSlice";
import { fetchVitals, submitBulkVitals } from "@/services/nurse.api";

type VitalDefinition = {
  id: string;
  name: string;
  unit?: string;
  code: string;
};

type DynamicFormValues = {
  [key: string]: string;
};

const CaptureVitals = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [vitalDefs, setVitalDefs] = useState<VitalDefinition[]>([]);

  const { qrDtls } = useSelector((state: RootState) => state.nurse);
  const form = useForm<DynamicFormValues>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vitals = await fetchVitals();
        setVitalDefs(vitals);
      } catch (error) {
        console.error("Error fetching vitals:", error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (values: DynamicFormValues) => {
    if (!qrDtls?.patient.user_id || !qrDtls?.appointment.id) {
      return toast.error("Missing required field.");
    }

    const vitalsPayload = vitalDefs.map((vital) => {
      const value = values[vital.id];

      if (vital.name === "Blood Pressure" && value.includes("/")) {
        const [systolic, diastolic] = value.split("/").map(Number);
        return {
          vital_def_id: vital.id,
          value: { systolic, diastolic },
          is_abnormal: false,
        };
      }

      return {
        vital_def_id: vital.id,
        value: { value: Number(value) },
        is_abnormal: false,
      };
    });

    const payload = {
      patient_id: qrDtls?.patient.user_id,
      appointment_id: qrDtls?.appointment.id,
      recorded_by_id: "fd14345f-f9dc-45a1-9abb-1ab57d845ea1",
      vitals: vitalsPayload,
    };
    setLoading(true);

    try {
      const response = await submitBulkVitals(payload);

      console.log("Vitals submitted:", response);
      dispatch(setQrDetails(null));
      toast.success("General vitals captured successfully.");
      router.push("/nurse/check-in");
    } catch (err) {
      console.error("Error submitting vitals:", err);
      toast.error("Getting error when submit general vitals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <CardContent className="space-y-4 w-full md:max-w-xl mt-4">
        <h2 className="text-2xl font-semibold text-center text-primary">
          General Vitals Form
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {vitalDefs.map((vital) => (
              <FormField
                key={vital.id}
                name={vital.id}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {vital.name} {vital.unit && `(${vital.unit})`}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="p-2"
                        type="text"
                        placeholder={
                          vital.name === "Blood Pressure"
                            ? "e.g. 120/80"
                            : `Enter ${vital.name}`
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button type="submit" className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : "Save Vitals"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default CaptureVitals;
