"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useDispatch, useSelector } from "react-redux";
import { fetchServices } from "@/store/slices/servicesSlice";
import { AppDispatch, RootState } from "@/store";

const currentYear = new Date().getFullYear();
const today = new Date().toISOString().split("T")[0];

const practitionerFormSchema = z.object({
  // User Info
  tenant_id: z.string().min(1, "Tenant ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  hashed_password: z.string().min(6).optional(),

  // Practitioner Info
  identifier_system: z.string().optional(),
  identifier_value: z.string().optional(),
  gender: z.enum(["male", "female", "other", "unknown"]).optional(),
  birth_date: z
    .string()
    .optional()
    .refine((val) => !val || val <= today, {
      message: "Birth date cannot be in the future",
    }),

  // Service Selection
  selected_service_name: z.string().optional(),
  selected_specialty_id: z.string().min(1, "Specialty selection is required"),

  // Qualification
  qualification_degree: z.string().min(1, "Degree is required"),
  qualification_institution: z.string().min(1, "Institution is required"),
  qualification_year: z
    .string()
    .min(4, "Year must be 4 digits")
    .refine(
      (val) => {
        const year = parseInt(val);
        return year >= 1950 && year <= currentYear;
      },
      {
        message: `Year must be between 1950 and ${currentYear}`,
      }
    ),

  // License Details
  license_number: z.string().min(1, "License number is required"),
  license_issued_by: z.string().min(1, "License issuing authority is required"),
  license_expiry: z
    .string()
    .min(1, "License expiry date is required")
    .refine((val) => val >= today, {
      message: "License expiry date cannot be in the past",
    }),

  // URLs
  profile_picture_url: z.string().url("Must be a valid URL").optional(),
  license_url: z
    .string()
    .url("Must be a valid URL")
    .min(1, "License URL is required"),

  is_active: z.boolean(),
});

type PractitionerFormData = z.infer<typeof practitionerFormSchema>;

interface PractitionerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit1: (formData: any) => Promise<void>;
  onSubmit2: (formData: any) => Promise<void>;
  editPractitionerId?: string | null;
  defaultValues?: Partial<PractitionerFormData>;
  onSuccess?: () => void;
  role: "doctor" | "nurse";
}

