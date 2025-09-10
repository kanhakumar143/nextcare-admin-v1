import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServices } from "@/store/slices/servicesSlice";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { createSubService } from "@/services/subServices.api"; // <-- import your API function
import { SubService } from "@/types/subServices.type";

// ✅ Validation schema
const subServiceSchema = z.object({
  name: z.string().min(1, "Sub-service name is required"),
  description: z.string().min(1, "Description is required"),
  tenant_service_id: z.string().uuid("Must be a valid UUID"),
  active: z.boolean(),
});

type SubServiceFormData = z.infer<typeof subServiceSchema>;

interface AddSubServiceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (data: SubService) => void; // renamed for clarity
}

export default function AddSubServiceModal({
  open,
  onClose,
  onCreated,
}: AddSubServiceModalProps) {
  const dispatch = useAppDispatch();
  const { items: services, loading } = useAppSelector(
    (state) => state.services
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubServiceFormData>({
    resolver: zodResolver(subServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      tenant_service_id: "",
      active: true,
    },
  });

  // Fetch services when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchServices());
    }
  }, [open, dispatch]);

  const handleFormSubmit = async (formData: SubServiceFormData) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await createSubService(formData); // ✅ call API
      onCreated(created); // send back created sub-service to parent
      reset(); // clear form
      onClose(); // close modal
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create sub-service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <VisuallyHidden>
          <DialogTitle>Add Sub-Service</DialogTitle>
        </VisuallyHidden>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Service Selector + Active Switch */}
          <div className="flex items-end gap-4">
            <div className="w-64">
              <label className="block mb-1 font-medium text-sm">Service</label>
              <Select
                value={watch("tenant_service_id")}
                onValueChange={(val) => setValue("tenant_service_id", val)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loading ? "Loading..." : "Select a service"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.map((srv) => (
                    <SelectItem key={srv.id} value={srv.id}>
                      {srv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenant_service_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tenant_service_id.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={watch("active")}
                onCheckedChange={(val) => setValue("active", val)}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>

          {/* Sub-service Name */}
          <div>
            <label className="block mb-1 font-medium text-sm">
              Sub-Service Name
            </label>
            <Input {...register("name")} placeholder="e.g. General Checkup" />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium text-sm">Description</label>
            <Input
              {...register("description")}
              placeholder="e.g. Sub-service of general medicine"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Error message */}
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
