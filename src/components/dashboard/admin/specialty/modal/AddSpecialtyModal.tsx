import React, { useEffect } from "react";
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


const specialtySchema = z.object({
  specialty_label: z.string().min(1, "Specialty label is required"),
  tenant_service_id: z.string().uuid("Must be a valid UUID"),
  is_active: z.boolean(),
});

type SpecialtyFormData = z.infer<typeof specialtySchema>;

interface AddSpecialtyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddSpecialtyModal({
  open,
  onClose,
  onSubmit,
}: AddSpecialtyModalProps) {
  const dispatch = useAppDispatch();
  const { items: services, loading } = useAppSelector(
    (state) => state.services
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SpecialtyFormData>({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      specialty_label: "",
      tenant_service_id: "",
      is_active: true,
    },
  });

  // Fetch services on modal open
  useEffect(() => {
    if (open) {
      dispatch(fetchServices());
    }
  }, [open, dispatch]);

  const handleFormSubmit = (formData: SpecialtyFormData) => {
    const payload = {
      tenant_service_id: formData.tenant_service_id,
      code: formData.specialty_label.substring(0, 4).toUpperCase(),
      system: "http://example.org/service-specialty",
      display: formData.specialty_label,
      specialty_label: formData.specialty_label,
      description: `${formData.specialty_label} description`,
      is_active: formData.is_active,
    };
    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <VisuallyHidden>
          <DialogTitle>Add Specialty</DialogTitle>
        </VisuallyHidden>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
                checked={watch("is_active")}
                onCheckedChange={(val) => setValue("is_active", val)}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Specialty Name
            </label>
            <Input
              {...register("specialty_label")}
              placeholder="e.g. Cardiology"
            />
            {errors.specialty_label && (
              <p className="text-red-500 text-sm">
                {errors.specialty_label.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
