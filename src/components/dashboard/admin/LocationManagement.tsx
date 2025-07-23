"use client";

import { useEffect, useState } from "react";
import { getLocations, addLocation } from "@/services/admin.api";
import { CreateLocationPayload, Location } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Clock, MapPin, Phone, Building, AlertCircle, Trash2, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const ORGANIZATION_ID = "97c2fffa-9e2b-4e29-90af-a5a53190013d";

// Form schema with Zod validation
const formSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  description: z.string().min(1, "Description is required"),
  addressText: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required").regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone format"),
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
  daysOfWeek: z.array(z.string()).min(1, "Select at least one day of operation"),
  openingTime: z.string(),
  closingTime: z.string(),
}).refine((data) => {
  if (data.openingTime && data.closingTime) {
    return data.openingTime < data.closingTime;
  }
  return true;
}, {
  message: "Closing time must be after opening time",
  path: ["closingTime"],
});

// Enhanced Form Component using shadcn/ui
const EnhancedLocationForm = ({ onSubmit, onCancel }) => {
  const [alias, setAlias] = useState([]);
  const [newAlias, setNewAlias] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
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
      closingTime: "20:00"
    },
  });

  const daysOfWeekOptions = [
    { value: "mon", label: "Monday" },
    { value: "tue", label: "Tuesday" },
    { value: "wed", label: "Wednesday" },
    { value: "thu", label: "Thursday" },
    { value: "fri", label: "Friday" },
    { value: "sat", label: "Saturday" },
    { value: "sun", label: "Sunday" }
  ];

  const handleAddAlias = () => {
    if (newAlias.trim() && !alias.includes(newAlias.trim())) {
      setAlias(prev => [...prev, newAlias.trim()]);
      setNewAlias("");
    }
  };

  const handleRemoveAlias = (index) => {
    setAlias(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
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

      await onSubmit(payload);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              {/* <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Basic Information
              </CardTitle> */}
            </CardHeader>
            <CardContent className="space-y-4">
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
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
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      <FormLabel>Latitude</FormLabel>
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
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="85.8245" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aliases */}
          <Card>
            <CardHeader>
              <CardTitle>Aliases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add alias (e.g., Main, HQ)"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAlias())}
                />
                <Button onClick={handleAddAlias} variant="outline" size="sm" type="button">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {alias.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="daysOfWeek"
                render={() => (
                  <FormItem>
                    <FormLabel>Days of Operation <span className="text-red-500">*</span></FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {daysOfWeekOptions.map((day) => (
                        <FormField
                          key={day.value}
                          control={form.control}
                          name="daysOfWeek"
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
                                        ? field.onChange([...field.value, day.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== day.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {day.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
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
                      <FormLabel>Closing Time</FormLabel>
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
                name="characteristic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Characteristics</FormLabel>
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
            </CardContent>
          </Card>

          <Separator />

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

// Main Location Management Component
export default function LocationManagement() {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  };

  const handleAddLocation = async (payload: CreateLocationPayload) => {
    try {
      const res = await addLocation(payload);
      console.log("Location added:", res);
      await fetchLocations();
      setOpen(false);
    } catch (error) {
      console.error("Failed to add location:", error);
      throw error;
    }
  };

  const columns: ColumnDef<Location>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "address.text",
      header: "Address",
      cell: ({ row }) => row.original.address?.text ?? "-",
    },
    {
      accessorKey: "contact[0].telecom[0].value",
      header: "Phone",
      cell: ({ row }) => row.original.contact?.[0]?.telecom?.[0]?.value ?? "-",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <EnhancedLocationForm
              onSubmit={handleAddLocation}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={locations}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}