"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Building, Phone, MapPin, Clock } from "lucide-react";
import { CreateLocationPayload } from "@/types/admin.types";
import { addLocation, getLocations } from "@/services/admin.api";

// Constants
const ORGANIZATION_ID = "97c2fffa-9e2b-4e29-90af-a5a53190013d";

// Enhanced form schema with comprehensive validation
const formSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  description: z.string().min(1, "Description is required"),
  addressText: z.string().min(1, "Address is required"),
  phone: z.string()
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
  characteristic: z.string().min(1, "Characteristic is required"),
  daysOfWeek: z
    .array(z.string())
    .min(1, "Select at least one day of operation"),
  openingTime: z.string().min(1, "Opening time is required"),
  closingTime: z.string().min(1, "Closing time is required"),
}).refine(
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

const daysOfWeekOptions = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

interface LocationFormModalProps {
  onLocationAdded?: () => void; // Callback to refresh locations list
}

export default function LocationFormModal({ onLocationAdded }: LocationFormModalProps) {
  const [open, setOpen] = useState(false);
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

  const handleAddAlias = () => {
    if (newAlias.trim() && !alias.includes(newAlias.trim())) {
      setAlias((prev) => [...prev, newAlias.trim()]);
      setNewAlias("");
    }
  };

  const handleRemoveAlias = (index: number) => {
    setAlias((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLocation = async (payload: CreateLocationPayload) => {
    try {
      const res = await addLocation(payload);
      console.log("Location added:", res);
      
      // Call the callback to refresh the locations list
      if (onLocationAdded) {
        await onLocationAdded();
      }
      
      setOpen(false);
      // Reset form and aliases
      form.reset();
      setAlias([]);
    } catch (error) {
      console.error("Failed to add location:", error);
      throw error;
    }
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const payload: CreateLocationPayload = {
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
        // Optional fields
        endpoint: null,
        virtualService: null,
        identifier: null,
        operationalStatus: null,
        partOfId: null,
        type: null,
      };

      console.log("Submitted payload:", payload);
      await handleAddLocation(payload);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    setAlias([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>

        <div className=" max-h-[70vh] p-4 overflow-y-auto ">
         <Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
    
    {/* Basic Info Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Location Name <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Main Branch" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

   

    {/* Contact Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Name <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Reception" {...field} />
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
            <FormLabel className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="1234567890" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    {/* Address */}
    <FormField
      control={form.control}
      name="addressText"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address <span className="text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <Input placeholder="123 Main Street" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="latitude"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Latitude <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input type="number" step="any" placeholder="20.2961" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="longitude"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Longitude <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input type="number" step="any" placeholder="85.8245" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    {/* Aliases */}
    <div className="flex gap-4 w-full">
  {/* Aliases Input Section */}
  <div className="w-1/2">
    <FormLabel className="text-md font-semibold">Aliases</FormLabel>
    <div className="flex gap-2 mt-2">
      <Input
        placeholder="Add alias (e.g., HQ, Main)"
        value={newAlias}
        onChange={(e) => setNewAlias(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAlias())}
      />
      <Button onClick={handleAddAlias} variant="outline" size="sm" type="button">
        <Plus className="w-4 h-4" />
      </Button>
    </div>

    {alias.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {alias.map((aliasItem, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {aliasItem}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleRemoveAlias(index)}
              type="button"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
      </div>
    )}
  </div>

  {/* Characteristics Select Section */}
  <div className="w-1/2">
    <FormField
      control={form.control}
      name="characteristic"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-md font-semibold">
            Characteristics <span className="text-red-500">*</span>
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select characteristic" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="24x7">24/7 Service</SelectItem>
              <SelectItem value="business-hours">Business Hours Only</SelectItem>
              <SelectItem value="emergency">Emergency Only</SelectItem>
              <SelectItem value="appointment">By Appointment</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
</div>



    {/* Operating Hours */}
    <div>
      <FormLabel className="text-md font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Operating Hours
      </FormLabel>

      <FormField
        control={form.control}
        name="daysOfWeek"
        render={() => (
          <FormItem className="mt-3">
            <FormLabel>Days of Operation <span className="text-red-500">*</span></FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {daysOfWeekOptions.map((day) => (
                <FormField
                  key={day.value}
                  control={form.control}
                  name="daysOfWeek"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(day.value)}
                          onCheckedChange={(checked) =>
                            checked
                              ? field.onChange([...field.value, day.value])
                              : field.onChange(field.value?.filter((v) => v !== day.value))
                          }
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {day.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <FormField
          control={form.control}
          name="openingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opening Time <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="closingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Closing Time <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField 
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description <span className="text-red-500 mt-4">*</span></FormLabel>
          <FormControl>
            <Textarea
              placeholder="Head office of the organization"
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
      
    </div>

   

    {/* Actions */}
    <div className="flex gap-3 pt-4">
      <Button type="submit" disabled={isSubmitting} className="flex-1">
        {isSubmitting ? "Saving..." : "Save Location"}
      </Button>
      <Button variant="outline" onClick={handleCancel} type="button">
        Cancel
      </Button>
    </div>
  </form>
</Form>

        </div>
      </DialogContent>
    </Dialog>
  );
}