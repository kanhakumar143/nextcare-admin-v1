"use client";

import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // ✅ use shadcn label
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendPatientNotifications } from "@/services/admin.api"; // ✅ make sure this path is correct
import { Mail, MessageCircle, MessageCircleCode, Share } from "lucide-react";

interface SendNotificationProps {
  triggerText?: string;
  onSend?: (data: {
    title: string;
    message: string;
    notificationTypes: string[];
    template?: string;
  }) => void;
  icon?: ReactNode;
  patientIds?: string[]; // ✅ all patient IDs to send to
}

// WhatsApp message templates
const whatsappTemplates = [
  {
    id: "doctor-unavailable",
    name: "Doctor Unavailable",
    title: "Doctor Unavailable - Appointment Update",
    message:
      "Dear Patient, your scheduled doctor is unavailable due to some reason. You can reschedule your appointment or apply for a refund. Please contact our support team for assistance.",
  },
  {
    id: "appointment-due",
    name: "Appointment Due",
    title: "Appointment Reminder",
    message:
      "Dear Patient, this is a reminder that your scheduled appointment is due. Please arrive on time for your consultation. Thank you.",
  },
  {
    id: "others",
    name: "Others (Custom Message)",
    title: "",
    message: "",
  },
];

const SendNotification: React.FC<SendNotificationProps> = ({
  triggerText = "Send Notification",
  onSend,
  icon,
  patientIds = [],
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationTypes, setNotificationTypes] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showCustomFields, setShowCustomFields] = useState(false);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = whatsappTemplates.find((t) => t.id === templateId);

    if (template) {
      if (template.id === "others") {
        setShowCustomFields(true);
        setTitle("");
        setMessage("");
      } else {
        setShowCustomFields(false);
        setTitle(template.title);
        setMessage(template.message);
      }
    }
  };

  // Handle notification type change (multi-select)
  const handleNotificationTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setNotificationTypes((prev) => [...prev, type]);
    } else {
      setNotificationTypes((prev) => prev.filter((t) => t !== type));
      // If WhatsApp is unchecked, reset template and fields
      if (type === "whatsapp") {
        setSelectedTemplate("");
        setShowCustomFields(false);
        setTitle("");
        setMessage("");
      }
    }
  };

  const handleSend = async () => {
    if (!patientIds || patientIds.length === 0) {
      setError("No patients selected for notification");
      return;
    }

    if (notificationTypes.length === 0) {
      setError("Please select at least one notification type");
      return;
    }

    // Only require title and message for WhatsApp with "others" template
    const isWhatsAppOthers =
      notificationTypes.includes("whatsapp") && selectedTemplate === "others";
    if (isWhatsAppOthers && (!title.trim() || !message.trim())) {
      setError("Title and message are required for custom WhatsApp messages");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notifications = patientIds.flatMap((id) =>
        notificationTypes.map((type) => ({
          patient_id: id,
          title:
            type === "whatsapp" && selectedTemplate !== "others"
              ? whatsappTemplates.find((t) => t.id === selectedTemplate)
                  ?.title || ""
              : title,
          body:
            type === "whatsapp" && selectedTemplate !== "others"
              ? whatsappTemplates.find((t) => t.id === selectedTemplate)
                  ?.message || ""
              : message,
          type: type,
          template:
            type === "whatsapp" ? selectedTemplate || undefined : undefined,
        }))
      );

      await sendPatientNotifications(notifications);

      if (onSend)
        onSend({
          title,
          message,
          notificationTypes,
          template: selectedTemplate || undefined,
        });

      setTitle("");
      setMessage("");
      setNotificationTypes([]);
      setSelectedTemplate("");
      setShowCustomFields(false);
      setOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setMessage("");
    setNotificationTypes([]);
    setSelectedTemplate("");
    setShowCustomFields(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 border border-black shadow-sm"
        >
          {icon ? <span>{icon}</span> : <span>📧</span>}
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg bg-white border-2 border-gray-200 shadow-2xl">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div> */}
            Send Notification
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Choose notification channels and customize your message
          </p>
        </div>

        <div className="space-y-6">
          {/* Notification Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-lg font-semibold text-gray-900">
                Select Notification Channels
              </Label>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-white transition-colors border border-transparent hover:border-gray-200">
                  <Checkbox
                    id="email"
                    checked={notificationTypes.includes("email")}
                    onCheckedChange={(checked) =>
                      handleNotificationTypeChange("email", !!checked)
                    }
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                  <div className="flex items-center gap-2">
                    {/* <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"> */}
                    <Mail className="h-8 w-8 p-2 bg-gray-200 rounded-full" />
                    {/* </div> */}
                    <Label
                      htmlFor="email"
                      className="cursor-pointer font-medium text-gray-900"
                    >
                      Email
                    </Label>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-white transition-colors border border-transparent hover:border-gray-200">
                  <Checkbox
                    id="sms"
                    checked={notificationTypes.includes("sms")}
                    onCheckedChange={(checked) =>
                      handleNotificationTypeChange("sms", !!checked)
                    }
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-8 w-8 p-2 bg-gray-200 rounded-full" />
                    <Label
                      htmlFor="sms"
                      className="cursor-pointer font-medium text-gray-900"
                    >
                      SMS
                    </Label>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-white transition-colors border border-transparent hover:border-gray-200">
                  <Checkbox
                    id="whatsapp"
                    checked={notificationTypes.includes("whatsapp")}
                    onCheckedChange={(checked) =>
                      handleNotificationTypeChange("whatsapp", !!checked)
                    }
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                  <div className="flex items-center gap-2">
                    <MessageCircleCode className="h-8 w-8 p-2 bg-gray-200 rounded-full" />
                    <Label
                      htmlFor="whatsapp"
                      className="cursor-pointer font-medium text-gray-900"
                    >
                      WhatsApp
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Template Selection */}
          {notificationTypes.includes("whatsapp") && (
            <div className="space-y-4 animate-in fade-in-0 duration-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <Label className="text-lg font-semibold text-gray-900">
                  Choose WhatsApp Template
                </Label>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger className="bg-white border-gray-300 focus:border-black focus:ring-black w-full">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {whatsappTemplates.map((template) => (
                      <SelectItem
                        key={template.id}
                        value={template.id}
                        className="hover:bg-gray-100 focus:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Template Preview */}
                {selectedTemplate && selectedTemplate !== "others" && (
                  <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      TEMPLATE PREVIEW
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">
                        {
                          whatsappTemplates.find(
                            (t) => t.id === selectedTemplate
                          )?.title
                        }
                      </div>
                      <div className="text-sm text-gray-700">
                        {
                          whatsappTemplates.find(
                            (t) => t.id === selectedTemplate
                          )?.message
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title and Message Fields - Only for WhatsApp "Others" template */}
          {notificationTypes.includes("whatsapp") &&
            selectedTemplate === "others" && (
              <div className="space-y-4 animate-in fade-in-0 duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <Label className="text-lg font-semibold text-gray-900">
                    Customize Your Message
                  </Label>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700"
                    >
                      Message Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter notification title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-sm font-medium text-gray-700"
                    >
                      Message Content
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Enter notification message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="bg-white border-gray-300 focus:border-black focus:ring-black resize-none"
                    />
                    <div className="text-xs text-gray-500">
                      {message.length}/500 characters
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in-0 duration-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="text-sm text-red-700 font-medium">{error}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {notificationTypes.length > 0 && (
                <span>
                  Sending via:{" "}
                  {notificationTypes
                    .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
                    .join(", ")}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={loading || notificationTypes.length === 0}
                className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 min-w-[100px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Send</span>
                    <Share />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotification;