export default function PractitionerFormModal({
  open,
  onOpenChange,
  editPractitionerId = null,
  onSuccess,
  onSubmit1,
  onSubmit2,
  defaultValues,
  role,
}: PractitionerFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedServiceData, setSelectedServiceData] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { items } = useSelector((state: RootState) => state.services);

  const form = useForm<PractitionerFormData>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      tenant_id: "b91a2af6-7c52-4fd3-9a5a-5b4456c34c14",
      is_active: true,
      selected_service_name: "",
      selected_specialty_id: "",
      qualification_degree: "",
      qualification_institution: "",
      qualification_year: "",
      license_number: "",
      license_issued_by: "",
      license_expiry: "",
      profile_picture_url: "",
      license_url: "",
      ...defaultValues, // ✅ merge parent defaultValues here
    },
  });

  // Handle service selection change
  const handleServiceChange = (serviceName: string) => {
    setSelectedService(serviceName);
    const serviceData = items?.find((item: any) => item.name === serviceName);
    setSelectedServiceData(serviceData);

    // Reset specialty selection when service changes
    form.setValue("selected_specialty_id", "");
    form.setValue("selected_service_name", serviceName);
  };

  // Handle specialty selection change
  const handleSpecialtyChange = (specialtyId: string) => {
    form.setValue("selected_specialty_id", specialtyId);
  };

  const onSubmit = async (data: PractitionerFormData) => {
    // setIsSubmitting(true);
    console.log("Form Data Submitted:", data);
    try {
      const payload = {
        user: {
          name: data.name ?? "",
          email: data.email ?? "",
          // phone: data.telecom_phone ?? "",
          hashed_password: data.hashed_password ?? "qwer1234",
          user_role: role === "nurse" ? "nurse" : "doctor",
          tenant_id: "4896d272-e201-4dce-9048-f93b1e3ca49f",
        },
        practitioner: {
          identifiers: [
            {
              system: "http://hospital.org/nurse",
              value: "SA123456",
            },
          ],
          telecom: [
            { system: "phone", value: data.phone ?? "", use: "mobile" },
            { system: "email", value: data.email ?? "", use: "work" },
          ],
          gender: data.gender ?? "unknown",
          birth_date: data.birth_date ?? "",
          is_active: data.is_active ?? true,
          service_specialty_id: data.selected_specialty_id ?? "",
          qualification: [
            {
              degree: data.qualification_degree ?? "",
              institution: data.qualification_institution ?? "",
              year: data.qualification_year ?? "",
            },
          ],
          license_details: {
            number: data.license_number ?? "",
            issued_by: data.license_issued_by ?? "",
            expiry: data.license_expiry ?? "",
          },
          profile_picture_url: data.profile_picture_url ?? "",
          license_url: data.license_url ?? "",
        },
      };

      console.log(payload);
      if (defaultValues) {
        await onSubmit2(payload);
      } else {
        await onSubmit1(payload);
      }
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(`Error adding ${role}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    dispatch(fetchServices());
  }, []);

  useEffect(() => {
    console.log("Default Values:", defaultValues);
    if (defaultValues) {
      form.reset({
        tenant_id: "b91a2af6-7c52-4fd3-9a5a-5b4456c34c14",
        is_active: true,
        selected_service_name: "",
        selected_specialty_id: "",
        qualification_degree: "",
        qualification_institution: "",
        qualification_year: "",
        license_number: "",
        license_issued_by: "",
        license_expiry: "",
        profile_picture_url: "",
        license_url: "",
        ...defaultValues,
      });

      // If there are default values for service selection, set the local state
      if (defaultValues.selected_service_name) {
        setSelectedService(defaultValues.selected_service_name);
        const serviceData = items?.find(
          (item: any) => item.name === defaultValues.selected_service_name
        );
        setSelectedServiceData(serviceData);
      }

      console.log("Form Values After Reset:", form.getValues());
    }
  }, [defaultValues, form, role, items]);

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
      setSelectedService("");
      setSelectedServiceData(null);
    }
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
              console.log("Form Errors:", errors);
              console.error("Form validation errors:", errors);
            })}
            className="space-y-6"
          >
            {/* User Information Section */}
            <div className="space-y-4 ">
              <div className="flex justify-end items-center">
                {/* // <FormField */}
                {/* // control={form.control} */}
                {/* //name="tenant_id" */}
                {/* // render={({ field }) => ( */}
                {/* //   <FormItem> */}
                {/* //     <FormLabel className=" text-blue-800 rounded-md font-semibold inline-block"> */}
                {/* //       Tenant ID : {field.value} */}
                {/* //     </FormLabel> */}

                {/* //     <FormControl> */}
                {/* <Input placeholder="Enter tenant ID" {...field} /> */}
                {/* //     </FormControl> */}
                {/* //     <FormMessage /> */}
                {/* //   </FormItem> */}
                {/* // )} */}
                {/* // /> */}
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
              <h3 className="text-lg font-bold">Personal Details</h3>

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
                          <SelectTrigger className="w-full">
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

            {/* Service Selection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Service Selection</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="selected_service_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Service <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleServiceChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {items?.map((service: any) => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="selected_specialty_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Specialty <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleSpecialtyChange(value);
                        }}
                        value={field.value}
                        disabled={
                          !selectedServiceData?.service_specialties?.length
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedServiceData?.service_specialties?.map(
                            (specialty: any) => (
                              <SelectItem
                                key={specialty.id}
                                value={specialty.id}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {specialty.specialty_label}
                                  </span>
                                  {/* <span className="text-xs text-gray-500">
                                    {specialty.description}
                                  </span> */}
                                </div>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Qualification Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Qualification</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="qualification_degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Degree <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MBBS, MD, BSN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualification_institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Institution <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AIIMS Delhi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualification_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Year of Graduation{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 2008"
                          maxLength={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        <Input placeholder="e.g., MCI-20231234" {...field} />
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
                        <Input placeholder="e.g., MCI, NMC" {...field} />
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
                        License Expiry Date{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Document URLs Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Document URLs</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile_picture_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/profile.jpg"
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
                          placeholder="https://example.com/license.pdf"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Role Information Section */}
            {/* <div className="space-y-4">
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
            </div> */}

            {/* Period Section */}
            {/* <div className="space-y-4">
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
            </div> */}

            {/* Availability Section */}
            {/* <div className="space-y-4">
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
            </div> */}

            {/* Practitioner Information Section */}
            {/* <div className="space-y-4">
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
            </div> */}

            {/* Not Available Section (Optional) */}
            {/* <div className="space-y-4">
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
            </div> */}

            <DialogFooter className="space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
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
