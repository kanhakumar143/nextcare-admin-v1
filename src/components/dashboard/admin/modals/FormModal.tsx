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
import { Plus, X } from "lucide-react";
import { CreateLocationPayload } from "@/types/admin.types";
import { addLocation, getLocations } from "@/services/admin.api";

// const formSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   description: z.string().min(1, "Description is required"),
//   address: z.string().min(1, "Address is required"),
//   phone: z.string().min(1, "Phone is required"),
//   contactName: z.string().min(1, "Contact name is required"),
//   latitude: z.string(),
//   longitude: z.string(),
//   status: z.enum(["active", "inactive", "suspended"]),
//   characteristic: z.string(),
//   daysOfWeek: z.array(z.string()).min(1, "At least one day must be selected"),
//   openingTime: z.string(),
//   closingTime: z.string(),
//   // system: z.string(),
//   value: z.string(),
 
//   alias: z.array(z.string()),
//   // formCode: z.string(),
//   // formSystem: z.string(),
//   // mode: z.enum(["create", "update"]),
// });

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive", "suspended"]),
  contactName: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  characteristic: z.string().min(1, "Characteristic is required"),
  alias: z.array(z.string()).optional(), // alias is handled separately in state
  daysOfWeek: z.array(z.string()).min(1, "At least one day must be selected"),
  openingTime: z.string().min(1, "Opening time is required"),
  closingTime: z.string().min(1, "Closing time is required"),
  description: z.string().min(1, "Description is required"),
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

export default function LocationFormModal() {
  const [open, setOpen] = useState(false);
  const [alias, setAlias] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      
      address: "",
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

  const handleAliasAdd = () => {
    if (newAlias.trim() && !alias.includes(newAlias.trim())) {
      setAlias((prev) => [...prev, newAlias.trim()]);
      setNewAlias("");
    }
  };

  const handleAliasRemove = (index: number) => {
    setAlias((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
    const payload = {
        name: data.name,
        description: data.description,
       

        position: {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        },

        address: {
          text: data.address,
        },

        alias: alias.length ? alias : ["Main", "HQ"],

        status: data.status,
        // mode: "",

        form: {
          coding: [
            {
              code: "",
              system: "",
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

        contact: [
          {
            name: {
              text: data.contactName,
            },
            telecom: [
              {
                value: data.phone,
                system: "",
              },
            ],
          },
        ],

        endpoint: null,
        virtualService: null,
        identifier: null,
        operationalStatus: null,
        partOfId: null,
        type: null,
      };

      console.log("Submitted payload:", payload);
      await handleAddLocation(payload);
      form.reset();
      setAlias([]);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Location</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Location</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="contactName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="latitude" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="longitude" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="characteristic" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Characteristic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="24x7">24/7</SelectItem>
                      <SelectItem value="business-hours">Business Hours</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormItem>
                <FormLabel>Alias</FormLabel>
                <div className="flex gap-2">
                  <Input value={newAlias} onChange={(e) => setNewAlias(e.target.value)} />
                  <Button onClick={handleAliasAdd} type="button"><Plus className="w-4 h-4" /></Button>
                </div>
                {alias.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {alias.map((a, i) => (
                      <Badge key={i} className="flex items-center gap-1">
                        {a}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleAliasRemove(i)}
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </FormItem>
              
            </div>

            <FormField name="daysOfWeek" control={form.control} render={() => (
              <FormItem>
                <FormLabel>Days of Week</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {daysOfWeekOptions.map((day) => (
                    <FormField key={day.value} name="daysOfWeek" control={form.control} render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(day.value)}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange([...field.value, day.value]);
                              else field.onChange(field.value.filter((v) => v !== day.value));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{day.label}</FormLabel>
                      </FormItem>
                    )} />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="openingTime" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="closingTime" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Location"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
