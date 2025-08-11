"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServices } from "@/store/slices/servicesSlice";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
const symptomSchema = z.object({
  display: z.string().min(1, "Symptom label is required"),
  tenant_service_id: z.string().uuid("Must be a valid UUID"),
  is_active: z.boolean(),
});

type SymptomFormData = z.infer<typeof symptomSchema>;

// interface AddSymptomModalProps {
//   open:boolean;
//   id: string;
//   name: string;
//}

interface AddSymptomModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  // onSubmit: (data: {
  //   tenant_service_id: string;
  //   display: string;
  //   is_active: boolean;
  // }) => void;
  //  services: Service[]; // Pass services array here
}

export default function AddSymptomModal({
  open,
  onClose,
  onSubmit,
}: AddSymptomModalProps) {
  const dispatch = useAppDispatch();
  const { items: services, loading } = useAppSelector(
    (state) => state.services
  );

  const {
    register,
    // handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SymptomFormData>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      display: "",
      tenant_service_id: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchServices());
    }
  }, [open, dispatch]);
  // const [tenantServiceId, setTenantServiceId] = useState("");
  // const [display, setDisplay] = useState("");
  // const [isActive, setIsActive] = useState(true);

  // useEffect(() => {
  //   if (services.length > 0) {
  //     setTenantServiceId(services[0].id); // default to first service
  //   }
  // }, [services]);

  const handleSubmit = (formData: SymptomFormData) => {
    const payload = {
      tenant_service_id: formData.tenant_service_id,
      code: "",
      system: "ICD-1",
      display: formData.display,
      description: `${formData.display} description`,
      is_active: formData.is_active,
    };
    onSubmit(payload);
    onClose();
    // if (!tenantServiceId || !display) {
    //   alert("Please fill all required fields");
    //   return;
    // }
    // onSubmit({
    //   tenant_service_id: tenantServiceId,
    //   display,
    //   is_active: isActive,
    // });
    // setTenantServiceId(services.length > 0 ? services[0].id : "");
    // setDisplay("");
    // setIsActive(true);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <VisuallyHidden>
          <DialogTitle>Add Symptoms</DialogTitle>
        </VisuallyHidden>
        <form
          // onSubmit={handleSubmit(() => {})}
          className="space-y-4"
        >
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
              Symptoms Name
            </label>
            <Input {...register("display")} placeholder="e.g. Cardiology" />
            {errors.display && (
              <p className="text-red-500 text-sm">{errors.display.message}</p>
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
