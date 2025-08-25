"use client";

import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BellPlus } from "lucide-react";

interface SendNotificationProps {
  triggerText?: string; // text for the button
  onSend?: (data: { title: string; message: string }) => void; // callback when sending
  icon?: ReactNode; // optional icon
}

const SendNotification: React.FC<SendNotificationProps> = ({
  triggerText = "Send Notification",
  onSend,
  icon,
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    if (onSend) onSend({ title, message });
    setTitle("");
    setMessage("");
    setOpen(false);
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
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="mt-4 flex justify-end space-x-2 cursor-pointer">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotification;
