"use client";

/**
 * DoctorProfileUpdate Component
 *
 * A comprehensive form for doctors to edit their profile information including:
 * - Personal Information (first names, last name, gender, birth date)
 * - Dynamic Contact Information (read-only primary contacts and editable secondary contacts)
 * - Professional License details
 * - Education & Qualifications
 *
 * Features:
 * - Primary phone and email are displayed as read-only information
 * - Secondary contacts can be added/removed with proper rank management
 * - Form validation for secondary contacts only
 * - Form validation using external Zod schema (@/schemas/updateDoctorProfile.schema)
 * - Redux integration for fetching practitioner data
 * - Direct API calls for profile updates (only secondary contacts are sent)
 * - Auto-population of existing data with proper telecom structure
 * - Real-time form validation and error handling
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  Award,
  IdCard,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPractitionerDetails } from "@/store/slices/doctorSlice";
import { PractitionerData } from "@/types/doctorNew.types";
import { updatePractitionerDetails } from "@/services/doctor.api";
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/schemas/updateDoctorProfile.schema";

export default function DoctorProfileUpdate() {
  const dispatch = useAppDispatch();
  const {
    practitionerData,
    practitionerDataLoading: loading,
    practitionerDataError,
  } = useAppSelector((state) => state.doctor);
  const { userId } = useAuthInfo();
  const router = useRouter();

  // Local state for update loading
  const [updateLoading, setUpdateLoading] = useState(false);
  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      prefix: "",
      given: "",
      family: "",
      gender: "male",
      birth_date: "",
      telecom: [
        {
          system: "phone",
          value: "",
          use: "mobile",
          rank: 0,
          period: null,
        },
        {
          system: "email",
          value: "",
          use: "work",
          rank: 0,
          period: null,
        },
      ],
      qualifications: [{ year: "", degree: "", institution: "" }],
    },
  });

  useEffect(() => {
    if (userId && !practitionerData) {
      dispatch(fetchPractitionerDetails(userId));
    }
  }, [dispatch, userId, practitionerData]);

  useEffect(() => {
    if (practitionerData) {
      const { practitioner_data } = practitionerData;

      // Process telecom data to ensure we have primary phone and email
      const existingTelecom = practitioner_data.telecom || [];
      const primaryPhone = existingTelecom.find(
        (t) => t.system === "phone" && t.rank === 1
      );
      const primaryEmail = existingTelecom.find(
        (t) => t.system === "email" && t.rank === 1
      );
      const secondaryContacts = existingTelecom.filter(
        (t) => (t.system === "phone" || t.system === "email") && t.rank === 0
      );

      // Build telecom array with guaranteed primary phone and email
      const telecomData = [
        {
          system: "phone" as const,
          value: primaryPhone?.value || "",
          use: (primaryPhone?.use as "mobile" | "work" | "home") || "mobile",
          rank: 1 as const,
          period: null,
        },
        {
          system: "email" as const,
          value: primaryEmail?.value || "",
          use: (primaryEmail?.use as "mobile" | "work" | "home") || "work",
          rank: 1 as const,
          period: null,
        },
        ...secondaryContacts.map((contact) => ({
          system: contact.system as "phone" | "email",
          value: contact.value,
          use: contact.use as "mobile" | "work" | "home" | undefined,
          rank: 0 as const,
          period: contact.period,
        })),
      ];

      form.reset({
        prefix: practitioner_data.name.prefix?.[0] || "Dr.",
        given: practitioner_data.name?.given?.[0] || "",
        family: practitioner_data.name?.family || "",
        gender: practitioner_data.gender as "male" | "female" | "other",
        birth_date: practitioner_data.birth_date || "",
        telecom: telecomData,
        qualifications:
          practitioner_data.qualification?.length > 0
            ? practitioner_data.qualification
            : [{ year: "", degree: "", institution: "" }],
      });
    }
  }, [practitionerData, form]);

  // Handle form submission
  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      setUpdateLoading(true);

      // Transform form data to match the API structure
      const updatePayload = {
        id: practitionerData?.practitioner_data.id || "",
        name: {
          use: "official",
          text: `${data.prefix} ${data.given} ${data.family}`.trim(),
          family: data.family,
          given: [data.given],
          prefix: data.prefix ? [data.prefix] : [],
          suffix: null,
          period: null,
        },
        gender: data.gender,
        birth_date: data.birth_date,
        telecom: data.telecom,
        qualification: data.qualifications.filter(
          (q) => q.degree.trim() !== ""
        ),
      };
      console.log(updatePayload);
      const response = await updatePractitionerDetails(updatePayload);
      console.log(response);

      // Refresh the practitioner data in Redux after successful update
      dispatch(fetchPractitionerDetails(userId || ""));

      toast.success("Profile updated successfully!");
      router.push("/dashboard/doctor/profile");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // Field array helpers for qualifications
  const addQualification = () => {
    const current = form.getValues("qualifications");
    form.setValue("qualifications", [
      ...current,
      { year: "", degree: "", institution: "" },
    ]);
  };

  const removeQualification = (index: number) => {
    const current = form.getValues("qualifications");
    if (current.length > 1) {
      form.setValue(
        "qualifications",
        current.filter((_, i) => i !== index)
      );
    }
  };

  // Field array helpers for telecom
  const addTelecomContact = (system: "phone" | "email") => {
    const current = form.getValues("telecom");
    form.setValue("telecom", [
      ...current,
      {
        system,
        value: "",
        use: system === "phone" ? "mobile" : "work",
        rank: 0,
        period: null,
      },
    ]);
  };

  const removeTelecomContact = (index: number) => {
    const current = form.getValues("telecom");
    // Don't allow removing primary phone or email (first two items)
    if (index >= 2) {
      form.setValue(
        "telecom",
        current.filter((_, i) => i !== index)
      );
    }
  };

  const isPrimaryContact = (index: number) => index < 2;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/doctor/profile")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            onClick={() => router.push("/dashboard/doctor/profile")}
          >
            Cancel
          </Button> */}
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title, First Name, Last Name in one row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title/Prefix</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          if (val !== "") {
                            field.onChange(val);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr.">Dr.</SelectItem>
                          <SelectItem value="Prof.">Prof.</SelectItem>
                          <SelectItem value="Mr.">Mr.</SelectItem>
                          <SelectItem value="Ms.">Ms.</SelectItem>
                          <SelectItem value="Mrs.">Mrs.</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="given"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter first name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="family"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Gender and Birth Date in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Primary Contacts (locked) */}
                <div className="space-y-4">
                  <FormLabel className="text-sm font-medium">
                    Primary Contact Information
                  </FormLabel>

                  {(practitionerData?.practitioner_data?.telecom || [])
                    .filter((contact) => contact.rank == 1)
                    .map((contact, index) => (
                      <div
                        key={`${contact.system}-${index}`}
                        className="flex border rounded-lg bg-gray-50 p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full items-center">
                          <div className="flex items-center space-x-2">
                            {contact.system === "phone" ? (
                              <Phone className="w-4 h-4" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium capitalize">
                              Primary {contact.system}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600 font-medium">
                              {contact.system === "phone"
                                ? "Phone Number"
                                : "Email Address"}
                            </span>
                            <span className="text-base font-medium text-gray-900">
                              {contact.value || "Not provided"}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600 font-medium">
                              Use
                            </span>
                            <span className="text-base font-medium text-gray-900 capitalize">
                              {contact.use || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Secondary Contacts (optional) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">
                      Alternate Contact Information (Optional)
                    </FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTelecomContact("phone")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Phone
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTelecomContact("email")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Email
                      </Button>
                    </div>
                  </div>

                  {(form.watch("telecom") || [])
                    .slice(2)
                    .map((contact, actualIndex) => {
                      const index = actualIndex + 2; // Adjust for the first two primary contacts
                      return (
                        <div
                          key={index}
                          className="flex border rounded-lg pr-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 w-full">
                            <div className="flex items-center space-x-2">
                              {contact.system === "phone" ? (
                                <Phone className="w-4 h-4" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium capitalize">
                                Secondary {contact.system}
                              </span>
                            </div>

                            <FormField
                              control={form.control}
                              name={`telecom.${index}.value`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {contact.system === "phone"
                                      ? "Phone Number"
                                      : "Email Address"}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type={
                                        contact.system === "phone"
                                          ? "tel"
                                          : "email"
                                      }
                                      placeholder={
                                        contact.system === "phone"
                                          ? "Enter phone number"
                                          : "Enter email address"
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`telecom.${index}.use`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Use</FormLabel>
                                  <FormControl>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select use" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mobile">
                                          Mobile
                                        </SelectItem>
                                        <SelectItem value="work">
                                          Work
                                        </SelectItem>
                                        <SelectItem value="home">
                                          Home
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="py-4 flex items-center justify-center mt-7">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTelecomContact(index)}
                              className="mb-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional License */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard className="w-5 h-5" />
                Professional License
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    License Number
                  </FormLabel>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm font-mono">
                      {practitionerData?.practitioner_data?.license_details
                        ?.number || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Issued By
                  </FormLabel>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm">
                      {practitionerData?.practitioner_data?.license_details
                        ?.issued_by || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Expiry Date
                  </FormLabel>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm">
                      {practitionerData?.practitioner_data?.license_details
                        ?.expiry
                        ? new Date(
                            practitionerData.practitioner_data.license_details.expiry
                          ).toLocaleDateString()
                        : "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* License Document Viewer */}
              {practitionerData?.practitioner_data?.license_url && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        License Document Available
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          practitionerData.practitioner_data.license_url,
                          "_blank"
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View License PDF
                    </Button>
                  </div>
                  <p className="text-xs mt-2">
                    Click the button above to view the official license document
                    in a new tab.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Education & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Qualifications</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQualification}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Qualification
                  </Button>
                </div>

                {(form.watch("qualifications") || []).map((_, index) => (
                  <div
                    key={index}
                    className="border rounded-lg flex w-full pr-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 w-full">
                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.degree`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., MBBS, MD" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="University/College name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.year`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="YYYY" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-center items-center mt-7">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQualification(index)}
                        disabled={
                          (form.watch("qualifications") || []).length <= 1
                        }
                        className="mb-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
