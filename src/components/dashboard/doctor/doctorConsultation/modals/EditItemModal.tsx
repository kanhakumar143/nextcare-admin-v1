"use client";

import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Clock, Save, X } from "lucide-react";
import { LabTest, Medication } from "@/types/doctor.types";

// Options for various selects
const frequencyOptions = [
    { value: "once-daily", label: "Once Daily" },
    { value: "twice-daily", label: "Twice Daily" },
    { value: "three-times-daily", label: "Three Times Daily" },
    { value: "four-times-daily", label: "Four Times Daily" },
    { value: "hourly", label: "Hourly" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
];

const intentOptions = [
    { value: "proposal", label: "Proposal" },
    { value: "plan", label: "Plan" },
    { value: "order", label: "Order" },
    { value: "original-order", label: "Original Order" },
    { value: "reflex-order", label: "Reflex Order" },
    { value: "filler-order", label: "Filler Order" },
    { value: "instance-order", label: "Instance Order" },
    { value: "option", label: "Option" },
];

const priorityOptions = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "asap", label: "ASAP" },
    { value: "stat", label: "STAT" },
];

const medicationFormOptions = [
    { value: "tablet", label: "Tablet" },
    { value: "capsule", label: "Capsule" },
    { value: "solution", label: "Solution" },
    { value: "injection", label: "Injection" },
    { value: "ointment", label: "Ointment" },
    { value: "powder", label: "Powder" },
    { value: "patch", label: "Patch" },
    { value: "spray", label: "Spray" },
    { value: "syrup", label: "Syrup" },
];

const medicationRouteOptions = [
    { value: "oral", label: "Oral" },
    { value: "intravenous", label: "Intravenous" },
    { value: "intramuscular", label: "Intramuscular" },
    { value: "subcutaneous", label: "Subcutaneous" },
    { value: "topical", label: "Topical" },
    { value: "nasal", label: "Nasal" },
    { value: "rectal", label: "Rectal" },
    { value: "ophthalmic", label: "Ophthalmic" },
    { value: "inhalation", label: "Inhalation" },
    { value: "transdermal", label: "Transdermal" },
];

const timingOptions = [
    { key: "morning", label: "Morning" },
    { key: "afternoon", label: "Afternoon" },
    { key: "evening", label: "Evening" },
    { key: "night", label: "Night" },
];

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: LabTest | Medication;
    itemType: "labtest" | "medicine";
    onSave: (updatedItem: LabTest | Medication) => void;
    isNewItem?: boolean;
}

// Timing Multi-Select Component
function TimingMultiSelect({
    value,
    onChange,
}: {
    value: any;
    onChange: (timing: any) => void;
}) {
    const getSelectedTimings = () => {
        if (!value || typeof value !== "object") {
            return [];
        }
        return timingOptions.filter((option) => value[option.key] === true);
    };

    const toggleTiming = (timingKey: string) => {
        const currentTiming = value || {
            morning: false,
            afternoon: false,
            evening: false,
            night: false,
        };

        const newTiming = {
            ...currentTiming,
            [timingKey]: !currentTiming[timingKey],
        };

        onChange(newTiming);
    };

    const selectedTimings = getSelectedTimings();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-1 overflow-hidden">
                        {selectedTimings.length === 0 ? (
                            <span className="text-muted-foreground">Select timing</span>
                        ) : selectedTimings.length === 1 ? (
                            <Badge variant="secondary" className="text-xs">
                                {selectedTimings[0].label}
                            </Badge>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                    {selectedTimings[0].label}
                                </Badge>
                                <span className="text-muted-foreground text-sm">
                                    +{selectedTimings.length - 1} more
                                </span>
                            </div>
                        )}
                    </div>
                    <Clock className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                {timingOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                        key={option.key}
                        checked={value?.[option.key] || false}
                        onCheckedChange={() => toggleTiming(option.key)}
                    >
                        {option.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function EditItemModal({
    isOpen,
    onClose,
    item,
    itemType,
    onSave,
    isNewItem = false,
}: EditItemModalProps) {
    const [formData, setFormData] = useState<LabTest | Medication>(item);

    useEffect(() => {
        setFormData(item);
    }, [item]);

    const handleFieldChange = (key: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const isLabTest = itemType === "labtest";
    const title = isNewItem
        ? (isLabTest ? "Add New Lab Test" : "Add New Medicine")
        : (isLabTest ? "Edit Lab Test" : "Edit Medicine");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {isLabTest ? (
                        // Lab Test Fields
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="test_display">Test Name</Label>
                                <Input
                                    id="test_display"
                                    value={(formData as LabTest).test_display || ""}
                                    onChange={(e) => handleFieldChange("test_display", e.target.value)}
                                    placeholder="Test Name"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="intent">Intent</Label>
                                <Select
                                    value={(formData as LabTest).intent || ""}
                                    onValueChange={(value) => handleFieldChange("intent", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select intent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {intentOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={(formData as LabTest).priority || ""}
                                    onValueChange={(value) => handleFieldChange("priority", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={(formData as LabTest).notes || ""}
                                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                                    placeholder="Additional notes"
                                    className="w-full"
                                />
                            </div> */}
                        </>
                    ) : (
                        // Medicine Fields
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">Medicine Name</Label>
                                <Input
                                    id="name"
                                    value={(formData as Medication).name || ""}
                                    onChange={(e) => handleFieldChange("name", e.target.value)}
                                    placeholder="Medicine Name"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="strength">Strength</Label>
                                <Input
                                    id="strength"
                                    value={(formData as Medication).strength || ""}
                                    onChange={(e) => handleFieldChange("strength", e.target.value)}
                                    placeholder="e.g., 500mg"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="form">Form</Label>
                                <Select
                                    value={(formData as Medication).form || ""}
                                    onValueChange={(value) => handleFieldChange("form", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select form" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medicationFormOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="route">Route</Label>
                                <Select
                                    value={(formData as Medication).route || ""}
                                    onValueChange={(value) => handleFieldChange("route", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select route" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medicationRouteOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select
                                    value={(formData as Medication).frequency || ""}
                                    onValueChange={(value) => handleFieldChange("frequency", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {frequencyOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timing">Timing</Label>
                                <TimingMultiSelect
                                    value={(formData as Medication).timing}
                                    onChange={(timing) => handleFieldChange("timing", timing)}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    id="duration"
                                    value={(formData as Medication).duration || ""}
                                    onChange={(e) => handleFieldChange("duration", e.target.value)}
                                    placeholder="e.g., 7 days, 2 weeks"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="dosage_instruction">Dosage Instructions</Label>
                                <Input
                                    id="dosage_instruction"
                                    value={(formData as Medication).dosage_instruction || ""}
                                    onChange={(e) => handleFieldChange("dosage_instruction", e.target.value)}
                                    placeholder="Additional dosage instructions"
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        {isNewItem ? "Add Item" : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}