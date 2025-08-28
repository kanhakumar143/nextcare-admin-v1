"use client";

import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // ✅ use shadcn label
import { sendPatientNotifications } from "@/services/admin.api"; // ✅ make sure this path is correct

interface SendNotificationProps {
  triggerText?: string;
  onSend?: (data: { title: string; message: string }) => void;
  icon?: ReactNode;
  patientIds?: string[]; // ✅ all patient IDs to send to
}

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

  const handleSend = async () => {
    if (!patientIds || patientIds.length === 0) {
      setError("No patients selected for notification");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notifications = patientIds.map((id) => ({
        patient_id: id,
        title,
        body: message,
      }));

      await sendPatientNotifications(notifications);

      if (onSend) onSend({ title, message });

      setTitle("");
      setMessage("");
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
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} className="flex items-center">
          {icon ? <span className="mr-2">{icon}</span> : null}
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <h2 className="text-lg font-bold mb-4">Send Notification</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

        <div className="mt-4 flex justify-end space-x-2 cursor-pointer">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotification;
