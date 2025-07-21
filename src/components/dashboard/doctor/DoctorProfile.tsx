"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DoctorProfile() {
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Profile Header */}
      <div>
        <Button
          variant={"ghost"}
          onClick={() => router.push("/dashboard/doctor")}
        >
          <ArrowLeft />
          back
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Doctor Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <Image
              src="/doctor-avatar.webp"
              alt="Doctor Avatar"
              width={170}
              height={120}
              className="rounded-full border"
            />
          </div>

          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2 w-full">
            <div>
              <Label>Full Name</Label>
              <Input
                value="Dr. Jane Smith"
                readOnly={!editMode}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Specialization</Label>
              <Input
                value="Cardiologist"
                readOnly={!editMode}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Gender</Label>
              <Input value="Female" readOnly={!editMode} className="mt-1" />
            </div>

            <div>
              <Label>Age</Label>
              <Input value="42" readOnly={!editMode} className="mt-1" />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value="jane.smith@healthcare.com"
                readOnly={!editMode}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                value="+91 98765 43210"
                readOnly={!editMode}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Professional Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Medical Registration Number</Label>
            <Input value="MH20201234" readOnly={!editMode} className="mt-1" />
          </div>

          <div>
            <Label>Years of Experience</Label>
            <Input value="12 Years" readOnly={!editMode} className="mt-1" />
          </div>

          <div className="md:col-span-2">
            <Label>Clinic Address</Label>
            <Textarea
              value="123 Heartbeat Avenue, Medical City, India"
              readOnly={!editMode}
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Availability</Label>
            <Input
              value="Mon - Fri | 10 AM - 4 PM"
              readOnly={!editMode}
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Languages Spoken</Label>
            <Input
              value="English, Hindi, Marathi"
              readOnly={!editMode}
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Education & Certifications</Label>
            <Textarea
              value="MBBS, MD (Cardiology), Fellowship in Interventional Cardiology"
              readOnly={!editMode}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value="Dr. Jane Smith is a board-certified cardiologist with over 12 years of experience in treating heart-related conditions. She specializes in managing cardiac disorders with a holistic and patient-centered approach."
            readOnly={!editMode}
            className="text-sm text-muted-foreground"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {editMode ? (
          <>
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button onClick={() => setEditMode(false)}>Save</Button>
          </>
        ) : (
          <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
        )}
      </div>
    </div>
  );
}
