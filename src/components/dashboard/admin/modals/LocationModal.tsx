import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Clock,
  MapPin,
  Phone,
  Building,
  AlertCircle,
  Trash2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { addLocation } from "@/services/admin.api";
import { getLocations } from "@/services/admin.api";
import { CreateLocationPayload, Location } from "@/types/admin.types";


  const [open, setOpen] = useState(false);



// ---- Constants ----
const ORGANIZATION_ID = "97c2fffa-9e2b-4e29-90af-a5a53190013d";

// ---- Form Schema ----
const formSchema = z
  .object({
    name: z.string().min(1, "Location name is required"),
    description: z.string().min(1, "Description is required"),
    addressText: z.string().min(1, "Address is required"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone format"),
    contactName: z.string().min(1, "Contact name is required"),
    latitude: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    }, "Latitude must be between -90 and 90"),
    longitude: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    }, "Longitude must be between -180 and 180"),
    status: z.enum(["active", "inactive", "suspended"]),
    characteristic: z.string(),
    daysOfWeek: z
      .array(z.string())
      .min(1, "Select at least one day of operation"),
    openingTime: z.string(),
    closingTime: z.string(),
  })
  .refine(
    (data) => {
      if (data.openingTime && data.closingTime) {
        return data.openingTime < data.closingTime;
      }
      return true;
    },
    {
      message: "Closing time must be after opening time",
      path: ["closingTime"],
    }
  );

// ---- Payload Type ----
type LocationPayload = {
  organizationId: string;
  name: string;
  description: string;
  address: { text: string };
  position: { latitude: number; longitude: number };
  alias: string[];
  status: "active" | "inactive" | "suspended";
  contact: {
    name: { text: string };
    telecom: { system: string; value: string }[];
  }[];
  form: { coding: { system: string; code: string }[] };
  characteristic: { coding: { code: string }[] }[];
  hoursOfOperation: {
    daysOfWeek: string[];
    openingTime: string;
    closingTime: string;
  }[];
};

// ---- Props Type ----
type EnhancedLocationFormProps = {
  onSubmit: (data: LocationPayload) => Promise<void>;
  onCancel: () => void;
};

// ---- Component ----
const EnhancedLocationForm: React.FC<EnhancedLocationFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [alias, setAlias] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      addressText: "",
      phone: "",
      contactName: "Reception",
      latitude: "20.2961",
      longitude: "85.8245",
      status: "active",
      characteristic: "24x7",
      daysOfWeek: ["mon", "tue"],
      openingTime: "08:00",
      closingTime: "20:00",
    },
  });

  const daysOfWeekOptions = [
    { value: "mon", label: "Monday" },
    { value: "tue", label: "Tuesday" },
    { value: "wed", label: "Wednesday" },
    { value: "thu", label: "Thursday" },
    { value: "fri", label: "Friday" },
    { value: "sat", label: "Saturday" },
    { value: "sun", label: "Sunday" },
  ];

  const handleAddAlias = () => {
    if (newAlias.trim() && !alias.includes(newAlias.trim())) {
      setAlias((prev) => [...prev, newAlias.trim()]);
      setNewAlias("");
    }
  };
   const handleAddLocation = async (payload: CreateLocationPayload) => {
      try {
        const res = await addLocation(payload);
        console.log("Location added:", res);
        await getLocations();
        setOpen(false);
      } catch (error) {
        console.error("Failed to add location:", error);
        throw error;
      }
    };
  const handleRemoveAlias = (index: number) => {
    setAlias((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log(data);
    try {
      const payload: LocationPayload = {
        organizationId: ORGANIZATION_ID,
        name: data.name,
        description: data.description,
        address: {
          text: data.addressText,
        },
        position: {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        },
        alias: alias.length > 0 ? alias : ["Main", "HQ"],
        status: data.status,
        contact: [
          {
            name: { text: data.contactName },
            telecom: [
              {
                system: "phone",
                value: data.phone,
              },
            ],
          },
        ],
        form: {
          coding: [
            {
              system: "form-code",
              code: "building",
            },
          ],
        },
        characteristic: [
          {
            coding: [
              {
                code: data.characteristic,
              },
            ],
          },
        ],
        hoursOfOperation: [
          {
            daysOfWeek: data.daysOfWeek,
            openingTime: data.openingTime,
            closingTime: data.closingTime,
          },
        ],
      };

    //   await onSubmit(payload);
    handleAddLocation(payload);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
         

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : "Save Location"}
            </Button>
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EnhancedLocationForm;
