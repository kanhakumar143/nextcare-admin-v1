"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RootState } from "@/store";
import moment from "moment";
import { createAvailabilityTemplate } from "@/services/availabilityTemplate.api";

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SaveTemplateModal({
  open,
  onOpenChange,
}: SaveTemplateModalProps) {
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formData = useSelector(
    (state: RootState) => state.availabilityTemplate.formData
  );

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (!remark.trim()) {
      toast.error("Remark is required");
      return;
    }

    if (!formData) {
      toast.error("No form data available");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format dates
      const formatDate = (date: Date) => moment(date).format("YYYY-MM-DD");
      const formatTime = (time: string) => `${time}:00`;

      // Use working days from form data
      const workingDays = formData.workingDays;

      // Format holidays and leaves
      const holidays = formData.clinicUnavailableDates.map((date) =>
        formatDate(date)
      );
      const leaves = formData.doctorLeaveDates.map((date) => formatDate(date));

      // Calculate duration from interval
      const actualInterval =
        formData.intervalType === "preset"
          ? formData.selectedInterval
          : formData.customInterval;

      // Create API payload
      const apiPayload = {
        name: name.trim(),
        start_date: formatDate(formData.startDate),
        end_date: formatDate(formData.endDate),
        start_time: formatTime(formData.timeSlot.start),
        end_time: formatTime(formData.timeSlot.end),
        duration: actualInterval,
        recurring: formData.recurring,
        holidays: holidays,
        leaves: leaves,
        working_days: workingDays,
        service_specialty_id: "1af84141-0373-4c2b-9722-2da73af0a686", // You might want to make this dynamic
        is_active: true,
        remark: remark.trim(),
      };

      console.log("API Payload:", apiPayload);

      // Make the actual API call
      await createAvailabilityTemplate(apiPayload);

      toast.success("Template saved successfully!");
      handleClose();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setRemark("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Save as Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="templateName" className="text-sm font-medium">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="templateName"
              placeholder="Enter template name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateRemark" className="text-sm font-medium">
              Remark <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="templateRemark"
              placeholder="Enter a description or note about this template"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full min-h-[80px]"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-black text-white hover:bg-gray-800"
          >
            {isSubmitting ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
