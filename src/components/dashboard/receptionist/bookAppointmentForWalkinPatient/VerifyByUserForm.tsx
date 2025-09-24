"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import moment from "moment";
// import { createNewUserPayload } from "@/types/patient.types";
import { createNewUser } from "@/services/uploadRegister.api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ORG_TENANT_ID } from "@/config/authKeys";
import { createNewUserPayload } from "@/types/receptionist.types";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import BackButton from "@/components/common/BackButton";

const fieldLabels: Record<string, string> = {
  name: "Full Name",
  dob: "Date of Birth",
  gender: "Gender",
  phone: "Phone Number",
  email: "Email",
};

const VerifyByUserForm = () => {
  const router = useRouter();
  const { captureDtls, docDtls, checkUserPhoneNumber } = useAppSelector(
    (state: RootState) => state.auth
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState({
    name: captureDtls?.name || "",
    dob: moment(captureDtls?.dob).format("YYYY-MM-DD") || "",
    gender: captureDtls?.gender || "",
    phone: checkUserPhoneNumber || "",
    email: docDtls?.email || "",
  });

  const showEmailField = !!(docDtls?.email && docDtls?.email.trim() !== "");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        newErrors[key] = `${fieldLabels[key]} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validateForm()) return;
    setLoading(true);
    const payload: createNewUserPayload = {
      //   user_id: userId,
      name: captureDtls?.name || "",
      user_role: "patient",
      tenant_id: ORG_TENANT_ID,
      is_active: true,
      patient_profile: {
        gender: captureDtls?.gender === "Male" ? "male" : "female",
        birth_date: moment(captureDtls?.dob).format("YYYY-MM-DD") || "",
        deceased_boolean: false,
        multiple_birth_boolean: false,
        marital_status_code: "M",
        marital_status_display: "Married",
        managing_organization: "Mardamed",
        gov_url_path: docDtls?.file_url || "",
        telecoms: [
          {
            system: "phone",
            value: checkUserPhoneNumber || "",
            use: "mobile",
            rank: 1,
            period_start: moment().format("YYYY-MM-DD"),
          },
        ],
        identifiers: [
          {
            use: "official",
            system: docDtls?.file_url || "",
            assigner:
              docDtls?.doc_type === "aadhar"
                ? "adhaar"
                : docDtls?.doc_type === "DL"
                ? "dl"
                : "passport",
            value: captureDtls?.document_value || "",
            period_start: moment().format("YYYY-MM-DD"),
          },
        ],
        names: [
          {
            use: "official",
            text: captureDtls?.name || "",
            family: captureDtls?.name || "",
            period_start: moment().format("YYYY-MM-DD"),
          },
        ],
        communications: [
          {
            language_code: "en",
            language_display: "English",
            preferred: true,
          },
        ],
        verifications: [
          {
            verification_status: "under_review",
            method:
              docDtls?.doc_type === "adhaar"
                ? "aadhar"
                : docDtls?.doc_type === "DL"
                ? "dl"
                : "passport",
            verify_by: "",
          },
        ],
      },
    };
    console.log("Payload for new user:", payload);
    try {
      const result = await createNewUser(payload);
      if (result) {
        toast.success("Patient registered successfully.");
        router.push("/dashboard/receptionist/book-appointment");
      }
    } catch (error) {
      console.error("Error creating new user:", error);
      toast.error("Failed to create new user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] ">
      <Card className="max-w-2xl w-full shadow-xl px-6 py-10 md:py-16 border border-gray-100 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Verify Your Details
          </CardTitle>
          <CardDescription className="text-gray-600 text-base md:text-lg">
            Please ensure your details are correct before proceeding with
            registration. You can edit the information now, or later if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {Object.entries(form)
              .filter(([key]) => key !== "email" || showEmailField)
              .map(([key, value]) => (
                <div key={key} className="mb-2">
                  <Label htmlFor={key} className="font-medium text-gray-700">
                    {fieldLabels[key]}
                  </Label>
                  <Input
                    id={key}
                    name={key}
                    type={
                      key === "dob" ? "date" : key === "phone" ? "tel" : "text"
                    }
                    value={value || ""}
                    onChange={handleChange}
                    className={`p-5 mt-2 text-base ${
                      errors[key] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors[key] && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors[key]}
                    </span>
                  )}
                </div>
              ))}
            <div className="space-y-2 mt-8">
              <Button type="submit" className="w-full">
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Confirm and Submit"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
                type="button"
              >
                Scan Again
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="mt-8 flex flex-wrap gap-4 justify-center items-center text-xs md:text-sm text-gray-400">
            <span className="hover:text-blue-600 cursor-pointer">
              Terms & Conditions
            </span>
            <span className="hover:text-blue-600 cursor-pointer">Support</span>
            <span className="hover:text-blue-600 cursor-pointer">
              Customer Care
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyByUserForm;
