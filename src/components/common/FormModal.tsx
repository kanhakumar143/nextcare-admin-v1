"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const currentYear = new Date().getFullYear();
const today = new Date().toISOString().split("T")[0];

const practitionerFormSchema = z.object({
  // User Info
  tenant_id: z.string().min(1, "Tenant ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\+?\d{10,15}$/, "Invalid phone number format"),
  hashed_password: z.string().min(6).optional(),

  // Practitioner Info
  identifier_system: z.string().url().optional(),
  identifier_value: z.string().min(1).optional(),
  prefix: z.string().optional(),
  given_name: z.string().min(1).optional(),
  family_name: z.string().min(1).optional(),
  telecom_phone: z.string().min(10).optional(),
  telecom_email: z.string().email().optional(),
  gender: z.enum(["male", "female", "other", "unknown"]).optional(),
  birth_date: z.string().optional().refine((val) => !val || val <= today, {
    message: "Birth date cannot be in the future",
  }),

  // Qualification
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  graduation_year: z
    .string()
    .regex(/^\d{4}$/)
    .refine((val) => parseInt(val) <= currentYear, {
      message: `Graduation year cannot be in the future (max ${currentYear})`,
    }),

  // License
  license_number: z.string().min(1),
  license_issued_by: z.string().min(1),
  license_expiry: z.string().min(1).refine((val) => val >= today, {
    message: "License expiry cannot be in the past",
  }),
  profile_picture_url: z.string().url(),
  license_url: z.string().url(),
  is_active: z.boolean(),

  // Role Info
  role_code_system: z.string().url().optional(),
  role_code: z.string().min(1).optional(),
  role_display: z.string().min(1).optional(),
  role_text: z.string().min(1).optional(),
  specialty: z.string().min(1).optional(),
  location_reference: z.string().min(1).optional(),
  location_display: z.string().min(1).optional(),
  healthcare_service_reference: z.string().min(1).optional(),
  healthcare_service_display: z.string().min(1).optional(),
  period_start: z.string().min(1).optional(),
  period_end: z.string().min(1).optional(),

  // Availability
  availability_days: z.array(z.string()).min(1),
  available_times: z
    .array(
      z.object({
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .min(1),

  // Not Available
  not_available_description: z.string().optional(),
  not_available_start: z.string().optional(),
  not_available_end: z.string().optional(),
});

type PractitionerFormData = z.infer<typeof practitionerFormSchema>;

interface PractitionerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit1: (formData: any) => Promise<void>;
  editPractitionerId?: string | null;
  onSuccess?: () => void;
  role: "doctor" | "nurse";
}

const daysOfWeek = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

const roleDefaults = {
  doctor: {
    role_code: "doctor",
    role_display: "Doctor",
    role_text: "Doctor",
  },
  nurse: {
    role_code: "nurse",
    role_display: "Nurse",
    role_text: "Nurse",
  },
};

export default function PractitionerFormModal({
  open,
  onOpenChange,
  editPractitionerId = null,
  onSuccess,
  onSubmit1,
  role,
}: PractitionerFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PractitionerFormData>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      tenant_id: "4896d272-e201-4dce-9048-f93b1e3ca49f",
      is_active: true,
      available_times: [{ start: "09:00", end: "17:00" }],
      role_code_system: "http://terminology.hl7.org/CodeSystem/practitioner-role",
      availability_days: ["mon", "tue", "wed", "thu", "fri"],
      ...roleDefaults[role],
    },
  });

  const { fields: timeFields, append: appendTime, remove: removeTime } =
    useFieldArray({
      control: form.control,
      name: "available_times",
    });

  const onSubmit = async (data: PractitionerFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        user: {
          tenant_id: data.tenant_id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          hashed_password: "default1234",
          user_role: role,
        },
        practitioner: {
          identifiers: [
            { system: data.identifier_system ?? "", value: data.identifier_value ?? "" },
          ],
          name: {
            prefix: data.prefix ? [data.prefix] : [],
            given: [data.given_name ?? ""],
            family: data.family_name ?? "",
          },
          telecom: [
            { system: "phone", value: data.telecom_phone ?? "", use: "mobile" },
            { system: "email", value: data.telecom_email ?? "", use: "work" },
          ],
          gender: data.gender ?? "",
          birth_date: data.birth_date ?? "",
          qualification: [
            { degree: data.degree, institution: data.institution, year: data.graduation_year },
          ],
          license_details: {
            number: data.license_number,
            issued_by: data.license_issued_by,
            expiry: data.license_expiry,
          },
          profile_picture_url: data.profile_picture_url,
          license_url: data.license_url,
          is_active: data.is_active,
        },
        role: {
          tenant_id: data.tenant_id,
          code: [
            {
              coding: [
                {
                  system: data.role_code_system ?? "",
                  code: data.role_code ?? "",
                  display: data.role_display ?? "",
                },
              ],
              text: data.role_text ?? "",
            },
          ],
          specialty: [{ text: data.specialty ?? "" }],
          location: [{ reference: data.location_reference ?? "", display: data.location_display ?? "" }],
          healthcare_service: [
            { reference: data.healthcare_service_reference ?? "", display: data.healthcare_service_display ?? "" },
          ],
          period: { start: data.period_start ?? "", end: data.period_end ?? "" },
          availability: [{ daysOfWeek: data.availability_days, availableTime: data.available_times }],
          not_available: data.not_available_description
            ? [
                {
                  description: data.not_available_description,
                  during: { start: data.not_available_start || "", end: data.not_available_end || "" },
                },
              ]
            : [],
        },
      };
      console.log(payload);
      await onSubmit1(payload);
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(`Error adding ${role}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[60vw] max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editPractitionerId
              ? `Edit ${role.charAt(0).toUpperCase() + role.slice(1)}`
              : `Add New ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.error("Form validation errors:", errors);
            })}
            className="space-y-6 "
          >
            {/* User Information Section */}
            <div className="space-y-4 ">
              <div className="flex  justify-between">
                <FormField
                  control={form.control}
                  name="tenant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className=" text-blue-800 px-3 py- rounded-md   font-semibold inline-block">
                        Tenant ID : {field.value}
                      </FormLabel>

                      <FormControl>
                        {/* <Input placeholder="Enter tenant ID" {...field} /> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex mr-5  ">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Status</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-red-500">*</span>{" "}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Gender <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Birth Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="hashed_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
            </div>

            {/* License Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">License Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="license_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        License Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="MCI-20231234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="license_issued_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Issued By <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="MCI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="license_expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        License Expiry <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profile_picture_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Profile Picture URL{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://your-cdn.com/images/profile.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="license_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        License Document URL{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://your-cdn.com/licenses/license.pdf"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Qualification Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Qualification </h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Degree <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="MBBS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Institution<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="AIIMS Delhi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="graduation_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Graduation Year <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="2008" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Role Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Role & Specialty</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="Internal Medicine" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="Location/1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location_display"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Display</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NextCare Health Center, Bengaluru"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="healthcare_service_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Healthcare Service Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="HealthcareService/1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="healthcare_service_display"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Healthcare Service Display</FormLabel>
                      <FormControl>
                        <Input placeholder="Outpatient Services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Period Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Employment Period</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="period_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="period_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Availability</h3>

              <FormField
                control={form.control}
                name="availability_days"
                render={() => (
                  <FormItem>
                    <FormLabel>Available Days</FormLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {daysOfWeek.map((day) => (
                        <FormField
                          key={day.value}
                          control={form.control}
                          name="availability_days"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            day.value,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== day.value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {day.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 ">
                <Label>Available Time Slots</Label>
                {timeFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-2 items-center">
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`available_times.${index}.start`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <FormField
                        control={form.control}
                        name={`available_times.${index}.end`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTime(index)}
                        disabled={timeFields.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className=" ">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendTime({ start: "09:00", end: "17:00" })
                        }
                      >
                        <Plus className="w-4 h-4 " />
                        Add Time Slot
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practitioner Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Practitioner Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="identifier_system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifier System URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://medicalcouncil.org/license"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identifier_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifier Value</FormLabel>
                      <FormControl>
                        <Input placeholder="MCI123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefix (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="given_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Given Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter given name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="family_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter family name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telecom_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+919876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telecom_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="work@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Not Available Section (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Not Available</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="not_available_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Not Available From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="not_available_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Not Available Until</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="not_available_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="On leave, Conference, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? editPractitionerId
                    ? `Updating ${role}...`
                    : `Adding ${role}...`
                  : editPractitionerId
                  ? `Update ${role}`
                  : `Enroll ${role}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
