"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadImageToAws } from "@/services/labTechnician.api";
import { UploadImageResponse } from "@/types/labTechnician.type";
import { toast } from "sonner";
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
import { fetchOnlyServices } from "@/store/slices/servicesSlice";
import { AppDispatch, RootState } from "@/store";
import { ORG_TENANT_ID } from "@/config/authKeys";
import { TenantService } from "@/types/services.types";

// const currentYear = new Date().getFullYear();
const today = new Date().toISOString().split("T")[0];

const practitionerFormSchema = z.object({
  // User Info
  tenant_id: z.string().min(1, "Tenant ID is required"),
  name: z.string().min(3,"Name must be at least 3 characters"),
  email: z.email("Invalid email"),
  phone: z.string().min(10, "Must be 10 character"),
  hashed_password: z.string().min(6).optional(),

  // Practitioner Info
  identifier_system: z.string().optional(),
  identifier_value: z.string().optional(),
  gender: z.enum(["male", "female", "other", "unknown"]),
  birth_date: z
    .string()
    .refine((val) => !val || val <= today, {
      message: "Birth date cannot be in the future",
    }),

  // Service Selection
  selected_service_name: z.string().optional(),
  selected_specialty_id: z.string().min(1, "Specialty selection is required"),

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
  profile_picture_url: z.string().optional(),
  license_url: z.string().optional(),

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
  role: "doctor" | "nurse" | "lab_technician";
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
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const { serviceSpecialityData } = useSelector(
    (state: RootState) => state.services
  );

  const form = useForm<PractitionerFormData>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      tenant_id: ORG_TENANT_ID, //"b91a2af6-7c52-4fd3-9a5a-5b4456c34c14",
      is_active: true,
      selected_service_name: "",
      selected_specialty_id: "",
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
    const serviceData = serviceSpecialityData?.find(
      (item: any) => item.name === serviceName
    );
    setSelectedServiceData(serviceData);

    // Reset specialty selection when service changes
    form.setValue("selected_specialty_id", "");
    form.setValue("selected_service_name", serviceName);
  };

  // Handle specialty selection change
  const handleSpecialtyChange = (specialtyId: string) => {
    form.setValue("selected_specialty_id", specialtyId);
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !e.target.files[0]) {
      toast.error("Please select an image to upload.");
      return;
    }

    const file = e.target.files[0];

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file only.");
      return;
    }

    const formData = new FormData();
    formData.append("f_name", "profile_picture");
    formData.append("doc_types", "profile");
    formData.append("phone_no", new Date().toISOString());
    formData.append("files", file);

    setUploadingProfile(true);

    try {
      const response: UploadImageResponse = await uploadImageToAws(formData);
      const file_url = response.uploaded_files[0].file_url;

      if (file_url) {
        form.setValue("profile_picture_url", file_url);
        toast.success("Profile picture uploaded successfully");
      }
    } catch (error) {
      console.error("Profile picture upload error:", error);
      toast.error("Something went wrong! Please try again");
    } finally {
      setUploadingProfile(false);
    }
  };

  // Handle license document upload
  const handleLicenseUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !e.target.files[0]) {
      toast.error("Please select an image to upload.");
      return;
    }

    const file = e.target.files[0];

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file only.");
      return;
    }

    const formData = new FormData();
    formData.append("f_name", "license_document");
    formData.append("doc_types", "license");
    formData.append("phone_no", new Date().toISOString());
    formData.append("files", file);

    setUploadingLicense(true);

    try {
      const response: UploadImageResponse = await uploadImageToAws(formData);
      const file_url = response.uploaded_files[0].file_url;

      if (file_url) {
        form.setValue("license_url", file_url);
        toast.success("License document uploaded successfully");
      }
    } catch (error) {
      console.error("License upload error:", error);
      toast.error("Something went wrong! Please try again");
    } finally {
      setUploadingLicense(false);
    }
  };

  const onSubmit = async (data: PractitionerFormData) => {
    setIsSubmitting(true);
    console.log("Form Data Submitted:", data);

    // Validate required fields
    if (!data.license_url) {
      toast.error("Please upload the license document before submitting.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        user: {
          name: data.name ?? "",
          email: data.email ?? "",
          // phone: data.telecom_phone ?? "",
          hashed_password: data.hashed_password ?? "qwer1234",
          user_role:
            role === "nurse"
              ? "nurse"
              : role === "lab_technician"
              ? "lab_technician"
              : "doctor",
          tenant_id: ORG_TENANT_ID,
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
    dispatch(fetchOnlyServices());
  }, []);

  useEffect(() => {
    console.log("Default Values:", defaultValues);
    if (defaultValues) {
      form.reset({
        tenant_id: ORG_TENANT_ID, //"b91a2af6-7c52-4fd3-9a5a-5b4456c34c14",
        is_active: true,
        selected_service_name: "",
        selected_specialty_id: "",
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
        const serviceData = serviceSpecialityData?.find(
          (item: any) => item.name === defaultValues.selected_service_name
        );
        setSelectedServiceData(serviceData);
      }

      console.log("Form Values After Reset:", form.getValues());
    }
  }, [defaultValues, form, role, serviceSpecialityData]);

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
      setSelectedService("");
      setSelectedServiceData(null);
      setUploadingProfile(false);
      setUploadingLicense(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto min-w-5xl">
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
                        <Input placeholder="Enter phone number" type="number" {...field} />
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
                          {serviceSpecialityData?.map(
                            (service: TenantService) => (
                              <SelectItem key={service.id} value={service.name}>
                                {service.name}
                              </SelectItem>
                            )
                          )}
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

            {/* Document Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Document Upload</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Profile Picture
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploadingProfile}
                      className="cursor-pointer"
                    />
                    {uploadingProfile && (
                      <p className="text-sm text-blue-600">Uploading...</p>
                    )}
                    {form.watch("profile_picture_url") && (
                      <p className="text-sm text-green-600">
                        ✓ Image uploaded successfully
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    License Document <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLicenseUpload}
                      disabled={uploadingLicense}
                      className="cursor-pointer"
                    />
                    {uploadingLicense && (
                      <p className="text-sm text-blue-600">Uploading...</p>
                    )}
                    {form.watch("license_url") && (
                      <p className="text-sm text-green-600">
                        ✓ Document uploaded successfully
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
